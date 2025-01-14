export class ErrorHelper {
	public static genericErrorToString(error: any) {
		if (error == null) {
			return 'Generic exception.';
		}

		if (error.message) {
			return error.message;
		}

		return error.toString();
	}
}
