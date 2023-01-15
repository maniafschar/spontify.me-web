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
	<tab onclick="pageSearch.selectTab('contact')" i="contact">
		${ui.l('contacts.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('event')" i="event">
		${ui.l('events.title')}
	</tab>
	<tab onclick="pageSearch.selectTab('location')" i="location">
		${ui.l('locations.title')}
	</tab>
</tabHeader>
<tabBody>
	<div class="contact"></div>
	<div class="event"></div>
	<div class="location"></div>
</tabBody>`;
	static contact = {
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
	<input type="radio" name="gender" value="1" label="${ui.l('male')}" deselect="true" onclick="pageSearch.contact.filterList()" ${v.gender1}/>
	<input type="radio" name="gender" value="2" label="${ui.l('female')}" deselect="true" onclick="pageSearch.contact.filterList()" ${v.gender2}/>
	<input type="radio" name="gender" value="3" label="${ui.l('divers')}" deselect="true" onclick="pageSearch.contact.filterList()" ${v.gender3}/>
	<filterSeparator></filterSeparator>
	<input type="checkbox" label="${ui.l('search.matches')}" name="matches" ${v.matches}/>
	<input type="checkbox" label="${ui.l('settings.guide')}" name="guide" onclick="pageSearch.contact.filterList()" ${v.guide}/>
	<filterSeparator></filterSeparator>
	<input type="text" name="age" slider="range" min="18" max="99" id="age" ${v.age}/>
	<filterSeparator></filterSeparator>
	<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
	<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
	<errorHint></errorHint>
	<buttontext class="bgColor defaultButton" onclick="pageSearch.contact.search()">${ui.l('search.action')}</buttontext></form>`,
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
			if (pageSearch.contact.filter.age)
				v.age = ' value="' + pageSearch.contact.filter.age + '"';
			if (pageSearch.contact.filter.keywords)
				v.keywords = ' value="' + pageSearch.contact.filter.keywords + '"';
			if (pageSearch.contact.filter.matches == 'on')
				v.matches = ' checked="true"';
			if (pageSearch.contact.filter.guide == 'on')
				v.guide = ' checked="true"';
			v['gender' + pageSearch.contact.filter.gender] = ' checked="true"';
			return pageSearch.contact.template(v);
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
			if (ui.q('search tabBody div.contact [name="matches"]:checked'))
				s = ' and ' + pageSearch.contact.getMatches();
			var v = ui.q('search tabBody div.contact [name="gender"]:checked');
			if (v && v.checked)
				s += ' and contact.gender=' + v.value;
			if (ui.q('search tabBody div.contact [name="guide"]:checked'))
				s += ' and contact.guide=1';
			v = ui.q('search tabBody div.contact [name="age"]').value;
			if (v) {
				v = v.split(',');
				if (v[0] && v[0] > 18)
					s += ' and contact.age>=' + v[0];
				if (v[1] && v[1] < 99)
					s += ' and contact.age<=' + v[1];
			}
			v = ui.val('search tabBody div.contact [name="keywords"]').trim();
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
			pageSearch.contact.filter = formFunc.getForm('search tabBody div.contact form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=contact_list&search=' + encodeURIComponent(pageSearch.contact.getSearch()), pageContact.listContacts, 'search tabBody>div.contact', 'search');
			formFunc.saveDraft('searchContacts', pageSearch.contact.filter);
		}
	}
	static event = {
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintEvent')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageSearch.event.search()">${ui.l('search.action')}</buttontext></form>`,
		getFields() {
			var v = {};
			var l = lists.data[ui.navigation.getActiveID()];
			if (pageSearch.event.filter.filterCategories) {
				var c = pageSearch.event.filter.filterCategories.split('\u0015');
				for (var i = 0; i < c.length; i++)
					v['valueCat' + c[i]] = ' checked="true"';
			}
			if (pageSearch.event.filter.keywords)
				v.keywords = ' value="' + pageSearch.event.filter.keywords + '"';
			if (pageSearch.event.filter.matches == 'on')
				v.matches = ' checked="true"';
			return pageSearch.event.template(v);
		},
		getSearch() {
			var v = ui.val('search tabBody div.event [name="keywords"]').trim(), s = '';
			if (v) {
				v = v.replace(/'/g, '\'\'').split(' ');
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
			}
			return s;
		},
		getSearch1(bounds) {
			var s = '';
			var c = '', d = '';
			var cats = [];
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
						var att = '', l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						for (var i2 = 0; i2 < cats.length; i2++) {
							for (var i3 = 0; i3 < ui.categories[cats[i2]].subCategories.length; i3++) {
								if (ui.categories[cats[i2]].subCategories[i3].toLowerCase().indexOf(v[i]) > -1)
									att += '(location.category like \'%' + cats[i2] + '%\' and location.attr' + cats[i2] + ' like \'%' + (i3 < 10 ? '00' : i3 < 100 ? '0' : '') + i3 + '%\') or ';
							}
						}
						d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						d = d.substring(0, d.lastIndexOf('LOWER'));
						if (att)
							d += att;
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
			pageSearch.event.filter = formFunc.getForm('search tabBody div.event form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_listEvent&search=' + encodeURIComponent(pageSearch.event.getSearch()), pageEvent.listEvents, 'search tabBody>div.event', 'search');
			formFunc.saveDraft('searchEvents', pageSearch.event.filter);
		}
	}
	static location = {
		filter: null,
		template: v =>
			global.template`<form onsubmit="return false">
<input type="checkbox" label="${ui.l('search.favorites')}" name="favorites" ${v.favorites}/>
<filterSeparator></filterSeparator>
<input type="text" name="keywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.keywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintLocation')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageSearch.location.search()">${ui.l('search.action')}</buttontext></form>`,
		getFields() {
			var v = {};
			if (pageSearch.location.filter.favorites)
				v.favorites = ' checked="checked"';
			if (pageSearch.location.filter.keywords)
				v.keywords = ' value="' + pageSearch.location.filter.keywords + '"';
			return pageSearch.location.template(v);
		},
		getSearch() {
			var s = '';
			var v = ui.val('search tabBody div.location [name="keywords"]').trim();
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
			if (ui.val('search tabBody div.location [name="favorites"]:checked'))
				s += (s ? ' and ' : '') + 'locationFavorite.favorite=true';
			return s;
		},
		getSearch1(bounds) {
			var s = '';
			if (ui.q('locations filters [name="matches"]:checked'))
				s = pageSearch.event.getMatches();
			var c = '', d = '';
			var cats = [];
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
						var att = '', l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
						for (var i2 = 0; i2 < cats.length; i2++) {
							for (var i3 = 0; i3 < ui.categories[cats[i2]].subCategories.length; i3++) {
								if (ui.categories[cats[i2]].subCategories[i3].toLowerCase().indexOf(v[i]) > -1)
									att += '(location.category like \'%' + cats[i2] + '%\' and location.attr' + cats[i2] + ' like \'%' + (i3 < 10 ? '00' : i3 < 100 ? '0' : '') + i3 + '%\') or ';
							}
						}
						d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
						d = d.substring(0, d.lastIndexOf('LOWER'));
						if (att)
							d += att;
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
			pageSearch.location.filter = formFunc.getForm('search tabBody div.location form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent(pageSearch.location.getSearch()), pageLocation.listLocation, 'search tabBody>div.location', 'search');
			formFunc.saveDraft('searchLocations', pageSearch.location.filter);
		}
	}
	static init() {
		if (!pageSearch.contact.filter)
			pageSearch.contact.filter = formFunc.getDraft('searchContacts') || {};
		if (!pageSearch.event.filter)
			pageSearch.event.filter = formFunc.getDraft('searchEvents') || {};
		if (!pageSearch.location.filter)
			pageSearch.location.filter = formFunc.getDraft('searchLocations') || {};
		var e = ui.q('search');
		if (!e.innerHTML) {
			e.innerHTML = pageSearch.template();
			pageSearch.selectTab('contact');
		}
	}
	static selectTab(id) {
		ui.classAdd('search tabBody>div', 'noDisp');
		var e = ui.q('search tabBody div.' + id);
		if (!e.innerHTML)
			e.innerHTML = pageSearch[id].getFields() + '<listResults></listResults>';
		formFunc.initFields('search');
		ui.classRemove('search tabBody div.' + id, 'noDisp');
		ui.classRemove('search tab', 'tabActive');
		ui.classAdd('search tab[i="' + id + '"]', 'tabActive');
	}
}