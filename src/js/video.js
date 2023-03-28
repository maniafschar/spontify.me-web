import { global } from './global';
import { formFunc, ui } from './ui';
import { user } from './user';
import { communication } from './communication';
import { off } from 'process';

export { Video };

class Video {
	static mediaDevicesIds = [];
	static activeDeviceId = null;
	static connectedId;
	static connectedUser;
	static rtcPeerConnection;
	static offer;

	static template = v =>
		global.template`
<section id="call">
	<div id="call-modal-icoming" tabindex="-1">
		<div class="call-modal-header"><span id="call-modal-initiator"></span></div>
		<div class="call-modal-footer">
			<buttonIcon onclick="Video.rejectCall()" class="videochat-button" type="button"><img source="call_end" /></buttonIcon>
			<buttonIcon onclick="Video.acceptCall()" class="videochat-button" type="button"><img source="call" /></buttonIcon>
		</div>
	</div>
</section>
<section id="videochat" class="hidden">
	<div id="videochat-streams"></div>
	<div id="videochat-buttons-container">
		<buttonIcon id="videochat-mute-unmute" onclick="Video.setAudioMute()" class="videochat-button" disabled><img source="mic_off" /></buttonIcon>
		<buttonIcon onclick="Video.stopCall()" class="videochat-button"><img source="call_end" /></buttonIcon>
		<buttonIcon id="videochat-switch-camera" onclick="Video.switchVideo()" class="videochat-button" disabled><img source="switch_video" /></buttonIcon>
	</div>
</section>
<audio id="signal-end" preload="auto">
	<source src="audio/end_call.mp3" type="audio/mp3" />
</audio>  
<audio id="signal-out" loop preload="auto">
	<source src="audio/dialing.mp3" type="audio/mp3" />
</audio>
<audio id="signal-in" loop preload="auto">
	<source src="audio/calling.mp3" type="audio/mp3" />
</audio>`;
	static templateStreams = v =>
		global.template`
<div id="videochat-stream-container-opponent" class="videochat-stream-container">
	<div id="videochat-stream-loader-opponent" class="videochat-stream-loader"></div>
	<video playsinline autoplay="autoplay" id="remoteStream" class="videochat-stream"></video>
</div>
<div id="videochat-local-stream-container" class="videochat-stream-container">
	<video playsinline autoplay="autoplay" id="localStream" class="videochat-stream"></video>
</div>`;
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
				if (Video.rtcPeerConnection.iceConnectionState == 'disconnected' ||
					Video.rtcPeerConnection.iceConnectionState == 'failed' ||
					Video.rtcPeerConnection.iceConnectionState == 'closed')
					Video.stopCall();
			};
			Video.rtcPeerConnection.onconnectionstatechange = event => {
				if (Video.rtcPeerConnection.connectionState == 'disconnected' ||
					Video.rtcPeerConnection.connectionState == 'failed' ||
					Video.rtcPeerConnection.connectionState == 'closed')
					Video.stopCall();
			};
			Video.rtcPeerConnection.onsignalingstatechange = event => {
				if (Video.rtcPeerConnection.signalingState == 'closed')
					Video.stopCall();
			};
			Video.rtcPeerConnection.onicegatheringstatechange = event => {
				if (Video.rtcPeerConnection.iceGatheringState == 'closed')
					Video.stopCall();
			};
		}
		return Video.rtcPeerConnection;
	}
	static init() {
		if (!ui.q('videoCall').innerHTML) {
			if (!global.isBrowser()) {
				if (global.getOS() == 'android') {
					const { permissions } = window.cordova.plugins;
					permissions.requestPermissions([permissions.CAMERA, permissions.RECORD_AUDIO, permissions.MODIFY_AUDIO_SETTINGS]);
				} else if (global.getOS() == 'ios') {
					const { iosrtc } = window.cordova.plugins;
					iosrtc.registerGlobals();
					iosrtc.selectAudioOutput('speaker');
					iosrtc.requestPermission(true, true, function (permissionApproved) {
						if (permissionApproved != 'Approved')
							ui.navigation.openPopup(ui.l('attention'), 'no permission');
					});
				}
			}
			ui.q('videoCall').innerHTML = Video.template();
			ui.q('#videochat-streams').innerHTML = Video.templateStreams();
			formFunc.image.replaceSVGs();
			ui.swipe('#videochat-streams', dir => {
				ui.q('#videochat-streams').style.left = dir == 'left' ? '-100%' : '';
			});
		}
	}
	static onAnswer(answer) {
		if (answer.userState) {
			if (answer.userState == 'offline' && Video.offer)
				setTimeout(function () {
					var e = communication.generateCredentials();
					e.name = user.contact.pseudonym;
					e.id = Video.connectedId;
					e.offer = Video.offer;
					communication.wsSend('/ws/video', e);
				}, 2000);
		} else {
			Video.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(answer));
			ui.q('#signal-out').pause();
			ui.q('#signal-in').pause();
		}
	}
	static onCandidate(candidate) {
		Video.getRtcPeerConnection().addIceCandidate(new RTCIceCandidate(candidate));
	}
	static onOffer(data) {
		Video.connectedUser = data.name;
		Video.connectedId = data.user;
		Video.getRtcPeerConnection().setRemoteDescription(new RTCSessionDescription(data.offer));
		Video.incomingCallModal('show');
	}
	static acceptCall() {
		ui.classAdd('#call', 'hidden');
		ui.classRemove('#videochat', 'hidden');
		Video.hideIncomingCallModal();
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			ui.q('videoCall #localStream').srcObject = stream;
			stream.getTracks().forEach(track => Video.getRtcPeerConnection().addTrack(track, stream));
			Video.setActiveDeviceId(stream);
			Video.prepareVideoElement('localStream');
			var e = ui.q('#videochat');
			ui.classRemove(e, 'hidden');
			e.style.background = 'transparent';
			ui.q('#signal-out').pause();
			ui.q('#signal-in').pause();
			ui.q('#videochat-mute-unmute').disabled = false;
			ui.q('#videochat-switch-camera').disabled = false;
			Video.prepareVideoElement('remoteStream');
			Video.getRtcPeerConnection().createAnswer(answer => {
				Video.getRtcPeerConnection().setLocalDescription(answer);
				var e = communication.generateCredentials();
				e.id = Video.connectedId;
				e.answer = answer;
				communication.wsSend('/ws/video', e);
			}, error => {
				alert('error: ' + error);
			});
		});
	}

	static rejectCall() {
		if (Video.rtcPeerConnection) {
			Video.stopCall();
			Video.hideIncomingCallModal();
			var e = communication.generateCredentials();
			e.id = Video.connectedId;
			communication.wsSend('/ws/video', e);
		}
		Video.leave();
	}

	static startVideoCall(id) {
		Video.connectedId = id;
		Video.init();
		var e = ui.q('#videochat');
		e.classList.remove('hidden');
		e.style.background = 'transparent';
		ui.css('videoCall', 'display', 'block');
		ui.q('#signal-out').play();
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
		ui.classAdd('#call', 'hidden');
		ui.classRemove('#videochat', 'hidden');
		communication.ajax({
			url: global.serverApi + 'action/videocall/' + id,
			method: 'POST'
		})
	};

	static stopCall() {
		Video.offer = null;
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
		ui.q('#videochat').style.background = '';
		ui.q('#signal-out').pause();
		ui.q('#signal-in').pause();
		ui.q('#signal-end').play();
		ui.q('#videochat-mute-unmute').disabled = true;
		ui.q('#videochat-switch-camera').disabled = true;
		Video.mediaDevicesIds = [];
		Video.activeDeviceId = null;
		ui.classRemove('#videochat-mute-unmute', 'muted');
		e = ui.q('#videochat-streams');
		e.innerHTML = Video.templateStreams();
		e.classList.value = '';
		ui.classRemove('#call', 'hidden');
		ui.classAdd('#videochat', 'hidden');
		ui.classRemove('#videochat-mute-unmute', 'muted');

		if (!global.isBrowser() && global.getOS() == 'ios')
			ui.q('#videochat').style.background = '#000000';
		Video.leave();
	}
	static leave() {
		ui.q('videoCall').style.display = 'none';
		ui.q('#call').classList.add('hidden');
	};
	static setActiveDeviceId(stream) {
		if (stream && (global.isBrowser() || global.getOS() != 'ios')) {
			const videoTracks = stream.getVideoTracks();
			const videoTrackSettings = videoTracks[0]?.getSettings();

			Video.activeDeviceId = videoTrackSettings?.deviceId;
		}
	}

	static setAudioMute() {
		if (ui.classContains('#videochat-mute-unmute', 'muted')) {
			ui.q('videoCall #localStream').srcObject.getAudioTracks()[0].enabled = true;
			ui.classRemove('#videochat-mute-unmute', 'muted');
		} else {
			ui.q('videoCall #localStream').srcObject.getAudioTracks()[0].enabled = false;
			ui.classAdd('#videochat-mute-unmute', 'muted');
		}
	};

	static switchCamera() {
		const mediaDevicesId = Video.mediaDevicesIds.find(
			(deviceId) => deviceId !== Video.activeDeviceId
		);
		navigator.mediaDevices.getUserMedia({ video: mediaDevicesId }).then(stream => {
			ui.q('videoCall #localStream').srcObject.getTracks().forEach(track => { if (track.kind == 'video') track.stop(); });
			Video.activeDeviceId = mediaDevicesId;
			ui.q('videoCall #localStream').srcObject = stream;
			stream.getTracks().forEach(track => Video.getRtcPeerConnection().addTrack(track, stream));
			if (ui.classContains('#videochat-mute-unmute', 'muted'))
				ui.q('videoCall #localStream').srcObject.getAudioTracks()[0].enabled = false;
		});
	};

	static switchVideo() {
		var e = ui.q('#videochat-streams').style;
		e.left = e.left.indexOf('%') > 0 ? '' : '-100%';
		if (!global.isBrowser() && window.cordova.plugins && window.cordova.plugins.iosrtc)
			window.cordova.plugins.iosrtc.refreshVideos()
	};

	static updateStream(stream) {
		Video.setActiveDeviceId(stream);
		Video.prepareVideoElement('localStream');
	}
	static hideIncomingCallModal() { Video.incomingCallModal('hide'); }

	static incomingCallModal(className) {
		if (className === 'hide') {
			ui.classRemove('#call-modal-icoming', 'show');
			ui.q('#signal-in').pause();
		} else {
			Video.init();
			ui.classRemove('videoCall #call', 'hidden');
			ui.classAdd('videoCall #videochat', 'hidden');
			ui.q('videoCall').style.display = 'block';
			ui.q('#call-modal-initiator').innerHTML = Video.connectedUser;
			ui.classAdd('#call-modal-icoming', 'show');
			ui.q('#signal-in').play();
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
					var d = global.date.server2Local(r[1][0]).getTime(), n = new Date().getTime();
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