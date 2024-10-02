import readlinePromises from 'node:readline/promises';

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
                console.log('>>>')
                const answer = await rl.question('What is your favorite food? ');
                console.log(`Hi ${answer}!`);
                if (answer.toLowerCase() === 'exit') {
                    exit = true;
                }
            }
            rl.close();
            process.exit(0);
        })()
    }
}
