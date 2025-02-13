import { BehaviorSubject, Observable, Subject, Subscription } from 'rxjs';
import { IAutoMessage, IAutoMessageData } from '@autochrome/core/messaging/i-auto-message';
import {
	IClientMessageTransporter,
	IServerMessageTransporter
} from '@autochrome/core/messaging/i-client-message-transporter';
import { Logger } from '@autochrome/core/common/logger';

export abstract class BaseServerMessageTransporter<T extends IAutoMessageData> implements IServerMessageTransporter<T> {
	protected $message = new Subject<IAutoMessage<T>>();
	protected $connected = new BehaviorSubject<boolean | null>(null);

	public message$: Observable<IAutoMessage<T>> = this.$message.asObservable();
	public connected$: Observable<boolean | null> = this.$connected.asObservable();

	public clientTransporters = new Map<string, {transporter: IClientMessageTransporter<T>, subscription: Subscription}>();

	public dispose(): void {
		this.closeConnections();
	}

	public closeConnections(): void {
		this.clientTransporters.forEach((value) => {
			try {
				value.subscription.unsubscribe();
				value.transporter.dispose();
			} catch (error) {
				Logger.instance.error('Error: ', error);
			}
		});
		this.clientTransporters.clear();

		this.$connected.next(false);
	}

	public async sendMessage(message: IAutoMessage<T>, toClientId: string): Promise<void> {
		if (this.clientTransporters.size === 0) {
			throw new Error(`BaseServerMessageTransporter error: there are no connections.`);
		}
		if (toClientId == null) {
			toClientId = Array.from(this.clientTransporters.values())[0].transporter.connection?.clientId!;
		}
		if (!this.clientTransporters.has(toClientId)) {
			throw new Error(`BaseServerMessageTransporter error: Unknown client ${toClientId}`);
		}
		await this.clientTransporters.get(toClientId)!.transporter.sendMessage(message);
	}

	public buildMessage<Y extends IAutoMessageData>(data: Y, noResponse: boolean, toClientId: string): IAutoMessage<IAutoMessageData> {
		if (this.clientTransporters.size === 0) {
			throw new Error(`BaseServerMessageTransporter error: there are no connections.`);
		}

		if (toClientId == null) {
			toClientId = Array.from(this.clientTransporters.values())[0].transporter.connection?.clientId!;
		}

		if (!this.clientTransporters.has(toClientId)) {
			throw new Error(`BaseServerMessageTransporter unknown client ${toClientId}`);
		}

		return this.clientTransporters.get(toClientId)!.transporter.buildMessage(data, noResponse);
	}

	protected registerClientTransporter(transporter: IClientMessageTransporter<T>): void {
		const subscription = transporter.message$.subscribe((message) => this.$message.next(message));
		const connectionWatchdog = setTimeout(() => {
			Logger.instance.warn(`New connection handshake timeout.`);
			subscription.unsubscribe();
			transporter.dispose();
		}, 10000);
		let remoteClientId: string | null = null;
		transporter.connected$.subscribe((connected) => {
            if (connected == null) {
                return;
            }
			if (connected) {
				clearTimeout(connectionWatchdog);
				remoteClientId = transporter.connection!.clientId;
				this.clientTransporters.set(remoteClientId, { transporter, subscription });
				if (this.$connected.value == null || this.$connected.value === false) {
					this.$connected.next(true);
				}
			} else {
				this.closeConnection(remoteClientId);
				if (this.clientTransporters.size === 0) {
					this.$connected.next(false);
				}
			}
		});
	}

	private closeConnection(clientId: string | null | undefined): void {
		if (clientId == null || !this.clientTransporters.has(clientId)) {
			return;
		}
		const item = this.clientTransporters.get(clientId)!;
		try {
			item.subscription.unsubscribe();
			item.transporter.dispose();
		} catch (error) {
			Logger.instance.error('Error: ', error);
		} finally {
			this.clientTransporters.delete(clientId);
		}
	}
}
