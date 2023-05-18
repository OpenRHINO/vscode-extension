import * as vscode from 'vscode'

export default class RhinoGPTProvider implements vscode.TreeDataProvider<string> {
	getTreeItem(element: string): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return new vscode.TreeItem(element)
	}

	getChildren(element?: string | undefined): vscode.ProviderResult<string[]> {
		return Promise.resolve([])
	}
}