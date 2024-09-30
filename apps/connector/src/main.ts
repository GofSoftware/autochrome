import express from 'express';
import expressWs from 'express-ws';
import {MessageManager} from "./messaging/message-manager";

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3101;

const app = express();
expressWs(app);

(app as any).ws('/', (ws, req) => {
    ws.on('message', async (message: string) => {
        try {
            await MessageManager.instance.processMessage(message);
        } catch (error) {
            console.error(`ws.on('message') Error: `, error);
        }
        // console.log('got message', msg);
        // ws.send(msg);
    });
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

console.log('Listening input');
