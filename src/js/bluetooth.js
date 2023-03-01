import { communication } from './communication';
import { global } from './global';
import { intro } from './intro';
import { ui } from './ui';
import { user } from './user';

export { bluetooth };

class bluetooth {
	static state = null;
	static UUID_SERVICE = 'e8a98f86-f973-442b-a099-b0b2d2c4f20e';
	static UUID_RX = 'a682b873-22a7-402b-b2ef-8cb432a7c3b1';
	static UUID_TX = '32a9cb83-00f9-4714-b130-4d0c1d30e363';

	static closePopup() {
		if (ui.q('popupContent') && ui.q('popupContent').innerHTML.indexOf(ui.l('bluetooth.deactivatedText')) > -1)
			ui.navigation.closePopup();
	}
	static decode(a) {
		a = new Uint8Array(a);
		var s = '';
		for (var i = 0; i < a.length; i++)
			s += String.fromCharCode(a[i]);
		return decodeURIComponent(s);
	}
	static encode(s) {
		var utf8 = encodeURIComponent(s);
		var a = new Uint8Array(utf8.length);
		for (var i = 0; i < utf8.length; i++)
			a[i] = utf8.charCodeAt(i);
		return a.buffer;
	}
	static init() {
		// disable for now, bluetooth will come again later
		if (!global.isBrowser() && false) {
			bluetooth.stop();
			bluetooth.requestAuthorization(true);
		}
	}
	static registerDevice(device) {
		if (user.contact && device && device.id) {
			if (window.localStorage.getItem('bluetoothIDs') && window.localStorage.getItem('bluetoothIDs').indexOf('|' + device.id + '|') < 0) {
				window.localStorage.setItem('bluetoothIDs', window.localStorage.getItem('bluetoothIDs') + device.id + '|');
				ble.connect(device.id, function () {
					ble.write(device.id, bluetooth.UUID_SERVICE, bluetooth.UUID_TX, bluetooth.encode(user.contact.id), function () {
						ble.disconnect(device.id);
					});
				});
			}
		}
	}
	static requestAuthorization(logon) {
		bluetooth.reset();
		var stateListener = function () {
			if (cordova.plugins && cordova.plugins.backgroundMode) {
				cordova.plugins.backgroundMode.enable();
				cordova.plugins.backgroundMode.on('failure', function (e) {
					communication.sendError('ble background mode: ' + JSON.stringify(e));
				});
			}
			var showHint = !logon;
			ble.startStateNotifications(function (state) {
				bluetooth.state = state;
				if (user.contact.bluetooth) {
					if (state == 'on') {
						bluetooth.closePopup();
						bluetooth.scanStart();
						showHint = false;
					} else
						ui.navigation.openPopup(ui.l('attention'), ui.l('bluetooth.deactivatedText'));
				}
			})
		};
		if (cordova.plugins.diagnostic.requestBluetoothAuthorization) {
			try {
				cordova.plugins.diagnostic.requestBluetoothAuthorization(stateListener);
			} catch (e) {
				ui.navigation.openPopup(ui.l('attention'), ui.l('bluetooth.error').replace('{0}', e));
			}
		} else
			stateListener.call();
	}
	static reset() {
		if (!global.isBrowser())
			window.localStorage.setItem('bluetoothIDs', '|');
	}
	static scanStart() {
		Promise.all([
			blePeripheral.createService(bluetooth.UUID_SERVICE),
			blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_TX, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
			blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_RX, blePeripheral.properties.READ | blePeripheral.properties.NOTIFY, blePeripheral.permissions.READABLE),
			blePeripheral.publishService(bluetooth.UUID_SERVICE),
			blePeripheral.startAdvertising(bluetooth.UUID_SERVICE, 'skillvents'),
			blePeripheral.onWriteRequest(function (json) {
				if (user.contact) {
					var id = bluetooth.decode(json.value);
					if (id)
						communication.ajax({
							url: global.server + 'db/one',
							method: 'POST',
							webCall: 'bluetooth.scanStart()',
							body: {
								classname: 'ContactBluetooth',
								values: { contactId2: id }
							}
						});
				}
			})
		]).then(
			function () {
				ui.html('home item.bluetooth text', ui.l('bluetooth.activated'));
			},
			function (e) {
				if (e.indexOf('Advertising has already started') < 0) {
					bluetooth.stop();
					communication.sendError('ble peripheral: ' + JSON.stringify(e));
				} else
					ui.html('home item.bluetooth text', ui.l('bluetooth.activated'));
			}
		);
		ble.startScan([bluetooth.UUID_SERVICE], bluetooth.registerDevice, function (e) {
			bluetooth.stop();
			communication.sendError('ble scan: ' + JSON.stringify(e));
		});
	}
	static stop() {
		if (!global.isBrowser()) {
			try {
				ble.stopScan();
				ble.stopStateNotifications();
			} catch (e) { }
			bluetooth.closePopup();
			if (ui.q('hint[i="bluetoothOn"]'))
				intro.closeHint();
		}
		ui.html('home item.bluetooth text', ui.l('bluetooth.deactivated'));
		window.localStorage.removeItem('bluetoothIDs');
	}
	static toggle() {
		if (global.isBrowser())
			intro.openHint({ desc: 'bluetoothDescriptionBrowser', pos: '10%,-14em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:50%;margin-left:-0.5em' });
		else if (!user.contact)
			intro.openHint({ desc: 'bluetoothDescriptionLoggedOff', pos: '10%,-14em', size: '80%,auto', hinkyClass: 'bottom', hinky: 'left:50%;margin-left:-0.5em' });
		else if (window.localStorage.getItem('bluetoothIDs'))
			user.save({ webCall: 'bluetooth.toggle()', bluetooth: false }, bluetooth.stop);
		else {
			if ((!user.contact.ageMale && !user.contact.ageFemale && !user.contact.ageDivers) || !user.contact.age || !user.contact.gender)
				ui.navigation.openPopup(ui.l('attention'), ui.l('bluetooth.errorMatching').replace('{0}', ui.l('bluetooth.matching')) + '<br/><br/><buttontext class="bgColor" onclick="ui.navigation.goTo(&quot;settings&quot;)">' + ui.l('settings.edit') + '</buttontext>');
			else
				user.save({ webCall: 'bluetooth.toggle()', bluetooth: true }, bluetooth.requestAuthorization);
		}
	}
}