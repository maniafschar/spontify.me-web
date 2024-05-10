import { bluetooth } from '../bluetooth';
import { communication } from '../communication';
import { InputHashtags } from '../elements/InputHashtags';
import { VideoCall } from '../elements/VideoCall';
import { geoData } from '../geoData';
import { global } from '../global';
import { initialisation } from '../init';
import { ClientNews, Contact, model } from '../model';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { pageChat } from './chat';
import { pageEvent } from './event';

export { pageHome };

class pageHome {
	static badge = -1;
	static teaserMeta;
	static template = v =>
		global.template`<style>
homeHeader {
	position: relative;
	text-align: center;
	display: block;
	height: 45%;
}

homeHeader>svg {
	top: 20%;
	height: 80%;
	cursor: pointer;
	position: relative;
	display: inline-block;
}

homeHeader svg {
	fill: var(--text);
}

homeHeader>buttonIcon.left {
	left: 0;
}

homeHeader>buttonIcon.right {
	right: 0;
}

buttonIcon {
	top: 0;
	box-shadow: none;
	font-size: 1.4em;
}

buttonIcon span {
	line-height: 1.3;
	max-width: 4em;
	max-height: 4em;
	overflow: hidden;
	text-overflow: ellipsis;
	text-align: right;
}

homeBody {
	position: relative;
	width: 100%;
	display: block;
	height: 55%;
	overflow: hidden;
}

teaser {
	position: absolute;
	width: 100%;
	left: 0;
	opacity: 0;
	transition: all 0.4s ease-out;
	height: 38%;
	display: block;
}

teaser div {
	overflow-x: auto;
	overflow-y: hidden;
	white-space: nowrap;
	padding: 0.5em;
	position: absolute;
	height: 100%;
	width: 100%;
	top: 0;
}

teaser.contacts {
	top: 1em;
}

teaser.events {
	bottom: 2.2em;
}

teaser card {
	margin: 0 0.5em;
	border-radius: 0.5em;
	overflow: hidden;
	position: relative;
	display: inline-block;
	cursor: pointer;
	height: 100%;
	color: white;
	box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
}

teaser card img {
	height: 100%;
}

teaser card svg {
	height: 100%;
	padding: 1.6em;
	margin-top: -1.1em;
}

teaser card text {
	position: absolute;
	width: 100%;
	bottom: 0.25em;
	border-right: solid 0.5em transparent;
	border-left: solid 0.5em transparent;
	overflow: hidden;
	text-overflow: ellipsis;
	line-height: 1.2;
}

teaser title {
	margin-bottom: 0.25em;
	font-size: 1.3em;
	position: relative;
	z-index: 1;
}
</style>
<homeHeader>
	<buttonIcon class="statistics left${v.statsButton}" onclick="${v.statsOnclick}"><span>${v.statsLabel}</span></buttonIcon>
	<img onclick="${v.actionLogo}" source="logo"/>
	<buttonIcon onclick="ui.navigation.goTo(&quot;settings&quot;)" class="right${v.dispProfile}">
		${v.imgProfile}
	</buttonIcon>
	<buttonIcon class="right${v.langButton}" onclick="pageHome.openLanguage(event)">
		<span>${v.lang}</span>
	</buttonIcon>
</homeHeader>
<homeBody>
<teaser class="events">
	<div></div>
</teaser>
<teaser class="contacts">
	<div></div>
</teaser>
</homeBody>`;
	static templateNews = v =>
		global.template`<style>
news {
position: relative;
display: block;
overflow: hidden;
height: 100%;
border-radius: 0.5em;
}


news div {
width: 100%;
display: block;
padding-top: 1.5em;
position: relative;
height: 100%;
overflow: auto;
}

news card {
text-align: left;
position: relative;
display: block;
margin-bottom: 1.5em;
}

news card::after {
content: ' ';
display: block;
clear: both;
}

news card p {
background: rgba(255, 255, 255, 0.6);
padding: 0.75em 6% 0.75em  4%;
border-radius: 0 2em 0.5em 0;
max-width: 96%;
display: inline-block
}

news card date {
font-size: 0.7em;
display: block;
}

news card img {
width: 96%;
margin-left: 4%;
position: relative;
float: right;
margin-top: -1em;
border-radius: 0.5em 0 0 3em;
}
</style><news>
<div class="news">${v.news}</div>
</news>`;
	static clickNotification(action) {
		ui.navigation.autoOpen(action);
		if (action.indexOf('news=') != 0)
			pageHome.closeList();
	}
	static closeList() {
		var e = ui.q('notificationList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static closeNews() {
		if (user.contact)
			ui.navigation.closeHint();
		else
			ui.navigation.openHint({ desc: 'closeNews' + (global.config.club ? 'Club' : ''), pos: '2em,10em', size: '-2em,auto' });
	}
	static filterClose() {
		if (ui.q('dialog-hint input-checkbox[checked="true"]')) {
			ui.attr('dialog-hint input-checkbox', 'checked', 'false');
			pageHome.teaserEvents();
		}
		ui.navigation.closeHint();
	}
	static filterEvents() {
		var search = '', e = ui.qa('dialog-hint eventFilter:first-child input-checkbox[checked="true"]');
		for (var i = 0; i < e.length; i++)
			search += ' or location.town=\'' + e[i].getAttribute('value') + '\'';
		if (search)
			search = search.substring(4);
		e = ui.qa('dialog-hint eventFilter:last-child input-checkbox[checked="true"]');
		if (e.length) {
			search = search ? '(' + search + ') and (' : '(';
			for (var i = 0; i < e.length; i++) {
				var d = new Date(e[i].getAttribute('value'));
				d.setDate(d.getDate() + 1);
				search += 'event.startDate<=\'' + d.toISOString().substring(0, 10) + '\' and event.endDate>=\'' + e[i].getAttribute('value') + '\' or ';
			}
			search = search.substring(0, search.length - 4) + ')';
		}
		pageHome.teaserEvents(search);
	}
	static filterOpen() {
		var render = function () {
			var towns = '', dates = '';
			for (var i = 0; i < pageHome.teaserMeta.length; i++) {
				if (pageHome.teaserMeta[i].town && towns.indexOf('"' + pageHome.teaserMeta[i].town + '"') < 0)
					towns += '<input-checkbox onclick="pageHome.filterEvents()" value="' + pageHome.teaserMeta[i].town + '" label="' + pageHome.teaserMeta[i].town + '"></input-checkbox>';
				var d = global.date.formatDate(pageHome.teaserMeta[i].date);
				d = d.substring(0, d.lastIndexOf(' '));
				if (dates.indexOf('"' + d + '"') < 0)
					dates += '<input-checkbox onclick="pageHome.filterEvents()" value="' + global.date.local2server(pageHome.teaserMeta[i].date).substring(0, 10) + '" label="' + d + '"></input-checkbox>';
			}
			ui.navigation.openHint({
				desc: '<eventFilter style="margin-bottom:1em;">' + towns + '</eventFilter><eventFilter>' + dates + '</eventFilter>',
				pos: '2%,-35%', size: '96%,auto', hinkyClass: 'bottom', hinky: 'right:50%;margin-right:-1.5em;',
				onclose: 'pageHome.filterClose()',
				noLogin: true
			});
		}
		if (pageHome.teaserMeta)
			render();
		else
			communication.ajax({
				url: global.serverApi + 'action/teaser/meta',
				webCall: 'pageHome.filterOpen',
				responseType: 'json',
				error() { },
				success(l) {
					pageHome.teaserMeta = [];
					l = pageEvent.getCalendarList(l);
					var d = new Date();
					d.setDate(d.getDate() + 14);
					for (var i = 0; i < l.length; i++) {
						if (l[i].event.startDate < d)
							pageHome.teaserMeta.push({ town: l[i].town, date: l[i].event.startDate });
					}
					render();
				}
			});
	}
	static init(force) {
		var e = ui.q('home');
		if (!e) {
			setTimeout(function () { pageHome.init(force) }, 100);
			return;
		}
		if (force || !ui.q('home teaser.events>div card')) {
			var v = {
				actionLogo: global.config.club ? 'pageHome.openNews(null,event)' :
					user.contact ? (global.config.news ? 'ui.navigation.openLocationPicker(event,true)'
						: 'ui.navigation.goTo(&quot;settings&quot;)') : 'pageHome.openHint()'
			};
			v.statsButton = ' hidden';
			if (user.contact) {
				if (user.contact.imageList)
					v.imgProfile = '<img src="' + global.serverImg + user.contact.imageList + '"/>';
				else
					v.imgProfile = '<span>' + user.contact.pseudonym + '</span>';
				v.infoButton = ' hidden';
				v.langButton = ' hidden';
				if (user.contact.type == 'adminContent') {
					v.statsButton = '';
					v.statsOnclick = 'ui.navigation.goTo(&quot;content-admin-home&quot;)';
					v.statsLabel = 'Stats';
				}
			} else {
				v.dispProfile = ' hidden';
				v.lang = global.language;
			}
			if (global.config.news) {
				v.statsButton = '';
				v.statsOnclick = 'pageHome.openNews()';
				v.statsLabel = ui.l('home.news');
			}
			e.innerHTML = pageHome.template(v);
			formFunc.svg.replaceAll();
			initialisation.reposition();
			pageHome.teaserContacts();
			pageHome.teaserEvents();
			if (global.config.club) {
				var f = function () {
					var e = ui.q('home homeHeader svg text');
					if (e)
						e.innerHTML = ui.l('home.news').toLowerCase();
					else
						setTimeout(f, 100);
				}
				f();
				ui.css('home text.town', 'display', 'none');
			}
		}
		pageHome.initNotificationButton();
		if (user.contact)
			ui.html('home item.bluetooth text', ui.l(bluetooth.state == 'on' && user.contact.bluetooth ? 'bluetooth.activated' : 'bluetooth.deactivated'));
		formFunc.svg.replaceAll();
		pageHome.setLogoTown();
		ui.css('dialog-navigation item.search', 'display', user.contact ? '' : 'none');
		ui.css('dialog-navigation item.info', 'display', user.contact ? 'none' : '');
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
						v.image = 'src="' + global.serverImg + v.imageList + '"';
					else if (v.contactNotification.action.indexOf('news=') == 0)
						v.image = 'style="padding:0.4em;" src="images/logo.png" class="mainBG"';
					else
						v.image = 'source="contacts" class="mainBG"';
					s += '<div i="' + v.contactNotification.id + '" onclick="pageHome.clickNotification(&quot;' + v.contactNotification.action + '&quot;)" ' + (v.contactNotification.seen == 0 ? ' class="highlightBackground"' : '') + '><img ' + v.image + '/> <span>' + global.date.formatDate(v.contactNotification.createdAt) + ': ' + v.contactNotification.text + '</span></div > ';
				}
				e.innerHTML = s;
				formFunc.svg.replaceAll();
				if (ui.cssValue(e, 'display') == 'none')
					e.removeAttribute('h');
				pageHome.badge = ui.qa('notificationList .highlightBackground').length;
				pageHome.initNotificationButton();
				document.dispatchEvent(new CustomEvent('Notification', { detail: { action: 'refresh' } }));
			}
		};
		f.call();
	}
	static initNotificationButton() {
		if (pageHome.badge > 0)
			ui.classAdd('dialog-navigation buttonIcon.notifications', 'pulse highlight');
		else
			ui.classRemove('dialog-navigation buttonIcon.notifications', 'pulse highlight');
		if (ui.q('dialog-navigation badgeNotifications'))
			ui.q('dialog-navigation badgeNotifications').innerText = Math.max(pageHome.badge, 0);
	}
	static openHint() {
		if (!user.contact)
			ui.navigation.openHint({
				desc: ui.l('intro.description').replace(/\{0}/g, global.appTitle.substring(0, global.appTitle.indexOf(global.separator))),
				pos: '5%,8.5em', size: '90%,auto', hinkyClass: 'top', hinky: 'left:50%;'
			});
	}
	static openLanguage(event) {
		event.stopPropagation();
		ui.navigation.openPopup(ui.l('langSelect'),
			'<div style="padding:1em 0;"><button-text' + (global.language == 'DE' ? ' class="favorite"' : '') + ' onclick="initialisation.setLanguage(&quot;DE&quot;)" l="DE" label="Deutsch"></button-text>' +
			'<button-text' + (global.language == 'EN' ? ' class="favorite"' : '') + ' onclick="initialisation.setLanguage(&quot;EN&quot;)" l="EN" label="English"></button-text></div>');
	}
	static openNews(id, event) {
		if (event) {
			event.stopPropagation();
			event.preventDefault();
		}
		if (id)
			communication.ajax({
				url: global.serverApi + 'action/news?id=' + id,
				webCall: 'pageHome.openNews',
				responseType: 'json',
				success(r) {
					if (r && r.length > 1)
						ui.navigation.openHTML(model.convert(new ClientNews(), r, 1).url);
				}
			});
		else
			communication.ajax({
				url: global.serverApi + 'action/news' + (global.config.news && geoData.getCurrent().lon ? '?latitude=' + geoData.getCurrent().lat + '&longitude=' + geoData.getCurrent().lon : ''),
				webCall: 'pageHome.openNews',
				responseType: 'json',
				success(l) {
					pageHome.closeList();
					var v = {}, s = '';
					if (l) {
						for (var i = 1; i < l.length; i++) {
							var e = model.convert(new ClientNews(), l, i);
							var oc = e.url ? 'onclick="ui.navigation.openHTML(&quot;' + e.url + '&quot;)"' : '';
							s += oc ? '<card ' + oc + ' style="cursor:pointer;">' : '<card>';
							s += '<p' + (e.image || e.imgUrl ? ' style="padding-bottom:1.25em;">' : '>');
							if (global.date.server2local(e.publish) > new Date())
								s += '<date style="color:red;">' + global.date.formatDate(e.publish) + global.separator + ui.l('home.notYetPublished') + '</date>';
							else
								s += '<date>' + global.date.formatDate(e.publish) + (e.category && InputHashtags.ids2Text(e.category) ? global.separator + InputHashtags.ids2Text(e.category) : '') + (e.source ? global.separator + e.source : '') + '</date>';
							s += e.description.replace(/\n/g, '<br/>');
							s += '</p>'
							if (e.image)
								s += '<img src="' + global.serverImg + e.image + '"/>';
							s += '</card>'
						}
					}
					v.news = s ? s : '<card><p>' + ui.l('home.noNews' + (global.config.club ? 'Club' : '')).replace('{0}', geoData.getCurrent().town) + '</p></card>';
					if (ui.q('dialog-hint news'))
						ui.q('dialog-hint span').innerHTML = pageHome.templateNews(v);
					else
						ui.navigation.openHint({ desc: pageHome.templateNews(v), pos: '1em,1em', size: '-1em,-4em', onclick: 'return false', noLogin: true, onclose: 'pageHome.closeNews()', class: 'nopadding' });
				}
			});
	}
	static reset() {
		pageHome.badge = -1;
		ui.html('chatList', '');
		ui.html('notificationList', '');
		ui.html('home', '');
		ui.classRemove('dialog-navigation buttonIcon', 'pulse highlight');
		ui.q('dialog-navigation badgeChats').innerHTML = '';
		ui.q('dialog-navigation badgeNotifications').innerHTML = 0;
	}
	static setLogoTown() {
		var e = ui.q('home text.town');
		if (e)
			e.innerHTML = geoData.getCurrent().town.toLowerCase();
	}
	static teaserContacts() {
		communication.ajax({
			url: global.serverApi + 'action/teaser/contacts',
			webCall: 'pageHome.teaserContacts',
			responseType: 'json',
			error() {
				ui.q('home teaser.contacts>div').innerHTML = ui.l('error.noNetworkConnection');
				ui.css('home teaser.contacts', 'opacity', 1);
			},
			success(l) {
				if (l) {
					var s = '';
					for (var i = 1; i < l.length; i++) {
						var e = model.convert(new Contact(), l, i);
						s += '<card onclick="details.open(' + e.id + ',' + JSON.stringify({ webCall: 'pageHome.teaserContacts', query: 'contact_list' + (user.contact ? '' : 'Teaser'), search: encodeURIComponent('contact.id=' + e.id) }).replace(/"/g, '&quot;') + ',pageContact.detail)"><img src="' + global.serverImg + e.imageList + '"/><text>' + e.pseudonym + '</text></card>';
					}
					var e = ui.q('home teaser.contacts>div');
					e.innerHTML = s;
					ui.css('home teaser.contacts', 'opacity', 1);
					e.addEventListener('wheel', event => {
						if (event.deltaY)
							e.scrollBy({ left: event.deltaY });
					}, { passive: true });
				}
			}
		});
	}
	static teaserEvents(search) {
		communication.ajax({
			url: global.serverApi + 'action/teaser/events' + (search && typeof search == 'string' ? '?search=' + encodeURIComponent(search) : ''),
			webCall: 'pageHome.teaserEvents',
			responseType: 'json',
			error(e) { },
			success(l) {
				if (!l)
					return;
				var e = pageEvent.getCalendarList(l), s = '<card onclick="pageEvent.edit()" class="mainBG" style="color:var(--text)"><img source="add"/><text>' + ui.l('events.new').replace(' ', '<br/>') + '</text></card>';
				if (e.length > 25)
					e.splice(25, e.length);
				var dates = ui.qa('dialog-hint eventFilter:last-child input-checkbox[checked="true"]');
				var dateFiltered = function (e2) {
					if ('outdated' == e2)
						return true;
					if (!dates.length)
						return false;
					for (var i = 0; i < dates.length; i++) {
						if (e2.event.startDate.toISOString().indexOf(dates[i].getAttribute('value')) == 0)
							return false;
					}
					return true;
				}
				for (var i = 0; i < e.length; i++) {
					if (!dateFiltered(e[i]))
						s += '<card onclick="details.open(&quot;' + pageEvent.getId(e[i]) + '&quot;,' + JSON.stringify({
							webCall: 'pageHome.teaserEvents', query: 'event_list' + (user.contact ? '' : 'Teaser'), search: encodeURIComponent('event.id=' + e[i].event.id)
						}).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)"><img src="' + global.serverImg + (e[i].event.imageList ? e[i].event.imageList : e[i].imageList ? e[i].imageList : e[i].contact.imageList) + '"/><text>' + global.date.formatDate(e[i].event.startDate, 'noWeekday') + '<br/>' + e[i].event.description + '</text></card>';
				}
				e = ui.q('home teaser.events>div');
				e.innerHTML = s;
				ui.css('home teaser.events', 'opacity', 1);
				formFunc.svg.replaceAll();
				e.addEventListener('wheel', event => {
					if (event.deltaY)
						e.scrollBy({ left: event.deltaY });
				}, { passive: true });
			}
		});
	}
	static toggleNotification() {
		VideoCall.init();
		if (!user.contact)
			ui.navigation.openHint({ desc: 'notification', pos: '-0.5em,-7.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:0;' });
		else if (!ui.q('notificationList>div'))
			ui.navigation.openHint({ desc: 'notificationEmpty', pos: '-0.5em,-7.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'right:0;' });
		else {
			if (ui.q('notificationList').style.display == 'none')
				pageChat.closeList();
			ui.toggleHeight('notificationList');
		}
	}
}
document.addEventListener('Event', pageHome.teaserEvents);
document.addEventListener('GeoLocation', pageHome.setLogoTown);
document.addEventListener('Settings', function () { pageHome.init(true); });
