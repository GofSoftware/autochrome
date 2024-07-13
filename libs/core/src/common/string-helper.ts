export class StringHelper {

	public static isNullOrEmpty(str: string): boolean {
		return str == null || str === '';
	}

	public static squeezeGuid(guid: string): string {
		if (StringHelper.isNullOrEmpty(guid) || guid.length < 8) {
			return guid;
		}

		return guid.substring(0, 4) + '...' + guid.substring(guid.length - 4);
	}
}
