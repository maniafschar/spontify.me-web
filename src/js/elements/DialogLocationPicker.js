import { communication } from '../communication';
import { geoData } from '../geoData';
import { global } from '../global';
import { initialisation } from '../init';
import { ui } from '../ui';
import { user } from '../user';

export { DialogLocationPicker };

class DialogLocationPicker extends HTMLElement {
	static map;
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.elementsCss}
label {
	display: inline-block;
	color: black;
	background: white;
	cursor: pointer;
	position: relative;
	padding: 0.25em 0.75em;
	border-radius: 1em 0 0 1em;
	margin: 0.25em -0.25em 0.25em 0;
	clear: both;
	float: right;
	opacity: 1;
	box-shadow: 0 0 0.5em rgb(0, 0, 0, 0.3);
}
:host(.home)>label {
	border-radius: 1em;
	margin: 0.25em 0;
	float: initial;
}`;
		this._root.appendChild(style);
		this.setAttribute('style', 'display:none');
	}

	static close() {
		if (ui.q('dialog-location-picker').style.display != 'none')
			ui.toggleHeight('dialog-location-picker', function () {
				var e = ui.q('dialog-location-picker');
				for (var i = e._root.children.length - 1; i > 0; i--)
					e._root.children[i].remove();
			});
	}
	static open(event) {
		if (event) {
			event.preventDefault();
			event.stopPropagation();
		}
		var l = user.get('locationPicker'), e = ui.q('dialog-location-picker');
		if (l && l.length > 1 && ui.cssValue(e, 'display') == 'none') {
			if (ui.q('dialog-location-picker').style.display == 'none') {
				var element;
				if (ui.navigation.getActiveID() == 'home')
					ui.classAdd(e, 'home');
				else
					ui.classRemove(e, 'home');
				var s = '';
				for (var i = l.length - 1; i >= 0; i--) {
					if (l[i].town != geoData.getCurrent().town) {
						element = document.createElement('label');
						element.setAttribute('onclick', 'ui.q("dialog-location-picker").save(' + JSON.stringify(l[i]).replace(/"/g, '\'') + ')');
						element.innerText = l[i].town;
						e._root.appendChild(element);
						e._root.appendChild(document.createElement('br'));
					}
				}
				element = document.createElement('label');
				element.setAttribute('onclick', 'ui.navigation.openLocationPicker(event)');
				element.setAttribute('style', 'color:var(--buttonText)');
				element.setAttribute('class', 'bgColor');
				element.innerText = ui.l('home.locationPickerTitle');
				e._root.appendChild(element);
				e.removeAttribute('h');
				ui.toggleHeight('dialog-location-picker');
			} else
				ui.navigation.closeLocationPicker();
		} else if (user.contact)
			communication.loadMap('ui.navigation.openLocationPickerDialog');
	}
	static openDialog() {
		ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
			'<mapPicker></mapPicker><br/>' +
			'<input name="town" maxlength="20" placeholder="' + ui.l('home.locationPickerInput') + '" onkeydown="ui.q(&quot;dialog-location-picker&quot;).setButtonLabel(event)"/><br/><br/>' +
			'<button-text onclick="ui.q(&quot;dialog-location-picker&quot;).save()" label="home.locationPickerButtonSet"></button-text>' +
			(geoData.localized ? '<button-text onclick="ui.q(&quot;dialog-location-picker&quot;).reset()" label="home.locationPickerButtonReset"></button-text>' : '') +
			'<errorHint></errorHint>', null, null,
			function () {
				setTimeout(function () {
					ui.navigation.closeLocationPicker();
					DialogLocationPicker.map = new google.maps.Map(ui.q('dialog-popup mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 12, center: new google.maps.LatLng(geoData.getCurrent().lat, geoData.getCurrent().lon), zoom: 9 });
				}, 500);
			});
	}
	reset() {
		geoData.currentManual = {};
		ui.html('.locationPicker', geoData.getCurrent().town);
		ui.navigation.closePopup();
	}
	save(e) {
		if (ui.q('dialog-popup input') && ui.q('dialog-popup input').value) {
			communication.ajax({
				url: global.serverApi + 'action/google?param=' + encodeURIComponent('town=' + ui.q('dialog-popup input').value.trim()),
				responseType: 'json',
				webCall: 'DialogLocationPicker.save',
				success(r) {
					if (r && r.length) {
						DialogLocationPicker.map.setCenter({ lat: r[0].latitude, lng: r[0].longitude });
						ui.q('dialog-popup input').value = '';
						ui.q('dialog-location-picker').setButtonLabel();
					}
				}
			});
		} else
			geoData.save({ latitude: e ? e.lat : DialogLocationPicker.map.getCenter().lat(), longitude: e ? e.lon : DialogLocationPicker.map.getCenter().lng(), manual: true });
	}
	setButtonLabel(event) {
		if (event && event.keyCode == 13)
			this.save();
		else
			ui.q('dialog-popup button-text').setAttribute('label', ui.q('dialog-popup input').value ? 'home.locationPickerButtonLookup' : 'home.locationPickerButtonSet');
	}
}
