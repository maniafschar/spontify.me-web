import { global } from './global';
import { ui } from './ui';
import { user } from './user';
import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';
import { communication, Encryption } from './communication';

class Video {
	_session = null;
	mediaDevicesIds = [];
	activeDeviceId = null;
	isAudioMuted = false;
	mediaParams = {
		audio: true,
		video: true,
		elementId: 'localStream',
		options: {
			muted: true,
			mirror: true,
		},
	};
	localStream;
	connection;
	connectedId = 3;
	connectedUser;
	stompClient;
	rtcPeerConnection;

	static template = v =>
		global.template`
<section id="call">
	<div id="call-select-users"></div>
	<div id="call-buttons-container">
	<button id="call-start-video" class="call-button"></button>
	<button id="videochat-leave" class="call-button"></button>
	</div>
	<div id="call-icoming"></div>
	<div id="call-modal-icoming" tabindex="-1">
	<div class="call-modal-header"><span id="call-modal-initiator"></span></div>
	<div class="call-modal-footer">
		<button id="call-modal-reject" class="videochat-button" type="button"></button>
		<button id="call-modal-accept" class="videochat-button" type="button"></button>
	</div>
	</div>
</section>
<section id="videochat" class="hidden">
	<div id="videochat-streams">
		<div id="videochat-stream-container-opponent" class="videochat-stream-container">
			<div id="videochat-stream-loader-opponent" class="videochat-stream-loader">
				<div class="videochat-stream-loader-text"></div>
				<div class="videochat-stream-loader-spinner">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink"
						style="margin: auto; background: none; display: block; shape-rendering: auto;"
						width="20px"
						height="20px"
						viewBox="0 0 100 100"
						preserveAspectRatio="xMidYMid"
					>
					<circle
						r="36"
						cx="50"
						cy="50"
						fill="none"
						stroke="#1198d4"
						stroke-width="10"
						stroke-dasharray="169.64600329384882 58.548667764616276"
						transform="rotate(113.674 50 50)"
					>
						<animateTransform
							attributeName="transform"
							type="rotate"
							repeatCount="indefinite"
							dur="1s"
							values="0 50 50;360 50 50"
							keyTimes="0;1"
						></animateTransform>
					</circle>
					</svg>
				</div>
			</div>
			<video playsinline autoplay="autoplay" id="remoteStream-opponent" class="videochat-stream" data-id="opponent"></video>
		</div>
		<div id="videochat-local-stream-container" class="videochat-stream-container">
			<video playsinline autoplay="autoplay" id="localStream" class="videochat-stream"></video>
		</div>
	</div>
	<div id="videochat-buttons-container">
	<button id="videochat-mute-unmute" class="videochat-button" disabled></button>
	<button id="videochat-stop-call" class="videochat-button"></button>
	<button id="videochat-switch-camera" class="videochat-button" disabled></button>
	</div>
</section>
<div id="snackbar"></div>
<audio id="signal-end" preload="auto">
	<source src="audio/end_call.mp3" type="audio/mp3" />
</audio>  
<audio id="signal-out" loop preload="auto">
	<source src="audio/dialing.mp3" type="audio/mp3" />
</audio>
<audio id="signal-in" loop preload="auto">
	<source src="audio/calling.mp3" type="audio/mp3" />
</audio>`;

	init() {
		if (!ui.q('videoCall').innerHTML) {
			ui.q('videoCall').innerHTML = Video.template();
			ui.q('#call-start-video').addEventListener('click', () => this.startVideoCall());
			ui.q('#videochat-stop-call').addEventListener('click', () => this.stopCall());
			ui.q('#videochat-leave').addEventListener('click', () => this.rejectCall());
			ui.q('#videochat-mute-unmute').addEventListener('click', () => this.setAudioMute());
			ui.q('#videochat-switch-camera').addEventListener('click', () => this.switchVideo());
			// ConnectyCube.videochat.onCallListener = this.onCallListener.bind(this);
			// ConnectyCube.videochat.onAcceptCallListener = this.onAcceptCallListener.bind(this);
			// ConnectyCube.videochat.onRejectCallListener = this.onRejectCallListener.bind(this);
			// ConnectyCube.videochat.onStopCallListener = this.onStopCallListener.bind(this);
			// ConnectyCube.videochat.onUserNotAnswerListener = this.onUserNotAnswerListener.bind(this);
			// ConnectyCube.videochat.onRemoteStreamListener = this.onRemoteStreamListener.bind(this);
			// ConnectyCube.videochat.onDevicesChangeListener = this.onDevicesChangeListener.bind(this);
			ui.q('#call-modal-reject').addEventListener('click', () => this.rejectCall());
			ui.q('#call-modal-accept').addEventListener('click', () => this.acceptCall());
			ui.swipe('#videochat-streams', dir => {
				ui.q('#videochat-streams').style.left = dir == 'left' ? '-100%' : '';
			});
			this.connection = new SockJS(global.serverApi + 'ws/init');
			this.stompClient = Stomp.over(this.connection);
			this.stompClient.connect(communication.generateCredentials(), frame => {
				console.log('Connected: ' + frame);
				this.stompClient.subscribe(
					"/user/" + user.contact.id + "/video",
					message => {
						console.log('Got stomp message', message.data);
						var data = JSON.parse(message.data);
						switch (data.type) {
							case 'offer':
								this.onOffer(data);
								break;
							case 'answer':
								this.onAnswer(data.answer);
								break;
							case 'candidate':
								this.onCandidate(data.candidate);
								break;
							default:
								break;
						}
					}
				);
			});
			this.connection.onopen = () => {
				console.log('open');
			};
			this.connection.onclose = () => {
				console.log('close');
			};
			this.rtcPeerConnection = new RTCPeerConnection({
				iceServers: [{ urls: 'stun:stun.1.google.com:19302' }]
			});
			this.rtcPeerConnection.onicecandidate = event => {
				if (event.candidate) {
					var e = communication.generateCredentials();
					e.type = 'candidate';
					e.name = user.contact.pseudonym;
					e.id = this.connectedId;
					e.candidate = event.candidate;
					this.stompClient.send('/ws/video', {}, JSON.stringify(e));
				}
			};
			this.connection.onmessage = message => {
				console.log('Got connection message', message.data);
				var data = JSON.parse(message.data);
				switch (data.type) {
					case 'offer':
						this.onOffer(data.offer, data.name);
						break;
					case 'answer':
						this.onAnswer(data.answer);
						break;
					case 'candidate':
						this.onCandidate(data.candidate);
						break;
					default:
						break;
				}
			}
		}
	}
	onAnswer(answer) {
		this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription(answer));
	}
	onCandidate(candidate) {
		this.rtcPeerConnection.addIceCandidate(new RTCIceCandidate(candidate));
	}
	onOffer(data) {
		this.connectedUser = data.name;
		this.connectedId = data.id;
		this.rtcPeerConnection.setRemoteDescription(new RTCSessionDescription({ sdp: data.offer, type: 'offer' }));
		this.rtcPeerConnection.createAnswer(answer => {
			this.rtcPeerConnection.setLocalDescription(answer);
			var e = communication.generateCredentials();
			e.type = 'answer';
			e.id2 = this.connectedId;
			e.answer = answer;
			this.stompClient.send('/ws/video', {}, JSON.stringify(e));
		}, error => {
			alert('error: ' + error);
		});
	}
	onCallListener(session) {
		if (session.initiatorID === session.currentUserID)
			return false;
		if (this._session) {
			this.rejectCall(session, { busy: true });
			return false;
		}
		this._session = session;
		this.showIncomingCallModal();
	}

	onAcceptCallListener(session, userId) {
		if (userId === session.currentUserID) {
			if (ui.classContains('#call-modal-icoming', 'show')) {
				this._session = null;
				this.hideIncomingCallModal();
			}
			return false;
		}
		ui.q('#signal-out').pause();
	}

	onRejectCallListener(session, userId, extension = {}) {
		if (userId === session.currentUserID) {
			if (ui.classContains('#call-modal-icoming', 'show')) {
				this._session = null;
				this.hideIncomingCallModal();
			}
			return false;
		} else {
			const userName = 'xyz';
			const infoText = extension.busy
				? `${userName} is busy`
				: `${userName} rejected the call request`;

			this.stopCall(userId);
			this.showSnackbar(infoText);
		}
	}

	onStopCallListener(session, userId) {
		if (!this._session)
			return false;
		const isStoppedByInitiator = session.initiatorID === userId;
		if (isStoppedByInitiator) {
			if (ui.classContains('#call-modal-icoming', 'show')) {
				this.hideIncomingCallModal();
			}
			this.stopCall();
		} else
			this.stopCall(userId);
	}

	onUserNotAnswerListener(session, userId) {
		if (!this._session)
			return false;

		const userName = 'xyz';
		const infoText = `${userName} did not answer`;

		this.showSnackbar(infoText);
		this.stopCall(userId);
	}

	onRemoteStreamListener(session, userId, stream) {
		if (!this._session)
			return false;

		const remoteStreamSelector = `remoteStream-${userId}`;

		ui.q(`#videochat-stream-loader-${userId}`).remove();
		this._session.attachMediaStream(remoteStreamSelector, stream);

		ui.q('#videochat-mute-unmute').disabled = false;
		ui.q('#videochat-switch-camera').disabled = false;
		this.onDevicesChangeListener();
		this._prepareVideoElement(remoteStreamSelector);
	};

	acceptCall() {
		const extension = {};
		ui.classAdd('#call', 'hidden');
		ui.classRemove('#videochat', 'hidden');
		this.hideIncomingCallModal();

		const mediaOptions = { ...this.mediaParams };
		this._session.getUserMedia(mediaOptions).then((stream) => {
			this._session.accept(extension);
			this.setActiveDeviceId(stream);
			this._prepareVideoElement('localStream');
			var e = ui.q('#videochat');
			e.classList.remove('hidden');
			e.style.background = 'transparent';
			ui.css('body>main', 'display', 'none');
			ui.css('body>videoCall', 'display', 'block');
		});
	}

	rejectCall(session, extension = {}) {
		if (session) {
			session.reject(extension);
		} else if (this._session) {
			this._session.reject(extension);
			this._session = null;
			this.hideIncomingCallModal();
		}
		this.leave();
	}

	startVideoCall() {
		this.connectedId = 4;
		this.init();
		var e = ui.q('#videochat');
		e.classList.remove('hidden');
		e.style.background = 'transparent';
		ui.css('body>main', 'display', 'none');
		ui.css('videoCall', 'display', 'block');
		ui.q('#signal-out').play();
		navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
			this.localStream = stream;
			ui.q('videoCall #localStream').srcObject = stream;
			stream.getTracks().forEach(track => this.rtcPeerConnection.addTrack(track, stream));
			this.rtcPeerConnection.createOffer(offer => {
				var e = communication.generateCredentials();
				e.type = 'offer';
				e.name = user.contact.pseudonym;
				e.id = this.connectedId;
				e.offer = offer.sdp;
				this.stompClient.send('/ws/video', {}, JSON.stringify(e));
				this.rtcPeerConnection.setLocalDescription(offer);
			}, error => {
				alert('An error has occurred: ' + error);
			});
			this.setActiveDeviceId(stream);
			this._prepareVideoElement('localStream');
		}).catch((err) => {
			console.log(err);
		});
		ui.classAdd('#call', 'hidden');
		ui.classRemove('#videochat', 'hidden');
		// TODO send push notification
	};

	stopCall(userId) {
		ui.q('#videochat').style.background = '';
		ui.q('body>main').style.display = '';

		if (userId) {
			ui.q(`#videochat-stream-container-${userId}`).remove();
			this.stopCall();
		} else if (this._session) {
			// stop tracks
			const video = ui.q('#localStream');
			for (const track of video.srcObject.getTracks())
				track.stop();
			this._session.stop({});
			this.localStream.close();
			ui.q('#signal-out').pause();
			ui.q('#signal-in').pause();
			ui.q('#signal-end').play();
			ui.q('#videochat-mute-unmute').disabled = true;
			ui.q('#videochat-switch-camera').disabled = true;
			this._session = null;
			this.mediaDevicesIds = [];
			this.activeDeviceId = null;
			this.isAudioMuted = false;
			var e = ui.q('#videochat-streams');
			e.innerHTML = '';
			e.classList.value = '';
			ui.classRemove('#call', 'hidden');
			ui.classAdd('#videochat', 'hidden');
			ui.classRemove('#videochat-mute-unmute', 'muted');

			if (!global.isBrowser() && global.getOS() == 'ios')
				ui.q('#videochat').style.background = '#000000';
		}
		this.leave();
	}

	leave() {
		ui.q('videoCall').style.display = 'none';
		this.logout();
	};

	onDevicesChangeListener() {
		if (!global.isBrowser() && global.getOS() == 'ios')
			return;

		navigator.mediaDevices.getUserMedia({
			audio: true,
			video: true,
		}).then((mediaDevices) => {
			this.mediaDevicesIds.push(mediaDevices.id);

			if (this.mediaDevicesIds.length < 2) {
				ui.q('#videochat-switch-camera').disabled = true;
				if (this.activeDeviceId && this.mediaDevicesIds?.[0] !== this.activeDeviceId)
					this.switchCamera();
			} else
				ui.q('#videochat-switch-camera').disabled = false;
		});
	}

	setActiveDeviceId(stream) {
		if (stream && (global.isBrowser() || global.getOS() != 'ios')) {
			const videoTracks = stream.getVideoTracks();
			const videoTrackSettings = videoTracks[0]?.getSettings();

			this.activeDeviceId = videoTrackSettings?.deviceId;
		}
	}

	setAudioMute() {
		if (this.isAudioMuted) {
			this._session.unmute('audio');
			this.isAudioMuted = false;
			ui.classRemove('#videochat-mute-unmute', 'muted');
		} else {
			this._session.mute('audio');
			this.isAudioMuted = true;
			ui.classAdd('#videochat-mute-unmute', 'muted');
		}
	};

	switchCamera() {
		const mediaDevicesId = this.mediaDevicesIds.find(
			(deviceId) => deviceId !== this.activeDeviceId
		);

		this._session.switchMediaTracks({ video: mediaDevicesId }).then(() => {
			this.activeDeviceId = mediaDevicesId;

			if (this.isAudioMuted) {
				this._session.mute('audio');
			}
		});
	};

	switchVideo() {
		var e = ui.q('#videochat-streams').style;
		e.left = e.left.indexOf('%') > 0 ? '' : '-100%';
		if (cordova && cordova.plugins && cordova.plugins.iosrtc)
			cordova.plugins.iosrtc.refreshVideos()
	};

	updateStream(stream) {
		this.setActiveDeviceId(stream);
		this._prepareVideoElement('localStream');
	}

	showSnackbar(infoText) {
		const $snackbar = ui.q('#snackbar');

		$snackbar.innerHTML = infoText;
		$snackbar.classList.add('show');

		setTimeout(() => {
			$snackbar.innerHTML = '';
			$snackbar.classList.remove('show');
		}, 3000);
	};

	/*INCOMING CALL MODAL */

	showIncomingCallModal() {
		this._incomingCallModal('show');
	}

	hideIncomingCallModal() { this._incomingCallModal('hide'); }

	_incomingCallModal(className) {
		if (className === 'hide') {
			ui.q('#call-modal-initiator').innerHTML = '';
			ui.classRemove('#call-modal-icoming', 'show');
			ui.q('#signal-in').pause();
		} else {
			ui.q('videoCall #call').classList.remove('hidden');
			ui.q('videoCall #videochat').classList.add('hidden');
			ui.q('videoCall').style.display = 'block';
			ui.q('#call-modal-initiator').innerHTML = 'xyz';
			ui.classAdd('#call-modal-icoming', 'show');
			ui.q('#signal-in').play();
		}
	}

	_prepareVideoElement(videoElement) {
		var e = ui.q('#' + videoElement);
		e.style.visibility = 'visible';
		if (!global.isBrowser() && global.getOS() == 'ios') {
			e.style.backgroundColor = '';
			e.style.zIndex = '-1';
		}
	}

	disconnect() {
		this.stompClient.disconnect();
		this.connection.disconnect();
	}
	logout() {
		ui.q('#call').classList.add('hidden');
	}
}

export default new Video();