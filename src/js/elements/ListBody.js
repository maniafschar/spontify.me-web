import { formFunc, ui } from '../ui';

export { ListBody };

class ListBody extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		if (!this.innerHTML) {
			var id = ui.parents(this, 'contacts') ? 'contacts' : ui.parents(this, 'events') ? 'events' : '';
			var element = document.createElement('listHeader');
			element.innerHTML = '<style>buttonicon svg{width:1em; height:1em;}</style><buttonIcon class="bgColor" style="top:0.5em;right:0.5em;" onclick="ui.navigation.toggleMenu()"><img source="menu"/></buttonIcon><listTitle>' + ui.l(id + '.title').toLowerCase() + '</listTitle>';
			this.appendChild(element);
			var element = document.createElement('listBody');
			element.innerHTML = (id == 'contacts' ? '<groups style="display:none;"></groups>' : '') + '<listResults></listResults>';
			this.appendChild(element);
			formFunc.svg.replaceAll();
		}
	}
}
