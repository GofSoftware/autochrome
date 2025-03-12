import { IAutoMessageViewDataSeveralContainersUpdate } from '@autochrome/core/messaging/i-auto-message';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { ProgramContainerStatus } from '@autochrome/core/program/container/program-container-status';

export class IJUnitTestResult {
	id: string;
	testName: string;
	failed: boolean;
	failMessage: string | null;
}

export class JUnitReporterContainerUpdateHandler {
	public static create(): JUnitReporterContainerUpdateHandler {
		return new JUnitReporterContainerUpdateHandler();
	}

	public handle(data: IAutoMessageViewDataSeveralContainersUpdate): void {
		data.containerInfos.forEach((containerInfo) => {
			this.log(containerInfo)
		})
	}

	private resultsMap = new Map<string, IJUnitTestResult>();
	private resultsOrder: string[] = [];

	private log(containerInfo: Partial<IProgramContainerInfo>): void {
		if (containerInfo.id == null || containerInfo.tabId == null || containerInfo.status == null || containerInfo.programName == null) {
			return;
		}

		if (!this.resultsMap.has(containerInfo.id)) {
			this.resultsMap.set(containerInfo.id, {
				id: containerInfo.id,
				testName: containerInfo.programName,
				failed: false,
				failMessage: null
			});
			this.resultsOrder.push(containerInfo.id);
		}

		switch (containerInfo.status) {
			case ProgramContainerStatus.New:
				break;
			case ProgramContainerStatus.InProgress:
				break;
			case ProgramContainerStatus.Completed:
				break;
			case ProgramContainerStatus.Error:
				this.resultsMap.get(containerInfo.id)!.failed = true;
				this.resultsMap.get(containerInfo.id)!.failMessage = containerInfo.error || '';
				break;
			case ProgramContainerStatus.Paused:
				break;
			case ProgramContainerStatus.Stopped:
				break;
		}
/*

<?xml version="1.0" encoding="UTF-8"?>
<testsuites time="15.682687">
    <testsuite name="Tests.Registration" time="6.605871">
        <testcase name="testCase1" classname="Tests.Registration" time="2.113871" />
        <testcase name="testCase2" classname="Tests.Registration" time="1.051" />
        <testcase name="testCase3" classname="Tests.Registration" time="3.441" />
    </testsuite>
    <testsuite name="Tests.Authentication" time="9.076816">
        <testsuite name="Tests.Authentication.Login" time="4.356">
            <testcase name="testCase4" classname="Tests.Authentication.Login" time="2.244" />
            <testcase name="testCase5" classname="Tests.Authentication.Login" time="0.781" />
            <testcase name="testCase6" classname="Tests.Authentication.Login" time="1.331" />
        </testsuite>
        <testcase name="testCase7" classname="Tests.Authentication" time="2.508" />
        <testcase name="testCase8" classname="Tests.Authentication" time="1.230816" />
        <testcase name="testCase9" classname="Tests.Authentication" time="0.982">
            <failure message="Assertion error message" type="AssertionError">
                <!-- Call stack printed here -->
            </failure>
        </testcase>
    </testsuite>
</testsuites>

*/
	}

	public getReport(): string {
		let result = `<?xml version="1.0" encoding="UTF-8"?>\n<testsuites time="15.682687">\n`;

		result += this.resultsOrder.map((id: string) => {
			if (!this.resultsMap.has(id)) {
				return '';
			}
			const testResult = this.resultsMap.get(id)!;
			return `\t<testsuite name="${this.escape(testResult.testName)}">` +
				(testResult.failed ? `<failure message="${this.escape(testResult.failMessage)}" type="AssertionError"></failure>` : '') +
				`\t</testsuite>`
		}).join('\n');

		return result + '\n</testsuites>\n';
	}

	private escape(value: string | null | undefined): string {
		return (value || '').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', ' ').replaceAll('\r', '').replaceAll('"', '`');
	}
}
