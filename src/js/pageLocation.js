import { communication } from './communication';
import { details } from './details';
import { pageEvent } from './pageEvent';
import { geoData } from './geoData';
import { global, Strings } from './global';
import { lists } from './lists';
import { Location, model } from './model';
import { pageChat } from './pageChat';
import { ui, formFunc } from './ui';
import { user } from './user';
import { pageHome } from './pageHome';

export { pageLocation };

class pageLocation {
	static locationsAdded = null;
	static map = {
		canvas: null,
		id: null,
		loadActive: false,
		markerLocation: null,
		markerMe: null,
		open: false,
		scrollTop: -1,
		svgLocation: null,
		svgMe: null,
		timeout: null
	};
	static reopenEvent;
	static templateDetail = v =>
		global.template`<detailHeader idFav="${v.locationFavorite.id}" data="${v.data}">
	<detailImg>
		<img src="${v.image}" />
		<detailTitle>
			<title>${v.name}</title>
		</detailTitle>
		<detailCompass${v.compassDisplay}>
			<span a="${v.angle}" style="transform:rotate(${v.angle}deg);">&uarr;</span>
			<km>${v.distance}</km>
		</detailCompass>
		<detailDistance${v.distanceDisplay}>
			${v.gender}
			<km>${v.distance}</km>
		</detailDistance>
		<matchIndicator onclick="pageLocation.toggleMatchIndicatorHint(${v.id}, event)"${v.hideMeMatchIndicator}>
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
	</detailImg>
</detailHeader>
${v.eventDetails}
${v.skills}
${v.matchIndicatorHintDescription}
${v.description}
${v.rating}
<text>${v.address}</text>
<img class="map${v.hideMeGoogle}"
	onclick="ui.navigation.openHTML(&quot;https://maps.google.com/maps/dir/${geoData.current.lat},${geoData.current.lon}/${v.latitude},${v.longitude}&quot;)" />
<detailButtons>
	<buttontext class="bgColor${v.loggedIn}"
		onclick="ui.navigation.goTo(&quot;login&quot;)">${ui.l('login.action')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}${v.notLoggedIn}" name="buttonEvents"
		onclick="pageEvent.toggle(${v.locID})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor${v.favorite}${v.hideMeFavorite}${v.notLoggedIn}" name="buttonFavorite"
		onclick="pageLocation.toggleFavorite(&quot;${v.id}&quot;)">${ui.l('locations.favoritesButton')}</buttontext>
	<buttontext class="bgColor${v.pressedCopyButton}${v.notLoggedIn}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;${v.event.id ? 'e' : 'l'}=${v.id}&quot;)">${ui.l('chat.share')}</buttontext>
	<buttontext class="bgColor${v.hideMePotentialParticipants}${v.notLoggedIn}" name="buttonPotentialParticipants"
		onclick="pageEvent.loadPotentialParticipants()">${ui.l('events.potentialParticipants')}</buttontext>
	<buttontext class="bgColor${v.hideMeEdit}${v.notLoggedIn}" name="buttonEdit"
		onclick="${v.editAction}">${ui.l('edit')}</buttontext>
	<buttontext class="bgColor${v.hideMeGoogle}${v.notLoggedIn}" name="buttonGoogle"
		onclick="ui.navigation.openHTML(&quot;https://google.com/search?q=${encodeURIComponent(v.name + ' ' + v.town)}&quot;)">${ui.l('locations.google')}</buttontext>
	<buttontext class="bgColor${v.hideMeBlock}${v.notLoggedIn}" name="buttonBlock"
		onclick="pageLocation.toggleBlock(&quot;${v.id}&quot;)">${ui.l('contacts.blockAction')}</buttontext>
</detailButtons>
<text name="events" class="collapsed" style="margin:0 -1em;"></text>
<text name="matchIndicatorHint" class="popup" style="display:none;" onclick="ui.toggleHeight(this)">
	<div>${v.matchIndicatorHint}</div>
</text>
<text name="block" class="collapsed">
	<div style="padding:1em 0;">
		<input-checkbox name="type" value="1" label="${v.blockUser}" ${v.hideBlockUser}></input-checkbox>
		<div style=";margin-top:1.5em;">
			<input-checkbox type="radio" name="reason" value="51" deselect="true" label="${ui.l('locations.blockReason1')}"></input-checkbox>
			<input-checkbox type="radio" name="reason" value="52" deselect="true" label="${ui.l('locations.blockReason2')}" ${v.hideBlockReason2}></input-checkbox>
			<input-checkbox type="radio" name="reason" value="100" deselect="true" label="${ui.l('locations.blockReason100')}"></input-checkbox>
		</div>
		<textarea placeholder="${ui.l('contacts.blockDescHint')}" name="note" maxlength="250"></textarea>
		<buttontext onclick="pageLocation.block()" style="margin-top:0.5em;" class="bgColor">${ui.l('save')}</buttontext>
	</div>
</text>
<text name="copy" class="collapsed">
	<detailTogglePanel>
		${v.copyLinkHint}
	</detailTogglePanel>
</text>
<text name="potentialParticipants" class="collapsed" style="margin:0 -1.5em;">
	<detailTogglePanel></detailTogglePanel>
</text>`;
	static templateEdit = v =>
		global.template`<form name="editElement" onsubmit="return false">
<input type="hidden" name="id" transient="true" value="${v.id}" />
<input type="hidden" name="latitude" value="${v.latitude}" />
<input type="hidden" name="longitude" value="${v.longitude}" />
<input type="hidden" name="town" />
<input type="hidden" name="street" />
<input type="hidden" name="zipCode" />
<input type="hidden" name="country" />
<input type="hidden" name="address2" />
<field>
	<label style="padding-top:1em;">${ui.l('name')}</label>
	<value>
		<input type="text" name="name" maxlength="100" value="${v.name}" />
		<div style="text-align:center;padding-top:1em;${v.showNearByButton}"><buttontext class="bgColor" onclick="pageLocation.showLocationsNearby(event)">${ui.l('all')}</buttontext></div>
		<locationNameInputHelper style="display:none;"></locationNameInputHelper>
	</value>
</field>
<field>
	<label>${ui.l('description')}</label>
	<value>
		<textarea name="description" maxlength="1000">${v.description}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('locations.address')}</label>
	<value>
		<textarea name="address" maxlength="250">${v.address}</textarea>
	</value>
</field>
<field>
	<label>${ui.l('locations.telephone')}</label>
	<value>
		<input type="tel" name="telephone" maxlength="20" value="${v.telephone}"}/>
	</value>
</field>
<field>
	<label>${ui.l('picture')}</label>
	<value>
		<input-image src="${v.image}"></input-image>
	</value>
</field>
<dialogButtons>
	<buttontext onclick="pageLocation.save()" class="bgColor">
		${ui.l('save')}
	</buttontext>
	${v.deleteButton}
	<popupHint></popupHint>
</dialogButtons>
</form>`;
	static block() {
		var path = 'detail card:last-child [name="block"]';
		formFunc.resetError(ui.q(path + ' [name="note"]'));
		var v = {
			classname: 'Block',
			values: {
			}
		};
		if (ui.q(path).getAttribute('blockID') > 0)
			v.id = ui.q(path).getAttribute('blockID');
		var n = ui.q(path + ' [name="note"]');
		if (!n.value && ui.q(path + ' [name="reason"][value="100"][checked="true"]')) {
			formFunc.setError(n, 'contacts.blockActionHint');
			return;
		}
		v.values.reason = ui.val(path + ' [name="reason"][checked="true"]');
		v.values.note = n.value;
		var id = ui.q('detail card:last-child').getAttribute('i');
		if (ui.q(path + ' input-checkbox[name="type"][checked="true"]'))
			v.values.contactId2 = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data'))).contact.id;
		else if (id.indexOf && id.indexOf('_') > 0)
			v.values.eventId = id.substring(0, id.indexOf('_'));
		else
			v.values.locationId = id;
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageLocation.block()',
			method: v.id ? 'PUT' : 'POST',
			body: v,
			success() {
				var e = ui.q('locations [i="' + id + '"]');
				if (e) {
					e.outerHTML = '';
					lists.setListHint('locations');
				}
				ui.navigation.goTo(ui.q('detail').getAttribute('from'));
			}
		});
	}
	static closeLocationInputHelper() {
		var e = ui.q('locationNameInputHelper');
		if (e.innerHTML)
			ui.toggleHeight(e);
	}
	static deleteElement(id, classname) {
		if (ui.q('#deleteElement').innerHTML.indexOf(' ') > 0) {
			if (!id) {
				ui.navigation.closePopup();
				return;
			}
			communication.ajax({
				url: global.serverApi + 'db/one',
				webCall: 'pageLocation.deleteElement(id,classname)',
				method: 'DELETE',
				body: { classname: classname, id: id },
				success(r) {
					ui.navigation.closePopup();
					ui.navigation.goTo('home');
					if (classname == 'Event')
						pageHome.events = null;
					setTimeout(function () {
						if (classname == 'Location')
							lists.removeListEntry(id, 'locations');
						else {
							var rows = ui.qa('locations row[i^="' + id + '_"]');
							for (var i = 0; i < rows.length; i++)
								lists.removeListEntry(rows[i].getAttribute('i'), 'locations');
						}
					}, 700);
				}
			});
		} else
			ui.html('#deleteElement', ui.l('delete.confirm'));
	}
	static detailLocationEvent(l, id) {
		var v = model.convert(new Location(), l);
		if (!v.id)
			v.name = v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
		v.id = id;
		v.hideMePotentialParticipants = ' hidden';
		v.data = encodeURIComponent(JSON.stringify(v));
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 ? 0 : 1).replace('.', ',') : '';
		v.classBGImg = 'class="mainBG"';
		v.locID = v.event.id ? v.event.locationId : v.id;
		v.angle = geoData.getAngel(geoData.current, { lat: v.latitude, lon: v.longitude });
		v.image = v.event.image ? v.event.image : v.image ? v.image : v.contact.image;
		v.blockUser = ui.l('locations.blockUser').replace('{0}', v.contact.pseudonym);
		var eventWithLocation = v.address ? true : false;
		if (v.event.id) {
			v.eventDetails = pageEvent.detail(v);
			v.hideBlockReason2 = ' style="display:none;"';
			var skills = ui.getSkills(eventWithLocation ? v.event : v.contact, 'detail');
			if (skills.totalMatch) {
				v.matchIndicator = skills.totalMatch + '/' + skills.total;
				v.matchIndicatorPercent = parseInt(skills.totalMatch / skills.total * 100 + 0.5);
			} else
				v.matchIndicatorPercent = 0;
			v.matchIndicatorHint = ui.l('events.matchIndicatorHint').replace('{0}', skills.totalMatch).replace('{1}', skills.total).replace('{2}', v.matchIndicatorPercent).replace('{3}', skills.categories);
			if (eventWithLocation || !user.contact || v.event.contactId != user.contact.id) {
				v.skills = skills.text();
				if (v.skills) {
					v.skills = '<text onclick="ui.toggleHeight(&quot;detail card:last-child .matchIndicatorAttributesHint&quot;)">' + v.skills + '</text>';
					v.matchIndicatorHintDescription = skills.hint();
				}
			}
		} else {
			v.hideBlockUser = ' style="display:none;"';
			if (global.isBrowser())
				v.copyLinkHint = ui.l('copyLinkHint.location');
			else
				v.copyLinkHint = ui.l('copyLinkHint.locationSocial');
			v.editAction = 'pageLocation.edit(' + v.id + ')';
			v.hideMeMatchIndicator = ' class="hidden"';
		}
		if (v.image)
			v.image = global.serverImg + v.image;
		else
			v.image = (v.event.id ? 'images/event.svg' : 'images/location.svg') + '" class="mainBG" style="padding:8em;';
		var r = v.event.rating || (eventWithLocation ? v.rating : v.contact.rating);
		if (r > 0)
			v.rating = '<detailRating onclick="ratings.open(' + v.event.id + ',&quot;' + (v.event.id ? 'event.id=' + v.event.id : eventWithLocation ? 'event.locationId=' + v.locID : 'event.contactId=' + v.contact.id) + '&quot;)"><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + r) + '%;">★★★★★</full></ratingSelection></detailRating>';
		else if (v.event.id && v.event.locationId >= -1 && user.contact && v.event.contactId != user.contact.id)
			v.rating = '<div style="margin:1em 0;" class="ratingButton hidden"><buttontext class="bgColor" onclick="ratings.open(' + v.event.id + ')">' + ui.l('rating.save') + '</buttontext></div>';
		if (eventWithLocation)
			v.distanceDisplay = ' style="display:none;"';
		else {
			v.compassDisplay = ' style="display:none;"';
			if (v.contact.gender)
				v.gender = '<img src="images/gender' + v.contact.gender + '.svg" />';
		}
		if (eventWithLocation) {
			v.address = v.address.replace(/\n/g, '<br />');
			if (v.telephone)
				v.address = '<a href="tel:' + v.telephone.replace(/[^+\d]*/g, '') + '" style="color:black;">' + v.address + '<br/>' + v.telephone + '</a>';

		}
		if (v.description)
			v.description = '<text class="description">' + Strings.replaceLinks(v.description.replace(/\n/g, '<br/>')) + '</text>';
		if (v.bonus)
			v.bonus = '<text style="margin:1em 0;" class="highlightBackground">' + ui.l('locations.bonus') + v.bonus + '<br/>' + ui.l('locations.bonusHint') + '</text>';
		if (user.contact) {
			if (v.event.contactId == user.contact.id || v.contactId == user.contact.id)
				v.hideMeBlock = ' hidden';
			v.loggedIn = ' hidden';
		} else
			v.notLoggedIn = ' hidden';
		if (v.locationFavorite.favorite)
			v.favorite = ' favorite';
		if (global.isBrowser())
			v.displaySocialShare = 'display: none; ';
		v.pressedCopyButton = pageChat.copyLink.indexOf(global.encParam(v.event.id ? 'e=' + v.event.id : 'l=' + v.id)) > -1 ? ' buttonPressed' : '';
		if (v.address && user.contact)
			communication.ajax({
				url: global.serverApi + 'action/map?source=' + geoData.current.lat + ',' + geoData.current.lon + '&destination=' + v.latitude + ',' + v.longitude,
				webCall: 'pageLocation.detailLocationEvent(l,id)',
				progressBar: false,
				success(r) {
					var x = 0, f = function () {
						if (x++ > 20)
							return;
						if (!ui.q('[i="' + v.id + '"] img.map'))
							setTimeout(f, 100);
						else
							ui.attr('[i="' + v.id + '"] img.map', 'src', 'data:image/png;base64,' + r);
					};
					f.call();
				}
			});
		else
			v.hideMeGoogle = ' hidden';
		return pageLocation.templateDetail(v);
	}
	static edit(id) {
		ui.navigation.hideMenu();
		pageLocation.reopenEvent = false;
		if (id) {
			var v = JSON.parse(decodeURIComponent(ui.q('detail card:last-child detailHeader').getAttribute('data')));
			if (v.contactId == user.contact.id)
				pageLocation.editInternal(id, v);
			else {
				if (pageLocation.locationsAdded <= global.minLocations)
					ui.navigation.openPopup(ui.l('attention'), ui.l('locations.editHint').replace('{0}', pageLocation.locationsAdded) + '<br/><br/><buttontext class="bgColor" onclick="pageLocation.edit()">' + ui.l('locations.new') + '</buttontext>');
				else
					pageLocation.editInternal(id, v);
			}
		} else {
			if (ui.q('popup input[name="location"]'))
				pageLocation.reopenEvent = true;
			pageLocation.editInternal();
			setTimeout(pageLocation.prefillAddress, 1200);
		}
	}
	static editInternal(id, v) {
		if (v) {
			if (v.contactId == user.contact.id)
				v.deleteButton = '<buttontext onclick="pageLocation.deleteElement(' + id + ',&quot;Location&quot;)" class="bgColor" id="deleteElement">' + ui.l('delete') + '</buttontext>';
		} else if (!id && user.get('location'))
			v = user.get('location').values;
		if (!v)
			v = {};
		if (id)
			v.showNearByButton = 'display:none';
		if (!v.longitude)
			v.longitude = geoData.current.lon;
		if (!v.latitude)
			v.latitude = geoData.current.lat;
		if (v.image)
			v.image = 'src="' + global.serverImg + v.image + '"';
		ui.navigation.openPopup(ui.l('locations.' + (id ? 'edit' : 'new')).replace('{0}', v.name), pageLocation.templateEdit(v), id ? '' : 'pageLocation.saveDraft()');
	}
	static hasCategory(cats, catString) {
		catString = '' + catString;
		for (var i = 0; i < catString.length; i++) {
			if (cats[catString.substring(i, i + 1)])
				return true;
		}
	}
	static isInPosition(compass, angle) {
		if (compass == 'E' && angle > 45 && angle <= 135)
			return 'E';
		if (compass == 'S' && angle > 135 && angle <= 225)
			return 'S';
		if (compass == 'W' && angle > 225 && angle <= 315)
			return 'W';
		if (compass == 'N' && (angle > 315 || angle <= 45))
			return 'N';
	}
	static listLocation(l) {
		if (ui.q('locations buttontext.map'))
			ui.q('locations buttontext.map').style.display = null;
		var s = '';
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Location(), l, i);
			var text, extra, image;
			var skills = ui.getSkills(v.event.id ? v.event : v.contact, 'list');
			extra = v._geolocationDistance ?
				'<km>' + parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 || !v.id ? 0 : 1).replace('.', ',') + '</km><br/>' : '';
			if (skills.total && skills.totalMatch / skills.total > 0)
				extra += parseInt(skills.totalMatch / skills.total * 100 + 0.5) + '%';
			extra += '<br/>';
			if (v._geolocationDistance && v.latitude)
				extra += '<compass style="transform:rotate('
					+ geoData.getAngel(geoData.current, { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass>';
			else if (v.contact.gender)
				extra += '<img src="images/gender' + v.contact.gender + '.svg" />';
			text = skills.text();
			if (text)
				text += '<br/>';
			if (v.description)
				text += v.description;
			if (v.imageList)
				image = global.serverImg + v.imageList;
			else
				image = 'images/location.svg';
			var oc;
			if (ui.navigation.getActiveID() == 'settings')
				oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
			else
				oc = 'details.open(&quot;' + v.id + '&quot;,' + JSON.stringify({
					webCall: 'pageLocation.listLocation(l)', query: 'location_list', search: encodeURIComponent('location.id=' + v.id)
				}).replace(/"/g, '&quot;') + ',pageLocation.detailLocationEvent)';
			s += global.template`<list-row onclick="${oc}" i="${v.id}" class="location${v.locationFavorite.favorite ? ' favorite' : ''}"
					title="${encodeURIComponent(v.name)}"
					text="${encodeURIComponent(text)}"
					extra="${encodeURIComponent(extra)}"
					image="${image}"></list-row>`;
		}
		if (ui.q('locations map') && ui.q('locations map').style.display != 'none')
			setTimeout(pageLocation.scrollMap, 400);
		if (pageLocation.map.open) {
			pageLocation.map.open = false;
			pageLocation.toggleMap();
		}
		formFunc.svg.replaceAll();
		return s;
	}
	static prefillAddress() {
		if (geoData.localized && ui.q('input[name="name"]') && !ui.val('[name="address"]')) {
			communication.ajax({
				url: global.serverApi + 'action/google?param=' + encodeURIComponent('latlng=' + geoData.current.lat + ',' + geoData.current.lon),
				webCall: 'pageLocation.prefillAddress()',
				responseType: 'json',
				success(r) {
					if (r.formatted && !ui.val('[name="address"]'))
						ui.html('[name="address"]', r.formatted);
				}
			});
		}
	}
	static showLocationsNearby(event) {
		if (ui.q('input[name="name"]')) {
			communication.ajax({
				url: global.serverApi + 'action/google?param=' + encodeURIComponent('place/nearbysearch/json?radius=100&sensor=false&location=' + geoData.current.lat + ',' + geoData.current.lon),
				webCall: 'pageLocation.showLocationsNearby(event)',
				responseType: 'json',
				success(r) {
					if (r.status == 'OK') {
						event.target.parentNode.outerHTML = '';
						r = r.results;
						var s = '';
						for (var i = 0; i < r.length; i++) {
							if (r[i].types[0] && r[i].types[0].indexOf('locality') < 0 && r[i].types[0].indexOf('route') < 0 && r[i].name && !r[i].permanently_closed)
								s += '<li onclick="pageLocation.setLocationName(event)" d="' + r[i].types[0] + '" n="' + r[i].name + '" a="' + r[i].vicinity + '">' + r[i].name + '</li>';
						}
						if (s) {
							ui.html('locationNameInputHelper', '<ul>' + s + '</ul><div style="text-align:center;"><buttontext onclick="pageLocation.closeLocationInputHelper()" class="bgColor">' + ui.l('locations.closeInputHelper') + '</buttontext></div>');
							pageLocation.showLocationInputHelper();
							ui.q('form input[name="name"]').onfocus = pageLocation.showLocationInputHelper;
						}
					}
				}
			});
		}
	}
	static replaceMapDescData(s) {
		if (!s)
			return '';
		return s.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/\n/g, global.separatorTech).replace(/\r/g, '');
	}
	static reset() {
		pageLocation.locationsAdded = null;
	}
	static save() {
		ui.html('popupHint', '');
		var name = ui.q('popup [name="name"]');
		var address = ui.q('[name="address"]');
		formFunc.resetError(name);
		formFunc.resetError(address);
		if (!name.value)
			formFunc.setError(name, 'locations.errorName');
		else
			formFunc.validation.filterWords(name);
		if (!ui.val('[name="description"]'))
			formFunc.validation.filterWords(ui.q('[name="description"]'));
		if (!ui.val('[name="address"]'))
			formFunc.setError(address, 'locations.errorAddress');
		else if (address.value.indexOf('\n') < 0) {
			if (address.value.indexOf(',') < 0)
				formFunc.setError(address, 'locations.errorAddressFormat');
			else
				address.value = address.value.replace(/,/g, '\n');
		}
		if (ui.q('popup errorHint')) {
			ui.scrollTo('popupContent', 0);
			return;
		}
		var id = ui.val('[name="id"]');
		var v = formFunc.getForm('popup form');
		v.classname = 'Location';
		if (id)
			v.id = id;
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageLocation.save()',
			method: id ? 'PUT' : 'POST',
			body: v,
			error(e) {
				if (e.status == 500 && e.response && (e.response.indexOf('exists') > -1 || e.response.indexOf('ConstraintViolationException') > -1))
					ui.html('popupHint', ui.l('locations.alreadyExists'));
				else if (e.status == 500 && e.response && e.response.indexOf('Invalid address') > -1)
					ui.html('popupHint', ui.l('locations.invalidAddress'));
				else
					communication.onError(e);
			},
			success(r) {
				ui.navigation.closePopup();
				user.remove('location');
				if (!r)
					r = id;
				details.open(r, { webCall: 'pageLocation.save()', query: 'location_list', search: encodeURIComponent('location.id=' + r) }, id ? function (l, id) {
					ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id);
				} : pageLocation.detailLocationEvent);
				if (!id && pageLocation.reopenEvent)
					setTimeout(function () { pageEvent.edit(r); }, 1000);
			}
		});
	}
	static saveDraft() {
		if (ui.q('popup input[name="id"]').value)
			return;
		user.set('location', formFunc.getForm('popup form'));
	}
	static scrollMap() {
		if (ui.cssValue('map', 'display') == 'none')
			return;
		if (pageLocation.map.scrollTop != ui.q('locations listBody').scrollTop) {
			pageLocation.map.scrollTop = ui.q('locations listBody').scrollTop;
			clearTimeout(pageLocation.map.timeout);
			pageLocation.map.timeout = setTimeout(pageLocation.scrollMap, 100);
			return;
		}
		var rows = ui.qa('locations listResults row');
		var id = ui.q('locations listBody').scrollTop - ui.emInPX, i = 0;
		for (; i < rows.length; i++) {
			if (rows[i].offsetTop > id && rows[i].getAttribute('filtered') != 'true') {
				id = parseInt(rows[i].getAttribute('i'));
				break;
			}
		}
		if (id == pageLocation.map.id || !rows[i])
			return;
		ui.classRemove('locations listResults row div.highlightMap', 'highlightMap');
		rows[i].children[0].classList = 'highlightMap';
		pageLocation.map.id = id;
		var d = model.convert(new Location(), lists.data['locations'], i + 1);
		if (pageLocation.map.canvas) {
			pageLocation.map.markerMe.setMap(null);
			pageLocation.map.markerLocation.setMap(null);
			ui.q('map').setAttribute('created', new Date().getTime());
			ui.q('locations buttontext.map').style.display = null;
		} else {
			pageLocation.map.canvas = new google.maps.Map(ui.q('map'), { mapTypeId: google.maps.MapTypeId.ROADMAP, disableDefaultUI: true });
			pageLocation.map.canvas.addListener('bounds_changed', function () {
				if (new Date().getTime() - ui.q('map').getAttribute('created') > 2000)
					ui.q('locations buttontext.map').style.display = 'inline-block';
			});
		}
		if (!pageLocation.map.loadActive) {
			var deltaLat = Math.abs(geoData.current.lat - d.latitude) * 0.075, deltaLon = Math.abs(geoData.current.lon - d.longitude) * 0.075;
			pageLocation.map.canvas.fitBounds(new google.maps.LatLngBounds(
				new google.maps.LatLng(Math.max(geoData.current.lat, d.latitude) + deltaLat, Math.min(geoData.current.lon, d.longitude) - deltaLon), //south west
				new google.maps.LatLng(Math.min(geoData.current.lat, d.latitude) - deltaLat, Math.max(geoData.current.lon, d.longitude) + deltaLon) //north east
			));
			pageLocation.map.markerMe = new google.maps.Marker(
				{
					map: pageLocation.map.canvas,
					title: 'me',
					contentString: '',
					icon: {
						url: pageLocation.map.svgMe,
						scaledSize: new google.maps.Size(24, 24),
						origin: new google.maps.Point(0, 0),
						anchor: new google.maps.Point(12, 24)
					},
					position: new google.maps.LatLng(geoData.current.lat, geoData.current.lon)
				});
		}
		pageLocation.map.markerLocation = new google.maps.Marker(
			{
				map: pageLocation.map.canvas,
				title: d.name,
				contentString: '',
				icon: {
					url: pageLocation.map.svgLocation,
					scaledSize: new google.maps.Size(40, 40),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(20, 40)
				},
				position: new google.maps.LatLng(d.latitude, d.longitude)
			});
	}
	static setLocationName(event) {
		var e = event.target;
		ui.q('form input[name="name"]').value = e.getAttribute('n');
		ui.q('form textarea[name="description"]').value = e.getAttribute('d');
		var s = e.getAttribute('a');
		if (s.indexOf(',') > 0) {
			var s2 = '';
			s = s.split(',');
			for (var i = 0; i < s.length; i++)
				s2 += s[i].trim() + '\n';
			ui.q('form textarea[name="address"]').value = s2.trim();
		}
		pageLocation.closeLocationInputHelper();
	}
	static showLocationInputHelper(event) {
		var e = ui.q('locationNameInputHelper');
		if (e.innerHTML && ui.cssValue(e, 'display') == 'none' && (!event || !ui.q('form input[name="name"]').value))
			ui.toggleHeight(e);
	}
	static toggleBlock(id) {
		var divID = 'detail card:last-child[i="' + id + '"] [name="block"]';
		var e = ui.q(divID);
		if (!e.getAttribute('blockID')) {
			communication.ajax({
				url: global.serverApi + 'db/one?query=misc_block&search=' + encodeURIComponent('block.contactId=' + user.contact.id + ' and ' + (id.indexOf && id.indexOf('_') > 0 ? 'block.eventId=' + id.substring(0, id.indexOf('_')) : 'block.locationId=' + id)),
				webCall: 'pageLocation.toggleBlock(id)',
				success(r) {
					if (r) {
						var v = JSON.parse(r);
						ui.attr(e, 'blockID', v.block.id);
						ui.qa(divID + ' input')[v.block.note ? 1 : 0].setAttribute('checked', 'true');
						if (v.block.reason != 0)
							ui.q(divID + ' [name="reason"][value="' + v.block.reason + '"]').setAttribute('checked', 'true');
						ui.q(divID + ' textarea').value = v.reason;
					} else
						ui.attr(e, 'blockID', 0);
				}
			});
		}
		details.togglePanel(e);
	}
	static toggleFavorite(id) {
		var idFav = ui.q('detailHeader').getAttribute('idFav');
		var v = { classname: 'LocationFavorite' };
		if (idFav) {
			v.values = { favorite: ui.q('detail card:last-child buttontext.favorite') ? false : true };
			v.id = idFav;
		} else
			v.values = { locationId: id };
		communication.ajax({
			url: global.serverApi + 'db/one',
			webCall: 'pageLocation.toggleFavorite(id)',
			method: idFav ? 'PUT' : 'POST',
			body: v,
			success(r) {
				if (r) {
					ui.attr('detailHeader', 'idFav', r);
					v.values.favorite = true;
				}
				if (v.values.favorite) {
					ui.classAdd('detail card:last-child buttontext[name="buttonFavorite"]', 'favorite');
					ui.classAdd('row.location[i="' + id + '"]', 'favorite');
				} else {
					ui.classRemove('detail card:last-child buttontext.favorite', 'favorite');
					ui.classRemove('row.location[i="' + id + '"]', 'favorite');
				}
			}
		});
	}
	static toggleMap() {
		if (ui.q('map').getAttribute('created')) {
			ui.q('map').setAttribute('created', new Date().getTime());
			if (ui.cssValue('map', 'display') == 'none') {
				ui.css('locations listBody', 'margin-top', '20em');
				ui.css('locations listBody', 'padding-top', '0.5em');
			} else {
				ui.css('locations listBody', 'margin-top', '');
				ui.css('locations listBody', 'padding-top', '');
				ui.q('locations buttontext.map').style.display = null;
				pageLocation.map.loadActive = false;
			}
			ui.toggleHeight('map', pageLocation.scrollMap);
			lists.hideFilter();
			pageLocation.map.scrollTop = -1;
			pageLocation.map.id = -1;
			setTimeout(function () { ui.classRemove('locations listResults row div.highlightMap', 'highlightMap'); }, 500);
		} else if (!ui.q('locations row')) {
			pageLocation.map.open = true;
			//pageLocation.search();
		} else {
			ui.attr('map', 'created', new Date().getTime());
			communication.loadMap('pageLocation.toggleMap');
			ui.on('locations listBody', 'scroll', pageLocation.scrollMap);
		}
	}
	static toggleMatchIndicatorHint(id, event) {
		var e = ui.q('detail card:last-child [name="matchIndicatorHint"]');
		var button = ui.parents(event.target, 'matchIndicator');
		e.style.top = (button.offsetTop + button.offsetHeight) + 'px';
		e.style.left = '5%';
		ui.toggleHeight(e);
	}
}