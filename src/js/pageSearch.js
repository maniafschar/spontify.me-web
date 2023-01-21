import { communication } from "./communication";
import { geoData } from "./geoData";
import { global } from "./global";
import { pageContact } from "./pageContact";
import { formFunc, ui } from "./ui";
import { user } from "./user";
import { lists } from "./lists";
import { Contact, model } from "./model";
import { pageEvent } from "./pageEvent";
import { pageLocation } from "./pageLocation";

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
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
	<input type="radio" name="gender" value="1" label="${ui.l('male')}" deselect="true" onclick="pageSearch.contacts.filterList()" ${v.gender1}/>
	<input type="radio" name="gender" value="2" label="${ui.l('female')}" deselect="true" onclick="pageSearch.contacts.filterList()" ${v.gender2}/>
	<input type="radio" name="gender" value="3" label="${ui.l('divers')}" deselect="true" onclick="pageSearch.contacts.filterList()" ${v.gender3}/>
	<filterSeparator></filterSeparator>
	<input type="checkbox" label="${ui.l('search.matches')}" name="matches" ${v.matches}/>
	<input type="checkbox" label="${ui.l('settings.guide')}" name="guide" onclick="pageSearch.contacts.filterList()" ${v.guide}/>
	<filterSeparator></filterSeparator>
	<input type="text" name="age" slider="range" min="18" max="99" id="age" ${v.age}/>
	<filterSeparator></filterSeparator>
	<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
	<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
	<errorHint></errorHint>
	<buttontext class="bgColor defaultButton" onclick="pageSearch.contacts.search()">${ui.l('search.action')}</buttontext></form>`,
		filterList() {
			var d = lists.data['contacts'];
			if (!d)
				return;
			var bu = ui.q(' filters [name="filterFriends"]:checked');
			if (bu)
				bu = bu.value;
			var ge = ui.q('contacts filters [name="gender"]:checked');
			if (ge)
				ge = ge.value;
			for (var i = 1; i < d.length; i++) {
				var e = model.convert(new Contact(), d, i);
				var match = (!ge || e.gender == ge) && (!bu || e.contactLink.status == 'Friends');
				e = ui.q('contacts [i="' + e.id + '"]');
				ui.attr(e, 'filtered', !match);
			}
			lists.execFilter();
		},
		getFields() {
			var v = {};
			if (pageSearch.contacts.filter.age)
				v.age = ' value="' + pageSearch.contacts.filter.age + '"';
			if (pageSearch.contacts.filter.keywords)
				v.keywords = ' value="' + pageSearch.contacts.filter.keywords + '"';
			if (pageSearch.contacts.filter.matches == 'on')
				v.matches = ' checked="true"';
			if (pageSearch.contacts.filter.guide == 'on')
				v.guide = ' checked="true"';
			v['gender' + pageSearch.contacts.filter.gender] = ' checked="true"';
			return pageSearch.contacts.template(v);
		},
		getMatches() {
			var search = '(' + global.getRegEx("contact.attr", user.contact.attrInterest) + ' or ' + global.getRegEx('contact.attrEx', user.contact.attrInterestEx) + ')';
			var sMale = '', sFemale = '', sDivers = '', sContactInterestedInMyGender = ' and contact.' + (user.contact.gender == 2 ? 'ageFemale' : user.contact.gender == 3 ? 'ageDivers' : 'ageMale') + ' like \'%,%\'';
			if (user.contact.ageMale && user.contact.ageMale != '18,99') {
				var s = user.contact.ageMale.split(','), s2 = '';
				if (s[0] > 18)
					s2 = 'contact.age>=' + s[0];
				if (s[1] < 99)
					s2 += (s2 ? ' and ' : '') + 'contact.age<=' + s[1];
				if (s2)
					sMale = '(contact.gender=1' + sContactInterestedInMyGender + ' and ' + s2 + ')';
			}
			if (!sMale && user.contact.ageMale)
				sMale = '(contact.gender=1' + sContactInterestedInMyGender + ')';
			if (user.contact.ageFemale && user.contact.ageFemale != '18,99') {
				var s = user.contact.ageFemale.split(','), s2 = '';
				if (s[0] > 18)
					s2 = 'contact.age>=' + s[0];
				if (s[1] < 99)
					s2 += (s2 ? ' and ' : '') + 'contact.age<=' + s[1];
				if (s2)
					sFemale = '(contact.gender=2' + sContactInterestedInMyGender + ' and ' + s2 + ')';
			}
			if (!sFemale && user.contact.ageFemale)
				sFemale = '(contact.gender=2' + sContactInterestedInMyGender + ')';
			if (user.contact.ageDivers && user.contact.ageDivers != '18,99') {
				var s = user.contact.ageDivers.split(','), s2 = '';
				if (s[0] > 18)
					s2 = 'contact.age>=' + s[0];
				if (s[1] < 99)
					s2 += (s2 ? ' and ' : '') + 'contact.age<=' + s[1];
				if (s2)
					sDivers = '(contact.gender=3' + sContactInterestedInMyGender + ' and ' + s2 + ')';
			}
			if (!sDivers && user.contact.ageDivers)
				sDivers = '(contact.gender=3' + sContactInterestedInMyGender + ')';
			if (sMale || sFemale || sDivers) {
				var s3 = sMale;
				if (sFemale)
					s3 += (s3 ? ' or ' : '') + sFemale;
				if (sDivers)
					s3 += (s3 ? ' or ' : '') + sDivers;
				search += ' and (' + s3 + ')';
			} else
				search += ' and (1=1)';
			return search;
		},
		getSearch() {
			var s = '', s2 = '';
			if (ui.q('search tabBody div.contacts [name="matches"]:checked'))
				s = ' and ' + pageSearch.contacts.getMatches();
			var v = ui.q('search tabBody div.contacts [name="gender"]:checked');
			if (v && v.checked)
				s += ' and contact.gender=' + v.value;
			if (ui.q('search tabBody div.contacts [name="guide"]:checked'))
				s += ' and contact.guide=1';
			v = ui.q('search tabBody div.contacts [name="age"]').value;
			if (v) {
				v = v.split(',');
				if (v[0] && v[0] > 18)
					s += ' and contact.age>=' + v[0];
				if (v[1] && v[1] < 99)
					s += ' and contact.age<=' + v[1];
			}
			v = ui.val('search tabBody div.contacts [name="keywords"]').trim();
			if (v) {
				v = v.replace(/'/g, '\'\'').split(' ');
				s += ' and (';
				for (var i = 0; i < v.length; i++) {
					if (v[i]) {
						s2 = v[i].trim().toLowerCase();
						var att = '';
						for (var i2 = 0; i2 < ui.attributes.length; i2++) {
							if (ui.attributes[i2].toLowerCase().indexOf(v[i].trim().toLowerCase()) > -1)
								att += 'contact.attr like \'%' + (i2 < 10 ? '00' : i2 < 100 ? '0' : '') + i2 + '%\' or ';
						}
						s += 'contact.idDisplay=\'' + s2 + '\' or (contact.search=1 and (LOWER(contact.aboutMe) like \'%' + s2 + '%\' or LOWER(contact.pseudonym) like \'%' + s2 + '%\')) or ';
						if (att)
							s += att;
					}
				}
				s = s.substring(0, s.length - 4) + ')';
			}
			return 'contact.id<>' + user.contact.id + s;
		},
		search() {
			pageSearch.contacts.filter = formFunc.getForm('search tabBody div.contacts form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=contact_list&search=' + encodeURIComponent(pageSearch.contacts.getSearch()), pageContact.listContacts, 'search tabBody>div.contacts', 'search');
			formFunc.saveDraft('searchContacts', pageSearch.contacts.filter);
		}
	}
	static events = {
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintEvent')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageSearch.events.search()">${ui.l('search.action')}</buttontext></form>`,
		getFields() {
			var v = {};
			var l = lists.data[ui.navigation.getActiveID()];
			if (pageSearch.events.filter.filterCategories) {
				var c = pageSearch.events.filter.filterCategories.split(global.separatorTech);
				for (var i = 0; i < c.length; i++)
					v['valueCat' + c[i]] = ' checked="true"';
			}
			if (pageSearch.events.filter.keywords)
				v.keywords = ' value="' + pageSearch.events.filter.keywords + '"';
			if (pageSearch.events.filter.matches == 'on')
				v.matches = ' checked="true"';
			return pageSearch.events.template(v);
		},
		getSearch() {
			var v = ui.val('search tabBody div.events [name="keywords"]').trim(), s = '';
			if (v) {
				var t = pageEvent.convertHashtags(v);
				v = t.hashtags.replace(/'/g, '\'\'').split(' ');
				for (var i = 0; i < v.length; i++) {
					if (v[i].trim()) {
						v[i] = v[i].trim().toLowerCase();
						var l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						s += '((contact.search=true or event.price>0) and (LOWER(contact.pseudonym' + l + 'contact.aboutMe' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') or '
						s += 'LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l + 'event.text' + l;
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') and ';
					}
				}
				if (s)
					s = '(' + s.substring(0, s.length - 5) + ')';
				if (t.category)
					s += (s ? ' and ' : '') + global.getRegEx('event.category', t.category);
			}
			return s;
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
			pageSearch.events.filter = formFunc.getForm('search tabBody div.events form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_listEvent&search=' + encodeURIComponent(pageSearch.events.getSearch()), pageEvent.listEvents, 'search tabBody>div.events', 'search');
			formFunc.saveDraft('searchEvents', pageSearch.events.filter);
		}
	}
	static locations = {
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="checkbox" label="${ui.l('search.favorites')}" name="favorites" ${v.favorites}/>
<filterSeparator></filterSeparator>
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageSearch.locations.search()">${ui.l('search.action')}</buttontext></form>`,
		getFields() {
			var v = {};
			if (pageSearch.locations.filter.favorites)
				v.favorites = ' checked="checked"';
			if (pageSearch.locations.filter.keywords)
				v.keywords = ' value="' + pageSearch.locations.filter.keywords + '"';
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
						s = s.substring(0, s.lastIndexOf(' or LOWER')) + ') and ';
					}
				}
				if (s)
					s = '(' + s.substring(0, s.length - 5) + ')';
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
			var e = ui.qa('locations filters [name="filterCategories"]:checked');
			if (e) {
				for (var i = 0; i < e.length; i++) {
					cats.push(e[i].value);
					c += 'category like \'%' + e[i].value + '%\' or ';
				}
			}
			if (c)
				s += (s ? ' and ' : '') + '(' + c.substring(0, c.length - 4) + ')';
			else {
				for (var i = 0; i < ui.categories.length; i++)
					cats.push(i);
			}
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
			pageSearch.locations.filter = formFunc.getForm('search tabBody div.locations form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent(pageSearch.locations.getSearch()), pageLocation.listLocation, 'search tabBody>div.locations', 'search');
			formFunc.saveDraft('searchLocations', pageSearch.locations.filter);
		}
	}
	static init() {
		if (!pageSearch.contacts.filter)
			pageSearch.contacts.filter = formFunc.getDraft('searchContacts') || {};
		if (!pageSearch.events.filter)
			pageSearch.events.filter = formFunc.getDraft('searchEvents') || {};
		if (!pageSearch.locations.filter)
			pageSearch.locations.filter = formFunc.getDraft('searchLocations') || {};
		var e = ui.q('search');
		if (!e.innerHTML) {
			e.innerHTML = pageSearch.template();
			pageSearch.selectTab('contacts');
		}
	}
	static selectTab(id) {
		var e = ui.q('search tabBody div.' + id);
		if (!e.innerHTML)
			e.innerHTML = pageSearch[id].getFields() + '<listResults></listResults>';
		formFunc.initFields('search');
		ui.q('search tabBody').style.marginLeft = ((id == 'contacts' ? 0 : id == 'events' ? 1 : 2) * -100) + '%';
		ui.classRemove('search tab', 'tabActive');
		ui.classAdd('search tab[i="' + id + '"]', 'tabActive');
	}
}