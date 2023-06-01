import { global } from './global';
import { formFunc, ui } from './ui';
import { user } from './user';
import { communication } from './communication';

export { Video };

class Video {
	static mediaDevicesIds = [];
	static activeDeviceId = null;
	static connectedId;
	static connectedUser;
	static rtcPeerConnection;
	static offer;
	static permission = true;

	static template = v =>
		global.template`
<call>
	<initiator></initiator>
	<footer>
		<buttonIcon onclick="Video.rejectCall()" type="button"><img source="videoEnd"/></buttonIcon>
		<buttonIcon onclick="Video.acceptCall()" type="button"><img source="videoCall"/></buttonIcon>
	</footer>
</call>
<videochat class="hidden">
	<streams></streams>
	<buttons>
		<buttonIcon onclick="Video.setAudioMute()" class="mute" disabled><img source="videoMic"/></buttonIcon>
		<buttonIcon onclick="Video.stopCall()"><img source="videoEnd"/></buttonIcon>
		<buttonIcon onclick="Video.switchVideo()" class="camera" disabled><img source="videoSwitch"/></buttonIcon>
	</buttons>
</videochat>
<audio class="end" preload="auto">
	<source src="audio/end_call.mp3" type="audio/mp3" />
</audio>
<audio class="out" loop preload="auto">
	<source src="audio/dialing.mp3" type="audio/mp3" />
</audio>
<audio class="in" loop preload="auto">
	<source src="audio/calling.mp3" type="audio/mp3" />
</audio>`;
	static templateStreams = v =>
		global.template`
<video playsinline autoplay="autoplay" id="remoteStream"></video>
<video playsinline autoplay="autoplay" id="localStream"></video>`;
	static getRtcPeerConnection() {
		if (!Video.rtcPeerConnection) {
			Video.rtcPeerConnection = new RTCPeerConnection({
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
			Video.rtcPeerConnection.onicecandidate = event => {
				if (event.candidate) {
					var e = communication.generateCredentials();
					e.name = user.contact.pseudonym;
					e.id = Video.connectedId;
					e.candidate = event.candidate;
					communication.wsSend('/ws/video', e);
				}
			};
			Video.rtcPeerConnection.ontrack = event => {
				ui.q('#remoteStream').srcObject = event.streams[0];
				Video.prepareVideoElement('remoteStream');
			};
			Video.rtcPeerConnection.oniceconnectionstatechange = event => {
				if (Video.rtcPeerConnection &&
					(Video.rtcPeerConnection.iceConnectionState == 'disconnected' ||
						Video.rtcPeerConnection.iceConnectionState == 'failed' ||
						Video.rtcPeerConnection.iceConnectionState == 'closed'))
					Video.stopCall();
			};
			Video.rtcPeerConnection.onconnectionstatechange = event => {
				if (Video.rtcPeerConnection &&
					(Video.rtcPeerConnection.connectionState == 'disconnected' ||
						Video.rtcPeerConnection.connectionState == 'failed' ||
						Video.rtcPeerConnection.connectionState == 'closed'))
					Video.stopCall();
			};
			Video.rtcPeerConnection.onsignalingstatechange = event => {
				if (Video.rtcPeerConnection && Video.rtcPeerConnection.signalingState == 'closed')
					Video.stopCall();
			};
			Video.rtcPeerConnection.onicegatheringstatechange = event => {
				if (Video.rtcPeerConnection && Video.rtcPeerConnection.iceGatheringState == 'closed')
					Video.stopCall();
			};
		}
		return Video.rtcPeerConnection;
	}
	static init() {
		if (!ui.q('videoCall').innerHTML) {
			ui.q('videoCall').innerHTML = Video.template();
			ui.q('videoCall streams').innerHTML = Video.templateStreams();
			formFunc.svg.replaceAll();
			ui.swipe('videoCall streams', dir => {
				ui.q('videoCall streams').style.left = dir == 'left' ? '-100%' : '';
			});
			if (!global.isBrowser()) {
				if (global.getOS() == 'android')
					cordova.plugins.permissions.requestPermissions([cordova.plugins.permissions.CAMERA, cordova.plugins.permissions.RECORD_AUDIO, cordova.plugins.permissions.MODIFY_AUDIO_SETTINGS]);
				else if (global.getOS() == 'ios') {
					cordova.plugins.iosrtc.registerGlobals();
					cordova.plugins.iosrtc.selectAudioOutput('speaker');
					cordova.plugins.iosrtc.requestPermission(true, true, function () { });
				}
			}
		}
	}
	static onAnswer(answer) {
		if (answer.userState) {
			if (answer.userState == 'offline' && Video.offer)
				setTimeout(function () {
					if (Video.offer) {
						var e = communication.generateCredentials();
						e.name = user.contact.pseudonym;
						e.id = Video.connectedId;
						e.offer = Video.offer;
						communication.wsSend('/ws/video', e);
					}
				}, 2000);
		} else {
			Video.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(answer));
			ui.css('main', 'background', 'transparent');
			ui.css('content', 'visibility', 'hidden');
			ui.css('navigation', 'visibility', 'hidden');
			ui.q('videoCall audio.out').pause();
			ui.q('videoCall audio.in').pause();
		}
	}
	static onCandidate(candidate) {
		Video.getRtcPeerConnection().addIceCandidate(new RTCIceCandidate(candidate));
	}
	static onOffer(data) {
		if (Video.permission) {
			Video.connectedUser = data.name;
			Video.connectedId = data.user;
			Video.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(data.offer));
			Video.incomingCallModal(true);
		} else {
			var e = communication.generateCredentials();
			e.id = data.user;
			communication.wsSend('/ws/video', e);
		}
	}
	static acceptCall() {
		ui.classAdd('call', 'hidden');
		ui.classRemove('videochat', 'hidden');
		Video.incomingCallModal();
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			ui.q('videoCall #localStream').srcObject = stream;
			stream.getTracks().forEach(track => Video.getRtcPeerConnection().addTrack(track, stream));
			Video.setActiveDeviceId(stream);
			Video.prepareVideoElement('localStream');
			var e = ui.q('videochat');
			ui.classRemove(e, 'hidden');
			e.style.background = 'transparent';
			ui.q('videoCall audio.out').pause();
			ui.q('videoCall audio.in').pause();
			ui.q('videoCall videochat buttonIcon.mute').disabled = false;
			ui.q('videoCall videochat buttonIcon.camera').disabled = false;
			Video.prepareVideoElement('remoteStream');
			Video.getRtcPeerConnection().createAnswer(answer => {
				Video.getRtcPeerConnection().setLocalDescription(answer);
				var e = communication.generateCredentials();
				e.id = Video.connectedId;
				e.answer = answer;
				communication.wsSend('/ws/video', e);
				ui.css('main', 'background', 'transparent');
				ui.css('content', 'visibility', 'hidden');
				ui.css('navigation', 'visibility', 'hidden');
			}, error => {
				alert('error: ' + error);
			});
		});
	}
	static rejectCall() {
		if (Video.rtcPeerConnection) {
			Video.stopCall();
			Video.incomingCallModal();
		}
		if (Video.connectedId) {
			var e = communication.generateCredentials();
			e.id = Video.connectedId;
			communication.wsSend('/ws/video', e);
		}
		Video.leave();
	}
	static startVideoCall(id) {
		if (!Video.permission) {
			ui.navigation.openPopup(ui.l('attention'), ui.l('chat.videoPermissionDenied'));
			return;
		}
		Video.connectedId = id;
		var e = ui.q('videochat');
		ui.classRemove(e, 'hidden');
		e.style.background = 'transparent';
		ui.css('videoCall', 'display', 'block');
		ui.q('videoCall audio.out').play();
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			ui.q('videoCall #localStream').srcObject = stream;
			stream.getTracks().forEach(track => Video.getRtcPeerConnection().addTrack(track, stream));
			Video.getRtcPeerConnection().createOffer(offer => {
				var e = communication.generateCredentials();
				e.name = user.contact.pseudonym;
				e.id = Video.connectedId;
				e.offer = offer;
				communication.wsSend('/ws/video', e);
				Video.offer = offer;
				Video.getRtcPeerConnection().setLocalDescription(offer);
			}, error => {
				alert('An error has occurred: ' + error);
			});
			Video.setActiveDeviceId(stream);
			Video.prepareVideoElement('localStream');
		}).catch((err) => {
			ui.navigation.openPopup(ui.l('attention'), err);
		});
		ui.classAdd('call', 'hidden');
		ui.classRemove('videochat', 'hidden');
		communication.ajax({
			url: global.serverApi + 'action/videocall/' + id,
			webCall: 'video.startVideoCall(id)',
			method: 'POST'
		})
	}
	static stopCall() {
		Video.offer = null;
		ui.classRemove('call', 'hidden');
		ui.classAdd('videochat', 'hidden');
		ui.classRemove('videoCall videochat buttonIcon.mute', 'muted');
		ui.css('main', 'background', null);
		ui.css('content', 'visibility', null);
		ui.css('navigation', 'visibility', null);
		ui.q('videoCall audio.out').pause();
		ui.q('videoCall audio.in').pause();
		ui.q('videoCall audio.end').play();
		if (Video.rtcPeerConnection) {
			if (!Video.getRtcPeerConnection().remoteDescription) {
				var e = communication.generateCredentials();
				e.id = Video.connectedId;
				communication.wsSend('/ws/video', e);
			}
			Video.rtcPeerConnection.getTransceivers().forEach(e => {
				Video.rtcPeerConnection.removeTrack(e.sender);
				e.stop();
			});
			Video.rtcPeerConnection.close();
			Video.rtcPeerConnection = null;
			e = communication.generateCredentials();
			e.id = Video.connectedId;
			communication.wsSend('/ws/video', e);
		}
		var close = stream => {
			if (stream.srcObject) {
				stream.srcObject.getTracks().forEach(track => track.stop());
			}
			stream.removeAttribute('src');
			stream.removeAttribute('srcObject');
		};
		close(ui.q('videoCall #localStream'));
		close(ui.q('videoCall #remoteStream'));
		ui.q('videochat').style.background = '';
		ui.q('videoCall videochat buttonIcon.mute').disabled = true;
		ui.q('videoCall videochat buttonIcon.camera').disabled = true;
		Video.mediaDevicesIds = [];
		Video.activeDeviceId = null;
		ui.classRemove('videoCall videochat buttonIcon.mute', 'muted');
		e = ui.q('videoCall streams');
		e.innerHTML = Video.templateStreams();
		e.classList.value = '';

		if (!global.isBrowser() && global.getOS() == 'ios')
			ui.q('videochat').style.background = '#000000';
		Video.leave();
	}
	static leave() {
		ui.q('videoCall').style.display = 'none';
		ui.classAdd('call', 'hidden');
	};
	static setActiveDeviceId(stream) {
		if (stream && (global.isBrowser() || global.getOS() != 'ios')) {
			const videoTracks = stream.getVideoTracks();
			const videoTrackSettings = videoTracks[0]?.getSettings();
			Video.activeDeviceId = videoTrackSettings?.deviceId;
		}
	}
	static setAudioMute() {
		if (ui.classContains('videoCall videochat buttonIcon.mute', 'muted')) {
			ui.q('videoCall #localStream').srcObject.getAudioTracks()[0].enabled = true;
			ui.classRemove('videoCall videochat buttonIcon.mute', 'muted');
		} else {
			ui.q('videoCall #localStream').srcObject.getAudioTracks()[0].enabled = false;
			ui.classAdd('videoCall videochat buttonIcon.mute', 'muted');
		}
	}
	static switchVideo() {
		var e = ui.q('videoCall streams').style;
		if (e.left.indexOf('%') > 0) {
			e.left = '';
			ui.q('videoCall videochat buttonIcon.camera svg').style.transform = '';
		} else {
			e.left = '-100%';
			ui.q('videoCall videochat buttonIcon.camera svg').style.transform = 'rotate(180deg)';
		}
		if (!global.isBrowser() && window.cordova.plugins && window.cordova.plugins.iosrtc)
			window.cordova.plugins.iosrtc.refreshVideos()
	}
	static updateStream(stream) {
		Video.setActiveDeviceId(stream);
		Video.prepareVideoElement('localStream');
	}
	static incomingCallModal(show) {
		if (show) {
			ui.classRemove('videoCall call', 'hidden');
			ui.classAdd('videoCall videochat', 'hidden');
			ui.q('videoCall').style.display = 'block';
			ui.q('videoCall call initiator').innerHTML = Video.connectedUser;
			ui.classRemove('call', 'hidden');
			ui.q('videoCall audio.in').play();
		} else {
			ui.classAdd('call', 'hidden');
			ui.q('videoCall audio.in').pause();
		}
	}
	static prepareVideoElement(videoElement) {
		var e = ui.q('#' + videoElement);
		e.style.visibility = 'visible';
		if (!global.isBrowser() && global.getOS() == 'ios') {
			e.style.backgroundColor = '';
			e.style.zIndex = '-1';
		}
	}
	static startAdminCall() {
		communication.ajax({
			url: global.serverApi + 'db/list?query=contact_listVideoCalls&search=' + encodeURIComponent('contactVideoCall.time>\'' + global.date.local2server(global.date.getToday()) + '\' and contactVideoCall.contactId=' + user.contact.id),
			webCall: 'video.startAdminCall()',
			responseType: 'json',
			success(r) {
				if (r.length > 1) {
					var d = global.date.server2local(r[1][0]).getTime(), n = new Date().getTime();
					if (d - 600000 < n && d + 3600000 > n)
						Video.startVideoCall(ui.q('chat').getAttribute('i'));
					else
						ui.navigation.openPopup(ui.l('attention'), ui.l('events.videoCallDateHint').replace('{0}', global.date.formatDate(r[1][0])));
				} else
					ui.navigation.openPopup(ui.l('attention'), ui.l('events.videoCallDateNoDate') + user.getAppointmentTemplate());
			}
		});
	}
}