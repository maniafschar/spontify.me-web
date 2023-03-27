import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { Contact, ContactNews, Location, model } from './model';
import { pageChat } from './pageChat';
import { pageEvent } from './pageEvent';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static events;
	static news;
	static template = v =>
		global.template`<homeHeader${v.logoSmall}>
	<img onclick="${v.actionLogo}" source="logo"/>
	<text onclick="pageHome.goToSettings(event)" ${v.dispProfile}>
		${v.imgProfile}<br/>
		<name>${v.name}</name>
	</text>
	<buttonIcon class="language${v.langButton}" onclick="pageHome.openLanguage(event)">
		<span>${v.lang}</span>
	</buttonIcon>
</homeHeader>
<homeBody>
<teaser class="events">
	<title>${ui.l('events.title')}</title>
	<div></div>
	<buttonIcon onclick="pageEvent.edit()">+</buttonIcon>
</teaser>
<teaser class="contacts">
	<title>${ui.l('contacts.title')}</title>
	<div></div>
</teaser>
</homeBody>`;
	static templateNews = v =>
		global.template`<news><tabHeader>
<tab onclick="pageHome.selectTab('news')" i="news" class="tabActive">
${ui.l('home.news')}
</tab>
<tab onclick="pageHome.selectTab('events')" i="events">
${ui.l('events.title')}
</tab>
</tabHeader>
<tabBody>
<div class="news"><buttonIcon onclick="pageHome.editNews()"${v.hideEdit}>+</buttonIcon>${v.news}</div>
<div class="events"><buttonIcon onclick="pageEvent.edit()"${v.hideEdit}>+</buttonIcon>${v.events}</div>
</tabBody></news>`;
	static templateNewsEdit = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" value="${v.id}"/>
<field>
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value>
		<textarea name="description"></textarea>
	</value>
</field>
<field>
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value>
		<input name="image" type="file" />
	</value>
</field>
<field>
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value>
		<input name="url" />
	</value>
</field>
<field>
	<label style="padding-top:0;">${ui.l('events.location')}</label>
	<value>
		<input name="publish" type="datetime-local" placeholder="TT.MM.JJJJ HH:MM" value="${v.publish}" step="900" min="${v.today}T00:00:00" />
	</value>
</field>`;
	static clickNotification(id, action) {
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageHome.clickNotification(id,action)',
			method: 'PUT',
			body: {
				classname: 'ContactNotification',
				id: id,
				values: { seen: true }
			},
			success() {
				ui.navigation.autoOpen(action);
				communication.notification.close();
				communication.ping();
			}
		});
	}
	static closeList() {
		var e = ui.q('notificationList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static editNews(id) {
		var v = {};
		if (user.contact.type != 'adminClient')
			v.hideEdit = ' class="hidden"';
		ui.navigation.openPopup(ui.l(''), pageHome.templateNewsEdit(v));
	}
	static goToSettings(event) {
		if (!ui.parents(event.target, 'hint'))
			ui.navigation.goTo('settings');
	}
	static init(force) {
		var e = ui.q('home');
		if (force || !ui.q('home teaser.events>div card')) {
			var v = {
				actionLogo: 'geoData.openLocationPicker(event)'
			};
			if (user.contact) {
				if (user.contact.imageList)
					v.imgProfile = '<img src="' + global.serverImg + user.contact.imageList + '"/>';
				else
					v.imgProfile = '<img src="images/contact.svg" style="box-shadow:none;"/>';
				v.logoSmall = ' class="logoSmall"';
				v.name = user.contact.pseudonym;
				v.infoButton = ' hidden';
				v.langButton = ' hidden';
				if (user.clientId > 1)
					v.actionLogo = 'pageHome.openNews()';
			} else {
				v.dispProfile = 'class="hidden"';
				v.lang = global.language;
			}
			e.innerHTML = pageHome.template(v);
			initialisation.reposition();
			communication.ajax({
				url: global.serverApi + 'action/teaser/contacts',
				webCall: 'pageHome.init(force)',
				responseType: 'json',
				error() { },
				success(l) {
					var s = '';
					for (var i = 1; i < l.length; i++) {
						var e = model.convert(new Contact(), l, i);
						s += '<card onclick="details.open(' + e.id + ',' + JSON.stringify({ webCall: 'pageHome.init(force)', query: 'contact_list' + (user.contact ? '' : 'Teaser'), search: encodeURIComponent('contact.id=' + e.id) }).replace(/"/g, '&quot;') + ',pageContact.detail)"><img src="' + global.serverImg + e.imageList + '"/><text>' + e.pseudonym + '</text></card>';
					}
					ui.q('home teaser.contacts>div').innerHTML = s;
					ui.css('home teaser.contacts', 'opacity', 1);
				}
			});
			communication.ajax({
				url: global.serverApi + 'action/teaser/events',
				webCall: 'pageHome.init(force)',
				responseType: 'json',
				error(e) {
					ui.q('home teaser.events>div').innerHTML = ui.l('error.noNetworkConnection');
					ui.css('home teaser.events', 'opacity', 1);
				},
				success(l) {
					var s = '';
					var e;
					if (user.contact)
						e = pageEvent.getCalendarList(l);
					else {
						e = [];
						for (var i = 1; i < l.length; i++)
							e.push(model.convert(new Location(), l, i));
					}
					for (var i = 0; i < e.length; i++)
						s += '<card onclick="details.open(&quot;' + pageEvent.getId(e[i]) + '&quot;,' + JSON.stringify({
							webCall: 'pageHome.init(force)', query: 'event_list' + (user.contact ? '' : 'Teaser'), search: encodeURIComponent('event.id=' + e[i].event.id)
						}).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)"><img src="' + global.serverImg + (e[i].event.imageList ? e[i].event.imageList : e[i].imageList ? e[i].imageList : e[i].contact.imageList) + '"/><text>' + e[i].event.description + '</text></card>';
					ui.q('home teaser.events>div').innerHTML = s;
					ui.css('home teaser.events', 'opacity', 1);
				}
			});
		}
		pageHome.initNotificationButton();
		if (user.contact)
			ui.html('home item.bluetooth text', ui.l(bluetooth.state == 'on' && user.contact.bluetooth ? 'bluetooth.activated' : 'bluetooth.deactivated'));
		formFunc.image.replaceSVGs();
		if (user.contact) {
			if (user.clientId > 1) {
				ui.q('home homeHeader svg>g.client>g.client image').setAttribute('x', 680);
				ui.q('home homeHeader svg>g.client>g.client image').setAttribute('width', 320);
				ui.q('home homeHeader svg>g.client>g.client text').setAttribute('x', 840);
			} else {
				ui.classAdd('home homeHeader svg>g', 'loggedIn');
				ui.classRemove('home homeHeader svg>g', 'home');
			}
		}
		pageHome.updateLocalisation();
		ui.css('navigation item.search', 'display', user.contact ? '' : 'none');
		ui.css('navigation item.info', 'display', user.contact ? 'none' : '');
	}
	static initNotification(d) {
		var f = function () {
			var e = ui.q('notificationList');
			if (e.getAttribute("toggle"))
				setTimeout(f, 500);
			else {
				var s = '';
				for (var i = 1; i < d.length; i++) {
					var v = model.convert(new Contact(), d, i);
					if (i == 1 && ui.q('notificationList div[i="' + v.contactNotification.id + '"]')) {
						pageHome.badge = 0;
						pageHome.initNotificationButton();
						return;
					}
					if (v.imageList)
						v.image = global.serverImg + v.imageList;
					else
						v.image = 'images/contact.svg';
					s += '<div onclick="pageHome.clickNotification(' + v.contactNotification.id + ',&quot;' + v.contactNotification.action + '&quot;)" ' + (v.contactNotification.seen == 0 ? ' class="highlightBackground"' : '') + '><img src="' + v.image + '"' + (v.imageList ? '' : ' class="bgColor" style="padding:0.6em;"') + '/><span>' + global.date.formatDate(v.contactNotification.createdAt) + ': ' + v.contactNotification.text + '</span></div>';
				}

				e.innerHTML = s;
				if (ui.cssValue(e, 'display') == 'none')
					e.removeAttribute('h');
				pageHome.badge = ui.qa('notificationList .highlightBackground').length;
				pageHome.initNotificationButton();
			}
		};
		f.call();
	}
	static initNotificationButton() {
		if (pageHome.badge > 0)
			ui.classAdd('navigation buttonIcon.notifications', 'pulse highlight');
		else
			ui.classRemove('navigation buttonIcon.notifications', 'pulse highlight');
		if (ui.q('badgeNotifications'))
			ui.q('badgeNotifications').innerText = Math.max(pageHome.badge, 0);
	}
	static openLanguage(event) {
		event.stopPropagation();
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="padding:1em 0;"><buttontext class="bgColor' + (global.language == 'DE' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</buttontext>' +
			'<buttontext class="bgColor' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</buttontext></div>');
	}
	static openNews() {
		var render = function () {
			if (!pageHome.news || !pageHome.events)
				return;
			var v = {}, s = '';
			for (var i = 1; i < pageHome.news.length; i++) {
				var e = model.convert(new ContactNews(), pageHome.news, i);
				s += e.url ? '<news onclick="ui.navigation.openHTML(&quot;' + e.url + '&quot;)">' : '<news>';
				s += global.date.formatDate(e.publish);
				if (e.image)
					s += '<img src="' + global.serverImg + e.image + '"/>';
				s += e.description;
				s += '</news>'
			}
			v.news = s ? s : 'keine news';
			s = '';
			for (var i = 0; i < pageHome.events.length; i++) {
				var e = pageHome.events[i];
			}
			v.events = s ? s : 'keine events';
			intro.openHint({ desc: pageHome.templateNews(v), pos: '1em,1em', size: '-1em,auto', onclick: 'return false' });
		}
		if (!pageHome.news)
			communication.ajax({
				url: global.serverApi + 'db/list?query=contact_listNews&limit=25&search=' + encodeURIComponent('contactNews.publish<\'' + global.date.local2server(new Date()) + '\''),
				webCall: 'pageHome.openNews()',
				responseType: 'json',
				success(l) {
					pageHome.news = l;
					render();
				}
			});
		if (!pageHome.events) {
			var d = new Date();
			d.setDate(new Date().getDate() + 14);
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_list&search=' + encodeURIComponent('contact.type=\'clientAdmin\' and event.startDate<=\'' + global.date.local2server(d).substring(0, 10) + '\' and event.endDate>=\'' + global.date.local2server(new Date()).substring(0, 10) + '\''),
				webCall: 'pageHome.openNews()',
				responseType: 'json',
				success(l) {
					pageHome.events = pageEvent.getCalendarList(l);
					render();
				}
			});
		}
		render();
	}
	static reset() {
		pageHome.badge = -1;
		ui.html('chatList', '');
		ui.html('notificationList', '');
		ui.html('home', '');
		ui.classRemove('navigation buttonIcon', 'pulse highlight');
		ui.q('navigation buttonIcon.chats badgeChats').innerHTML = '';
		ui.q('navigation buttonIcon.notifications badgeNotifications').innerHTML = 0;
	}
	static selectTab(id) {
		ui.q('hint tabBody').style.marginLeft = (id == 'news' ? 0 : '-100%');
		ui.classRemove('hint tab', 'tabActive');
		ui.classAdd('hint tab[i="' + id + '"]', 'tabActive');
	}
	static toggleNotification() {
		if (!user.contact)
			intro.openHint({ desc: 'notification', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else if (!ui.q('notificationList>div'))
			intro.openHint({ desc: 'notificationEmpty', pos: '-0.5em,-7em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:1em;' });
		else {
			if (ui.q('notificationList').style.display == 'none')
				pageChat.closeList();
			ui.toggleHeight('notificationList');
		}
	}
	static updateLocalisation() {
		ui.html('home svg text.position', geoData.current.town);
	}
}