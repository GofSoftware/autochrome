export class HtmlElementHelper {
	public static createElementFromHTML(htmlString: string): ChildNode {
		const div = document.createElement('div');
		div.innerHTML = htmlString.trim();

		// Change this to div.childNodes to support multiple top-level nodes.
		return div.firstChild;
	}
}
