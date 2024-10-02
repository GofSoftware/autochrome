import express from 'express';
import expressWs from 'express-ws';
import { MessageManager } from "./messaging/message-manager";
import { Config } from './config/config';
import { ConsoleReader } from './console-reader/console-reader';
import { ProgramHolder } from './config/program-holder';
import { Logger } from '@autochrome/core/common/logger';

Logger.instance.prefix = 'Connector';

Config.instance.configure();
console.log(`${Config.instance.path} && ${Config.instance.search}`);
if (Config.instance.path && Config.instance.search) {
    ProgramHolder.instance.collectPrograms(Config.instance.path, Config.instance.search);
}

const app: expressWs.Instance = expressWs(express());

app.app.ws('/', (ws) => {
    MessageManager.instance.init(ws);
});

app.app.listen(Config.instance.port, Config.instance.host, () => {
    console.log(`Listening ${Config.instance.host}:${Config.instance.port}\n`);
    if (Config.instance.userInput) {
        ConsoleReader.instance.start();
    }
});
