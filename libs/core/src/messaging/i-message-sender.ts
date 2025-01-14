export interface IMessageSender<T> {
	sendMessage<R>(data: T, toClientId: string | null): Promise<R>;
}

export interface IMessageSenderWithNoResponse<T> extends IMessageSender<T> {
	sendNoResponseMessage(data: T, toClientId: string | null): Promise<void>;
}
