import { geoData } from "./geoData";
import { global } from "./global";
import { pageContact } from "./pageContact";
import { formFunc, ui } from "./ui";
import { user } from "./user";
import { lists } from "./lists";
import { pageEvent } from "./pageEvent";
import { pageLocation } from "./pageLocation";
import { hashtags } from "./hashtags";

export { pageSearch };

class pageSearch {
	static template = v =>
		global.template`<tabHeader>
	<tab onclick="pageSearch.selectTab('contacts')" i="contacts">
		${ui.l('contacts.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('events')" i="events">
		${ui.l('events.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('locations')" i="locations">
		${ui.l('locations.title')}
	</tab>
</tabHeader>
<tabBody>
	<div class="contacts"></div>
	<div class="events"></div>
	<div class="locations"></div>
</tabBody>`;
	static contacts = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="checkbox" label="${ui.l('search.matches')}" name="matches" ${v.matches}/>
<label class="locationPicker" onclick="geoData.openLocationPicker(event)">${geoData.current.town}</label>
<hashtagButton onclick="ui.toggleHeight(&quot;search div.contacts hashtags&quot;)"></hashtagButton>
<input type="text" name="keywords" maxlength="50" onkeyup="hashtags.synchonizeTags(this)" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<hashtags style="display:none;">${v.hashtagSelection}</hashtags>
<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
<errorHint></errorHint>
<dialogButtons>
<buttontext class="bgColor defaultButton" onclick="pageSearch.contacts.search()">${ui.l('search.action')}</buttontext>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.contacts.fieldValues.keywords)
				v.keywords = ' value="' + pageSearch.contacts.fieldValues.keywords + '"';
			if (pageSearch.contacts.fieldValues.matches == 'on')
				v.matches = ' checked="true"';
			v.hashtagSelection = hashtags.display();
			return pageSearch.contacts.template(v);
		},
		getMatches() {
			var search = '(' + global.getRegEx("contact.skills", user.contact.skills) + ' or ' + global.getRegEx('contact.skillsText', user.contact.skillsText) + ')';
			var gender = function (age, i) {
				if (age) {
					var ageSplit = age.split(','), s2 = '';
					if (ageSplit[0] > 18)
						s2 = 'contact.age>=' + ageSplit[0];
					if (ageSplit[1] < 99)
						s2 += (s2 ? ' and ' : '') + 'contact.age<=' + ageSplit[1];
					return 'contact.gender=' + i + (s2 ? ' and ' + s2 : '');
				}
				return '';
			}
			var s = gender(user.contact.ageMale, 1), g = '';
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageFemale, 2);
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageDivers, 3);
			if (s)
				g += ' or ' + s;
			if (g)
				search += ' and (' + g.substring(4) + ')';
			return search;
		},
		getSearch() {
			var s = '', s2 = '';
			if (ui.q('search tabBody div.contacts [name="matches"]:checked'))
				s = ' and ' + pageSearch.contacts.getMatches();
			var v = ui.val('search tabBody div.contacts [name="keywords"]').trim();
			if (v) {
				var t = hashtags.convert(v);
				v = v.replace(/'/g, '\'\'').split(' ');
				s += ' and (';
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						s2 = v[i].trim().toLowerCase();
						s += 'contact.idDisplay=\'' + s2 + '\' or (contact.search=true and (LOWER(contact.aboutMe) like \'%' + s2 + '%\' or LOWER(contact.pseudonym) like \'%' + s2 + '%\' or LOWER(contact.skillsText) like \'%' + s2 + '%\')) or ';
					}
				}
				s = s.substring(0, s.length - 4);
				if (t.category)
					s += (s ? ' or ' : '') + global.getRegEx('contact.skills', t.category);
				s += ')';
			}
			return 'contact.id<>' + user.contact.id + s;
		},
		search() {
			pageSearch.contacts.fieldValues = formFunc.getForm('search tabBody div.contacts form').values;
			lists.load({
				webCall: 'pageSearch.contacts.search()',
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				distance: 100000,
				query: 'contact_list',
				search: encodeURIComponent(pageSearch.contacts.getSearch())
			}, pageContact.listContacts, 'search tabBody>div.contacts', 'search');
			user.set('searchContacts', pageSearch.contacts.fieldValues);
		}
	}
	static events = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="checkbox" label="${ui.l('search.matchesEvent')}" name="matches" ${v.matches}/>
<label class="locationPicker" onclick="geoData.openLocationPicker(event)">${geoData.current.town}</label>
<hashtagButton onclick="ui.toggleHeight(&quot;search div.events hashtags&quot;)"></hashtagButton>
<input type="text" name="keywords" maxlength="50" onkeyup="hashtags.synchonizeTags(this)" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<hashtags style="display:none;">${v.hashtagSelection}</hashtags>
<explain class="searchKeywordHint">${ui.l('search.hintEvent')}</explain>
<errorHint></errorHint>
<dialogButtons>
<buttontext class="bgColor defaultButton" onclick="pageSearch.events.search()">${ui.l('search.action')}</buttontext>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.events.fieldValues.keywords)
				v.keywords = ' value="' + pageSearch.events.fieldValues.keywords + '"';
			if (pageSearch.events.fieldValues.matches == 'on')
				v.matches = ' checked="true"';
			v.hashtagSelection = hashtags.display();
			return pageSearch.events.template(v);
		},
		getMatches() {
			var search = '(' + global.getRegEx("event.skills", user.contact.skills) + ' or ' + global.getRegEx('event.skillsText', user.contact.skillsText) + ')';
			var gender = function (age, i) {
				if (age) {
					var ageSplit = age.split(','), s2 = '';
					if (ageSplit[0] > 18)
						s2 = 'contact.age>=' + ageSplit[0];
					if (ageSplit[1] < 99)
						s2 += (s2 ? ' and ' : '') + 'contact.age<=' + ageSplit[1];
					return 'contact.gender=' + i + (s2 ? ' and ' + s2 : '');
				}
				return '';
			}
			var s = gender(user.contact.ageMale, 1), g = '';
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageFemale, 2);
			if (s)
				g += ' or ' + s;
			s = gender(user.contact.ageDivers, 3);
			if (s)
				g += ' or ' + s;
			if (g)
				search += ' and (event.price>0 or ' + g.substring(4) + ')';
			return search;
		},
		getSearch() {
			var v = ui.val('search tabBody div.events [name="keywords"]').trim(), s = '';
			if (v) {
				var t = hashtags.convert(v);
				v = v.replace(/'/g, '\'\'').split(' ');
				for (var i = 0; i < v.length; i++) {
					if (v[i].trim()) {
						v[i] = v[i].trim().toLowerCase();
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '((contact.search=true or event.price>0) and (LOWER(contact.pseudonym' + l + 'contact.aboutMe' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') or '
						s += 'LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l + 'event.text' + l + 'event.skillsText' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') or ';
					}
				}
				if (t.category)
					s = (s ? s.substring(0, s.length - 5) + ' or ' : '') + global.getRegEx('event.skills', t.category) + ' or ';
				if (s)
					s = '(' + s.substring(0, s.length - 4) + ')';
			}
			if (ui.q('search tabBody div.events [name="matches"]:checked'))
				s += (s ? ' and ' : '') + pageSearch.events.getMatches();
			var d = new Date();
			d.setDate(new Date().getDate() + 14);
			return 'event.startDate<=\'' + global.date.local2server(d).substring(0, 10) + '\' and event.endDate>=\'' + global.date.local2server(new Date()).substring(0, 10) + '\'' + (s ? ' and ' + s : '');
		},
		getSearch1(bounds) {
			var s = '';
			var c = '', d = '';
			if (bounds) {
				var border = 0.1 * Math.abs(bounds.getSouthWest().lat() - bounds.getNorthEast().lat());
				s += (s ? ' and ' : '') + 'location.latitude>' + (bounds.getSouthWest().lat() + border);
				s += ' and location.latitude<' + (bounds.getNorthEast().lat() - border);
				border = 0.1 * Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
				s += ' and location.longitude>' + (bounds.getSouthWest().lng() + border);
				s += ' and location.longitude<' + (bounds.getNorthEast().lng() - border);
			}
			var v = ui.val('locations filters [name="keywords"]').trim();
			if (v) {
				v = v.replace(/'/g, '\'\'').split(' ');
				for (var i = 0; i < v.length; i++) {
					if (v[i].trim()) {
						v[i] = v[i].trim().toLowerCase();
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						d = d.substring(0, d.lastIndexOf('LOWER'));
						d = d.substring(0, d.length - 4) + ') and ';
					}
				}
				if (d)
					d = '(' + d.substring(0, d.length - 5) + ')';
			}
			if (d)
				s += (s ? ' and ' : '') + d;
			return s;
		},
		search() {
			pageSearch.events.fieldValues = formFunc.getForm('search tabBody div.events form').values;
			pageEvent.loadEvents({
				webCall: 'pageSearch.events.search()',
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				distance: 100000,
				query: 'event_list',
				search: encodeURIComponent(pageSearch.events.getSearch())
			});
			user.set('searchEvents', pageSearch.events.fieldValues);
		}
	}
	static locations = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="checkbox" label="${ui.l('search.favorites')}" name="favorites" ${v.favorites}/>
<label class="locationPicker" onclick="geoData.openLocationPicker(event)">${geoData.current.town}</label>
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<dialogButtons>
<buttontext class="bgColor defaultButton" onclick="pageSearch.locations.search()">${ui.l('search.action')}</buttontext>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.locations.fieldValues.favorites)
				v.favorites = ' checked="checked"';
			if (pageSearch.locations.fieldValues.keywords)
				v.keywords = ' value="' + pageSearch.locations.fieldValues.keywords + '"';
			return pageSearch.locations.template(v);
		},
		getSearch() {
			var s = '';
			var v = ui.val('search tabBody div.locations [name="keywords"]').trim();
			if (v) {
				v = v.replace(/'/g, '\'\'').split(' ');
				for (var i = 0; i < v.length; i++) {
					if (v[i].trim()) {
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') or ';
					}
				}
				if (s)
					s = '(' + s.substring(0, s.length - 4) + ')';
			}
			if (ui.val('search tabBody div.locations [name="favorites"]:checked'))
				s += (s ? ' and ' : '') + 'locationFavorite.favorite=true';
			return s;
		},
		getSearch1(bounds) {
			var s = '';
			if (ui.q('locations filters [name="matches"]:checked'))
				s = pageSearch.events.getMatches();
			var c = '', d = '';
			if (bounds) {
				var border = 0.1 * Math.abs(bounds.getSouthWest().lat() - bounds.getNorthEast().lat());
				s += (s ? ' and ' : '') + 'location.latitude>' + (bounds.getSouthWest().lat() + border);
				s += ' and location.latitude<' + (bounds.getNorthEast().lat() - border);
				border = 0.1 * Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
				s += ' and location.longitude>' + (bounds.getSouthWest().lng() + border);
				s += ' and location.longitude<' + (bounds.getNorthEast().lng() - border);
			}
			var v = ui.val('locations filters [name="keywords"]').trim();
			if (v) {
				v = v.replace(/'/g, '\'\'').split(' ');
				for (var i = 0; i < v.length; i++) {
					if (v[i].trim()) {
						v[i] = v[i].trim().toLowerCase();
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						d = d.substring(0, d.lastIndexOf('LOWER'));
						d = d.substring(0, d.length - 4) + ') and ';
					}
				}
				if (d)
					d = '(' + d.substring(0, d.length - 5) + ')';
			}
			if (d)
				s += (s ? ' and ' : '') + d;
			return s;
		},
		search() {
			pageSearch.locations.fieldValues = formFunc.getForm('search tabBody div.locations form').values;
			lists.load({
				webCall: 'pageSearch.locations.search()',
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				distance: 100000,
				query: 'location_list',
				search: encodeURIComponent(pageSearch.locations.getSearch())
			}, pageLocation.listLocation, 'search tabBody>div.locations', 'search');
			user.set('searchLocations', pageSearch.locations.fieldValues);
		}
	}
	static init() {
		if (!pageSearch.contacts.fieldValues)
			pageSearch.contacts.fieldValues = user.get('searchContacts') || {};
		if (!pageSearch.events.fieldValues)
			pageSearch.events.fieldValues = user.get('searchEvents') || {};
		if (!pageSearch.locations.fieldValues)
			pageSearch.locations.fieldValues = user.get('searchLocations') || {};
		var e = ui.q('search');
		if (!e.innerHTML) {
			e.innerHTML = pageSearch.template();
			ui.q('search tabBody div.contacts').innerHTML = pageSearch.contacts.getFields() + '<listResults></listResults>';
			ui.q('search tabBody div.events').innerHTML = pageSearch.events.getFields() + '<listResults></listResults>';
			ui.q('search tabBody div.locations').innerHTML = pageSearch.locations.getFields() + '<listResults></listResults>';
			formFunc.initFields('search');
			pageSearch.selectTab('contacts');
			hashtags.synchonizeTags(ui.q('search div.contacts input[name="keywords"]'));
			hashtags.synchonizeTags(ui.q('search div.events input[name="keywords"]'));
		}
	}
	static repeatSearch() {
		var type = ui.q('search tabHeader tab.tabActive').getAttribute('i');
		ui.q('search div.' + type + ' [name="keywords"]').value = '';
		pageSearch[type].search();
	}
	static selectTab(id) {
		ui.q('search tabBody').style.marginLeft = ((id == 'contacts' ? 0 : id == 'events' ? 1 : 2) * -100) + '%';
		ui.classRemove('search tab', 'tabActive');
		ui.classAdd('search tab[i="' + id + '"]', 'tabActive');
		if (ui.q('locationPicker').style.display != 'none')
			ui.toggleHeight('locationPicker');
	}
	static swipeLeft() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == -200)
			ui.navigation.goTo('events');
		else if (x == -100)
			pageSearch.selectTab('locations');
		else
			pageSearch.selectTab('events');
	}
	static swipeRight() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == 0)
			ui.navigation.goTo('home', true);
		else if (x == -100)
			pageSearch.selectTab('contacts');
		else
			pageSearch.selectTab('events');
	}
	static updateLocalisation() {
		ui.html('search label.locationPicker', geoData.current.town);
	}
}