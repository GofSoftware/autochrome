import { Logger } from '@autochrome/core/common/logger';
import { BaseConnectorCommand } from './base-connector-command';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { readFile } from 'node:fs/promises';
import { CommandRegistry } from './command-registry';
import { ConnectorContext } from '../connector-context';

export class ExecuteCommandFileCommand extends BaseConnectorCommand {
	public static commandName: string = 'execute.file';

    public getHelp(): string { return 'execute.file [pathToCommandFile] [exit] - Executes a file with commands, add "exit" to close the Connector if any error occurs. '; }

	public async invoke(parameters: string[]): Promise<void> {
		const file = parameters[1];
		const exitOnError = parameters[2]  === 'exit';
		const resolvedFile = resolve(file);
		const stat = statSync(resolvedFile, {throwIfNoEntry: false});
		if (stat) {
			try {
				const contents = await readFile(resolvedFile, { encoding: 'utf8' });
				const commands = this.extractCommands(contents);
				if (commands.length > 0) {
					for (const command of commands) {
						Logger.instance.log(`Executing: ${command.join(' ')}`);
						await CommandRegistry.instance.invoke(command);
					}
				}
			} catch (error) {
				Logger.instance.error(error);
				if (exitOnError) {
					await ConnectorContext.instance.close(1);
				}
			}
		} else {
			Logger.instance.error(`File not found: ${resolvedFile}`);
		}
		Logger.instance.log(`${parameters[0]} done.`);
	}

	private extractCommands(contents: string): string[][] {
		const commands: string[][] = [];
		const lines = contents.split('\r\n');
		for (const line of lines) {
			const parameters = line.split(' ');
			if (parameters.length > 0) {
				if (parameters[0].startsWith('#') || parameters[0].trim() === '') {
					continue;
				}
				if (CommandRegistry.instance.isKnownCommand(parameters[0])) {
					commands.push(parameters);
				} else {
					Logger.instance.warn(`Unknown command: "${line}", name: "${parameters[0]}", length: ${parameters.length}`);
				}
			}
		}
		return commands
	}
}
