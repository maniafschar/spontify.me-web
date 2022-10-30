import { communication } from './communication';
import { details } from './details';
import { events } from './events';
import { geoData } from './geoData';
import { global } from './global';
import { lists } from './lists';
import { Location, model, LocationOpenTime } from './model';
import { pageChat } from './pageChat';
import { pageWhatToDo } from './pageWhatToDo';
import { ui, formFunc } from './ui';
import { user } from './user';

export { pageLocation };

class pageLocation {
	static locationsAdded = null;
	static map = {
		canvas: null,
		id: null,
		markerLocation: null,
		markerMe: null,
		scrollTop: -1,
		svgLocation: null,
		svgMe: null,
		timeout: null
	};
	static reopenEvent;
	static templateList = v =>
		global.template`<row onclick="details.open(&quot;${v.id}&quot;,&quot;${v.query}&quot;,${v.render})" i="${v.id}" class="location${v.classFavorite}">
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
		<detailCompass>
			<span a="${v.angle}" style="transform:rotate(${v.angle}deg);">&uarr;</span>
			<km>${v.distance}</km>
		</detailCompass>
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
	<buttontext class="bgColor${v.pressedCopyButton}" name="buttonCopy"
		onclick="pageChat.doCopyLink(event,&quot;${v.event.id ? 'e' : 'l'}=${v.id}&quot;)">${ui.l('share')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}" name="buttonEvents"
		onclick="events.toggle(${v.locID})">${ui.l('events.title')}</buttontext>
	<buttontext class="bgColor${v.hideMeEvents}" name="buttonWhatToDo"
		onclick="pageLocation.toggleWhatToDo(${v.id})">${ui.l('wtd.location')}</buttontext>
	<buttontext class="bgColor${v.hideMeMarketing}" name="buttonMarketing"
		onclick="ui.navigation.openHTML(&quot;${global.server}locOwner?id=${v.id}&quot;,&quot;locOwn&quot;)">${ui.l('locations.marketing')}</buttontext>
	<buttontext class="bgColor${v.hideMeEdit}" name="buttonEdit"
		onclick="${v.editAction}">${ui.l('edit')}</buttontext>
	<buttontext class="bgColor" name="buttonGoogle"
		onclick="ui.navigation.openHTML(&quot;https://google.com/search?q=${encodeURIComponent(v.name + ' ' + v.town)}&quot;)">Google</buttontext>
</detailButtons>
<text name="events" class="collapsed" ${v.urlNotActive} style="margin:0 -1em;"></text>
<text name="matchIndicatorHint" class="popup" style="display:none;" onclick="ui.toggleHeight(this)">
	<div>${v.matchIndicatorHint}</div>
</text>
<text class="popup matchIndicatorAttributesHint" style="display:none;" onclick="ui.toggleHeight(this)">
	<div></div>
</text>
<text name="whatToDo" class="collapsed">
	<detailTogglePanel>
		<div style="margin-bottom:1.5em;">${ui.l('wtd.time')}<br/>
			<input type="time" id="messageTimeDetail" placeholder="HH:MM" class="whatToDoTime" value="${v.wtdTime}" />
		</div>
		<buttontext class="bgColor"
			onclick="pageWhatToDo.saveLocation(&quot;${v.cat}&quot;,${v.locID})">
			${ui.l('wtd.buttonSave')}
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
<text name="marketing" class="collapsed">
	<detailTogglePanel></detailTogglePanel>
</text>`;
	static templateEdit = v =>
		global.template`<form name="editElement">
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
		<div style="text-align:center;padding-top:1em;"><buttontext class="bgColor" onclick="pageLocation.showLocationsNearby(event)">${ui.l('all')}</buttontext></div>
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
	static addOpenTimeRow() {
		var v = {};
		v.i = ui.qa('openTimesEdit select').length;
		if (v.i > 0)
			v['wd' + ((parseInt(ui.q('[name="openTimes.day' + (v.i - 1) + '"]').value, 10) + 1) % 7)] = ' selected';
		var e2 = document.createElement('div');
		e2.innerHTML = pageLocation.templateEditOpenTimes(v);
		ui.q('openTimesEdit').insertBefore(e2, null);
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
					if (classname == 'Location') {
						ui.navigation.goTo('locations');
						setTimeout(function () {
							lists.removeListEntry(id);
						}, 700);
					} else
						events.refreshToggle();
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
					while (model.convert(new LocationOpenTime(), s, 1).day == 0)
						s.push(s.splice(1, 1)[0]);
					var e = ui.q('detail card[i="' + id + '"][type="location"] detailHeader');
					var o = JSON.parse(decodeURIComponent(e.getAttribute('data')));
					o.OT = s;
					e.setAttribute('data', encodeURIComponent(JSON.stringify(o)));
					ui.html('detail card[i="' + id + '"][type="location"] openTimes', pageLocation.getOpenTimes(s));
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
		v.id = id;
		v.distance = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance >= 10 ? 0 : 1).replace('.', ',') : '';
		v.classBGImg = '';
		if (v.classBGImg.length < 8)
			v.classBGImg = 'class="mainBG"';
		v.locID = v.event.id ? v.event.locationId : id;
		v.angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
		v.image = v.event.image ? v.event.image : v.image;
		if (v.image)
			v.image = global.serverImg + v.image;
		else
			v.image = (v.event.id ? 'images/event.svg' : 'images/location.svg') + '" class="mainBG" style="padding:8em;';
		v.tel = v.telephone ? v.telephone.trim() : '';
		if (v.tel) {
			v.telOpenTag = '<a href="tel:' + v.tel.replace(/[^+\d]*/g, '') + '" style="color:black;">';
			v.telCloseTag = '</a>';
		}
		v.attr = ui.getAttributes(v, 'detail');
		v.budget = v.attr.budget.toString();
		if (v.attr.totalMatch) {
			v.matchIndicator = v.attr.totalMatch + '/' + v.attr.total;
			v.matchIndicatorPercent = parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5);
		} else
			v.matchIndicatorPercent = 0;
		v.matchIndicatorHint = ui.l('locations.matchIndicatorHint').replace('{0}', v.attr.totalMatch).replace('{1}', v.attr.total).replace('{2}', v.matchIndicatorPercent).replace('{3}', v.attr.categories);
		v.attributes = v.attr.textAttributes();
		if (v.rating > 0)
			v.rating = '<detailRating onclick="ratings.open(' + v.locID + ')"><ratingSelection><empty>☆☆☆☆☆</empty><full style="width:' + parseInt(0.5 + v.rating) + '%;">★★★★★</full></ratingSelection></detailRating>';
		else
			v.rating = '<div style="margin:1em 0;"><buttontext class="bgColor" onclick="ratings.open(' + v.locID + ')">' + ui.l('rating.save') + '</buttontext></div>';
		v.address = v.address.replace(/\n/g, '<br />');
		if (v.ownerId && v.url)
			v.description = (v.description ? v.description + ' ' : '') + ui.l('locations.clickForMoreDetails');
		if (v.description)
			v.description = '<text class="description">' + v.description.replace(/\n/g, '<br/>') + '</text>';
		if (ui.q('locations').innerHTML) {
			if (!details.getNextNavElement(true, id))
				v.hideNext = 'display:none;';
			if (!details.getNextNavElement(false, id))
				v.hidePrevious = 'display:none;';
		}
		if (v.bonus)
			v.bonus = '<text style="margin:1em 0;" class="highlightBackground">' + ui.l('locations.bonus') + v.bonus + '<br/>' + ui.l('locations.bonusHint') + '</text>';
		if (v.event.id)
			v.eventDetails = events.detail(v);
		else {
			if (global.isBrowser())
				v.copyLinkHint = ui.l('copyLinkHint.location');
			else
				v.copyLinkHint = ui.l('copyLinkHint.locationSocial');
			if (!user.contact || v.ownerId && v.ownerId != user.contact.id)
				v.hideMeEdit = ' noDisp';
			if (!user.contact || !global.isBrowser() || v.ownerId != user.contact.id)
				v.hideMeMarketing = ' noDisp';
			v.editAction = 'pageLocation.edit(' + v.locID + ')';
		}
		if (v.locationFavorite.favorite)
			v.favorite = 'favorite';
		if (global.isBrowser())
			v.displaySocialShare = 'display: none; ';
		p = v._isOpen && v._isOpen > 0 ? 1 : v._openTimesEntries && v._openTimesEntries > 0 ? 0 : null;
		v.openTimesBankholiday = v.openTimesBankholiday ? '<div>' + ui.l('locations.closedOnBankHoliday') + '</div>' : '';
		var wtd = pageWhatToDo.getCurrentMessage();
		if (wtd && wtd.active) {
			var d = global.date.server2Local(wtd.time);
			v.wtdTime = (d.getHours() < 10 ? '0' : '') + d.getHours() + ':' + (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
		} else {
			var h = (new Date().getHours() + 1) % 24;
			v.wtdTime = h + ':00';
			if (h < 10)
				v.wtdTime = '0' + v.wtdTime;
		}
		if (!v.ownerId)
			v.urlNotActive = ' active="0"';
		v.pressedCopyButton = pageChat.copyLink.indexOf(global.encParam((v.event.id ? 'e' : 'l') + '=' + id)) > -1 ? ' buttonPressed' : '';
		v.cat = '';
		for (var i = 0; i < v.category.length; i++)
			v.cat = v.cat + ',' + v.category.substring(i, i + 1);
		v.cat = v.cat.substring(1);
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
		var activeID = ui.navigation.getActiveID();
		var d = lists.data[activeID];
		if (!d)
			return;
		var v = ui.qa(activeID + ' filters input[name="filterLocationTown"]:checked');
		var v2 = ui.qa(activeID + ' filters input[name="filterLocationCategories"]:checked');
		var v3 = ui.qa(activeID + ' filters input[name="filterCompass"]:checked');
		var towns = [], cats = [], comp = [];
		for (var i = 0; i < v.length; i++)
			towns[v[i].getAttribute('label')] = 1;
		for (var i = 0; i < v2.length; i++)
			cats[v2[i].value] = 1;
		for (var i = 0; i < v3.length; i++)
			comp[v3[i].value] = 1;
		for (var i = 1; i < d.length; i++) {
			if (d[i] != 'outdated') {
				var e = model.convert(new Location(), d, i);
				var match = (v.length == 0 || towns[e.town]) && (v2.length == 0 || pageLocation.hasCategory(cats, e.category)) && (v3.length == 0 || pageLocation.isInPosition(comp, e._angle));
				e = ui.q(activeID + ' [i="' + e.id + '"]');
				ui.attr(e, 'filtered', !match);
			}
		}
		lists.execFilter();
		pageLocation.scrollMap();
	}
	static getFilterFields() {
		var l = lists.data[ui.navigation.getActiveID()];
		var r = [], r2 = [], r3 = [], r4 = [], E = [], N = [], W = [], S = [], own = 0;
		N['N'] = 1;
		S['S'] = 1;
		W['W'] = 1;
		E['E'] = 1;
		var isEvent = l[0].toString().indexOf('event.id') > 0, hasAngel;
		for (var i = 1; i < l[0].length; i++) {
			if (l[0][i] == '_angle') {
				hasAngel = true;
				break;
			}
		}
		if (!hasAngel)
			l[0].push('_angle');
		for (var i = 1; i < l.length; i++) {
			var v = model.convert(new Location(), l, i);
			if (!hasAngel) {
				v._angle = geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude });
				l[i].push(v._angle);
			}
			if (v.town && !r3[v.town]) {
				r.push(v.town);
				r3[v.town] = 1;
			}
			if (user.contact && (isEvent && v.event.contactId == user.contact.id || !isEvent && v.ownerId == user.contact.id))
				own++;
			var s = '' + v.category;
			for (var i2 = 0; i2 < s.length; i2++)
				r2[s.substring(i2, i2 + 1)] = 1;
			if (!r4['E'] && pageLocation.isInPosition(E, v._angle))
				r4['E'] = 1;
			if (!r4['N'] && pageLocation.isInPosition(N, v._angle))
				r4['N'] = 1;
			if (!r4['W'] && pageLocation.isInPosition(W, v._angle))
				r4['W'] = 1;
			if (!r4['S'] && pageLocation.isInPosition(S, v._angle))
				r4['S'] = 1;
		}
		var s = '', i2 = 0, m = ' onclick="pageLocation.filterList()" deselect="true"/>', sep = '<filterSeparator></filterSeparator>';
		for (var e in r2)
			i2++;
		if (i2 > 1) {
			for (var i = 0; i < ui.categories.length; i++) {
				if (r2[i])
					s += '<input type="radio" name="filterLocationCategories" value="' + i + '" label="' + ui.categories[i].label + '"' + m;
			}
			s += sep;
		}
		i2 = 0;
		for (var e in r4)
			i2++;
		if (i2 > 1) {
			for (var e in r4)
				s += '<input type="radio" name="filterCompass" value="' + e + '" label="' + ui.l('locations.compass' + e) + '"' + m;
			s += sep;
		}
		var map = '';
		if (ui.navigation.getActiveID() == 'locations')
			map = '<br/><buttontext onclick="pageLocation.toggleMap()" style="margin:1em 0.25em;" class="bgColor">' + ui.l('filterLocMapButton') + '</buttontext>';
		if (s)
			s = s.substring(0, s.lastIndexOf(sep));
		else
			s = map ? ui.l('filterNoDifferentValues') : '<div style="padding-bottom:0.5em;">' + ui.l('filterNoDifferentValues') + '</div>';
		return s + map;
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
	static hasCategory(cats, catString) {
		catString = '' + catString;
		for (var i = 0; i < catString.length; i++) {
			if (cats[catString.substring(i, i + 1)])
				return true;
		}
	}
	static init() {
		ui.css('main>buttonIcon', 'display', 'none');
		ui.buttonIcon('.bottom.center', 'home', 'ui.navigation.goTo("home")');
		ui.buttonIcon('.top.right', 'menu', 'ui.navigation.toggleMenu()');
		ui.buttonIcon('.top.left', 'filter', 'lists.toggleFilter(event, pageLocation.getFilterFields)');
		pageChat.buttonChat();
		if (!ui.q('locations').innerHTML)
			lists.setListDivs('locations');
		if (!ui.q('locations listResults row')) {
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
	static isInPosition(position, angle) {
		for (var e in position) {
			if (e == 'E' && angle > 45 && angle <= 135)
				return 'E';
			if (e == 'S' && angle > 135 && angle <= 225)
				return 'S';
			if (e == 'W' && angle > 225 && angle <= 315)
				return 'W';
			if (e == 'N' && (angle > 315 || angle <= 45))
				return 'N';
		}
	}
	static listInfos(v) {
		v.attr = ui.getAttributes(v, 'list');
		v.extra = v._geolocationDistance ? parseFloat(v._geolocationDistance).toFixed(v._geolocationDistance < 10 ? 1 : 0).replace('.', ',') + 'km<br/>' : '';
		if (v.attr.total && v.attr.totalMatch / v.attr.total > 0)
			v.extra += parseInt(v.attr.totalMatch / v.attr.total * 100 + 0.5) + '%<br/>';
		if (v._geolocationDistance)
			v.extra += '<div><compass style="transform:rotate('
				+ geoData.getAngel(geoData.latlon, { lat: v.latitude, lon: v.longitude }) + 'deg);"></compass></div>';
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
		if (ui.navigation.getActiveID() == 'search')
			ui.attr('search', 'type', 'locations');
		return pageLocation.listLocationInternal(l);
	}
	static listLocationInternal(l) {
		if (ui.navigation.getActiveID() == 'locations' && ui.q('map') && ui.cssValue('map', 'display') != 'none')
			pageLocation.toggleMap();
		var s = '', v;
		for (var i = 1; i < l.length; i++) {
			v = model.convert(new Location(), l, i);
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
			v.render = 'pageLocation.detailLocationEvent';
			v._message = v._message1 ? v._message1 + '<br/>' : '';
			v._message += v._message2 ? v._message2 : '';
			v.query = (user.contact ? 'location_list' : 'location_anonymousList') + '&search=' + encodeURIComponent('location.id=' + v.id);
			s += pageLocation.templateList(v);
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
						var s = '', r2 = [];
						for (var i = 0; i < r.length; i++) {
							if (r[i].types[0] && r[i].types[0].indexOf('locality') < 0 && r[i].types[0].indexOf('route') < 0 && r[i].name) {
								s += '<li onclick="pageLocation.setLocationName(event)" d="' + r[i].types[0] + '" n="' + r[i].name + '" a="' + r[i].vicinity + '">' + r[i].name + '</li>';
								if (r[i].vicinity && r[i].vicinity.indexOf && r[i].vicinity.indexOf(',') > 0)
									r2[i] = [r[i].name, r[i].types[0], r[i].vicinity, r[i].geometry.location.lat, r[i].geometry.location.lng];
							}
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
		var v = formFunc.getForm('editElement');
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
					if (e.status == 500 && e.response && e.response.indexOf('exists') > 0)
						ui.html('popupHint', ui.l('locations.alreadyExists'));
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
		var a = formFunc.getForm('editElement');
		a.OT = [];
		a.OT[0] = ['locationOpenTime.day', 'locationOpenTime.openAt', 'locationOpenTime.closeAt', 'locationOpenTime.id'];
		var e, i = 1;
		while ((e = ui.q('[name="locationOpenTime.day' + i + '"]'))) {
			a.OT[i] = [e.value, ui.val('[name="locationOpenTime.openAt' + i + '"]'), ui.val('[name="locationOpenTime.closeAt' + i + '"]'), ''];
			i++;
		}
		formFunc.saveDraft('location', a);
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
		var delta = ui.q('map').clientHeight / 320, x = 0.0625, zoom = 18;
		for (; zoom > 0; zoom--) {
			if (x * delta > d._geolocationDistance)
				break;
			x *= 2;
		}
		if (pageLocation.map.canvas) {
			pageLocation.map.markerMe.setMap(null);
			pageLocation.map.markerLocation.setMap(null);
			pageLocation.map.canvas.setCenter(new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon));
			pageLocation.map.canvas.setZoom(zoom);
		} else
			pageLocation.map.canvas = new google.maps.Map(document.getElementsByTagName("map")[0],
				{ zoom: zoom, center: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon), mapTypeId: google.maps.MapTypeId.ROADMAP });
		pageLocation.map.markerMe = new google.maps.Marker(
			{
				map: pageLocation.map.canvas,
				title: d.name,
				contentString: '',
				icon: {
					url: pageLocation.map.svgMe,
					scaledSize: new google.maps.Size(26, 26),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(13, 26)
				},
				position: new google.maps.LatLng(geoData.latlon.lat, geoData.latlon.lon)
			});
		pageLocation.map.markerLocation = new google.maps.Marker(
			{
				map: pageLocation.map.canvas,
				title: d.name, contentString: '',
				icon: {
					url: pageLocation.map.svgLocation,
					scaledSize: new google.maps.Size(40, 40),
					origin: new google.maps.Point(0, 0),
					anchor: new google.maps.Point(20, 40)
				},
				position: new google.maps.LatLng(d.latitude, d.longitude)
			});
	}
	static selectFriend(c) {
		ui.classRemove('.locationToFriend.selected', 'selected');
		ui.classAdd(c, 'selected');
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
	static showLocationInputHelper(event) {
		var e = ui.q('locationNameInputHelper');
		if (e.innerHTML && ui.cssValue(e, 'display') == 'none' && (!event || !ui.q('form input[name="name"]').value))
			ui.toggleHeight(e);
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
			ui.classRemove('locations listResults row div.highlightBackground', 'highlightBackground');
			if (ui.cssValue('map', 'display') == 'none') {
				ui.css('locations listBody', 'margin-top', '20em');
				ui.css('locations listBody', 'padding-top', '0.5em');
			} else {
				ui.css('locations listBody', 'margin-top', '');
				ui.css('locations listBody', 'padding-top', '');
			}
			ui.toggleHeight('map', pageLocation.scrollMap);
			lists.toggleFilter();
			pageLocation.map.scrollTop = -1;
			pageLocation.map.id = -1;
			ui.classRemove('locations listResults row div.highlightMap', 'highlightMap');
			return;
		}
		ui.attr('map', 'created', new Date().getTime());
		communication.ajax({
			url: global.server + 'action/google?param=js',
			responseType: 'text',
			success(r) {
				var script = document.createElement('script');
				script.onload = function () {
					new google.maps.Geocoder();
					pageLocation.scrollMap();
					pageLocation.toggleMap();
					ui.on('locations listBody', 'scroll', pageLocation.scrollMap);
					lists.toggleFilter();
				};
				script.src = r;
				document.head.appendChild(script);
			}
		});
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