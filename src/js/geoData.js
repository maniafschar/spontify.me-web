import { communication } from './communication';
import { global } from './global';
import { pageHome } from './pageHome';
import { pageSearch } from './pageSearch';
import { ui } from './ui';
import { user } from './user';

export { geoData };

class geoData {
	static angle = -1;
	static current = { lat: 48.13684, lon: 11.57685, street: null, town: 'München' };
	static currentNonManual = null;
	static headingID = null;
	static id = null;
	static initDeviceOrientation = null;
	static lastSave = 0;
	static localizationAsked = false;
	static localized = false;
	static manual = false;
	static map;
	static rad = 0.017453292519943295;

	static deviceOrientationHandler(event) {
		var alpha;
		if (event.trueHeading)
			alpha = -event.trueHeading;
		else if (event.magneticHeading)
			alpha = -event.magneticHeading;
		else if (event.webkitCompassHeading)
			alpha = -event.webkitCompassHeading;
		else if (event.absolute) {
			alpha = event.alpha;
			if (!window.chrome)
				alpha = alpha - 270;
		}
		if (alpha) {
			alpha = (alpha + 360) % 360;
			geoData.updateCompass(parseFloat(alpha.toFixed(1)));
		}
	}
	static getAngel(p1, p2) {
		return (360 + Math.atan2(p2.lon - p1.lon, p2.lat - p1.lat) * 180 / Math.PI) % 360;
	}
	static getDistance(lat1, lon1, lat2, lon2) {
		var R = 6371;
		var a = 0.5 - Math.cos((lat2 - lat1) * Math.PI / 180) / 2 +
			Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			(1 - Math.cos((lon2 - lon1) * Math.PI / 180)) / 2;
		return R * 2 * Math.asin(Math.sqrt(a));
	}
	static headingClear() {
		if (geoData.headingID) {
			navigator.compass.clearWatch(geoData.headingID);
			geoData.headingID = null;
		}
	}
	static headingWatch() {
		if (global.isBrowser()) {
			// only http hack, not relevant for app
			if (window.DeviceOrientationEvent && typeof (window.DeviceOrientationEvent.requestPermission) == 'function') {
				var initializedDespiteItBorthers = false;
				if (initializedDespiteItBorthers)
					window.DeviceOrientationEvent.requestPermission().then(function (response) {
						if (response == 'granted')
							ui.on(window, window.DeviceOrientationAbsoluteEvent ? 'DeviceOrientationAbsoluteEvent' : 'deviceorientation', geoData.deviceOrientationHandler);
					});
			} else
				ui.on(window, window.DeviceOrientationAbsoluteEvent ? 'DeviceOrientationAbsoluteEvent' : 'deviceorientation', geoData.deviceOrientationHandler);
		} else if (!geoData.headingID && navigator.compass)
			geoData.headingID = navigator.compass.watchHeading(geoData.deviceOrientationHandler, null);
	}
	static init() {
		if (!user.contact)
			return;
		if (geoData.id)
			geoData.pause();
		if (global.isBrowser())
			geoData.init2('granted');
		else {
			cordova.plugins.diagnostic.isLocationAuthorized(function (status) {
				if (status || global.getOS() == 'ios')
					geoData.init2('granted');
				else if (!geoData.localizationAsked) {
					if (ui.cssValue('popup', 'display') == 'none') {
						geoData.localizationAsked = true;
						ui.navigation.openPopup(ui.l('attention'), ui.l('locations.permission') + '<br/><br/><button-text onclick="geoData.requestLocationAuthorization()" label="locations.permissionButton"></button-text>');
					} else
						setTimeout(geoData.init, 2000);
				}
			});
		}
	}
	static init2(status) {
		if (status && status.toLowerCase().indexOf('denied') < 0) {
			geoData.id = navigator.geolocation.watchPosition(function (p) {
				if (p.coords && p.coords.latitude)
					geoData.save({
						latitude: p.coords.latitude,
						longitude: p.coords.longitude,
						altitude: p.coords.altitude,
						heading: p.coords.heading,
						speed: p.coords.speed,
						accuracy: p.coords.accuracy
					});
			}, null, { timeout: 10000, maximumAge: 10000, enableHighAccuracy: true });
		}
	}
	static initManual(data) {
		geoData.localized = true;
		geoData.manual = true;
		geoData.current.lat = data.lat;
		geoData.current.lon = data.lon;
		geoData.current.treet = data.street;
		geoData.current.town = data.town;
	}
	static mapReposition() {
		if (ui.q('dialog-popup input').value) {
			communication.ajax({
				url: global.serverApi + 'action/google?param=' + encodeURIComponent('town=' + ui.q('dialog-popup input').value.trim()),
				responseType: 'json',
				webCall: 'geoData.mapReposition()',
				success(r) {
					geoData.map.setCenter({ lat: r.latitude, lng: r.longitude });
				}
			});
		}
	}
	static openLocationPicker(event, noSelection) {
		event.preventDefault();
		event.stopPropagation();
		var e = user.get('locationPicker');
		if (e && e.length > 1 && !noSelection) {
			if (ui.q('locationPicker').style.display == 'none') {
				var s = '';
				for (var i = e.length - 1; i >= 0; i--) {
					if (e[i].town != geoData.current.town)
						s += '<label onclick="geoData.saveLocationPicker(' + JSON.stringify(e[i]).replace(/"/g, '\'') + ')">' + e[i].town + '</label>';
				}
				s += '<label class="bgColor" onclick="geoData.openLocationPicker(event,true)" style="color:var(--buttonText);">' + ui.l('home.locationPickerTitle') + '</label>';
				e = ui.q('locationPicker');
				if (e) {
					e.innerHTML = s;
					e.removeAttribute('h');
				}
			}
			ui.toggleHeight('locationPicker');
		} else if (user.contact)
			communication.loadMap('geoData.openLocationPickerDialog');
		else {
			var desc;
			if (user.clientId > 1) {
				desc = ui.l('intro.descriptionFanclub').replace(/\{0}/g, global.appTitle.substring(0, global.appTitle.indexOf(global.separator)));
			} else
				desc = ui.l('intro.description');
			ui.navigation.openHint({ desc: desc, pos: '5%,10.5em', size: '90%,auto', hinkyClass: 'top', hinky: 'left:50%;' });
		}
	}
	static openLocationPickerDialog() {
		ui.navigation.openPopup(ui.l('home.locationPickerTitle'),
			'<mapPicker></mapPicker><br/><input name="town" maxlength="20" placeholder="' + ui.l('home.locationPickerInput') + '"/><mapButton onclick="geoData.mapReposition()" class="defaultButton"></mapButton><br/><br/>' +
			(geoData.manual ? '<button-text onclick="geoData.reset()" label="home.locationPickerReset"></button-text>' : '') +
			'<button-text onclick="geoData.saveLocationPicker()" label="ready"></button-text><errorHint></errorHint>', null, null,
			function () {
				setTimeout(function () {
					if (ui.q('locationPicker').style.display != 'none')
						ui.toggleHeight('locationPicker');
					geoData.map = new google.maps.Map(ui.q('mapPicker'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true, maxZoom: 12, center: new google.maps.LatLng(geoData.current.lat, geoData.current.lon), zoom: 9 });
				}, 500);
			});
	}
	static pause() {
		if (geoData.id) {
			navigator.geolocation.clearWatch(geoData.id);
			geoData.id = null;
		}
	}
	static requestLocationAuthorization() {
		ui.navigation.closePopup();
		cordova.plugins.diagnostic.requestLocationAuthorization(geoData.init2, null, cordova.plugins.diagnostic.locationAuthorizationMode.WHEN_IN_USE);
	}
	static reset() {
		geoData.manual = false;
		geoData.current = geoData.currentNonManual || { lat: 48.13684, lon: 11.57685, street: null, town: 'München' };
		pageHome.updateLocalisation();
		pageSearch.updateLocalisation();
		geoData.init();
		ui.navigation.closePopup();
		user.save({ webCall: 'geoData.reset()', latitude: geoData.current.lat, longitude: geoData.current.lon }, function () { pageHome.init(true); });
	}
	static save(position, exec) {
		var d = geoData.getDistance(geoData.current.lat, geoData.current.lon, position.latitude, position.longitude);
		if (position.manual || !geoData.manual) {
			geoData.current.lat = position.latitude;
			geoData.current.lon = position.longitude;
		}
		if (position.manual)
			geoData.manual = true;
		if (user.contact && user.contact.id && new Date().getTime() - geoData.lastSave > 5000 &&
			(!geoData.localized || d > 0.05 && !geoData.manual || position.manual)) {
			communication.ajax({
				url: global.serverApi + 'action/position',
				progressBar: false,
				method: 'POST',
				webCall: 'geoData.save(position,exec)',
				body: position,
				responseType: 'json',
				error(r) {
					geoData.current.street = r.status + ' ' + r.responseText;
					pageSearch.updateLocalisation();
					pageHome.updateLocalisation();
				},
				success(r) {
					if (r && r.town) {
						geoData.lastSave = new Date().getTime();
						if (!position.manual)
							geoData.currentNonManual = { lat: position.latitude, lon: position.longitude, street: r.street, town: r.town };
						if (position.manual) {
							var e = user.get('locationPicker') || [];
							for (var i = e.length - 1; i >= 0; i--) {
								if (e[i].town == r.town)
									e.splice(i, 1);
							}
							e.push({ lat: position.latitude, lon: position.longitude, town: r.town, street: r.street });
							if (e.length > 5)
								e.splice(0, e.length - 5);
							user.set('locationPicker', e);
						}
						geoData.current.town = r.town;
						geoData.current.street = r.street;
						pageHome.updateLocalisation();
						pageSearch.updateLocalisation();
						if (ui.q('dialog-popup mapPicker'))
							ui.navigation.closePopup();
						if (ui.q('locationPicker').style.display != 'none')
							ui.toggleHeight('locationPicker');
						if (exec)
							exec.call();
					} else
						ui.html('dialog-popup errorHint', ui.l('home.locationNotSetable'));
				}
			});
		}
		geoData.localized = true;
		geoData.updateCompass();
	}
	static saveLocationPicker(e) {
		geoData.save({ latitude: e ? e.lat : geoData.map.getCenter().lat(), longitude: e ? e.lon : geoData.map.getCenter().lng(), manual: true }, function () { pageHome.init(true); });
	}
	static updateCompass(angle) {
		if (!angle)
			angle = geoData.angle;
		if (angle >= 0) {
			geoData.angle = angle;
			var e = ui.qa('detailCompass > span');
			for (var i = 0; i < e.length; i++)
				ui.css(e[i], 'transform', 'rotate(' + (parseFloat(e[i].getAttribute('a')) + geoData.angle) + 'deg)');
		}
	}
}