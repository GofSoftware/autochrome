import { Logger } from '../common/logger';
import { AutoMessageType, IAutoMessage, IAutoMessageWebSocketConnect } from "../auto-link/messaging/i-auto-message";

export class AutoLinkWebSocket {
    private static staticId = 0;
    private static autoLinkWebSocketInstance: AutoLinkWebSocket;
    public static get instance(): AutoLinkWebSocket {
        return AutoLinkWebSocket.autoLinkWebSocketInstance || (AutoLinkWebSocket.autoLinkWebSocketInstance = new AutoLinkWebSocket());
    }

    public logging = false;

    private id = 'AutoLinkWebSocket_' + ++AutoLinkWebSocket.staticId;
    private socket: WebSocket;

    public refreshConnection(): void {
        if (this.socket != null) {
            if (this.socket.readyState === WebSocket.CONNECTING || this.socket.readyState === WebSocket.OPEN) {
                this.log('Web Socket is already created, ready state: ', this.readyStateName());
                return;
            }
            else {
                this.log('Web Socket is already created, but the ready state is ', this.readyStateName());
                this.close();
            }
        }
        this.socket = new WebSocket('ws://localhost:3101');

        this.socket.onerror = (error) => {
            console.error('WebSocket Error:', error);
            this.close();
        }

        this.socket.addEventListener('open', (event) => {
            this.log('Connection is opened, sending IAutoMessageWebSocketConnect message to the server.');
            this.socket.send(JSON.stringify({
                type: AutoMessageType.WebSocketConnect,
                data: {clientId: this.id}
            } as IAutoMessage<IAutoMessageWebSocketConnect>));
        });

        this.socket.addEventListener('message', (event) => {
            this.log('Message from server: ', event.data);
        });
    }

    private close(): void {
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
