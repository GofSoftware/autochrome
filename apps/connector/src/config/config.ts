import { Logger } from '@autochrome/core/common/logger';
import { LogSeverity } from '@autochrome/core/common/i-logger';
import { resolve } from 'node:path';
import { readFileSync } from 'node:fs';
import { statSync } from 'node:fs';
import { OptionParser } from '@autochrome/core/common/option-parser';

export interface IConfig {
	host: string;
	port: number;
	userInput: boolean;
	connectorLogSeverity: LogSeverity;
	backgroundLogSeverity: LogSeverity;
	logFile: string | null;
	teamcity: boolean;
	configFile: string | null;
	commandFile: string | null;
	exitOnError: boolean;
	testOutputFolder: string | null;
}

export class Config implements IConfig {
	private static configInstance: Config;

	public static get instance(): Config {
		return Config.configInstance || (Config.configInstance = new Config());
	}

	public host = 'localhost';
	public port = 3101;
	public userInput = true;
	public connectorLogSeverity: LogSeverity = LogSeverity.log;
	public backgroundLogSeverity: LogSeverity = LogSeverity.debug;
	public logFile: string | null = null;
	public teamcity: boolean = false;
	public configFile: string | null = null;
	public commandFile: string | null = null;
	public exitOnError: boolean = true;
	public testOutputFolder: string | null = null;

	public configure(): void {
		const options = this.processArgv();
		this.readFile(options);
		Object.assign(this, options);
	}

	private processArgv(): Partial<IConfig> {
		const args = process.argv.filter((arg: string, index: number) => {
			return index >= 2;
		});

		const options: Partial<IConfig> = {};

		OptionParser.parse(args, (name: string, value: unknown) => {
			this.setOption(name, value as string, options);
		});

		return options;
	}

	private setOption(name: string, value: string, options: Partial<IConfig>): void {
		switch (name) {
			case 'host':
				options.host = value as string;
				break;
			case 'port':
				options.port = OptionParser.parseInteger(value);
				break;
			case 'connectorLogSeverity':
				options.connectorLogSeverity = this.convertSeverity(value);
				break;
			case 'backgroundLogSeverity':
				options.backgroundLogSeverity = this.convertSeverity(value);
				break;
			case 'logFile':
				options.logFile = value;
				break;
			case 'teamcity':
				options.teamcity = OptionParser.parseBoolean(value, true);
				break;
			case 'userInput':
				options.userInput = OptionParser.parseBoolean(value, true);
				break;
			case 'configFile':
				options.configFile = value;
				break;
			case 'commandFile':
				options.commandFile = value;
				break;
			case 'testOutputFolder':
				options.testOutputFolder = value;
				break;
			case 'exitOnError':
				options.exitOnError = OptionParser.parseBoolean(value, true);
				break;
			default:
				Logger.instance.warn(`Config: unknown option ${name}`);
		}
	}

	private convertSeverity(value: string | null): LogSeverity {
		switch (value?.toLowerCase()) {
			case 'debug':
				return LogSeverity.debug;
			case 'log':
				return LogSeverity.log;
			case 'warn':
				return LogSeverity.warn;
			case 'error':
				return LogSeverity.error;
			default:
				console.warn(`Unknown log-severity: ${value}, falling back to 'Warning'`);
				return LogSeverity.log;
		}
	}

	private readFile(options: Partial<IConfig>): void {
		const configFile = options.configFile || './connector.config.json';
		const resolvedFile = resolve(configFile);
		const stat = statSync(resolvedFile, { throwIfNoEntry: false });
		if (stat) {
			try {
				const contents = readFileSync(resolvedFile, { encoding: 'utf8' });
				const conf = JSON.parse(contents);
				Object.keys(conf).forEach((key) => {
					this.setOption(key, conf[key] == null ? null : conf[key].toString(), options);
				});
			} catch (error) {
				Logger.instance.error(`${configFile} processing error: "${error?.message}", using defaults.`);
			}
		} else {
			Logger.instance.log(`Config file "${configFile}" not found, using defaults.`);
		}
	}
}
