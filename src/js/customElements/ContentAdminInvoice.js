import { ui } from '../ui';
import { initialisation } from '../init';

export { ContentAdminInvoice }

class ContentAdminInvoice extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
h1 {
	font-size: 1.3em;
	margin-top: 0.5em;
}`;
		this._root.appendChild(style);
	}
	static init() {
		var r = ui.q('content-admin-invoice');
		if (r._root.childElementCount == 1) {
			var e = document.createElement('h1');
			e.setAttribute('l', 'invoiceTitle');
			r._root.appendChild(e);
			e = ui.qa('content-admin-invoice [l]');
			for (var i = 0; i < e.length; i++)
				e[i].innerHTML = ui.l('contentAdmin.' + e[i].getAttribute('l'));
		}
	}
}