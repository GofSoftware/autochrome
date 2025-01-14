import readlinePromises from 'node:readline/promises';
import { CommandRegistry } from '../commands/command-registry';
import { ConnectorContext } from '../connector-context';

export class ConsoleReader {
    private static consoleReaderInstance: ConsoleReader;
    public static get instance(): ConsoleReader {
        return ConsoleReader.consoleReaderInstance || (ConsoleReader.consoleReaderInstance = new ConsoleReader());
    }

    public start(): void {
        const rl = readlinePromises.createInterface({
            input: process.stdin,
            output: process.stdout,
        });
        (async () => {
            let exit = false;
            while(!exit) {
                const answer = await rl.question('command > ');
				const parameters = answer.split(' ').map((a) => a.trim());
				if (parameters.length === 0) {
					continue;
				}
                if (parameters[0].toLowerCase() === 'exit') {
					await ConnectorContext.instance.close(0);
                    exit = true;
                }
				await CommandRegistry.instance.invoke(parameters);
            }
            rl.close();
        })()
    }
}
