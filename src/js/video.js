import { global } from './global';
import { ui } from './ui';

class Video {
	$calling;
	$dialing;
	$endCall;
	$modal;
	$muteUnmuteButton;
	$switchCameraButton;
	_session = null;
	mediaDevicesIds = [];
	activeDeviceId = null;
	isAudioMuted = false;
	startEventSharinScreen = null;
	mediaParams = {
		audio: true,
		video: true,
		elementId: 'localStream',
		options: {
			muted: true,
			mirror: true,
		},
	};
	users;

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
	<div id="videochat-streams"></div>
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
	static templateCall = v =>
		global.template`
<div id="videochat-stream-container-${v.id}" class="videochat-stream-container">
	<div id="videochat-stream-loader-${v.id}" class="videochat-stream-loader">
		<div class="videochat-stream-loader-text">${v.name}</div>
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
	<video playsinline id="remoteStream-${v.id}" class="videochat-stream" data-id="${v.id}"></video>
</div>
<div id="videochat-local-stream-container" class="videochat-stream-container">
	<video playsinline id="localStream" class="videochat-stream"></video>
</div>`;

	init() {
		if (!ui.q('videoCall').innerHTML) {
			ui.q('videoCall').innerHTML = Video.template();
			this.$calling = ui.q('#signal-in');
			this.$dialing = ui.q('#signal-out');
			this.$endCall = ui.q('#signal-end');
			this.$modal = ui.q('#call-modal-icoming');
			this.$muteUnmuteButton = ui.q('#videochat-mute-unmute');
			this.$switchCameraButton = ui.q('#videochat-switch-camera');
			ConnectyCube.videochat.onCallListener = this.onCallListener.bind(this);
			ConnectyCube.videochat.onAcceptCallListener = this.onAcceptCallListener.bind(this);
			ConnectyCube.videochat.onRejectCallListener = this.onRejectCallListener.bind(this);
			ConnectyCube.videochat.onStopCallListener = this.onStopCallListener.bind(this);
			ConnectyCube.videochat.onUserNotAnswerListener = this.onUserNotAnswerListener.bind(this);
			ConnectyCube.videochat.onRemoteStreamListener = this.onRemoteStreamListener.bind(this);
			ConnectyCube.videochat.onDevicesChangeListener = this.onDevicesChangeListener.bind(this);
			ui.q('#call-modal-reject').addEventListener('click', () => this.rejectCall());
			ui.q('#call-modal-accept').addEventListener('click', () => this.acceptCall());
			ui.swipe('#videochat-streams', function (dir) {
				ui.q('#videochat-streams').style.left = dir == 'left' ? '-100%' : '';
			});
		}
	}

	addStreamElements(opponents) {
		const $videochatStreams = ui.q('#videochat-streams');
		ui.q('#call').classList.add('hidden');
		ui.q('#videochat').classList.remove('hidden');
		$videochatStreams.innerHTML = Video.templateCall({ opponents });
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
			if (this.$modal.classList.contains('show')) {
				this._session = null;
				this.hideIncomingCallModal();
			}
			return false;
		}
		this.$dialing.pause();
	}

	onRejectCallListener(session, userId, extension = {}) {
		if (userId === session.currentUserID) {
			if (this.$modal.classList.contains('show')) {
				this._session = null;
				this.hideIncomingCallModal();
			}

			return false;
		} else {
			const userName = this.users.callee.name;
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
			if (this.$modal.classList.contains('show')) {
				this.hideIncomingCallModal();
			}
			this.stopCall();
		} else
			this.stopCall(userId);
	}

	onUserNotAnswerListener(session, userId) {
		if (!this._session)
			return false;

		const userName = this.users.callee.name;
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

		this.$muteUnmuteButton.disabled = false;
		this.$switchCameraButton.disabled = false;
		this.onDevicesChangeListener();
		this._prepareVideoElement(remoteStreamSelector);
	};

	acceptCall() {
		const extension = {};
		const { callType } = this._session;
		this.addStreamElements([this.users.callee]);
		this.hideIncomingCallModal();

		const mediaOptions = { ...this.mediaParams };
		this._session.getUserMedia(mediaOptions).then((stream) => {
			this._session.accept(extension);
			this.setActiveDeviceId(stream);
			this._prepareVideoElement('localStream');
			var e = ui.q('#videochat');
			e.classList.remove('hidden');
			e.style.background = 'transparent';
			document.querySelector('body>main').style.display = 'none';
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
		this.init();
		var e = ui.q('#videochat');
		e.classList.remove('hidden');
		e.style.background = 'transparent';
		ui.q('body>main').style.display = 'none';
		this.$dialing.play();
		this.addStreamElements([this.users.callee]);
		this._session = ConnectyCube.videochat.createNewSession([this.users.callee.id], 1, {});

		const mediaOptions = { ...this.mediaParams };

		this._session.getUserMedia(mediaOptions).then((stream) => {
			this._session.call({});
			this.setActiveDeviceId(stream);
			this._prepareVideoElement('localStream');
		});

		// send push notification when calling
		const currentUserName = this.users.callee.name;
		const params = {
			message: `Incoming call from ${currentUserName}`,
			ios_voip: 1,
			initiatorId: this._session.initiatorID,
			opponentsIds: this.users.callee.id,
			handle: currentUserName,
			uuid: this._session.ID,
			callType: 'video'
		};

		const payload = JSON.stringify(params);
		const pushParameters = {
			notification_type: 'push',
			user: { ids: this.users.callee.id },
			message: ConnectyCube.pushnotifications.base64Encode(payload),
		};

		ConnectyCube.pushnotifications.events.create(pushParameters)
			.then(result => {
				console.log('[sendPushNotification] Ok');
			}).catch(error => {
				console.warn('[sendPushNotification] Error', error);
			});
	};

	stopCall(userId) {
		const $callScreen = ui.q('#call');
		const $videochatScreen = ui.q('#videochat');
		const $muteButton = ui.q('#videochat-mute-unmute');
		const $videochatStreams = ui.q('#videochat-streams');
		$videochatScreen.style.background = '';
		ui.q('body>main').style.display = '';

		if (userId) {
			ui.q(`#videochat-stream-container-${userId}`).remove();
			const $streamContainers = ui.qa('.videochat-stream-container');
			if ($streamContainers.length < 2)
				this.stopCall();
			else if ($streamContainers.length === 2)
				$videochatStreams.classList.value = '';
			else if ($streamContainers.length === 3)
				$videochatStreams.classList.value = 'grid-2-1';
		} else if (this._session) {
			// stop tracks
			const video = ui.q('#localStream');
			for (const track of video.srcObject.getTracks())
				track.stop();
			this._session.stop({});
			ConnectyCube.videochat.clearSession(this._session.ID);
			this.$dialing.pause();
			this.$calling.pause();
			this.$endCall.play();
			this.$muteUnmuteButton.disabled = true;
			this.$switchCameraButton.disabled = true;
			this._session = null;
			this.mediaDevicesIds = [];
			this.activeDeviceId = null;
			this.isAudioMuted = false;
			$videochatStreams.innerHTML = '';
			$videochatStreams.classList.value = '';
			$callScreen.classList.remove('hidden');
			$videochatScreen.classList.add('hidden');
			$muteButton.classList.remove('muted');

			if (!global.isBrowser() && global.getOS() == 'ios')
				$videochatScreen.style.background = '#000000';
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

		ConnectyCube.videochat
			.getMediaDevices('videoinput')
			.then((mediaDevices) => {
				this.mediaDevicesIds = mediaDevices?.map(({ deviceId }) => deviceId);

				if (this.mediaDevicesIds.length < 2) {
					this.$switchCameraButton.disabled = true;

					if (this.activeDeviceId &&
						this.mediaDevicesIds?.[0] !== this.activeDeviceId
					) {
						this.switchCamera();
					}
				} else {
					this.$switchCameraButton.disabled = false;
				}
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
		const $muteButton = ui.q('#videochat-mute-unmute');

		if (this.isAudioMuted) {
			this._session.unmute('audio');
			this.isAudioMuted = false;
			$muteButton.classList.remove('muted');
		} else {
			this._session.mute('audio');
			this.isAudioMuted = true;
			$muteButton.classList.add('muted');
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

		setTimeout(function () {
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
		const $initiator = ui.q('#call-modal-initiator');

		if (className === 'hide') {
			$initiator.innerHTML = '';
			this.$modal.classList.remove('show');
			this.$calling.pause();
		} else {
			ui.q('videoCall #call').classList.remove('hidden');
			ui.q('videoCall #videochat').classList.add('hidden');
			ui.q('videoCall').style.display = 'block';
			$initiator.innerHTML = this.users.callee.name;
			this.$modal.classList.add('show');
			this.$calling.play();
		}
	}

	_prepareVideoElement(videoElement) {
		const $video = ui.q('#' + videoElement);

		$video.style.visibility = 'visible';

		if (!global.isBrowser() && global.getOS() == 'ios') {
			$video.style.backgroundColor = '';
			$video.style.zIndex = '-1';
		}
	}

	initCall(data) {
		if (data) {
			this.users = {
				isAdmin: data.isAdmin,
				timeslot: data.timeslot,
				caller: {
					name: data.callerName
				},
				callee: {
					name: data.calleeName
				}
			};
			this.init();
			this.$callScreen = ui.q('#call');
			ui.q('#call-start-video').addEventListener('click', () => this.startVideoCall());
			ui.q('#videochat-stop-call').addEventListener('click', () => this.stopCall());
			ui.q('#videochat-leave').addEventListener('click', () => this.rejectCall());
			ui.q('#videochat-mute-unmute').addEventListener('click', () => this.setAudioMute());
			ui.q('#videochat-switch-camera').addEventListener('click', () => this.switchVideo());
			if (data.openUI)
				this.startVideoCall();
		} else
			this.startVideoCall();
	}
	disconnect() {
		ConnectyCube.chat.disconnect();
		ConnectyCube.destroySession();
	}
	logout() {
		this.$callScreen.classList.add('hidden');
	}
}

export default new Video();