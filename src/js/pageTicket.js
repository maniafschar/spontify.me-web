import { communication } from "./communication";
import { geoData } from "./geoData";
import { pageEvent } from "./pageEvent";
import { ui } from "./ui";

export { pageTicket };

class pageTicket {
	static init() {
		if (!ui.q('tickets').innerHTML)
			communication.loadList('query=location_listEventCurrent&search=' + encodeURIComponent('eventParticipate.id is not null') + '&latitude=' + geoData.latlon.lat + '&longitude=' + geoData.latlon.lon, pageTicket.listTicket, null, 'ticket');
	}
	static listTicket(r) {
		var s = pageEvent.listEvents(r);
		ui.q('tickets').innerHTML = '<listSeparator class="highlightColor strong">Aktuelle Tickets</listSeparator>' +
			s + '<listSeparator class="highlightColor strong">Für Dich interessante Tickets</listSeparator>' +
			'<listSeparator class="highlightColor strong">Vergangene Tickets</listSeparator>';

	}
}