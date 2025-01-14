import { IAutoAction } from './i-auto-action';

export interface IAutoActionSelectFile extends IAutoAction {
    selector: string;
    fileName: string;
    fileType: string;
    fileContent: string;
    wait?: boolean;
}
