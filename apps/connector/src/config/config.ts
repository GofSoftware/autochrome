import { Logger } from '@autochrome/core/common/logger';
import { WebSocketLogSeverity } from '@autochrome/core/auto-link/messaging/i-auto-message';

export interface IConfig {
    host: string;
    port: number;
    userInput: boolean;
    path: string;
    search: string;
}

export class Config implements IConfig {
    private static configInstance: Config;
    public static get instance(): Config {
        return Config.configInstance || (Config.configInstance = new Config());
    }

    public host = "localhost";
    public port = 3101;
    public userInput = false;
    public path: string;
    public search: string;
    public logSeverity: WebSocketLogSeverity = WebSocketLogSeverity.Warning;

    public configure(): void {
        this.processArgv();
    }

    private processArgv(): void {
        process.argv.forEach((arg: string, index: number) => {
            if (index < 2) {
                return;
            }
            console.log(`${index}:${arg}\n`);
            const nameValue = this.splitArg(arg);
            this.setOption(nameValue);
        })
    }

    private splitArg(arg: string): {name: string, value: string} {
        const splitResult = arg.split('=');
        if (splitResult.length === 2) {
            return {name: splitResult[0], value: splitResult[1]};
        } else if (splitResult.length === 1) {
            return {name: splitResult[0], value: null};
        }
    }

    private setOption(option: {name: string, value: string}): void {
        switch (option.name.toLowerCase()) {
            case 'host':
                this.host = option.value || this.host;
                break;
            case 'port':
                this.port = option.value == null ? this.port : parseInt(option.value, 10);
                break;
            case 'path':
                this.path = option.value || null;
                break;
            case 'search':
                this.search = option.value || null;
                break;
            case 'log-severity':
                this.logSeverity = this.convertSeverity(option.value);
                break;
            case '-i':
                this.userInput = true;
                break;
            default:
                Logger.instance.warn(`Config: unknown option ${option.name}`);
        }
    }

    private convertSeverity(value: string): WebSocketLogSeverity {
        switch (value.toLowerCase()) {
            case 'debug':
                return WebSocketLogSeverity.Debug;
            case 'info':
                return WebSocketLogSeverity.Info;
            case 'warning':
                return WebSocketLogSeverity.Warning;
            case 'error':
                return WebSocketLogSeverity.Error;
            default:
                console.warn(`Unknown log-severity: ${value}, falling back to 'Warning'`);
                return WebSocketLogSeverity.Warning;
        }
    }
}
