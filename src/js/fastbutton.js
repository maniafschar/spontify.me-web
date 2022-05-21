import { global } from './global';
import { ui } from './ui';

export { FastButton };

class FastButton {
	events = [];
	touchEvents = [];
	element;
	handler;
	preventOnClick = false;
	constructor(element) {
		this.element = element;
		this.handler = element.onclick;
		if ('ontouchstart' in window)
			this.events.push(this.addListener(element, 'touchstart', this));
		this.events.push(this.addListener(element, 'click', this));
	}
	addListener(el, type, listener) {
		ui.on(el, type, listener);
		return {
			destroy() {
				ui.off(el, type, listener);
			}
		};
	}
	destroy() {
		for (var i = this.events.length - 1; i >= 0; i -= 1)
			this.events[i].destroy();
		this.events = this.touchEvents = this.element = this.handler = this.FastButton = null;
	}
	handleEvent(event) {
		switch (event.type) {
			case 'touchstart':
				this.onTouchStart(event);
				break;
			case 'touchmove':
				this.onTouchMove(event);
				break;
			case 'touchend':
			case 'click':
				this.onClick(event);
				break;
		}
	}
	onTouchStart(event) {
		event.stopPropagation ? event.stopPropagation() : (event.cancelBubble = true);
		this.touchEvents.push(this.addListener(this.element, 'touchend', this));
		this.touchEvents.push(this.addListener(document.body, 'touchmove', this));
		this.startX = event.touches[0].clientX;
		this.startY = event.touches[0].clientY;
	}
	onTouchMove(event) {
		if (Math.abs(event.touches[0].clientX - this.startX) > 10 || Math.abs(event.touches[0].clientY - this.startY) > 10)
			this.reset();
	}
	onClick(event) {
		if (event.stopPropagation)
			event.stopPropagation();
		else
			event.cancelBubble = true;
		if (this.preventOnClick) {
			this.preventOnClick = false;
			return;
		}
		if (event.type == 'touchend')
			this.preventOnClick = true;
		ui.lastClick = event.target.outerHTML;
		this.reset();
		this.handler.call(this.element, event);
	}
	reset() {
		for (var i = this.touchEvents.length - 1; i >= 0; i -= 1)
			this.touchEvents[i].destroy();
		this.touchEvents = [];
	}
}