import { communication } from '../communication';
import { global } from '../global';
import { initialisation } from '../init';
import { formFunc, ui } from '../ui';
import { user } from '../user';

export { VideoCall };

class VideoCall extends HTMLElement {
	static mediaDevicesIds = [];
	static connectedId;
	static connectedUser;
	static rtcPeerConnection;
	static offer;
	static permission = true;
	static audio = new Audio();

	constructor() {
		super();
		this._root = this.attachShadow({ mode: 'closed' });
	}
	connectedCallback() {
		const style = document.createElement('style');
		style.textContent = `${initialisation.elementsCss}
call {
	display: flex;
	flex-direction: column;
	justify-content: space-between;
	align-items: center;
	height: 5em;
	width: 18em;
	background: rgba(255, 255, 255, 0.95);
	border-radius: 1em;
	padding: 1em;
	position: fixed;
	z-index: 1;
	left: 50%;
	top: 4em;
	transform: translate(-50%);
	filter: drop-shadow(0 0 0.5em rgba(0, 0, 0, 0.4));
}

call initiator {
	display: block;
	color: black;
	position: relative;
}

call footer {
	width: 100%;
	display: flex;
	justify-content: space-around;
	align-items: center;
	margin-top: 2.5em;
}

buttonIcon {
	position: absolute;
    background: darkgoldenrod;
    cursor: pointer;
    padding: 1em;
    z-index: 3;
    border-radius: 50%;
    box-shadow: 0 0 0.5em rgba(0, 0, 0, 0.3);
    margin-left: -2em;
}

buttonIcon.muted svg path.mute {
	display: none;
}

buttonIcon svg {
	width: 2em;
	height: 2em;
	display: block;
	transition: all 0.4s ease-out;
}

videochat {
	height: 100%;
	width: 100%;
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: space-between;
}


videochat buttons {
	width: 100%;
    position: absolute;
    bottom: 1em;
    display: inline-block;
    height: 5em;
    left: 0;
}

video {
	height: 100%;
	width: 50%;
	object-fit: cover;
	visibility: hidden;
	position: relative;
	float: left;
}

streams {
	height: 100%;
	width: 200%;
	left: 0;
	position: absolute;
	display: block;
	transition: all .4s ease-out;
}

.hidden {
	display: none;
}`;
		this._root.appendChild(style);
		var element = document.createElement('call');
		element.setAttribute('class', 'hidden');
		element.innerHTML = `
<initiator></initiator>
<footer>
	<buttonIcon onclick="VideoCall.callReject()" style="left:5em;"><img source="videoEnd"/></buttonIcon>
	<buttonIcon onclick="VideoCall.callAccept()" style="right:3em;"><img source="videoCall"/></buttonIcon>
</footer>`;
		this._root.appendChild(element);
		element = document.createElement('videochat');
		element.setAttribute('class', 'hidden');
		element.innerHTML = `
<streams>
	<video playsinline="true" autoplay="autoplay" id="remoteStream" controls="false"></video>
	<video playsinline="true" autoplay="autoplay" id="localStream" controls="false"></video>
</streams>
<buttons>
	<buttonIcon onclick="VideoCall.setAudioMute()" class="mute" disabled style="left:20%;"><img source="videoMic"/></buttonIcon>
	<buttonIcon onclick="VideoCall.callStop()" style="left:50%;"><img source="videoEnd"/></buttonIcon>
	<buttonIcon onclick="VideoCall.switchVideo()" class="camera" disabled style="left:80%;"><img source="videoSwitch"/></buttonIcon>
</buttons>`;
		this._root.appendChild(element);
		formFunc.svg.replaceAll(ui.qa('video-call img'));
		ui.swipe('video-call streams', dir => {
			ui.q('video-call streams').style.left = dir == 'left' ? '-100%' : '';
		});
		if (!global.isBrowser()) {
			if (global.getOS() == 'android')
				window.cordova.plugins.permissions.requestPermissions([window.cordova.plugins.permissions.CAMERA, window.cordova.plugins.permissions.RECORD_AUDIO, window.cordova.plugins.permissions.MODIFY_AUDIO_SETTINGS]);
		}
	}
	static callAccept() {
		ui.classAdd('video-call call', 'hidden');
		ui.classRemove('video-call videochat', 'hidden');
		VideoCall.callButtons();
		ui.q('video-call streams').style.left = '';
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			ui.q('video-call #localStream').srcObject = stream;
			stream.getTracks().forEach(track => VideoCall.getRtcPeerConnection().addTrack(track, stream));
			VideoCall.prepareVideoElement('localStream');
			var e = ui.q('video-call videochat');
			ui.classRemove(e, 'hidden');
			e.style.background = 'transparent';
			VideoCall.audio.pause();
			ui.q('video-call videochat buttonIcon.mute').disabled = false;
			ui.q('video-call videochat buttonIcon.camera').disabled = false;
			VideoCall.prepareVideoElement('remoteStream');
			VideoCall.getRtcPeerConnection().createAnswer().then(answer => {
				VideoCall.getRtcPeerConnection().setLocalDescription(answer);
				var e = communication.generateCredentials();
				if (e.user) {
					e.id = VideoCall.connectedId;
					e.answer = answer;
					communication.wsSend('/ws/video', e);
					ui.css('main', 'background', 'transparent');
					ui.css('content', 'visibility', 'hidden');
					ui.css('dialog-navigation', 'visibility', 'hidden');
				}
			}).catch(error => {
				ui.navigation.openPopup(ui.l('attention'), error);
				VideoCall.callStop();
			});
		});
	}
	static callButtons(show) {
		if (show) {
			ui.classRemove('video-call call', 'hidden');
			ui.classAdd('video-call videochat', 'hidden');
			ui.q('video-call').style.display = 'block';
			ui.q('video-call call initiator').innerHTML = VideoCall.connectedUser;
			ui.classRemove('video-call call', 'hidden');
			VideoCall.playAudio('call');
		} else {
			ui.classAdd('video-call call', 'hidden');
			VideoCall.audio.pause();
		}
	}
	static callLeave() {
		ui.q('video-call').style.display = 'none';
		ui.classAdd('video-call call', 'hidden');
		ui.q('video-call #localStream').style.visibility = 'hidden';
		ui.q('video-call #remoteStream').style.visibility = 'hidden';
	}
	static callReject() {
		if (VideoCall.rtcPeerConnection) {
			VideoCall.callStop();
			VideoCall.callButtons();
		}
		if (VideoCall.connectedId) {
			var e = communication.generateCredentials();
			if (e.user) {
				e.id = VideoCall.connectedId;
				communication.wsSend('/ws/video', e);
			}
		}
		VideoCall.callLeave();
	}
	static callStop() {
		VideoCall.offer = null;
		ui.classRemove('video-call call', 'hidden');
		ui.classAdd('video-call videochat', 'hidden');
		ui.classRemove('video-call videochat buttonIcon.mute', 'muted');
		ui.css('main', 'background', null);
		ui.css('content', 'visibility', null);
		ui.css('dialog-navigation', 'visibility', null);
		VideoCall.playAudio('end');
		if (VideoCall.rtcPeerConnection) {
			VideoCall.rtcPeerConnection.getTransceivers().forEach(e => {
				try {
					VideoCall.rtcPeerConnection.removeTrack(e.sender);
					e.stop();
				} catch (e) { }
			});
			VideoCall.rtcPeerConnection.close();
			VideoCall.rtcPeerConnection = null;
			var e = communication.generateCredentials();
			if (e.user) {
				e.id = VideoCall.connectedId;
				communication.wsSend('/ws/video', e);
			}
		}
		var close = stream => {
			if (stream.srcObject)
				stream.srcObject.getTracks().forEach(track => track.stop());
			stream.removeAttribute('src');
			stream.removeAttribute('srcObject');
		};
		close(ui.q('video-call #localStream'));
		close(ui.q('video-call #remoteStream'));
		ui.q('video-call videochat').style.background = '';
		ui.q('video-call videochat buttonIcon.mute').disabled = true;
		ui.q('video-call videochat buttonIcon.camera').disabled = true;
		VideoCall.mediaDevicesIds = [];
		ui.classRemove('video-call videochat buttonIcon.mute', 'muted');
		ui.html('video-call streams video', '');
		ui.q('video-call streams').classList.value = '';

		if (!global.isBrowser() && global.getOS() == 'ios')
			ui.q('video-call').style.background = '#000000';
		VideoCall.callLeave();
	}
	static getRtcPeerConnection() {
		if (!VideoCall.rtcPeerConnection) {
			VideoCall.rtcPeerConnection = new RTCPeerConnection({
				iceServers: [{
					urls: [
						'stun:stun.1.google.com:19302',
						'stun:stun.l.google.com:19302',
						'stun:stun1.l.google.com:19302',
						'stun:stun2.l.google.com:19302'
					]
				}, {
					urls: 'turn:numb.viagenie.ca',
					credential: 'muazkh',
					username: 'webrtc@live.com'
				},
				{
					urls: 'turn:turn.bistri.com:80',
					credential: 'homeo',
					username: 'homeo'
				},
				{
					urls: 'turn:turn.anyfirewall.com:443?transport=tcp',
					credential: 'webrtc',
					username: 'webrtc'
				}]
			});
			VideoCall.rtcPeerConnection.onicecandidate = event => {
				if (event.candidate) {
					var e = communication.generateCredentials();
					if (e.user) {
						e.name = user.contact.pseudonym;
						e.id = VideoCall.connectedId;
						e.candidate = event.candidate;
						communication.wsSend('/ws/video', e);
					}
				}
			};
			VideoCall.rtcPeerConnection.ontrack = event => {
				ui.q('video-call #remoteStream').srcObject = event.streams[0];
				VideoCall.prepareVideoElement('remoteStream');
			};
			VideoCall.rtcPeerConnection.oniceconnectionstatechange = event => {
				if (VideoCall.rtcPeerConnection &&
					(VideoCall.rtcPeerConnection.iceConnectionState == 'disconnected' ||
						VideoCall.rtcPeerConnection.iceConnectionState == 'failed' ||
						VideoCall.rtcPeerConnection.iceConnectionState == 'closed'))
					VideoCall.callStop();
			};
			VideoCall.rtcPeerConnection.onconnectionstatechange = event => {
				if (VideoCall.rtcPeerConnection &&
					(VideoCall.rtcPeerConnection.connectionState == 'disconnected' ||
						VideoCall.rtcPeerConnection.connectionState == 'failed' ||
						VideoCall.rtcPeerConnection.connectionState == 'closed'))
					VideoCall.callStop();
			};
			VideoCall.rtcPeerConnection.onsignalingstatechange = event => {
				if (VideoCall.rtcPeerConnection && VideoCall.rtcPeerConnection.signalingState == 'closed')
					VideoCall.callStop();
			};
			VideoCall.rtcPeerConnection.onicegatheringstatechange = event => {
				if (VideoCall.rtcPeerConnection && VideoCall.rtcPeerConnection.iceGatheringState == 'closed')
					VideoCall.callStop();
			};
		}
		return VideoCall.rtcPeerConnection;
	}
	static init() {
		if (!VideoCall.audio.src) {
			VideoCall.audio.src = 'data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
			VideoCall.audio.muted = true;
			VideoCall.audio.onended = function () {
				VideoCall.audio.onended = null;
				VideoCall.audio.muted = false;
			};
			VideoCall.audio.play();
		}
	}
	static onAnswer(answer) {
		if (answer.userState) {
			if (answer.userState == 'offline' && VideoCall.offer)
				setTimeout(function () {
					if (VideoCall.offer) {
						var e = communication.generateCredentials();
						if (e.user) {
							e.name = user.contact.pseudonym;
							e.id = VideoCall.connectedId;
							e.offer = VideoCall.offer;
							communication.wsSend('/ws/video', e);
						}
					}
				}, 2000);
		} else {
			VideoCall.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(answer));
			ui.q('video-call #localStream').srcObject.getAudioTracks()[0].enabled = true;
			ui.css('main', 'background', 'transparent');
			ui.css('content', 'visibility', 'hidden');
			ui.css('dialog-navigation', 'visibility', 'hidden');
			VideoCall.audio.pause();
		}
	}
	static onCandidate(candidate) {
		VideoCall.getRtcPeerConnection().addIceCandidate(new RTCIceCandidate(candidate));
	}
	static onOffer(data) {
		if (VideoCall.permission) {
			VideoCall.connectedUser = data.name;
			VideoCall.connectedId = data.user;
			VideoCall.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(data.offer));
			VideoCall.callButtons(true);
			ui.q('video-call').style.background = '';
		} else {
			var e = communication.generateCredentials();
			if (e.user) {
				e.id = data.user;
				communication.wsSend('/ws/video', e);
			}
		}
	}
	static playAudio(id) {
		var p = function () {
			try {
				VideoCall.audio.pause();
				VideoCall.audio.loop = id != 'end';
				VideoCall.audio.src = 'audio/' + id + '.mp3';
				VideoCall.audio.play().then().catch(function () {
					setTimeout(p, 100);
				});
			} catch (e) {
				setTimeout(p, 100);
			}
		}();
	}
	static prepareVideoElement(videoElement) {
		var e = ui.q('video-call #' + videoElement);
		e.style.visibility = 'visible';
		if (!global.isBrowser() && global.getOS() == 'ios') {
			e.style.backgroundColor = 'transparent';
			e.style.zIndex = '-1';
		}
	}
	static setAudioMute() {
		if (ui.classContains('video-call videochat buttonIcon.mute', 'muted')) {
			ui.q('video-call #localStream').srcObject.getAudioTracks()[0].enabled = true;
			ui.classRemove('video-call videochat buttonIcon.mute', 'muted');
		} else {
			ui.q('video-call #localStream').srcObject.getAudioTracks()[0].enabled = false;
			ui.classAdd('video-call videochat buttonIcon.mute', 'muted');
		}
	}
	static startAdminCall() {
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>cast(\'' + global.date.local2server(global.date.getToday()) + '\' as timestamp) and contactVideoCall.contactId=' + user.contact.id),
			webCall: 'VideoCall.startAdminCall',
			responseType: 'json',
			success(r) {
				if (r.length > 1) {
					var d = global.date.server2local(r[1][0]).getTime(), n = new Date().getTime();
					if (d - 600000 < n && d + 3600000 > n)
						VideoCall.startVideoCall(ui.q('chat').getAttribute('i'));
					else
						ui.navigation.openPopup(ui.l('attention'), ui.l('events.videoCallDateHint').replace('{0}', global.date.formatDate(r[1][0])));
				} else
					ui.navigation.openPopup(ui.l('attention'), ui.l('events.videoCallDateNoDate') + user.getAppointmentTemplate());
			}
		});
	}
	static startVideoCall(id) {
		if (!VideoCall.permission) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('chat.videoPermissionDenied'));
			return;
		}
		VideoCall.connectedId = id;
		ui.q('video-call streams').style.left = '';
		var e = ui.q('video-call videochat');
		ui.classRemove(e, 'hidden');
		e.style.background = 'transparent';
		ui.css('video-call', 'display', 'block');
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			ui.q('video-call #localStream').srcObject = stream;
			stream.getTracks().forEach(track => VideoCall.getRtcPeerConnection().addTrack(track, stream));
			ui.q('video-call #localStream').srcObject.getAudioTracks()[0].enabled = false;
			ui.q('video-call').style.background = '';
			VideoCall.getRtcPeerConnection().createOffer().then(offer => {
				var e = communication.generateCredentials();
				if (e.user) {
					e.name = user.contact.pseudonym;
					e.id = VideoCall.connectedId;
					e.offer = offer;
					communication.wsSend('/ws/video', e);
					VideoCall.offer = offer;
					VideoCall.getRtcPeerConnection().setLocalDescription(offer);
					VideoCall.playAudio('dial');
					communication.ajax({
						url: global.serverApi + 'action/videocall/' + id,
						webCall: 'VideoCall.startVideoCall',
						method: 'POST'
					});
				}
			}).catch(error => {
				ui.navigation.openPopup(ui.l('attention'), ui.l('chat.videoErrorDevice').replace('{0}', ':<br/>' + error));
				VideoCall.callStop();
			});
			VideoCall.prepareVideoElement('localStream');
		}).catch(err => {
			ui.navigation.openPopup(ui.l('attention'), ui.l('chat.videoErrorDevice').replace('{0}', err.name == 'NotFoundError' ? '.' : ':<br/>' + err));
			VideoCall.callStop();
		});
	}
	static switchVideo() {
		var e = ui.q('video-call streams').style;
		if (e.left) {
			e.left = '';
			ui.q('video-call videochat buttonIcon.camera svg').style.transform = '';
		} else {
			e.left = '-100%';
			ui.q('video-call videochat buttonIcon.camera svg').style.transform = 'rotateY(180deg)';
		}
	}
}
