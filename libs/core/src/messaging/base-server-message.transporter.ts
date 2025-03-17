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
	protected $clientConnected = new BehaviorSubject<{clientId: string, state: boolean} | null | null>(null);

	public message$: Observable<IAutoMessage<T>> = this.$message.asObservable();
	public connected$: Observable<boolean | null> = this.$connected.asObservable();
	public clientConnected$: Observable<{clientId: string, state: boolean} | null> = this.$clientConnected.asObservable();

	public clientTransporters = new Map<string, {transporter: IClientMessageTransporter<T>, closeThisClient: () => void}>();

	public dispose(): void {
		this.closeConnections();
	}

	public closeConnections(): void {
        Array.from(this.clientTransporters.keys()).forEach((clientId) => {
            this.closeConnection(clientId);
        });
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
		let subscription: Subscription | null = transporter.message$.subscribe((message) => this.$message.next(message));

        let remoteClientId: string | null = null;

		let connectionWatchdog: number | null = setTimeout(() => {
			Logger.instance.warn(`New connection handshake timeout.`);
			closeThisClient();
		}, 10000) as unknown as number;

		const closeThisClient = () => {
			if (subscription) {
				subscription.unsubscribe();
				subscription = null;
			}
			if (remoteClientId != null) {
				const cId = remoteClientId;
				remoteClientId = null;
				this.closeConnection(cId);
				this.$clientConnected.next({clientId: cId, state: false});
			}

			if (this.clientTransporters.size === 0) {
				this.$connected.next(false);
			}

			if (connectionWatchdog) {
				clearTimeout(connectionWatchdog);
				connectionWatchdog = null;
			}

			if (transporter) {
				transporter.dispose();
			}
		}

		transporter.connected$.subscribe((connected) => {
            if (connected == null) {
                return;
            }
			if (connected) {
				clearTimeout(connectionWatchdog!);
				remoteClientId = transporter.connection!.clientId;
				this.clientTransporters.set(remoteClientId, { transporter, closeThisClient });

                this.$clientConnected.next({clientId: remoteClientId, state: true});

                if (this.$connected.value == null || this.$connected.value === false) {
					this.$connected.next(true);
				}
			} else {
				closeThisClient();
			}
		});
	}

	protected closeConnection(clientId: string | null | undefined): void {
		if (clientId == null || !this.clientTransporters.has(clientId)) {
			return;
		}
		const item = this.clientTransporters.get(clientId)!;
		try {
			item.closeThisClient();
		} catch (error) {
			Logger.instance.error('Error: ', error);
		} finally {
			this.clientTransporters.delete(clientId);
		}
	}
}
