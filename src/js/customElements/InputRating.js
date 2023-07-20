import { global } from '../global';
import { communication } from '../communication';
import { formFunc, ui } from '../ui';
import { user } from '../user';
import { pageEvent } from '../pageEvent';
import { Contact, model } from '../model';
import { initialisation } from '../init';

export { InputRating }

class InputRating extends HTMLElement {
	rating = `<ratingSelection style="font-size:2em;margin-top:0.5em;">
	<empty><span>☆</span><span onclick="this.getRootNode().host.rate(event,2)">☆</span><span
			onclick="this.getRootNode().host.rate(event,3)">☆</span><span onclick="this.getRootNode().host.rate(event,4)">☆</span><span
			onclick="this.getRootNode().host.rate(event,5)">☆</span></empty>
	<full><span onclick="this.getRootNode().host.rate(event,1)">★</span><span onclick="this.getRootNode().host.rate(event,2)">★</span><span
			onclick="this.getRootNode().host.rate(event,3)">★</span><span onclick="this.getRootNode().host.rate(event,4)">★</span><span
			onclick="this.getRootNode().host.rate(event,5)" style="display:none;">★</span></full>
	</ratingSelection>`;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
detailRating {
	font-size: 1.5em;
	margin: 1em 0 0.75em 0;
	display: block;
	position: relative;
	cursor: pointer;
}

ratingHint {
	margin: 0 1em 1em 1em;
	display: block;
}

ratingHistory {
	display: block;
}

ratingHistory rating {
	display: block;
	background: transparent;
	padding: 0.5em;
	text-align: left;
	width: 100%;
	position: relative;
}

ratingHistory rating img {
	max-width: 100%;
	border-radius: 1em;
}

ratingHistory span {
	position: relative;
}

rating,
ratingSelection {
	position: relative;
	line-height: 1;
	display: inline-block;
	height: 1.5em;
}

rating empty,
ratingSelection empty {
	opacity: 0.3;
	position: relative;
}

rating full,
ratingSelection full {
	position: absolute;
	left: 0;
	overflow: hidden;
	top: 0;
	color: var(--bg2stop);
}

ratingSelection span {
	width: 2em;
	display: inline-block;
	position: relative;
	cursor: pointer;
}

input-image {
	position: relative;
	display: block;
	margin: 1em 0;
}`;
		this._root.appendChild(style);
		var element, id = this.getAttribute('id');
		var stars = '<empty>☆☆☆☆☆</empty><full style="width:{0}%;">★★★★★</full>';
		if (this.getAttribute('ui') == 'dialog') {
			var lastRating = JSON.parse(decodeURIComponent(this.getAttribute('lastRating'))), history = JSON.parse(decodeURIComponent(this.getAttribute('history')));
			this.removeAttribute('ui');
			this.removeAttribute('lastRating');
			this.removeAttribute('history');
			var hint, e = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
			if (!id) {
				var name = ui.q('detail:not([style*="none"]) card:last-child title, [i="' + id + '"] title').innerText.trim();
				hint = ui.l('rating.' + this.getAttribute('type')).replace('{0}', name);
			} else if (lastRating.createdAt)
				hint = ui.l('rating.lastRate').replace('{0}', global.date.formatDate(lastRating.createdAt)) + '<br/><br/><rating>' + stars.replace('{0}', lastRating.rating) + '</rating>';
			else if (pageEvent.getDate(e) > new Date())
				hint = ui.l('rating.notStarted');
			else if (e.eventParticipate.state != 1)
				hint = ui.l('rating.notParticipated');
			if (hint) {
				element = document.createElement('ratingHint');
				element.innerHTML = hint;
			} else {
				element = document.createElement('div');
				element.innerHTML = this.getForm(id);
			}
			this._root.appendChild(element);
			ui.html('detail card:last-child [name="favLoc"]', '');
			var s = '', date, pseudonym, description, img;
			for (var i = 1; i < history.length; i++) {
				var v = model.convert(new Contact(), history, i);
				date = global.date.formatDate(v.eventRating.createdAt);
				pseudonym = v.id == user.contact.id ? ui.l('you') : v.pseudonym;
				description = v.eventRating.description ? global.separator + v.eventRating.description : '';
				img = v.eventRating.image ? '<br/><img src="' + global.serverImg + v.eventRating.image + '"/>' : '';
				s += '<rating onclick="ui.navigation.autoOpen(&quot;' + global.encParam('p=' + v.id) + '&quot;,event)"><span>' + stars.replace('{0}', v.eventRating.rating) + '</span> ' + date + ' ' + pseudonym + description + img + '</rating > ';
			}
			if (s) {
				element = document.createElement('ratingHistory');
				element.innerHTML = s;
				this._root.appendChild(element);
			}
		} else if (this.getAttribute('ui') == 'rating') {
			element = document.createElement('div');
			element.innerHTML = this.rating;
			this._root.appendChild(element.children[0]);
			element = document.createElement('input');
			element.setAttribute('type', 'hidden');
			element.setAttribute('name', 'rating');
			element.setAttribute('value', '80');
			this._root.appendChild(element);
		} else {
			element = document.createElement('detailRating');
			element.setAttribute('onclick', 'ui.openRating(' + (this.getAttribute('type') == 'event' ? id : null) + ',"event.' + (this.getAttribute('type') == 'event' ? 'id' : this.getAttribute('type') + 'Id') + '=' + id + '")');
			element.innerHTML = '<ratingSelection>' + stars.replace('{0}', this.getAttribute('rating')) + '</ratingSelection>';
			this._root.appendChild(element);
		}
	}
	rate(event, x) {
		var e = event.target.getRootNode().querySelectorAll('ratingSelection > full span');
		ui.css(e, 'display', 'none');
		for (var i = 0; i < x; i++)
			ui.css(e[i], 'display', '');
		event.target.getRootNode().querySelector('[name="rating"]').value = x * 20;
		event.target.getRootNode().host.setAttribute('value', x * 20);
	}
	getForm(id) {
		var draft = user.get('rating' + id), participate = ui.q('detail card:last-child detailHeader').getAttribute('data');
		if (participate)
			participate = JSON.parse(decodeURIComponent(participate)).eventParticipate;
		if (draft)
			draft = draft.values.description;
		return `${this.rating}<form style="margin-top:1em;" onsubmit="return false">
	<input type="hidden" name="eventParticipateId" value="${participate && participate.id ? participate.id : ''}" />
	<input type="hidden" name="rating" value="80" />
	<field>
		<textarea maxlength="1000" placeholder="${ui.l('locations.shortDesc')}" name="description">${draft ? draft : ''}</textarea>
	</field>
	<field style="margin:0.5em 0 0 0;">
		<input-image></input-image>
	</field>
	<button-text onclick="this.getRootNode().host.save(event)" oId="${id}" style="margin-top:0.5em;" label="rating.save"></button-text>
</form>`;
	}
	static open(id, search) {
		var lastRating = null, history = null;
		if (!search)
			search = '';
		var render = function () {
			if (lastRating && history)
				ui.navigation.openPopup(ui.l('rating.title'), '<input-rating ui="dialog"' + (id ? ' id="' + id + '"' : '')
					+ (' type="' + (search.indexOf('contact') > -1 ? 'contact' : search.indexOf('location') > -1 ? 'location' : 'event') + '"')
					+ (history ? ' history="' + encodeURIComponent(JSON.stringify(history)) + '"' : '')
					+ (lastRating ? ' lastRating="' + encodeURIComponent(JSON.stringify(lastRating)) + '"' : '') + '></input-rating>');
		};
		if (id) {
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_rating&search=' + encodeURIComponent('event.id=' + id + ' and eventParticipate.contactId=' + user.contact.id),
				webCall: 'InputRating.open',
				responseType: 'json',
				success(r) {
					lastRating = r.length > 1 ? model.convert(new Contact(), r, r.length - 1).eventRating : {};
					render();
				}
			});
		} else
			lastRating = {};
		if (search) {
			communication.ajax({
				url: global.serverApi + 'db/list?query=event_rating&search=' + encodeURIComponent(search),
				webCall: 'InputRating.open',
				responseType: 'json',
				success(r) {
					history = r;
					render();
				}
			});
		} else
			history = [];
		render();
	}
	static save(event) {
		var e = event.target.getRootNode().querySelector('[name="description"]');
		ui.classRemove(e, 'dialogFieldError');
		if (event.target.getRootNode().querySelector('[name="rating"]').value < 25 && !e.value)
			formFunc.setError(e, 'rating.negativeRateValidation');
		else
			formFunc.validation.filterWords(e);
		if (event.target.getRootNode().querySelector('errorHint'))
			return;
		var v = formFunc.getForm(event.target.getRootNode().querySelector('form'));
		v.classname = 'EventRating';
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'InputRating.save',
			method: 'POST',
			body: v,
			success(r) {
				user.remove('rating');
				ui.navigation.closePopup();
				e = ui.q('detail card:last-child button-text[onclick*="ui.openRating"]');
				if (e)
					e.outerHTML = '';
			}
		});
	}
	disconnectedCallback() {
		var f = this.querySelector('form');
		if (f) {
			var v = formFunc.getForm(f);
			user.set('rating', v.values.description ? v : null);
		}
	}
}
