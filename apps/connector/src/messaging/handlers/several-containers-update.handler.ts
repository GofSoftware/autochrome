import { IMessageHandler } from '@autochrome/core/messaging/i-message-handler';
import {
	IAutoMessage,
	IAutoMessageViewDataSeveralContainersUpdate
} from '@autochrome/core/messaging/i-auto-message';
import { Config } from '../../config/config';
import { TeamcityReporterContainerUpdateHandler } from './teamcity-reporter-container-update-handler';
import { ConnectorContext } from '../../connector-context';
import { Logger } from '@autochrome/core/common/logger';
import { JUnitReporterContainerUpdateHandler } from './j-unit-reporter-container-update-handler';

export class SeveralContainersUpdateHandler implements IMessageHandler<IAutoMessage<IAutoMessageViewDataSeveralContainersUpdate>> {
	public static create(): SeveralContainersUpdateHandler {
		return new SeveralContainersUpdateHandler();
	}

	private teamcityHandler: TeamcityReporterContainerUpdateHandler | null = null;
	private jUnitXmlReportHandler: JUnitReporterContainerUpdateHandler | null = null;

	public async process(message: IAutoMessage<IAutoMessageViewDataSeveralContainersUpdate>): Promise<void> {
		if (Config.instance.teamcity) {
			(this.teamcityHandler || (this.teamcityHandler = TeamcityReporterContainerUpdateHandler.create())).handle(message.data);
			(this.jUnitXmlReportHandler || (this.jUnitXmlReportHandler = JUnitReporterContainerUpdateHandler.create())).handle(message.data);
		} else {
			this.teamcityHandler = null;
			this.jUnitXmlReportHandler = null;
		}

		// Logger.instance.log(
		// 	'Got Several Containers Update: ',
		// 	(message as IAutoMessage<IAutoMessageViewDataSeveralContainersUpdate>).data.containerInfos
		// );

		const currentInfoMap = ConnectorContext.instance.programInfos.reduce((map, info) => {
			map.set(info.id, info);
			return map;
		}, new Map());

		for (const containerInfo of message.data.containerInfos) {
			if (currentInfoMap.has(containerInfo.id)) {
				Object.assign(currentInfoMap.get(containerInfo.id)!, containerInfo);
			}
		}
	}

	public getJUnitXmlResult(): string {
		return this.jUnitXmlReportHandler ? this.jUnitXmlReportHandler.getReport() : '';
	}
}
