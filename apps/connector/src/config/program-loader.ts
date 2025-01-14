import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@autochrome/core/common/logger';
import { ConnectorContext } from '../connector-context';

export class ProgramLoader {
    private static programHolderInstance: ProgramLoader;
    public static get instance(): ProgramLoader {
        return ProgramLoader.programHolderInstance || (ProgramLoader.programHolderInstance = new ProgramLoader());
    }

    public collectPrograms(folder: string, pattern: string): void {
        Logger.instance.log(`Collecting programs with pattern ${pattern} in ${folder}`);
        ConnectorContext.instance.programs = [];
        this.collectFiles(folder, new RegExp(pattern));
    }

    private collectFiles(folder: string, regExpPattern: RegExp): void {
        Logger.instance.log(`Reading the folder: ${folder}`);
        const files = fs.readdirSync(folder);
        for (const file of files) {
            const resolvedFile = path.resolve(folder, file);
            const stat = fs.statSync(resolvedFile, {throwIfNoEntry: false});
            if (stat) {
                if (stat.isDirectory()) {
                    this.collectFiles(resolvedFile, regExpPattern);
                } else {
                    if (regExpPattern.test(resolvedFile)) {
                        Logger.instance.log(`Got the program: ${resolvedFile}`);
						ConnectorContext.instance.programs.push(fs.readFileSync(resolvedFile, 'utf8'));
                    }
                }
            }
        }
    }
}
