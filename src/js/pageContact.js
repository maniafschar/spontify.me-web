import { details } from './details';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageLocation } from './pageLocation';
import { formFunc, ui } from './ui';
import { user } from './user';
import { model, Contact, ContactGroupLink, ContactBlock, ContactGroup, ContactLink } from './model';

export { pageContact };

class pageContact {
	static templateList = v =>
		global.template`<row onclick="${v.oc}" i="${v.id}" class="contact${v.classFavorite}">
	<badge class="highlightBackground" style="display:${v._badgeDisp};" action="${v.badgeAction}">
		${v._badge}
	</badge>
	<div>
		<text>
			<title>${v.pseudonym}${v.birth}</title>
			${v._message}
		</text>
		<extra>${v.extra}</extra>
		<imagelist>
			<img src="${v.image}" class="${v.classBGImg}" />
			${lists.iconFavorite}
		</imagelist>
	</div>
	</row>`;
	static templateDetail = v =>
		global.template`${v.present}
<detailHeader>
	<detailImg>
		<img src="${v.image}" />
		<detailTitle>
			<title>
				${v.pseudonym}${v.ageDisplay}
			</title>
			<subtitle>
				${v.idDisplay}
			</subtitle>
		</detailTitle>
		<detailDistance>
			${v.gender}
			<km>${v.distance}</km>
		</detailDistance>
		<matchIndicator${v.matchIndicatorClass} onclick="pageContact.toggleMatchIndicatorHint(${v.id}, event)">
			<svg viewBox="0 0 36 36">
				<path class="circle-bg" d="M18 2.0845
					a 15.9155 15.9155 0 0 1 0 31.831
					a 15.9155 15.9155 0 0 1 0 -31.831"></path>
				<path class="circle" stroke-dasharray="${v.matchIndicatorPercent}, 100" d="M18 2.0845
					a 15.9155 15.9155 0 0 1 0 31.831
					a 15.9155 15.9155 0 0 1 0 -31.831"></path>
				<text x="18" y="21.35" class="percentage">${v.matchIndicator}</text>
			</svg>
		</matchIndicator>
	</detailImg>
</detailHeader>
<text${v.birthdayClass}>
	${v.birthday}
</text>
${v.attributes}
${v.budget}
${v.aboutMe}
<detailButtons style="margin-top:1em;">
	<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;p=${v.id}&quot;)">${ui.l('share')}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}${v.hideGroups}" name="buttonGroups"
		onclick="pageContact.groups.toggleGroups(${v.id})">${ui.l('group.action')}</buttontext>
	<buttontext class="bgColor${v.blocked}" name="buttonEvents"
		onclick="pageLocation.event.toggle(${v.id})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor${v.blocked}" name="buttonLocation"
		onclick="pageContact.toggleLocation(${v.id})">${ui.l('locations.title')}</buttontext>
</detailButtons>
<text name="matchIndicatorHint" class="popup" style="display:none;" onclick="ui.toggleHeight(this)">
	<div>${v.matchIndicatorHint}</div>
</text>
<text class="popup matchIndicatorAttributesHint" style="display:none;" onclick="ui.toggleHeight(this)">
	<div></div>
</text>
<text name="block" class="popup" style="display:none;right:1em;bottom:4em;position:fixed;" onclick="pageContact.closeFavorite(event)">
	<div>
		${v.buddy}
		<input type="radio" name="type" value="1" label="${ui.l('contacts.blockAction')}"
			onclick="pageContact.showBlockText()" checked="true" />
		<input type="radio" name="type" value="2" label="${ui.l('contacts.blockAndReportAction')}"
			onclick="pageContact.showBlockText()" />
		<br />
		<div style="display:none;margin-top:0.5em;">
			<input type="radio" name="reason" value="1" label="${ui.l('contacts.blockReason1')}" />
			<input type="radio" name="reason" value="2" label="${ui.l('contacts.blockReason2')}" />
			<input type="radio" name="reason" value="3" label="${ui.l('contacts.blockReason3')}" />
			<input type="radio" name="reason" value="4" label="${ui.l('contacts.blockReason4')}" />
			<input type="radio" name="reason" value="100" label="${ui.l('contacts.blockReason100')}" checked />
		</div>
		<textarea placeholder="${ui.l('contacts.blockDescHint')}" name="note" maxlength="250" style="display:none;"></textarea>
		<buttontext onclick="pageContact.block()" style="margin-top:0.5em;"
			class="bgColor">${ui.l('save')}</buttontext>
	</div>
</text>
<text name="events" class="collapsed"></text>
<text name="groups" class="collapsed">
	<detailTogglePanel></detailTogglePanel>
	<buttontext onclick="pageContact.groups.addGroup(${v.id})" class="bgColor" style="margin-top:1em;">${ui.l('group.newButton')}</buttontext>
</text>
<text name="copy" class="collapsed">
	<detailTogglePanel>${ui.l('copyLinkHint.contacts')}<br />
		<buttontext onclick="pageInfo.socialShare()" style="margin-top:2em;${v.displaySocialShare}"
			class="bgColor">
			${ui.l('sendSocialShareLocation')}
		</buttontext>
	</detailTogglePanel>
</text>
<text name="location" class="collapsed" style="padding:0;"></text>`;
	static templateGroups = v =>
		global.template`<div>
    ${v.groups}
</div>
<buttontext style="margin-top:0.5em;" class="bgColor" onclick="pageContact.groups.showRename()">
    ${ui.l('rename')}
</buttontext>
<buttontext style="margin-top:0.5em;" class="bgColor"
    onclick="document.getElementById(&quot;groupsRename&quot;).style.display=&quot;none&quot;;var e=document.getElementById(&quot;groupsDelete&quot;).style;e.display=e.display==&quot;none&quot;?&quot;&quot;:&quot;none&quot;;">
    ${ui.l('delete')}
</buttontext>
<buttontext style="margin-top:0.5em;" class="bgColor" onclick="pageChat.openGroup()">
    ${ui.l('chat.groupTitle')}
</buttontext>
<br />
<div id="groupsRename" style="display:none;margin-top:2em;">
    <input type="text" style="width:40%;margin-right:0.5em;float:none;" />
    <buttontext onclick="pageContact.groups.rename()" class="bgColor">${ui.l('save')}</buttontext>
</div>
<buttontext onclick="pageContact.groups.delete()" id="groupsDelete" style="display:none;margin-top:2em;"
    class="bgColor">
    ${ui.l('confirmDelete')}
</buttontext>`;
	static addWTDMessage(v) {
		if (v.message_keywords) {
			var msg = 'wtd:' + v.message_keywords + '|';
			if (v.message_locationId)
				msg += v.message_locationId + '|';
			var time = global.date.formatDate(v.message_time);
			time = time.substring(time.lastIndexOf(' ') + 1);
			v._message1 = global.string.replaceNewsAdHoc(msg + time);
		}
	}
	static ageFromSelected(e) {
		var t = ui.qa('[name="filterConAgeTo"]');
		for (var i = 0; i < t.length; i++) {
			if (t[i].checked) {
				if (t[i].getAttribute('label') <= e) {
					t[i].checked = false;
					for (i++; i < t.length; i++) {
						if (t[i].getAttribute('label') > e) {
							t[i].checked = true;
							break;
						}
					}
				}
				break;
			}
		}
	}
	static ageToSelected(e) {
		var t = ui.qa('[name="filterConAgeFrom"]');
		for (var i = t.length - 1; i >= 0; i--) {
			if (t[i].checked) {
				if (t[i].getAttribute('label') >= e) {
					t[i].checked = false;
					for (i--; i >= 0; i--) {
						if (t[i].getAttribute('label') < e) {
							t[i].checked = true;
							break;
						}
					}
				}
				break;
			}
		}
	}
	static block() {
		var path = 'detail [name="block"]';
		formFunc.resetError(ui.q(path + ' [name="note"]'));
		var bi = ui.q(path).getAttribute('blockID');
		if (ui.q(path + ' [name="type"]').checked)
			pageContact.blockUser(bi, 0, '');
		else {
			var n = ui.q(path + ' [name="note"]');
			if (!n.value && ui.q(path + ' [name="reason"][value="100"]:checked')) {
				formFunc.setError(n, 'contacts.blockActionHint');
				return;
			}
			pageContact.blockUser(bi, ui.val(path + ' [name="reason"]:checked'), n.value);
		}
	}
	static blockUser(blockID, reason, note) {
		var v = {
			classname: 'ContactBlock',
			values: {
				contactId2: ui.q('detail').getAttribute('i'),
				reason: reason,
				note: note
			}
		};
		var id = ui.q('detail').getAttribute('i');
		if (blockID > 0)
			v.id = blockID;
		communication.ajax({
			url: global.server + 'db/one',
			responseType: 'json',
			method: blockID > 0 ? 'PUT' : 'POST',
			body: v,
			success() {
				if (ui.q('popupContent'))
					ui.navigation.hidePopup();
				else {
					var e = ui.q('contacts [i="' + id + '"]');
					if (e) {
						e.outerHTML = '';
						lists.setListHint('contacts');
					}
					ui.navigation.goTo('contacts');
					var e = lists.data['contacts'];
					if (e) {
						for (var i = 1; i < e.length; i++) {
							if (model.convert(new ContactBlock(), e, i).id == id) {
								e.splice(i, 1);
								break;
							}
						}
					}
				}
			}
		});
	}
	static closeFavorite(event) {
		var e = event.target;
		if (e.nodeName != 'TEXTAREA' && e.nodeName != 'INPUT') {
			while (e && e.getAttribute) {
				if (e.getAttribute('onclick') && e.nodeName != 'TEXT')
					return;
				e = e.parentNode;
			}
			ui.toggleHeight(ui.q('detail [name="block"]'));
		}
	}
	static confirmFriendship(linkId, status, id) {
		communication.ajax({
			url: global.server + 'db/one',
			method: 'PUT',
			body: { classname: 'ContactLink', id: linkId, values: { status: status } },
			success() {
				ui.toggleHeight(ui.q('detail [name="block"]'));
				communication.ping();
				var e = ui.qa(ui.q('detail').getAttribute('list') + ' row[i="' + id + '"] badge');
				ui.html(e, '');
				ui.css(e, 'display', 'none');
				if (status == 'Friends') {
					ui.classAdd('main>#buttonFavorite', 'highlight');
					ui.classRemove('detail[i="' + id + '"] [name="buttonGroups"]', 'noDisp');
				} else {
					ui.classRemove('main>#buttonFavorite', 'highlight');
					ui.classAdd('detail[i="' + id + '"] [name="buttonGroups"]', 'noDisp');
				}
			}
		});
	}
	static detail(v, id) {
		v = model.convert(new Contact(), v);
		var idIntern = id;
		if (idIntern.indexOf && idIntern.indexOf('_') > -1)
			idIntern = idIntern.substring(0, idIntern.indexOf('_'));
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
		v.birthday = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
		v.classBGImg = 'class="bgColor"';
		if (v.birthday[0]) {
			if (v.age)
				v.ageDisplay = ' (' + v.age + ')';
			if (v.birthday[1]) {
				v.birthday = ui.l('contacts.birthdayToday') + '<br/>' + v.birthday[0];
				v.birthdayClass = ' class="highlightColor"';
			} else
				v.birthday = v.birthday[0];
		} else
			v.birthday = '';
		v.buddy = '<div style="margin:0 0 1em 0;padding-bottom:1em;position:relative;" class="borderBottom">';
		if (v.contactLink.id) {
			if (v.contactLink.status == 'Pending') {
				if (v.contactLink.contactId != user.contact.id)
					v.buddy += '<div style="margin-bottom:0.5em;">' + ui.l('contacts.requestFriendshipHint') + '</div><buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + id + ')" style="margin:0 0.5em;">' + ui.l('contacts.requestFriendshipConfirm') + '</buttontext><buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Rejected&quot;,' + id + ');" style="margin:0 0.5em;">' + ui.l('contacts.requestFriendshipReject') + '</buttontext>';
				else
					v.buddy += '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
			} else if (v.contactLink.status == 'Friends')
				v.buddy += '<buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;' + (v.contactLink.contactId == user.contact.id ? 'Terminated' : 'Terminated2') + '&quot;,' + id + ')">' + ui.l('contacts.terminateFriendship') + '</buttontext>';
			else if (v.contactLink.status == 'Terminated' && v.contactLink.contactId == user.contact.id || v.contactLink.status == 'Terminated2' && v.contactLink.contactId2 == user.contact.id)
				v.buddy += '<buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + id + ')">' + ui.l('contacts.requestFriendshipRestart') + '</buttontext>';
			else
				v.buddy += ui.l('contacts.requestFriendshipCanceled');
		} else
			v.buddy += '<buttontext class="bgColor" onclick="pageContact.sendRequestForFriendship(' + idIntern + ');">' + ui.l('contacts.requestFriendship') + '</buttontext>';
		v.buddy += '</div>';
		pageContact.addWTDMessage(v);
		if (!details.getNextNavElement(true, v.id))
			v.hideNext = 'display:none;';
		if (!details.getNextNavElement(false, v.id))
			v.hidePrevious = 'display:none;';
		v.attr = ui.getAttributes(v, 'detail');
		v.budget = v.attr.budget.toString();
		v.attributes = v.attr.textAttributes();
		if (v.gender) {
			if (v.age && v.attr.totalMatch) {
				var a;
				if (v.gender == 1)
					a = user.contact.ageMale;
				else if (v.gender == 2)
					a = user.contact.ageFemale;
				else
					a = user.contact.ageDivers;
				if (a && v.age >= parseInt(a.split(',')[0]) && v.age <= parseInt(a.split(',')[1]))
					v.matchIndicatorClass = ' class="pulse"';
			}
			v.gender = '<img src="images/gender' + v.gender + '.svg" />';
		}
		if (v.attr.totalMatch) {
			v.matchIndicator = v.attr.totalMatch + '/' + v.attr.total;
			v.matchIndicatorPercent = parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5);
		} else
			v.matchIndicatorPercent = 0;
		v.matchIndicatorHint = ui.l('contacts.matchIndicatorHint').replace('{0}', v.attr.totalMatch).replace('{1}', v.attr.total).replace('{2}', v.matchIndicatorPercent);
		if (v.matchIndicatorClass)
			v.matchIndicatorHint += '<br/>' + ui.l('contacts.matchIndicatorHintPulse');
		v.hideGroups = v.contactLink.status == 'Friends' ? '' : ' noDisp';
		v.hideMe = user.contact.id == v.id ? ' noDisp' : '';
		if (v.image)
			v.image = global.serverImg + v.image;
		else
			v.image = 'images/contact.svg" class="bgColor" style="padding:3em;';
		if (v.rating > 0)
			v.rating = '<div><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></div>';
		else
			v.rating = '';
		if (global.isBrowser())
			v.displaySocialShare = 'display:none;';
		if (!v.attributes && !v.aboutMe && !v.rating)
			v.dispBody = 'display:none;';
		if (v.aboutMe)
			v.aboutMe = '<div style="margin-top:1em;">' + (v.guide ? '<b>' + ui.l('settings.guide') + '</b><br/>' : '') + '<text class="highlightBackground">' + v.aboutMe + '</text></div>';
		if (v.contactLink.status == 'Pending' && v.contactLink.contactId != user.contact.id)
			setTimeout(function () {
				pageContact.toggleBlockUser(id);
			}, 1000);
		if (v.contactLink.status == 'Friends')
			ui.classAdd('main>#buttonFavorite', 'highlight');
		else
			ui.classRemove('main>#buttonFavorite', 'highlight');
		return pageContact.templateDetail(v);
	}
	static filterList() {
		var activeID = ui.navigation.getActiveID();
		var d = lists.data[activeID];
		if (!d)
			return;
		var bu = ui.q(activeID + ' filters [name="buddies"]:checked');
		if (bu)
			bu = bu.value;
		var ge = ui.q(activeID + ' filters [name="gender"]:checked');
		if (ge)
			ge = ge.value;
		var v = ui.qa(activeID + '[name="filterContactsTown"]:checked');
		var towns = [];
		if (v && v.length > 0) {
			for (var i = 0; i < v.length; i++)
				towns[v[i].getAttribute('label')] = 1;
		}
		for (var i = 1; i < d.length; i++) {
			var e = model.convert(new Contact(), d, i);
			var match = (!ge || e.gender == ge) && (!bu || e.contactLink.status == 'Friends') && (v.length == 0 || towns[e.current_town]);
			e = ui.q(activeID + ' [i="' + e.id + '"]');
			ui.attr(e, 'filtered', !match);
		}
		lists.execFilter();
	}
	static getBirthday(b, bd) {
		var birth = '', present = '', age = 0;
		if (b) {
			var d1 = global.date.getDate(b), d2 = new Date();
			age = d2.getYear() - d1.getYear();
			if (d2.getMonth() < d1.getMonth() || d2.getMonth() == d1.getMonth() && d2.getDate() < d1.getDate())
				age--;
			if (bd == 2) {
				birth = global.date.formatDate(b);
				birth = ui.l('contacts.bday').replace('{0}', birth.substring(0, birth.lastIndexOf(' ')));
				if (d2.getMonth() == d1.getMonth() && d2.getDate() == d1.getDate())
					present = '<img src="images/present.svg"/>';
			}
		}
		return [birth, present, age];
	}
	static getFilterFields() {
		var l = lists.data[ui.navigation.getActiveID()];
		var r = [], s = '', gM = false, gF = false, gD = false, f = false, nF = false;
		for (var i = 1; i < l.length; i++) {
			var e = model.convert(new Contact(), l, i);
			if (e.gender == 1)
				gM = true;
			else if (e.gender == 2)
				gF = true;
			else if (e.gender == 3)
				gD = true;
			if (e.contactLink.status == 'Friends')
				f = true;
			else
				nF = true;
		}
		if (gF && gM || gF && gD || gM && gD) {
			if (gM)
				s += '<input type="radio" deselect="true" onclick="pageContact.filterList();" label="' + ui.l('male') + '" value="1" name="gender"/>';
			if (gF)
				s += '<input type="radio" deselect="true" onclick="pageContact.filterList();" label="' + ui.l('female') + '" value="2" name="gender"/>';
			if (gD)
				s += '<input type="radio" deselect="true" onclick="pageContact.filterList();" label="' + ui.l('divers') + '" value="3" name="gender"/>';
		}
		if (f && nF)
			s += '<input type="checkbox" onclick="pageContact.filterList();" name="buddies" value="1" label="' + ui.l('contacts.title') + '"/>';
		if (nF == false && r.length > 1) {
			r = r.sort();
			if (s)
				s += '<filterSeparator></filterSeparator>';
			for (var i = 0; i < r.length; i++)
				s += '<input type="radio" label="' + r[i] + '" name="filterContactsTown" onclick="pageContact.filterList();" deselect="true"/>';
		}
		return s ? '<div>' + s + '</div>' : '<div style="padding-bottom:1em;">' + ui.l('filterNoDifferentValues') + '</div>';
	}
	static groups = {
		addGroup(id) {
			ui.navigation.openPopup(ui.l('group.newButton'), '<field style="padding:1em;"><label>' + ui.l('name') + '</label><value><input type="text" name="name"/></value></field><dialogButtons><buttontext class="bgColor" onclick="pageContact.groups.saveGroup(' + id + ');">' + ui.l('save') + '</buttontext></dialogButtons>');
		},
		addToGroup(event, id) {
			var d = { classname: 'ContactGroupLink' }, e = event.target;
			if (e.checked && !e.getAttribute('gllID')) {
				d.values = {};
				d.values.contactId2 = id;
				d.values.contactGroupId = e.getAttribute('value');
			} else if (!e.checked && e.getAttribute('gllID'))
				d.id = e.getAttribute('gllID');
			if (d) {
				communication.ajax({
					url: global.server + 'db/one',
					body: d,
					method: d.id ? 'DELETE' : 'POST',
					pos: e.getAttribute('value'),
					success(r) {
						var e2 = ui.q('detail[i="' + id + '"] [name="groups"] input[value="' + this.pos + '"]');
						if (d.id) {
							ui.attr(e2, 'gllID', null);
							ui.attr(e2, 'checked', null);
						} else {
							ui.attr(e2, 'gllID', r);
							ui.attr(e2, 'checked', 'true');
						}
					}
				});
			}
		},
		delete() {
			if (ui.q('input[name="groupdialog"]:checked'))
				return;
			communication.ajax({
				url: global.server + 'db/one',
				method: 'DELETE',
				body: { classname: 'ContactGroup', id: ui.q('input[name="groupdialog"]:checked').getAttribute('value') },
				success() {
					pageContact.groups.getGroups(function () {
						var s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="pageContact.groups.loadListGroups()"');
						if (s.indexOf('<input') > -1)
							s = s.replace('<input', '<input checked="true"');
						ui.html('groups', '<div>' + s + '</div>');
						formFunc.initFields('groups');
						ui.css('#groupsDelete', 'display', 'none');
						ui.html('contacts listResults', '');
					});
				}
			});
		},
		getGroups(exec) {
			communication.ajax({
				url: global.server + 'db/list?query=contact_listGroup&search=' + encodeURIComponent('contactGroup.contactId=' + user.contact.id),
				responseType: 'json',
				success(r) {
					pageContact.groups.setGroups(r);
					if (exec)
						exec.call();
				}
			});
		},
		loadListGroups() {
			var v = ui.q('input[name="groupdialog"]:checked').getAttribute('value');
			if (!v)
				return;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&query=contact_listGroupLink&search=' + encodeURIComponent('contactGroupLink.contactGroupId=' + v), pageContact.listContacts, 'contacts', 'groups');
		},
		open() {
			var activeID = ui.navigation.getActiveID();
			var e = ui.qa('menu a');
			for (var i = 0; i < e.length; i++) {
				if (e[i].matches(':hover')) {
					ui.attr(activeID, 'menuIndex', i);
					break;
				}
			}
			if (user.contact.groups == null) {
				pageContact.groups.getGroups(pageContact.groups.open);
				return;
			}
			var s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="pageContact.groups.loadListGroups()"');
			lists.setListDivs(activeID);
			ui.html('contacts listTitle', '');
			if (ui.cssValue('groups', 'display') == 'none') {
				ui.html('contacts listResults', '');
				ui.toggleHeight('groups');
			}
			if (s) {
				e = ui.q('groups');
				if (!e.innerHTML) {
					ui.html(e, pageContact.templateGroups({ groups: s }));
					formFunc.initFields(activeID + ' groups');
				}
				ui.q('[name="groupdialog"]').checked = false;
				ui.css(e, 'display', '');
				ui.navigation.hideMenu();
			} else {
				ui.html(activeID + ' listResults', lists.getListNoResults(activeID, 'noGroups'));
				lists.setListHint('contacts');
			}
		},
		rename() {
			if (ui.q('input[name="groupdialog"]:checked'))
				return;
			var s = ui.q('#groupsRename').children[0].value;
			if (s.trim().length == 0)
				return;
			s = s.replace(/</g, '&lt;');
			ui.q('#groupsRename').children[0].value = s;
			communication.ajax({
				url: global.server + 'db/one',
				responseType: 'json',
				method: 'PUT',
				body: { classname: 'ContactGroup', id: ui.q('input[name="groupdialog"]:checked').getAttribute('value'), values: { name: s } },
				success(r) {
					pageContact.groups.getGroups();
					var s = ui.q('#groupsRename').children[0].value;
					var e = ui.q('input[name="groupdialog"]:checked');
					ui.attr(e, 'label', s);
					e.nextSibling.innerHTML = s;
					ui.css('#groupsRename', 'display', 'none');
				}
			});
		},
		saveGroup(id) {
			var e = ui.q('popup input[name="name"]');
			if (!e.value)
				return;
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
				body: { classname: 'ContactGroup', values: { name: e.value.replace(/</g, '&lt;') } },
				success() {
					ui.navigation.hidePopup();
					pageContact.groups.getGroups(function () {
						var e2 = ui.qa('[name="groups"] detailTogglePanel input:checked'), e3 = ui.q('[i="' + id + '"] [name="groups"] detailTogglePanel');
						var s = e3.innerHTML;
						e3.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="pageContact.groups.addToGroup(event,' + id + ');"') + s.substring(s.indexOf('<br>'));
						formFunc.initFields('[i="' + id + '"] [name="groups"]');
						for (var i = 0; i < e2.length; i++)
							ui.attr('[i="' + id + '"] [name="groups"] input[value="' + e2[i].value + '"]', 'checked', 'checked');
						e3 = ui.q('groups > div');
						if (e2 && e3.innerHTML) {
							s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="pageContact.groups.loadListGroups()"');
							var c = ui.val('groups input:checked');
							e3.innerHTML = s.replace('value="' + c + '"', 'value="' + c + '" checked="true"');
							formFunc.initFields('groups');
						}
					});
				}
			});
		},
		setGroups(r) {
			var s = '';
			for (var i = 1; i < r.length; i++) {
				var v = model.convert(new ContactGroup(), r, i);
				s += '<input type="checkbox" name="groupdialog" value="' + v.id + '" label="' + v.name + '"/>';
			}
			user.contact.groups = s;
		},
		showRename() {
			ui.css('#groupsDelete', 'display', 'none');
			var e = ui.q('#groupsRename');
			e.style.display = e.style.display == 'block' ? 'none' : 'block';
			e.children[0].value = ui.q('input[name="groupdialog"]:checked').getAttribute('label');
		},
		toggleGroups(id, friendship) {
			if (user.contact.groups == null) {
				pageContact.groups.getGroups(function () {
					pageContact.groups.toggleGroups(id);
				});
				return;
			}
			var path = 'detail[i="' + id + '"] [name="groups"] detailTogglePanel';
			var e = ui.q(path);
			if (!e.innerHTML) {
				if (!friendship) {
					communication.ajax({
						url: global.server + 'db/one?query=contact_listFriends&id=' + id,
						responseType: 'json',
						success(r) {
							pageContact.groups.toggleGroups(id, r ? model.convert(new ContactLink(), r).status : '');
						}
					});
					return;
				}
				if (friendship != 'Friends') {
					if (!e.innerHTML) {
						if (friendship != 'Terminated' && friendship != 'Terminated2')
							e.innerHTML = ui.l('contacts.denyAddToGroup') + '<br/><buttontext class="bgColor" onclick="pageContact.sendRequestForFriendship(' + id + ')" style="margin-top:0.5em;">' + ui.l('contacts.requestFriendship') + '</buttontext>';
						else
							e.innerHTML = ui.l('contacts.requestFriendship' + (friendship == 'Pending' ? 'AlreadySent' : 'Canceled'));
					}
					details.togglePanel(e.parentNode);
					return;
				}
				e.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="pageContact.groups.addToGroup(event,' + id + ')"') + e.innerHTML;
				formFunc.initFields(path);
				communication.ajax({
					url: global.server + 'db/list?query=contact_listGroupLink&search=' + encodeURIComponent('contactGroupLink.contactId2=' + id),
					responseType: 'json',
					success(r) {
						for (var i = 1; i < r.length; i++) {
							var d = model.convert(new Contact(), r, i);
							var e2 = ui.q(path + ' input[value="' + d.contactGroupLink.contactGroupId + '"]');
							if (e2) {
								ui.attr(e2, 'checked', 'true');
								ui.attr(e2, 'gllID', d.contactGroupLink.id);
							}
						}
					}
				});
			}
			details.togglePanel(e.parentNode);
		}
	}
	static init() {
		if (!ui.q('contacts').innerHTML)
			lists.setListDivs('contacts');
		if (!ui.q('contacts listResults row')) {
			var e = ui.q('menu');
			if (ui.cssValue(e, 'transform').indexOf('1') > 0) {
				if (e.getAttribute('type') != 'contacts') {
					ui.on(e, 'transitionend', function () {
						ui.navigation.toggleMenu('contacts');
					}, true);
				}
			} else
				ui.navigation.toggleMenu('contacts');
		}
	}
	static listContacts(l) {
		if (!l || l.length < 2)
			return '<noResult>' + ui.l('noResults.list').replace('{0}', ui.l('contacts.title')).replace('{1}', '') + '</noResult>';
		var activeID = ui.navigation.getActiveID()
		if (activeID == 'search')
			ui.attr('search', 'type', 'contacts');
		return pageContact.listContactsInternal(l);
	}
	static listContactsInternal(l) {
		var s = '', activeID = ui.navigation.getActiveID();
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Contact(), l, i);
			var birth = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/contact.svg" style="padding:1em;';
			v.classBGImg = v.imageList ? '' : 'bgColor';
			if (v.contactLink.status == 'Friends')
				v.classFavorite = ' favorite';
			v.attr = ui.getAttributes(v, 'list');
			v.extra = (v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) + 'km<br/>' : '');
			if (v.attr.total && v.attr.totalMatch / v.attr.total > 0)
				v.extra += parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5) + '%';
			if (!v._message1)
				v._message1 = v.attr.textAttributes();
			if (birth)
				v.birth = birth[0] ? ' (' + v.age + ')' : '';
			if (!v._message2)
				v._message2 = v.aboutMe;
			v._message = v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			v.dist = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
			if (!v._badgeDisp) {
				v._badgeDisp = birth[1] ? 'block' : 'none';
				v._badge = birth[1] ? birth[1] : 0;
			}
			if (!v.badgeAction)
				v.badgeAction = birth[1] ? '' : 'remove';
			if (activeID == 'detail')
				v.oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)';
			else if (activeID == 'settings3')
				v.oc = 'pageSettings.unblockUser(' + v.id + ',' + v.contactBlock.id + ')';
			else if (activeID == 'info')
				v.oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)';
			else if (v.contactNotification.id)
				v.oc = 'details.open(' + v.id + ',&quot;contact_listNotification&search=' + encodeURIComponent('contactNotification.id=' + v.contactNotification.id) + '&quot;,pageContact.detail)';
			else
				v.oc = 'details.open(' + v.id + ',&quot;contact_list&search=' + encodeURIComponent('contact.id=' + v.id) + '&quot;,pageContact.detail)';
			s += pageContact.templateList(v);
		}
		return s;
	}
	static listVisits(l) {
		for (var i = 1; i < l.length; i++)
			l[i].classParticipate = i <= user.contact.tsVisits ? ' participate' : '';
		return pageContact.listContactsInternal(l);
	}
	static sendRequestForFriendship(id) {
		communication.ajax({
			url: global.server + 'db/one',
			method: 'POST',
			body: { classname: 'ContactLink', values: { status: 'Pending', contactId2: id } },
			success() {
				if (ui.q('popupContent'))
					ui.navigation.hidePopup();
				else
					ui.q('detail[i="' + id + '"] [name="block"] buttontext').outerHTML = '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
			}
		});
	}
	static showBlockText() {
		var s = ui.q('detail [name="block"] [name="type"]:checked').value == 2 ? 'block' : 'none';
		ui.css(ui.q('detail [name="block"] [name="reason"]').parentNode, 'display', s);
		ui.css('detail [name="block"] [name="note"]', 'display', s);
	}
	static toggleBlockUser(id) {
		var divID = 'detail[i="' + id + '"] [name="block"]';
		var e = ui.q(divID);
		if (!e.getAttribute('blockID')) {
			communication.ajax({
				url: global.server + 'db/one?query=contact_block&search=' + encodeURIComponent('contactBlock.contactId=' + user.contact.id + ' and contactBlock.contactId2=' + id),
				success(r) {
					if (r) {
						var v = JSON.parse(r);
						ui.attr(e, 'blockID', v.contactBlock.id);
						ui.qa(divID + ' input')[v.contactBlock.note ? 1 : 0].checked = true;
						if (v.contactBlock.reason != 0)
							ui.q(divID + ' [name="reason"][value="' + v.contactBlock.reason + '"]').checked = true;
						ui.q(divID + ' textarea').value = v.reason;
						pageContact.showBlockText();
					} else
						ui.attr(e, 'blockID', 0);
				}
			});
		}
		e.style.right = (ui.q('body').offsetWidth - ui.q('main').offsetLeft - ui.q('main').offsetWidth + ui.emInPX) + 'px';
		e.style.maxWidth = (ui.q('main').offsetWidth * 0.9) + 'px';
		ui.toggleHeight(e);
	}
	static toggleLocation(id) {
		var e = ui.q('detail[i="' + id + '"] [name="location"]');
		if (!e.innerHTML) {
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent('location.contactId=' + id), function (l) {
				var s = pageLocation.listLocation(l);
				if (s) {
					e.innerHTML = ui.l('locations.my') + '<br/>' + s;
					var rows = ui.qa('detail[i="' + id + '"] [name="location"] row');
					for (var i = 0; i < rows.length; i++)
						rows[i].setAttribute('onclick', 'ui.navigation.autoOpen("' + global.encParam('l=' + rows[i].getAttribute('i')) + '",event)');
				} else
					e.innerHTML = '<detailTogglePanel>' + ui.l('locations.myNone') + '</detailTogglePanel>';
				details.togglePanel(e);
			});
		} else
			details.togglePanel(e);
	}
	static toggleMatchIndicatorHint(id, event) {
		var e = ui.q('detail[i="' + id + '"] [name="matchIndicatorHint"]');
		var button = ui.parents(event.target, 'matchIndicator');
		e.style.top = (button.offsetTop + button.offsetHeight) + 'px';
		e.style.left = '5%';
		ui.toggleHeight(e);
	}
}