import { AnyQuerySelector, IQuerySelector } from '../program/actions/auto-action';

export class QuerySelectorHelper {
	public static querySelector(selector: AnyQuerySelector, root: Element = document.documentElement): Element[] {
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
				: [root.querySelector(querySelector.selector)];
		}

		if (selector.child == null) {
			return elements;
		}

		return elements.reduce((childElements, element) => {
			const result = QuerySelectorHelper.querySelector(selector.child, element);
			return childElements.concat(result);
		}, [] as Element[]);
	}

	public static convertToString(selector: AnyQuerySelector): string {
		if (typeof selector === "string") {
			return selector;
		}
		return `${selector.selector}`+
			`${selector.innerText == null ? '' : ', innerText: ' + selector.innerText}` +
			`${selector.textContent == null ? '' : ', textContent: ' + selector.textContent}` +
			`${selector.child == null ? '' : ', child: (' + QuerySelectorHelper.convertToString(selector.child) + ')'}` +
			`${selector.all ? ', all' : ''}`;
	}
}
