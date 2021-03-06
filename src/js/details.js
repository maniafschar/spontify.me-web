import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { intro } from './intro';
import { lists } from './lists';
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
		communication.ajax({
			url: global.server + 'action/one?query=' + action + '&distance=100000&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon,
			responseType: 'json',
			success(r) {
				if (!r || r.length < 1) {
					ui.navigation.openPopup(ui.l('attention'), ui.l('error.detailNotFound'));
					lists.removeListEntry(id);
					return;
				}
				var activeID = ui.navigation.getActiveID();
				ui.css(activeID + ' row[i="' + id + '"] badge[action="remove"]', 'display', 'none');
				r = callback(r, id);
				if (r) {
					var l = ui.q('detail');
					if (activeID == 'detail')
						ui.navigation.animation(l, 'homeSlideOut', function () {
							ui.css(l, 'opacity', 0);
							ui.css(l, 'transform', '');
							ui.css(l, 'marginLeft', 0);
						});
					var animate = ui.classContains(l, 'animated');
					var f = function () {
						if (ui.classContains(l, 'animated')) {
							setTimeout(f, 50);
							return;
						}
						ui.html(l, r);
						ui.attr(l, 'i', id);
						if (activeID != 'detail') {
							ui.attr(l, 'list', activeID);
							ui.attr(l, 'type', action.indexOf('contact_') == 0 ? 'contact' : 'location');
							ui.navigation.goTo('detail');
						}
						formFunc.initFields('detail');
						formFunc.image.replaceSVGs();
						if (animate)
							ui.navigation.animation(l, 'homeSlideIn');
						l.scrollTop = 0;
						ui.css(l, 'opacity', 1);
						geoData.headingWatch();
						if (activeID == 'locations' && !ui.q('locations').innerHTML) {
							if (user.contact) {
								if (global.isBrowser())
									history.pushState(null, null, window.location.origin);
							} else {
								var s = ui.q('detail .title').innerHTML;
								if (s.indexOf('<span') > -1)
									s = s.substring(0, s.indexOf('<span'));
								if (global.isBrowser())
									history.pushState(null, null, window.location.origin + '/loc_' + id + '_' + encodeURIComponent(s.replace(/\//g, '_')));
								var e = ui.q('title'), s2 = e.innerHTML;
								e.innerHTML = (s2.indexOf(global.separator) > -1 ? s2.substring(0, s2.indexOf(global.separator)) : s2) + global.separator + s;
							}
						}
						geoData.updateCompass();
					};
					if (animate)
						setTimeout(f, 400);
					else
						f.call();
					intro.introMode = 0;
				}
			}
		});
	}
	static openDetailNav(next, id, noAnimation) {
		var e = ui.q('detail');
		if (ui.classContains(e, 'animated') || ui.classContains('content', 'animated'))
			return;
		var oc = details.getNextNavElement(next, id);
		if (oc) {
			ui.navigation.hidePopup();
			oc.click();
			ui.navigation.animation(e, 'detail' + (next ? '' : 'Back') + 'SlideOut', function () {
				ui.css(e, 'opacity', 0);
				ui.css(e, 'transform', '');
				ui.css(e, 'marginLeft', 0);
			});
		}
	}
	static swipeLeft() {
		var e = ui.q('detail').getAttribute('i');
		if (e)
			details.openDetailNav(true, e);
	}
	static swipeRight() {
		ui.navigation.goTo(ui.q('detail').getAttribute('list'));
	}
	static toggleFavorite() {
		var e = ui.q('detail');
		if (e.getAttribute('type') == 'location')
			pageLocation.toggleFavorite(e.getAttribute('i'));
		else
			pageContact.toggleBlockUser(e.getAttribute('i'));
	}
	static togglePanel(d) {
		var path = ui.parents(d, 'popup') ? 'popup detail' : 'detail';
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
			if (path.indexOf('popup') > -1)
				e = e.parentNode;
			var b = buttons.offsetHeight + buttons.offsetTop - e.offsetHeight / 2;
			ui.toggleHeight(d);
			if (e.scrollTop < b && !ui.classContains(divID, 'popup'))
				ui.scrollTo(e, b);
			ui.classRemove(divID, 'collapsed');
		}
	}
}