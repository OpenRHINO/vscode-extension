// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import rhinoCreate from './cmd/create';
import rhinoBuild from './cmd/build';
import rhinoRun from './cmd/run';
import { JobTreeItem, RhinoJobsProvider, refreshRhinoJobList, deleteRhinoJob } from './rhinojob-provider';

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
		vscode.commands.registerCommand('rhino.jobs.refresh', () => refreshRhinoJobList(rhinoJobsProvider)),
		vscode.commands.registerCommand('rhino.jobs.delete', (jobItem: JobTreeItem) => {
			deleteRhinoJob(rhinoJobsProvider, jobItem.job?.name)
		})
		)

	refreshRhinoJobList(rhinoJobsProvider)
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
