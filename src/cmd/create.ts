import * as vscode from 'vscode';
import { execSync } from 'child_process';

async function rhinoCreate() {
  // let user select where to create template folder
  // if user press esc, just return
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

  // let user input the name of template folder
  // if user press esc, just return
  const templateFolderName = await vscode.window.showInputBox({
    prompt: 'Enter the name of template folder'
  })
  if (!templateFolderName) {
    return
  }

  // launch a subprocess to execute rhino create
  try {
    execSync(`rhino create ${templateFolderName}`, {cwd: templateFolderPath})
    vscode.window.showInformationMessage(`Rhino:Create ${templateFolderName} SUCCESS!`)
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
  }
}

export default rhinoCreate
