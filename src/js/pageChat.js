import { communication } from './communication';
import { details } from './details';
import { geoData } from './geoData';
import { global } from './global';
import { intro } from './intro';
import { lists } from './lists';
import { Chat, Contact, model } from './model';
import { pageContact } from './pageContact';
import { pageHome } from './pageHome';
import { pageInfo } from './pageInfo';
import { pageLocation } from './pageLocation';
import { pageSearch } from './pageSearch';
import { pageSettings } from './pageSettings';
import { pageWhatToDo } from './pageWhatToDo';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageChat };

class pageChat {
	static copyLink = '';
	static newChats = '';
	static oldCleverTip = '';
	static admin = { id: 3, image: '' };

	static templateInput = v =>
		global.template`<chatInput>
	<chatMoreButton style="display:none;" onclick="pageChat.scrollToBottom()">v v v</chatMoreButton>
	<chatButtons>
		<buttontext class="bgColor" onclick="pageChat.askLink()">${ui.l('share')}</buttontext>
		<buttontext class="bgColor" onclick="pageChat.askLocation()">${ui.l('chat.serviceLocation')}</buttontext>
		<buttontext class="bgColor" onclick="pageChat.askImage()">${ui.l('picture')}</buttontext>
		<buttontext class="bgColor quote" ${v.action}="pageChat.insertQuote(event);">${ui.l('quote')}</buttontext>
	</chatButtons>
	<textarea id="chatText" style="height:1.6em;" class="me" placeholder="${ui.l('chat.textHint')}"
		onkeyup="pageChat.adjustTextarea(this)">${v.draft}</textarea>
	<buttontext class="bgColor sendButton" ${v.action}="pageChat.sendChat(${v.id},null,event);">${ui.l('send')}</buttontext>
	<div style="display:none;text-align:center;"></div>
</chatInput>`;
	static templateMessage = v =>
		global.template`<chatMessage${v.class}><time${v.classUnseen}>${v.time}</time>${v.note}</chatMessage>`;

	static adjustTextarea(e) {
		ui.css(e, 'height', '1px');
		var h = e.scrollHeight;
		if (h > ui.emInPX * 6)
			h = ui.emInPX * 6;
		ui.css(e, 'height', (h + 6) + 'px');
		ui.css('chatConversation', 'bottom', (ui.q('chatInput').clientHeight + ui.emInPX / 2) + 'px');
	}
	static askLocation() {
		if (document.activeElement)
			document.activeElement.blur();
		if (geoData.localized) {
			var s = global.string.replaceInternalLinks(' :openPos(' + geoData.latlon.lat + ',' + geoData.latlon.lon + '): ');
			s = s.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCurrentLocationLink'), '<div style="text-align:center;margin-bottom:1em;"><div style="float:none;text-align:center;margin:1em 0;">' + s + '</div><buttontext class="bgColor" onclick="pageChat.insertLink()">' + ui.l('send') + '</buttontext></div>');
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
					s3 = global.string.replaceInternalLinks(' :open(' + s[i] + '): ').trim();
					s3 = s3.substring(0, s3.indexOf(' ')) + ' insertID="' + s[i] + '"' + s3.substring(s3.indexOf(' '));
					s2 += s3;
				}
			}
			if (c > 1)
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.toggleInsertCopyLinkEntry');
			else
				s2 = s2.replace(/onclick="ui.navigation.autoOpen/g, 'onclick="pageChat.doNothing');
			ui.navigation.openPopup(ui.l('chat.askInsertCopyLink' + (c > 1 ? 's' : '')), '<div style="text-align:center;margin:1em 0;">' + (c > 1 ? '<div id="askInsertCopyLinkHint">' + ui.l('chat.askInsertCopyLinksBody') + '</div>' : '') + '<div style="text-align:center;margin:1em 0;">' + s2 + '</div><buttontext class="bgColor" onclick="pageChat.insertLink(&quot;pressed&quot;)">' + ui.l('send') + '</buttontext></div>');
			ui.classAdd('popup .chatLinks', 'pressed');
		} else
			ui.navigation.openPopup(ui.l('attention'), ui.l('link.sendError').replace('{0}', '<br/><buttontext class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><br/>'));
	}
	static askImage() {
		if (document.activeElement)
			document.activeElement.blur();
		var popupVisible = ui.q('popupContent');
		ui.navigation.openPopup(ui.l('chat.sendImg'), '<form name="chatImg" action="saveChatImage" style="padding:0 2em;"><input type="hidden" name="contactId2" value="' + ui.q('chat').getAttribute('i') + '"><div style="padding:1em;"><input name="image" type="file"/></div><div style="text-align:center;margin-bottom:1em;"></form><buttontext onclick="pageChat.sendChatImage()" class="bgColor" id="popupSendImage"' + (global.isBrowser() ? '' : ' style="display:none;"') + '>' + ui.l('send') + '</buttontext></div>');
		if (!popupVisible && global.isBrowser()) {
			var e = ui.q('[name="image"]');
			if (e)
				e.click();
		}
	}
	static buttonChat() {
		var e = ui.q('buttonIcon.bottom.left');
		ui.buttonIcon(e, '<badgeChats>' + pageChat.newChats + '</badgeChats><img source="chat.svg" />', 'pageChat.toggleUserList()');
		if (pageChat.newChats)
			ui.classAdd(e, 'pulse highlight');
	}
	static chatAdjustScrollTop(i) {
		var e = ui.q('chatConversation');
		e.scrollTop = e.scrollTop + i;
	}
	static close(event, exec) {
		if (event) {
			var s = event.target.nodeName;
			if (event.target.onclick || event.target.onmousedown || s == 'TEXTAREA' || s == 'IMG' || s == 'NOTE')
				return;
		}
		var e = ui.q('chat');
		if (ui.cssValue(e, 'display') == 'none')
			return false;
		pageChat.saveDraft();
		ui.navigation.animation(e, 'slideUp', function () {
			ui.css(e, 'display', 'none');
			ui.html(e, '');
			ui.attr(e, 'i', null);
			ui.attr(e, 'type', null);
			var activeID = ui.navigation.getActiveID();
			if (activeID == 'contacts')
				pageContact.init();
			else if (activeID == 'locations')
				pageLocation.init();
			else if (activeID == 'info')
				pageInfo.init();
			else if (activeID == 'search')
				pageSearch.init();
			else if (activeID == 'whattodo')
				pageWhatToDo.init();
			else if (activeID == 'home')
				pageHome.init();
			else if (activeID == 'settings' || activeID == 'settings2' || activeID == 'settings3')
				pageSettings.init();
			if (exec && exec.call)
				exec.call();
		});
		return true;
	}
	static closeList() {
		var e = ui.q('chatUserList');
		if (ui.cssValue(e, 'display') != 'none')
			ui.toggleHeight(e);
	}
	static detailChat(l, id) {
		ui.html('chat > div', '<chatConversation></chatConversation>' + pageChat.templateInput({
			id: id,
			draft: formFunc.getDraft('chat' + id),
			action: global.getDevice() == 'computer' ? 'onclick' : 'onmousedown'
		}));
		ui.attr('chat', 'i', id);
		var v = ui.q('chatUserList [i="' + id + '"] badge');
		if (v) {
			v.innerText = 0;
			ui.css(v, 'display', 'none');
		}
		if (l.length > 1) {
			var date, s = '', d;
			for (var i = l.length - 1; i > 0; i--) {
				v = model.convert(new Chat(), l, i);
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
		} else if (ui.q('chat').getAttribute('type') == 'location') {
			v = new Chat();
			v.contactId = pageChat.admin.id;
			v.createdAt = new Date();
			v.type = 0;
			v.note = ui.l('chat.empty');
			v.imageList = pageChat.admin.image;
			v._pseudonym = pageChat.admin.pseudonym;
			var e = ui.q('chat[i="' + id + '"] chatConversation');
			e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
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
			return global.string.replaceInternalLinks(s);
		s = s.trim();
		s = s.replace(/</g, '&lt;');
		s = global.string.replaceLinks(s);
		s = s.replace(/\n/g, '<br/>');
		s = global.string.replaceEmoji(s);
		if (v.contactId == 3 && v.action)
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
	static init() {
		ui.css('main>buttonIcon', 'display', 'none');
	}
	static initActiveChats() {
		if (!pageChat.admin.image) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=3'),
				responseType: 'json',
				success(r) {
					pageChat.admin.image = r['contact.imageList'];
					pageChat.admin.pseudonym = r['contact.pseudonym'];
				}
			});
		}
		communication.ajax({
			url: global.server + 'db/list?query=contact_listChat&limit=0',
			responseType: 'json',
			progressBar: false,
			success(r) {
				pageChat.listActiveChats(r);
			}
		});
	}
	static insertQuote(event) {
		event.preventDefault();
		event.stopPropagation();
		communication.ajax({
			url: global.server + 'action/quotation',
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
		var s = '', e = ui.qa('popup .chatLinks' + (clazz ? '.' + clazz : ''));
		for (var i = 0; i < e.length; i++) {
			if (e[i].getAttribute('insertID'))
				s += ' :open(' + e[i].getAttribute('insertID') + '): ';
			else
				s += ' :openPos(' + geoData.latlon.lat + ',' + geoData.latlon.lon + '): ';
		}
		if (s)
			pageChat.sendChat(ui.q('chat').getAttribute('i'), s);
		ui.navigation.hidePopup();
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
			ui.html('popupHint', ui.l('link.sendError').replace('{0}', '<br/><buttontext class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><br/>'));
	}
	static listActiveChats(d) {
		var s = '';
		for (var i = 1; i < d.length; i++) {
			var v = model.convert(new Contact(), d, i);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/contact.svg';
			s += '<div onclick="pageChat.open(' + v.id + ')" i="' + v.id + '"><badge class="bgColor"' + (v._unseen > 0 ? ' style="display:block;"' : '') + '>' + v._unseen + '</badge><img src="' + v.image + '"' + (v.imageList ? '' : ' class="bgColor" style="padding:0.6em;"') + '/><span>' + v.pseudonym + '<br/>' + global.date.formatDate(v._maxDate) + '</span></div>';
		}
		ui.q('chatUserList').innerHTML = s;
	}
	static open(id, location) {
		if (id.indexOf && id.indexOf('_') > 0)
			id = id.substring(0, id.indexOf('_'));
		if (ui.q('chat[i="' + id + '"][type="' + (location ? 'location' : 'contact') + ']')) {
			pageChat.close();
			return;
		}
		communication.ajax({
			url: global.server + 'action/chat/' + (location ? true : false) + '/' + id + '/true',
			responseType: 'json',
			success(r) {
				if (!r || r.length < 1)
					return;
				ui.attr('chat', 'from', ui.navigation.getActiveID());
				var f = function () {
					var e = ui.q('chatUserList [i="' + id + '"] badge');
					ui.html(e, '0');
					ui.css(e, 'top', '-100%');
					e = ui.q('chat');
					ui.css(e, 'display', 'none');
					ui.attr(e, 'type', location ? 'location' : 'contact');
					ui.html(e, '<listHeader><img /><chatName></chatName><chatDate></chatDate></listHeader><div></div>');
					if (location) {
						ui.classAdd(e, 'location');
						var path = 'popup detail';
						if (!ui.q(path))
							path = 'detail';
						ui.html('chat listHeader chatName', ui.q(path + ' title').innerText);
						e = ui.q('chat listHeader img');
						ui.attr(e, 'src', ui.q(path + ' detailImg img').getAttribute('src'));
						if (e.getAttribute('src').indexOf('.svg') > 0) {
							ui.classAdd(e, 'bgColor');
							ui.css(e, 'padding', '0.6em');
						}
					} else {
						ui.classRemove(e, 'location');
						communication.ajax({
							url: global.server + 'db/one?query=contact_list&search=' + encodeURIComponent('contact.id=' + id),
							responseType: 'json',
							success(r2) {
								ui.attr('chat[i="' + id + '"] listHeader img', 'onclick', 'ui.navigation.autoOpen("' + global.encParam('p=' + id) + '",event)');
								ui.html('chat[i="' + id + '"] listHeader chatName', r2['contact.pseudonym']);
								if (r2['contact.imageList'])
									ui.attr('chat[i="' + id + '"] listHeader img', 'src', global.serverImg + r2['contact.imageList']);
								else {
									var e2 = ui.q('chat[i="' + id + '"] listHeader img');
									ui.attr(e2, 'src', 'images/contact.svg');
									ui.classAdd(e2, 'bgColor');
									ui.css(e2, 'padding', '0.6em');
								}
							}
						});
					}
					ui.navigation.hideMenu();
					ui.navigation.hidePopup();
					pageChat.closeList();
					pageChat.init();
					ui.off('chatConversation', 'scroll', pageChat.reposition);
					pageChat.detailChat(r, id);
					ui.on('chatConversation', 'scroll', pageChat.reposition);
					setTimeout(() => {
						ui.css('chat', 'display', 'block');
						pageChat.adjustTextarea(ui.q('#chatText'));
						var e = ui.q('chatConversation');
						if (e.children && e.children.length)
							e.scrollTop = e.children[e.children.length - 1].offsetTop;
						ui.navigation.animation('chat', 'slideDown');
					}, 50);
				}
				if (ui.cssValue('chat', 'display') == 'none')
					f.call();
				else
					pageChat.close(null, f);
			}
		});
	}
	static openGroup() {
		if (user.contact.groups == null) {
			pageContact.groups.getGroups(pageChat.openGroup);
			return;
		}
		if (user.contact.groups) {
			ui.navigation.hideMenu();
			var s = '<div class="smilyBox" style="margin-bottom:1em;"><buttontext onclick="pageChat.insertLinkInGroup()" class="bgColor" style="margin:1em;">' + ui.l('share') + '</buttontext><buttontext class="bgColor" onclick="pageChat.sendChatGroup()">' + ui.l('send') + '</buttontext></div>';
			var v = user.contact.chatTextGroups;
			if (!v) {
				v = ui.q('[name="groupdialog"]:checked');
				if (v)
					v = '\u0015' + v.value;
				else
					v = '';
			}
			v = v.split('\u0015');
			var g = user.contact.groups;
			for (var i = 1; i < v.length; i++)
				g = g.replace('value="' + v[i] + '"', 'value="' + v[i] + '" checked="checked"');
			ui.navigation.openPopup(ui.l('chat.groupTitle'), '<div style="text-align:center;padding:1em 2em;">' + g + '<br/><textarea placeholder="' + ui.l('chat.textHint') + '" style="height:20em;" id="groupChatText">' + v[0] + '</textarea>' + s + '<popupHint></popupHint></div>', 'pageChat.saveGroupText()');
		} else
			ui.navigation.openPopup(ui.l('chat.groupTitle'), lists.getListNoResults(ui.navigation.getActiveID(), 'noGroups'));
	}
	static postSendChatImage(r) {
		if (ui.q('chat').getAttribute('i') == r.contactId) {
			ui.q('[name="image"]').value = '';
			ui.navigation.hidePopup();
			setTimeout(function () {
				if (ui.q('chat[i="' + r.contactId + '"] chatConversation')) {
					communication.ajax({
						url: global.server + 'db/one?query=contact_chat&search=' + encodeURIComponent('chat.id=' + r.chatId),
						responseType: 'json',
						success(r2) {
							var e = document.createElement('div');
							e.innerHTML = pageChat.renderMsg(model.convert(new Chat(), r2));
							ui.q('chat[i="' + r.contactId + '"] chatConversation').insertBefore(e.children[0], null);
							pageChat.scrollToBottom();
						}
					});
				}
			}, 1000);
		}
	}
	static previewChatImage(e) {
		var e2 = ui.q('popupTitle');
		if (e2 && e2.innerHTML.indexOf(ui.l('chat.sendImg')) == 0)
			e2.innerHTML = e2.innerHTML.substring(0, e2.innerHTML.indexOf('<img')) + ' ' + e2.innerHTML.substring(e2.innerHTML.indexOf('<img'));
		ui.navigation.openPopup(ui.l('chat.sendImg'), '<rotate onclick="formFunc.image.rotate(this)">&#8635;</rotate><img name="imagepreview" class="chatImgPreview" onclick="formFunc.image.rotate(this)"/><br/><buttontext onclick="pageChat.sendChatImage()" class="bgColor" style="margin-top:1em;">' + ui.l('ready') + '</buttontext><div class="chatSendImgPrevHint" style="bottom:5.5em;"></div><div class="chatSendImgPrevHint"></div>', 'formFunc.image.remove(&quot;image&quot;)', false, function () {
			formFunc.image.previewInternal(e.files[0], e.getAttribute('name'));
		});
	}
	static refresh() {
		lists.data['chats'] = '';
		pageChat.initActiveChats();
		var e = ui.q('chat[i]');
		if (e) {
			var id = e.getAttribute('i');
			communication.ajax({
				url: global.server + 'action/chat/false/' + id + '/false',
				responseType: 'json',
				success(r) {
					if (ui.q('chat[i="' + id + '"] chatConversation')) {
						var e = ui.q('chat:not(.location)[i="' + id + '"] chatConversation');
						if (!e)
							return;
						var showButton = e.scrollTop + e.clientHeight < e.scrollHeight;
						for (var i = 1; i < r.length; i++) {
							var v = model.convert(new Chat(), r, i);
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
		}
	}
	static saveDraft() {
		var e = ui.q('#chatText');
		if (e)
			formFunc.saveDraft('chat' + ui.q('chat').getAttribute('i'), pageChat.oldCleverTip == e.value ? null : e.value);
	}
	static saveGroupText() {
		user.contact.chatTextGroups = ui.val('#groupChatText');
		var e = ui.qa('input[name="groupdialog"]:checked');
		for (var i = 0; i < e.length; i++)
			user.contact.chatTextGroups += '\u0015' + e[i].value;
	}
	static scrollToBottom() {
		var e = ui.q('chatConversation');
		if (e) {
			var e2 = ui.qa('chatConversation > *');
			if (e2.length) {
				ui.scrollTo(e, e2[e2.length - 1].offsetTop + e2[e2.length - 1].offsetHeight);
				e2 = ui.q('chatUserList [i="' + ui.q('chat').getAttribute('i') + '"] badge');
				ui.html(e2, '0');
				ui.css(e2, 'display', 'none');
			}
			e2 = ui.q('chatMoreButton');
			if (e2.style.display != 'none')
				ui.navigation.animation(e2, 'homeSlideOut', function () {
					ui.css(e2, 'display', 'none');
				});
		}
	}
	static sendChat(id, msg, event) {
		if (event)
			event.preventDefault();
		if (!msg) {
			formFunc.validation.filterWords(ui.q('#chatText'));
			if (ui.q('chat errorHint'))
				return;
			msg = ui.val('#chatText');
		}
		if (msg) {
			var v = {
				note: msg.replace(/</g, '&lt;')
			};
			if (ui.q('chat.location'))
				v.locationId = id;
			else
				v.contactId2 = id;
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: {
					classname: 'Chat',
					values: v
				},
				success(r) {
					if (ui.q('chat[i="' + id + '"] chatConversation')) {
						v.createdAt = new Date();
						v.id = r;
						v.contactId = user.contact.id;
						var e = ui.q('chat[i="' + id + '"] chatConversation');
						e.innerHTML = e.innerHTML + pageChat.renderMsg(v);
						pageChat.scrollToBottom();
						if (v.note) {
							ui.q('#chatText').value = '';
							pageChat.adjustTextarea(ui.q('#chatText'));
							formFunc.removeDraft('chat' + id);
						}
					}
					id = parseInt(id);
					pageChat.initActiveChats();
				}
			});
		}
	}
	static sendChatGroup() {
		var e = ui.qa('popup input[name="groupdialog"]:checked');
		var s = '';
		for (var i = 0; i < e.length; i++)
			s += ',' + e[i].value;
		if (s && ui.val('#groupChatText')) {
			communication.ajax({
				url: global.server + 'action/chatGroups',
				method: 'POST',
				body: 'groups=' + s.substring(1) + '&text=' + encodeURIComponent(ui.val('#groupChatText')),
				success() {
					ui.navigation.hidePopup();
					user.contact.chatTextGroups = '';
				}
			});
		} else
			ui.html('popupHint', ui.l('chat.groupNoInput'));
	}
	static sendChatImage() {
		if (formFunc.image.hasImage('image')) {
			var id = ui.q('chat').getAttribute('i');
			var v = formFunc.getForm('chatImg');
			v.classname = 'Chat';
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: v,
				success(chatId) {
					pageChat.postSendChatImage({ contactId: id, chatId: chatId, });
				}
			});
		} else
			ui.navigation.hidePopup();
	}
	static showScrollButton() {
		var e = ui.q('chatMoreButton');
		ui.css(e, 'display', 'block');
		ui.navigation.animation(e, 'homeSlideIn');
		ui.on('chatConversation', 'scroll', function () {
			ui.navigation.animation(e, 'homeSlideOut', function () {
				ui.css(e, 'display', 'none');
			});
		}, true);
	}
	static toggleInsertCopyLinkEntry(id) {
		var e = ui.q('popup [insertID="' + id + '"]');
		if (ui.classContains(e, 'pressed'))
			ui.classRemove(e, 'pressed');
		else
			ui.classAdd(e, 'pressed');
	}
	static toggleUserList() {
		if (ui.navigation.getActiveID() == 'detail') {
			var e = ui.q('detail card:last-child');
			pageChat.open(e.getAttribute('i'), e.getAttribute('type') == 'location');
		} else if (user.contact)
			ui.toggleHeight('chatUserList');
		else
			intro.openHint({ desc: 'chatDescription', pos: '0.5em,-4em', size: '80%,auto' });
	}
};
