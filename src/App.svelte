<script>
	import keys from "./lib/layouts/qwerty/standard";
	import Keyboard from "./lib/Keyboard.svelte";
	import { shortcut } from "./lib/shortcut";

	const keyClass = {};
	let hangulCharacter = "";

	let pressed = undefined;

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
	};

	let characters = Object.keys(hangulValue);

	let keyArray = [];

	characters.forEach((m) => keyArray.push("Key" + m.toUpperCase()));

	$: console.log(keys[0]);
	$: hangulCharacter = String(
		keys[0].length == 1 ? hangulValue[keys[0]] || "" : ""
	);

	const handleKeypress = (m) => {
		const k = m[m.length - 1].toLowerCase();
		keys[0] = k;
		pressed = k || pressed;
	};

	let showLayout = false;

	const toggleView = () => {
		showLayout = !showLayout;
	};
</script>

<nav>
	
	<h1>Hangul Keyboard</h1>
	<span> Learn the layout. &emsp; </span>
	<button on:click={toggleView}>
		{#if showLayout}
			Hide
		{:else}
			View key map
		{/if}
	</button>
	<p>
		key pressed: <strong
			>{typeof keys[0] == "string" ? keys[0] : ""}</strong
		>
	

</p>
</nav>

<div class="keymap">
	{#if showLayout}
		<center>
			<img src="./keyboard.png" />
		</center>
	{/if}
	
</div>

<main
	use:shortcut={{ code: keyArray, callback: (m) => handleKeypress(m) }}
	hidden={false}
>
	<div class="info ">
		<center>

		<p class="keyboard ">
			<Keyboard on:keydown={({ detail }) => (keys[0] = detail)} bind:pressed />
		</p>
			<div class="hangul">
				{hangulCharacter}
			</div>
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

	h1,
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
		overflow:visible;
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
