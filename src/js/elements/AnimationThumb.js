https://codepen.io/dzuncoi/pen/pbQojj
<div class="icon-wrapper">
	<span class="icon"><i class="fa fa-thumbs-up"></i></span>
	<div class="border"><span></span></div>
	<div class="spark">
		<span></span><span></span><span></span><span></span>
		<span></span><span></span><span></span><span></span>
		<span></span><span></span><span></span><span></span>
		<span></span><span></span><span></span><span></span>
		<span></span><span></span><span></span><span></span>
	</div>
</div>
.icon-wrapper {
	font-size: 40px;
	text-align: center;
	margin-top: 70px;
	position: relative;
	cursor: pointer;
	display: inline-block;
	.icon {
		color: #90A4AE;
		i {
			transform: scale(1);
		}
	}
	&.anim .icon {
		color: rgb(152, 138, 222);
		i {
			animation: icon-animation cubic-bezier(0.165, 0.840, 0.440, 1.000) 1.2s;
		}
	}
	.border {
		position: absolute;
		top: 50%;
		left: 50%;
		width: 80px;
		height: 80px;
		margin-left: -40px;
		margin-top: -40px;
		z-index: 0;
		transition: all ease .5s;
		transform-origin: 0px 0px;
		span {
			position: absolute;
			left: 0;
			width: 100%;
			height: 100%;
			border-radius: 50%;
			border: 1px solid rgb(152, 138, 222);
			transform: scale(0.1); 
		}
	}
	&.anim .border span {
		animation: border-animation cubic-bezier(0.075, 0.820, 0.165, 1.000) 1s;
		animation-fill-mode: forwards;
	}
	.satellite {
		position: absolute;
		left: 50%; top: 50%;
		width: 80px;
		height: 80px;
		margin-left: -40px;
		margin-top: -40px;
		span {
			position: absolute;
			width: $satellite-size;
			height: $satellite-size;
			border-radius: 50%;
			margin-top: -$satellite-size/2;
			margin-left: -$satellite-size/2;
			transition: all ease .5s;
			transform-origin: center 0px;
			transform: translate(0,0) scale(0);
			animation-timing-function: cubic-bezier(0.165, 0.840, 0.440, 1.000);
			animation-duration: 1.5s;
			animation-fill-mode: forwards;
		}
	}
	&.anim .satellite span {
		&:nth-child(1) {
			top: 0; left: 50%;
			background: rgb(152, 138, 222);
			animation-name: satellite-top;
		}
		&:nth-child(2) {
			top: 25%; left: 100%;
			background: rgb(222, 138, 160);
			animation-name: satellite-top-right;
		}
		&:nth-child(3) {
			top: 75%; left: 100%;
			background: rgb(138, 174, 222);
			animation-name: satellite-bottom-right;
		}
		&:nth-child(4) {
			top: 100%; left: 50%;
			background: rgb(138, 222, 173);
			animation-name: satellite-bottom;
		}
		&:nth-child(5) {
			top: 75%; left: 0;
			background: rgb(222, 197, 138);
			animation-name: satellite-bottom-left;
		}
		&:nth-child(6) {
			top: 25%; left: 0;
			background: rgb(138, 209, 222);
			animation-name: satellite-top-left;
		}
	}
}

@keyframes border-animation {
	0% { 
		border-width: 20px;
		opacity: 1;
	}
	40% {
		opacity: 1;
	}
	100% { 
		transform: scale(1.2); 
		border-width: 0px;
		opacity: 0;
	}
}

@keyframes satellite-top {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(0, -$satellite-move);
	}
}

@keyframes satellite-bottom {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(0, $satellite-move);
	}
}

@keyframes satellite-top-right {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(2*$satellite-move/2.236,- $satellite-move/2.236);
	}
}

@keyframes satellite-bottom-right {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(2*$satellite-move/2.236, $satellite-move/2.236);
	}
}

@keyframes satellite-bottom-left {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(-2*$satellite-move/2.236, $satellite-move/2.236);
	}
}

@keyframes satellite-top-left {
	0% {
		transform: scale(1) translate(0,0);
	}
	100% {
		transform: scale(0) translate(-2*$satellite-move/2.236,- $satellite-move/2.236);
	}
}

@keyframes icon-animation {
	0% {
		transform: scale(0);
	}
	100% {
		transform: scale(1);
	}
}

@mixin on-circle($item-count, $circle-size, $item-width, $item-height) {
	position: relative;
	width: $circle-size;
	height: $circle-size;
	border-radius: 50%;
	span {
		position: absolute;
		width: $item-width;
		height: $item-height;
		top: 50%; left: 50%;
		margin-top: -$item-height/2;
		margin-left: -$item-width/2;
	}
	$angle: (360/$item-count);
	$inc: 0;
	@for $i from 1 through $item-count {
		span:nth-of-type(#{$i}) {
			transform: rotate($inc*-1deg) translate($circle-size/2) scale(0);
		}
		$inc: $inc + $angle;
	}
}

$spark-width: 25px;
$spark-height: 4px;
$item-count: 20;
$circle-size: 80px;
.icon-wrapper .spark {
	@include on-circle($item-count, $circle-size, $spark-width, $spark-height);
	position: absolute;
	left: 50%; top: 50%;
	margin-left: -40px;
	margin-top: -40px;
	span {
		background: rgb(152, 138, 222);
		border-radius: $spark-height/2;
	}
}
.icon-wrapper.anim {
	.spark {
		$inc:0;
		$angle: 360/$item-count;
		@for $i from 1 through $item-count {
			span:nth-of-type(#{$i}) {
				animation: spark-animation-#{$i} cubic-bezier(0.075, 0.820, 0.165, 1.000) 1.5s;
			}
			$inc: $inc + $angle;
		}
	}
}

$angle: (360/$item-count);
$inc: 0;
@for $i from 1 through $item-count {
	@keyframes spark-animation-#{$i} {
		0% {
			opacity: 1;
			transform: rotate($inc*-1deg) translate($circle-size/2) scale(1);
		}
		80% {
			opacity: 1;
		}
		100% {
			opacity: 0;
			transform: rotate($inc*-1deg) translate($circle-size*1.2) scale(0);
		}
	}
	$inc: $inc + $angle;
}

.on('click', function() {
	var _this = $iconWrapper2;
	if (_this.hasClass('anim')) _this.removeClass('anim');
	else {
		_this.addClass('anim');
		_this.css('pointer-events', 'none');
		setTimeout(function() {
			_this.css('pointer-events', '');
		}, 1200);
	}
})
