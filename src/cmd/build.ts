import * as vscode from 'vscode'
import { execSync } from 'child_process'
import path = require('path')

async function rhinoBuild() {
  // get workspaceFolder path
  const workspaceFolder = vscode.workspace.workspaceFolders 
  if (!workspaceFolder) {
    vscode.window.showErrorMessage(`Please open the template folder first`)
    return
  }
  const workspaceFolderPath = workspaceFolder[0].uri.fsPath

  // get imageName from user input
  // if user press `esc`, just return
  const imageName = await vscode.window.showInputBox({
    prompt: 'Enter image name, e.g.foo/hello:v1.0'
  })
  if (!imageName) {
    return
  }
  let buildCommand = `rhino build --image ${imageName}`

  // let user select makefile path
  // then use path.relative to calculate the relative path
  // of makefile
  const makefileUri = await vscode.window.showOpenDialog({
    canSelectFiles: true,
    canSelectFolders: false,
    canSelectMany: false,
    openLabel: 'Select Makefile for your project, default: `./src/Makefile`'
  })

  if (makefileUri) {
    const makefileRelPath = path.relative(workspaceFolderPath, makefileUri[0].fsPath)
    buildCommand += ` -f ${makefileRelPath}`
  }

  // get command line arguments from user input
  // stop collecting cmd args when user press esc
  let cmdArgs: string[] = []
  while (true) {
    let arg = await vscode.window.showInputBox({
      prompt: 'Enter command line args'
    })
    if (!arg) {
      break
    }

    cmdArgs.push(`${arg} `)
  }

  let cmdArgString = ""
  for (let arg of cmdArgs) {
    cmdArgString += arg
  }
  if (cmdArgs.length != 0) {
    buildCommand += ` -- ${cmdArgString}`
  }

  // launch a subprocess to execute rhino build command
  vscode.window.showInformationMessage(`Building: ${buildCommand}`)
  try {
    execSync(buildCommand, {cwd: workspaceFolderPath})
    vscode.window.showInformationMessage(`Rhino: Build ${imageName} SUCCESS!`)
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
  }
}

export default rhinoBuild
