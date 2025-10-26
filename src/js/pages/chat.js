import { communication } from '../communication';
import { details } from '../details';
import { DialogPopup } from '../elements/DialogPopup';
import { VideoCall } from '../elements/VideoCall';
import { geoData } from '../geoData';
import { global, Strings } from '../global';
import { lists } from '../lists';
import { Contact, ContactChat, model } from '../model';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { groups, pageContact } from './contact';
import { pageEvent } from './event';
import { pageHome } from './home';
import { pageInfo } from './info';
import { pageSettings } from './settings';

export { pageChat };

class pageChat {
	static copyLink = '';
	static lastScroll = 0;
	static oldCleverTip = '';

	static template = v =>
		global.template`<listHeader>
	<chatName><img/><span></span></chatName>
	<chatDate></chatDate>
</listHeader>
<div>
	<chatConversation></chatConversation>
	<chatInput>
		<chatMoreButton style="display:none;" onclick="pageChat.scrollToBottom()">v v v</chatMoreButton>
		<closeHint>${ui.l('chat.closeHint')}</closeHint>
		<chatButtons>
			<button-text onclick="pageChat.askLink()" label="chat.share"></button-text>
			<button-text onclick="pageChat.askLocation()" label="chat.serviceLocation"></button-text>
			<button-text onclick="pageChat.askImage()" label="picture"></button-text>
			<button-text class="quote" ${v.action}="pageChat.insertQuote(event);" label="quote"></button-text>
		</chatButtons>
		<textarea id="chatText" style="height:1.6em;" class="me" placeholder="${ui.l('chat.textHint')}"
			onkeyup="pageChat.adjustTextarea(this)">${v.draft}</textarea>
		<button-text class="videoButton" ${v.action}="pageChat.video();" label="chat.videoPermissionButton"></button-text>
		<button-text class="sendButton" ${v.action}="pageChat.sendChat(${v.id},null,event);" label="chat.send"></button-text>
		<div style="display:none;text-align:center;"></div>
	</chatInput>
</div>`;
	static templateMessage = v =>
		global.template`<chatMessage${v.class}><time${v.classUnseen}>${v.time}</time>${v.note}</chatMessage>`;

	static adjustTextarea(e) {
		ui.adjustTextarea(e);
		ui.navigation.closeHint();
		ui.css('chatConversation', 'bottom', ui.q('chatInput').clientHeight + 'px');
	}
	static askLocation() {
		if (document.activeElement)
			document.activeElement.blur();
		if (geoData.localized) {
			var s = Strings.replaceInternalLinks(' :openPos(' + geoData.current.lat + ',' + geoData.current.lon + '): ');
			s = s.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCurrentLocationLink'), '<div style="text-align:center;margin-bottom:1em;"><div style="float:none;text-align:center;margin:1em 0;">' + s + '</div><button-text onclick="pageChat.insertLink()" label="chat.send"></button-text></div>');
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l('chat.serviceSendError'));
	}
	static askLink() {
		if (document.activeElement)
			document.activeElement.blur();
		if (pageChat.copyLink) {
			var s = pageChat.copyLink.split('\n'), s2 = '', c = 0, s3;
			for (var i = 0; i < s.length; i++) {
				if (s[i]) {
					c++;
					s3 = Strings.replaceInternalLinks(' :open(' + s[i] + '): ').trim();
					s3 = s3.substring(0, s3.indexOf(' ')) + ' insertID="' + s[i] + '"' + s3.substring(s3.indexOf(' '));
					s2 += s3;
				}
			}
			if (c > 1)
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.toggleInsertCopyLinkEntry');
			else
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCopyLink' + (c > 1 ? 's' : '')), '<div style="text-align:center;margin:1em 0;">' + (c > 1 ? '<div id="askInsertCopyLinkHint">' + ui.l('chat.askInsertCopyLinksBody') + '</div>' : '') + '<div style="text-align:center;margin:1em 0;">' + s2 + '</div><button-text onclick="pageChat.insertLink(&quot;pressed&quot;)" label="chat.send"></button-text></div>');
			ui.classAdd('dialog-popup .chatLinks', 'pressed');
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l('link.sendError').replace('{0}', '<br/><br/><button-text style="margin:1em;" label="chat.share"></button-text><br/><br/>'));
	}
	static askImage() {
		if (document.activeElement)
			document.activeElement.blur();
		var popupVisible = ui.q('dialog-popup popupContent');
		ui.navigation.openPopup(ui.l('chat.sendImg'), '<form><input type="hidden" name="contactId2" value="' + ui.q('chat').getAttribute('i') + '"><div style="margin:1em 0;"><input-image name="image"></input-image></div></form><div style="text-align:center;margin-bottom:1em;"><button-text onclick="pageChat.sendChatImage()" id="popupSendImage" style="display:none;" label="chat.send"></button-text></div>');
		if (!popupVisible && global.isBrowser()) {
			var e = ui.q('[name="image"]');
			if (e)
				e.click();
		}
	}
	static buttonChat() {
	}
	static chatAdjustScrollTop(i) {
		var e = ui.q('chatConversation');
		e.scrollTop = e.scrollTop + i;
	}
	static close(event, exec) {
		if (event) {
			var s = event.target.nodeName;
			if (event.target.onclick || event.target.onmousedown || s == 'TEXTAREA' || s == 'IMG' || s == 'NOTE' || s == 'INPUT')
				return;
		}
		ui.navigation.closeHint();
		ui.navigation.closePopup();
		var e = ui.q('chat');
		if (ui.cssValue(e, 'display') == 'none')
			return false;
		ui.css(e.getAttribute('from'), 'display', '');
		pageChat.saveDraft();
		ui.navigation.animation(e, 'slideUp', function () {
			ui.css(e, 'display', 'none');
			ui.html(e, '');
			ui.attr(e, 'i', null);
			var activeID = ui.navigation.getActiveID();
			if (activeID == 'contacts')
				pageContact.init();
			else if (activeID == 'events')
				pageEvent.init();
			else if (activeID == 'info')
				pageInfo.init();
			else if (activeID == 'home')
				pageHome.init();
			else if (activeID == 'detail')
				details.init();
			else if (activeID == 'settings')
				pageSettings.init();
			if (exec)
				exec();
		});
		return true;
	}
	static closeList() {
		var e = ui.q('chatList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static detailChat(l, id) {
		ui.attr('chat', 'i', id);
		var v;
		if (l.length > 1) {
			var date, s = '', d;
			for (var i = l.length - 1; i > 0; i--) {
				v = model.convert(new ContactChat(), l, i);
				d = global.date.formatDate(v.createdAt);
				d = d.substring(0, d.lastIndexOf(' '));
				if (date != d) {
					v.dateTitle = '<chatDateTitle>' + d + '</chatDateTitle>';
					date = d;
				}
				s += pageChat.renderMsg(v);
			}
			d = ui.q('chat[i="' + id + '"] chatConversation');
			d.innerHTML = d.innerHTML + s;
		}
		if (l.length < 3) {
			var e = ui.q('chatInput closeHint');
			e.style.display = 'block';
			e.style.transition = 'all 2s ease-out';
			setTimeout(function () {
				if (e && e.style)
					e.style.opacity = 0;
			}, 10000);
		}
		communication.ping();
	}
	static doCopyLink(event, id) {
		var s = global.encParam(id);
		if (pageChat.copyLink.indexOf(s) < 0)
			pageChat.copyLink = (pageChat.copyLink ? pageChat.copyLink + '\n' : '') + s;
		details.togglePanel(ui.q('detail text[name="' + event.target.getAttribute('name').replace('button', '').toLowerCase() + '"]'));
	}
	static doNothing() {
	}
	static formatTextMsg(v) {
		if (!v.note)
			return '';
		var s = v.note;
		if (s.indexOf(' :open') == 0 && s.lastIndexOf('): ') == s.length - 3)
			return Strings.replaceInternalLinks(s);
		s = s.trim();
		s = s.replace(/</g, '&lt;');
		s = Strings.replaceLinks(s);
		s = s.replace(/\n/g, '<br/>');
		s = Strings.replaceEmoji(s);
		if (v.contactId == user.clientId)
			s = Strings.markdown(s);
		if (v.action && v.action.indexOf('ui.startVideoCall(' + user.contact.id + ')') < 0)
			s = '<a onclick="' + v.action + '">' + s + '</a>';
		return s;
	}
	static getSelectionBoundary(el, start) {
		var originalValue, textInputRange, precedingRange, pos, bookmark;
		if (typeof el['selectionEnd'] == 'number')
			return el['selectionEnd'];
		else if (document.selection && document.selection.createRange) {
			el.focus();
			var range = document.selection.createRange();
			if (range) {
				if (document.selection.type == 'Text')
					range.collapse(!!start);
				originalValue = el.value;
				textInputRange = el.createTextRange();
				precedingRange = el.createTextRange();
				pos = 0;
				bookmark = range.getBookmark();
				textInputRange.moveToBookmark(bookmark);
				if (originalValue.indexOf('\r\n') > -1) {
					textInputRange.text = ' ';
					precedingRange.setEndPoint('EndToStart', textInputRange);
					pos = precedingRange.text.length - 1;
					document.execCommand('undo');
				} else {
					precedingRange.setEndPoint('EndToStart', textInputRange);
					pos = precedingRange.text.length;
				}
				return pos;
			}
		}
		return 0;
	}
	static initActiveChats() {
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listChat&limit=0',
			responseType: 'json',
			progressBar: false,
			webCall: 'chat.initActiveChats',
			success(r) {
				pageChat.listActiveChats(r);
			}
		});
	}
	static insertQuote(event) {
		try {
			event.stopPropagation();
			event.preventDefault();
		} catch (e) { }
		communication.ajax({
			url: global.serverApi + 'action/quotation',
			webCall: 'chat.insertQuote',
			success(r) {
				var e = ui.q('#chatText');
				var p = pageChat.getSelectionBoundary(e, false);
				var v = e.value;
				if (!v)
					v = '';
				else if (pageChat.oldCleverTip)
					v = v.replace(pageChat.oldCleverTip, '');
				v = v.substring(0, p) + r + v.substring(p);
				e.value = v;
				pageChat.adjustTextarea(e);
				pageChat.oldCleverTip = r;
			}
		});
	}
	static insertLink(clazz) {
		var s = '', e = ui.qa('dialog-popup .chatLinks' + (clazz ? '.' + clazz : ''));
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('insertID'))
				s += ' :open(' + e[i].getAttribute('insertID') + '): ';
			else
				s += ' :openPos(' + geoData.current.lat + ',' + geoData.current.lon + '): ';
		}
		if (s)
			pageChat.sendChat(ui.q('chat').getAttribute('i'), s);
		ui.navigation.closePopup();
	}
	static insertLinkInGroup() {
		var s = pageChat.copyLink.split('\n'), s2 = '';
		var e = ui.q('#groupChatText');
		var v = e.value;
		if (!v)
			v = '';
		for (var i = 0; i < s.length; i++) {
			if (s[i] && v.indexOf(' :open(' + s[i] + '): ') < 0)
				s2 += ' :open(' + s[i] + '): ';
		}
		if (s2) {
			var p = pageChat.getSelectionBoundary(e, false);
			v = v.substring(0, p) + s2 + v.substring(p);
			e.value = v;
		} else
			DialogPopup.setHint(ui.l('link.sendError').replace('{0}', '<br/><button-text style="margin:1em;" label="chat.share"></button-text><br/>'));
	}
	static listActiveChats(d) {
		var f = function () {
			var e = ui.q('chatList');
			if (e.getAttribute("toggle"))
				setTimeout(f, 500);
			else if (d && d.length) {
				var s = '';
				for (var i = 1; i < d.length; i++) {
					var v = model.convert(new Contact(), d, i);
					if (v.id == user.clientId)
						v.image = 'source="admin" class="admin"';
					else if (v.imageList)
						v.image = 'src="' + global.serverImg + v.imageList + '"';
					else
						v.image = 'source="contacts" class="mainBG"';
					if (v._maxDate.indexOf('.') > 0)
						v._maxDate = v._maxDate.substring(0, v._maxDate.indexOf('.'));
					s += '<div onclick="pageChat.open(' + v.id + ')" i="' + v.id + '"' + (v._unseen > 0 ? ' class="highlightBackground"' : v._unseen2 > 0 ? ' class="unseen"' : '') + '><img ' + v.image + '/><span>' + v.pseudonym
						+ '<br/>' + global.date.formatDate(v._maxDate) + '</span><img source="' + (v._contactId == user.contact.id ? 'chatOut' : 'chatIn') + '" class="read"/></div>';
				}
				e.innerHTML = s;
				if (ui.cssValue(e, 'display') == 'none')
					e.removeAttribute('h');
				formFunc.svg.replaceAll();
			}
		};
		f.call();
	}
	static open(id) {
		if (id.indexOf && id.indexOf('_') > 0)
			id = id.substring(0, id.indexOf('_'));
		var e = ui.q('chat[i="' + id + '"]');
		if (e) {
			if (ui.cssValue(e, 'display') == 'none') {
				pageChat.saveDraft();
				ui.html('chat', '');
			} else {
				pageChat.close();
				return;
			}
		}
		communication.ajax({
			url: global.serverApi + 'action/chat/' + id + '/true',
			responseType: 'json',
			webCall: 'chat.open',
			success(r) {
				if (!r || r.length < 1)
					return;
				ui.q('chat').removeAttribute('video');
				ui.attr('chat', 'from', ui.navigation.getActiveID());
				var f = function () {
					ui.html('chat', pageChat.template({
						id: id,
						draft: user.get('chat' + id),
						action: global.getDevice() == 'computer' ? 'onclick' : 'onmousedown'
					}));
					formFunc.initFields(ui.q('chatInput'));
					communication.ajax({
						url: global.serverApi + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + id),
						responseType: 'json',
						webCall: 'chat.open',
						success(r2) {
							if (r2) {
								ui.attr('chat[i="' + id + '"] listHeader chatName', 'onclick', 'ui.navigation.autoOpen("' + global.encParam('p=' + id) + '",event)');
								ui.html('chat[i="' + id + '"] listHeader chatName span', r2['contact.pseudonym']);
								var e2 = ui.q('chat[i="' + id + '"] listHeader img');
								if (r2['contact.id'] == user.clientId) {
									e2.setAttribute('source', 'admin');
									ui.classAdd(e2, 'admin');
								} else if (r2['contact.imageList'])
									e2.setAttribute('src', global.serverImg + r2['contact.imageList']);
								else {
									ui.attr(e2, 'source', 'contacts');
									ui.classAdd(e2, 'bgColor');
								}
								if (ui.cssValue('main', 'padding-top') && parseInt(ui.cssValue('main', 'padding-top')))
									e2.style.borderRadius = '0 2em 2em 0';
								formFunc.svg.replaceAll();
							}
						}
					});
					ui.navigation.closeMenu();
					ui.navigation.closePopup();
					pageChat.closeList();
					ui.off('chatConversation', 'scroll', pageChat.reposition);
					pageChat.detailChat(r, id);
					ui.on('chatConversation', 'scroll', pageChat.reposition);
					ui.css('chatConversation', 'opacity', 0);
					ui.navigation.animation('chat', 'slideDown',
						function () {
							pageChat.adjustTextarea(ui.q('#chatText'));
							var e = ui.q('chatConversation');
							if (e.children && e.children.length)
								e.scrollTop = e.children[e.children.length - 1].offsetTop;
							ui.css('chatConversation', 'opacity', 1);
						});
				}
				if (ui.cssValue('chat', 'display') == 'none')
					f();
				else
					pageChat.close(null, f);
			}
		});
	}
	static openGroup() {
		if (user.contact.groups == null) {
			groups.getGroups(pageChat.openGroup);
			return;
		}
		if (user.contact.groups) {
			ui.navigation.closeMenu();
			var s = '<div class="smilyBox" style="margin-bottom:1em;"><button-text onclick="pageChat.insertLinkInGroup()" style="margin:1em;" label="chat.share"></button-text><button-text onclick="pageChat.sendChatGroup()" label="chat.send"></button-text></div>';
			var v = user.contact.chatTextGroups;
			if (!v) {
				v = ui.q('input-checkbox[name="groupdialog"][checked="true"]');
				if (v)
					v = global.separatorTech + v.value;
				else
					v = '';
			}
			v = v.split(global.separatorTech);
			var g = user.contact.groups;
			for (var i = 1; i < v.length; i++)
				g = g.replace('value="' + v[i] + '"', 'value="' + v[i] + '" checked="true"');
			ui.navigation.openPopup(ui.l('chat.groupTitle'), '<div style="text-align:center;padding:1em 2em;">' + g + '<br/><textarea placeholder="' + ui.l('chat.textHint') + '" style="height:20em;" id="groupChatText">' + v[0] + '</textarea>' + s + '<popupHint></popupHint></div>', 'pageChat.saveGroupText()');
		} else
			ui.navigation.openPopup(ui.l('chat.groupTitle'), lists.getListNoResults(ui.navigation.getActiveID(), 'noGroups'));
	}
	static postSendChatImage(r) {
		if (ui.q('chat').getAttribute('i') == r.contactId) {
			ui.q('dialog-popup [name="image"]').value = '';
			ui.navigation.closePopup();
			setTimeout(function () {
				if (ui.q('chat[i="' + r.contactId + '"] chatConversation')) {
					communication.ajax({
						url: global.serverApi + 'db/one?query=contact_chat&search=' + encodeURIComponent('contactChat.id=' + r.chatId),
						responseType: 'json',
						webCall: 'chat.postSendChatImage',
						success(r2) {
							var e = document.createElement('div');
							e.innerHTML = pageChat.renderMsg(model.convert(new ContactChat(), r2));
							ui.q('chat[i="' + r.contactId + '"] chatConversation').insertBefore(e.children[0], null);
							pageChat.scrollToBottom();
						}
					});
				}
			}, 1000);
		}
	}
	static refresh() {
		pageChat.initActiveChats();
		var e = ui.q('chat[i]');
		if (e) {
			var id = e.getAttribute('i');
			communication.ajax({
				url: global.serverApi + 'action/chat/' + id + '/false',
				responseType: 'json',
				webCall: 'chat.refresh',
				success(r) {
					var e = ui.q('chat[i="' + id + '"] chatConversation');
					if (e) {
						var showButton = e.scrollTop + e.clientHeight < e.scrollHeight;
						for (var i = 1; i < r.length; i++) {
							var v = model.convert(new ContactChat(), r, i);
							var f = ui.q('chat chatMessage');
							if (ui.classContains(f, 'me'))
								ui.classAdd(f, 'following');
							e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
						}
						if (showButton)
							pageChat.showScrollButton();
						else
							pageChat.scrollToBottom();
					}
				}
			});
		}
	}
	static refreshActiveChat(unseen) {
		var e = ui.q('chat[i]');
		if (e && !unseen[e.getAttribute('i')])
			ui.classRemove('chat[i="' + e.getAttribute('i') + '"] .unseen', 'unseen');
	}
	static renderMsg(v) {
		var date = global.date.formatDate(v.createdAt);
		v.time = date.substring(date.lastIndexOf(' ') + 1);
		v.class = '';
		if (v.contactId == user.contact.id) {
			v.class = ' class="me"';
			if (!v.seen)
				v.classUnseen = ' class="unseen"';
		} else if (v._pseudonym) {
			v.oc = ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.contactId) + '&quot;,event)"';
			v.time = '<span' + v.oc + '>' + v._pseudonym + ' ' + v.time + '</span>';
		}
		if (v.image)
			v.note = '<note style="padding:0;"><img src="' + global.serverImg + v.image + '"/></note>';
		else
			v.note = '<note' + (v.oc ? v.oc : '') + '>' + pageChat.formatTextMsg(v) + '</note>';
		return (v.dateTitle ? v.dateTitle : '') + pageChat.templateMessage(v);
	}
	static reposition() {
		var e = ui.qa('chatDateTitle'), cc = ui.q('chatConversation');
		if (e.length && cc) {
			var date;
			for (var i = 0; i < e.length; i++) {
				if (cc.scrollTop < e[i].offsetTop && date)
					break;
				date = e[i].innerHTML;
			}
			ui.html('chat chatDate', date);
			e = ui.q('chatConversation');
			if (!e.lastChild || e.lastChild.offsetHeight + e.lastChild.offsetTop == e.scrollTop + e.offsetHeight)
				pageChat.lastScroll = new Date().getTime();
		}
	}
	static reset() {
		pageChat.copyLink = '';
		ui.html('chatList', '');
	}
	static saveDraft() {
		var e = ui.q('#chatText');
		if (e)
			user.set('chat' + ui.q('chat').getAttribute('i'), pageChat.oldCleverTip == e.value ? null : e.value);
	}
	static saveGroupText() {
		user.contact.chatTextGroups = ui.val('#groupChatText');
		var e = ui.qa('input-checkbox[name="groupdialog"][checked="true"]');
		for (var i = 0; i < e.length; i++)
			user.contact.chatTextGroups += global.separatorTech + e[i].value;
	}
	static scrollToBottom() {
		var e = ui.q('chatConversation');
		if (e) {
			var e2 = ui.qa('chatConversation > *');
			if (e2.length) {
				ui.scrollTo(e, e2[e2.length - 1].offsetTop + e2[e2.length - 1].offsetHeight);
				e2 = ui.q('chatList [i="' + ui.q('chat').getAttribute('i') + '"] badge');
				ui.html(e2, '0');
				ui.css(e2, 'display', 'none');
			}
			e2 = ui.q('chatMoreButton');
			if (!e2.style.marginRight)
				e2.style.marginRight = '-100%';
		}
	}
	static sendChat(id, msg, event) {
		if (event)
			try {
				event.preventDefault();
			} catch (e) { }
		if (!msg) {
			formFunc.validation.filterWords(ui.q('#chatText'));
			if (ui.q('chat errorHint'))
				return;
			msg = ui.val('#chatText');
		}
		if (msg) {
			var v = {
				note: msg.replace(/</g, '&lt;'),
				contactId2: id
			};
			communication.ajax({
				url: global.serverApi + 'db/one',
				method: 'POST',
				webCall: 'chat.sendChat',
				body: {
					classname: 'ContactChat',
					values: v
				},
				error(r) {
					r = JSON.parse(r.response);
					if (r.class == 'IllegalArgumentException' && r.msg == 'duplicate chat') {
						ui.q('#chatText').value = '';
						pageChat.adjustTextarea(ui.q('#chatText'));
						user.remove('chat' + id);
					} else
						communication.onError(r);
				},
				success(r) {
					var e = ui.q('chat[i="' + id + '"] chatConversation');
					if (e) {
						v.createdAt = new Date();
						v.id = r;
						v.contactId = user.contact.id;
						e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
						pageChat.scrollToBottom();
						if (v.note) {
							ui.q('#chatText').value = '';
							pageChat.adjustTextarea(ui.q('#chatText'));
							user.remove('chat' + id);
						}
					}
					pageChat.initActiveChats();
				}
			});
		}
	}
	static sendChatGroup() {
		var e = ui.qa('dialog-popup input-checkbox[name="groupdialog"][checked="true"]');
		var s = '';
		for (var i = 0; i < e.length; i++)
			s += ',' + e[i].value;
		if (s && ui.val('#groupChatText')) {
			communication.ajax({
				url: global.serverApi + 'action/chatGroups',
				method: 'POST',
				webCall: 'chat.sendChatGroup',
				body: 'groups=' + s.substring(1) + '&text=' + encodeURIComponent(ui.val('#groupChatText')),
				success() {
					ui.navigation.closePopup();
					user.contact.chatTextGroups = '';
					pageChat.initActiveChats();
				}
			});
		} else
			DialogPopup.setHint(ui.l('chat.groupNoInput'));
	}
	static sendChatImage() {
		if (ui.q('dialog-popup input-image').hasImage()) {
			var id = ui.q('chat').getAttribute('i');
			var v = formFunc.getForm('dialog-popup form');
			v.classname = 'ContactChat';
			communication.ajax({
				url: global.serverApi + 'db/one',
				method: 'POST',
				webCall: 'chat.sendChatImage',
				body: v,
				error(r) {
					r = JSON.parse(r.response);
					if (r.class != 'IllegalArgumentException' || r.msg != 'duplicate chat')
						communication.onError(r);
				},
				success(chatId) {
					pageChat.postSendChatImage({ contactId: id, chatId: chatId, });
					pageChat.initActiveChats();
				}
			});
		} else
			ui.navigation.closePopup();
	}
	static showScrollButton() {
		var e = ui.q('chatMoreButton');
		ui.css(e, 'display', 'block');
		ui.css(e, 'marginRight', null);
		ui.navigation.animation(e, 'homeSlideIn');
		ui.on('chatConversation', 'scroll', function () {
			ui.navigation.animation(e, 'deleteSlideOut', function () {
				ui.css(e, 'display', 'none');
			});
		}, true);
	}
	static toggleInsertCopyLinkEntry(id) {
		var e = ui.q('dialog-popup [insertID="' + id + '"]');
		if (ui.classContains(e, 'pressed'))
			ui.classRemove(e, 'pressed');
		else
			ui.classAdd(e, 'pressed');
	}
	static toggleUserList() {
		VideoCall.init();
		if (ui.q('chatList>div')) {
			if (ui.q('chatList').style.display == 'none')
				pageHome.closeList();
			ui.toggleHeight('chatList');
		} else if (user.contact)
			ui.navigation.openHint({ desc: 'chatEmpty', pos: '0.5em,-7.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1.5em;' });
		else
			ui.navigation.openHint({ desc: 'chatDescription', pos: '0.5em,-7.5em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:1.5em;' });
	}
	static video() {
		var id = ui.q('chat').getAttribute('i');
		communication.ajax({
			url: global.serverApi + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + id),
			responseType: 'json',
			webCall: 'chat.video',
			success(r) {
				if (r && (r['contactLink.status'] == 'Friends' || r['contactLink.status'] == 'Pending' && r['contactLink.contactId'] != user.contact.id))
					ui.startVideoCall(id);
				else if (r && r['contactLink.status'] == 'Pending')
					ui.navigation.openHint({ desc: ui.l('chat.videoPermissionHintPending'), pos: '2em,-9em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:50%;margin-left:-4em;' });
				else
					ui.navigation.openHint({ desc: ui.l('chat.videoPermissionHint') + '<br/><br/><button-text onclick="pageContact.sendRequestForFriendship(' + ui.q('chat').getAttribute('i') + ')" label="contacts.requestFriendship"></button-text>', pos: '2em,-9em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:50%;margin-left:-4em;' });
			}
		});
	}
}
document.addEventListener('Navigation', pageChat.closeList);
