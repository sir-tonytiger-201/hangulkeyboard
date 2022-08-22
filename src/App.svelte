<script>
	import keys from "./lib/layouts/qwerty/standard";
	import Keyboard from "./lib/Keyboard.svelte";

	const keyClass = {};
	let hangulCharacter = "";

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

	$: console.log(keys[0]);
	$: console.log(typeof keys[0]);
	$: hangulCharacter = String(
		keys[0].length == 1 ? hangulValue[keys[0]] || "" : ""
	);
</script>

<main>
	<h1>Hangul Keyboard</h1>
	<p>
		This can be used like flashcards to learn the hangul
		keyboard layout.
	</p>

	<div class="info">
		
		<div class="keyboard">
			<Keyboard on:keydown={({ detail }) => (keys[0] = detail)} />
		</div>
		<p>
			key pressed: <strong
				>{typeof keys[0] == "string" ? keys[0] : ""}</strong
			>
		</p>
		<center>
			<p>Hangul character:</p>
			<p class="hangul">
				{hangulCharacter}
			</p>
		</center>
	</div>
</main>

<style>
	main {
		border-collapse: collapse;
	}

	h1,
	h3,
	p,
	.keyboard {
		margin: 0 auto;
		max-width: 30rem;
		padding: 1rem 0;
	}

	.hangul {
		font-size: 21rem;
		font-weight: bold;
		font-family: Batang;
		margin: 0 0;
		max-width: 40rem;
		padding: 0rem 0;
	}

	.showhangul {
		margin: 0 0;
		max-width: 0rem;
		padding: 0rem 0;
	}

	.info > * {
		padding: 0;
	}

	:global(.key.clicked) {
		--background: pink;
	}
</style>
