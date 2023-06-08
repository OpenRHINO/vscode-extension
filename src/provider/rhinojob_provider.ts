import * as vscode from 'vscode';
import { execSync } from 'child_process';

interface RhinoJob {
  name: string,
  parallelism: string,
  status: string,
  creation_time: string
}

export class JobTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly job?: RhinoJob
  ) {
    super(label, collapsibleState);
    this.contextValue = job ? 'jobItem' : 'jobDetailItem'
  }
}

export class RhinoJobsProvider implements vscode.TreeDataProvider<JobTreeItem> {
	private _onDidChangeTreeData: vscode.EventEmitter<JobTreeItem | undefined> = new vscode.EventEmitter<JobTreeItem | undefined>()
	readonly onDidChangeTreeData: vscode.Event<JobTreeItem | undefined> = this._onDidChangeTreeData.event

	private jobs: RhinoJob[] = []

	refreshJobs(jobs: RhinoJob[]): void {
		this.jobs = jobs
		this._onDidChangeTreeData.fire(undefined)
	}

	clearJobs(): void {
		this.jobs = []
		this._onDidChangeTreeData.fire(undefined)
	}

	getTreeItem(element: JobTreeItem): vscode.TreeItem | Thenable<vscode.TreeItem> {
		return element
	}

	getChildren(element: JobTreeItem): Thenable<JobTreeItem[]> {
    if (element && element.job) {
      return Promise.resolve([
        new JobTreeItem(`Parallelism: ${element.job.parallelism}`, vscode.TreeItemCollapsibleState.None),
        new JobTreeItem(`Status: ${element.job.status}`, vscode.TreeItemCollapsibleState.None),
        new JobTreeItem(`Creation Time: ${element.job.creation_time}`, vscode.TreeItemCollapsibleState.None)
      ]);
    } else {
      return Promise.resolve(this.jobs.map((job) => new JobTreeItem(job.name, vscode.TreeItemCollapsibleState.Collapsed, job)));
    }
  }
}

export async function refreshRhinoJobList(rhinoJobsProvider: RhinoJobsProvider) {
	try {
		const rhinoListOutput = execSync('rhino list')
		const jobs = extractRhinoJobs(rhinoListOutput.toString())
		rhinoJobsProvider.refreshJobs(jobs)
	} catch (error) {
		vscode.window.showErrorMessage(`${error}`)
		rhinoJobsProvider.clearJobs()
	}
}

function extractRhinoJobs(output: string): RhinoJob[] {
  const RHINO_LIST_OUTPUT_COL_NUM = 7
	const lines = output.trim().split(/\r?\n/)
	const jobs = lines.slice(1)
								.map(line => {
									const columns = line.trim().split(/\s+/)
                  if (columns.length != RHINO_LIST_OUTPUT_COL_NUM) {
                    // status not updated, may caused by not running rhino-operator
                    const job: RhinoJob = {
                      name: columns[0],
                      parallelism: columns[1],
                      status: "",
                      creation_time: `${columns[2]} ${columns[3]} ${columns[4]} ${columns[5]}`
                    }
                    return job
                  }

									const job: RhinoJob = {
                    name: columns[0],
                    parallelism: columns[1],
                    status: columns[2],
                    creation_time: `${columns[3]} ${columns[4]} ${columns[5]} ${columns[6]}`
                  }
                  return job
								})
	return jobs
}

export function deleteRhinoJob(rhinoJobsProvider: RhinoJobsProvider, jobName: string | undefined) {
  try {
    execSync(`rhino delete ${jobName}`)
    refreshRhinoJobList(rhinoJobsProvider)
  } catch (error) {
    vscode.window.showErrorMessage(`${error}`)
    rhinoJobsProvider.clearJobs()
  }
}
