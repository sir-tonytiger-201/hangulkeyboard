<script>
	import keys from "./lib/layouts/qwerty/standard";
	import Keyboard from "./lib/Keyboard.svelte";
	import { shortcut } from "./lib/shortcut";
	import { fly, fade, slide, scale } from "svelte/transition";
	import { flip } from "svelte/animate";
	import {
		bounceInOut,
		circIn,
		circOut,
		cubicIn,
		cubicOut,
		quadIn,
		quintIn,
		quintOut,
		sineIn,
		sineInOut,
	} from "svelte/easing";
	const keyClass = {};
	let hangulCharacter = "";

	export let pressed = undefined;

	let slideshow = false;
	let slideIndex = 0;

	let currentChar = "";
	export let timestamp = Date.now();
	export let shifted;
	let pressedKey = " ";

	export const hangulValue = {
		q: "ㅂ",
		w: "ㅈ",
		e: "ㄷ",
		r: "ㄱ",
		t: "ㅅ",
		y: "ㅛ",
		u: "ㅕ",
		i: "ㅑ",
		o: "ㅐ",
		p: "ㅔ",
		a: "ㅁ",
		s: "ㄴ",
		d: "ㅇ",
		f: "ㄹ",
		g: "ㅎ",
		h: "ㅗ",
		j: "ㅓ",
		k: "ㅏ",
		l: "ㅣ",
		z: "ㅋ",
		x: "ㅌ",
		c: "ㅊ",
		v: "ㅍ",
		b: "ㅠ",
		n: "ㅜ",
		m: "ㅡ",
		Q: "ㅃ",
		W: "ㅉ",
		E: "ㄸ",
		R: "ㄲ",
		T: "ㅆ",
		O: "ㅒ",
		P: "ㅖ",
	};

	const numberOfCharacters = Object.keys(hangulValue).length;
	const characters = Object.keys(hangulValue);
	$: console.log("numberOfCharacters", numberOfCharacters);

	let keyArray = [];

	characters.forEach((m) => keyArray.push("Key" + m.toUpperCase()));

	// Will return a number from 1 to m.
	const randomNumber = (m) => {
		const result = Math.floor(Math.random() * m + 1);
		return result;
	};

	let faceIdx = 0;

	const funnyface = () => {
		const faces = ["😜", "😁", "😛", "😊"];
		const currentFace = faces[faceIdx];
		faceIdx += 1;
		if (faceIdx == faces.length) faceIdx = 0;
		return currentFace;
	};

	$: hangulCharacter = String(
		pressedKey.length == 1
			? shifted
				? hangulValue[pressedKey.toUpperCase()] || undefined
				: hangulValue[pressedKey] || ""
			: ""
	);

	const handleKeypress = (m) => {
		timestamp = Date.now();
		if (slideshow) toggleSlideshow();
		//const k =  shifted ? m[m.length - 1] :  m[m.length - 1].toLowerCase();
		const k = m[m.length - 1].toLowerCase();
		pressed = k;
		pressedKey = k;
	};

	let showLayout = false;

	const showkey = (i) => {
		timestamp = Date.now();
		console.log(i);
		const keycode = "Key" + Object.keys(hangulValue)[i].toUpperCase();
		const k = keycode[keycode.length - 1].toLowerCase();
		pressed = k;
		pressedKey = k;
	};

	const toggleView = () => {
		showLayout = !showLayout;
	};
	let clearTimer;
	const toggleSlideshow = () => {
		slideshow = !slideshow;
		console.log("randomize", randomize);
		if (slideshow) {
			slideIndex = 0;

			clearTimer = setInterval(() => {
				if (!randomize) {
					showkey(slideIndex++);
				} else {
					slideIndex = Math.floor(Math.random() * numberOfCharacters);
					showkey(slideIndex);
				}
				if (slideIndex > Object.keys(hangulValue).length - 1)
					slideIndex = 0;
			}, 1500);
		} else {
			clearInterval(clearTimer);
		}
	};

	//$: currentChar = hangulValue[slideIndex];
	//$: console.log(currentChar)

	import { tweened } from "svelte/motion";

	let colorIndex = 0;
	let keycolorIndex = 0;
	let keybgcolorIndex = 0;
	let boxshadowIndex = 0;
	let boxsizeIndex = 0;
	let randomize = true;

	const colors = [
		"fa0024",
		"efff11",
		"00ff00",
		"072e5b",
		"f9be8a",
		"f36729",
		"59e8eb",
		"3548b7",
	]; // red, yellow, green, blue
	const keycolors = [];
	colors.forEach((m) => keycolors.unshift(m));

	const boxsizes = [2, 7];
	const keybgcolors = ["023e8a", "9CAEA9", "2B2D42", "6A4C93", "6C757D"];
	const boxshadowcolors = [
		"E500A4",
		"f5a218",
		"228abf",
		"3dfa40",
		"e893e9",
		"0186cc",
		"c51e85",
	];

	//const colors = ['ff0000', '00ff00', '0000ff', '072e5b']; // red, green, blue

	// This converts a decimal number to a two-character hex number.
	const decimalToHex = (decimal) =>
		Math.round(decimal).toString(16).padStart(2, "0");

	// This cycles through the indexes of the colors array.

	const goToNextColor = () => {
		colorIndex = (colorIndex + 1) % colors.length;
	};
	const goToNextKeyColor = () => {
		keycolorIndex = (keycolorIndex + 1) % keycolors.length;
	};
	const goToNextKeybgColor = () => {
		keybgcolorIndex = (keybgcolorIndex + 1) % keybgcolors.length;
	};
	const goToNextBoxShadow = () => {
		boxshadowIndex = (boxshadowIndex + 1) % boxshadowcolors.length;
	};
	const goToNextBoxSize = () => {
		boxsizeIndex = (boxsizeIndex + 1) % boxsizes.length;
	};

	// This extracts two hex characters from an "rrggbb" color string
	// and returns the value as a number between 0 and 255.
	const getColor = (hex, index) =>
		parseInt(hex.substring(index, index + 2), 16);

	// This gets an array of red, green, and blue values in the range 0 to 255
	// from an "rrggbb" hex color string.
	const getRGBs = (hex) => [
		getColor(hex, 0),
		getColor(hex, 2),
		getColor(hex, 4),
	];

	// This computes a value that is t% of the way from
	// start to start + delta where t is a number between 0 and 1.
	const scaledValue = (start, delta, t) => start + delta * t;

	// This is an interpolate function used by the tweened function.
	function rgbInterpolate(fromColor, toColor) {
		const [fromRed, fromGreen, fromBlue] = getRGBs(fromColor);
		const [toRed, toGreen, toBlue] = getRGBs(toColor);
		const deltaRed = toRed - fromRed;
		const deltaGreen = toGreen - fromGreen;
		const deltaBlue = toBlue - fromBlue;

		return (t) => {
			const red = scaledValue(fromRed, deltaRed, t);
			const green = scaledValue(fromGreen, deltaGreen, t);
			const blue = scaledValue(fromBlue, deltaBlue, t);
			return decimalToHex(red) + decimalToHex(green) + decimalToHex(blue);
		};
	}

	const boxsize = tweened(boxsizes[boxsizeIndex], {
		duration: 1000,
		easing: sineIn,
	});

	// Create a tweened store that holds an "rrggbb" hex color.
	const color = tweened(colors[colorIndex], {
		duration: 2000,
		easing: sineIn,
		interpolate: rgbInterpolate,
	});

	const keycolor = tweened(keycolors[keycolorIndex], {
		duration: 1000,
		easing: circIn,
		interpolate: rgbInterpolate,
	});

	const keybgcolor = tweened(keybgcolors[keybgcolorIndex], {
		duration: 3000,
		easing: quadIn,
		interpolate: rgbInterpolate,
	});

	const boxshadowcolor = tweened(boxshadowcolors[boxshadowIndex], {
		duration: 1000,
		interpolate: rgbInterpolate,
	});

	// Trigger tweening if colorIndex changes.
	$: color.set(colors[colorIndex]);
	$: keycolor.set(keycolors[keycolorIndex]);
	$: keybgcolor.set(keybgcolors[keybgcolorIndex]);
	$: boxshadowcolor.set(boxshadowcolors[boxshadowIndex]);
	$: boxsize.set(boxsizes[boxsizeIndex]);
	//$: console.log("color", $color, "keycolor", $keycolor)

	let prevColor = $color;

	setInterval(() => {
		goToNextColor();
		clearInterval();
	}, 2000);

	setInterval(() => {
		goToNextKeyColor();
		clearInterval();
	}, 1000);

	setInterval(() => {
		goToNextKeybgColor();
		clearInterval();
		goToNextBoxSize();
	}, 3000);

	setInterval(() => {
		goToNextBoxShadow();
		clearInterval();
	}, 1000);

	import { elasticOut } from "svelte/easing";

	let visible = true;

	function spin(node, { duration }) {
		return {
			duration,
			css: (t) => {
				const eased = elasticOut(t);

				return `
					transform: scale(${eased}) rotate(${eased * 720}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
			},
		};
	}
	import Switch from "./Switch.svelte";
	import SoundTest from "./SoundTest.svelte";

	let switchValue;
	let sliderValue;
	let multiValue;

	let audio = {};
	let volume = 0.5;

	$: if (pressedKey && audio.src) {
		if (characters.find((m) => m == pressedKey))
			//audio.src =`sounds/powerup_4_reverb.wav`;
			audio.src = `sounds/Spin.wav`;
		else audio.src = `sounds/powerup (${randomNumber(50)}).wav`;

		if(volume != undefined)
		audio.volume = volume;
		audio.play();
	}

	
	let sound = true;
	let savedvolume = volume;
	$: if (sound == false) {
		savedvolume = volume;
		volume = 0;
	} else {
		volume = savedvolume;
	}

	$: if (volume != undefined) audio.volume = volume;
</script>

<nav>
	<audio src="" bind:this={audio} />
	<div hidden>
		<SoundTest {randomNumber} />
	</div>
	<span
		><h1>한글 Keyboard</h1>
		<small><i>By sir-tonytiger-201</i></small></span
	>
	<br />

	<table>
		<tr>
			<td>
				<span> Learn the layout. &emsp; </span>
			</td>
			<td>
				<button on:click={toggleView}>
					{#if showLayout}
						Hide
					{:else}
						View key map
					{/if}
				</button>
			</td>
			<td>
				<button on:click={toggleSlideshow}>
					{#if slideshow}
						Stop
					{:else}
						Start
					{/if}
					slideshow
				</button>
			</td>
			<td style="font-size:small;">
				<Switch
					bind:checked={randomize}
					label="Randomize"
					design="inner"
				/>
			</td>
			<td style="font-size:small;">
				<Switch bind:checked={sound} label="Sound" design="inner" />
			</td>
		</tr>
	</table>

	{#if showLayout}
		<center>
			<img src="./keyboard.png" />
		</center>
	{/if}
</nav>

<main
	use:shortcut={{ code: keyArray, callback: (m) => handleKeypress(m) }}
	hidden={false}
>
	<div class="info ">
		<center>
			<p class="keyboard ">
				<Keyboard
					on:keydown={({ detail }) => {
						pressedKey = detail;
						if (slideshow) toggleSlideshow();
					}}
					bind:pressed
					bind:shifted
					bind:timestamp
					bind:keycolor={$keycolor}
					bind:keybackground={$keybgcolor}
					bind:boxshadowcolor={$boxshadowcolor}
					bind:boxsize={$boxsize}
				/>
			</p>
			{#key timestamp}
				<div
					class="hangul"
					style="color: #{$color}"
					in:scale={{ easing: cubicOut }}
				>
					{#if hangulCharacter}
						<div
							in:fly={{
								easing: cubicIn,
								start: 0.5,
								opacity: 0.5,
								x: 0,
								y: -320,
							}}
						>
							<div in:spin={{ duration: 1200 }}>
								{hangulCharacter == "undefined"
									? funnyface()
									: hangulCharacter}
							</div>
						</div>
					{/if}
				</div>
			{/key}
		</center>
	</div>
</main>

<style>
	main,
	nav {
		border-collapse: collapse;
	}

	nav {
		display: flexbox;
	}

	h3,
	p,
	.keyboard,
	.keymap {
		margin: 0;
		max-width: 40rem;
		min-width: 20rem;
	}

	.keymap {
	}

	h1,
	span {
		display: inline-block;
	}

	.keyboard {
	}

	.hangul {
		font-size: 21rem;
		font-weight: bold;
		font-family: Noto Serif CJK SC, Batang;
		margin: 0px;
		padding: 0rem 0;
		color: #fa0024;
		text-shadow: 20px 40px 12px #b64d76;
		border-radius: 0;
		display: inline-flex;
		overflow: visible;
		text-align: start;
		align-content: flex-start;
	}

	.showhangul {
		margin: 0 0;
		padding: 0rem 0;
		display: inline-flexbox;
	}

	img {
		max-width: 40rem;
	}

	.info > * {
		padding: 0;
	}

	.flexarea {
		display: inline-flexbox;
		overflow: visible;
	}

	:global(*) {
		margin: 0 0;
		padding: 0rem 0;
		padding: 0;
		border-collapse: collapse;
		border-radius: 0;
	}

	td {
		padding: 0 0 0 1rem;
	}

	button {
		border-radius: 1em;
		padding: 0.5em 1em;
		font-size: small;
	}

	:global(.key.clicked) {
		--background: pink;
	}
</style>
