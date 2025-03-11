import { MessageManager } from "@autochrome/core/messaging/message-manager";
import { Config } from './config/config';
import { ConsoleReader } from './console-reader/console-reader';
import { Logger } from '@autochrome/core/common/logger';
import { ConnectorMessageProcessor } from './messaging/connector-message.processor';
import { AutoMessageViewDataType } from '@autochrome/core/messaging/i-auto-message';
import { ConnectorContext } from './connector-context';
import { ConnectorWebSocketServerMessageTransporter } from './messaging/connector-web-socket-server-message.transporter';
import * as process from 'process';
import { filter } from 'rxjs';
import { CommandRegistry } from './commands/command-registry';

Logger.instance.prefix = 'Connector';

Config.instance.configure();
Logger.instance.severity = Config.instance.connectorLogSeverity;

Logger.instance.debug(`Config: `, Config.instance);

ConnectorContext.instance.messageManager = MessageManager.create<AutoMessageViewDataType>(
	ConnectorMessageProcessor.create(),
	ConnectorWebSocketServerMessageTransporter.create<AutoMessageViewDataType>()
);

ConnectorContext.instance.messageManager.transporter.connected$.pipe(filter((value) => value != null)).subscribe((connected: boolean) => {
	Logger.instance.log(`Message Manager connected is: ${connected}`);
	ConnectorContext.instance.connected = connected;
});

ConnectorContext.instance.close = async (code: number) => {
	Logger.instance.log('Context Close is called.');
	await ConnectorContext.instance.messageManager.dispose();
	process.exit(code);
}

if (Config.instance.userInput) {
	ConsoleReader.instance.start();
}

if (Config.instance.commandFile) {
	(async () => {
		await CommandRegistry.instance.invoke(['execute.file', Config.instance.commandFile!, Config.instance.exitOnError ? 'exit' : '']);
		await ConnectorContext.instance.close(0)
	})();
}
