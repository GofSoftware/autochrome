import { Logger } from '@autochrome/core/common/logger';
import {
	AutoMessageType, IAutoMessageViewDataGetGlobalSettings, IAutoMessageViewDataGetProgramList
} from '@autochrome/core/messaging/i-auto-message';
import { BaseConnectorCommand } from './base-connector-command';
import { IProgramContainerInfo } from '@autochrome/core/program/container/i-program-container';
import { ConnectorContext } from '../connector-context';
import { BaseServerMessageTransporter } from '@autochrome/core/messaging/base-server-message.transporter';

export class GetConnectionListCommand extends BaseConnectorCommand {
	public static commandName: string = 'get.connections';

    public getHelp(): string { return 'get.connections'; }

	public async invoke(parameters: string[]): Promise<void> {
		const connections: string[] =
			Array.from(
				(ConnectorContext.instance.messageManager.transporter as BaseServerMessageTransporter<any>).clientTransporters.values()
			).filter((t) => t.transporter.connection != null)
			 .map((clientTransporter) => clientTransporter.transporter.connection!.clientId);
		Logger.instance.log('\n' + connections.join(';\n'));
		Logger.instance.log(`${parameters[0]} done.`);
	}
}

