import { execSync, spawn } from 'child_process';
import * as vscode from 'vscode';
import * as path from 'path';
import axios, { AxiosError } from 'axios';

interface Choice {
	text: string;
}

const API_KEY = 'API_KEY'; // 替换为你的GPT API密钥
async function analyzeLog(logs: string, outputChannel: vscode.OutputChannel): Promise<string> {
	const DELAY_MS = 5000;
	const MAX_LENGTH = 2048; // 日志的最大长度
	const MAX_SEGMENTS = 16; // 最大拆分段落数

	// 检查日志总长度是否超过限制
	const totalLength = logs.length;
	const segmentCount = Math.ceil(totalLength / MAX_LENGTH);

	// 分割日志成小段
	const segments: string[] = [];
	let currentSegment = '';
	let currentLength = 0;

	// 正则表达式，用于匹配句子边界
	const sentenceRegex = /[.!?]+/g;

	// 根据句子边界分割日志
	const sentences = logs.split(sentenceRegex);

	for (const sentence of sentences) {
		const sentenceLength = sentence.length;

		// 如果当前段落加上当前句子超过最大长度限制，或者段落数已达到最大拆分段落数
		if (currentLength + sentenceLength > MAX_LENGTH || segments.length >= MAX_SEGMENTS) {
			segments.push(currentSegment.trim());
			currentSegment = '';
			currentLength = 0;
		}

		currentSegment += sentence;
		currentLength += sentenceLength;
	}

	// 处理最后一个段落
	segments.push(currentSegment.trim());

	// 使用GPT模型分析每个段落，并按顺序拼接分析结果
	const analyzedSegments: string[] = [];

	for (let i = 0; i < segments.length; i++) {
		const segment = segments[i];
		outputChannel.appendLine(`analyzing log ...${i + 1}`)
		outputChannel.show()
		const response = await axios.post(
			'https://api.openai.com/v1/engines/davinci/completions',
			{
				prompt: `please analyze the following logs and limit the result in 100 tokens:${segment} \n`,
				max_tokens: 200,
			},
			{
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${API_KEY}`,
				},
			}
		);
		const choices: Choice[] = response.data.choices;
		const choiceTexts = choices.map(choice => choice.text.trim());
		const segmentResult = choiceTexts.join('');

		analyzedSegments.push(segmentResult);
		// 等待一段时间再继续下一段落的分析
		if (i < segments.length - 1) {
			await new Promise((resolve) => setTimeout(resolve, DELAY_MS));
		}
	}

	// 拼接分析结果
	const analyzedLogs = analyzedSegments.join('');

	return analyzedLogs;
}

export default class RhinoGPTProvider implements vscode.TreeDataProvider<string> {
	getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return new vscode.TreeItem(element)
	}

	getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
		return Promise.resolve([])
	}

	analyzeLogs(jobName: string | undefined) {
		try {
			const outputChannel = vscode.window.createOutputChannel('Logs Analysis Result');
			outputChannel.appendLine('start to analyze logs');
			outputChannel.show();
			const logsOutput = execSync(`rhino logs ${jobName}`).toString();
			outputChannel.appendLine(logsOutput)
			outputChannel.show()
			analyzeLog(logsOutput, outputChannel)
				.then(
					(result) => {
						outputChannel.appendLine(result);
						outputChannel.show();
					}
				).catch(
					(error) => {
						outputChannel.appendLine(error.message);
						outputChannel.show();
					}
				);
		} catch (error) {
			vscode.window.showErrorMessage(`${error}`);
		}
	}
}