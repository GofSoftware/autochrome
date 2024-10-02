export interface ILogger {
    prefix?: string;
    debug(message: string, ...params: any[]): void;
    log(message: string, ...params: any[]): void;
    warn(message: string, ...params: any[]): void;
    error(message: string, ...params: any[]): void;
}
