// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

import rhinoCreate from './cmd/create';
import rhinoBuild from './cmd/build';
import rhinoRun from './cmd/run';
import rhinoDelete from './cmd/delete';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Rhino Build');

	context.subscriptions.push(
		vscode.commands.registerCommand('rhino.create', rhinoCreate),
		vscode.commands.registerCommand('rhino.build', () => rhinoBuild(outputChannel)),
		vscode.commands.registerCommand('rhino.run', rhinoRun),
		vscode.commands.registerCommand('rhino.delete', rhinoDelete)
	)
}

// This method is called when your extension is deactivated
export function deactivate() {}
