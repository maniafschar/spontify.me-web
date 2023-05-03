import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageChat } from './pageChat';
import { pageLocation } from './pageLocation';
import { ui, formFunc } from './ui';
import { user } from './user';

export { details };

class details {
	static getNextNavElement(next, id) {
		var activeID = ui.q(ui.navigation.getActiveID()).getAttribute('from');
		if (activeID == 'contacts' || activeID == 'locations' || activeID == 'events') {
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
	static init() {
	}
	static open(id, data, callback) {
		if (ui.navigation.getActiveID() == 'chat' && ui.q('detail:not([style*="none"])[i="' + id + '"]')) {
			pageChat.close();
			return;
		}
		if (ui.classContains('detail', 'detailSlideIn'))
			return;
		var wc = data.webCall;
		delete data.webCall;
		data.distance = 100000;
		data.latitude = geoData.current.lat;
		data.longitude = geoData.current.lon;
		communication.ajax({
			url: global.serverApi + 'action/one?' + Object.keys(data).map(key => key + '=' + data[key]).join('&'),
			responseType: 'json',
			webCall: wc,
			success(r) {
				ui.navigation.hideMenu();
				if (!r || Object.keys(r).length < 1) {
					ui.navigation.openPopup(ui.l('attention'), ui.l('error.detailNotFound'));
					lists.removeListEntry(id, data.query.indexOf('location_') > -1 ? 'locations' : 'contacts');
					return;
				}
				var activeID = ui.navigation.getActiveID();
				ui.css(activeID + ' row[i="' + id + '"] badge[action="remove"]', 'display', 'none');
				var s = callback(r, id);
				if (s) {
					var d = ui.q('detail');
					s = '<card i="' + id + '" type="' + (data.query.indexOf('contact_') == 0 ? 'contact' : 'location') + '">' + s + '</card>';
					if (activeID == 'detail') {
						var c = document.createElement('div');
						c.innerHTML = s;
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
						ui.html(d, '<div>' + s + '</div>');
						ui.navigation.goTo('detail', false);
					}
					formFunc.initFields(ui.q('detail'));
					formFunc.image.replaceSVGs();
					d.scrollTop = 0;
					ui.css(d, 'opacity', 1);
					geoData.headingWatch();
					if (activeID == 'locations' && !ui.q('locations').innerHTML) {
						if (user.contact) {
							if (global.isBrowser())
								history.pushState(null, null, window.location.origin);
						} else {
							s = ui.q('detail card:last-child .title').innerHTML;
							if (s.indexOf('<span') > -1)
								s = s.substring(0, s.indexOf('<span'));
							var e = ui.q('title');
							var s2 = e.innerHTML;
							e.innerHTML = (s2.indexOf(global.separator) > -1 ? s2.substring(0, s2.indexOf(global.separator)) : s2) + global.separator + s;
						}
					}
					geoData.updateCompass();
					details.init();
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
		var e = ui.q('detail card:last-child');
		if (e)
			details.openDetailNav(true, e.getAttribute('i'));
	}
	static swipeRight() {
		if (ui.qa('detail card').length == 1)
			ui.navigation.goTo(ui.q('detail').getAttribute('from'));
		else {
			var e = ui.q('detail>div');
			var x = parseInt(ui.cssValue(e, 'margin-left')) / ui.q('content').clientWidth;
			if (x < 0) {
				ui.on(e, 'transitionend', function () {
					ui.css(e, 'transition', 'none');
					if (e.lastChild)
						e.lastChild.outerHTML = '';
					var x = e.clientWidth / ui.q('content').clientWidth;
					ui.css(e, 'width', x == 2 ? '' : ((x - 1) * 100) + '%');
					setTimeout(function () {
						ui.css(e, 'transition', null);
					}, 50);
				}, true);
				ui.css(e, 'margin-left', ((x + 1) * 100) + '%');
			}
		}
	}
	static toggleFavorite() {
		var e = ui.q('detail card:last-child');
		if (e && e.getAttribute('type') == 'location') {
			var id = e.getAttribute('i');
			if (('' + id).indexOf('_') > 0)
				id = id.substring(0, id.indexOf('_'));
			pageLocation.toggleFavorite(id);
		}
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