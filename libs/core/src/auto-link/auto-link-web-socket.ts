import { Logger } from '../common/logger';
import {
    AutoMessageType,
    IAutoMessage,
    IAutoMessageWebSocketConnect,
    IAutoMessageWebSocketLog, IAutoMessageWebSocketResult
} from '../auto-link/messaging/i-auto-message';

export class AutoLinkWebSocket {
    private static staticId = 0;
    private static autoLinkWebSocketInstance: AutoLinkWebSocket;
    public static get instance(): AutoLinkWebSocket {
        return AutoLinkWebSocket.autoLinkWebSocketInstance || (AutoLinkWebSocket.autoLinkWebSocketInstance = new AutoLinkWebSocket());
    }

    public logging = false;

    private id = 'AutoLinkWebSocket_' + ++AutoLinkWebSocket.staticId;
    private socket: WebSocket;
    public onMessage: (message: IAutoMessage) => Promise<void>;

    public refreshConnection(host: string, port: number): void {
        if (this.socket != null) {
            if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
                // this.log('Web Socket is already created, ready state: ', this.readyStateName());
                return;
            }
            else {
                this.log('Web Socket is already created, but the ready state is ', this.readyStateName());
                this.close();
            }
        }
        this.socket = new WebSocket(`ws://${host}:${port}`);

        this.socket.onerror = (error) => {
            Logger.instance.error('WebSocket Error:', error);
            this.close();
        }

        this.socket.addEventListener('open', () => {
            this.log('Connection is opened, sending IAutoMessageWebSocketConnect message to the server.');
            this.socket.send(JSON.stringify({
                type: AutoMessageType.WebSocketConnect,
                data: {clientId: this.id}
            } as IAutoMessage<IAutoMessageWebSocketConnect>));
        });

        this.socket.addEventListener('message', async (event) => {
            if (this.onMessage != null) {
                try {
                    const message: IAutoMessage = JSON.parse(event.data);
                    if (message.id == null) {
                        throw new Error('IAutoMessage(s) sent by the WebSocket must have the id.');
                    }
                    await this.onMessage(message);
                    this.socket.send(JSON.stringify({
                        id: message.id,
                        type: AutoMessageType.WebSocketMessageResult,
                        data: {clientId: this.id, ok: true}
                    } as IAutoMessage<IAutoMessageWebSocketResult>));
                } catch (error) {
                    Logger.instance.error('WebSocket message Error:', error);
                }
            } else {
                this.log(`Web Socket message: ${(event.data || '').toString().substring(0, 100)}...`);
            }
        });
    }

    public sendLog(message: string, ...params: any[]): void {
        if (this.socket != null && (this.socket.readyState === WebSocket.OPEN)) {

            const autoActionMessage: IAutoMessage<IAutoMessageWebSocketLog> = {
                type: AutoMessageType.WebSocketLog,
                data: {clientId: this.id, message: this.createLogMessage(message, ...params)}
            }
            this.socket.send(JSON.stringify(autoActionMessage));
        }
    }

    private createLogMessage(message: string, ...params: any[]): string {
        return message + params.filter((p) => p != null).map((p) => {
            try {
                const mes = JSON.stringify(p);
                return `${mes.substring(0, 100)}${mes.length > 100 ? '...' : ''}`;
            } catch (error) {
                return p.toString();
            }
        }).join('\n');
    }

    public close(): void {
        if (this.socket == null) {
            return;
        }
        this.log('Closing the Socket');
        this.socket.close();
        this.socket = null;
    }

    private readyStateName(): string {
        switch (this.socket.readyState) {
            case WebSocket.OPEN:
                return 'OPEN';
            case WebSocket.CONNECTING:
                return 'CONNECTING';
            case WebSocket.CLOSING:
                return 'CLOSING';
            case WebSocket.CLOSED:
                return 'CLOSED';
            default:
                return `UNKNOWN ${this.socket.readyState}`;
        }
    }

    private log(message: string, ...params: any[]): void {
        if (!this.logging) {
            return;
        }
        Logger.instance.log(message, ...params);
    }
}
