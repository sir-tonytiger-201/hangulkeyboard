var app=function(){"use strict";function e(){}const t=e=>e;function o(e,t){for(const o in t)e[o]=t[o];return e}function r(e){return e()}function n(){return Object.create(null)}function a(e){e.forEach(r)}function l(e){return"function"==typeof e}function u(e,t){return e!=e?t==t:e!==t||e&&"object"==typeof e||"function"==typeof e}function s(t,o,r){t.$$.on_destroy.push(function(t,...o){if(null==t)return e;const r=t.subscribe(...o);return r.unsubscribe?()=>r.unsubscribe():r}(o,r))}const c="undefined"!=typeof window;let i=c?()=>window.performance.now():()=>Date.now(),v=c?e=>requestAnimationFrame(e):e;const w=new Set;function d(e){w.forEach((t=>{t.c(e)||(w.delete(t),t.f())})),0!==w.size&&v(d)}function p(e){let t;return 0===w.size&&v(d),{promise:new Promise((o=>{w.add(t={c:e,f:o})})),abort(){w.delete(t)}}}function f(e,t){e.appendChild(t)}function g(e){if(!e)return document;const t=e.getRootNode?e.getRootNode():e.ownerDocument;return t&&t.host?t:e.ownerDocument}function h(e){const t=b("style");return function(e,t){f(e.head||e,t)}(g(e),t),t.sheet}function m(e,t,o){e.insertBefore(t,o||null)}function y(e){e.parentNode.removeChild(e)}function $(e,t){for(let o=0;o<e.length;o+=1)e[o]&&e[o].d(t)}function b(e){return document.createElement(e)}function k(e){return document.createTextNode(e)}function x(){return k(" ")}function E(e,t,o,r){return e.addEventListener(t,o,r),()=>e.removeEventListener(t,o,r)}function j(e,t,o){null==o?e.removeAttribute(t):e.getAttribute(t)!==o&&e.setAttribute(t,o)}function _(e,t){t=""+t,e.wholeText!==t&&(e.data=t)}function C(e,t,o,r){null===o?e.style.removeProperty(t):e.style.setProperty(t,o,r?"important":"")}function S(e,t,o){e.classList[o?"add":"remove"](t)}function z(e,t,{bubbles:o=!1,cancelable:r=!1}={}){const n=document.createEvent("CustomEvent");return n.initCustomEvent(e,o,r,t),n}class P{constructor(e=!1){this.is_svg=!1,this.is_svg=e,this.e=this.n=null}c(e){this.h(e)}m(e,t,o=null){var r;this.e||(this.is_svg?this.e=(r=t.nodeName,document.createElementNS("http://www.w3.org/2000/svg",r)):this.e=b(t.nodeName),this.t=t,this.c(e)),this.i(o)}h(e){this.e.innerHTML=e,this.n=Array.from(this.e.childNodes)}i(e){for(let t=0;t<this.n.length;t+=1)m(this.t,this.n[t],e)}p(e){this.d(),this.h(e),this.i(this.a)}d(){this.n.forEach(y)}}const A=new Map;let L,q=0;function D(e,t,o,r,n,a,l,u=0){const s=16.666/r;let c="{\n";for(let e=0;e<=1;e+=s){const r=t+(o-t)*a(e);c+=100*e+`%{${l(r,1-r)}}\n`}const i=c+`100% {${l(o,1-o)}}\n}`,v=`__svelte_${function(e){let t=5381,o=e.length;for(;o--;)t=(t<<5)-t^e.charCodeAt(o);return t>>>0}(i)}_${u}`,w=g(e),{stylesheet:d,rules:p}=A.get(w)||function(e,t){const o={stylesheet:h(t),rules:{}};return A.set(e,o),o}(w,e);p[v]||(p[v]=!0,d.insertRule(`@keyframes ${v} ${i}`,d.cssRules.length));const f=e.style.animation||"";return e.style.animation=`${f?`${f}, `:""}${v} ${r}ms linear ${n}ms 1 both`,q+=1,v}function I(e,t){const o=(e.style.animation||"").split(", "),r=o.filter(t?e=>e.indexOf(t)<0:e=>-1===e.indexOf("__svelte")),n=o.length-r.length;n&&(e.style.animation=r.join(", "),q-=n,q||v((()=>{q||(A.forEach((e=>{const{stylesheet:t}=e;let o=t.cssRules.length;for(;o--;)t.deleteRule(o);e.rules={}})),A.clear())})))}function B(e){L=e}function M(){const e=function(){if(!L)throw new Error("Function called outside component initialization");return L}();return(t,o,{cancelable:r=!1}={})=>{const n=e.$$.callbacks[t];if(n){const a=z(t,o,{cancelable:r});return n.slice().forEach((t=>{t.call(e,a)})),!a.defaultPrevented}return!0}}const O=[],K=[],T=[],N=[],R=Promise.resolve();let H=!1;function U(e){T.push(e)}function V(e){N.push(e)}const F=new Set;let Q,W=0;function G(){const e=L;do{for(;W<O.length;){const e=O[W];W++,B(e),J(e.$$)}for(B(null),O.length=0,W=0;K.length;)K.pop()();for(let e=0;e<T.length;e+=1){const t=T[e];F.has(t)||(F.add(t),t())}T.length=0}while(O.length);for(;N.length;)N.pop()();H=!1,F.clear(),B(e)}function J(e){if(null!==e.fragment){e.update(),a(e.before_update);const t=e.dirty;e.dirty=[-1],e.fragment&&e.fragment.p(e.ctx,t),e.after_update.forEach(U)}}function X(e,t,o){e.dispatchEvent(z(`${t?"intro":"outro"}${o}`))}const Y=new Set;let Z;function ee(e,t){e&&e.i&&(Y.delete(e),e.i(t))}function te(e,t,o,r){if(e&&e.o){if(Y.has(e))return;Y.add(e),Z.c.push((()=>{Y.delete(e),r&&(o&&e.d(1),r())})),e.o(t)}else r&&r()}const oe={duration:0};function re(o,r,n){let a,u,s=r(o,n),c=!1,v=0;function w(){a&&I(o,a)}function d(){const{delay:r=0,duration:n=300,easing:l=t,tick:d=e,css:f}=s||oe;f&&(a=D(o,0,1,n,r,l,f,v++)),d(0,1);const g=i()+r,h=g+n;u&&u.abort(),c=!0,U((()=>X(o,!0,"start"))),u=p((e=>{if(c){if(e>=h)return d(1,0),X(o,!0,"end"),w(),c=!1;if(e>=g){const t=l((e-g)/n);d(t,1-t)}}return c}))}let f=!1;return{start(){f||(f=!0,I(o),l(s)?(s=s(),(Q||(Q=Promise.resolve(),Q.then((()=>{Q=null}))),Q).then(d)):d())},invalidate(){f=!1},end(){c&&(w(),c=!1)}}}function ne(e,t,o){const r=e.$$.props[t];void 0!==r&&(e.$$.bound[r]=o,o(e.$$.ctx[r]))}function ae(e,t,o,n){const{fragment:u,on_mount:s,on_destroy:c,after_update:i}=e.$$;u&&u.m(t,o),n||U((()=>{const t=s.map(r).filter(l);c?c.push(...t):a(t),e.$$.on_mount=[]})),i.forEach(U)}function le(e,t){const o=e.$$;null!==o.fragment&&(a(o.on_destroy),o.fragment&&o.fragment.d(t),o.on_destroy=o.fragment=null,o.ctx=[])}function ue(e,t){-1===e.$$.dirty[0]&&(O.push(e),H||(H=!0,R.then(G)),e.$$.dirty.fill(0)),e.$$.dirty[t/31|0]|=1<<t%31}function se(t,o,r,l,u,s,c,i=[-1]){const v=L;B(t);const w=t.$$={fragment:null,ctx:null,props:s,update:e,not_equal:u,bound:n(),on_mount:[],on_destroy:[],on_disconnect:[],before_update:[],after_update:[],context:new Map(o.context||(v?v.$$.context:[])),callbacks:n(),dirty:i,skip_bound:!1,root:o.target||v.$$.root};c&&c(w.root);let d=!1;if(w.ctx=r?r(t,o.props||{},((e,o,...r)=>{const n=r.length?r[0]:o;return w.ctx&&u(w.ctx[e],w.ctx[e]=n)&&(!w.skip_bound&&w.bound[e]&&w.bound[e](n),d&&ue(t,e)),o})):[],w.update(),d=!0,a(w.before_update),w.fragment=!!l&&l(w.ctx),o.target){if(o.hydrate){const e=function(e){return Array.from(e.childNodes)}(o.target);w.fragment&&w.fragment.l(e),e.forEach(y)}else w.fragment&&w.fragment.c();o.intro&&ee(t.$$.fragment),ae(t,o.target,o.anchor,o.customElement),G()}B(v)}class ce{$destroy(){le(this,1),this.$destroy=e}$on(e,t){const o=this.$$.callbacks[e]||(this.$$.callbacks[e]=[]);return o.push(t),()=>{const e=o.indexOf(t);-1!==e&&o.splice(e,1)}}$set(e){var t;this.$$set&&(t=e,0!==Object.keys(t).length)&&(this.$$.skip_bound=!0,this.$$set(e),this.$$.skip_bound=!1)}}var ie=[{row:0,value:"q"},{row:0,value:"w"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"a"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:1,value:";"},{row:2,value:"Shift"},{row:2,value:"z"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"m"},{row:2,value:"Backspace"},{row:3,value:"Page1"},{row:3,value:","},{row:3,value:"Space"},{row:3,value:"."},{row:3,value:"Enter"},{row:0,value:"1",page:1},{row:0,value:"2",page:1},{row:0,value:"3",page:1},{row:0,value:"4",page:1},{row:0,value:"5",page:1},{row:0,value:"6",page:1},{row:0,value:"7",page:1},{row:0,value:"8",page:1},{row:0,value:"9",page:1},{row:0,value:"0",page:1},{row:1,value:"!",page:1},{row:1,value:"@",page:1},{row:1,value:"#",page:1},{row:1,value:"$",page:1},{row:1,value:"%",page:1},{row:1,value:"^",page:1},{row:1,value:"&",page:1},{row:1,value:"*",page:1},{row:1,value:"(",page:1},{row:1,value:")",page:1},{row:2,value:"-",page:1},{row:2,value:"_",page:1},{row:2,value:"=",page:1},{row:2,value:"+",page:1},{row:2,value:";",page:1},{row:2,value:":",page:1},{row:2,value:"'",page:1},{row:2,value:'"',page:1},{row:2,value:"<",page:1},{row:2,value:">",page:1},{row:3,value:"Page0",page:1},{row:3,value:"/",page:1},{row:3,value:"?",page:1},{row:3,value:"[",page:1},{row:3,value:"]",page:1},{row:3,value:"{",page:1},{row:3,value:"}",page:1},{row:3,value:"|",page:1},{row:3,value:"\\",page:1},{row:3,value:"~",page:1}],ve=[{row:0,value:"q"},{row:0,value:"w"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"a"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:2,value:"z"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"m"},{row:2,value:"Backspace"}],we=[{row:0,value:"q"},{row:0,value:"w"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"a"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:2,value:"Enter"},{row:2,value:"z"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"m"},{row:2,value:"Backspace"}],de=[{row:0,value:"a"},{row:0,value:"z"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"q"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:1,value:"m"},{row:2,value:"Shift"},{row:2,value:"w"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"Backspace"},{row:3,value:"Page1"},{row:3,value:","},{row:3,value:"Space"},{row:3,value:"."},{row:3,value:"Enter"},{row:0,value:"1",page:1},{row:0,value:"2",page:1},{row:0,value:"3",page:1},{row:0,value:"4",page:1},{row:0,value:"5",page:1},{row:0,value:"6",page:1},{row:0,value:"7",page:1},{row:0,value:"8",page:1},{row:0,value:"9",page:1},{row:0,value:"0",page:1},{row:1,value:"!",page:1},{row:1,value:"@",page:1},{row:1,value:"#",page:1},{row:1,value:"$",page:1},{row:1,value:"%",page:1},{row:1,value:"^",page:1},{row:1,value:"&",page:1},{row:1,value:"*",page:1},{row:1,value:"(",page:1},{row:1,value:")",page:1},{row:2,value:"-",page:1},{row:2,value:"_",page:1},{row:2,value:"=",page:1},{row:2,value:"+",page:1},{row:2,value:";",page:1},{row:2,value:":",page:1},{row:2,value:"'",page:1},{row:2,value:'"',page:1},{row:2,value:"<",page:1},{row:2,value:">",page:1},{row:3,value:"Page0",page:1},{row:3,value:"/",page:1},{row:3,value:"?",page:1},{row:3,value:"[",page:1},{row:3,value:"]",page:1},{row:3,value:"{",page:1},{row:3,value:"}",page:1},{row:3,value:"|",page:1},{row:3,value:"\\",page:1},{row:3,value:"~",page:1}],pe=[{row:0,value:"a"},{row:0,value:"z"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"q"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:1,value:"m"},{row:2,value:"w"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"Backspace"}],fe=[{row:0,value:"a"},{row:0,value:"z"},{row:0,value:"e"},{row:0,value:"r"},{row:0,value:"t"},{row:0,value:"y"},{row:0,value:"u"},{row:0,value:"i"},{row:0,value:"o"},{row:0,value:"p"},{row:1,value:"q"},{row:1,value:"s"},{row:1,value:"d"},{row:1,value:"f"},{row:1,value:"g"},{row:1,value:"h"},{row:1,value:"j"},{row:1,value:"k"},{row:1,value:"l"},{row:1,value:"m"},{row:2,value:"Enter"},{row:2,value:"w"},{row:2,value:"x"},{row:2,value:"c"},{row:2,value:"v"},{row:2,value:"b"},{row:2,value:"n"},{row:2,value:"Backspace"}];function ge(e,t,o){const r=e.slice();return r[33]=t[o],r[35]=o,r}function he(e,t,o){const r=e.slice();return r[36]=t[o],r[38]=o,r}function me(e,t,o){const r=e.slice();return r[39]=t[o].value,r[40]=t[o].display,r}function ye(e){let t,o=e[40]+"";return{c(){t=k(o)},m(e,o){m(e,t,o)},p(e,r){128&r[0]&&o!==(o=e[40]+"")&&_(t,o)},d(e){e&&y(t)}}}function $e(e){let t,o,r=e[40]+"";return{c(){t=new P(!1),o=k(""),t.a=o},m(e,n){t.m(r,e,n),m(e,o,n)},p(e,o){128&o[0]&&r!==(r=e[40]+"")&&t.p(r)},d(e){e&&y(o),e&&t.d()}}}function be(e){let t,o,r,n,l,u,s=`#${e[2]}`,c=`#${e[0]==e[39]?"d6ce9d":e[3]}`;function i(e,t){return 128&t[0]&&(r=null),null==r&&(r=!(!e[40]||!e[40].includes("<svg"))),r?$e:ye}let v=i(e,[-1,-1]),w=v(e);function d(...t){return e[25](e[39],...t)}function p(...t){return e[26](e[39],...t)}function g(){return e[27](e[39])}function h(){return e[28](e[39])}return{c(){t=b("button"),o=b("div"),w.c(),C(o,"background","inherit",!1),C(o,"color",s,!1),C(t,"--box-shadow","5px 10px 2em #"+e[4]),j(t,"class",n="key key--"+e[39]+" "+(e[1][e[39]]||"")+" svelte-w0k3hv"),S(t,"single",null!=e[39]&&1===e[39].length),S(t,"half",";"==e[39]),S(t,"active",e[39]===e[5]),S(t,"pressed",e[39]===e[0]),C(t,"background-color",c,!1)},m(e,r){m(e,t,r),f(t,o),w.m(o,null),l||(u=[E(t,"touchstart",d),E(t,"mousedown",p),E(t,"touchend",g,{passive:!0}),E(t,"mouseup",h)],l=!0)},p(r,a){v===(v=i(e=r,a))&&w?w.p(e,a):(w.d(1),w=v(e),w&&(w.c(),w.m(o,null))),4&a[0]&&s!==(s=`#${e[2]}`)&&C(o,"color",s,!1),16&a[0]&&C(t,"--box-shadow","5px 10px 2em #"+e[4]),130&a[0]&&n!==(n="key key--"+e[39]+" "+(e[1][e[39]]||"")+" svelte-w0k3hv")&&j(t,"class",n),130&a[0]&&S(t,"single",null!=e[39]&&1===e[39].length),130&a[0]&&S(t,"half",";"==e[39]),162&a[0]&&S(t,"active",e[39]===e[5]),131&a[0]&&S(t,"pressed",e[39]===e[0]),137&a[0]&&c!==(c=`#${e[0]==e[39]?"d6ce9d":e[3]}`)&&C(t,"background-color",c,!1)},d(e){e&&y(t),w.d(),l=!1,a(u)}}}function ke(e){let t,o,r,n=e[10](e[38])+"",a=e[36],l=[];for(let t=0;t<a.length;t+=1)l[t]=be(me(e,a,t));return{c(){t=b("div"),o=new P(!1),r=x();for(let e=0;e<l.length;e+=1)l[e].c();o.a=r,j(t,"class","row row--"+e[35]+" svelte-w0k3hv")},m(e,a){m(e,t,a),o.m(n,t),f(t,r);for(let e=0;e<l.length;e+=1)l[e].m(t,null)},p(e,o){if(959&o[0]){let r;for(a=e[36],r=0;r<a.length;r+=1){const n=me(e,a,r);l[r]?l[r].p(n,o):(l[r]=be(n),l[r].c(),l[r].m(t,null))}for(;r<l.length;r+=1)l[r].d(1);l.length=a.length}},d(e){e&&y(t),$(l,e)}}}function xe(e){let t,o,r=e[33],n=[];for(let t=0;t<r.length;t+=1)n[t]=ke(he(e,r,t));return{c(){t=b("div");for(let e=0;e<n.length;e+=1)n[e].c();o=x(),j(t,"class","page svelte-w0k3hv"),S(t,"visible",e[35]===e[6])},m(e,r){m(e,t,r);for(let e=0;e<n.length;e+=1)n[e].m(t,null);f(t,o)},p(e,a){if(1983&a[0]){let l;for(r=e[33],l=0;l<r.length;l+=1){const u=he(e,r,l);n[l]?n[l].p(u,a):(n[l]=ke(u),n[l].c(),n[l].m(t,o))}for(;l<n.length;l+=1)n[l].d(1);n.length=r.length}64&a[0]&&S(t,"visible",e[35]===e[6])},d(e){e&&y(t),$(n,e)}}}function Ee(t){let o,r=t[7],n=[];for(let e=0;e<r.length;e+=1)n[e]=xe(ge(t,r,e));return{c(){o=b("div");for(let e=0;e<n.length;e+=1)n[e].c();j(o,"class","svelte-keyboard")},m(e,t){m(e,o,t);for(let e=0;e<n.length;e+=1)n[e].m(o,null)},p(e,t){if(2047&t[0]){let a;for(r=e[7],a=0;a<r.length;a+=1){const l=ge(e,r,a);n[a]?n[a].p(l,t):(n[a]=xe(l),n[a].c(),n[a].m(o,null))}for(;a<n.length;a+=1)n[a].d(1);n.length=r.length}},i:e,o:e,d(e){e&&y(o),$(n,e)}}}function je(e,t,o){let r,n,a,l,u,s,c,i,v,{custom:w}=t,{localizationLayout:d="qwerty"}=t,{layout:p="standard"}=t,{noSwap:f=[]}=t,{keyClass:g={}}=t;g[";"]="half";let{timestamp:h}=t,{keycolor:m}=t,{keybackground:y}=t,{boxshadowcolor:$}=t;console.log($);let b,k=0,{shifted:x=!1}=t,{pressed:E}=t;const j={qwerty:{standard:ie,crossword:ve,wordle:we},azerty:{standard:de,crossword:pe,wordle:fe}},_=M(),C={Page0:"cap",Page1:"?123",Space:" ",Shift:"cap",Enter:'<svg width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-down-left"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>',Backspace:'<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-delete"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>'},S=e=>[...new Set(e)],z=(e,t)=>{if(o(12,h=Date.now()),e.preventDefault(),o(5,b=t),null!=t&&t.includes("Page"))o(6,k=+t?.substr(-1));else if("Shift"===t)o(11,x=!x);else{let e=t;x&&"abcdefghijklmnopqrstuvwxyz".includes(t)&&(e=t.toUpperCase()||""),_("keydown",e)}return e.stopPropagation(),o(0,E=void 0),!1},P=e=>{setTimeout((()=>{o(0,E=b),e===b&&o(0,E=b)}),50)};return e.$$set=e=>{"custom"in e&&o(13,w=e.custom),"localizationLayout"in e&&o(14,d=e.localizationLayout),"layout"in e&&o(15,p=e.layout),"noSwap"in e&&o(16,f=e.noSwap),"keyClass"in e&&o(1,g=e.keyClass),"timestamp"in e&&o(12,h=e.timestamp),"keycolor"in e&&o(2,m=e.keycolor),"keybackground"in e&&o(3,y=e.keybackground),"boxshadowcolor"in e&&o(4,$=e.boxshadowcolor),"shifted"in e&&o(11,x=e.shifted),"pressed"in e&&o(0,E=e.pressed)},e.$$.update=()=>{33&e.$$.dirty[0]&&(E?o(5,b=E):setTimeout((()=>{o(0,E=b)}),100)),57344&e.$$.dirty[0]&&o(24,r=w||j[d][p]||standard),16844800&e.$$.dirty[0]&&o(23,n=r.map((e=>{let t=e.display;const o=C[e.value];return o&&!f.includes(e.value)&&!e.noSwap&&(t=o),!t&&e.value&&(t=x?e.value.toUpperCase()||"":e.value.toLowerCase()||""),"Shift"===e.value&&(t=x?o||"":o.toUpperCase()||""),{...e,display:t}}))),8388608&e.$$.dirty[0]&&o(21,a=n.filter((e=>!e.page))),8388608&e.$$.dirty[0]&&o(19,l=n.filter((e=>e.page))),2097152&e.$$.dirty[0]&&o(20,u=S(a.map((e=>e.row)))),1048576&e.$$.dirty[0]&&u.sort(((e,t)=>e-t)),524288&e.$$.dirty[0]&&o(22,s=S(l.map((e=>e.row)))),4194304&e.$$.dirty[0]&&s.sort(((e,t)=>e-t)),3145728&e.$$.dirty[0]&&o(18,c=u.map((e=>a.filter((t=>t.row===e))))),1572864&e.$$.dirty[0]&&o(17,i=u.map((e=>l.filter((t=>t.row===e))))),393216&e.$$.dirty[0]&&o(7,v=[c,i])},[E,g,m,y,$,b,k,v,z,P,e=>{if(e>2)return"";let t="";for(let o=0;o<e;o++)t+="&nbsp;&nbsp&nbsp";return t},x,h,w,d,p,f,i,c,l,u,a,s,n,r,(e,t)=>z(t,e),(e,t)=>z(t,e),e=>P(e),e=>P(e)]}class _e extends ce{constructor(e){super(),se(this,e,je,Ee,u,{custom:13,localizationLayout:14,layout:15,noSwap:16,keyClass:1,timestamp:12,keycolor:2,keybackground:3,boxshadowcolor:4,shifted:11,pressed:0},null,[-1,-1])}}const Ce=(e,t)=>{let o;const r=()=>window.removeEventListener("keydown",o),n=()=>{if(r(),t)if("string"==typeof t.code)o=o=>{!!t.alt==o.altKey&&!!t.shift==o.shiftKey&&!!t.control==(o.ctrlKey||o.metaKey)&&t.code==o.code&&(o.preventDefault(),t.callback?t.callback(o.code):e.click())},window.addEventListener("keydown",o);else for(const r of t.code)o=o=>{!!t.alt==o.altKey&&!!t.shift==o.shiftKey&&!!t.control==(o.ctrlKey||o.metaKey)&&r==o.code&&(o.preventDefault(),t.callback?t.callback(o.code):e.click())},window.addEventListener("keydown",o)};return n(),{update:n,destroy:r}};function Se(e){return 1-Math.sqrt(1-e*e)}function ze(e){return e*e*e}function Pe(e){const t=e-1;return t*t*t+1}function Ae(e){return e*e}function Le(e){const t=Math.cos(e*Math.PI*.5);return Math.abs(t)<1e-14?1:1-t}function qe(e,{delay:t=0,duration:o=400,easing:r=Pe,x:n=0,y:a=0,opacity:l=0}={}){const u=getComputedStyle(e),s=+u.opacity,c="none"===u.transform?"":u.transform,i=s*(1-l);return{delay:t,duration:o,easing:r,css:(e,t)=>`\n\t\t\ttransform: ${c} translate(${(1-e)*n}px, ${(1-e)*a}px);\n\t\t\topacity: ${s-i*t}`}}function De(e,{delay:t=0,duration:o=400,easing:r=Pe,start:n=0,opacity:a=0}={}){const l=getComputedStyle(e),u=+l.opacity,s="none"===l.transform?"":l.transform,c=1-n,i=u*(1-a);return{delay:t,duration:o,easing:r,css:(e,t)=>`\n\t\t\ttransform: ${s} scale(${1-c*t});\n\t\t\topacity: ${u-i*t}\n\t\t`}}const Ie=[];function Be(e){return"[object Date]"===Object.prototype.toString.call(e)}function Me(e,t){if(e===t||e!=e)return()=>e;const o=typeof e;if(o!==typeof t||Array.isArray(e)!==Array.isArray(t))throw new Error("Cannot interpolate values of different type");if(Array.isArray(e)){const o=t.map(((t,o)=>Me(e[o],t)));return e=>o.map((t=>t(e)))}if("object"===o){if(!e||!t)throw new Error("Object cannot be null");if(Be(e)&&Be(t)){e=e.getTime();const o=(t=t.getTime())-e;return t=>new Date(e+t*o)}const o=Object.keys(t),r={};return o.forEach((o=>{r[o]=Me(e[o],t[o])})),e=>{const t={};return o.forEach((o=>{t[o]=r[o](e)})),t}}if("number"===o){const o=t-e;return t=>e+t*o}throw new Error(`Cannot interpolate ${o} values`)}function Oe(r,n={}){const a=function(t,o=e){let r;const n=new Set;function a(e){if(u(t,e)&&(t=e,r)){const e=!Ie.length;for(const e of n)e[1](),Ie.push(e,t);if(e){for(let e=0;e<Ie.length;e+=2)Ie[e][0](Ie[e+1]);Ie.length=0}}}return{set:a,update:function(e){a(e(t))},subscribe:function(l,u=e){const s=[l,u];return n.add(s),1===n.size&&(r=o(a)||e),l(t),()=>{n.delete(s),0===n.size&&(r(),r=null)}}}}(r);let l,s=r;function c(e,u){if(null==r)return a.set(r=e),Promise.resolve();s=e;let c=l,v=!1,{delay:w=0,duration:d=400,easing:f=t,interpolate:g=Me}=o(o({},n),u);if(0===d)return c&&(c.abort(),c=null),a.set(r=s),Promise.resolve();const h=i()+w;let m;return l=p((t=>{if(t<h)return!0;v||(m=g(r,e),"function"==typeof d&&(d=d(r,e)),v=!0),c&&(c.abort(),c=null);const o=t-h;return o>d?(a.set(r=e),!1):(a.set(r=m(f(o/d))),!0)})),l.promise}return{set:c,update:(e,t)=>c(e(s,r),t),subscribe:a.subscribe}}function Ke(e){let t;return{c(){t=k("View key map")},m(e,o){m(e,t,o)},d(e){e&&y(t)}}}function Te(e){let t;return{c(){t=k("Hide")},m(e,o){m(e,t,o)},d(e){e&&y(t)}}}function Ne(e){let t;return{c(){t=k("Start")},m(e,o){m(e,t,o)},d(e){e&&y(t)}}}function Re(e){let t;return{c(){t=k("Stop")},m(e,o){m(e,t,o)},d(e){e&&y(t)}}}function He(e){let t;return{c(){t=b("center"),t.innerHTML='<img src="./keyboard.png" class="svelte-1uchv6j"/>'},m(e,o){m(e,t,o)},d(e){e&&y(t)}}}function Ue(t){let o,r,n,a,l,u=("undefined"==t[4]?t[12]():t[4])+"";return{c(){o=b("div"),r=b("div"),n=k(u)},m(e,t){m(e,o,t),f(o,r),f(r,n)},p(e,o){t=e,16&o[0]&&u!==(u=("undefined"==t[4]?t[12]():t[4])+"")&&_(n,u)},i(e){a||U((()=>{a=re(r,De,{}),a.start()})),l||U((()=>{l=re(o,qe,{easing:ze,start:.5,opacity:.5,x:0,y:-320}),l.start()}))},o:e,d(e){e&&y(o)}}}function Ve(t){let o,r,n=t[4]&&Ue(t);return{c(){o=b("div"),n&&n.c(),j(o,"class","hangul svelte-1uchv6j"),C(o,"color","#"+t[7])},m(e,t){m(e,o,t),n&&n.m(o,null)},p(e,r){(t=e)[4]?n?(n.p(t,r),16&r[0]&&ee(n,1)):(n=Ue(t),n.c(),ee(n,1),n.m(o,null)):n&&(n.d(1),n=null),128&r[0]&&C(o,"color","#"+t[7])},i(e){ee(n),r||U((()=>{r=re(o,De,{easing:Pe}),r.start()}))},o:e,d(e){e&&y(o),n&&n.d()}}}function Fe(t){let o,r,n,s,c,i,v,w,d,p,g,h,$,_,C,S,z,P,A,L,q,D,I,B,M,O,T,N,R=t[2];function H(e,t){return e[6]?Te:Ke}let U=H(t),F=U(t);function Q(e,t){return e[5]?Re:Ne}let W=Q(t),G=W(t),J=t[6]&&He();function X(e){t[25](e)}function Y(e){t[26](e)}function oe(e){t[27](e)}function re(e){t[28](e)}function ue(e){t[29](e)}function se(e){t[30](e)}let ce={};void 0!==t[1]&&(ce.pressed=t[1]),void 0!==t[0]&&(ce.shifted=t[0]),void 0!==t[2]&&(ce.timestamp=t[2]),void 0!==t[8]&&(ce.keycolor=t[8]),void 0!==t[9]&&(ce.keybackground=t[9]),void 0!==t[10]&&(ce.boxshadowcolor=t[10]),P=new _e({props:ce}),K.push((()=>ne(P,"pressed",X))),K.push((()=>ne(P,"shifted",Y))),K.push((()=>ne(P,"timestamp",oe))),K.push((()=>ne(P,"keycolor",re))),K.push((()=>ne(P,"keybackground",ue))),K.push((()=>ne(P,"boxshadowcolor",se))),P.$on("keydown",t[31]);let ie=Ve(t);return{c(){var e;o=b("nav"),r=b("span"),r.innerHTML='<h1 class="svelte-1uchv6j">한글 Keyboard</h1> \n\t\t<small><i>By sir-tonytiger-201</i></small>',n=x(),s=b("br"),c=x(),i=b("span"),i.textContent="Learn the layout.  ",v=x(),w=b("button"),F.c(),d=x(),p=b("button"),G.c(),g=k(" \n\t\tSlideshow"),h=x(),J&&J.c(),$=x(),_=b("main"),C=b("div"),S=b("center"),z=b("p"),(e=P.$$.fragment)&&e.c(),M=x(),ie.c(),j(r,"class","svelte-1uchv6j"),j(i,"class","svelte-1uchv6j"),j(o,"class","svelte-1uchv6j"),j(z,"class","keyboard  svelte-1uchv6j"),j(S,"class","svelte-1uchv6j"),j(C,"class","info  svelte-1uchv6j"),_.hidden=!1,j(_,"class","svelte-1uchv6j")},m(a,u){var y;m(a,o,u),f(o,r),f(o,n),f(o,s),f(o,c),f(o,i),f(o,v),f(o,w),F.m(w,null),f(o,d),f(o,p),G.m(p,null),f(p,g),f(o,h),J&&J.m(o,null),m(a,$,u),m(a,_,u),f(_,C),f(C,S),f(S,z),ae(P,z,null),f(S,M),ie.m(S,null),O=!0,T||(N=[E(w,"click",t[14]),E(p,"click",t[15]),(y=Ce.call(null,_,{code:t[11],callback:t[32]}),y&&l(y.destroy)?y.destroy:e)],T=!0)},p(t,r){U!==(U=H(t))&&(F.d(1),F=U(t),F&&(F.c(),F.m(w,null))),W!==(W=Q(t))&&(G.d(1),G=W(t),G&&(G.c(),G.m(p,g))),t[6]?J||(J=He(),J.c(),J.m(o,null)):J&&(J.d(1),J=null);const n={};!A&&2&r[0]&&(A=!0,n.pressed=t[1],V((()=>A=!1))),!L&&1&r[0]&&(L=!0,n.shifted=t[0],V((()=>L=!1))),!q&&4&r[0]&&(q=!0,n.timestamp=t[2],V((()=>q=!1))),!D&&256&r[0]&&(D=!0,n.keycolor=t[8],V((()=>D=!1))),!I&&512&r[0]&&(I=!0,n.keybackground=t[9],V((()=>I=!1))),!B&&1024&r[0]&&(B=!0,n.boxshadowcolor=t[10],V((()=>B=!1))),P.$set(n),4&r[0]&&u(R,R=t[2])?(Z={r:0,c:[],p:Z},te(ie,1,1,e),Z.r||a(Z.c),Z=Z.p,ie=Ve(t),ie.c(),ee(ie,1),ie.m(S,null)):ie.p(t,r)},i(e){O||(ee(P.$$.fragment,e),ee(ie),O=!0)},o(e){te(P.$$.fragment,e),te(ie),O=!1},d(e){e&&y(o),F.d(),G.d(),J&&J.d(),e&&y($),e&&y(_),le(P),ie.d(e),T=!1,a(N)}}}function Qe(e,t,o){let r,n,a,l,u="",{pressed:c}=t,i=!1,v=0,{timestamp:w=Date.now()}=t,{shifted:d}=t;const p={q:"ㅂ",w:"ㅈ",e:"ㄷ",r:"ㄱ",t:"ㅅ",y:"ㅛ",u:"ㅕ",i:"ㅑ",o:"ㅐ",p:"ㅔ",a:"ㅁ",s:"ㄴ",d:"ㅇ",f:"ㄹ",g:"ㅎ",h:"ㅗ",j:"ㅓ",k:"ㅏ",l:"ㅣ",z:"ㅋ",x:"ㅌ",c:"ㅊ",v:"ㅍ",b:"ㅠ",n:"ㅜ",m:"ㅡ",Q:"ㅃ",W:"ㅉ",E:"ㄸ",R:"ㄲ",T:"ㅆ",O:"ㅒ",P:"ㅖ"};let f=Object.keys(p),g=[];f.forEach((e=>g.push("Key"+e.toUpperCase())));let h=0;const m=e=>{o(2,w=Date.now()),i&&b();const t=e[e.length-1].toLowerCase();o(1,c=t),o(3,ie[0]=t,ie)};let y=!1;let $;const b=()=>{o(5,i=!i),i?(v=0,$=setInterval((()=>{(e=>{const t="Key"+Object.keys(p)[e].toUpperCase(),r=t[t.length-1].toLowerCase();o(1,c=r),o(3,ie[0]=r,ie)})(v++),v>Object.keys(p).length-1&&(v=0)}),1500)):clearInterval($)};let k=0,x=0,E=0,j=0;const _=["fa0024","efff11","00ff00","072e5b","f9be8a","f36729","59e8eb","3548b7"],C=[];_.forEach((e=>C.unshift(e)));const S=["023e8a","9CAEA9","2B2D42","6A4C93","6C757D"],z=["E500A4","f5a218","228abf","3dfa40","e893e9","0186cc","c51e85"],P=e=>Math.round(e).toString(16).padStart(2,"0");console.log("colorIndex",k);const A=(e,t)=>parseInt(e.substring(t,t+2),16),L=e=>[A(e,0),A(e,2),A(e,4)],q=(e,t,o)=>e+t*o;function D(e,t){const[o,r,n]=L(e),[a,l,u]=L(t),s=a-o,c=l-r,i=u-n;return e=>{const t=q(o,s,e),a=q(r,c,e),l=q(n,i,e);return P(t)+P(a)+P(l)}}const I=Oe(_[k],{duration:2e3,easing:Le,interpolate:D});s(e,I,(e=>o(7,r=e)));const B=Oe(C[x],{duration:1e3,easing:Se,interpolate:D});s(e,B,(e=>o(8,n=e)));const M=Oe(S[E],{duration:3e3,easing:Ae,interpolate:D});s(e,M,(e=>o(9,a=e)));const O=Oe(z[j],{duration:1e3,interpolate:D});s(e,O,(e=>o(10,l=e))),setInterval((()=>{o(21,k=(k+1)%_.length),clearInterval()}),2e3),setInterval((()=>{o(22,x=(x+1)%C.length),clearInterval()}),1e3),setInterval((()=>{o(23,E=(E+1)%S.length),clearInterval()}),3e3),setInterval((()=>{o(24,j=(j+1)%z.length),clearInterval()}),1e3);return e.$$set=e=>{"pressed"in e&&o(1,c=e.pressed),"timestamp"in e&&o(2,w=e.timestamp),"shifted"in e&&o(0,d=e.shifted)},e.$$.update=()=>{9&e.$$.dirty[0]&&o(4,u=String(1==ie[0].length?d?p[ie[0].toUpperCase()]||void 0:p[ie[0]]||"":"")),2097152&e.$$.dirty[0]&&I.set(_[k]),4194304&e.$$.dirty[0]&&B.set(C[x]),8388608&e.$$.dirty[0]&&M.set(S[E]),16777216&e.$$.dirty[0]&&O.set(z[j])},[d,c,w,ie,u,i,y,r,n,a,l,g,()=>{const e=["😜","😁","😛","😊"],t=e[h];return h+=1,h==e.length&&(h=0),t},m,()=>{o(6,y=!y)},b,I,B,M,O,p,k,x,E,j,function(e){c=e,o(1,c)},function(e){d=e,o(0,d)},function(e){w=e,o(2,w)},function(e){n=e,B.set(n)},function(e){a=e,M.set(a)},function(e){l=e,O.set(l)},({detail:e})=>{o(3,ie[0]=e,ie),i&&b()},e=>m(e)]}return new class extends ce{constructor(e){super(),se(this,e,Qe,Fe,u,{pressed:1,timestamp:2,shifted:0,hangulValue:20},null,[-1,-1])}get hangulValue(){return this.$$.ctx[20]}}({target:document.body,props:{}})}();
//# sourceMappingURL=bundle.js.map
