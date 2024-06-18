{
	"type": "locationMarketing",
	"prolog": "Lieber Sky Kunde,<br><br>unsere Community ist auf der suche nach den besten <b>Live-Sport-Locations</b> in ihrer Umgebung. Unsere App listet auch Deine Location.<br><br>Möchtest Du <b>mehr Gäste?</b><br><br>Du kannst jederzeit den Dialog schließen, Dich umschauen und durch klicken des Logos diesen Dialod wieder öffnen.",
	"epilog": "Lieben Dank für Deine Teilnahme, wir melden uns gegenbenenfalls bei Dir.",
	"questions": [
		{ 
			"question": "Stimmt der Name Deiner Location?",
			"textField": "text",
			"default": "marketing.data.name"
		},
		{ 
			"question": "Stimmt die Adresse Deiner Location?",
			"textField": "textarea",
			"default": "marketing.data.address"
		},
		{
			"question": "Stimmt die Telefonnummer Deiner Location?",
			"textField": "text",
			"default": "marketing.data.telephone"
		},
		{
			"question": "Stimmt die URL Deiner Location?",
			"textField": "text",
			"default": "marketing.data.url"
		},
		{
			"question": "Hier kannst Du Deine Location beschreiben:",
			"textField": "textarea",
			"default": "marketing.data.description"
		},
		{
			"question": "Welche Attribute treffen auf Dich zu?",
			"default": "marketing.data.skills",
			"answers": [
				{
					"answer": "Afghanisch",
					"key": "2.01"
				},
				{
					"answer": "Bayerisch",
					"key": "2.02"
				},
				{
					"answer": "Bier",
					"key": "2.03"
				},
				{
					"answer": "Burger",
					"key": "2.04"
				},
				{
					"answer": "Chinesisch",
					"key": "2.05"
				},
				{
					"answer": "Cocktails",
					"key": "2.29"
				},
				{
					"answer": "Dessert",
					"key": "2.06"
				},
				{
					"answer": "Deutsch",
					"key": "2.07"
				},
				{
					"answer": "Fisch",
					"key": "2.08"
				},
				{
					"answer": "Fleisch",
					"key": "2.09"
				},
				{
					"answer": "Französisch",
					"key": "2.10"
				},
				{
					"answer": "Grill",
					"key": "2.11"
				},
				{
					"answer": "Italienisch",
					"key": "2.12"
				},
				{
					"answer": "Japanisch",
					"key": "2.13"
				},
				{
					"answer": "Kaffee",
					"key": "2.14"
				},
				{
					"answer": "Kuchen",
					"key": "2.15"
				},
				{
					"answer": "Libanesisch",
					"key": "2.16"
				},
				{
					"answer": "Pasta",
					"key": "2.17"
				},
				{
					"answer": "Persisch",
					"key": "2.18"
				},
				{
					"answer": "Pizza",
					"key": "2.19"
				},
				{
					"answer": "Spanisch",
					"key": "2.20"
				},
				{
					"answer": "Spirituosen",
					"key": "2.21"
				},
				{
					"answer": "Sportsbar",
					"key": "x.1"
				},
				{
					"answer": "Thai",
					"key": "2.22"
				},
				{
					"answer": "Vegan",
					"key": "2.23"
				},
				{
					"answer": "Vegetarisch",
					"key": "2.24"
				},
				{
					"answer": "Vietnamesisch",
					"key": "2.25"
				},
				{
					"answer": "Wein",
					"key": "2.26"
				},
				{
					"answer": "Whisky",
					"key": "2.27"
				},
				{
					"answer": "Zigarren",
					"key": "2.28"
				}
		},
		{
			"question": "Möchtest Du Marketing-Aufkleber als Aushang für Gäste und/oder zum platzieren an prominanter Stelle, z.B. Sanitäranlagen, Eingang, etc.?",
			"answers": [
				{
					"answer": "Ja, 20"
				},
				{
					"answer": "Ja, 50"
				},
				{
					"answer": "Nein Danke"
				}
			]
		},
		{
			"question": "Möchtest Du jetzt einen Zugang anlegen?",
			"answers": [
				{
					"answer":"Ja"
				},
				{
					"answer": "Nein"
				}
			]
		},
		{
			"question": "Bist Du an einer engeren Zusammenarbeit interessiert, um z.B. um Events in Deiner Location zu promoten?",
			"answers": [
				{
					"answer": "Ja"
				},
				{
					"answer": "Nein"
				}
			]
		},
		{
			"question": "Hast Du weitere Anmerkungen/Anregungen für uns?",
			"textField": "textarea"
		}
	]
}


https://codepen.io/dzuncoi/pen/pbQojj
https://www.sliderrevolution.com/resources/css-animation-examples/
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
