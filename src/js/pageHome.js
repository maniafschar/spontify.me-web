import { bluetooth } from './bluetooth';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { initialisation } from './initialisation';
import { intro } from './intro';
import { Contact, Location, model } from './model';
import { pageChat } from './pageChat';
import { pageEvent } from './pageEvent';
import { formFunc, ui } from './ui';
import { user } from './user';

export { pageHome };

class pageHome {
	static badge = -1;
	static map;
	static template = v =>
		global.template`<homeHeader${v.logoSmall}>
	<img onclick="geoData.openLocationPicker(event)" source="logo"/>
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
	static goToSettings(event) {
		if (!ui.parents(event.target, 'hint'))
			ui.navigation.goTo('settings');
	}
	static init(force) {
		var e = ui.q('home');
		if (force || !ui.q('home teaser.events>div card')) {
			var v = {};
			if (user.contact) {
				if (user.contact.imageList)
					v.imgProfile = '<img src="' + global.serverImg + user.contact.imageList + '"/>';
				else
					v.imgProfile = '<img src="images/contact.svg" style="box-shadow:none;"/>';
				v.logoSmall = ' class="logoSmall"';
				v.name = user.contact.pseudonym;
				v.infoButton = ' noDisp';
				v.langButton = ' noDisp';
			} else {
				v.dispProfile = 'class="noDisp"';
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
			if (user.client > 1) {
				ui.q('home homeHeader svg>g.client>g.client image').setAttribute('x', 680);
				ui.q('home homeHeader svg>g.client>g.client image').setAttribute('width', 320);
				ui.q('home homeHeader svg>g.client>g.client text').setAttribute('x', 840);
			} else
				ui.classAdd('home homeHeader svg>g', 'loggedIn');
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
	static openHintDescription() {
	}
	static openLanguage(event) {
		event.stopPropagation();
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="padding:1em 0;"><buttontext class="bgColor' + (global.language == 'DE' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE">Deutsch</buttontext>' +
			'<buttontext class="bgColor' + (global.language == 'EN' ? ' favorite' : '') + '" onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN">English</buttontext></div>');
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