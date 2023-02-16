import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { pageLocation } from './pageLocation';
import { ui, formFunc } from './ui';

export { lists };

class lists {
	static template = v =>
		global.template`<listHeader>
<buttonicon class="right bgColor" onclick="ui.navigation.toggleMenu()"><img source="menu"/></buttonicon>
${v.img}<listTitle>${v.title}</listTitle>${v.map}</listHeader>
<listBody>${v.groups}<listResults></listResults></listBody>`;

	static getListNoResults(activeID, errorID) {
		var s = ui.l('noResults.' + errorID), p;
		while ((p = s.indexOf('${')) > -1) {
			var p2 = s.indexOf('}', p);
			s = s.substring(0, p) + ui.l(s.substring(p + 2, p2)) + s.substring(p2 + 1);
		}
		if (errorID == 'favorites')
			s = s.replace('{1}', '<br/><br/><br/><br/><buttonIcon style="left:50%;margin:-3em 0 0 -1.5em;"><img src="images/favorite.svg"/></buttonIcon><br/>');
		else if (errorID == 'matches')
			s = s.replace('{1}', '<br/><br/><buttontext onclick="ui.navigation.goTo(&quot;settings2&quot;)" class="bgColor">' + ui.l('Yes') + '</buttontext>');
		else if (errorID == 'friends')
			s = s.replace('{1}', '<br/><br/><buttontext class="bgColor">' + ui.l('contacts.requestFriendshipButton') + '</buttontext><br/><br/>');
		else if (errorID.toLowerCase().indexOf('groups') > -1)
			s = s.replace('{1}', '<br/><br/><buttontext class="bgColor">' + ui.l('group.action') + '</buttontext><br/><br/>');
		else if (errorID == 'profile')
			s = s.replace('{1}', '<br/><br/><buttontext onclick="ui.navigation.goTo(&quot;settings&quot;)" class="bgColor">' + ui.l('settings.edit') + '</buttontext>');
		else if (errorID == 'list')
			s = s.replace('{1}', '<br/><br/><buttontext onclick="pageLocation.edit()" class="bgColor">' + ui.l('locations.new') + '</buttontext>');
		else if (errorID == 'eventsMy')
			s = s.replace('{1}', '<br/><br/><buttontext class="bgColor">' + ui.l('events.participante') + '</buttontext><br/><br/>');
		else if (errorID == 'search' &&
			ui.val('search div.' + ui.q('search tabHeader tab.tabActive').getAttribute('i') + ' [name="keywords"]'))
			s += '<br/><br/>' + ui.l('noResults.searchWithoutKeywords') + '<br/><br/><buttontext onclick="pageSearch.repeatSearch()" class="bgColor">' + ui.l('noResults.repeat') + '</buttontext>';
		return '<noResult>' + s.replace(/\{0\}/g, ui.l(activeID + '.title')).replace('{1}', '') + '</noResult>';
	}
	static loadList(data, callback, divID, errorID) {
		if (divID == 'contacts' && errorID != 'groups' && ui.q('groups') && ui.cssValue('groups', 'display') != 'none')
			ui.toggleHeight('groups');
		ui.css(divID + ' filters', 'transform', 'scale(0)');
		ui.html('popupHint', '');
		var menuIndex = -1;
		ui.qa('menu a').forEach(function (e, i) { if (e.matches(':hover')) menuIndex = i; });
		communication.ajax({
			url: global.server + 'db/list?' + data,
			responseType: 'json',
			success(r) {
				var s = callback(r);
				if (menuIndex > -1)
					ui.attr(divID, 'menuIndex', menuIndex);
				ui.navigation.hideMenu();
				ui.navigation.closePopup();
				if (divID) {
					if (!s)
						s = lists.getListNoResults(divID.indexOf('.') ? divID.substring(divID.lastIndexOf('.') + 1) : divID, errorID)
					lists.hideFilter();
					lists.setListDivs(divID);
					ui.html(divID + ' listResults', s);
					var e = ui.q(divID + ' listBody');
					if (e)
						e.scrollTop = 0;
					lists.setListHint(divID);
				}
				formFunc.image.replaceSVGs();
				geoData.updateCompass();
			}
		});
	}
	static removeListEntry(id, activeID) {
		ui.attr(activeID + ' [i="' + id + '"]', 'remove', '1');
		if (ui.q('detail card:last-child [i="' + id + '"]'))
			ui.q('detail card:last-child [i="' + id + '"]').outerHTML = '';
		var e = ui.q(activeID + ' row[i="' + id + '"]');
		if (e) {
			ui.navigation.animation(e, 'homeSlideOut', function () {
				if (e.nextSibling) {
					var e2 = e.nextSibling;
					e2.style.transition = 'none';
					e2.style.marginTop = e.offsetHeight + 'px';
					setTimeout(function () {
						e2.style.transition = '';
						e2.style.marginTop = 0;
					}, 100);
				}
				e.outerHTML = '';
				lists.setListHint(activeID);
				if (!ui.q(activeID + ' row'))
					ui.navigation.toggleMenu();
			});
		}
	}
	static setListDivs(id) {
		var e = ui.q(id);
		if (!e.innerHTML) {
			var v = {};
			if (id == 'contacts')
				v.groups = '<groups style="display:none;"></groups>';
			else
				v.map = '<map style="display:none;"></map><buttontext class="bgColor map" onclick="pageLocation.searchFromMap()">' + ui.l('search.map') + '</buttontext>';
			v.title = ui.l(id + '.title').toLowerCase();
			e.innerHTML = lists.template(v);
			formFunc.image.replaceSVGs();
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
	static setListHint(id) {
		var e = ui.q(id + ' listHeader listTitle');
		if (e) {
			ui.classRemove('menu a', 'highlightMenu');
			ui.classAdd(ui.qa('menu a')[parseInt(ui.q(ui.navigation.getActiveID()).getAttribute('menuIndex'))], 'highlightMenu');
			var rows = ui.qa(id + ' row'), x = 0;
			var s = ui.q('menu .highlightMenu');
			if (s)
				s = s.innerHTML;
			if (s) {
				var s2 = s.substring(0, s.indexOf('>') + 1);
				s = s.substring(s.indexOf('>') + 1) + s2;
			} else if (id == 'search')
				s = ui.q('[name="searchType"]:checked').getAttribute('label');
			else
				s = '';
			for (var i = 0; i < rows.length; i++) {
				if (rows[i].getAttribute('filtered') != 'true')
					x++;
			}
			if (!rows.length)
				x = ui.l('noResults.title');
			else if (rows.length > x)
				x = x + '/' + rows.length;
			e.innerHTML = ui.l('search.results').replace('{0}', x) + ' ' + s;
		} else if (id.indexOf('search') == 0) {
			var s = id.substring(id.lastIndexOf('.') + 1);
			var i = ui.qa('search tabBody div.' + s + ' listResults row').length;
			ui.q('search tabHeader tab[i="' + s + '"]').innerText = ui.l(s + '.title') + (i ? global.separator + i : '');
		}
	}
	static hideFilter() {
		var activeID = ui.navigation.getActiveID();
		var e = ui.q(activeID + ' filters');
		if (ui.cssValue(e, 'transform').indexOf('1') > 0)
			ui.css(e, 'transform', 'scale(0)');
	}
}