<script>
    let audio;
    export let randomNumber;

    const sound = [];
    for (let index = 0; index < 50; index++) {
        sound.push(`sounds/powerup (${index + 1}).wav`);
    }

</script>
<audio src="" bind:this={audio}></audio>
{#each sound as f, i}

<button on:click={() => { audio.src = f; audio.play() }}>sound {i+1}</button>
{/each}

<style>
</style>