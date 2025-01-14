export type SetOptionCallback = (name: string, value: unknown) => void;

export class OptionParser {
	public static parse(optionParameters: string[], setOption: SetOptionCallback): void {
		if (optionParameters.length === 0) {
			return;
		}

		optionParameters.forEach((pair) => {
			const nameValue = pair.split('=');
			setOption(nameValue[0], nameValue[1]);
		});
	}

	public static parseBoolean(value: string | null, defaultValue = true): boolean {
		if (value == null) {
			return defaultValue;
		}
		return value.toLowerCase() == 'true' || value === '1';
	}

	public static parseInteger(value: string | null, defaultValue = 0): number {
		if (value == null) {
			return defaultValue;
		}
		const res = parseInt(value, 10);
		return isNaN(res) ? defaultValue : res;
	}

	public static parseFloat(value: string | null, defaultValue = 0): number {
		if (value == null) {
			return defaultValue;
		}
		const res = parseFloat(value);
		return isNaN(res) ? defaultValue : res;
	}
}
