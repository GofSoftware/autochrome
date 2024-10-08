import { Logger } from './logger';
import { Config } from '../program/config/config';

export interface IAutoPromise<T> {
	promise: Promise<T> | null;
	reject: (reason: any) => void;
}

interface IAutoPromiseWithId<T> extends IAutoPromise<T> {
	id: number;
}

export interface IAutoInterval {
	clear: () => void;
}

interface IAutoIntervalWithId extends IAutoInterval{
	id: number;
}

export interface IAutoTimeout {
	clear: () => void;
}

interface IAutoTimeoutWithId extends IAutoTimeout {
	id: number;
}

export class InterruptibleUtility {
	private static id = 0;
	private static get newId(): number {
		return ++InterruptibleUtility.id;
	}

	private static promiseMap: Map<number, IAutoPromiseWithId<any>> = new Map<number, IAutoPromiseWithId<any>>();
	private static intervalMap: Map<number, IAutoIntervalWithId> = new Map<number, IAutoIntervalWithId>();
	private static timeoutMap: Map<number, IAutoTimeoutWithId> = new Map<number, IAutoTimeoutWithId>();

	public static createPromise<T>(
		callback: (resolve: (value: T) => any, reject: (reason: any) => any) => Promise<void>,
		tag: string = '',
		timeout: number = Config.instance.globalTimeout
	): IAutoPromise<T> {
		const id = InterruptibleUtility.newId;

		let rejectExtended: (reason: any) => void = () => {/**/};

		const timeoutHandle = setTimeout(() => { rejectExtended(`${tag} timeout (${timeout})`); }, timeout);
		const autoPromise: IAutoPromiseWithId<T> = {id, promise: null, reject: rejectExtended };

		const promise = new Promise<T>(async (resolve, reject) => {
			const resolveExtended = (value: T) => {
				if (!InterruptibleUtility.promiseMap.has(id)) {
					return;
				}
				InterruptibleUtility.promiseMap.delete(id);
				clearTimeout(timeoutHandle);
				resolve(value);
				Logger.instance.debug(`${tag}. The promise has been resolved, id: ${id} ` +
					`total left: ${InterruptibleUtility.promiseMap.size}`);
			};

			rejectExtended = (reason: any) => {
				if (!InterruptibleUtility.promiseMap.has(id)) {
					return;
				}
				InterruptibleUtility.promiseMap.delete(id);
				clearTimeout(timeoutHandle);
				reject(reason);
				Logger.instance.debug(`${tag}. The promise has been rejected, id: ${id}, reason: ${reason} ` +
					`total left: ${InterruptibleUtility.promiseMap.size}`);
			};

			autoPromise.reject = rejectExtended;
			InterruptibleUtility.promiseMap.set(id, autoPromise);

			Logger.instance.debug(`${tag}. A new promise has been created, total: ${InterruptibleUtility.promiseMap.size}`);

			try {
				await callback(resolveExtended, rejectExtended);
			} catch (error) {
				rejectExtended(error);
			}
		});

		autoPromise.promise = promise;
		return autoPromise;
	}

	public static createTimeout(callback: () => any, timeout: number, tag: string): IAutoTimeout {
		const id = InterruptibleUtility.newId;
		let handle: number | null = setTimeout(() => {
			InterruptibleUtility.timeoutMap.delete(id);

			callback();

			Logger.instance.debug(`The timeout [${tag}] has been invoked, id: ${id} ` +
				`total left: ${InterruptibleUtility.timeoutMap.size}`);
		}, timeout) as unknown as number;

		InterruptibleUtility.timeoutMap.set(id, {
			id,
			clear: () => {
				if (handle != null) {
					clearTimeout(handle);
					handle = null;
					InterruptibleUtility.timeoutMap.delete(id);
					Logger.instance.debug(`The timeout [${tag}] has been manually cleared, id: ${id}, ` +
						`total left: ${InterruptibleUtility.timeoutMap.size}`);
				}
			}
		});
		Logger.instance.debug(`A new timeout [${tag}] has been created, total: ${InterruptibleUtility.timeoutMap.size}`);
		return InterruptibleUtility.timeoutMap.get(id)!;
	}

	public static createInterval(callback: () => any, timeout: number, tag: string): IAutoInterval {
		const id = InterruptibleUtility.newId;
		let handle: number | null = setInterval(() => {
			callback();
			Logger.instance.debug(`The interval [${tag}] has been invoked, id: ${id}, ` +
				`total left: ${InterruptibleUtility.intervalMap.size}`);
		}, timeout) as unknown as number;
		InterruptibleUtility.intervalMap.set(id, {
			id,
			clear: () => {
				if (handle != null) {
					clearInterval(handle);
					handle = null;
					InterruptibleUtility.intervalMap.delete(id);
					Logger.instance.debug(`The interval [${tag}] has been cleared, id: ${id}, ` +
						`total left: ${InterruptibleUtility.intervalMap.size}`);
				}
			}
		});
		Logger.instance.debug(`A new interval [${tag}] has been created, total: ${InterruptibleUtility.intervalMap.size}`);
		return InterruptibleUtility.intervalMap.get(id)!;
	}

	public static rejectAllPromises(reason: any): void {
		Logger.instance.debug(`Rejecting all promises (${InterruptibleUtility.promiseMap.size}), reason: ${reason}.`);
		for (const autoPromise of InterruptibleUtility.promiseMap.values()) {
			autoPromise.reject(reason);
		}
	}

	public static clearAllIntervals(): void {
		Logger.instance.debug(`Clearing all intervals (${InterruptibleUtility.intervalMap.size})`);
		for (const autoInterval of InterruptibleUtility.intervalMap.values()) {
			autoInterval.clear();
		}
	}

	public static clearAllTimeouts(): void {
		Logger.instance.debug(`Clearing all timeouts (${InterruptibleUtility.timeoutMap.size})`);
		for (const autoTimeout of InterruptibleUtility.timeoutMap.values()) {
			autoTimeout.clear();
		}
	}

	public static clearAll(reason: any): void {
		Logger.instance.debug('Clearing all interruptible...');
		InterruptibleUtility.clearAllIntervals();
		InterruptibleUtility.clearAllTimeouts();
		InterruptibleUtility.rejectAllPromises(reason);
	}

	public static async wait(
		subject: string,
		conditionDelegate: () => boolean,
		timeout: number,
		checkInterval: number = 100
	): Promise<void> {
		Logger.instance.debug(subject);
		const initialState = conditionDelegate();
		if (initialState === true) {
			return Promise.resolve();
		}
		let interval: IAutoInterval = {clear: () => {/**/}};

		try {
			await InterruptibleUtility.createPromise<void>(async (resolve) => {
				interval = InterruptibleUtility.createInterval(() => {
					const currentState = conditionDelegate();
					if (currentState === true) {
						interval.clear();
						resolve();
						return;
					}
				}, checkInterval, subject);
			}, subject, timeout).promise;
		} catch (error) {
			interval.clear();
			throw error;
		}
	}

	public static async justWait(time: number, tag: string): Promise<void> {
		let interval: IAutoInterval = {clear: () => {/**/}};
		try {
			await InterruptibleUtility.createPromise<void>(async (resolve) => {
				interval = InterruptibleUtility.createTimeout(() => resolve(), time, tag);
			}, tag, time + time).promise;
		} finally {
			interval.clear();
		}
	}
}
