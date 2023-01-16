import { communication } from './communication';
import { global } from './global';
import { EventRating, Location, model } from './model';
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
        <input type="hidden" id="cid" value="${v.id}" />
        <input type="hidden" name="locationId" value="${v.id}" />
        <input type="hidden" name="rating" value="80" />
        <textarea maxlength="1000" placeholder="${ui.l('locations.shortDesc')}" name="text" ${v.textareaStyle}>${v.draft}</textarea>
        <errorHint class="highlightColor"></errorHint>
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
		v.id = id;
		v.bg = 'bgColor';
		if (draft)
			v.draft = draft.values.text;
		return ratings.templateForm(v);
	}
	static open(id, search) {
		communication.ajax({
			url: global.server + 'db/list?query=misc_rating&search=' + encodeURIComponent(search),
			responseType: 'json',
			success(r) {
				var f = r._lastRating;
				if (f) {
					f = f.split(' ');
					f = f[0] + ' ' + f[1];
					f = global.date.server2Local(f);
				}
				if (!id) {
					var name = ui.q('detail:not([style*="none"]) card:last-child title, [i="' + id + '"] title').innerText.trim();
					f = '<ratingHint>' + ui.l('rating.' + (search.indexOf('location') > -1 ? 'location' : 'contact')).replace('{0}', name) + '</ratingHint>';
				} else if (r._lastRating && (new Date().getTime() - f) / 86400000 < 7)
					f = '<ratingHint>' + ui.l('rating.lastRate').replace('{0}', global.date.formatDate(f)).replace('{1}', '<br/><br/><rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + parseInt(r._lastRating.split(' ')[2])) + '%;">★★★★★</full></rating><br/><br/>') + '</ratingHint>';
				else
					f = ratings.getForm(id);
				ui.html('detail card:last-child [name="favLoc"]', '');
				var s = '', date, pseudonym, text, img, rate;
				for (var i = r.length - 1; i > 0; i--) {
					var v = model.convert(new EventRating(), r, i);
					date = global.date.formatDate(v.createdAt);
					pseudonym = v.contact.id == user.contact.id ? ui.l('you') : v.contact.pseudonym;
					text = v.text ? ': ' + v.text : '';
					img = v.image ? '<br/><img src="' + global.serverImg + v.image + '"/>' : '';
					s += '<ratingItem';
					rate = '<rating><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></rating>';
					s += ' onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.contact.id) + '&quot;,event)" style="cursor:pointer;"';
					s += '>' + rate + date + ' ' + pseudonym + text + img + '</ratingItem>';
				}
				if (s)
					s = '<ratingHistory>' + s + '</ratingHistory>';
				ui.navigation.openPopup(ui.l('rating.title'), f + s, 'ratings.saveDraft()');
			}
		});
	}
	static postSave(r) {
		formFunc.removeDraft('rating' + r.cid);
		ui.navigation.hidePopup();
	}
	static save() {
		var e = ui.q('[name="text"]');
		ui.classRemove(e, 'dialogFieldError');
		if (ui.val('popup [name="rating"]') < 25 && !e.value) {
			ui.classAdd(e, 'dialogFieldError');
			e.nextSibling.innerHTML = ui.l('rating.negativeRateValidation');
			return;
		}
		var data = {
			cid: ui.val('#cid'),
			ratings: ui.val('[name="ratings"]')
		};
		var v = formFunc.getForm('popup form');
		v.classname = 'LocationRating';
		communication.ajax({
			url: global.server + 'db/one',
			method: 'POST',
			body: v,
			success(r) {
				data.id = r;
				ratings.postSave(data);
			}
		});
	}
	static saveDraft() {
		var f = formFunc.getForm('popup form');
		formFunc.saveDraft('rating' + ui.val('#cid'), f.values.text ? f : null);
	}
}