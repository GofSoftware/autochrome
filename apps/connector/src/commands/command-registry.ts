import { IConnectorCommand } from './i-connector-command';
import { UnknownCommand } from './unknown.command';
import { Logger } from '@autochrome/core/common/logger';
import { ContainerClearAllProgramItemsCommand } from './container-clear-all-program-items.command';
import { SetGlobalSettingsCommand } from './set-grlobal-settings.command';
import { ContainerNewCommand } from './container-new.command';
import { ContainerRemoveCommand } from './container-remove.command';
import { ContainerUpdateCommand } from './container-update.command';
import { ContainerActionCommand } from './container-action.command';
import { GetGlobalSettingsCommand } from './get-global-settings.command';
import { GetProgramsCommand } from './get-program-list.command';
import { GetConnectionListCommand } from './get-connection-list.command';
import { GetTabListCommand } from './get-tab-list.command';
import { OpenChromeCommand } from './open-chrome.command';
import { CollectProgramsCommand } from './collect-programs.command';
import { ExecuteCommandFileCommand } from './execute-command-file.command';
import { ContainerUploadCollectedCommand } from './container-upload-collected.command';
import { SetTabCurrentCommand } from './set-tab-current.command';
import { CloseTabCommand } from './close-tab.command';
import { WaitTimeCommand } from './wait-time.command';
import { WaitConnectionCommand } from './wait-connection.command';
import { WaitProgramsCommand } from './wait-programs.command';
import { BaseConnectorCommand } from './base-connector-command';

export class CommandRegistry {
	private static commandRegistryInstance: CommandRegistry;
	public static get instance(): CommandRegistry {
		return CommandRegistry.commandRegistryInstance || (CommandRegistry.commandRegistryInstance = new CommandRegistry());
	}

	private registry: Map<string, IConnectorCommand> = new Map();

	constructor() {
		this.register(ContainerClearAllProgramItemsCommand.commandName, new ContainerClearAllProgramItemsCommand());
		this.register(ContainerNewCommand.commandName, new ContainerNewCommand());
		this.register(ContainerRemoveCommand.commandName, new ContainerRemoveCommand());
		this.register(ContainerUpdateCommand.commandName, new ContainerUpdateCommand());
		this.register(SetGlobalSettingsCommand.commandName, new SetGlobalSettingsCommand());
		this.register(ContainerActionCommand.commandName, new ContainerActionCommand());
		this.register(GetGlobalSettingsCommand.commandName, new GetGlobalSettingsCommand());
		this.register(GetProgramsCommand.commandName, new GetProgramsCommand());
		this.register(GetConnectionListCommand.commandName, new GetConnectionListCommand());
		this.register(GetTabListCommand.commandName, new GetTabListCommand());
		this.register(OpenChromeCommand.commandName, new OpenChromeCommand());
		this.register(CollectProgramsCommand.commandName, new CollectProgramsCommand());
		this.register(ExecuteCommandFileCommand.commandName, new ExecuteCommandFileCommand());
		this.register(ContainerUploadCollectedCommand.commandName, new ContainerUploadCollectedCommand());
		this.register(SetTabCurrentCommand.commandName, new SetTabCurrentCommand());
		this.register(CloseTabCommand.commandName, new CloseTabCommand());
		this.register(WaitTimeCommand.commandName, new WaitTimeCommand());
		this.register(WaitConnectionCommand.commandName, new WaitConnectionCommand());
		this.register(WaitProgramsCommand.commandName, new WaitProgramsCommand());
	}

	public isKnownCommand(commandName: string): boolean {
		return this.registry.has(commandName);
	}

	public async invoke(parameters: string[]): Promise<void> {
		try {
			const commandName = parameters[0].toLowerCase();
            if (commandName === 'help' || commandName === '\\?' || commandName === '?') {
                this.displayHelp();
                return;
            }
			const command = this.registry.has(commandName) ? this.registry.get(commandName) : new UnknownCommand();
			await command!.invoke(parameters);
		} catch (error) {
			Logger.instance.error(error);
		}
	}

	private register(name: string, command: IConnectorCommand): void {
		this.registry.set(name,  command);
	}

    private displayHelp(): void {
        this.registry.forEach((command: BaseConnectorCommand) => {
            console.log('\t' + command.getHelp());
        })
    }
}
