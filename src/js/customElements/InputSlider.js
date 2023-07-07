import { initialisation } from '../init';
import { DragObject, ui } from '../ui';

export { InputSlider }

class InputSlider extends HTMLElement {
	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.customElementsCss}
* {
	transform: translate3d(0, 0, 0);
}
thumb {
	position: absolute;
	top: 0;
	height: 3.7em;
	width: 5em;
	margin-left: -3.65em;
	line-height: 1.8;
	display: inline-block;
}
thumb.right{
	margin-left: -1.35em;
}
thumb span {
	position: absolute;
	top: 0;
	height: 100%;
	width: 2.5em;
	color: black;
	text-align: center;
	border-radius: 0.75em;
	background: rgba(255, 255, 255, 0.85);
	cursor: ew-resize;
}
thumb val {
	display: block;
}`;
		this._root.appendChild(style);
		var v = this.getAttribute('value')?.split(',');
		if (!v)
			v = ['0', '100'];
		var min = parseFloat(this.getAttribute('min')), max = parseFloat(this.getAttribute('max'));
		var delta = 100.0 / (max - min);
		if (!v[1] || parseFloat(v[1]) >= max || v[1] <= v[0] || parseFloat(v[1]) <= min)
			v[1] = '100';
		else
			v[1] = '' + ((parseFloat(v[1]) - min) * delta);
		if (!v[0] || parseFloat(v[0]) >= max || v[0] >= v[1] && this.getAttribute('type') == 'range' || parseFloat(v[0]) <= min)
			v[0] = '0';
		else
			v[0] = '' + ((parseFloat(v[0]) - min) * delta);
		var element = document.createElement('thumb');
		element.style.left = v[0] + '%';
		if (this.getAttribute('type') == 'range') {
			element.innerHTML = `<span style="right:0;"><val></val>${ui.l('slider.from')}</span>`;
			this._root.appendChild(element);
			element = document.createElement('thumb');
			element.style.left = v[1] + '%';
			element.classList.add('right');
			element.innerHTML = `<span style="left:0;"><val></val>${ui.l('slider.until')}</span>`;
		} else
			element.innerHTML = `<span style="right:0;"><val></val>${ui.l(this.getAttribute('label')) ? ui.l(this.getAttribute('label')) : this.getAttribute('label')}</span>`;
		this._root.appendChild(element);
		this.initSliderDrag(this._root.querySelectorAll('thumb'));
	}
	initSliderDrag(o) {
		var thumbLeft = o[0];
		var thumbRight = o[1];
		var update = this.updateSlider;
		var init = function (e) {
			var tmp = new DragObject(e);
			update(e);
			tmp.ondrag = function (event) {
				var slider = event.target;
				if (slider.nodeName == 'INPUT-SLIDER') {
					var x = ui.getEvtPos(event, true) - slider.getBoundingClientRect().x;
					if (!this.obj.classList.contains('right')) {
						if (x > thumbRight.offsetLeft)
							x = thumbRight.offsetLeft;
					} else if (x < thumbLeft.offsetLeft + thumbLeft.offsetWidth)
						x = thumbLeft.offsetLeft + thumbLeft.offsetWidth;
					if (x > slider.offsetWidth)
						x = slider.offsetWidth;
					else if (x < 0)
						x = 0;
					if (x != this.getPos().x) {
						this.obj.style.left = (x / slider.offsetWidth * 100) + '%';
						update(this.obj);
					}
				}
			};
			tmp.ondrop = function () {
				this.obj.style.left = update(this.obj) + '%';
			};
		}
		init(thumbLeft);
		if (thumbRight)
			init(thumbRight);
	}
	updateSlider(e) {
		var h = e.getRootNode().host;
		var min = parseFloat(h.getAttribute('min'));
		var max = parseFloat(h.getAttribute('max'));
		var x = parseInt('' + (0.5 + parseFloat(e.style.left)));
		var v = parseInt('' + (0.5 + min + x * (max - min) / 100));
		var s = h.getAttribute('value')?.split(',');
		if (!s && h.getAttribute('type') == 'range')
			s = ['', ''];
		if (e.getAttribute('class')?.indexOf('right') > -1)
			s[1] = '' + v;
		else
			s[0] = '' + v;
		e.querySelector('val').innerText = v;
		h.setAttribute('value', s.join(','));
		if (h.getAttribute('callback'))
			eval(h.getAttribute('callback'));
		return x;
	}
}
