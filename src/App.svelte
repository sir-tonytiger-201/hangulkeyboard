<script>
	import keys from "./lib/layouts/qwerty/standard";
	import Keyboard from "./lib/Keyboard.svelte";
	import { shortcut } from "./lib/shortcut";
	import { fly, fade, slide, scale } from "svelte/transition";
	import { flip } from "svelte/animate";
	import { cubicIn } from "svelte/easing";
	const keyClass = {};
	let hangulCharacter = "";

	export let pressed = undefined;

	let slideshow = false;
	let slideIndex = 0;

	let currentChar = "";

	export let shifted;

	export const hangulValue = {
		"NULL": "",
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

	let characters = Object.keys(hangulValue);

	let keyArray = [];

	characters.forEach((m) => keyArray.push("Key" + m.toUpperCase()));

	$: if (slideIndex) {
		console.dir(keys[slideIndex]?.value);
	}
	
	$: hangulCharacter = String(
		keys[0].length == 1 ? hangulValue[keys[0]] || "" : ""
	);

	const handleKeypress = (m) => {
			
		const k =  shifted ? m[m.length - 1] :  m[m.length - 1].toLowerCase();
		pressed = k;
		console.log("pressed", pressed, k)
		console.log(k, shifted)
		keys[0] = k;
	};

	let showLayout = false;

	const toggleView = () => {
		showLayout = !showLayout;
	};
	const toggleSlideshow = () => {
		slideshow = !slideshow;
		if (slideshow) slideIndex = 0;
	};

	//$: currentChar = hangulValue[slideIndex];
	//$: console.log(currentChar)
</script>

<nav>
	<span
		><h1>Hangul Keyboard</h1>
		<small><i>By sir-tonytiger-201</i></small></span
	>
	<br />
	<span> Learn the layout. &emsp; </span>
	<button on:click={toggleView}>
		{#if showLayout}
			Hide
		{:else}
			View key map
		{/if}
	</button>
	<button on:click={toggleSlideshow}>Slidehow</button>
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
					on:keydown={({ detail }) => (keys[0] = detail)}
					bind:pressed
					bind:shifted
				/>
			</p>
			{#key hangulCharacter}
				<div class="hangul">
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
							<div in:scale>
								{hangulCharacter}
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

	:global(.key.clicked) {
		--background: pink;
	}
</style>