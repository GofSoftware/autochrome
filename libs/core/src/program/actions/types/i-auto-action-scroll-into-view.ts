import { IAutoAction } from './i-auto-action';

export interface IAutoActionScrollIntoView extends IAutoAction {
    selector: string;
    wait?: boolean;
    behavior : string; 	// auto, instant or smooth. Defaults to auto.
    block : string; 	// start, center, end, or nearest. Defaults to start.
    inline: string;		// start, center, end, or nearest. Defaults to nearest.
}
