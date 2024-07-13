export class Vector2 {
	public static create(x: number, y: number): Vector2 {
		return new Vector2(x, y);
	}

	private constructor(public x: number, public y: number) {
	}

	public normalize(): Vector2 {
		if (this.x === 0 && this.y === 0) {
			return this;
		}
		const length = Math.sqrt(this.x * this.x + this.y * this.y);
		return new Vector2(this.x / length, this.y / length);
	}

	public multiply(scalar: number): Vector2 {
		return new Vector2(this.x * scalar, this.y * scalar);
	}
}