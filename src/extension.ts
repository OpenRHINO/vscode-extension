// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import rhinoCreate from './cmd/create';
import rhinoBuild from './cmd/build';
import rhinoRun from './cmd/run';
import { execSync } from 'child_process';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const rhinoJobsProvider = new RhinoJobsProvider()
	vscode.window.registerTreeDataProvider('rhino.jobs', rhinoJobsProvider)
	vscode.window.registerTreeDataProvider('rhino.gpt', new RhinoGPTProvider())

	const outputChannel = vscode.window.createOutputChannel('Rhino Build');
	context.subscriptions.push(
		vscode.commands.registerCommand('rhino.create', rhinoCreate),
		vscode.commands.registerCommand('rhino.build', () => rhinoBuild(outputChannel)),
		vscode.commands.registerCommand('rhino.run', rhinoRun),
		vscode.commands.registerCommand('rhino.jobs.refresh', () => refreshRhinoJobList(rhinoJobsProvider))
	)
}

class RhinoJobsProvider implements vscode.TreeDataProvider<string> {
	private _onDidChangeTreeData: vscode.EventEmitter<string | undefined> = 
	new vscode.EventEmitter<string | undefined>()
	readonly onDidChangeTreeData: vscode.Event<string | undefined> = this._onDidChangeTreeData.event

	private jobs: string[] = []

	refreshJobs(jobs: string[]): void {
		this.jobs = jobs
		this._onDidChangeTreeData.fire(undefined)
	}

	clearJobs(): void {
		this.jobs = []
		this._onDidChangeTreeData.fire(undefined)
	}

	getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return new vscode.TreeItem(element)
	}

	getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
		return Promise.resolve(this.jobs)
	}
}

async function refreshRhinoJobList(rhinoJobsProvider: RhinoJobsProvider) {
	try {
		const rhinoListOutput = execSync('rhino list')
		const jobs = extractRhinoJobs(rhinoListOutput.toString())
		rhinoJobsProvider.refreshJobs(jobs)
	} catch (error) {
		vscode.window.showErrorMessage(`${error}`)
		rhinoJobsProvider.clearJobs()
	}
}

function extractRhinoJobs(output: string): string[] {
	const lines = output.trim().split(/\r?\n/)
	const jobs = lines.slice(1)
										.map(line => {
											const columns = line.trim().split(/\s+/)
											return columns[0]
										})
	return jobs
}

class RhinoGPTProvider implements vscode.TreeDataProvider<string> {
	getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return new vscode.TreeItem(element)
	}

	getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
		return Promise.resolve([])
	}
}

// This method is called when your extension is deactivated
export function deactivate() {}
