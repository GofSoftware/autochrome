import * as fs from 'node:fs';
import * as path from 'node:path';
import { Logger } from '@autochrome/core/common/logger';

export class ProgramHolder {
    private static programHolderInstance: ProgramHolder;
    public static get instance(): ProgramHolder {
        return ProgramHolder.programHolderInstance || (ProgramHolder.programHolderInstance = new ProgramHolder());
    }

    private programs: string[] = [];

    public popProgram(): string {
        if(this.programs.length === 0) {
            return null;
        }
        return this.programs.shift();
    }

    public collectPrograms(folder: string, pattern: string): void {
        Logger.instance.log(`Collecting programs with pattern ${pattern} in ${folder}`);
        this.programs = [];
        this.collectFiles(folder, new RegExp(pattern));
    }

    private collectFiles(folder: string, regExpPattern: RegExp): void {
        Logger.instance.log(`Reading the folder: ${folder}`);
        const files = fs.readdirSync(folder);
        for (const file of files) {
            const resolvedFile = path.resolve(folder, file);
            const stat = fs.statSync(resolvedFile);
            if (stat) {
                if (stat.isDirectory()) {
                    this.collectFiles(resolvedFile, regExpPattern);
                } else {
                    if (regExpPattern.test(resolvedFile)) {
                        Logger.instance.log(`Got the program: ${resolvedFile}`);
                        this.programs.push(fs.readFileSync(resolvedFile, 'utf8'));
                    }
                }
            }
        }
    }
}
