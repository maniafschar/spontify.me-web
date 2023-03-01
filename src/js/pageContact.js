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
			${formFunc.image.getSVG('favorite')}
		</imagelist>
	</div>
	</row>`;
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
${v.aboutMe}
${v.urls}
${v.rating}
<text${v.birthdayClass}>
	${v.birthday}
</text>
${v.skills}
${v.matchIndicatorHintDescription}
<detailButtons style="margin-top:1em;">
	<buttontext class="bgColor${v.loggedIn}"
		onclick="ui.navigation.goTo(&quot;login&quot;)">${ui.l('login.action')}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}"
		onclick="pageChat.open(${v.id})">${ui.l('chat.title')}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonFriend"
		onclick="pageContact.toggleFriend(${v.id})">${v.labelFriend}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;p=${v.id}&quot;)">${ui.l('chat.share')}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonGroups"
		onclick="groups.toggleGroups(${v.id},&quot;${v.contactLinkStatus}&quot;)">${ui.l('group.action')}</buttontext>
	<buttontext class="bgColor${v.blocked}" name="buttonEvents"
		onclick="pageEvent.toggle(${v.id})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor${v.blocked}" name="buttonLocation"
		onclick="pageContact.toggleLocation(${v.id})">${ui.l('locations.title')}</buttontext>
	<buttontext class="bgColor${v.blocked}${v.hideMe}" name="buttonBlock"
		onclick="pageContact.toggleBlockUser(${v.id})">${ui.l('contacts.blockAction')}</buttontext>
</detailButtons>
<text name="friend" class="collapsed">
	<div style="padding:2em 0;">
		${v.link}
	</div>
</text>
<text name="block" class="collapsed">
	<div style="padding:1em 0;">
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
<text name="events" class="collapsed list"></text>
<text name="groups" class="collapsed">
	<detailTogglePanel></detailTogglePanel>
	<buttontext onclick="groups.addGroup(${v.id})" class="bgColor" style="margin-top:1em;">${ui.l('group.newButton')}</buttontext>
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
<buttontext style="margin-top:0.5em;" class="bgColor" onclick="groups.showRename()">
    ${ui.l('rename')}
</buttontext>
<buttontext style="margin-top:0.5em;" class="bgColor"
    onclick="document.getElementById(&quot;groupsRename&quot;).style.display=&quot;none&quot;;var e=document.getElementById(&quot;groupsDelete&quot;).style;e.display=e.display==&quot;none&quot;?&quot;&quot;:&quot;none&quot;;">
    ${ui.l('delete')}
</buttontext>
<buttontext style="margin-top:0.5em;display:none;" class="bgColor" onclick="pageChat.openGroup()">
    ${ui.l('chat.groupTitle')}
</buttontext>
<br />
<div id="groupsRename" style="display:none;margin-top:2em;">
    <input type="text" style="width:40%;margin-right:0.5em;float:none;" />
    <buttontext onclick="groups.rename()" class="bgColor">${ui.l('save')}</buttontext>
</div>
<buttontext onclick="groups.delete()" id="groupsDelete" style="display:none;margin-top:2em;"
    class="bgColor">
    ${ui.l('confirmDelete')}
</buttontext>`;
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
		if (!ui.q(path + ' [name="type"]').checked) {
			var n = ui.q(path + ' [name="note"]');
			if (!n.value && ui.q(path + ' [name="reason"][value="100"]:checked')) {
				formFunc.setError(n, 'contacts.blockActionHint');
				return;
			}
			v.values.reason = ui.val(path + ' [name="reason"]:checked');
			v.values.note = n.value;
		}
		communication.ajax({
			url: global.server + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			webCall: 'pageContact.block()',
			body: v,
			success() {
				var e = ui.q('contacts [i="' + id + '"]');
				if (e) {
					e.outerHTML = '';
					lists.setListHint('contacts');
				}
				ui.navigation.goTo('contacts');
			}
		});
	}
	static confirmFriendship(linkId, status, id) {
		communication.ajax({
			url: global.server + 'db/one',
			webCall: 'pageContact.confirmFriendship(linkId,status,id)',
			method: 'PUT',
			body: { classname: 'ContactLink', id: linkId, values: { status: status } },
			success() {
				ui.toggleHeight(ui.q('detail card:last-child [name="friend"]'));
				var e = ui.qa(ui.q('detail').getAttribute('from') + ' row[i="' + id + '"] badge');
				ui.html(e, '');
				ui.css(e, 'display', 'none');
				if (status == 'Friends') {
					ui.classAdd('main>buttonIcon.bottom.right', 'highlight');
					ui.classRemove('detail card:last-child[i="' + id + '"] [name="buttonGroups"]', 'noDisp');
				} else {
					ui.classRemove('main>buttonIcon.bottom.right', 'highlight');
					ui.classAdd('detail card:last-child[i="' + id + '"] [name="buttonGroups"]', 'noDisp');
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
			v.loggedIn = ' noDisp';
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
		v.labelFriend = ui.l('contacts.requestFriendshipButton');
		if (v.contactLink.id) {
			if (v.contactLink.status == 'Pending') {
				if (v.contactLink.contactId != user.contact.id)
					v.link += '<div style="margin-bottom:0.5em;">' + ui.l('contacts.requestFriendshipHint') + '</div><buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + v.id + ')" style="margin:0 0.5em;">' + ui.l('contacts.requestFriendshipConfirm') + '</buttontext><buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Rejected&quot;,' + v.id + ');" style="margin:0 0.5em;">' + ui.l('contacts.requestFriendshipReject') + '</buttontext>';
				else
					v.link += '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
			} else if (v.contactLink.status == 'Friends') {
				v.labelFriend = ui.l('contacts.terminateFriendship');
				v.link += '<buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;' + (v.contactLink.contactId == user.contact.id ? 'Terminated' : 'Terminated2') + '&quot;,' + v.id + ')">' + ui.l('contacts.terminateFriendshipConfirm') + '</buttontext>';
			} else if (v.contactLink.status == 'Terminated' && v.contactLink.contactId == user.contact.id || v.contactLink.status == 'Terminated2' && v.contactLink.contactId2 == user.contact.id)
				v.link += '<buttontext class="bgColor" onclick="pageContact.confirmFriendship(' + v.contactLink.id + ',&quot;Friends&quot;,' + v.id + ')">' + ui.l('contacts.requestFriendshipRestart') + '</buttontext>';
			else
				v.link += ui.l('contacts.requestFriendshipCanceled');
		} else
			v.link += '<buttontext class="bgColor" onclick="pageContact.sendRequestForFriendship(' + v.id + ')">' + ui.l('contacts.requestFriendship') + '</buttontext>';
		if (v.contactLink.status == 'Friends')
			v.favorite = 'favorite';
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
			v.blocked = ' noDisp';
		else if (user.contact.id == v.id)
			v.hideMe = ' noDisp';
		if (!user.contact)
			v.hideNotLoggedIn = ' noDisp';
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
			v.rating = '<detailRating onclick="ratings.open(null,&quot;' + 'event.contactId=' + v.id + '&quot;)"><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></detailRating>';
		else
			v.rating = '';
		if (global.isBrowser())
			v.displaySocialShare = 'display:none;';
		if (v.aboutMe)
			v.aboutMe = (v.guide ? '<guide>' + ui.l('settings.guide') + '</guide>' : '') + '<text class="description">' + Strings.replaceLinks(v.aboutMe.replace(/\n/g, '<br/>')) + '</text>';
		else if (preview)
			v.aboutMe = '<previewHint>' + ui.l('settings.previewHintAboutMe') + '</previewHint>';
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
			var d1 = global.date.server2Local(b), d2 = new Date();
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
		if (!ui.q('contacts listResults row'))
			setTimeout(ui.navigation.toggleMenu, 500);
	}
	static listContacts(l) {
		var s = '', activeID = ui.navigation.getActiveID();
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Contact(), l, i);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/contact.svg" style="padding:1em;';
			v.classBGImg = v.imageList ? '' : 'mainBG';
			if (v.contactLink.status == 'Friends')
				v.classFavorite = ' favorite';
			var skills = ui.getSkills(v, 'list');
			v.extra = (v._geolocationDistance ? '<km>' + parseFloat(v._geolocationDistance).toFixed(0) + '</km>' : '') + '<br/>';
			if (skills.total && skills.totalMatch / skills.total > 0)
				v.extra += parseInt(skills.totalMatch / skills.total * 100 + 0.5) + '%';
			if (v.gender)
				v.extra += '<br/><img src="images/gender' + v.gender + '.svg" />';
			if (!v._message1)
				v._message1 = skills.text();
			var birth = pageContact.getBirthday(v.birthday, v.birthdayDisplay);
			if (birth.age)
				v.birth = ' (' + birth.age + ')';
			if (!v._message2)
				v._message2 = v.aboutMe;
			v._message = v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			v.dist = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(0) : '';
			if (!v._badgeDisp) {
				v._badgeDisp = birth.present ? 'block' : 'none';
				v._badge = birth.present ? birth.present : 0;
			}
			v.badgeAction = birth.present ? '' : 'remove';
			if (activeID == 'detail')
				v.oc = 'ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)';
			else if (activeID == 'settings')
				v.oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
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
	static sendRequestForFriendship(id) {
		communication.ajax({
			url: global.server + 'db/one',
			webCall: 'pageContact.sendRequestForFriendship(id)',
			method: 'POST',
			body: { classname: 'ContactLink', values: { contactId2: id } },
			success() {
				if (ui.q('popupContent'))
					ui.navigation.closePopup();
				else {
					var e = ui.q('detail card:last-child[i="' + id + '"] [name="friend"] buttontext');
					if (e)
						e.outerHTML = '<span style="text-align:center;">' + ui.l('contacts.requestFriendshipAlreadySent') + '</span>';
					else
						ui.navigation.openPopup(ui.l('contacts.requestFriendshipButton'), ui.l('contacts.requestFriendshipSent'));
				}
			}
		});
	}
	static showBlockText() {
		var s = ui.q('detail card:last-child [name="block"] [name="type"]:checked').value == 2 ? 'block' : 'none';
		ui.css(ui.q('detail card:last-child [name="block"] [name="reason"]').parentNode, 'display', s);
		ui.css('detail card:last-child [name="block"] [name="note"]', 'display', s);
	}
	static toggleFriend(id) {
		details.togglePanel(ui.q('detail card:last-child[i="' + id + '"] [name="friend"]'));
	}
	static toggleBlockUser(id) {
		var divID = 'detail card:last-child[i="' + id + '"] [name="block"]';
		var e = ui.q(divID);
		if (!e.getAttribute('blockID')) {
			communication.ajax({
				url: global.server + 'db/one?query=misc_block&search=' + encodeURIComponent('block.contactId=' + user.contact.id + ' and block.contactId2=' + id),
				webCall: 'pageContact.toggleBlockUser(id)',
				success(r) {
					if (r) {
						var v = JSON.parse(r);
						ui.attr(e, 'blockID', v.block.id);
						ui.qa(divID + ' input')[v.block.note ? 1 : 0].checked = true;
						if (v.block.reason != 0)
							ui.q(divID + ' [name="reason"][value="' + v.block.reason + '"]').checked = true;
						ui.q(divID + ' textarea').value = v.reason;
						pageContact.showBlockText();
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
			lists.load('webCall=pageContact.toggleLocation(id)&latitude=' + geoData.current.lat + '&longitude=' + geoData.current.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent('location.contactId=' + id), function (l) {
				var s = pageLocation.listLocation(l);
				if (s) {
					e.innerHTML = ui.l('locations.my') + '<br/>' + s;
					var rows = ui.qa('detail card:last-child[i="' + id + '"] [name="location"] row');
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
		ui.navigation.openPopup(ui.l('group.newButton'), '<field style="padding:1em;"><label>' + ui.l('name') + '</label><value><input type="text" name="name"/></value></field><dialogButtons><buttontext class="bgColor" onclick="groups.saveGroup(' + id + ');">' + ui.l('save') + '</buttontext></dialogButtons>');
	}
	static addToGroup(event, id) {
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
		if (ui.q('input[name="groupdialog"]:checked'))
			return;
		communication.ajax({
			url: global.server + 'db/one',
			method: 'DELETE',
			webCall: 'pageContact.delete()',
			body: { classname: 'ContactGroup', id: ui.q('input[name="groupdialog"]:checked').getAttribute('value') },
			success() {
				groups.getGroups(function () {
					var s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="groups.loadListGroups()"');
					if (s.indexOf('<input') > -1)
						s = s.replace('<input', '<input checked="true"');
					ui.html('groups', '<div>' + s + '</div>');
					formFunc.initFields('groups');
					ui.css('#groupsDelete', 'display', 'none');
					ui.html('contacts listResults', '');
				});
			}
		});
	}
	static getGroups(exec) {
		communication.ajax({
			url: global.server + 'db/list?query=contact_listGroup&search=' + encodeURIComponent('contactGroup.contactId=' + user.contact.id),
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
		var v = ui.q('input[name="groupdialog"]:checked').getAttribute('value');
		if (!v)
			return;
		lists.load('webCall=pageContact.loadListGroups()&latitude=' + geoData.current.lat + '&longitude=' + geoData.current.lon + '&query=contact_listGroupLink&search=' + encodeURIComponent('contactGroupLink.contactGroupId=' + v), pageContact.listContacts, 'contacts', 'groups');
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
				formFunc.initFields(activeID + ' groups');
			}
			ui.q('[name="groupdialog"]').checked = false;
			ui.css(e, 'display', '');
			ui.navigation.hideMenu();
		} else {
			ui.html(activeID + ' listResults', lists.getListNoResults(activeID, 'noGroups'));
			lists.setListHint('contacts');
		}
	}
	static rename() {
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
			webCall: 'pageContact.rename()',
			method: 'PUT',
			body: { classname: 'ContactGroup', id: ui.q('input[name="groupdialog"]:checked').getAttribute('value'), values: { name: s } },
			success(r) {
				groups.getGroups();
				var s = ui.q('#groupsRename').children[0].value;
				var e = ui.q('input[name="groupdialog"]:checked');
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
			url: global.server + 'db/one',
			method: 'POST',
			webCall: 'pageContact.saveGroup(id)',
			body: { classname: 'ContactGroup', values: { name: e.value.replace(/</g, '&lt;') } },
			success() {
				ui.navigation.closePopup();
				groups.getGroups(function () {
					var e2 = ui.qa('[name="groups"] detailTogglePanel input:checked'), e3 = ui.q('[i="' + id + '"] [name="groups"] detailTogglePanel');
					var s = e3.innerHTML;
					e3.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="groups.addToGroup(event,' + id + ');"') + s.substring(s.indexOf('<br>'));
					formFunc.initFields('[i="' + id + '"] [name="groups"]');
					for (var i = 0; i < e2.length; i++)
						ui.attr('[i="' + id + '"] [name="groups"] input[value="' + e2[i].value + '"]', 'checked', 'checked');
					e3 = ui.q('groups > div');
					if (e2 && e3.innerHTML) {
						s = user.contact.groups.replace(/type="checkbox"/g, 'type="radio"').replace(/<input /g, '<input onclick="groups.loadListGroups()"');
						var c = ui.val('groups input:checked');
						e3.innerHTML = s.replace('value="' + c + '"', 'value="' + c + '" checked="true"');
						formFunc.initFields('groups');
					}
				});
			}
		});
	}
	static setGroups(r) {
		var s = '';
		for (var i = 1; i < r.length; i++) {
			var v = model.convert(new ContactGroup(), r, i);
			s += '<input type="checkbox" name="groupdialog" value="' + v.id + '" label="' + v.name + '"/>';
		}
		user.contact.groups = s;
	}
	static showRename() {
		ui.css('#groupsDelete', 'display', 'none');
		var e = ui.q('#groupsRename');
		e.style.display = e.style.display == 'block' ? 'none' : 'block';
		e.children[0].value = ui.q('input[name="groupdialog"]:checked').getAttribute('label');
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
				ui.css(path.substring(0, path.lastIndexOf(' ')) + '>buttontext', 'display', 'none');
				details.togglePanel(e.parentNode);
				return;
			}
			e.innerHTML = user.contact.groups.replace(/<input/g, '<input onclick="groups.addToGroup(event,' + id + ')"') + e.innerHTML;
			formFunc.initFields(path);
			communication.ajax({
				url: global.server + 'db/list?query=contact_listGroupLink&search=' + encodeURIComponent('contactGroupLink.contactId2=' + id),
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