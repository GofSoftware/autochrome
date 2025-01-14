/**
 * The wrapper around the Chrome storage for easy switch out to other storage if needed in the future.
 * It is impossible for now to see the chrome.storage in the dev tool, so run the following snippet in the dev console to see the data:
 * chrome.storage.local.get(function(result){console.log(result)})
 */
export class AutoStorage {
	private static storageInstance: AutoStorage;
	public static get instance(): AutoStorage {
		return AutoStorage.storageInstance || (AutoStorage.storageInstance = new AutoStorage());
	}

	public async set(items: {[name: string]: any}): Promise<void> {
		await chrome.storage.local.set(items);
	}

	public async get(keys?: string | string[] | {[name: string]: any} | null): Promise<{[name: string]: any}> {
		return await chrome.storage.local.get(keys);
	}

	public async remove(keys: string | string[]): Promise<void> {
		await chrome.storage.local.remove(keys);
	}
}
