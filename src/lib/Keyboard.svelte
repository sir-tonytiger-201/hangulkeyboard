<script>
  import { createEventDispatcher } from "svelte";

  import qwertyStandard from "./layouts/qwerty/standard";
  import qwertyCrossword from "./layouts/qwerty/crossword.js";
  import qwertyWordle from "./layouts/qwerty/wordle.js";

  import azertyStandard from "./layouts/azerty/standard.js";
  import azertyCrossword from "./layouts/azerty/crossword.js";
  import azertyWordle from "./layouts/azerty/wordle.js";

  import backspaceSVG from "./svg/backspace.js";
  import enterSVG from "./svg/enter.js";

  // exposed props
  export let custom;
  export let localizationLayout = "qwerty";
  export let layout = "standard";
  export let noSwap = [];
  export let keyClass = {};
  keyClass[";"] = "half";
  export let timestamp;
  export let keycolor;
  export let keybackground;
  export let boxshadowcolor;
  export let boxsize;
  
  
  //$: boxshadow=`5px 10px 2em ${boxshadowcolor}`;
  console.log(boxshadowcolor);


  // vars
  let page = 0;
  export let shifted = false;
  let active = undefined;
  


  export let pressed;

  // Use later
  let upperCase = false;

  const layouts = {
    qwerty: {
      standard: qwertyStandard,
      crossword: qwertyCrossword,
      wordle: qwertyWordle,
    },
    azerty: {
      standard: azertyStandard,
      crossword: azertyCrossword,
      wordle: azertyWordle,
    },
  };
  const dispatch = createEventDispatcher();
  const alphabet = "abcdefghijklmnopqrstuvwxyz";
  const swaps = {
    Page0: "cap",
    Page1: "?123",
    Space: " ",
    Shift: "cap",
    Enter: enterSVG,
    Backspace: backspaceSVG,
  };

  // functions
  const unique = (arr) => [...new Set(arr)];

  const onKeyStart = (event, value) => {
    timestamp = Date.now();
    event.preventDefault();
    //console.log(value)
    active = value;

    if (value != undefined && value.includes("Page")) {
      page = +value?.substr(-1);
    } else if (value === "Shift") {
      shifted = !shifted;
    } else {
      let output = value; //|| "";
      if (shifted && alphabet.includes(value))
        output = value.toUpperCase() || "";
      dispatch("keydown", output);
    }
    event.stopPropagation();
    pressed = undefined;

    return false;
  };

  const onKeyEnd = (value) => {
    setTimeout(() => {
      pressed = active;
      if (value === active) {
        //  active = undefined;
        pressed = active;
      }
    }, 50);
  };

  // reactive vars
  $: if (!pressed) {
    setTimeout(() => {
      {
        pressed = active;
      }
    }, 100);
  } else {
    active = pressed;
  }

  $: rawData = custom || layouts[localizationLayout][layout] || standard;

  $: data = rawData.map((d) => {
    //console.log("foo", d)
    let display = d.display;
    const s = swaps[d.value];
    const shouldSwap = s && !noSwap.includes(d.value) && !d.noSwap;
    //console.log("bar")
    if (shouldSwap) display = s;
    if (!display && d.value)
      display = shifted
        ? d.value.toUpperCase() || ""
        : d.value.toLowerCase() || "";
    if (d.value === "Shift")
      display = shifted ? s || "" : s.toUpperCase() || "";
    return {
      ...d,
      display,
    };
  });

  $: page0 = data.filter((d) => !d.page);
  $: page1 = data.filter((d) => d.page);

  $: rows0 = unique(page0.map((d) => d.row));
  $: rows0, rows0.sort((a, b) => a - b);

  $: rows1 = unique(page1.map((d) => d.row));
  $: rows1, rows1.sort((a, b) => a - b);

  $: rowData0 = rows0.map((r) => page0.filter((k) => k.row === r));
  $: rowData1 = rows0.map((r) => page1.filter((k) => k.row === r));
  $: rowData = [rowData0, rowData1];

  //$: active = pressed;

  let indent = 0;

  const shiftKeys = (m) => {
    if (m > 2) return "";
    let spaces = "";
    for (let i = 0; i < m; i++) {
      spaces += "&nbsp;&nbsp&nbsp";
    }
    return spaces;
  };
</script>

<div class="svelte-keyboard">
  {#each rowData as row, i}
    <div class="page" class:visible={i === page}>
      {#each row as keys, j}
        <div class="row row--{i}">
          {@html shiftKeys(j)}
          {#each keys as { value, display }}
          {#key boxsize}
            <button
              style="--box-shadow: {boxsize}px {boxsize*2}px 2em #{boxshadowcolor}"
              class="key key--{value} {keyClass[value] || ''}"
              class:single={value != undefined && value.length === 1}
              class:half={value == ";"}
              on:touchstart={(e) => onKeyStart(e, value)}
              on:mousedown={(e) => onKeyStart(e, value)}
              on:touchend={() => onKeyEnd(value)}
              on:mouseup={() => onKeyEnd(value)}
              style:background-color=#{pressed==value ? 'd6ce9d' : keybackground}
              class:active={value === active}
              class:pressed={value === pressed}

            >
            <!-- <div style="color: #{keycolor};"> -->
              <div style:background=inherit style:color=#{keycolor}>
              {#if display && display.includes("<svg")}
              {@html display}
            {:else}{display}{/if}
            </div>
              
            </button>
            {/key}
          {/each}
        </div>
      {/each}
    </div>
  {/each}
</div>

<style>
  .row {
    display: flex;
    justify-content: center;
    touch-action: manipulation;
  }

  button {
    
    appearance: none;
    display: inline-block;
    text-align: center;
    vertical-align: baseline;
    cursor: pointer;
    line-height: 1;
    transform-origin: 50% 50%;
    user-select: none;
    background: var(--background, #E500A4);
    color: var(--color, #111);
    border: var(--border, none);
    border-radius: var(--border-radius, 2px);
    box-shadow: var(--box-shadow, none);
    box-shadow: var(--box-shadow);
    flex: var(--flex, 1);
    font-family: var(--font-family, sans-serif);
    font-size: var(--font-size, 20px);
    font-weight: var(--font-weight, normal);
    height: var(--height, 3.5rem);
    margin: var(--margin, 0.125rem);
    opacity: var(--opacity, 1);
    text-transform: var(--text-transform, none);
    -webkit-tap-highlight-color: transparent;
  }

  button.single {
    min-width: var(--min-width, 2rem);
  }

  button.half {
    max-width: var(--min-width, 1rem);
  }

  button.active,
  button:active {
    background: var(--active-background, #ccc);
    border: var(--active-border, none);
    box-shadow: var(--active-box-shadow, none);
    color: var(--active-color, #111);
    opacity: var(--active-opacity, 1);
    transform: var(--active-transform, none);
  }

  button.pressed {
    color: #072e5b;
    font-weight: bold;
    background-color: #ffef12;
  }

  button.key--Space {
    width: var(--space-width, 20%);
    flex: var(--space-flex, 3);
  }

  button.key--Page0,
  button.key--Page1,
  button.key--Backspace,
  button.key--Enter {
    flex: var(--special-flex, 1.5);
  }

  button.key--Backspace {
    flex: var(--special-flex, 2);
  }

  button.key--undefined {
    display: none;
  }

  .page {
    display: none;
  }

  .page.visible {
    display: block;
  }

  :global(.svelte-keyboard svg) {
    stroke-width: var(--stroke-width, 2px);
    vertical-align: middle;
    display: inline-flex;
    overflow: hidden;    

  }
</style>
