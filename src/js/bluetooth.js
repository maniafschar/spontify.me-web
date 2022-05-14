import { communication } from './communication';
import { global } from './global';
import { pageInfo } from './pageInfo';
import { ui } from './ui';
import { user } from './user';

export { bluetooth };

class bluetooth {
	static started = null;
	static state = null;
	static UUID_SERVICE = 'e8a98f86-f973-442b-a099-b0b2d2c4f20e';
	static UUID_RX = 'a682b873-22a7-402b-b2ef-8cb432a7c3b1';
	static UUID_TX = '32a9cb83-00f9-4714-b130-4d0c1d30e363';

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
	static registerDevice(device) {
		if (user.contact && user.contact.findMe && device && device.id) {
			if (window.localStorage.getItem('findMeIDs') && window.localStorage.getItem('findMeIDs').indexOf('|' + device.id + '|') < 0) {
				window.localStorage.setItem('findMeIDs', window.localStorage.getItem('findMeIDs') + device.id + '|');
				ble.connect(device.id, function () {
					ble.write(device.id, bluetooth.UUID_SERVICE, bluetooth.UUID_TX, bluetooth.encode(user.contact.id), function () {
						ble.disconnect(device.id, null, function (e) {
							communication.sendError('ble disconnect: ' + JSON.stringify(e));
						});
					}, function (e) {
						communication.sendError('ble write: ' + JSON.stringify(e));
					});
				}, function (e) {
					communication.sendError('ble connect: ' + JSON.stringify(e));
				});
			}
		}
	}
	static requestAuthorization() {
		if (global.isBrowser())
			return;
		if (!user.contact.findMe) {
			bluetooth.stop();
			return;
		}
		bluetooth.reset();
		bluetooth.startBeacon();
		if (bluetooth.started)
			return;
		var notification = function () {
			cordova.plugins.backgroundMode.enable();
			cordova.plugins.backgroundMode.on('failure', function (e) {
				communication.sendError('ble background mode: ' + JSON.stringify(e));
			});
			ble.startStateNotifications(function (state) {
				bluetooth.state = state;
				if (state == 'on') {
					if (ui.q('popupContent').innerHTML.indexOf(ui.l('findMe.bluetoothDeactivated')) > -1)
						ui.navigation.hidePopup();
					Promise.all([
						blePeripheral.createService(bluetooth.UUID_SERVICE),
						blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_TX, blePeripheral.properties.WRITE, blePeripheral.permissions.WRITEABLE),
						blePeripheral.addCharacteristic(bluetooth.UUID_SERVICE, bluetooth.UUID_RX, blePeripheral.properties.READ | blePeripheral.properties.NOTIFY, blePeripheral.permissions.READABLE),
						blePeripheral.publishService(bluetooth.UUID_SERVICE),
						blePeripheral.startAdvertising(bluetooth.UUID_SERVICE, 'findapp'),
						blePeripheral.onWriteRequest(function (json) {
							if (user.contact && user.contact.findMe) {
								var id = bluetooth.decode(json.value);
								if (id)
									communication.ajax({
										url: global.server + 'db/one',
										method: 'POST',
										body: {
											classname: 'ContactBluetooth',
											values: { contactId2: id }
										}
									});
							}
						})
					]).then(
						function () { },
						function (e) {
							if (e.indexOf('Advertising has already started') < 0) {
								bluetooth.stop();
								communication.sendError('ble peripheral: ' + JSON.stringify(e));
							}
						}
					);
					bluetooth.restartScan();
				} else if (user.contact.findMe)
					ui.navigation.openPopup(ui.l('attention'), ui.l('findMe.bluetoothDeactivated'));
			})
		};
		if (cordova.plugins.diagnostic.requestBluetoothAuthorization) {
			try {
				cordova.plugins.diagnostic.requestBluetoothAuthorization(notification);
			} catch (e) {
				ui.navigation.openPopup(ui.l('attention'), ui.l('findMe.bluetoothDeactivated'));
			}
		} else
			notification.call();
	}
	static reset() {
		if (!global.isBrowser())
			window.localStorage.setItem('findMeIDs', '|');
	}
	static restartScan() {
		if (user.contact.findMe && bluetooth.state) {
			bluetooth.started = new Date().getTime();
			ble.startScan([bluetooth.UUID_SERVICE], bluetooth.registerDevice, function (e) {
				communication.sendError('ble scan: ' + JSON.stringify(e));
			});
		} else
			bluetooth.started = null;
	}
	static stop() {
		bluetooth.started = null;
		ble.stopScan();
		cordova.plugins.locationManager.stopMonitoringForRegion(bluetooth.createBeacon()).done();
		cordova.plugins.locationManager.stopAdvertising().done();
		cordova.plugins.backgroundMode.disable();
		window.localStorage.removeItem('findMeIDs');
	}
	static createBeacon() {
		return new cordova.plugins.locationManager.BeaconRegion('findapp', '1e6153b0-9c7e-47e9-a14a-c917fad22e41', 5, 1000, true);
	}

	static startBeacon() {
		var delegate = new cordova.plugins.locationManager.Delegate();
		delegate.didDetermineStateForRegion = function () {
			if (bluetooth.started && new Date().getTime() - bluetooth.started > 3600000)
				setTimeout(function () { ble.stopScan(bluetooth.restartScan) }, 15000);
		};
		var beaconRegion = bluetooth.createBeacon();
		cordova.plugins.locationManager.setDelegate(delegate);
		if (global.getOS() == 'ios')
			cordova.plugins.locationManager.requestAlwaysAuthorization();
		cordova.plugins.locationManager.startMonitoringForRegion(beaconRegion)
			.fail(function (e) { communication.sendError('beacon startMonitoringForRegion: ' + JSON.stringify(e)); }).done();
		cordova.plugins.locationManager.isAdvertisingAvailable()
			.then(function (supported) {
				if (supported)
					cordova.plugins.locationManager.startAdvertising(beaconRegion).fail(function (e) { communication.sendError('beacon startAdvertising: ' + JSON.stringify(e)); }).done();
				else
					communication.sendError('beacon startAdvertising not supported');
			}).fail(function (e) { communication.sendError('beacon isAdvertisingAvailable: ' + JSON.stringify(e)); }).done();
	}
}