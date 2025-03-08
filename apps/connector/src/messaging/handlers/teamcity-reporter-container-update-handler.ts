import { IAutoMessageViewDataSeveralContainersUpdate } from '@autochrome/core/messaging/i-auto-message';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';

export class TeamcityReporterContainerUpdateHandler {
	public static create(): TeamcityReporterContainerUpdateHandler {
		return new TeamcityReporterContainerUpdateHandler();
	}

	public handle(data: IAutoMessageViewDataSeveralContainersUpdate): void {
		data.containerInfos.forEach((containerInfo) => {
			this.log(containerInfo)
		})
	}

	private inProgressMap = new Map<string, Partial<IProgramContainerInfo>>();

	private log(containerInfo: Partial<IProgramContainerInfo>): void {
		if (containerInfo.id == null || containerInfo.tabId == null || containerInfo.status == null || containerInfo.programName == null) {
			return;
		}

		switch (containerInfo.status) {
			case ProgramContainerStatus.New:
				break;
			case ProgramContainerStatus.InProgress:
				if (!this.inProgressMap.has(containerInfo.id) ||
					this.inProgressMap.get(containerInfo.id)!.status !== ProgramContainerStatus.InProgress
				) {
					console.log(`##teamcity[testSuiteStarted name='${this.escape(containerInfo.programName)}']`);
				} else {
					console.log(`##teamcity[testStdOut name='${this.escape(containerInfo.programName)}' out='[${this.escape(containerInfo.activeActionId)}] ${this.escape(containerInfo.activeActionName)} ${this.escape(containerInfo.activeActionDescription)}']`);
				}
				break;
			case ProgramContainerStatus.Completed:
				console.log(`##teamcity[testSuiteFinished name='${this.escape(containerInfo.programName)}']`);
				break;
			case ProgramContainerStatus.Error:
				console.log(`##teamcity[testFailed name='${this.escape(containerInfo.programName)}' message='${this.escape(containerInfo.error)}']`);
				console.log(`##teamcity[testSuiteFinished name='${this.escape(containerInfo.programName)}']`);
				break;
			case ProgramContainerStatus.Paused:
				break;
			case ProgramContainerStatus.Stopped:
				break;
		}

		this.inProgressMap.set(containerInfo.id, containerInfo);

		// ##teamcity[testSuiteStarted name='suiteName']
		//   ##teamcity[testStarted name='testName' captureStandardOutput='<true/false>']
		//     ##teamcity[testStdOut name='className.testName' out='text']
		//     ##teamcity[testStdErr name='className.testName' out='error text']
		//     ##teamcity[testFailed name='MyTest.test1' message='failure message' details='message and stack trace']
		//     ##teamcity[testFailed type='comparisonFailure' name='MyTest.test2' message='failure message' details='message and stack trace' expected='expected value' actual='actual value']
		//   ##teamcity[testFinished name='testName' duration='<test_duration_in_milliseconds>']
		//   ##teamcity[testIgnored name='testName' message='ignore comment']
		// ##teamcity[testSuiteFinished name='suiteName']
	}

	private escape(value: string | null | undefined): string {
		return (value || '').replaceAll('\'', '`').replaceAll('\r', '').replaceAll('\n', ' ');
	}
}
