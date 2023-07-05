import { formFunc, ui } from '../ui';

export { ListBody }

class ListBody extends HTMLElement {
	constructor() {
		super();
	}
	connectedCallback() {
		if (!this.innerHTML) {
			var id = ui.parents(this, 'contacts') ? 'contacts' : ui.parents(this, 'events') ? 'events' : '';
			var element = document.createElement('listHeader');
			element.innerHTML = '<buttonicon class="right bgColor" onclick="ui.navigation.toggleMenu()"><img source="menu"/></buttonicon><listTitle>' + ui.l(id + '.title').toLowerCase() + '</listTitle>'
				+ (id == 'contacts' ? '' : '<map style="display:none;"></map><button-text class="map" onclick="pageLocation.searchFromMap()" label="search.map"></button-text>');
			this.appendChild(element);
			var element = document.createElement('listBody');
			element.innerHTML = (id == 'contacts' ? '<groups style="display:none;"></groups>' : '') + '<listResults></listResults>';
			this.appendChild(element);
			formFunc.svg.replaceAll();
			if (id == 'contacts')
				ui.swipe('contacts>listBody', function (dir) {
					if (dir == 'left')
						ui.navigation.goTo('home', false);
					else if (dir == 'right')
						ui.navigation.goTo('events', true);
				});
			else if (id == 'events')
				ui.swipe('events>listBody', function (dir) {
					if (dir == 'left')
						ui.navigation.goTo('contacts');
					else if (dir == 'right')
						ui.navigation.goTo('search', true);
				});
		}
	}
}
