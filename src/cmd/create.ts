import * as vscode from 'vscode';
import { execSync } from 'child_process';

async function rhinoCreate() {
  const templateUri = await vscode.window.showOpenDialog({
    canSelectFiles: false,
    canSelectFolders: true,
    canSelectMany: false,
    openLabel: 'Select folder where you want to create the template at'
  })

  if (!templateUri || templateUri.length == 0) {
    return
  }
  const templateFolderPath = templateUri[0].fsPath

  const templateFolderName = await vscode.window.showInputBox({
    prompt: 'Enter the name of template folder'
  })
  if (!templateFolderName) {
    return
  }

  try {
    execSync(`rhino create ${templateFolderName}`, {cwd: templateFolderPath})
    vscode.window.showInformationMessage(`Rhino:Create ${templateFolderName} SUCCESS!`)
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
  }
}

export default rhinoCreate
