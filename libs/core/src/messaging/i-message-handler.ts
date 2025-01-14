export interface IMessageHandler<T> {
    process(message: T): Promise<void>;
}
