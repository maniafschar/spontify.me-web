import { details } from './details';
import { communication } from './communication';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { pageLocation } from './pageLocation';
import { pageWhatToDo } from './pageWhatToDo';
import { formFunc, ui } from './ui';
import { user } from './user';
import { model, Contact, ContactGroupLink, ContactBlock, ContactGroup, ContactLink } from './model';

export { pageContact };

class pageContact {
	static templateList = v =>
		global.template`<row onclick="${v.oc}" i="${v.id}" class="contact">
	<badge class="bgColor" style="display:${v._badgeDisp};" action="${v.badgeAction}">
		${v._badge}
	</badge>
	<div>
		<div>
			${v.icons}
			<text>
				<title>${v.pseudonym}</title>
				${v._message}
			</text>
		</div>
		<imagelist>
			<img src="${v.image}" class="${v.classBGImg}" />
		</imagelist>
	</div>
	</row>`;
	static templateIcons = v =>
		global.template`<icons onclick="rating.open(${v.id},&quot;contact&quot;,event);">
    <gender class="${v.classBGIcons}">
        ${v.gender}
    </gender>
    <distance class="${v.classBGIcons}">
        <span>
            ${v.dist}<km />
        </span>
    </distance>
    <favorite class="${v.classBGIcons}">
        <span><img src="images/buttonFavorite${v.friends}.png" class="favorite" /></span>
    </favorite>
    <rating class="${v.classBGIcons}">
        <span>
            ${v.ratingIcon}<percent />
        </span>
    </rating>
</icons>`;
	static templateDetail = v =>
		global.template`${v.present}
		<detailImg ${v.classBGImg} i="${v.id}">
			<img src="${v.image}" />
			<detailtitle class="bgColor2">
				<title>
					${v.pseudonym}
				</title>
				<subtitle>
					${v.idDisplay}
				</subtitle>
				<elementNo>
					${v.elementNo}
				</elementNo>
			</detailtitle>
			<detailDistance>
				${v.gender}
				${v.distance}<km />
			</detailDistance>
		</detailImg>
		<text>
			${v.birthday}
			${v.birthdayToday}
		</text>
		<text onclick="rating.open(${v.id},&quot;contact&quot;,event);" style="cursor:pointer;" style="border-top:solid 1px rgb(240,240,240);${v.dispBody}">
			${v.message}
			${v.attributes}
			${v.budget}
			${v.rating}
			${v.aboutMe}
		</text>
		<detailButtons>
			<buttontext class="bgColor${v.bgFriends}${v.hideMe}" name="buttonBlock"
				onclick="pageContact.toggleBlockUser(${v.id});">${ui.l('contacts.relation')}</buttontext>
			<buttontext class="bgColor${v.blocked}${v.hideMe}" onclick="pageChat.open(${v.id});" name="buttonChat">${ui.l('chat.title')}</buttontext>
			<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonCopy"
				onclick="pageChat.doCopyLink(event,&quot;p=${v.id}&quot;);">${ui.l('share')}</buttontext>
			<buttontext class="bgColor${v.blocked}${v.hideMe}${v.hideGroups}" name="buttonGroups"
				onclick="pageContact.groups.toggleGroups(${v.id});">${ui.l('group.action')}</buttontext>
			<buttontext class="bgColor${v.blocked}" name="buttonEvents"
				onclick="pageLocation.event.toggle(${v.id});">${ui.l('events.title')}</buttontext>
			<buttontext class="bgColor${v.blocked}" name="buttonLocation"
				onclick="pageContact.toggleLocation(${v.id});">${ui.l('locations.title')}</buttontext>
		</detailButtons>
		<text name="block" class="collapsed">
			<detailTogglePanel>
				${v.buddy}
				<input type="radio" name="type" value="1" label="${ui.l('contacts.blockAction')}"
					onclick="pageContact.showBlockText(${v.id});" checked="true" />
				<input type="radio" name="type" value="2" label="${ui.l('contacts.blockAndReportAction')}"
					onclick="pageContact.showBlockText(${v.id});" />
				<br />
				<div style="display:none;margin-top:0.5em;">
					<input type="radio" name="reason" value="1" label="${ui.l('contacts.blockReason1')}" />
					<input type="radio" name="reason" value="2" label="${ui.l('contacts.blockReason2')}" />
					<input type="radio" name="reason" value="3" label="${ui.l('contacts.blockReason3')}" />
					<input type="radio" name="reason" value="4" label="${ui.l('contacts.blockReason4')}" />
					<input type="radio" name="reason" value="100" label="${ui.l('contacts.blockReason100')}" checked />
				</div>
				<textarea placeholder="${ui.l('contacts.blockDescHint')}" name="note" maxlength="250" style="display:none;"></textarea>
				<buttontext onclick="pageContact.block(${v.id});" style="margin-top:0.5em;"
					class="${v.classBGIcons}">${ui.l('save')}</buttontext>
			</detailTogglePanel>
		</text>
		<text name="events" class="collapsed"></text>
		<text name="groups" class="collapsed">
			<detailTogglePanel><br /><buttontext onclick="pageContact.groups.addGroup(${v.id});"
					class="${v.classBGIcons}" style="margin-top:1em;">${ui.l('group.newButton')}</buttontext>
			</detailTogglePanel>
		</text>
		<text name="copy" class="collapsed">
			<detailTogglePanel>${ui.l('copyLinkHint.contacts')}<br />
				<buttontext onclick="pageInfo.socialShare();" style="margin-top:2em;${v.displaySocialShare}"
					class="bgColor2">
					${ui.l('sendSocialShareLocation')}
				</buttontext>
			</detailTogglePanel>
		</text>
		<text name="location" class="collapsed" style="padding:0;"></text>`;
	static templateGroups = v =>
		global.template`<div>
    ${v.groups}
</div>
<buttontext style="margin-top:0.5em;" class="bgColor" onclick="pageContact.groups.showRename();">
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
    <buttontext onclick="pageContact.groups.rename();" class="bgColor">${ui.l('save')}</buttontext>
</div>
<buttontext onclick="pageContact.groups.delete();" id="groupsDelete" style="display:none;margin-top:2em;"
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
			msg = global.string.replaceNewsAdHoc(msg + time);
			if (v.message && v.message.trim().length > 0)
				msg += '<br/>' + v.message;
			v._message1 = msg;
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
	static block(id) {
		var path = 'detail[i="' + id + '"] [name="block"]';
		formFunc.resetError(ui.q(path + ' [name="note"]'));
		var bi = ui.q(path).getAttribute('blockID');
		if (ui.q(path + ' [name="type"]').checked)
			pageContact.blockUser(bi, id, 0, '');
		else {
			var n = ui.q(path + ' [name="note"]');
			if (!n.value && ui.q(path + ' [name="reason"][value="100"]:checked')) {
				formFunc.setError(n, 'contacts.blockActionHint');
				return;
			}
			pageContact.blockUser(bi, id, ui.val(path + ' [name="reason"]:checked'), n.value);
		}
	}
	static blockUser(blockID, id, reason, note) {
		var v = {
			classname: 'ContactBlock',
			values: {
				contactId2: id,
				reason: reason,
				note: note
			}
		};
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
					ui.navigation.goTo('contacts', null, true);
					var e = lists.data['contacts'];
					if (e) {
						for (var i = 1; i < e.length; i++) {
							if (model.convert(new ContactBlock(), e, i).ID == id) {
								e.splice(i, 1);
								break;
							}
						}
					}
				}
			}
		});
	}
	static confirmFriendship(linkId, status, id) {
		communication.ajax({
			url: global.server + 'db/one',
			method: 'PUT',
			body: { classname: 'ContactLink', id: linkId, values: { status: status } },
			success() {
				ui.html('detail[i="' + id + '"] [name="block"] detailTogglePanel', ui.l('contacts.requestFriendship' + status.replace('2', '')));
				communication.ping();
				ui.attr('row[i="' + id + '"][class="contact"] icons favorite img', 'src', 'images/buttonFavorite' + (status == 'Friends' ? 'Filled' : '') + '.png');
				var e = ui.qa(ui.q('detail').getAttribute('type') + ' row[i="' + id + '"] badge');
				ui.html(e, '');
				ui.css(e, 'display', 'none');
				if (status == 'Friends') {
					ui.classAdd('detail[i="' + id + '"] [name="buttonBlock"]', 'bgColor2');
					ui.classRemove('detail[i="' + id + '"] [name="buttonBlock"]', 'bgColor');
					ui.classRemove('detail[i="' + id + '"] [name="buttonGroups"]', 'noDisp');
				} else {
					ui.classRemove('detail[i="' + id + '"] [name="buttonBlock"]', 'bgColor2');
					ui.classAdd('detail[i="' + id + '"] [name="buttonBlock"]', 'bgColor');
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
		v.bgFriends = v.contactLink.status == 'Friends' ? '2' : '';
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
		v.birthday = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
		v.classBGImg = 'class="bgColor2"';
		v.classBGIcons = 'bgColor';
		if (v.birthday[0]) {
			if (v.birthday[1])
				v.birthdayToday = '<div class="highlight">' + ui.l('contacts.birthdayToday') + '</div>';
			v.birthday = v.birthday[0].split(global.separator);
			if (v.birthday.length == 1)
				v.birthday = v.birthday[0];
			else
				v.birthday = v.birthday[0] + '<br/>' + v.birthday[1];
		} else
			v.birthday = '';
		if (v.guide)
			v.birthday = ui.l('settings.guide') + (v.birthday ? '<br/>' + v.birthday : '');
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
		v.budget = pageLocation.budgetLabel(v.budget);
		pageContact.addWTDMessage(v);
		if (!details.getNextNavElement(true, v.id))
			v.hideNext = 'display:none;';
		if (!details.getNextNavElement(false, v.id))
			v.hidePrevious = 'display:none;';
		v.elementNo = details.getElementNo(v.id);
		if (v.gender)
			v.gender = '<img src="images/iconGender' + v.gender + '.svg" />';
		v.attributes = pageContact.getMatchingAttributes(v.attr, v.attrEx, 'detail');
		v.hideGroups = v.contactLink.status == 'Friends' ? '' : ' noDisp';
		v.hideMe = user.contact.id == v.id ? ' noDisp' : '';
		if (v.image)
			v.image = global.serverImg + (user.contact.image.indexOf(v.image) == 0 ? user.contact.image : v.image);
		else
			v.image = 'images/contact.svg" style="padding:3em;';
		if (v.rating > 0)
			v.rating = '<div><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></div>';
		else
			v.rating = '';
		if (global.isBrowser())
			v.displaySocialShare = 'display:none;';
		if (v.contactNotification.id) {
			var oc = v.contactNotification.action;
			if (oc) {
				if (oc.indexOf('s:') == 0)
					oc = ' onclick="' + oc.substring(2) + '"';
				else if (oc == 'info' || oc.indexOf('m=') == 0)
					oc = ' onclick="ui.navigation.autoOpen(&quot;' + oc + '&quot;);"';
				else {
					oc = global.decParam(oc);
					if (oc && oc != 'p=' + v.id)
						oc = ' onclick="ui.navigation.autoOpen(&quot;' + v.contactNotification.action + '&quot;);"';
					else
						oc = '';
				}
			} else
				oc = '';
			var t = pageWhatToDo.getNotificationText(v.contactNotification.text, v.contactNotification.createdAt);
			v.message = '<div' + oc + '>' + t[0] + '<br/>' + t[1] + (oc ? global.separator + ui.l('more') : '') + '</div>';
		}
		if (!v.message && !v.attributes && !v.aboutMe && !v.rating)
			v.dispBody = 'display:none;';
		if (v.aboutMe)
			v.aboutMe = ui.l('settings.aboutMe') + ': ' + v.aboutMe;
		var sep = pageContact.templateDetail(v);
		if (v.contactLink.status == 'Pending' && v.contactLink.contactId != user.contact.id)
			setTimeout(function () {
				pageContact.toggleBlockUser(id);
			}, 1000);
		return sep;
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
				birth += global.separator + ui.l('contacts.age').replace('{0}', age);
				if (d2.getMonth() == d1.getMonth() && d2.getDate() == d1.getDate())
					present = '<img src="images/iconBirthday.png"/>';
			} else if (bd == 1)
				birth = ui.l('contacts.age').replace('{0}', age);
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
	static getIcons(v) {
		v.ratingIcon = !v.rating || v.rating <= 0 ? '' : parseInt(0.5 + v.rating);
		if (v.gender)
			v.gender = '<img src="images/iconGender' + v.gender + '.svg" />';
		if (v.guide)
			v.gender = v.gender + '<img src="images/guide.svg" />';
		return pageContact.templateIcons(v);
	}
	static getMatchingAttributes(contactAttrib, contactAttribEx, style) {
		var total = 0, s = '';
		if (user.contact.attrInterest && contactAttrib) {
			var a = contactAttrib.split('\u0015');
			for (var i = 0; i < a.length; i++) {
				if (user.contact.attrInterest.indexOf(a[i]) > -1) {
					total++;
					s += '<label class="multipleLabel highlight">' + ui.attributes[parseInt(a[i], 10)] + '</label>';
				} else
					s += '<label class="multipleLabel">' + ui.attributes[parseInt(a[i], 10)] + '</label>';
			}
		}
		if (user.contact.attrInterestEx && contactAttribEx) {
			var a = contactAttribEx.toLowerCase().split(',');
			var c = ',' + user.contact.attrInterestEx.toLowerCase() + ',';
			for (var i = 0; i < a.length; i++) {
				if (c.indexOf(',' + a[i].trim() + ',') > -1) {
					total++;
					s += '<label class="multipleLabel highlight">' + a[i].trim() + '</label>';
				} else
					s += '<label class="multipleLabel">' + a[i].trim() + '</label>';
			}
		}
		if (style == 'list')
			return total ? ui.l('attribMatch' + (total > 1 ? 'es' : '')).replace('{0}', total) : '';
		return s ? '<div>' + s + '</div>' : '';
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
			var e = ui.q('[i="' + id + '"] [name="groups"] [name="name"]');
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
			if (e.innerHTML.indexOf('<br') == 0) {
				if (!friendship) {
					communication.ajax({
						url: global.server + 'db/one?query=contact_listFriends&id=' + id,
						success(r) {
							pageContact.groups.toggleGroups(id, r ? model.convert(new ContactLink(), JSON.parse(r)).status : -1);
						}
					});
					return;
				}
				if (friendship != 'Friends') {
					if (!e.innerHTML.substring(0, e.innerHTML.indexOf('<br>'))) {
						if (friendship != 'Terminated' && friendship != 'Terminated2')
							e.innerHTML = ui.l('contacts.denyAddToGroup') + '<br/><buttontext class="bgColor" onclick="pageContact.sendRequestForFriendship(' + id + ');" style="margin-top:0.5em;">' + ui.l('contacts.requestFriendship') + '</buttontext>';
						else
							e.innerHTML = ui.l('contacts.requestFriendship' + (friendship == 'Pending' ? 'AlreadySent' : 'Canceled'));
					}
					details.togglePanel(e.parentNode);
					return;
				}
				e.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="pageContact.groups.addToGroup(event,' + id + ');"') + e.innerHTML;
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
	};
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
			if (v.contactLink.status == 'Pending') {
				if (v.contactLink.contactId == user.contact.id)
					v.contactLink.status2 = '<img src="images/buttonFavoriteFilled.png"/><span>?</span>';
				else {
					v.contactLink.status2 = '<img src="images/buttonFavoriteFilled.png"/>';
				}
			}
			var birth = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
			if (!v.friends)
				v.friends = v.contactLink.status == 'Friends' ? 'Filled' : '';
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/contact.svg" style="padding:1em;';
			v.classBGImg = v.imageList ? '' : 'bgColor2';
			v.classBGIcons = 'bgColor';
			if (!v._message1)
				v._message1 = pageContact.getMatchingAttributes(v.attr, v.attrEx, 'list');
			if (v.birth)
				v.birth = birth[0] ? global.separator + birth[2] : '';
			if (!v._message2)
				v._message2 = v.aboutMe;
			v._message = v.birth ? v.birth + '<br/>' : '';
			v._message += v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			v.dist = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
			if (!v._badgeDisp) {
				v._badgeDisp = birth[1] ? 'block' : 'none';
				v._badge = birth[1] ? birth[1] : 0;
			}
			if (!v.badgeAction)
				v.badgeAction = birth[1] ? '' : 'remove';
			v.icons = pageContact.getIcons(v);
			if (activeID == 'detail')
				v.oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;)';
			else if (activeID == 'settings3')
				v.oc = 'pageSettings.unblockUser(' + v.id + ',' + v.contactBlock.id + ')';
			else if (activeID == 'info')
				v.oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;)';
			else if (v.contactNotification.id)
				v.oc = 'details.open(&quot;contacts&quot;,' + v.id + ',&quot;contact_listNotification&search=' + encodeURIComponent('contactNotification.id=' + v.contactNotification.id) + '&quot;,pageContact.detail)';
			else
				v.oc = 'details.open(&quot;contacts&quot;,' + v.id + ',&quot;contact_list&search=' + encodeURIComponent('contact.id=' + v.id) + '&quot;,pageContact.detail)';
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
					ui.q('detail[i="' + id + '"] [name="block"]').innerHTML = ui.l('contacts.requestFriendshipSent');
			}
		});
	}
	static showBlockText(id) {
		var s = ui.q('detail[i="' + id + '"] [name="block"] [name="type"]:checked').value == 2 ? 'block' : 'none';
		ui.css(ui.q('detail[i="' + id + '"] [name="block"] [name="reason"]').parentNode, 'display', s);
		ui.css('detail[i="' + id + '"] [name="block"] [name="note"]', 'display', s);
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
						pageContact.showBlockText(id);
					} else
						ui.attr(e, 'blockID', 0);
				}
			});
		}
		details.togglePanel(e);
	}
	static toggleLocation(id) {
		var e = ui.q('detail[i="' + id + '"] [name="location"]');
		if (!e.innerHTML) {
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent('location.contactId=' + id), function (l) {
				var s = pageLocation.listLocation(l), p, p2, i;
				while ((p = s.indexOf('onclick="details.open(')) > -1) {
					p2 = s.indexOf(',pageLocation.detailLocationEvent)', p);
					if (p2 > p) {
						i = s.substring(p, p2).split(',')[1].replace(/\D/g, '');
						s = s.substring(0, p) + ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('l=' + i) + '&quot;);"' + s.substring(p2 + 35);
					}
				}
				if (s)
					e.innerHTML = '<br/>' + ui.l('locations.my') + '<br/><br/>' + s;
				else
					e.innerHTML = '<detailTogglePanel>' + ui.l('locations.myNone') + '</detailTogglePanel>';
				details.togglePanel(e);
			});
		} else
			details.togglePanel(e);
	}
}