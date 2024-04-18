import { IQuerySelector, StringOrIQuerySelector } from '../program/actions/i-interfaces';

export class QuerySelectorHelper {
	public static querySelector(selector: StringOrIQuerySelector, root: Element = document.documentElement): Element[] {
		if (typeof selector === "string") {
			return Array.from(root.querySelectorAll(selector));
		}

		const querySelector: IQuerySelector = selector;

		let elements: Element[] = [];

		// It also can be done through the XPath, check the following link if more complex selectors are required.
		// https://stackoverflow.com/questions/37098405/javascript-queryselector-find-div-by-innertext/37098508#37098508
		if (typeof selector.textContent === "string") {
			const allElements = Array.from(root.querySelectorAll(querySelector.selector));
			elements = (querySelector.all === true)
				? allElements.filter((element) => RegExp(selector.textContent).test(element.textContent))
				: [allElements.find((element) => RegExp(selector.textContent).test(element.textContent))].filter((e) => e != null);
		} else if (typeof selector.innerText === "string") {
			const allElements = Array.from(root.querySelectorAll(querySelector.selector));
			elements = (querySelector.all === true)
				? allElements.filter((element) => RegExp(selector.innerText).test((element as HTMLElement).innerText))
				: [allElements.find((element) => RegExp(selector.innerText).test((element as HTMLElement).innerText))]
					.filter((e) => e != null);
		} else {
			elements = (querySelector.all === true)
				? Array.from(root.querySelectorAll(querySelector.selector))
				: [root.querySelector(querySelector.selector)].filter((e) => e != null);
		}

		if (selector.child != null) {
			return elements.reduce((childElements, element) => {
				const result = QuerySelectorHelper.querySelector(selector.child, element);
				return childElements.concat(result);
			}, [] as Element[]);
		}

		if (selector.parent != null && elements.length > 0) {
			const parentLevel = selector.parentLevel || 0;

			let parent = elements[0].parentElement;
			for (let i = 0; i < parentLevel; i++) {
				parent = parent.parentElement;
			}

			return QuerySelectorHelper.querySelector(selector.parent, parent);
		}

		if (selector.iframe != null && elements.length > 0) {
			const iframeBody = (elements[0] as HTMLIFrameElement).contentDocument?.body;
			if (iframeBody != null) {
				return QuerySelectorHelper.querySelector(selector.iframe, iframeBody);
			}
		}

		return elements;
	}

	public static convertToString(selector: StringOrIQuerySelector): string {
		if (typeof selector === "string") {
			return selector;
		}
		return `${selector.selector}`+
			`${selector.innerText == null ? '' : ', innerText: ' + selector.innerText}` +
			`${selector.textContent == null ? '' : ', textContent: ' + selector.textContent}` +
			`${selector.child == null ? '' : ', child: (' + QuerySelectorHelper.convertToString(selector.child) + ')'}` +
			`${selector.parent == null ? '' : ', child: (' + QuerySelectorHelper.convertToString(selector.parent) + ')'}` +
			`${selector.all ? ', all' : ''}`;
	}
}
