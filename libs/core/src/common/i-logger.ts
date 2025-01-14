export enum LogSeverity {
	debug = 0,
	log = 10,
	warn = 20,
	error = 30
}

export const severityChar = {
	[LogSeverity.debug]: 'D',
	[LogSeverity.log]: 'L',
	[LogSeverity.warn]: 'W',
	[LogSeverity.error]: 'E',
}

export interface ILogger {
    prefix?: string;
    debug(message: string, ...params: any[]): void;
    log(message: string, ...params: any[]): void;
    warn(message: string, ...params: any[]): void;
    error(message: string, ...params: any[]): void;
}
