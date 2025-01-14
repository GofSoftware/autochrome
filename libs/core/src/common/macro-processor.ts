import dayjs from 'dayjs';

export class MacroProcessor {
	public static create(): MacroProcessor {
		return new MacroProcessor();
	}

	public replaceParameters(text: string, parameterValueResolver: (name: string) => any): string {
		let result;
		let watchDog = 0;
		while ((result = /\{parameter:(.*?)\}/g.exec(text)) !== null) {
			const paramValue = parameterValueResolver(result[1]);
			text = text.replace(result[0], paramValue);
			if (watchDog++ > 1000) {
				throw new Error(`MacroProcessor.replaceParameters watchDog > 1000`);
			}
		}
		return text;
	}

	public replaceDates(text: string): string {
		let result;
		let watchDog = 0;
		while ((result = /\{date:(.*?)\}/g.exec(text)) !== null) {
			const formattedDate = this.getFormattedDate(result[1]);
			text = text.replace(result[0], formattedDate);
			if (watchDog++ > 1000) {
				throw new Error(`MacroProcessor.replaceDates watchDog > 1000`);
			}
		}
		return text;
	}

	private getFormattedDate(format: string): string {
		if(format === 'now') {
			return Date.now().toString();
		}
		return dayjs().format(format);
	}
}
