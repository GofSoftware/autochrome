import { Logger } from './logger';
import { Vector2 } from './vector2';
import { InterruptibleUtility } from './interruptible-utility';

export class Cursor {
	private static cursor: HTMLDivElement | null;
	private static currentX: number = 0;
	private static currentY: number = 0;
	private static speed = 25;

	public static create(): void {
		Cursor.cursor = document.querySelector('.auto-cursor');
		if (Cursor.cursor != null) {
			Logger.instance.debug(`Cursor exists.`);
			return;
		}

		Cursor.cursor = document.createElement("div");
		Cursor.cursor.classList.add('auto-cursor');

		const body = document.querySelector('body');
		body?.append(Cursor.cursor);

		Logger.instance.debug(`Cursor created.`);
		Cursor.setPosition(0, 0);
	}

	public static async moveTo(
		x: number,
		y: number,
		smooth: boolean = false
	): Promise<void> {

		Cursor.create();

		await InterruptibleUtility.createPromise<void>(async (resolve) => {
			Cursor.shiftTo(x, y, smooth, resolve);
		}, `Cursor moveTo(${x}, ${y}, ${smooth})`).promise;
	}

	private static shiftTo(x: number, y: number, smooth: boolean = false, onMoved: () => void = () => {/**/}): void {
		if (smooth) {
			if (
				(x > Cursor.currentX - Cursor.speed && x < Cursor.currentX + Cursor.speed) &&
				(y > Cursor.currentY - Cursor.speed && y < Cursor.currentY + Cursor.speed)
			) {
				Cursor.shiftTo(x, y, false, onMoved);
			} else {
				InterruptibleUtility.createTimeout(() => {
					const shift = Vector2.create(x - Cursor.currentX, y - Cursor.currentY).normalize().multiply(Cursor.speed);
					Cursor.currentX += shift.x;
					Cursor.currentY += shift.y;
					// Logger.instance.debug(`Cursor moving: `, Cursor.currentX, Cursor.currentY);
					if (Cursor.cursor != null) {
						Cursor.cursor.style.left = `${Cursor.currentX-12}px`; // -12 - adjusting to the center of the cursor's circle
						Cursor.cursor.style.top = `${Cursor.currentY-12}px`; // -12 - adjusting to the center of the cursor's circle
					}
					Cursor.shiftTo(x, y, true, onMoved);
				}, 16, 'Moving the cursor');
			}
		} else {
			Cursor.setPosition(x, y);
			if (Cursor.cursor != null) {
				Logger.instance.debug(`Cursor position: `, Cursor.currentX, Cursor.currentY);
				Cursor.cursor.style.left = `${x - 12}px`; // -12 - adjusting to the center of the cursor's circle
				Cursor.cursor.style.top = `${y - 12}px`; // -12 - adjusting to the center of the cursor's circle
			}
			onMoved();
		}
	}

	private static setPosition(x: number, y: number): void {
		Cursor.currentX = x;
		Cursor.currentY = y;
	}
}
