import { communication } from './communication';
import { details } from './details';
import { events } from './events';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { Location, model, LocationOpenTime } from './model';
import { pageChat } from './pageChat';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageLocation };

class pageLocation {
	static filter = {};
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
	static templateList = v =>
		global.template`<row onclick="${v.oc}" i="${v.id}" class="location${v.classFavorite}">
			${v.present}
	<div>
		<text>
			<title>${v.name}</title>
			${v._message}
		</text>
		<extra>${v.extra}</extra>
		<imagelist>
			<img src="${v.image}" class="${v.classBGImg}" />
			${formFunc.image.getSVG('favorite')}
		</imagelist>
	</div>
</row>`;
	static templateDetail = v =>
		global.template`<detailHeader idFav="${v.locationFavorite.id ? v.locationFavorite.id : ''}" class="${v.favorite}" data="${v.data}">
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
		<matchIndicator onclick="pageLocation.toggleMatchIndicatorHint(${v.id}, event)">
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
${v.description}
<text>
	${v.telOpenTag}${v.address}<br/>${v.tel}${v.telCloseTag}
</text>
${v.attributes}
${v.budget}
<text>
${v.bonus}
${v.rating}
${v.parking}
<openTimes></openTimes>
<div>${v.openTimesBankholiday}</div>
<div>${v.openTimesText}</div>
</text>
<img class="map"
	onclick="ui.navigation.openHTML(&quot;https://maps.google.com/maps/dir/${geoData.latlon.lat},${geoData.latlon.lon}/${v.latitude},${v.longitude}&quot;)" />
<detailButtons>
	<buttontext class="bgColor"
		onclick="pageChat.open(${v.chatId},${v.chatLocation})">${ui.l('chat.title')}</buttontext>
	<buttontext class="bgColor${v.pressedCopyButton}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;${v.event.id ? 'e' : 'l'}=${v.id}&quot;)">${ui.l('share')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}" name="buttonEvents"
		onclick="events.toggle(${v.locID})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}" name="buttonWhatToDo"
		onclick="pageLocation.toggleWhatToDo(${v.id})">${ui.l('wtd.location')}</buttontext>
	<buttontext class="bgColor${v.hideMePotentialParticipants}" name="buttonPotentialParticipants"
		onclick="events.loadPotentialParticipants(${v.category},${v.event.visibility})">${ui.l('events.potentialParticipants')}</buttontext>
	<buttontext class="bgColor${v.hideMeMarketing}" name="buttonMarketing"
		onclick="ui.navigation.openHTML(&quot;${global.server}locOwner?id=${v.id}&quot;,&quot;locOwn&quot;)">${ui.l('locations.marketing')}</buttontext>
	<buttontext class="bgColor${v.hideMeEdit}" name="buttonEdit"
		onclick="${v.editAction}">${ui.l('edit')}</buttontext>
	<buttontext class="bgColor" name="buttonGoogle"
		onclick="ui.navigation.openHTML(&quot;https://google.com/search?q=${encodeURIComponent(v.name + ' ' + v.town)}&quot;)">Google</buttontext>
	<buttontext class="bgColor${v.blocked}" name="buttonBlock"
		onclick="pageLocation.toggleBlock(&quot;${v.id}&quot;)">${ui.l('contacts.blockAction')}</buttontext>
</detailButtons>
<text name="events" class="collapsed" ${v.urlNotActive} style="margin:0 -1em;"></text>
<text name="matchIndicatorHint" class="popup" style="display:none;" onclick="ui.toggleHeight(this)">
	<div>${v.matchIndicatorHint}</div>
</text>
<text class="popup matchIndicatorAttributesHint" style="display:none;" onclick="ui.toggleHeight(this)">
	<div></div>
</text>
<text name="block" class="collapsed">
	<div style="padding:1em 0;">
		<input type="radio" name="type" value="1" label="${ui.l('contacts.blockAction')}"
			onclick="pageLocation.showBlockText()" checked="true" />
		<input type="radio" name="type" value="2" label="${ui.l('contacts.blockAndReportAction')}"
			onclick="pageLocation.showBlockText()" />
		<br />
		<div style="display:none;margin-top:0.5em;">
			<input type="radio" name="reason" value="1" label="${ui.l('locations.blockReason1')}" />
			<input type="radio" name="reason" value="2" label="${ui.l('locations.blockReason2')}" ${v.hideBlockReason2}/>
			<input type="radio" name="reason" value="100" label="${ui.l('locations.blockReason100')}" checked />
		</div>
		<textarea placeholder="${ui.l('contacts.blockDescHint')}" name="note" maxlength="250" style="display:none;"></textarea>
		<buttontext onclick="pageLocation.block()" style="margin-top:0.5em;"
			class="bgColor">${ui.l('save')}</buttontext>
	</div>
</text>
<text name="whatToDo" class="collapsed">
	<detailTogglePanel>
		<form name="editElement" onsubmit="return false">
			<input type="hidden" name="type" value="o" />
			<input type="hidden" name="visibility" value="2" />
			<field>
				<label>${ui.l('wtd.time')}</label>
				<value>
					<input type="time" name="startDate" placeholder="HH:MM" step="900" value="${v.wtdTime}" />
				</value>
			</field>
			<field>
				<label>${ui.l('description')}</label>
				<value>
					<textarea name="text" maxlength="1000"></textarea>
				</value>
			</field>
		</form>
		<buttontext class="bgColor" onclick="pageLocation.saveEvent(${v.locID})" style="margin-top:2em;">
			${ui.l('save')}
		</buttontext>
	</detailTogglePanel>
</text>
<text name="copy" class="collapsed">
	<detailTogglePanel>
		${v.copyLinkHint}<br />
		<buttontext onclick="pageInfo.socialShare(global.encParam(&quot;l=${v.id}&quot;))"
			style="margin-top:2em;${v.displaySocialShare}" class="bgColor">
			${ui.l('sendSocialShareLocation')}
		</buttontext>
	</detailTogglePanel>
</text>
<text name="potentialParticipants" class="collapsed" style="margin:0 -1.5em;">
	<detailTogglePanel></detailTogglePanel>
</text>
<text name="marketing" class="collapsed">
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
<input type="hidden" name="category" />
<input type="hidden" name="openTimesBankholiday" />
<input type="hidden" name="attr0" />
<input type="hidden" name="attr1" />
<input type="hidden" name="attr2" />
<input type="hidden" name="attr3" />
<input type="hidden" name="attr4" />
<input type="hidden" name="attr5" />
${v.hint}
<field>
	<label>${ui.l('name')}</label>
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
		<input type="file" name="image" accept=".gif, .png, .jpg" ${v.image} />
	</value>
</field>
<field style="margin-bottom:0;">
	<label>${ui.l('priceCategory')}</label>
	<value>
		<input type="checkbox" value="0" name="budget" label="${ui.l('budget')}" ${v.budget0}/>
		<input type="checkbox" value="1" name="budget" label="${ui.l('budget')}${ui.l('budget')}" ${v.budget1}/>
		<input type="checkbox" value="2" name="budget" label="${ui.l('budget')}${ui.l('budget')}${ui.l('budget')}" ${v.budget2}/>
	</value>
</field>
<field>
	<label>${ui.l('locations.parking')}</label>
	<value>
		<input type="checkbox" style="width:100%;" name="parkingOption" value="1" label="${ui.l('locations.parking1')}"${v.parkCheck1}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption" value="2" label="${ui.l('locations.parking2')}"${v.parkCheck2}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption" value="3" label="${ui.l('locations.parking3')}"${v.parkCheck3}/><br />
		<input type="checkbox" style="width:100%;" name="parkingOption" value="4" label="${ui.l('locations.parking4')}"${v.parkCheck4}/><br />
		<input type="text" name="parkingText" maxlength="100" placeholder="${ui.l('locations.shortDescParking')}" value="${v.parkingText}" style="float: left;" />
	</value>
</field>
<field>
	<label>${ui.l('category')}</label>
	<value style="text-align:center;">
		<input type="checkbox" name="locationcategory" transient="true" value="0" onclick="pageLocation.setEditAttributes()" label="${ui.categories[0].label}" ${v.cat0}/>
		<input type="checkbox" name="locationcategory" transient="true" value="1" onclick="pageLocation.setEditAttributes()" label="${ui.categories[1].label}" ${v.cat1}/>
		<input type="checkbox" name="locationcategory" transient="true" value="2" onclick="pageLocation.setEditAttributes()" label="${ui.categories[2].label}" ${v.cat2}/>
		<input type="checkbox" name="locationcategory" transient="true" value="3" onclick="pageLocation.setEditAttributes()" label="${ui.categories[3].label}" ${v.cat3}/>
		<input type="checkbox" name="locationcategory" transient="true" value="4" onclick="pageLocation.setEditAttributes()" label="${ui.categories[4].label}" ${v.cat4}/>
		<input type="checkbox" name="locationcategory" transient="true" value="5" onclick="pageLocation.setEditAttributes()" label="${ui.categories[5].label}" ${v.cat5}/>
	</value>
</field>
<field>
	<label>${ui.l('locations.subCategories')}</label>
	<value style="text-align:center;" id="loc_attrib" v0="${v.attr0}" v1="${v.attr1}" v2="${v.attr2}"
		v3="${v.attr3}" v4="${v.attr4}" v5="${v.attr5}" v6="${v.attr6}">
	</value>
</field>
<field ${v.hideOpenTimes}>
	<label>
		${ui.l('locations.opentimes')}
	</label>
	<value>
		<openTimesEdit>
			${v.ot}
		</openTimesEdit>
		<div><openTimesAdd class="bgColor" onclick="pageLocation.addOpenTimeRow()">+</openTimesAdd></div>
		<input type="checkbox" style="width:100%;" name="openTimesBankholiday2" transient="true" value="1" label="${ui.l('locations.closedOnBankHoliday')}" ${v.bankHolidayCheck}/><br />
		<input type="text" name="openTimesText" maxlength="100" placeholder="${ui.l('locations.shortDescOpenTimes')}" value="${v.openTimesText}" style="float: left;" />
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
	static templateEditMarketing = v =>
		global.template`${ui.l('locations.marketing1')}
				<br />
<buttontext onclick="this.style.display=&quot;none&quot;;this.nextSibling.style.display=&quot;&quot;"
	class="bgColor" style="margin: 1em;">
	${ui.l('locations.marketingMore1')}
</buttontext>
<div style="display:none;margin-top:1em;">
	<span onclick="openHTML(&quot;${global.server}agbB2B&quot;)">${ui.l('locations.marketing2')}
		<br /><br /></span>
	<field>
		<label>
			${ui.l('locations.marketingTaxNo')}
		</label>
		<value>
			<input type="text" id="taxNo" maxlength="20" />
		</value>
	</field>
	<field>
		<label>
			${ui.l('info.legalTitle')}
		</label>
		<value>
			<input id="agb" type="checkbox" label="${ui.l('login.legal')}" style="width:100%;margin-bottom:0;" />
		</value>
	</field>
	<field>
		<label>Dauer</label>
		<value>
			<input type="radio" value="30 Tage" label="30 Tage:&nbsp;40,00€" name="os0" checked="checked" />
			<input type="radio" value="60 Tage" label="60 Tage:&nbsp;65,00€" name="os0" />
			<input type="radio" value="90 Tage" label="90 Tage:&nbsp;90,00€" name="os0" />
		</value>
	</field>
	<buttontext class="bgColor" onclick="pageLocation.setOwner(${v.id})">
	${ui.l('locations.marketingConfirmTest')}
	</buttontext>
	<buttontext class="bgColor" style="margin-top:1em;"
					onclick="ui.navigation.openHTML(&quot;${global.server}agbB2B?scale=${v.scale}&quot;)">
	${ui.l('info.legalTitle')}
	</buttontext>
</div>`;
	static templateEditOpenTimes = v =>
		global.template`<select name="openTimes.day${v.i}">
	<option value="1"${v.wd1}>${ui.l('weekday1')}</option>
	<option value="2"${v.wd2}>${ui.l('weekday2')}</option>
	<option value="3"${v.wd3}>${ui.l('weekday3')}</option>
	<option value="4"${v.wd4}>${ui.l('weekday4')}</option>
	<option value="5"${v.wd5}>${ui.l('weekday5')}</option>
	<option value="6"${v.wd6}>${ui.l('weekday6')}</option>
	<option value="0"${v.wd0}>${ui.l('weekday0')}</option>
	<option value="x">${ui.l('delete')}</option>
</select>
<span>${ui.l('from')}</span>
<input type="time" placeholder="HH:MM" value="${v.openAt}"
	name="openTimes.openAt${v.i}" onblur="pageLocation.prefillOpenTimesFields(event,&quot;open&quot;);" />
<span>${ui.l('to')}</span>
<input type="time" placeholder="HH:MM" value="${v.closeAt}"
	name="openTimes.closeAt${v.i}" onblur="pageLocation.prefillOpenTimesFields(event,&quot;close&quot;);" />
<input type="hidden" value="${v.id}" name="openTimes.id${v.i}" />`;
	static templateSearch = v =>
		global.template`<form onsubmit="return false">
<input type="checkbox" name="filterCategories" value="0" label="${ui.categories[0].label}" onclick="pageLocation.filterList()" ${v.valueCat0}/>
<input type="checkbox" name="filterCategories" value="1" label="${ui.categories[1].label}" onclick="pageLocation.filterList()" ${v.valueCat1}/>
<input type="checkbox" name="filterCategories" value="2" label="${ui.categories[2].label}" onclick="pageLocation.filterList()" ${v.valueCat2}/>
<input type="checkbox" name="filterCategories" value="3" label="${ui.categories[3].label}" onclick="pageLocation.filterList()" ${v.valueCat3}/>
<input type="checkbox" name="filterCategories" value="4" label="${ui.categories[4].label}" onclick="pageLocation.filterList()" ${v.valueCat4}/>
<input type="checkbox" name="filterCategories" value="5" label="${ui.categories[5].label}" onclick="pageLocation.filterList()" ${v.valueCat5}/>
<filterSeparator></filterSeparator>
<input type="radio" name="filterCompass" value="N" label="${ui.l('locations.compassN')}" onclick="pageLocation.filterList()" deselect="true" ${v.valueCompassN}/>
<input type="radio" name="filterCompass" value="E" label="${ui.l('locations.compassE')}" onclick="pageLocation.filterList()" deselect="true" ${v.valueCompassE}/>
<input type="radio" name="filterCompass" value="S" label="${ui.l('locations.compassS')}" onclick="pageLocation.filterList()" deselect="true" ${v.valueCompassS}/>
<input type="radio" name="filterCompass" value="W" label="${ui.l('locations.compassW')}" onclick="pageLocation.filterList()" deselect="true" ${v.valueCompassW}/>
<filterSeparator></filterSeparator>
<input type="checkbox" label="${ui.l('search.matches')}" name="filterMatchesOnly" ${v.valueMatchesOnly}/>
<filterSeparator></filterSeparator>
<input type="text" name="filterKeywords" maxlength="50" placeholder="${ui.l('keywords')}" ${v.valueKeywords}/>
<explain class="searchKeywordHint">${ui.l('search.hintContact')}</explain>
<errorHint></errorHint>
<buttontext class="bgColor defaultButton" onclick="pageLocation.search()">${ui.l('search.action')}</buttontext><buttontext onclick="pageLocation.toggleMap()" class="bgColor">${ui.l('filterLocMapButton')}</buttontext></form>`;
	static addOpenTimeRow() {
		var v = {};
		v.i = ui.qa('openTimesEdit select').length;
		if (v.i > 0)
			v['wd' + ((parseInt(ui.q('[name="openTimes.day' + (v.i - 1) + '"]').value, 10) + 1) % 7)] = ' selected';
		var e2 = document.createElement('div');
		e2.innerHTML = pageLocation.templateEditOpenTimes(v);
		ui.q('openTimesEdit').insertBefore(e2, null);
	}
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
		if (!ui.q(path + ' [name="type"]').checked) {
			var n = ui.q(path + ' [name="note"]');
			if (!n.value && ui.q(path + ' [name="reason"][value="100"]:checked')) {
				formFunc.setError(n, 'contacts.blockActionHint');
				return;
			}
			v.values.reason = ui.val(path + ' [name="reason"]:checked');
			v.values.note = n.value;
		}
		var id = ui.q('detail card:last-child').getAttribute('i');
		if (id.indexOf && id.indexOf('_') > 0)
			v.values.eventId = id.substring(0, id.indexOf('_'));
		else
			v.values.locationId = id;
		communication.ajax({
			url: global.server + 'db/one',
			method: v.id ? 'PUT' : 'POST',
			body: v,
			success() {
				var e = ui.q('locations [i="' + id + '"]');
				if (e) {
					e.outerHTML = '';
					lists.setListHint('locations');
				}
				ui.navigation.goTo('locations');
				var e = lists.data['locations'];
				if (e) {
					for (var i = 1; i < e.length; i++) {
						if (model.convert(new Location(), e, i).id == id) {
							e.splice(i, 1);
							break;
						}
					}
				}
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
				ui.navigation.hidePopup();
				return;
			}
			communication.ajax({
				url: global.server + 'db/one',
				method: 'DELETE',
				body: { classname: classname, id: id },
				success(r) {
					ui.navigation.hidePopup();
					ui.navigation.goTo('home');
					if (classname == 'Event')
						events.init();
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
		if (l._openTimesEntries && user.contact)
			communication.ajax({
				url: global.server + 'db/list?query=location_listOpenTime&search=' + encodeURIComponent('locationOpenTime.locationId=' + l['location.id']),
				responseType: 'json',
				success(s) {
					var e = ui.q('detail card[i="' + id + '"][type="location"] detailHeader');
					if (e && e.getAttribute('data')) {
						while (model.convert(new LocationOpenTime(), s, 1).day == 0)
							s.push(s.splice(1, 1)[0]);
						var o = JSON.parse(decodeURIComponent(e.getAttribute('data')));
						o.OT = s;
						e.setAttribute('data', encodeURIComponent(JSON.stringify(o)));
						ui.html('detail card[i="' + id + '"][type="location"] openTimes', pageLocation.getOpenTimes(s));
					}
				}
			});
		return pageLocation.detailLocationEventInternal(l, id);
	}
	static detailLocationEventInternal(l, id) {
		var v = model.convert(new Location(), l);
		v.data = encodeURIComponent(JSON.stringify(v));
		l = l[1];
		v.parking = '';
		var p = v.parkingOption;
		if (p && p.indexOf('1') > -1)
			v.parking = global.separator + ui.l('locations.parking1');
		if (p && p.indexOf('2') > -1)
			v.parking += global.separator + ui.l('locations.parking2');
		if (p && p.indexOf('3') > -1)
			v.parking += global.separator + ui.l('locations.parking3');
		if (p && p.indexOf('4') > -1)
			v.parking += global.separator + ui.l('locations.parking4');
		if (v.parkingText)
			v.parking += global.separator + v.parkingText;
		if (v.parking)
			v.parking = '<div>' + v.parking.substring(global.separator.length) + '</div>';
		if (!v.id)
			v.name = v.contact.pseudonym + (v.contact.age ? ' (' + v.contact.age + ')' : '');
		v.id = id;
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 ? 0 : 1).replace('.', ',') : '';
		v.classBGImg = '';
		if (v.classBGImg.length < 8)
			v.classBGImg = 'class="mainBG"';
		v.locID = v.event.id ? v.event.locationId : id;
		v.angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
		v.image = v.event.image ? v.event.image : v.image ? v.image : v.contact.image;
		if (v.image)
			v.image = global.serverImg + v.image;
		else
			v.image = (v.event.id ? 'images/event.svg' : 'images/location.svg') + '" class="mainBG" style="padding:8em;';
		v.tel = v.telephone ? v.telephone.trim() : '';
		if (v.tel) {
			v.telOpenTag = '<a href="tel:' + v.tel.replace(/[^+\d]*/g, '') + '" style="color:black;">';
			v.telCloseTag = '</a>';
		}
		var eventWithLocation = v.address;
		v.attr = ui.getAttributes(eventWithLocation ? v : v.contact, 'detail');
		if (v.attr.totalMatch) {
			v.matchIndicator = v.attr.totalMatch + '/' + v.attr.total;
			v.matchIndicatorPercent = parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5);
		} else
			v.matchIndicatorPercent = 0;
		v.matchIndicatorHint = ui.l('locations.matchIndicatorHint').replace('{0}', v.attr.totalMatch).replace('{1}', v.attr.total).replace('{2}', v.matchIndicatorPercent).replace('{3}', v.attr.categories);
		if (eventWithLocation || v.event.contactId != user.contact.id) {
			v.budget = v.attr.budget.toString();
			v.attributes = v.attr.textAttributes();
		}
		v.chatLocation = eventWithLocation;
		v.chatId = v.chatLocation ? v.locID : v.contact.id;
		if (v.rating > 0)
			v.rating = '<detailRating onclick="ratings.open(' + v.locID + ')"><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></detailRating>';
		else if (eventWithLocation)
			v.rating = '<div style="margin:1em 0;"><buttontext class="bgColor" onclick="ratings.open(' + v.locID + ')">' + ui.l('rating.save') + '</buttontext></div>';
		if (eventWithLocation)
			v.distanceDisplay = ' style="display:none;"';
		else {
			v.category = v.event.category;
			v.compassDisplay = ' style="display:none;"';
			v.gender = '<img src="images/gender' + v.contact.gender + '.svg" />';
		}
		if (eventWithLocation)
			v.address = v.address.replace(/\n/g, '<br />');
		if (v.ownerId && v.url)
			v.description = (v.description ? v.description + ' ' : '') + ui.l('locations.clickForMoreDetails');
		if (v.description)
			v.description = '<text class="description">' + v.description.replace(/\n/g, '<br/>') + '</text>';
		if (v.bonus)
			v.bonus = '<text style="margin:1em 0;" class="highlightBackground">' + ui.l('locations.bonus') + v.bonus + '<br/>' + ui.l('locations.bonusHint') + '</text>';
		if (v.event.id) {
			v.eventDetails = events.detail(v);
			v.hideBlockReason2 = ' style="display:none;"';
		} else {
			if (global.isBrowser())
				v.copyLinkHint = ui.l('copyLinkHint.location');
			else
				v.copyLinkHint = ui.l('copyLinkHint.locationSocial');
			if (v.ownerId && v.ownerId != user.contact.id)
				v.hideMeEdit = ' noDisp';
			if (!global.isBrowser() || v.ownerId != user.contact.id)
				v.hideMeMarketing = ' noDisp';
			v.editAction = 'pageLocation.edit(' + v.locID + ')';
		}
		if (v.event.contactId != user.contact.id)
			v.hideMePotentialParticipants = ' noDisp';
		if (v.locationFavorite.favorite)
			v.favorite = 'favorite';
		if (global.isBrowser())
			v.displaySocialShare = 'display: none; ';
		p = v._isOpen && v._isOpen > 0 ? 1 : v._openTimesEntries && v._openTimesEntries > 0 ? 0 : null;
		v.openTimesBankholiday = v.openTimesBankholiday ? '<div>' + ui.l('locations.closedOnBankHoliday') + '</div>' : '';
		var h = new Date().getHours() + 2;
		if (h > 23)
			h = 8;
		v.wtdTime = h + ':00';
		if (h < 10)
			v.wtdTime = '0' + v.wtdTime;
		if (!v.ownerId)
			v.urlNotActive = ' active="0"';
		v.pressedCopyButton = pageChat.copyLink.indexOf(global.encParam((v.event.id ? 'e' : 'l') + '=' + id)) > -1 ? ' buttonPressed' : '';
		var c = v.category;
		if (!c)
			c = v.event.category;
		v.cat = '';
		if (c) {
			for (var i = 0; i < c.length; i++)
				v.cat = v.cat + ',' + c.substring(i, i + 1);
			v.cat = v.cat.substring(1);
		}
		if (v.address)
			communication.ajax({
				url: global.server + 'action/map?source=' + geoData.latlon.lat + ',' + geoData.latlon.lon + '&destination=' + v.latitude + ',' + v.longitude,
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
		return pageLocation.templateDetail(v);
	}
	static edit(id) {
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
			if ((!v.ownerId && v.contactId == user.contact.id) || v.ownerId == user.contact.id)
				v.deleteButton = '<buttontext onclick="pageLocation.deleteElement(' + id + ',&quot;Location&quot;)" class="bgColor" id="deleteElement">' + ui.l('delete') + '</buttontext>';
		} else if (!id && formFunc.getDraft('location'))
			v = formFunc.getDraft('location').values;
		if (!v)
			v = {};
		var d = '' + v.category;
		for (var i = 0; i < d.length; i++)
			v['cat' + d.substring(i, i + 1)] = ' checked';
		if (id) {
			var ot = [];
			if (v.OT) {
				for (var i = 1; i < v.OT.length; i++)
					ot.push(model.convert(new LocationOpenTime(), v.OT, i));
			} else {
				for (var i = 1; i < 7; i++)
					ot.push({ day: i });
				ot.push({ day: 0 });
			}
			v.ot = '';
			for (var i = 0; i < ot.length; i++) {
				ot[i].i = '' + i;
				ot[i]['wd' + ot[i].day] = ' selected';
				v.ot += '<div>' + pageLocation.templateEditOpenTimes(ot[i]) + '</div>';
			}
			v.showNearByButton = 'display:none';
		} else {
			v.hint = '<div style="padding:0.5em 1em 0 1em;">' + ui.l('locations.newHint') + '</div>';
			v.hideOpenTimes = ' style="display:none;"';
		}
		for (var i = 0; i < ui.categories.length; i++)
			v['attr' + i] = v['attr' + i] ? v['attr' + i].replace(/\u0015/g, ',') : '';
		v.bankHolidayCheck = v.openTimesBankholiday == '1' ? ' checked' : '';
		if (v.parkingOption) {
			v.parkCheck1 = v.parkingOption.indexOf('1') > -1 ? ' checked' : '';
			v.parkCheck2 = v.parkingOption.indexOf('2') > -1 ? ' checked' : '';
			v.parkCheck3 = v.parkingOption.indexOf('3') > -1 ? ' checked' : '';
			v.parkCheck4 = v.parkingOption.indexOf('4') > -1 ? ' checked' : '';
		}
		if (v.budget) {
			v.budget0 = v.budget.indexOf('0') > -1 ? ' checked' : '';
			v.budget1 = v.budget.indexOf('1') > -1 ? ' checked' : '';
			v.budget2 = v.budget.indexOf('2') > -1 ? ' checked' : '';
		}
		if (!v.longitude)
			v.longitude = geoData.latlon.lon;
		if (!v.latitude)
			v.latitude = geoData.latlon.lat;
		if (v.image)
			v.image = 'src="' + global.serverImg + v.image + '"';
		ui.navigation.openPopup(ui.l('locations.' + (id ? 'edit' : 'new')).replace('{0}', v.name), pageLocation.templateEdit(v), id ? '' : 'pageLocation.saveDraft()');
		if (id)
			pageLocation.setEditAttributes();
		else
			setTimeout(pageLocation.setEditAttributes, 1000);
	}
	static filterList() {
		var d = lists.data['locations'];
		if (!d)
			return;
		var cats = ui.qa('locations filters input[name="filterCategories"]:checked');
		var compass = ui.q('locations filters input[name="filterCompass"]:checked');
		var categories = [], comp = [];
		for (var i = 0; i < cats.length; i++)
			categories[cats[i].value] = 1;
		for (var i = 1; i < d.length; i++) {
			if (d[i] != 'outdated') {
				var e = model.convert(new Location(), d, i);
				var match = (cats.length == 0 || pageLocation.hasCategory(categories, e.category)) && (!compass || pageLocation.isInPosition(compass.value, e._angle));
				e = ui.q('locations [i="' + e.id + '"]');
				ui.attr(e, 'filtered', !match);
			}
		}
		lists.execFilter();
		pageLocation.scrollMap();
	}
	static getFilterFields() {
		var v = {};
		var l = lists.data[ui.navigation.getActiveID()];
		var r2 = [], r4 = [];
		if (l) {
			for (var i = 1; i < l.length; i++) {
				var o = model.convert(new Location(), l, i);
				var s = '' + o.category;
				for (var i2 = 0; i2 < s.length; i2++)
					r2[s.substring(i2, i2 + 1)] = 1;
				if (!r4['E'] && pageLocation.isInPosition('E', o._angle))
					r4['E'] = 1;
				if (!r4['N'] && pageLocation.isInPosition('N', o._angle))
					r4['N'] = 1;
				if (!r4['W'] && pageLocation.isInPosition('W', o._angle))
					r4['W'] = 1;
				if (!r4['S'] && pageLocation.isInPosition('S', o._angle))
					r4['S'] = 1;
			}
		}
		if (pageLocation.filter.filterCategories) {
			var c = pageLocation.filter.filterCategories.split('\u0015');
			for (var i = 0; i < c.length; i++)
				v['valueCat' + c[i]] = ' checked="true"';
		}
		v['valueCompass' + pageLocation.filter.filterCompass] = ' checked="true"';
		if (pageLocation.filter.filterKeywords)
			v.valueKeywords = ' value="' + pageLocation.filter.filterKeywords + '"';
		if (pageLocation.filter.filterMatchesOnly == 'on')
			v.valueMatchesOnly = ' checked="true"';
		return pageLocation.templateSearch(v);
	}
	static getOpenTimes(r) {
		var s = '';
		var today = new Date().getDay();
		var a = [];
		for (var i = 1; i < r.length; i++) {
			var v = model.convert(new LocationOpenTime(), r, i);
			var d = v.day;
			var t = '<from>' + v.openAt.substring(0, 5) + '</from><sep>-</sep><to>' + v.closeAt.substring(0, 5) + '</to>';
			if (a[d])
				t = a[d] + '<br/>' + t;
			a[d] = t;
		}
		for (var i = 0; i < 7; i++) {
			var i2 = (i + 1) % 7;
			if (a[i2]) {
				var d = ui.l('weekday' + i2);
				var t = a[i2];
				s += '<row'
				if (i2 == today)
					s += ' class="highlightColor"';
				s += '><day>' + d + '</day><times>' + t + '</times></row>';
			}
		}
		return s;
	}
	static getSearch(bounds) {
		var s = '';
		if (ui.q('locations filters [name="filterMatchesOnly"]:checked'))
			s = pageLocation.getSearchMatches();
		var c = '', d = '';
		var cats = [];
		var e = ui.qa('locations filters [name="filterCategories"]:checked');
		if (e) {
			for (var i = 0; i < e.length; i++) {
				cats.push(e[i].value);
				c += 'category like \'%' + e[i].value + '%\' or ';
			}
		}
		if (c)
			s += (s ? ' and ' : '') + '(' + c.substring(0, c.length - 4) + ')';
		else {
			for (var i = 0; i < ui.categories.length; i++)
				cats.push(i);
		}
		if (bounds) {
			var border = 0.1 * Math.abs(bounds.getSouthWest().lat() - bounds.getNorthEast().lat());
			s += (s ? ' and ' : '') + 'location.latitude>' + (bounds.getSouthWest().lat() + border);
			s += ' and location.latitude<' + (bounds.getNorthEast().lat() - border);
			border = 0.1 * Math.abs(bounds.getNorthEast().lng() - bounds.getSouthWest().lng());
			s += ' and location.longitude>' + (bounds.getSouthWest().lng() + border);
			s += ' and location.longitude<' + (bounds.getNorthEast().lng() - border);
		} else {
			c = ui.q('locations filters [name="filterCompass"]:checked');
			if (c) {
				if (c.value == 'N')
					s += (s ? ' and ' : '') + 'location.latitude>' + geoData.latlon.lat;
				else if (c.value == 'E')
					s += (s ? ' and ' : '') + 'location.longitude>' + geoData.latlon.lon;
				else if (c.value == 'S')
					s += (s ? ' and ' : '') + 'location.latitude<' + geoData.latlon.lat;
				else if (c.value == 'W')
					s += (s ? ' and ' : '') + 'location.longitude<' + geoData.latlon.lon;
			}
		}
		var v = ui.val('locations filters [name="filterKeywords"]').trim();
		if (v) {
			v = v.replace(/'/g, '\'\'').split(' ');
			for (var i = 0; i < v.length; i++) {
				if (v[i].trim()) {
					v[i] = v[i].trim().toLowerCase();
					var att = '', l = ') like \'%' + v[i].trim().toLowerCase() + '%\' or LOWER(';
					for (var i2 = 0; i2 < cats.length; i2++) {
						for (var i3 = 0; i3 < ui.categories[cats[i2]].subCategories.length; i3++) {
							if (ui.categories[cats[i2]].subCategories[i3].toLowerCase().indexOf(v[i]) > -1)
								att += '(location.category like \'%' + cats[i2] + '%\' and location.attr' + cats[i2] + ' like \'%' + (i3 < 10 ? '00' : i3 < 100 ? '0' : '') + i3 + '%\') or ';
						}
					}
					d += '(LOWER(location.name' + l + 'location.description' + l + 'location.address' + l + 'location.address2' + l + 'location.telephone' + l;
					d = d.substring(0, d.lastIndexOf('LOWER'));
					if (att)
						d += att;
					d = d.substring(0, d.length - 4) + ') and ';
				}
			}
			if (d)
				d = '(' + d.substring(0, d.length - 5) + ')';
		}
		if (d)
			s += (s ? ' and ' : '') + d;
		return s;
	}
	static getSearchMatches(categories) {
		var s = '';
		if (user.contact.budget)
			s += '(location.budget is null or location.budget=\'\' or REGEXP_LIKE(location.budget,\'' + user.contact.budget.replace(/\u0015/g, '|') + '\')=1) and (';
		else
			s += '(';
		for (var i = 0; i < ui.categories.length; i++) {
			if ((user.contact['attr' + i] || user.contact['attr' + i + 'Ex']) && (!categories || categories.indexOf(i) > -1))
				s += '(location.category like \'%' + i + '%\' and (' + global.getRegEx('location.attr' + i, user.contact['attr' + i]) + ' or ' +
					global.getRegEx('location.attr' + i + 'Ex', user.contact['attr' + i + 'Ex']) + ')) or ';
			else if (categories && categories.indexOf(i) > -1)
				s += '(location.category like \'%' + i + '%\') or ';
		}
		if (s.length < 2)
			return '';
		if (s.lastIndexOf(' or ') == s.length - 4)
			return s.substring(0, s.length - 4) + ')'
		return s.substring(0, s.length - 6);
	}
	static hasCategory(cats, catString) {
		catString = '' + catString;
		for (var i = 0; i < catString.length; i++) {
			if (cats[catString.substring(i, i + 1)])
				return true;
		}
	}
	static init() {
		if (!ui.q('locations').innerHTML)
			lists.setListDivs('locations');
		if (!ui.q('locations listResults row') && (!ui.q('locations filters') || !ui.q('locations filters').style.transform || ui.q('locations filters').style.transform.indexOf('1') < 0)) {
			var e = ui.q('menu');
			if (ui.cssValue(e, 'transform').indexOf('1') > 0) {
				if (e.getAttribute('type') != 'locations') {
					ui.on(e, 'transitionend', function () {
						ui.navigation.toggleMenu('locations');
					}, true);
				}
			} else
				ui.navigation.toggleMenu('locations');
		}
		if (!pageLocation.map.svgLocation)
			communication.ajax({
				url: '/images/location.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '60');
					pageLocation.map.svgLocation = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
		if (!pageLocation.map.svgMe)
			communication.ajax({
				url: '/images/contact.svg',
				success(r) {
					var e = new DOMParser().parseFromString(r, "text/xml").getElementsByTagName('svg')[0];
					e.setAttribute('fill', 'black');
					e.setAttribute('stroke', 'black');
					e.setAttribute('stroke-width', '20');
					pageLocation.map.svgMe = 'data:image/svg+xml;base64,' + btoa(e.outerHTML);
				}
			});
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
	static listInfos(v) {
		v.attr = ui.getAttributes(v.id ? v : v.contact, 'list');
		v.extra = v._geolocationDistance ?
			parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 9.5 || !v.id ? 0 : 1).replace('.', ',') + 'km<br/>'
			: '';
		if (v.attr.total && v.attr.totalMatch / v.attr.total > 0)
			v.extra += parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5) + '%';
		v.extra += '<br/>';
		if (v._geolocationDistance && v.latitude)
			v.extra += '<div><compass style="transform:rotate('
				+ geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass></div>';
		else if (v.contact.gender)
			v.extra += '<img src="images/gender' + v.contact.gender + '.svg" />';
		if (!v._message1)
			v._message1 = v.attr.textAttributes();
		if (!v._message2)
			v._message2 = v.description;
		if (v.parkingOption) {
			var p = v.parkingOption.indexOf('1') > -1 ||
				v.parkingOption.indexOf('2') > -1 ? ui.l('locations.parkingPossible') :
				v.parkingOption.indexOf('4') > -1 ? ui.l('locations.parking4') : '';
			if (!v._message1)
				v._message1 = p;
			else if (!v._message2)
				v._message2 = p;
		}
		if (v._openTimesEntries) {
			var ot = v._isOpen && v._isOpen > 0 ? ui.l('locations.open') :
				v._openTimesEntries && v._openTimesEntries > 0 ? ui.l('locations.closed') : '';
			if (!v._message1)
				v._message1 = ot;
			else if (!v._message2)
				v._message2 = ot;
		}
	}
	static listLocation(l) {
		if (ui.q('locations buttontext.map'))
			ui.q('locations buttontext.map').style.display = null;
		l[0].push('_angle');
		var s = '', v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Location(), l, i);
			v._angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
			l[i].push(v._angle);
			v.locID = v.id;
			v.classBGImg = v.imageList ? '' : 'mainBG';
			if (v.locationFavorite.favorite)
				v.classFavorite = ' favorite';
			pageLocation.listInfos(v);
			if (v.imageList)
				v.image = global.serverImg + v.imageList;
			else
				v.image = 'images/location.svg" style="padding: 1em; ';
			if (v.bonus)
				v.present = '<badge class="bgBonus" style="display:block;"><img src="images/present.svg" class="present"></badge>';
			v.type = 'Location';
			v._message = v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			if (ui.navigation.getActiveID() == 'settings3')
				v.oc = 'pageSettings.unblock(' + v.id + ',' + v.block.id + ')';
			else
				v.oc = 'details.open(&quot;' + v.id + '&quot;,&quot;location_list&search=' + encodeURIComponent('location.id=' + v.id) + '&quot;,pageLocation.detailLocationEvent)';
			s += pageLocation.templateList(v);
		}
		if (ui.q('locations map') && ui.q('locations map').style.display != 'none')
			setTimeout(pageLocation.scrollMap, 400);
		if (pageLocation.map.open) {
			pageLocation.map.open = false;
			pageLocation.toggleMap();
		}
		return s;
	}
	static prefillAddress() {
		if (geoData.localized && ui.q('input[name="name"]') && !ui.val('[name="address"]')) {
			communication.ajax({
				url: global.server + 'action/google?param=' + encodeURIComponent('latlng=' + geoData.latlon.lat + ',' + geoData.latlon.lon),
				responseType: 'json',
				success(r) {
					if (r.formatted && !ui.val('[name="address"]'))
						ui.html('[name="address"]', r.formatted);
				}
			});
		}
	}
	static showLocationsNearby(event) {
		if (geoData.localized && ui.q('input[name="name"]')) {
			communication.ajax({
				url: global.server + 'action/google?param=' + encodeURIComponent('place/nearbysearch/json?radius=100&sensor=false&location=' + geoData.latlon.lat + ',' + geoData.latlon.lon),
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
	static prefillOpenTimesFields(event, field) {
		var e = event.target;
		var s = e.getAttribute('name');
		var v = e.value;
		s = parseInt(s.substring(s.indexOf('At') + 2), 10);
		while (e = ui.q('[name="openTimes.' + field + 'At' + (++s) + '"]')) {
			if (!e.value)
				e.value = v;
		}
	}
	static replaceMapDescData(s) {
		if (!s)
			return '';
		return s.replace(/'/g, '&#39;').replace(/"/g, '&#34;').replace(/\n/g, '\u0015').replace(/\r/g, '');
	}
	static reset() {
		pageLocation.locationsAdded = null;
	}
	static sanatizeFields() {
		var sa = '', s = ui.qa('[name="locationcategory"]:checked');
		for (var i = 0; i < s.length; i++)
			sa += s[i].value;
		ui.q('[name="category"]').value = sa;
		s = ui.q('[name="openTimesBankholiday2"]');
		ui.q('[name="openTimesBankholiday"]').value = s && s.length > 0 && s[0].checked ? '' + true : '' + false;
		for (var i = 0; i < ui.categories.length; i++) {
			var s2 = '';
			if (ui.q('#inputHelperATTRIBS' + i)) {
				s = ui.q('#inputHelperATTRIBS' + i).children;
				for (var i2 = 0; i2 < s.length; i2++) {
					if (s[i2].checked)
						s2 += '\u0015' + (s[i2].value < 10 ? '00' : s[i2].value < 100 ? '0' : '') + Number(s[i2].value);
				}
				if (s2)
					s2 = s2.substring(1);
			}
			ui.q('[name="attr' + i + '"]').value = s2;
		}
	}
	static save() {
		ui.html('popupHint', '');
		formFunc.resetError(ui.q('[name="locationcategory"]'));
		formFunc.resetError(ui.q('[name="name"]'));
		formFunc.resetError(ui.q('[name="address"]'));
		formFunc.resetError(ui.q('[name="parkingOption"]'));
		if (!ui.q('[name="locationcategory"]:checked'))
			formFunc.setError(ui.q('[name="locationcategory"]'), 'locations.errorCategory');
		if (!ui.val('[name="name"]'))
			formFunc.setError(ui.q('[name="name"]'), 'locations.errorName');
		else
			formFunc.validation.filterWords(ui.q('[name="name"]'));
		if (!ui.val('[name="description"]'))
			formFunc.validation.filterWords(ui.q('[name="description"]'));
		if (!ui.val('[name="address"]'))
			formFunc.setError(ui.q('[name="address"]'), 'locations.errorAddress');
		else if (ui.val('[name="address"]').indexOf('\n') < 0)
			formFunc.setError(ui.q('[name="address"]'), 'locations.errorAddressFormat');
		if (!ui.qa('[name="parkingOption"]')[0].checked &&
			!ui.qa('[name="parkingOption"]')[1].checked &&
			!ui.qa('[name="parkingOption"]')[2].checked &&
			!ui.qa('[name="parkingOption"]')[3].checked)
			formFunc.setError(ui.q('[name="parkingOption"]'), 'locations.errorParking');
		if (ui.q('popup errorHint')) {
			ui.scrollTo('popupContent', 0);
			return;
		}
		pageLocation.sanatizeFields();
		var id = ui.val('[name="id"]');
		var v = formFunc.getForm('popup form');
		v.classname = 'Location';
		if (id) {
			v.id = id;
			communication.ajax({
				url: global.server + 'action/one',
				method: 'PUT',
				body: v,
				success() {
					details.open(id, 'location_list&search=' + encodeURIComponent('location.id=' + id), function (l, id) {
						ui.q('detail card:last-child').innerHTML = pageLocation.detailLocationEvent(l, id);
						ui.navigation.hidePopup();
					});
				}
			});
		} else {
			communication.ajax({
				url: global.server + 'db/one',
				method: 'POST',
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
					ui.navigation.hidePopup();
					formFunc.removeDraft('location');
					details.open(r, 'location_list&search=' + encodeURIComponent('location.id=' + r), pageLocation.detailLocationEvent);
					if (pageLocation.reopenEvent)
						setTimeout(function () { events.edit(r); }, 1000);
				}
			});
		}
	}
	static saveDraft() {
		if (ui.q('popup input[name="id"]').value)
			return;
		pageLocation.sanatizeFields();
		var a = formFunc.getForm('popup form');
		a.OT = [];
		a.OT[0] = ['locationOpenTime.day', 'locationOpenTime.openAt', 'locationOpenTime.closeAt', 'locationOpenTime.id'];
		var e, i = 1;
		while ((e = ui.q('[name="locationOpenTime.day' + i + '"]'))) {
			a.OT[i] = [e.value, ui.val('[name="locationOpenTime.openAt' + i + '"]'), ui.val('[name="locationOpenTime.closeAt' + i + '"]'), ''];
			i++;
		}
		formFunc.saveDraft('location', a);
	}
	static saveEvent(locationId) {
		formFunc.resetError(ui.q('popup form input[name="startDate"]'));
		formFunc.resetError(ui.q('popup form textarea[name="text"]'));
		var v = formFunc.getForm('popup form');
		var h = v.values.startDate.split(':')[0];
		if (!h)
			formFunc.setError(ui.q('popup form input[name="startDate"]'), 'events.errorDate')
		if (!v.values.text)
			formFunc.setError(ui.q('popup form textarea[name="text"]'), 'error.description');
		else
			formFunc.validation.filterWords(ui.q('popup form textarea[name="text"]'));
		if (ui.q('detail form errorHint'))
			return;
		var d = new Date();
		if (h < d.getHours())
			d.setDate(d.getDate() - 1);
		v.values.startDate = global.date.local2server(d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate() + ' ' + v.values.startDate + ':00');
		v.values.locationId = locationId;
		v.classname = 'Event';
		communication.ajax({
			url: global.server + 'db/one',
			method: 'POST',
			body: v,
			success(r) {
				ui.navigation.autoOpen(global.encParam('e=' + r));
				events.init();
			}
		});
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
			pageLocation.map.canvas = new google.maps.Map(document.getElementsByTagName("map")[0], { mapTypeId: google.maps.MapTypeId.ROADMAP });
			pageLocation.map.canvas.addListener('bounds_changed', function () {
				if (new Date().getTime() - ui.q('map').getAttribute('created') > 2000)
					ui.q('locations buttontext.map').style.display = 'inline-block';
			});
		}
		if (!pageLocation.map.loadActive) {
			var deltaLat = Math.abs(geoData.latlon.lat - d.latitude) * 0.075, deltaLon = Math.abs(geoData.latlon.lon - d.longitude) * 0.075;
			pageLocation.map.canvas.fitBounds(new google.maps.LatLngBounds(
				new google.maps.LatLng(Math.max(geoData.latlon.lat, d.latitude) + deltaLat, Math.min(geoData.latlon.lon, d.longitude) - deltaLon),//south west
				new google.maps.LatLng(Math.min(geoData.latlon.lat, d.latitude) - deltaLat, Math.max(geoData.latlon.lon, d.longitude) + deltaLon) //north east
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
					position: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon)
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
	static search() {
		if (pageLocation.map.loadActive)
			pageLocation.searchFromMap();
		else {
			ui.attr('locations', 'menuIndex', 0);
			pageLocation.filter = formFunc.getForm('locations filters form').values;
			communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent(pageLocation.getSearch()), pageLocation.listLocation, 'locations', 'search');
		}
	}
	static searchFromMap() {
		pageLocation.map.loadActive = true;
		communication.loadList('latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon + '&distance=100000&query=location_list&search=' + encodeURIComponent(pageLocation.getSearch(pageLocation.map.canvas.getBounds())), pageLocation.listLocation, 'locations', 'search');
	}
	static setEditAttributes() {
		if (ui.q('#loc_attrib')) {
			var cats = ui.qa('[name="locationcategory"]:checked'), s = '';
			for (var i = 0; i < cats.length; i++) {
				var v = ui.q('#loc_attrib').getAttribute('v' + cats[i].value);
				var v2 = ui.val('[name="attr' + cats[i].value + 'Ex"]');
				s += '<subCatTitle>' + ui.categories[cats[i].value].label + '</subCatTitle><input id="ATTRIBS' + cats[i].value + '" type="text" multiple="SubCategories' + cats[i].value + '" value="' + (v ? v : '') + '"/><input name="attr' + cats[i].value + 'Ex" value="' + (v2 ? v2 : '') + '" type="text" maxlength="1000" placeholder="' + ui.l('contacts.blockReason100') + '" style="margin-bottom:1em;"/>';
			}
			ui.html('#loc_attrib', s);
			formFunc.initFields('#loc_attrib');
		}
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
	static setOwner(id) {
		formFunc.resetError(ui.q('#taxNo'));
		formFunc.resetError(ui.q('#agb'));
		var b = -1;
		if (!ui.val('#taxNo'))
			b = formFunc.setError(ui.q('#taxNo'), 'locations.marketingNoTaxNo');
		if (!ui.q('#agb').checked)
			b = formFunc.setError(ui.q('#agb'), 'settings.noAGB');
		if (b == -1)
			ui.navigation.openHTML(global.server + 'qq?i=' + id + '&t=' + encodeURIComponent(ui.q('#taxNo').value) + '&v=' + encodeURIComponent(ui.q('[name="os0"]:checked').value));
	}
	static showBlockText() {
		var s = ui.q('detail card:last-child [name="block"] [name="type"]:checked').value == 2 ? 'block' : 'none';
		ui.css(ui.q('detail card:last-child [name="block"] [name="reason"]').parentNode, 'display', s);
		ui.css('detail card:last-child [name="block"] [name="note"]', 'display', s);
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
				url: global.server + 'db/one?query=misc_block&search=' + encodeURIComponent('block.contactId=' + user.contact.id + ' and ' + (id.indexOf && id.indexOf('_') > 0 ? 'block.eventId=' + id.substring(0, id.indexOf('_')) : 'block.locationId=' + id)),
				success(r) {
					if (r) {
						var v = JSON.parse(r);
						ui.attr(e, 'blockID', v.block.id);
						ui.qa(divID + ' input')[v.block.note ? 1 : 0].checked = true;
						if (v.block.reason != 0)
							ui.q(divID + ' [name="reason"][value="' + v.block.reason + '"]').checked = true;
						ui.q(divID + ' textarea').value = v.reason;
						pageLocation.showBlockText();
					} else
						ui.attr(e, 'blockID', 0);
				}
			});
		}
		details.togglePanel(e);
	}
	static toggleFavorite(id) {
		var button = ui.q('main>buttonIcon.bottom.right');
		var idFav = ui.q('detailHeader').getAttribute('idFav');
		var v = { classname: 'LocationFavorite' };
		if (idFav) {
			v.values = { favorite: ui.classContains(button, 'highlight') ? false : true };
			v.id = idFav;
		} else
			v.values = { locationId: id };
		communication.ajax({
			url: global.server + 'db/one',
			method: idFav ? 'PUT' : 'POST',
			body: v,
			success(r) {
				if (r) {
					ui.attr('detailHeader', 'idFav', r);
					v.values.favorite = true;
				}
				ui.attr(button, 'fav', v.values.favorite ? true : false);
				if (v.values.favorite) {
					ui.classAdd(button, 'highlight');
					ui.classAdd('row.location[i="' + id + '"]', 'favorite');
				} else {
					ui.classRemove(button, 'highlight');
					ui.classRemove('row.location[i="' + id + '"]', 'favorite');
				}
			}
		});
	}
	static toggleMap() {
		if (ui.q('map').getAttribute('created')) {
			ui.q('map').setAttribute('created', new Date().getTime());
			if (ui.cssValue('map', 'display') == 'none') {
				if (ui.q('locations').getAttribute('menuIndex') >= ui.q('menu container').childElementCount) {
					ui.navigation.openPopup(ui.l('attention'), ui.l('events.mapOnlyForLocations'));
					return;
				}
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
			pageLocation.search();
		} else {
			ui.attr('map', 'created', new Date().getTime());
			communication.ajax({
				url: global.server + 'action/google?param=js',
				responseType: 'text',
				success(r) {
					var script = document.createElement('script');
					script.onload = function () {
						pageLocation.toggleMap();
						ui.on('locations listBody', 'scroll', pageLocation.scrollMap);
					};
					script.src = r;
					document.head.appendChild(script);
				}
			});
		}
	}
	static toggleMatchIndicatorHint(id, event) {
		var e = ui.q('detail card:last-child [name="matchIndicatorHint"]');
		var button = ui.parents(event.target, 'matchIndicator');
		e.style.top = (button.offsetTop + button.offsetHeight) + 'px';
		e.style.left = '5%';
		ui.toggleHeight(e);
	}
	static toggleWhatToDo(id) {
		details.togglePanel(ui.q('detail card:last-child [name="whatToDo"]'));
	}
}