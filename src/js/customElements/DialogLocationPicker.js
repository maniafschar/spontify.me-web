import { user } from '../user';
import { ui } from '../ui';
import { geoData } from '../geoData';
import { communication } from '../communication';

export { DialogLocationPicker }

class DialogLocationPicker extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		this.setAttribute('class', 'bgColor');
		const style = document.createElement('style');
		style.textContent = `
label {
	display: inline;
	color: black;
	background: white;
	cursor: pointer;
	position: relative;
	padding: 0.25em 0.75em;
	border-radius: 1em 0 0 1em;
	margin: 0.25em 0;
	clear: both;
	float: right;
	box-shadow: 0 0 0.5em rgb(0, 0, 0, 0.3);
}`;
		this._root.appendChild(style);
		this.setAttribute('style', 'display:none');
	}

	static close() {
		if (ui.q('dialog-location-picker').style.display != 'none')
			ui.toggleHeight('dialog-location-picker');
	}
	static open(event, noSelection) {
		event.preventDefault();
		event.stopPropagation();
		var e = user.get('locationPicker');
		if (e && e.length > 1 && !noSelection) {
			if (ui.q('dialog-location-picker').style.display == 'none') {
				var s = '';
				for (var i = e.length - 1; i >= 0; i--) {
					if (e[i].town != geoData.current.town)
						s += '<label onclick="geoData.saveLocationPicker(' + JSON.stringify(e[i]).replace(/"/g, '\'') + ')">' + e[i].town + '</label>';
				}
				s += '<label class="bgColor" onclick="ui.navigation.openLocationPicker(event,true)" style="color:var(--buttonText);">' + ui.l('home.locationPickerTitle') + '</label>';
				e = ui.q('dialog-location-picker');
				if (e) {
					e._root.innerHTML = s;
					e.removeAttribute('h');
				}
			}
			ui.toggleHeight('dialog-location-picker');
		} else if (user.contact)
			communication.loadMap('ui.navigation.openLocationPickerDialog');
		else {
			var desc;
			if (user.clientId > 1) {
				desc = ui.l('intro.descriptionFanclub').replace(/\{0}/g, global.appTitle.substring(0, global.appTitle.indexOf(global.separator)));
			} else
				desc = ui.l('intro.description');
			ui.navigation.openHint({ desc: desc, pos: '5%,10.5em', size: '90%,auto', hinkyClass: 'top', hinky: 'left:50%;' });
		}
	}
	static openDialog() {
		ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
			'<mapPicker></mapPicker><br/><input name="town" maxlength="20" placeholder="' + ui.l('home.locationPickerInput') + '"/><mapButton onclick="geoData.mapReposition()" class="defaultButton"></mapButton><br/><br/>' +
			(geoData.manual ? '<button-text onclick="geoData.reset()" label="home.locationPickerReset"></button-text>' : '') +
			'<button-text onclick="geoData.saveLocationPicker()" label="ready"></button-text><errorHint></errorHint>', null, null,
			function () {
				setTimeout(function () {
					if (ui.q('dialog-location-picker').style.display != 'none')
						ui.toggleHeight('dialog-location-picker');
					geoData.map = new google.maps.Map(ui.q('mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 12, center: new google.maps.LatLng(geoData.current.lat, geoData.current.lon), zoom: 9 });
				}, 500);
			});
	}
}