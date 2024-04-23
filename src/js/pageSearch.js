import { DialogHint } from './customElements/DialogHint';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageContact } from './pageContact';
import { pageEvent } from './pageEvent';
import { pageLocation } from './pageLocation';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageSearch };

class pageSearch {
	static template = v =>
		global.template`<tabHeader>
	<tab onclick="pageSearch.selectTab('events')" i="events" class="tabActive">
		${ui.l('events.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('contacts')" i="contacts">
		${ui.l('contacts.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('locations')" i="locations">
		${ui.l('locations.title')}
	</tab>
</tabHeader>
<tabBody>
	<div class="events"></div>
	<div class="contacts" style="opacity:0;"></div>
	<div class="locations" style="opacity:0;"></div>
</tabBody>`;
	static contacts = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input-checkbox label="search.matches" name="matches" value="true" ${v.matches}></input-checkbox>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${geoData.getCurrent().town}</label>
<input-hashtags ids="${v.keywords}" text="${v.keywordsText}" name="keywords"></input-hashtags>
<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.contacts.search()" label="search.action"></button-text>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (!pageSearch.contacts.fieldValues.keywords)
				v.keywords = pageSearch.contacts.fieldValues.keywords;
			if (!pageSearch.contacts.fieldValues.keywordsText)
				v.keywordsText = pageSearch.contacts.fieldValues.keywordsText;
			if (pageSearch.contacts.fieldValues.matches != 'false')
				v.matches = ' checked="true"';
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
			var s = '', s2 = '', s3 = '';
			if (ui.q('search tabBody div.contacts [name="matches"][checked="true"]'))
				s = ' and ' + pageSearch.contacts.getMatches();
			var v = ui.q('search tabBody div.contacts input-hashtags').getAttribute('text');
			if (v) {
				v = v.replace(/'/g, '\'\'').split('|');
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						s2 = v[i].trim().toLowerCase();
						s3 += 'contact.idDisplay=\'' + s2 + '\' or (contact.search=true and (LOWER(contact.description) like \'%' + s2 + '%\' or LOWER(contact.pseudonym) like \'%' + s2 + '%\' or LOWER(contact.skillsText) like \'%' + s2 + '%\')) or ';
					}
				}
				s3 = s3.substring(0, s3.length - 4);
			}
			v = ui.q('search tabBody div.contacts input-hashtags').getAttribute('ids');
			if (v)
				s3 += (s3 ? ' or ' : '') + global.getRegEx('contact.skills', v);
			return 'contact.id<>' + user.contact.id + s + (s3 ? ' and (' + s3 + ')' : '');
		},
		search() {
			pageSearch.contacts.fieldValues = formFunc.getForm('search tabBody div.contacts form').values;
			lists.load({
				webCall: 'pageSearch.contacts.search',
				latitude: geoData.getCurrent().lat,
				longitude: geoData.getCurrent().lon,
				distance: -1,
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
<input-date name="date" type="search" value="${v.date}" style="margin-bottom:0.5em;"></input-date>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${geoData.getCurrent().town}</label>
${v.keywords}
<explain class="searchKeywordHint">${ui.l('search.hintEvent')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.events.search()" label="search.action"></button-text>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (!pageSearch.events.fieldValues.keywords)
				pageSearch.events.fieldValues.keywords = '';
			if (global.config.eventNoHashtags)
				v.keywords = '<input value="' + pageSearch.events.fieldValues.keywords + '" name="keywords"></input>'
			else {
				if (!pageSearch.events.fieldValues.keywordsText)
					pageSearch.events.fieldValues.keywordsText = '';
				v.keywords = '<input-hashtags ids="' + pageSearch.events.fieldValues.keywords + '" text="' + pageSearch.events.fieldValues.keywordsText + '" name="keywords"></input-hashtags>'
			}
			v.date = pageSearch.events.fieldValues.date;
			return pageSearch.events.template(v);
		},
		getSearch() {
			var v, s = '';
			if (global.config.eventNoHashtags)
				v = ui.val('search tabBody div.events input');
			else
				v = ui.q('search tabBody div.events input-hashtags').getAttribute('text');
			if (v) {
				v = v.replace(/'/g, '\'\'').split('|');
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '((contact.search=true or event.price>0) and LOWER(contact.pseudonym' + l + 'contact.description' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER(')) + ') or ';
						s += 'LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l + 'event.description' + l + 'event.skillsText' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER(')) + ' or ';
					}
				}
				s = s.substring(0, s.length - 4);
			}
			if (!global.config.eventNoHashtags) {
				v = ui.q('search tabBody div.events input-hashtags').getAttribute('ids');
				if (v)
					s += (s ? ' or ' : '') + global.getRegEx('event.skills', v);
			}
			if (s)
				s = '(' + s + ') and ';
			return s + 'event.endDate>=cast(\'' + global.date.local2server(new Date()).substring(0, 10) + '\' as timestamp)';
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
			var v = ui.q('search tabBody div.locations input-hashtags').getAttribute('text');
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
				webCall: 'pageSearch.events.search',
				latitude: geoData.getCurrent().lat,
				longitude: geoData.getCurrent().lon,
				distance: 100,
				limit: -1,
				query: 'event_list',
				search: encodeURIComponent(pageSearch.events.getSearch())
			}, function (events) {
				var type = ui.val('search tabBody div.events input-date');
				var d = new Date();
				var twoWeeks = new Date();
				twoWeeks.setDate(twoWeeks.getDate() + 14);
				var today = d.toISOString().substring(0, 10);
				d.setDate(d.getDate() + 1);
				var tomorrow = d.toISOString().substring(0, 10);
				var sunday = new Date();
				sunday.setHours(23);
				sunday.setMinutes(59);
				sunday.setSeconds(59);
				while (sunday.getDay() != 0)
					sunday.setDate(sunday.getDate() + 1);
				var sundayNextWeek = new Date(sunday.getTime());
				sundayNextWeek.setDate(sundayNextWeek.getDate() + 7);
				var friday = new Date();
				friday.setHours(0);
				friday.setMinutes(0);
				friday.setSeconds(0);
				if (friday.getDay() < 5 && friday.getDay() > 0)
					while (friday.getDay() != 5)
						friday.setDate(friday.getDate() + 1);
				for (var i = events.length - 1; i >= 0; i--) {
					if (type == 'today') {
						if (global.date.local2server(events[i].event.startDate).indexOf(today) != 0)
							events.splice(i, 1);
					} else if (type == 'tomorrow') {
						if (global.date.local2server(events[i].event.startDate).indexOf(tomorrow) != 0)
							events.splice(i, 1);
					} else if (type == 'thisWeek') {
						if (events[i].event.startDate > sunday)
							events.splice(i, 1);
					} else if (type == 'thisWeekend') {
						if (events[i].event.startDate < friday || events[i].event.startDate > sunday)
							events.splice(i, 1);
					} else if (type == 'nextWeek') {
						if (events[i].event.startDate < sunday || events[i].event.startDate > sundayNextWeek)
							events.splice(i, 1);
					} else if (type) {
						if (global.date.local2server(events[i].event.startDate).indexOf(type) != 0)
							events.splice(i, 1);
					} else if (events[i].event.startDate > twoWeeks)
						events.splice(i, 1);
				}
			});
			user.set('searchEvents', pageSearch.events.fieldValues);
		}
	}
	static locations = {
		fieldValues: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input-checkbox label="search.favorites" name="favorites" value="true" ${v.favorites}></input-checkbox>
<label class="locationPicker" onclick="ui.navigation.openLocationPicker(event)">${geoData.getCurrent().town}</label>
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" value="${v.keywords}"/>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<dialogButtons>
<button-text class="defaultButton" onclick="pageSearch.locations.search()" label="search.action"></button-text>
</dialogButtons>
</form>`,
		getFields() {
			var v = {};
			if (pageSearch.locations.fieldValues.favorites)
				v.favorites = ' checked="true"';
			if (pageSearch.locations.fieldValues.keywords)
				v.keywords = pageSearch.locations.fieldValues.keywords;
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
			if (ui.q('search tabBody div.locations [name="favorites"][checked="true"]'))
				s += (s ? ' and ' : '') + 'locationFavorite.favorite=true';
			return s;
		},
		getSearch1(bounds) {
			var s = '';
			if (ui.q('search tabBody div.locations [name="matches"][checked="true"]'))
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
			var v = ui.q('search tabBody div.locations input-hashtags').getAttribute('text');
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
				webCall: 'pageSearch.locations.search',
				latitude: geoData.getCurrent().lat,
				longitude: geoData.getCurrent().lon,
				distance: -1,
				query: 'location_list',
				search: encodeURIComponent(pageSearch.locations.getSearch())
			}, pageLocation.listLocation, 'search tabBody>div.locations', 'search');
			user.set('searchLocations', pageSearch.locations.fieldValues);
		}
	}
	static init() {
		document.addEventListener('GeoLocation', function (event) {
			ui.html('search label.locationPicker', geoData.getCurrent().town);
		});
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
			formFunc.initFields(ui.q('search'));
		}
	}
	static repeatSearch() {
		var type = ui.q('search tabHeader tab.tabActive').getAttribute('i');
		ui.q('search div.' + type + ' [name="keywords"]').value = '';
		pageSearch[type].search();
	}
	static selectTab(id) {
		if (DialogHint.currentStep < 0)
			ui.navigation.closeHint();
		ui.css('search tabBody>div', 'opacity', 1);
		ui.on('search tabBody', 'transitionend', function () {
			ui.css('search tabBody>div:not(.' + id + ')', 'opacity', 0);
		}, true);
		ui.q('search tabBody').style.marginLeft = ((id == 'locations' ? 2 : id == 'contacts' ? 1 : 0) * -100) + '%';
		ui.classRemove('search tab', 'tabActive');
		ui.classAdd('search tab[i="' + (id ? id : 'events') + '"]', 'tabActive');
		ui.navigation.closeLocationPicker();
	}
	static swipeLeft() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == -200)
			ui.navigation.goTo('events');
		else if (x == -100)
			pageSearch.selectTab('locations');
		else
			pageSearch.selectTab('contacts');
	}
	static swipeRight() {
		var x = parseInt(ui.q('search tabBody').style.marginLeft) || 0;
		if (x == 0)
			ui.navigation.goTo('home', true);
		else if (x == -100)
			pageSearch.selectTab('events');
		else
			pageSearch.selectTab('contacts');
	}
}
