import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { intro } from './intro';
import { lists } from './lists';
import { pageChat } from './pageChat';
import { pageContact } from './pageContact';
import { pageLocation } from './pageLocation';
import { ui, formFunc } from './ui';
import { user } from './user';

export { details };

class details {
	static getNextNavElement(next, id) {
		var activeID = ui.q(ui.navigation.getActiveID()).getAttribute('list');
		if (activeID == 'contacts' || activeID == 'locations' || activeID == 'search') {
			var e = ui.q(activeID + ' [i="' + id + '"]');
			if (e) {
				if (next && e.nextSibling) {
					if (!e.nextSibling.getAttribute('i'))
						e = e.nextSibling;
					return e.nextSibling;
				}
				if (!next && e.previousSibling) {
					if (!e.previousSibling.getAttribute('i'))
						e = e.previousSibling;
					return e.previousSibling;
				}
			}
		}
	}
	static open(id, action, callback) {
		ui.navigation.hideMenu();
		if (ui.navigation.getActiveID() == 'chat' && ui.q('detail:not([style*="none"])[i="' + id + '"]')) {
			pageChat.close();
			return;
		}
		communication.ajax({
			url: global.server + 'action/one?query=' + action + '&distance=100000&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon,
			responseType: 'json',
			success(r) {
				if (!r || Object.keys(r).length < 1) {
					ui.navigation.openPopup(ui.l('attention'), ui.l('error.detailNotFound'));
					lists.removeListEntry(id);
					return;
				}
				var activeID = ui.navigation.getActiveID();
				ui.css(activeID + ' row[i="' + id + '"] badge[action="remove"]', 'display', 'none');
				r = callback(r, id);
				if (r) {
					var d = ui.q('detail');
					r = '<card i="' + id + '" type="' + (action.indexOf('contact_') == 0 ? 'contact' : 'location') + '">' + r + '</card>';
					if (activeID == 'detail') {
						var c = document.createElement('div');
						c.innerHTML = r;
						var e = ui.q('detail>div');
						ui.css(e, 'transition', 'none');
						e.appendChild(c.children[0]);
						var x = e.clientWidth / ui.q('content').clientWidth;
						ui.css(e, 'width', ((x + 1) * 100) + '%');
						setTimeout(function () {
							ui.css(e, 'transition', null);
							ui.css(e, 'margin-left', (-x * 100) + '%');
						}, 50);
					} else {
						ui.html(d, '<div>' + r + '</div>');
						ui.navigation.goTo('detail');
					}
					if (activeID != 'detail')
						ui.attr(d, 'list', activeID);
					formFunc.initFields('detail');
					formFunc.image.replaceSVGs();
					d.scrollTop = 0;
					ui.css(d, 'opacity', 1);
					geoData.headingWatch();
					if (activeID == 'locations' && !ui.q('locations').innerHTML) {
						if (user.contact) {
							if (global.isBrowser())
								history.pushState(null, null, window.location.origin);
						} else {
							var s = ui.q('detail card:last-child .title').innerHTML;
							if (s.indexOf('<span') > -1)
								s = s.substring(0, s.indexOf('<span'));
							var e = ui.q('title');
							var s2 = e.innerHTML;
							e.innerHTML = (s2.indexOf(global.separator) > -1 ? s2.substring(0, s2.indexOf(global.separator)) : s2) + global.separator + s;
						}
					}
					geoData.updateCompass();
				}
			}
		});
	}
	static openDetailNav(next, id) {
		var e = ui.q('detail');
		if (ui.classContains(e, 'animated') || ui.classContains('content', 'animated'))
			return;
		var oc = details.getNextNavElement(next, id);
		if (oc)
			oc.click();
	}
	static swipeLeft() {
		var e = ui.q('detail card:last-child').getAttribute('i');
		if (e)
			details.openDetailNav(true, e);
	}
	static swipeRight() {
		ui.navigation.goTo('home');
	}
	static toggleFavorite() {
		var e = ui.q('detail card:last-child');
		if (e.getAttribute('type') == 'location')
			pageLocation.toggleFavorite(e.getAttribute('i'));
		else
			pageContact.toggleBlockUser(e.getAttribute('i'));
	}
	static togglePanel(d) {
		var path = 'detail card:last-child';
		var panelName = d.getAttribute('name').replace('button', '');
		var divID = path + '>[name="' + panelName.substring(0, 1).toLowerCase() + panelName.substring(1) + '"]';
		var open = ui.classContains(divID, 'collapsed');
		var e = ui.qa(path + '>text[name]:not(.popup)');
		var buttons = ui.q(path + '>detailButtons');
		for (var i = 0; i < e.length; i++) {
			if (!ui.classContains(e[i], 'collapsed')) {
				ui.toggleHeight(e[i], function () {
					ui.classAdd(e[i], 'collapsed');
					if (open)
						details.togglePanel(d);
				});
				return;
			}
		}
		if (open) {
			e = ui.q(path);
			var b = buttons.offsetHeight + buttons.offsetTop - e.offsetHeight / 2;
			ui.toggleHeight(d);
			if (e.scrollTop < b && !ui.classContains(divID, 'popup'))
				ui.scrollTo(e, b);
			ui.classRemove(divID, 'collapsed');
		}
	}
}