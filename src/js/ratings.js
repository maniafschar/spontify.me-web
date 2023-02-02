import { communication } from './communication';
import { global } from './global';
import { EventRating, Location, model } from './model';
import { pageEvent } from './pageEvent';
import { ui, formFunc } from './ui';
import { user } from './user';

export { ratings };

class ratings {
	static templateForm = v =>
		global.template`<ratingSelection>
    <empty><span>☆</span><span onclick="ratings.click(2)">☆</span><span
            onclick="ratings.click(3)">☆</span><span onclick="ratings.click(4)">☆</span><span
            onclick="ratings.click(5)">☆</span></empty>
    <full><span onclick="ratings.click(1)">★</span><span onclick="ratings.click(2)">★</span><span
            onclick="ratings.click(3)">★</span><span onclick="ratings.click(4)">★</span><span
            onclick="ratings.click(5)" style="display:none;">★</span></full>
</ratingSelection>
<div style="clear:both;text-align:center;padding:0.5em 1em 0 1em;margin-bottom:0.5em;">
    <form onsubmit="return false">
		<input type="hidden" name="eventParticipateId" value="${v.participateId}" />
		<input type="hidden" name="rating" value="80" />
        <field>
			<textarea maxlength="1000" placeholder="${ui.l('locations.shortDesc')}" name="text" ${v.textareaStyle}>${v.draft}</textarea>
        </field>
        <field style="margin:0.5em 0 0 0;">
            <input type="file" name="image" accept=".gif, .png, .jpg" />
        </field>
        <buttontext onclick="ratings.save()" oId="${v.id}"
            class="${v.bg}" style="margin-top:0.5em;">${ui.l('rating.save')}</buttontext>
    </form>
</div>`;
	static click(x) {
		var e = ui.qa('popup ratingSelection > full span');
		ui.css(e, 'display', 'none');
		for (var i = 0; i < x; i++)
			ui.css(e[i], 'display', '');
		ui.q('popup [name="rating"]').value = x * 20;
	}
	static getForm(id) {
		var v = {}, draft = formFunc.getDraft('rating' + id);
		v.participateId = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).eventParticipate.id;
		v.bg = 'bgColor';
		if (draft)
			v.draft = draft.values.text;
		return ratings.templateForm(v);
	}
	static open(id, search) {
		var lastRating = null, list = null;
		var render = function () {
			if (lastRating && list) {
				var form, e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
				if (!id) {
					var name = ui.q('detail:not([style*="none"]) card:last-child title, [i="' + id + '"] title').innerText.trim();
					form = '<ratingHint>' + ui.l('rating.' + (search.indexOf('location') > -1 ? 'location' : 'contact')).replace('{0}', name) + '</ratingHint>';
				} else if (lastRating.createdAt)
					form = '<ratingHint>' + ui.l('rating.lastRate').replace('{0}', global.date.formatDate(lastRating.createdAt)) + '<br/><br/><rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + lastRating.rating) + '%;">★★★★★</full></rating></ratingHint>';
				else if (pageEvent.getDate(e) > new Date())
					form = '<ratingHint>' + ui.l('rating.notStarted') + '</ratingHint>';
				else if (e.eventParticipate.state != 1)
					form = '<ratingHint>' + ui.l('rating.notParticipated') + '</ratingHint>';
				else
					form = ratings.getForm(id);
				ui.html('detail card:last-child [name="favLoc"]', '');
				var s = '', date, pseudonym, text, img, rate;
				for (var i = 1; i < list.length; i++) {
					var v = model.convert(new EventRating(), list, i);
					date = global.date.formatDate(v.createdAt);
					pseudonym = v.contact.id == user.contact.id ? ui.l('you') : v.contact.pseudonym;
					text = v.text ? ': ' + v.text : '';
					img = v.image ? '<br/><img src="' + global.serverImg + v.image + '"/>' : '';
					rate = '<rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></rating>';
					s += '<ratingItem onclick="ui.navigation.autoOpen(&quot;' + global.encParam('e=' + v.eventId) + '&quot;,event)">' + rate + date + ' ' + pseudonym + text + img + '</ratingItem>';
				}
				if (s)
					s = '<ratingHistory>' + s + '</ratingHistory>';
				ui.navigation.openPopup(ui.l('rating.title'), form + s, 'ratings.saveDraft()');
			}
		};
		if (id) {
			communication.ajax({
				url: global.server + 'db/list?query=misc_rating&search=' + encodeURIComponent('event.id=' + id + ' and eventRating.contactId=' + user.contact.id),
				responseType: 'json',
				success(r) {
					lastRating = r.length > 1 ? model.convert(new EventRating(), r, r.length - 1) : {};
					render();
				}
			});
		} else
			lastRating = {};
		if (search) {
			communication.ajax({
				url: global.server + 'db/list?query=misc_rating&search=' + encodeURIComponent(search),
				responseType: 'json',
				success(r) {
					list = r;
					render();
				}
			});
		} else
			list = [];
	}
	static save() {
		var e = ui.q('popup [name="text"]');
		ui.classRemove(e, 'dialogFieldError');
		if (ui.val('popup [name="rating"]') < 25 && !e.value)
			formFunc.setError(e, 'rating.negativeRateValidation');
		formFunc.validation.filterWords(e);
		if (ui.q('popup  errorHint'))
			return;
		var v = formFunc.getForm('popup form');
		v.classname = 'EventRating';
		communication.ajax({
			url: global.server + 'db/one',
			method: 'POST',
			body: v,
			success(r) {
				formFunc.removeDraft('rating');
				ui.navigation.hidePopup();
				ui.q('detail card:last-child buttontext[onclick*="ratings.open"]').outerHTML = '';
			}
		});
	}
	static saveDraft() {
		var f = formFunc.getForm('popup form');
		formFunc.saveDraft('rating', f.values.text ? f : null);
	}
}