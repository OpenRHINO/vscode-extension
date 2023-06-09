// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import rhinoCreate from './cmd/create';
import rhinoBuild from './cmd/build';
import rhinoRun from './cmd/run';
import rhinoLogs from './cmd/logs';
import { JobTreeItem, RhinoJobsProvider, refreshRhinoJobList, deleteRhinoJob } from './provider/rhinojob_provider';
import RhinoGPTProvider from './provider/gpt_provider';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rhinoJobsProvider = new RhinoJobsProvider()
	const rhinoGPTProvider = new RhinoGPTProvider()
	vscode.window.registerTreeDataProvider('rhino.jobs', rhinoJobsProvider)
	vscode.window.registerTreeDataProvider('rhino.gpt', rhinoGPTProvider)

	const treeView = vscode.window.createTreeView('rhino.jobs',{
		treeDataProvider: rhinoJobsProvider
	});

	const outputChannel = vscode.window.createOutputChannel('Rhino Build');
	
	context.subscriptions.push(
		vscode.commands.registerCommand('rhino.create', rhinoCreate),
		vscode.commands.registerCommand('rhino.build', () => rhinoBuild(outputChannel)),
		vscode.commands.registerCommand('rhino.run', rhinoRun),
		vscode.commands.registerCommand('rhino.logs', (jobItem: JobTreeItem) => rhinoLogs( jobItem.job?.name)),
		vscode.commands.registerCommand('rhino.jobs.refresh', () => refreshRhinoJobList(rhinoJobsProvider)),
		vscode.commands.registerCommand('rhino.jobs.delete', (jobItem: JobTreeItem) => {
			deleteRhinoJob(rhinoJobsProvider, jobItem.job?.name)
		}),
		vscode.commands.registerCommand('rhino.gpt.analysis', () => {
			// 获取job item
			const jobItem = treeView.selection[0];
			// 分析日志
			rhinoGPTProvider.analyzeLogs(jobItem.job?.name)
		})
	)

	refreshRhinoJobList(rhinoJobsProvider)
}

// This method is called when your extension is deactivated
export function deactivate() {}
