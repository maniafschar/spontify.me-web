import { initialisation } from '../init';
import { global } from '../global';
import { ui, DragObject } from '../ui';

export { InputImage }

class InputImage extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
inputFile {
	position: relative;
	min-height: 2em;
	text-align: left;
	width: 100%;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	border-radius: 0.5em;
	background: rgba(255, 255, 255, 0.85);
	display: block;
	color: black;
}

inputFile>span {
	padding: 0.36em 0.75em;
	display: inline-block;
}

inputFile close {
	position: absolute;
	height: 2.5em;
	top: 0;
	right: 0;
	width: 4em;
	cursor: pointer;
	z-index: 2;
	text-align: right;
	padding: 0.5em 0.75em;
	color: white;
	text-shadow: 0 0 0.15em rgba(0, 0, 0, 0.8);
}

inputFile desc {
	position: absolute;
	color: white;
	text-align: center;
	width: 100%;
	left: 0;
	bottom: 0;
	text-shadow: 0 0 0.15em rgba(0, 0, 0, 0.8);
	pointer-events: none;
}

inputFile rotate {
	position: absolute;
	left: 0;
	text-align: left;
	font-size: 2em;
	width: 1.25em;
	height: 2em;
	padding: 0.25em;
	color: white;
	top: 0;
	cursor: pointer;
	z-index: 2;
	filter: drop-shadow(0 0 0.05em rgba(0, 0, 0, 0.8));
}

input {
	opacity: 0;
	position: absolute;
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;
	cursor: pointer;
}

input+img,
.appInput+img {
	position: absolute;
	top: 0;
	right: 0;
	height: 100%;
	border-radius: 0 0.5em 0.5em 0;
}

button-image {
	padding: 0.34em 0.75em !important;
	width: 50% !important;
	position: relative !important;
	display: inline-block !important;
	text-align: left;
	background: rgba(255, 255, 255, 0.85);
	color: black;
}

button-image.left {
	border-radius: 0.5em 0 0 0.5em !important;
	border-right: solid 1px rgba(0, 0, 0, 0.3) !important;
}

button-image.right {
	border-radius: 0 0.5em 0.5em 0 !important;
}`;
		this._root.appendChild(style);
		var s = '', s2 = this.getAttribute('name'), element = document.createElement('inputFile');
		element.innerHTML = '<span>' + (this.getAttribute('hint') ? this.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>';
		this._root.appendChild(element);
		if (global.isBrowser()) {
			element = document.createElement('input');
			element.setAttribute('type', 'file');
			element.setAttribute('onchange', 'this.getRootNode().host.preview(this)');
			element.setAttribute('accept', '.gif, .png, .jpg');
			this._root.appendChild(element);
		} else {
			element.style.display = 'none';
			element = document.createElement('div');
			element.setAttribute('class', 'appInput');
			element.innerHTML = '<button-image onclick="this.getRootNode().host.cameraPicture(true)" class="left">' + ui.l('camera.shoot') + '</button-image>' +
				'<button-image onclick="this.getRootNode().host.cameraPicture()" class="right">' + ui.l('camera.select') + '</button-image>';
			this._root.appendChild(element);
		}
		element = document.createElement('img');
		element.setAttribute('class', 'icon');
		if (this.getAttribute('src'))
			element.setAttribute('src', this.getAttribute('src'));
		this._root.appendChild(element);
		const t = this;
		ui.on(window, 'wheel', function (event) {
			if (event.ctrlKey)
				t.zoom(event.deltaY);
		});
	}
	zoomDist = 0;
	cameraError(e) {
		if (!e || e.toLowerCase().indexOf('select') < 0)
			ui.navigation.openPopup(ui.l('attention'), ui.l('camera.notAvailabe').replace('{0}', e));
	}
	cameraPicture(camera) {
		var t = this;
		navigator.camera.getPicture(function (e) { t.cameraSuccess(t, e) }, t.cameraError,
			{ sourceType: camera ? Camera.PictureSourceType.CAMERA : Camera.PictureSourceType.PHOTOLIBRARY, destinationType: Camera.DestinationType.FILE_URI });
	}
	cameraSuccess(t, e) {
		t._root.querySelector('div').style.display = 'none';
		t._root.querySelector('inputFile').style.display = 'block';
		window.resolveLocalFileSystemURL(e,
			function (fe) {
				fe.file(function (f) {
					t.preview2(t, f);
				}, t.cameraError);
			}, t.cameraError);
	}
	dataURItoBlob(dataURI) {
		var arr = dataURI.split(','), mime = arr[0].match(/:(.*?);/)[1];
		arr[1] = atob(arr[1]);
		var ab = new ArrayBuffer(arr[1].length);
		var ia = new Uint8Array(ab);
		for (var i = 0; i < arr[1].length; i++)
			ia[i] = arr[1].charCodeAt(i);
		return new Blob([ab], { type: mime });
	}
	hasImage() {
		var x = this._root.querySelector('img.preview');
		return x && x.getAttribute('src') && x.getAttribute('src').length > 100;
	}
	preview(e) {
		this.preview2(this, e.files && e.files.length > 0 ? e.files[0] : null);
	}
	preview2(t, file) {
		if (file) {
			var ePrev = t._root.querySelector('inputFile');
			ui.css(ePrev, 'z-index', 6);
			t._root.querySelector('img.icon').style.display = 'none';

			ui.html(ePrev, `
<close onclick="this.getRootNode().host.remove(this)">X</close>
<rotate onclick="this.getRootNode().host.rotate(this)">&#8635;</rotate>
<img class="preview" />
<desc></desc>`);
			var img = t._root.querySelector('img.preview');
			new DragObject(img).ondrag = function (event, delta) {
				if (parseInt(delta.y) != 0) {
					var y = parseInt(ui.cssValue(img, 'margin-top')) + delta.y;
					if (y < 1 && y > -(img.clientHeight - img.getRootNode().querySelector('inputFile').clientHeight)) {
						ui.css(img, 'margin-top', y + 'px');
						img.getRootNode().host.update(img.getAttribute('src'));
					}
				}
				if (parseInt(delta.x) != 0) {
					var x = parseInt(ui.cssValue(img, 'margin-left')) + delta.x;
					if (x < 1 && x > -(img.clientWidth - img.getRootNode().querySelector('inputFile').clientWidth)) {
						ui.css(img, 'margin-left', x + 'px');
						img.getRootNode().host.update(img.getAttribute('src'));
					}
				}
			};
			ui.on(img, 'touchmove', function (event) {
				var d = img.getRootNode().host.previewCalculateDistance(event);
				if (d) {
					var zoom = Math.sign(img.getRootNode().host.zoomDist - d) * 5;
					if (zoom > 0)
						zoom /= event.scale;
					else
						zoom *= event.scale;
					img.getRootNode().host.zoom(zoom);
					img.getRootNode().host.zoomDist = d;
				}
			});
			ui.on(img, 'touchstart', function (event) {
				var d = img.getRootNode().host.previewCalculateDistance(event);
				if (d)
					img.getRootNode().host.zoomDist = d;
			});
			t.previewInternal(file);
			ui.css('#popupSendImage', 'display', '');
		} else
			t.remove(t);
	}
	previewCalculateDistance(event) {
		var t;
		if (event.changedTouches && event.changedTouches.length > 0)
			t = event.changedTouches;
		else if (event.targetTouches && event.targetTouches.length > 0)
			t = event.targetTouches;
		else
			t = event.touches;
		if (t && t.length > 1)
			return Math.hypot(t[0].pageX - t[1].pageX, t[0].pageY - t[1].pageY);
	}
	previewInternal(f) {
		var reader = new FileReader();
		var t = this;
		reader.onload = function (r) {
			var img = t._root.querySelector('img.preview');
			if (img) {
				var image = new Image();
				image.onload = function () {
					var whOrg = image.naturalWidth + ' x ' + image.naturalHeight;
					var scaled = t.scale(image);
					var size = t.dataURItoBlob(scaled.data).size, sizeOrg = f.size, s, s2 = '', s0 = '';
					if (size > 1024 * 1024) {
						if (size > 5 * 1024 * 1024) {
							s0 = '<span style="color:red;">';
							s2 = '</span>';
						}
						s = (size / 1024 / 1024).toFixed(1) + ' MB';
					} else if (size > 1024)
						s = (size / 1024).toFixed(1) + ' KB';
					else
						s = size + ' B';
					var x;
					if (sizeOrg > 1024 * 1024)
						x = (sizeOrg / 1024 / 1024).toFixed(1) + ' MB';
					else if (sizeOrg > 1024)
						x = (sizeOrg / 1024).toFixed(1) + ' KB';
					else
						x = sizeOrg + ' B';
					var disp = t._root.querySelector('inputFile');
					disp.querySelector('desc').innerHTML = x + global.separator + whOrg + '<br/>' + ui.l('fileUpload.ratio') + ' ' + (100 - size / sizeOrg * 100).toFixed(0) + '%<br/>' + s0 + s + global.separator + s2 + '<imagePreviewSize>' + scaled.width + ' x ' + scaled.height + '</imagePreviewSize>';
					img.src = r.target.result;
					t.update(r.target.result);
					ui.css(disp, 'height', disp.clientWidth + 'px');
					if (image.naturalWidth > image.naturalHeight) {
						ui.css(img, 'max-height', '100%');
						if (image.naturalWidth > disp.clientWidth)
							ui.css(img, 'margin-left', -((Math.min(disp.clientHeight / image.naturalHeight, 1) * image.naturalWidth - disp.clientWidth) / 2) + 'px');
					} else {
						ui.css(img, 'max-width', '100%');
						if (image.naturalHeight > disp.clientHeight)
							ui.css(img, 'margin-top', -((Math.min(disp.clientWidth / image.naturalWidth, 1) * image.naturalHeight - disp.clientHeight) / 2) + 'px');
					}
				};
				image.src = r.target.result;
			}
		};
		reader.readAsDataURL(f);
	}
	remove(t) {
		t = t.getRootNode();
		var e = t.querySelector('input');
		if (e)
			e.value = '';
		var inputFile = t.querySelector('inputFile');
		ui.html(inputFile, '<span>' + (t.host.getAttribute('hint') ? t.host.getAttribute('hint') : ui.l('fileUpload.select')) + '</span>');
		inputFile.style.zIndex = null;
		inputFile.style.height = null;
		t.querySelector('img.icon').style.display = '';
		ui.css('#popupSendImage', 'display', 'none');
		t.host.removeAttribute('value');
		if (!global.isBrowser()) {
			t.querySelector('div').style.display = 'block';
			inputFile.style.display = 'none';
		}
	}
	rotate(img) {
		img = img.getRootNode().querySelector('img.preview');
		var canvas = document.createElement('canvas'), w = img.naturalWidth, h = img.naturalHeight;
		canvas.width = h;
		canvas.height = w;
		var ctx = canvas.getContext('2d');
		var image = new Image();
		image.src = img.src;
		var t = this;
		image.onload = function () {
			var wh = t._root.querySelector('imagePreviewSize').innerHTML.split('x');
			ctx.clearRect(0, 0, w, h);
			ctx.rotate(0.5 * Math.PI);
			ctx.translate(0, -h);
			ctx.drawImage(image, 0, 0, w, h);
			var b = canvas.toDataURL('image/jpeg', 1);;
			img.src = b;
			t.setAttribute('value', '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + global.separatorTech + b.substring(b.indexOf(',') + 1));
			t._root.querySelector('imagePreviewSize').innerHTML = wh[1].trim() + ' x ' + wh[0].trim();
		};
	}
	scale(image, x, y, w, h) {
		var canvas = document.createElement('canvas'), scale = 1, wOrg, hOrg;
		var ctx = canvas.getContext('2d'), max = 800;
		if (w) {
			wOrg = w;
			hOrg = h;
		} else {
			x = 0;
			y = 0;
			wOrg = image.naturalWidth;
			hOrg = image.naturalHeight;
			w = wOrg;
			h = hOrg;
		}
		if (w > h)
			scale = max / h;
		else
			scale = max / w;
		w = scale * w;
		h = scale * h;
		if (w > max) {
			wOrg = max / scale;
			w = max;
		} else if (h > max) {
			hOrg = max / scale;
			h = max;
		}
		canvas.width = max;
		canvas.height = max;
		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		ctx.drawImage(image, x, y, wOrg, hOrg, 0, 0, w, h);
		return { data: canvas.toDataURL('image/jpeg', 0.8), width: parseInt(w + 0.5), height: parseInt(h + 0.5) };
	}
	update(src) {
		const t = this;
		clearTimeout(t.lastUpdate);
		t.lastUpdate = setTimeout(function () {
			var img = new Image();
			var i = t._root.querySelector('img.preview');
			if (i) {
				img.src = src;
				var ratio;
				if (i.clientHeight > i.clientWidth)
					ratio = i.naturalWidth / i.clientWidth;
				else
					ratio = i.naturalHeight / i.clientHeight;
				var x = -i.offsetLeft * ratio;
				var y = -i.offsetTop * ratio;
				var w = Math.min(i.parentElement.clientWidth, i.clientWidth) * ratio;
				var h = Math.min(i.parentElement.clientHeight, i.clientHeight) * ratio;
				var b = t.scale(img, x, y, w, h).data;
				// b = data:image/jpeg;base64,/9j/4AAQS...
				t.setAttribute('value', '.' + b.substring(b.indexOf('/') + 1, b.indexOf(';')) + global.separatorTech + b.substring(b.indexOf(',') + 1));
			} else
				t.setAttribute('value', '');
		}, 500);
	}
	zoom(delta) {
		var e = this._root.querySelector('img.preview');
		if (!e)
			return;
		var style = ('' + ui.cssValue(e, 'max-width')).indexOf('%') > 0 ? 'max-width' : 'max-height';
		var windowSize = style == 'max-width' ? e.parentElement.clientWidth : e.parentElement.clientHeight;
		var imageSize = style == 'max-width' ? e.naturalWidth : e.naturalHeight;
		var zoom = parseFloat(ui.cssValue(e, style)) - delta;
		if (zoom < 100)
			zoom = 100;
		else if (zoom / 100 * windowSize > imageSize)
			zoom = imageSize / windowSize * 100;
		zoom = parseInt('' + zoom);
		if (zoom == parseInt(ui.cssValue(e, style)))
			return;
		ui.css(e, style, zoom + '%');
		var x = parseInt(ui.cssValue(e, 'margin-left')) + e.clientWidth * delta / 200;
		if (x + e.clientWidth < e.parentElement.clientWidth)
			x = e.parentElement.clientWidth - e.clientWidth;
		else if (x > 0)
			x = 0;
		var y = parseInt(ui.cssValue(e, 'margin-top')) + e.clientHeight * delta / 200;
		if (y + e.clientHeight < e.parentElement.clientHeight)
			y = e.parentElement.clientHeight - e.clientHeight;
		else if (y > 0)
			y = 0;
		ui.css(e, 'margin-left', x);
		ui.css(e, 'margin-top', y);
	}
}
