import { details } from './details';
import { communication } from './communication';
import { geoData } from './geoData';
import { global, Strings } from './global';
import { lists } from './lists';
import { pageLocation } from './pageLocation';
import { formFunc, ui } from './ui';
import { user } from './user';
import { model, Contact, ContactGroup } from './model';

export { pageContact, groups };

class pageContact {
	static filter = null;
	static templateDetail = v =>
		global.template`${v.present}
<detailHeader class="${v.favorite}">
	<detailImg>
		${v.image}
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
		<text name="matchIndicatorHint" class="popup" style="display:none;" onclick="ui.toggleHeight(this)">
			<div>${v.matchIndicatorHint}</div>
		</text>
		${v.previewHintImage}
	</detailImg>
</detailHeader>
${v.description}
${v.urls}
${v.rating}
<text${v.birthdayClass}>
	${v.birthday}
</text>
${v.skills}
${v.matchIndicatorHintDescription}
<detailButtons style="margin-top:1em;">
	<button-text class="${v.loggedIn}"
		onclick="ui.navigation.goTo(&quot;login&quot;)" label="login.action"></button-text>
	<button-text class="${v.blocked}${v.hideMe}"
		onclick="pageChat.open(${v.id})" label="chat.title"></button-text>
	<button-text class="${v.blocked}${v.hideMe}" name="buttonFriend"
		onclick="pageContact.toggleFriend(${v.id})" label="${v.labelFriend}"></button-text>
	<button-text class="${v.blocked}${v.hideMe}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;p=${v.id}&quot;)" label="chat.share"></button-text>
	<button-text class="${v.blocked}${v.hideMe}" name="buttonGroups"
		onclick="groups.toggleGroups(${v.id},&quot;${v.contactLinkStatus}&quot;)" label="group.action"></button-text>
	<button-text class="${v.blocked}" name="buttonEvents"
		onclick="pageEvent.toggle(${v.id})" label="events.title"></button-text>
	<button-text class="${v.blocked}" name="buttonLocation"
		onclick="pageContact.toggleLocation(${v.id})" label="locations.title"></button-text>
	<button-text class="${v.blocked}${v.hideMe}" name="buttonBlock"
		onclick="pageContact.toggleBlockUser(${v.id})" label="contacts.blockAction"></button-text>
</detailButtons>
<text name="friend" class="collapsed">
	<div style="padding:2em 0;">
		${v.link}
	</div>
</text>
<text name="block" class="collapsed">
	<div style="padding:1em 0;">
		<div style="margin-top:0.5em;">
			<input-checkbox type="radio" name="reason" value="1" deselect="true" label="contacts.blockReason1"></input-checkbox>
			<input-checkbox type="radio" name="reason" value="2" deselect="true" label="contacts.blockReason2"></input-checkbox>
			<input-checkbox type="radio" name="reason" value="3" deselect="true" label="contacts.blockReason3"></input-checkbox>
			<input-checkbox type="radio" name="reason" value="4" deselect="true" label="contacts.blockReason4"></input-checkbox>
			<input-checkbox type="radio" name="reason" value="100" deselect="true" label="contacts.blockReason100"></input-checkbox>
		</div>
		<textarea placeholder="${ui.l('contacts.blockDescHint')}" name="note" maxlength="250"></textarea>
		<button-text onclick="pageContact.block()" style="margin-top:0.5em;" label="save"></button-text>
	</div>
</text>
<text name="events" class="collapsed list"></text>
<text name="groups" class="collapsed">
	<detailTogglePanel></detailTogglePanel>
	<button-text onclick="groups.addGroup(${v.id})" style="margin-top:1em;" label="group.newButton"></button-text>
</text>
<text name="copy" class="collapsed">
	<detailTogglePanel>
		${ui.l('copyLinkHint.contacts')}
	</detailTogglePanel>
</text>
<text name="location" class="collapsed list"></text>`;
	static templateGroups = v =>
		global.template`<div>
    ${v.groups}
</div>
<button-text style="margin-top:0.5em;" onclick="groups.showRename()" label="rename"></button-text>
<button-text style="margin-top:0.5em;"
    onclick="document.getElementById(&quot;groupsRename&quot;).style.display=&quot;none&quot;;var e=document.getElementById(&quot;groupsDelete&quot;).style;e.display=e.display==&quot;none&quot;?&quot;&quot;:&quot;none&quot;;"
	label="delete"></button-text>
<button-text style="margin-top:0.5em;display:none;" onclick="pageChat.openGroup()" label="chat.groupTitle"></button-text>
<br />
<div id="groupsRename" style="display:none;margin-top:2em;">
    <input type="text" style="width:40%;margin-right:0.5em;float:none;" />
    <button-text onclick="groups.rename()" label="save"></button-text>
</div>
<button-text onclick="groups.delete()" id="groupsDelete" style="display:none;margin-top:2em;" label="confirmDelete"></button-text>`;
	static block() {
		var path = 'detail card:last-child [name="block"]';
		formFunc.resetError(ui.q(path + ' [name="note"]'));
		var id = ui.q('detail card:last-child').getAttribute('i');
		var v = {
			classname: 'Block',
			values: {
				contactId2: id
			}
		};
		if (ui.q(path).getAttribute('blockID') > 0)
			v.id = ui.q(path).getAttribute('blockID');
		var n = ui.q(path + ' [name="note"]');
		if (!n.value && ui.q(path + ' [name="reason"][value="100"][checked="true"]')) {
			formFunc.setError(n, 'contacts.blockActionHint');
			return;
		}
		v.values.reason = ui.val(path + ' [name="reason"][checked="true"]');
		v.values.note = n.value;
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			webCall: 'pageContact.block()',
			body: v,
			success() {
				var e = ui.q('contacts [i="' + id + '"]');
				if (e) {
					e.outerHTML = '';
					lists.setListHint('contacts');
				}
				ui.navigation.goTo(ui.q('detail').getAttribute('from'));
			}
		});
	}
	static confirmFriendship(linkId, status, id) {
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageContact.confirmFriendship(linkId,status,id)',
			method: 'PUT',
			body: { classname: 'ContactLink', id: linkId, values: { status: status } },
			success() {
				ui.toggleHeight(ui.q('detail card:last-child [name="friend"]'));
				if (status == 'Friends') {
					ui.classAdd('main>buttonIcon.bottom.right', 'highlight');
					ui.classRemove('detail card:last-child[i="' + id + '"] [name="buttonGroups"]', 'hidden');
				} else {
					ui.classRemove('main>buttonIcon.bottom.right', 'highlight');
					ui.classAdd('detail card:last-child[i="' + id + '"] [name="buttonGroups"]', 'hidden');
				}
			}
		});
	}
	static detail(v) {
		var preview = ui.navigation.getActiveID() == 'settings';
		v = model.convert(new Contact(), v);
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
		v.birthday = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
		if (user.contact)
			v.loggedIn = 'hidden';
		if (v.birthday.age) {
			if (v.age)
				v.ageDisplay = ' (' + v.age + ')';
			if (v.birthday.present) {
				v.birthday = ui.l('contacts.birthdayToday') + '<br/>' + v.birthday.birthday;
				v.birthdayClass = ' class="highlightColor"';
			} else
				v.birthday = v.birthday.birthday;
		} else
			v.birthday = preview ? '<previewHint>' + ui.l('settings.previewHintBirthday') + '</previewHint>' : '';
		v.link = '';
		v.labelFriend = 'contacts.requestFriendshipButton';
		if (v.contactLink.id) {
			if (v.contactLink.status == 'Pending') {
				if (v.contactLink.contactId != user.contact.id)
					v.link += '<div style="margin-bottom:0.5em;">' + ui.l('contacts.requestFriendshipHint') + '</div><button-text onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + v.id + ')" style="margin:0 0.5em;" label="contacts.requestFriendshipConfirm"></button-text><button-text onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Rejected&quot;,' + v.id + ');" style="margin:0 0.5em;" label="contacts.requestFriendshipReject"></button-text>';
				else
					v.link += '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
			} else if (v.contactLink.status == 'Friends') {
				v.labelFriend = 'contacts.terminateFriendship';
				v.link += '<button-text onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;' + (v.contactLink.contactId == user.contact.id ? 'Terminated' : 'Terminated2') + '&quot;,' + v.id + ')" label="contacts.terminateFriendshipConfirm"></button-text>';
			} else if (v.contactLink.status == 'Terminated' && v.contactLink.contactId == user.contact.id || v.contactLink.status == 'Terminated2' && v.contactLink.contactId2 == user.contact.id)
				v.link += '<button-text onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + v.id + ')" label="contacts.requestFriendshipRestart"></button-text>';
			else
				v.link += ui.l('contacts.requestFriendshipCanceled');
		} else
			v.link += '<button-text onclick="pageContact.sendRequestForFriendship(' + v.id + ')" label="contacts.requestFriendship"></button-text>';
		if (v.contactLink.status == 'Friends')
			v.favorite = 'favorite';
		if (v.authenticate)
			v.favorite = (v.favorite ? ' ' : '') + 'authenticated';
		var skills = ui.getSkills(v, 'detail');
		v.skills = skills.text();
		if (v.skills) {
			v.skills = '<text onclick="ui.toggleHeight(&quot;detail card:last-child .matchIndicatorAttributesHint&quot;)">' + v.skills + '</text>';
			v.matchIndicatorHintDescription = skills.hint(true);
		} else if (preview)
			v.skills = '<previewHint>' + ui.l('settings.previewHintAttributes') + '</previewHint>';
		if (v.gender) {
			if (v.age && skills.totalMatch && user.contact) {
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
		if (skills.totalMatch) {
			v.matchIndicator = skills.totalMatch + '/' + skills.total;
			v.matchIndicatorPercent = parseInt(skills.totalMatch / skills.total * 100 + 0.5);
		} else
			v.matchIndicatorPercent = 0;
		v.matchIndicatorHint = ui.l('contacts.matchIndicatorHint').replace('{0}', skills.totalMatch).replace('{1}', skills.total).replace('{2}', v.matchIndicatorPercent);
		if (v.matchIndicatorClass)
			v.matchIndicatorHint += '<div style="margin-top:0.5em;">' + ui.l('contacts.matchIndicatorHintPulse') + '</div>';
		if (preview && !v.image)
			v.matchIndicatorClass = ' class="fade"';
		if (!user.contact || ui.navigation.getActiveID() == 'settings')
			v.blocked = 'hidden';
		else if (user.contact.id == v.id)
			v.hideMe = ' hidden';
		if (v.image)
			v.image = '<img src="' + global.serverImg + v.image + '" />';
		else {
			v.image = '<div class="mainBG" style="padding:8em;"><img src="images/contact.svg" ' + (preview ? 'class="fade"' : '') + '/></div>';
			if (preview)
				v.previewHintImage = '<previewHint class="image">' + ui.l('settings.previewHintImage') + '</previewHint>';
		}
		if (v.urls) {
			var s = v.urls.split('\n');
			v.urls = '';
			for (var i = 0; i < s.length; i++) {
				if (s[i]) {
					var h = new URL(s[i]).hostname;
					while (h.indexOf('.') != h.lastIndexOf('.'))
						h = h.substring(h.indexOf('.') + 1);
					v.urls += '<label class="multipleLabel" onclick="ui.navigation.openHTML(&quot;' + s[i] + '&quot;)">' + h.toLowerCase() + '</label>';
				}
			}
			v.urls = '<urls>' + v.urls + '</urls>';
		}
		if (v.rating > 0)
			v.rating = '<input-rating type="contact" id="' + v.id + '" rating="' + v.rating + '"></input-rating>';
		else
			v.rating = '';
		if (global.isBrowser())
			v.displaySocialShare = 'display:none;';
		if (v.description)
			v.description = '<text class="description">' + Strings.replaceLinks(v.description.replace(/\n/g, '<br/>')) + '</text>';
		else if (preview)
			v.description = '<previewHint>' + ui.l('settings.previewHintAboutMe') + '</previewHint>';
		if (v.contactLink.status == 'Pending' && v.contactLink.contactId != user.contact.id)
			setTimeout(function () {
				pageContact.toggleFriend(v.id);
			}, 1000);
		if (v.contactLink.status == 'Friends')
			ui.classAdd('main>buttonIcon.bottom.right', 'highlight');
		else
			ui.classRemove('main>buttonIcon.bottom.right', 'highlight');
		if (v.contactLink)
			v.contactLinkStatus = v.contactLink.status;
		return pageContact.templateDetail(v);
	}
	static getBirthday(b, bd) {
		var r = { birthday: null, present: null, age: null };
		if (b) {
			var d1 = global.date.server2local(b), d2 = new Date();
			r.age = d2.getYear() - d1.getYear();
			if (d2.getMonth() < d1.getMonth() || d2.getMonth() == d1.getMonth() && d2.getDate() < d1.getDate())
				r.age--;
			if (bd == 2) {
				r.birthday = ui.l('contacts.bday').replace('{0}', global.date.formatDate(b));
				if (d2.getMonth() == d1.getMonth() && d2.getDate() == d1.getDate())
					r.present = '<img src="images/present.svg"/>';
			}
		}
		return r;
	}
	static init() {
		if (!ui.q('contacts').innerHTML)
			lists.setListDivs('contacts');
		if (!ui.q('contacts listResults list-row'))
			setTimeout(ui.navigation.toggleMenu, 500);
	}
	static listContacts(l) {
		var s = '', activeID = ui.navigation.getActiveID();
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Contact(), l, i);
			var image, text, flag1, flag2, flag3, birth = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
			if (v.imageList)
				image = global.serverImg + v.imageList;
			else
				image = 'images/contact.svg';
			var skills = ui.getSkills(v, 'list');
			flag1 = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
			if (skills.total && skills.totalMatch / skills.total > 0)
				flag2 = parseInt('' + (skills.totalMatch / skills.total * 100 + 0.5)) + '%';
			flag3 = v.gender ? '<img src="images/gender' + v.gender + '.svg"/>' : '';
			if (!v._message1)
				v._message1 = skills.text();
			if (!v._message2)
				v._message2 = v.description;
			text = v._message1 ? v._message1 + '<br/>' : '';
			text += v._message2 ? v._message2 : '';
			var oc;
			if (activeID == 'detail')
				oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)';
			else if (activeID == 'settings')
				oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
			else if (activeID == 'info')
				oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)';
			else if (v.contactNotification.id)
				oc = 'details.open(' + v.id + ',' + JSON.stringify({ webCall: 'pageContact.listContacts(l)', query: 'contact_listNotification', search: encodeURIComponent('contactNotification.id=' + v.contactNotification.id) }).replace(/"/g, '&quot;') + ',pageContact.detail)';
			else
				oc = 'details.open(' + v.id + ',' + JSON.stringify({ webCall: 'pageContact.listContacts(l)', query: 'contact_list', search: encodeURIComponent('contact.id=' + v.id) }).replace(/"/g, '&quot;') + ',pageContact.detail)';
			s += global.template`<list-row onclick="${oc}" i="${v.id}" class="contact${v.contactLink.status == 'Friends' ? ' favorite' : ''}"
				title="${encodeURIComponent(v.pseudonym + (birth.age ? ' (' + birth.age + ')' : ''))}"
				text="${encodeURIComponent(text)}"
				flag1="${flag1}"
				flag2="${flag2}"
				flag3="${encodeURIComponent(flag3)}"
				image="${image}"
				badge="${v.authenticate ? 'authenticated' : ''}"></list-row>`;
		}
		return s;
	}
	static sendRequestForFriendship(id) {
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageContact.sendRequestForFriendship(id)',
			method: 'POST',
			body: { classname: 'ContactLink', values: { contactId2: id } },
			success() {
				if (ui.q('popupContent'))
					ui.navigation.closePopup();
				else {
					var e = ui.q('detail card:last-child[i="' + id + '"] [name="friend"] button-text');
					if (e)
						e.outerHTML = '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
					else
						ui.navigation.openPopup(ui.l('contacts.requestFriendshipButton'), ui.l('contacts.requestFriendshipSent'));
				}
			}
		});
	}
	static toggleFriend(id) {
		details.togglePanel(ui.q('detail card:last-child[i="' + id + '"] [name="friend"]'));
	}
	static toggleBlockUser(id) {
		var divID = 'detail card:last-child[i="' + id + '"] [name="block"]';
		var e = ui.q(divID);
		if (!e.getAttribute('blockID')) {
			communication.ajax({
				url: global.serverApi + 'db/one?query=misc_block&search=' + encodeURIComponent('block.contactId=' + user.contact.id + ' and block.contactId2=' + id),
				webCall: 'pageContact.toggleBlockUser(id)',
				success(r) {
					if (r) {
						var v = JSON.parse(r);
						ui.attr(e, 'blockID', v.block.id);
						ui.qa(divID + ' input')[v.block.note ? 1 : 0].setAttribute('checked', 'true');
						if (v.block.reason != 0)
							ui.q(divID + ' [name="reason"][value="' + v.block.reason + '"]').setAttribute('checked', 'true');
						ui.q(divID + ' textarea').value = v.reason;
					} else
						ui.attr(e, 'blockID', 0);
				}
			});
		}
		details.togglePanel(e);
	}
	static toggleLocation(id) {
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="location"]');
		if (!e.innerHTML) {
			lists.load({
				webCall: 'pageContact.toggleLocation(id)',
				latitude: geoData.current.lat,
				longitude: geoData.current.lon,
				distance: 100000,
				query: 'location_list',
				search: encodeURIComponent('location.contactId=' + id)
			}, function (l) {
				var s = pageLocation.listLocation(l);
				if (s) {
					e.innerHTML = ui.l('locations.my') + '<br/>' + s;
					var rows = ui.qa('detail card:last-child[i="' + id + '"] [name="location"] list-row');
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
		var e = ui.q('detail card:last-child[i="' + id + '"] [name="matchIndicatorHint"]');
		var button = ui.parents(event.target, 'matchIndicator');
		e.style.top = (button.offsetTop + button.offsetHeight) + 'px';
		e.style.left = '5%';
		ui.toggleHeight(e);
	}
}

class groups {
	static addGroup(id) {
		ui.navigation.openPopup(ui.l('group.newButton'), '<field style="padding:1em;"><label>' + ui.l('name') + '</label><value><input type="text" name="name"/></value></field><dialogButtons><button-text onclick="groups.saveGroup(' + id + ');" label="save"></button-text></dialogButtons>');
	}
	static addToGroup(event, id) {
		var d = { classname: 'ContactGroupLink' }, e = event.target;
		if (e.getAttribute('checked') == 'true' && !e.getAttribute('gllID')) {
			d.values = {};
			d.values.contactId2 = id;
			d.values.contactGroupId = e.getAttribute('value');
		} else if (e.getAttribute('checked') != 'true' && e.getAttribute('gllID'))
			d.id = e.getAttribute('gllID');
		if (d) {
			communication.ajax({
				url: global.serverApi + 'db/one',
				body: d,
				webCall: 'pageContact.addToGroup(event,id)',
				method: d.id ? 'DELETE' : 'POST',
				pos: e.getAttribute('value'),
				success(r) {
					var e2 = ui.q('detail card:last-child[i="' + id + '"] [name="groups"] input[value="' + this.pos + '"]');
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
	}
	static delete() {
		if (ui.q('input-checkbox[name="groupdialog"][checked="true"]'))
			return;
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: 'DELETE',
			webCall: 'pageContact.delete()',
			body: { classname: 'ContactGroup', id: ui.q('input-checkbox[name="groupdialog"][checked="true"]').getAttribute('value') },
			success() {
				groups.getGroups(function () {
					var s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="groups.loadListGroups()"');
					if (s.indexOf('<input-checkbox') > -1)
						s = s.replace('<input-checkbox', '<input-checkbox checked="true"');
					ui.html('groups', '<div>' + s + '</div>');
					formFunc.initFields(ui.q('groups'));
					ui.css('#groupsDelete', 'display', 'none');
					ui.html('contacts listResults', '');
				});
			}
		});
	}
	static getGroups(exec) {
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listGroup&search=' + encodeURIComponent('contactGroup.contactId=' + user.contact.id),
			webCall: 'pageContact.getGroups(exec)',
			responseType: 'json',
			success(r) {
				groups.setGroups(r);
				if (exec)
					exec.call();
			}
		});
	}
	static loadListGroups() {
		var v = ui.q('input-checkbox[name="groupdialog"][checked="true"]').getAttribute('value');
		if (!v)
			return;
		lists.load({
			webCall: 'pageContact.loadListGroups()',
			latitude: geoData.current.lat,
			longitude: geoData.current.lon,
			query: 'contact_listGroupLink',
			search: encodeURIComponent('contactGroupLink.contactGroupId=' + v)
		}, pageContact.listContacts, 'contacts', 'groups');
	}
	static open() {
		var activeID = ui.navigation.getActiveID();
		var e = ui.qa('menu a');
		for (var i = 0; i < e.length; i++) {
			if (e[i].matches(':hover')) {
				ui.attr(activeID, 'menuIndex', i);
				break;
			}
		}
		if (user.contact.groups == null) {
			groups.getGroups(groups.open);
			return;
		}
		var s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="groups.loadListGroups()"');
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
				formFunc.initFields(ui.q(activeID + ' groups'));
			}
			ui.q('[name="groupdialog"]').setAttribute('checked', 'false');
			ui.css(e, 'display', '');
			ui.navigation.hideMenu();
		} else {
			ui.html(activeID + ' listResults', lists.getListNoResults(activeID, 'noGroups'));
			lists.setListHint('contacts');
		}
	}
	static rename() {
		if (ui.q('input-checkbox[name="groupdialog"][checked="true"]'))
			return;
		var s = ui.q('#groupsRename').children[0].value;
		if (s.trim().length == 0)
			return;
		s = s.replace(/</g, '&lt;');
		ui.q('#groupsRename').children[0].value = s;
		communication.ajax({
			url: global.serverApi + 'db/one',
			responseType: 'json',
			webCall: 'pageContact.rename()',
			method: 'PUT',
			body: { classname: 'ContactGroup', id: ui.q('input-checkbox[name="groupdialog"][checked="true"]').getAttribute('value'), values: { name: s } },
			success(r) {
				groups.getGroups();
				var s = ui.q('#groupsRename').children[0].value;
				var e = ui.q('input-checkbox[name="groupdialog"][checked="true"]');
				ui.attr(e, 'label', s);
				e.nextSibling.innerHTML = s;
				ui.css('#groupsRename', 'display', 'none');
			}
		});
	}
	static saveGroup(id) {
		var e = ui.q('popup input[name="name"]');
		if (!e.value)
			return;
		communication.ajax({
			url: global.serverApi + 'db/one',
			method: 'POST',
			webCall: 'pageContact.saveGroup(id)',
			body: { classname: 'ContactGroup', values: { name: e.value.replace(/</g, '&lt;') } },
			success() {
				ui.navigation.closePopup();
				groups.getGroups(function () {
					var e2 = ui.qa('[name="groups"] detailTogglePanel input-checkbox[checked="true"]'), e3 = ui.q('[i="' + id + '"] [name="groups"] detailTogglePanel');
					var s = e3.innerHTML;
					e3.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="groups.addToGroup(event,' + id + ');"') + s.substring(s.indexOf('<br>'));
					formFunc.initFields(ui.q('[i="' + id + '"] [name="groups"]'));
					for (var i = 0; i < e2.length; i++)
						ui.attr('[i="' + id + '"] [name="groups"] input[value="' + e2[i].value + '"]', 'checked', 'true');
					e3 = ui.q('groups > div');
					if (e2 && e3.innerHTML) {
						s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="groups.loadListGroups()"');
						var c = ui.val('groups input-checkbox[checked="true"]');
						e3.innerHTML = s.replace('value="' + c + '"', 'value="' + c + '" checked="true"');
						formFunc.initFields(ui.q('groups'));
					}
				});
			}
		});
	}
	static setGroups(r) {
		var s = '';
		for (var i = 1; i < r.length; i++) {
			var v = model.convert(new ContactGroup(), r, i);
			s += '<input-checkbox name="groupdialog" value="' + v.id + '" label="' + v.name + '"></input-checkbox>';
		}
		user.contact.groups = s;
	}
	static showRename() {
		ui.css('#groupsDelete', 'display', 'none');
		var e = ui.q('#groupsRename');
		e.style.display = e.style.display == 'block' ? 'none' : 'block';
		e.children[0].value = ui.q('input-checkbox[name="groupdialog"][checked="true"]').getAttribute('label');
	}
	static toggleGroups(id, friendship) {
		if (user.contact.groups == null) {
			groups.getGroups(function () {
				groups.toggleGroups(id);
			});
			return;
		}
		var path = 'detail card:last-child[i="' + id + '"] [name="groups"] detailTogglePanel';
		var e = ui.q(path);
		if (!e.innerHTML) {
			if (friendship != 'Friends') {
				if (!e.innerHTML) {
					if (friendship != 'Terminated' && friendship != 'Terminated2')
						e.innerHTML = ui.l('contacts.denyAddToGroup');
					else
						e.innerHTML = ui.l('contacts.requestFriendship' + (friendship == 'Pending' ? 'AlreadySent' : 'Canceled'));
				}
				ui.css(path.substring(0, path.lastIndexOf(' ')) + '>button-text', 'display', 'none');
				details.togglePanel(e.parentNode);
				return;
			}
			e.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="groups.addToGroup(event,' + id + ')"') + e.innerHTML;
			formFunc.initFields(ui.q(path));
			communication.ajax({
				url: global.serverApi + 'db/list?query=contact_listGroupLink&search=' + encodeURIComponent('contactGroupLink.contactId2=' + id),
				webCall: 'pageContact.toggleGroups(id,friendship)',
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