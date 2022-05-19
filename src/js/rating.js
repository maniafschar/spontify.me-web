import { communication } from './communication';
import { global } from './global';
import { Contact, Location, model } from './model';
import { ui, formFunc } from './ui';
import { user } from './user';

export { rating };

class rating {
	static ratings = null;
	static templateBonus = v =>
		global.template`<div style="text-align:center;padding-top:1em;font-size:1.2em;">
	<div style="padding:0 1em;">
		<img src="${v.userImage}" class="ratingBonusImg${v.bg}"/>
		<ratingBonusCaption style="padding-left:1em;">
			${v.username}
		</ratingBonusCaption>
		<img src="${v.locImage}" class="ratingBonusImg${v.bgLoc}" style="margin-left:-10%;"/>
		<ratingBonusCaption style="left:45%;padding-right:1em;">
			${v['location.name']}
		</ratingBonusCaption>
	</div>
	<div style="padding:3.5em 1em 2em 1em;">
		${v.text}
	</div>
	<div style="color:red;${v.hidePaid}">
		${ui.l('locations.ratedBonusPagePaidOut')}
	</div>
	<a class="${v.bg} fmg_text_button" onclick="rating.confirmBonusPaidOut(${v['locationRating.id']});" style="border-radius:8em;margin:0 1em;${v.hideButton}">${v.button}</a>
	<br/><br/>
</div>`;
	static templateForm = v =>
		global.template`<ratingSelection>
    <empty><span>☆</span><span onclick="rating.click(2)">☆</span><span
            onclick="rating.click(3)">☆</span><span onclick="rating.click(4)">☆</span><span
            onclick="rating.click(5)">☆</span></empty>
    <full><span onclick="rating.click(1)">★</span><span onclick="rating.click(2)">★</span><span
            onclick="rating.click(3)">★</span><span onclick="rating.click(4)">★</span><span
            onclick="rating.click(5)" style="display:none;">★</span></full>
</ratingSelection>
<div style="clear:both;text-align:center;padding:0.5em 1em 0 1em;margin-bottom:0.5em;">
    <form name="ratingForm">
        <input type="hidden" id="owner" value="${v.owner}" />
        <input type="hidden" id="type" value="${v.type}" />
        <input type="hidden" id="cid" value="${v.id}" />
        <input type="hidden" name="${v.column}" value="${v.id}" />
        <input type="hidden" name="rating" value="80" />
        <textarea maxlength="250" placeholder="${ui.l('locations.shortDesc')}" name="text" ${v.textareaStyle}>${v.draft}</textarea>
        <errorHint></errorHint>
        <field class="${v.showImage}" style="margin:0.5em 0 0 0;">
            <input type="file" name="image" accept=".gif, .png, .jpg" />
        </field>
        <buttontext onclick="rating.save(this);" type="${v.type}" oId="${v.id}"
            class="${v.bg}" style="margin-top:0.5em;">${ui.l('rating.save')}</buttontext>
    </form>
</div>`;
	static templateHistory = v =>
		global.template`<div onclick="rating.openHistory(&quot;${v.type}&quot;,${v.id});" style="margin:1em 0;cursor:pointer;">${ui.l('rating.history')}</div>
<ratingHistory style="display:none;"></ratingHistory>`;

	static click(x) {
		var e = ui.qa('popup ratingSelection > full span');
		ui.css(e, 'display', 'none');
		for (var i = 0; i < x; i++)
			ui.css(e[i], 'display', '');
		ui.q('popup [name="rating"]').value = x * 20;
	}
	static confirmBonusPaidOut(id) {
		communication.ajax({
			url: global.server + 'db/one',
			method: 'PUT',
			body: { classname: 'LocationRating', id: id, values: { paid: 1 } },
			success(r) {
				if (r == 'ok')
					ui.navigation.hidePopup();
				else
					ui.navigation.openPopup(ui.l('attention'), ui.l('error.text'));
			}
		});
	}
	static getForm(id, t, file, owner) {
		var v = [], draft = formFunc.getDraft('rating' + t + id);
		v.id = id;
		v.owner = owner ? owner : '';
		v.type = t;
		v.bg = 'bgColor';
		v.column = t == 'location' ? 'locationId' : 'contactId2';
		v.showImage = t == 'location' && file != false ? '' : ' noDisp';
		if (draft)
			v.draft = draft['RATING_' + t + '.TEXT'];
		return rating.templateForm(v);
	}
	static open(id, t, event) {
		var name = ui.q('detail:not([style*="none"]) title, [i="' + id + '"] title').innerText.trim();
		if (!user.contact) {
			ui.navigation.openPopup(ui.l('rating.title') + name, ui.l('rating.login') + '<br/><br/><buttontext class="bgColor" onclick="pageLogin.goToLogin()">' + ui.l('login.action') + '</buttontext>');
			return;
		}
		event.stopPropagation();
		communication.ajax({
			url: global.server + 'db/one?query=' + t + '_ratingOverview&id=' + id,
			responseType: 'json',
			success(r) {
				var f = r._lastRating;
				if (f) {
					f = f.split(' ');
					f = f[0] + ' ' + f[1];
					f = global.date.getDate(f);
				}
				if (r._lastRating && (new Date().getTime() - f) / 86400000 < 7) {
					if (t == 'location' && new Date().getTime() - f < 7200000 && r[3]) {
						rating.showRatedBonusPage(r._lastRating.split(' ')[3]);
						return;
					}
					f = '<ratingHint>' + ui.l('rating.lastRate').replace('{0}', global.date.formatDate(f)).replace('{1}', '<br/><br/><rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + parseInt(r._lastRating.split(' ')[2])) + '%;">★★★★★</full></rating><br/><br/>') + '</ratingHint>';
				} else if (t == 'contact' && id == user.contact.id)
					f = '<ratingHint>' + ui.l('rating.notYourself') + '</ratingHint>';
				else if (t == 'contact' && r._contactLink != 1)
					f = '<ratingHint>' + ui.l('rating.onlyFriends') + '<br/><buttontext class="bgColor" onclick="pageContact.sendRequestForFriendship(' + id + ');" style="margin:1em 0;">' + ui.l('contacts.requestFriendship') + '</buttontext></ratingHint>';
				else
					f = rating.getForm(id, t, true, r._ownerId);
				ui.html('detail [name="favLoc"]', '');
				if (r._one || r._two || r._three || r._four) {
					r.id = id;
					r.type = t;
					r.classBG = 'bgColor';
					ui.navigation.openPopup(ui.l('rating.title') + name, '<div style="padding:1em 0 0 0;text-align:center;">' + f + rating.templateHistory(r) + '</div>', 'rating.saveDraft()');
				} else
					ui.navigation.openPopup(ui.l('rating.title') + name, '<div style="padding:1em 0 0 0;text-align:center;">' + f + (f.indexOf('</buttontext>') < 0 ? '<buttontext class="bgColor" onclick="ui.navigation.hidePopup()" style="margin-bottom:1em;">' + ui.l('ready') + '</buttontext>' : '') + '</div>', 'rating.saveDraft()');
			}
		});
	}
	static openHistory(t, id) {
		if (!ui.q('ratingHistory').innerHTML) {
			ui.html('ratingHistory', '.');
			communication.ajax({
				url: global.server + 'db/list?query=' + t + '_rating&search=' + encodeURIComponent(t + (t == 'location' ? '.id=' : 'Rating.contactId2=') + id),
				responseType: 'json',
				success(r) {
					var s = '', date, pseudonym, text, img, rate;
					for (var i = r.length - 1; i > 0; i--) {
						var v = model.convert(t == 'location' ? new Location() : new Contact(), r, i), v2 = v[t + 'Rating'];
						date = global.date.formatDate(v2.modifiedAt);
						pseudonym = v.contactId == user.contact.id ? ui.l('you') : v.pseudonym || v.contact.pseudonym;
						text = v2.text ? ': ' + v2.text : '';
						img = v2.image ? '<br/><img src="' + global.serverImg + v2.image + '"/>' : '';
						s += '<ratingItem';
						rate = '<rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v2.rating) + '%;">★★★★★</full></rating>';
						if (v2.contactId != user.contact.id)
							s += ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v2.contactId) + '&quot;);" style="cursor:pointer;"';
						s += '>' + rate + date + ' ' + pseudonym + text + img + '</ratingItem>';
					}
					if (s) {
						ui.html('ratingHistory', s);
						rating.openHistory();
					}
				}
			});
		} else
			ui.toggleHeight('ratingHistory');
	}
	static postSave(r) {
		var e = ui.qa('[name="r' + r.type.substring(0, 1) + r.cid + '"]');
		for (var i = 0; i < e.length; i++) {
			if (e[i].innerText == '-')
				e[i].innerText = '' + parseInt(0.5 + s[2]);
		}
		if (r.type == 'location' && r.ratings)
			rating.showRatedBonusPage(r.id);
		else
			ui.navigation.hidePopup();
		formFunc.removeDraft('rating' + r.type + r.cid);
		e = ui.q('#inlineRating' + r.cid);
		if (e)
			e.innerHTML = ui.l('rating.saved');
	}
	static save(button) {
		var e = ui.q('[name="text"]');
		ui.classRemove(e, 'dialogFieldError');
		if (ui.val('popup [name="rating"]') < 25 && !e.value) {
			ui.classAdd(e, 'dialogFieldError');
			e.nextSibling.innerHTML = ui.l('rating.negativeRateValidation');
			return;
		}
		var data = {
			type: ui.val('#type'),
			cid: ui.val('#cid'),
			ratings: ui.val('[name="ratings"]'),
			owner: ui.val('#owner')
		};
		var v = formFunc.getForm('ratingForm');
		v.classname = button.getAttribute('type') == 'location' ? 'LocationRating' : 'ContactRating';
		communication.ajax({
			url: global.server + 'db/one',
			method: 'POST',
			body: v,
			success(r) {
				data.id = r;
				rating.postSave(data);
			}
		});
	}
	static saveDraft() {
		formFunc.saveDraft('rating' + ui.val('#type') + ui.val('#cid'), formFunc.getForm('ratingForm'));
	}
	static showRatedBonusPage(id) {
		communication.ajax({
			url: global.server + 'db/one?query=locationRating&search=' + encodeURIComponent('locationRating.id=' + id + ' and locationRating.contactId=' + user.contact.id),
			responseType: 'json',
			success(v) {
				var time = v['rating_location.modifiedAt'] ? ((new Date().getTime() - global.date.getDate(v['rating_location.modifiedAt'])) / 60000).toFixed(0) : 0;
				if (time < 3)
					time = null;
				if (user.contact.image)
					v['userImage'] = global.serverImg + user.contact.image;
				else
					v['userImage'] = 'images/contact.svg';
				if (v['location.image'])
					v['locImage'] = global.serverImg + v['location.image'];
				else {
					v['locImage'] = 'images/location.svg';
					v['bgLoc'] = ' bgBonus';
				}
				v['bg'] = 'bgColor';
				v['username'] = user.contact.pseudonym;
				v['hideButton'] = v['rating_location.paid'] == 1 ? 'display:none;' : '';
				v['hidePaid'] = v['rating_location.paid'] == 1 ? '' : 'display:none;';
				v['text'] = ui.l('locations.ratedBonusPage').replace('{0}', time ? ui.l('locations.ratedBonusPageTime').replace('{0}', time) : ui.l('locations.ratedBonusPageTimeJustNow'));
				v['button'] = ui.l('locations.ratedBonusPageButton').replace('{0}', '<br/><br/>' + v['location.bonus'] + '<br/><br/>');
				ui.navigation.openPopup(ui.l('rating.title') + v['location.name'], rating.templateBonus(v));
			}
		});
	}
};
