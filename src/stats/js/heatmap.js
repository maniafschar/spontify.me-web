import { communication2 } from "./communication2";

export { heatmap }

class heatmap {
	static map;

	static init() {
		communication2.get('statistics/contact/location', function (l) {
			var points = [], n = 10000, w = 10000, s = -10000, e = -10000;
			for (var i = 0; i < l.length; i++) {
				points.push(new google.maps.LatLng(l[i].latitude, l[i].longitude));
				if (n > l[i].latitude)
					n = l[i].latitude;
				if (s < l[i].latitude)
					s = l[i].latitude;
				if (w > l[i].longitude)
					w = l[i].longitude;
				if (e < l[i].longitude)
					e = l[i].longitude;
			}
			heatmap.map = new google.maps.Map(ui.q('main.statistics mapCanvas'), {
				center: { lat: 48.1, lng: 11.6 },
				zoom: 5,
				mapTypeId: google.maps.MapTypeId.SATELLITE
			});
			new google.maps.visualization.HeatmapLayer({
				data: points,
				map: heatmap.map,
				dissipating: true,
				maxIntensity: 10
			});
		});
	}
}