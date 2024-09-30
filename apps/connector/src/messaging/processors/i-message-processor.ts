export interface IMessageProcessor<T> {
    process(message: T): Promise<void>;
}
