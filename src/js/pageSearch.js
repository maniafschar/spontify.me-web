import { communication } from './communication';
import { global } from './global';
import { lists } from './lists';
import { pageLocation } from './pageLocation';
import { pageContact } from './pageContact';
import { ui, formFunc } from './ui';
import { user } from './user';
import { geoData } from './geoData';
import { events } from './events';
import { pageChat } from './pageChat';

export { pageSearch };

class pageSearch {
	static templateSearch = v =>
		global.template`<searchInput style="padding:0 0.5em;">
	<field>
		<label style="padding-top:0.5em;">${ui.l('search.type')}</label>
		<value>
			<input name="searchType" type="radio" onchange="pageSearch.selectType()" ${v.typecontacts} value="contacts" label="${ui.l('contacts.title')}" />
			<input name="searchType" type="radio" onchange="pageSearch.selectType()" ${v.typelocations} value="locations" label="${ui.l('locations.title')}" />
			<input name="searchType" type="radio" onchange="pageSearch.selectType()" ${v.typeevents} value="events" label="${ui.l('events.title')}" />
		</value>
	</field>
	<location style="display:none;">
		<field>
			<label>${ui.l('category')}</label>
			<value>
				<input type="checkbox" name="searchCategories" ${v.categories0} value="0" label="${ui.categories[0].label}" />
				<input type="checkbox" name="searchCategories" ${v.categories1} value="1" label="${ui.categories[1].label}" />
				<input type="checkbox" name="searchCategories" ${v.categories2} value="2" label="${ui.categories[2].label}" />
				<input type="checkbox" name="searchCategories" ${v.categories3} value="3" label="${ui.categories[3].label}" />
				<input type="checkbox" name="searchCategories" ${v.categories4} value="4" label="${ui.categories[4].label}" />
				<input type="checkbox" name="searchCategories" ${v.categories5} value="5" label="${ui.categories[5].label}" />
			</value>
		</field>
		<field>
			<label>${ui.l('filter')}</label>
			<value>
				<input type="checkbox" label="${ui.l('search.matches')}" ${v.matchesOnly} name="searchMatchesOnly" />
			</value>
		</field>
	</location>
	<contact>
		<field>
			<label>${ui.l('gender')}</label>
			<value>
				<input type="radio" name="searchGender" ${v.gender1} value="1" label="${ui.l('male')}" deselect="true" />
				<input type="radio" name="searchGender" ${v.gender2} value="2" label="${ui.l('female')}" deselect="true" />
				<input type="radio" name="searchGender" ${v.gender3} value="3" label="${ui.l('divers')}" deselect="true" />
			</value>
		</field>
		<field>
			<label>${ui.l('search.age')}</label>
			<value style="height:3.7em;">
				<input type="text" id="searchAge" value="${v.age}" name="searchAge" slider="range" min="18" max="99" />
			</value>
		</field>
		<field>
			<label>${ui.l('filter')}</label>
			<value>
				<input type="checkbox" ${v.matchesOnly} label="${ui.l('search.matches')}" name="searchMatchesOnly" />
				<input type="checkbox" ${v.guide} label="${ui.l('settings.guide')}" name="searchGuide" />
			</value>
		</field>
	</contact>
	<field>
		<label>${ui.l('keywords')}</label>
		<value>
			<input type="text" name="searchKeywords" value="${v.keywords}" maxlength="100" />
			<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
		</value>
	</field>
	<dialogButtons style="margin-bottom:0;padding-left:0.5em;">
		<buttontext class="bgColor" onclick="pageSearch.saveSearch()" id="defaultButton">${ui.l('search.action')}</buttontext>
	</dialogButtons>
	<span class="error" style="text-align:center;display:block;padding:0 0 1em 0.5em;"></span>
</searchInput>`;
	static getFilterFields() {
		if (ui.q('search').getAttribute('type') == 'contacts')
			return pageContact.getFilterFields();
		return pageLocation.getFilterFields();
	}
	static getSearchContact() {
		var s = '', s2 = '';
		if (ui.q('searchInput contact [name="searchMatchesOnly"]:checked'))
			s = ' and ' + pageSearch.getSearchMatchesContact();
		var v = ui.q('searchInput [name="searchGender"]:checked');
		if (v && v.checked)
			s += ' and contact.gender=' + v.value;
		if (ui.q('searchInput [name="searchGuide"]:checked'))
			s += ' and contact.guide=1';
		v = ui.q('searchInput [name="searchAge"]').value;
		if (v) {
			v = v.split(',');
			if (v[0] && v[0] > 18)
				s += ' and contact.age>=' + v[0];
			if (v[1] && v[1] < 99)
				s += ' and contact.age<=' + v[1];
		}
		v = ui.val('searchInput [name="searchKeywords"]').trim();
		if (v) {
			v = v.split(' ');
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
	}
	static getSearchLocation() {
		var s = '';
		if (ui.q('searchInput location [name="searchMatchesOnly"]:checked'))
			s = pageSearch.getSearchMatchesLocation();
		var c = '', d = '';
		var cats = [];
		var e = ui.qa('searchInput [name="searchCategories"]:checked');
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
		var v = ui.val('searchInput [name="searchKeywords"]').trim();
		if (v) {
			v = v.split(' ');
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
					if (ui.val('searchInput [name="searchType"]:checked') == 'events')
						d += 'event.text' + l;
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
	}
	static getSearchMatchesContact() {
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
	}
	static getSearchMatchesLocation(categories) {
		var s = '';
		if (user.contact.budget)
			s += '(location.budget is null or location.budget=\'\' or REGEXP_LIKE(location.budget,\'' + user.contact.budget.replace(/\u0015/g, '|') + '\')=1) and (';
		else
			s += '(';
		for (var i = 0; i < ui.categories.length; i++) {
			if ((user.contact['attr' + i] || user.contact['attr' + i + 'Ex']) && (!categories || categories.indexOf(i) > -1))
				s += '(location.category like \'%' + i + '%\' and (' + global.getRegEx('location.attr' + i, user.contact['attr' + i]) + ' or ' +
					global.getRegEx('location.attr' + i + 'Ex', user.contact['attr' + i + 'Ex']) + ')) or ';
			else if (categories && categories.indexOf(i) > -1)
				s += '(location.category like \'%' + i + '%\') or ';
		}
		if (s.length < 2)
			return '';
		if (s.lastIndexOf(' or ') == s.length - 4)
			return s.substring(0, s.length - 4) + ')'
		return s.substring(0, s.length - 6);
	}
	static init() {
		if (!ui.q('search').innerHTML) {
			var v = {};
			if (user.contact.filter) {
				v['type' + (user.contact.filter.type ? user.contact.filter.type : 'contacts')] = 'checked="checked"';
				for (var i = 0; i < user.contact.filter.categories.length; i++)
					v['categories' + user.contact.filter.categories[i]] = 'checked=checked';
				if (user.contact.filter.matchesOnly)
					v.matchesOnly = 'checked=checked';
				if (user.contact.filter.guide)
					v.guide = 'checked=checked';
				v['gender' + user.contact.filter.gender] = 'checked=checked';
				v.keywords = user.contact.filter.keywords;
				v.age = user.contact.filter.age;
			} else
				v['typecontacts'] = 'checked="checked"';
			lists.setListDivs('search');
			var e = ui.q('search listBody');
			e.innerHTML = pageSearch.templateSearch(v) + e.innerHTML;
			formFunc.initFields('search');
			ui.css('search searchInput', 'display', 'block');
			pageSearch.selectType();
		}
		ui.css('main>buttonIcon', 'display', 'none');
		ui.buttonIcon('.bottom.center', 'home', 'ui.navigation.goTo("home")');
		ui.buttonIcon('.top.left', 'filter', 'lists.toggleFilter(event, pageSearch.getFilterFields)');
		pageChat.buttonChat();
	}
	static repeatSearch() {
		ui.q('[name="searchKeywords"]').value = '';
		pageSearch.saveSearch();
	}
	static saveSearch() {
		var f = ui.q('searchInput [name="searchAge"]');
		if (f.value != f.getAttribute('min') + ',' + f.getAttribute('max') && !user.contact.age) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('search.ageWithoutBDay') + '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('Yes') + '</buttontext>');
			return;
		}
		var s = {
			categories: [],
			type: ui.val('searchInput [name="searchType"]:checked'),
			matchesOnly: ui.q('searchInput>[style*="block"] [name="searchMatchesOnly"]:checked') ? true : false,
			keywords: ui.val('searchInput [name="searchKeywords"]'),
			gender: ui.val('searchInput [name="searchGender"]:checked'),
			age: ui.val('searchInput [name="searchAge"]'),
			guide: ui.val('searchInput [name="searchGuide"]:checked')
		};
		f = ui.qa('search [name="searchCategories"]:checked');
		for (var i = 0; i < f.length; i++)
			s.categories.push(f[i].value);
		user.save({ filter: JSON.stringify(s) },
			function () {
				user.contact.search = s;
				var lola = 'latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&';
				if (s.type == 'contacts')
					communication.loadList(lola + 'query=contact_list&search=' + encodeURIComponent(pageSearch.getSearchContact()), pageContact.listContacts, 'search', 'search');
				else if (s.type == 'locations')
					communication.loadList(lola + 'query=location_list&search=' + encodeURIComponent(pageSearch.getSearchLocation()), pageLocation.listLocation, 'search', 'search');
				else
					communication.loadList(lola + 'query=location_listEventCurrent&search=' + encodeURIComponent(pageSearch.getSearchLocation()), events.listEvents, 'search', 'search');
			});
	}
	static selectType() {
		if (ui.val('[name="searchType"]:checked') == 'contacts') {
			ui.css('search contact', 'display', 'block');
			ui.css('search location', 'display', 'none');
			ui.html('search explain', ui.l('search.hintContact'));
		} else {
			ui.css('search contact', 'display', 'none');
			ui.css('search location', 'display', 'block');
			ui.html('search explain', ui.l('locations.keywordsHint'));
		}
	}
};
