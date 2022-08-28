
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function get_root_for_style(node) {
        if (!node)
            return document;
        const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
        if (root && root.host) {
            return root;
        }
        return node.ownerDocument;
    }
    function append_empty_stylesheet(node) {
        const style_element = element('style');
        append_stylesheet(get_root_for_style(node), style_element);
        return style_element.sheet;
    }
    function append_stylesheet(node, style) {
        append(node.head || node, style);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, cancelable, detail);
        return e;
    }
    class HtmlTag {
        constructor(is_svg = false) {
            this.is_svg = false;
            this.is_svg = is_svg;
            this.e = this.n = null;
        }
        c(html) {
            this.h(html);
        }
        m(html, target, anchor = null) {
            if (!this.e) {
                if (this.is_svg)
                    this.e = svg_element(target.nodeName);
                else
                    this.e = element(target.nodeName);
                this.t = target;
                this.c(html);
            }
            this.i(anchor);
        }
        h(html) {
            this.e.innerHTML = html;
            this.n = Array.from(this.e.childNodes);
        }
        i(anchor) {
            for (let i = 0; i < this.n.length; i += 1) {
                insert(this.t, this.n[i], anchor);
            }
        }
        p(html) {
            this.d();
            this.h(html);
            this.i(this.a);
        }
        d() {
            this.n.forEach(detach);
        }
    }

    // we need to store the information for multiple documents because a Svelte application could also contain iframes
    // https://github.com/sveltejs/svelte/issues/3624
    const managed_styles = new Map();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_style_information(doc, node) {
        const info = { stylesheet: append_empty_stylesheet(node), rules: {} };
        managed_styles.set(doc, info);
        return info;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = get_root_for_style(node);
        const { stylesheet, rules } = managed_styles.get(doc) || create_style_information(doc, node);
        if (!rules[name]) {
            rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            managed_styles.forEach(info => {
                const { stylesheet } = info;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                info.rules = {};
            });
            managed_styles.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail, { cancelable = false } = {}) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail, { cancelable });
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
                return !event.defaultPrevented;
            }
            return true;
        };
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
        else if (callback) {
            callback();
        }
    }
    const null_transition = { duration: 0 };
    function create_in_transition(node, fn, params) {
        let config = fn(node, params);
        let running = false;
        let animation_name;
        let task;
        let uid = 0;
        function cleanup() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function go() {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            if (css)
                animation_name = create_rule(node, 0, 1, duration, delay, easing, css, uid++);
            tick(0, 1);
            const start_time = now() + delay;
            const end_time = start_time + duration;
            if (task)
                task.abort();
            running = true;
            add_render_callback(() => dispatch(node, true, 'start'));
            task = loop(now => {
                if (running) {
                    if (now >= end_time) {
                        tick(1, 0);
                        dispatch(node, true, 'end');
                        cleanup();
                        return running = false;
                    }
                    if (now >= start_time) {
                        const t = easing((now - start_time) / duration);
                        tick(t, 1 - t);
                    }
                }
                return running;
            });
        }
        let started = false;
        return {
            start() {
                if (started)
                    return;
                started = true;
                delete_rule(node);
                if (is_function(config)) {
                    config = config();
                    wait().then(go);
                }
                else {
                    go();
                }
            },
            invalidate() {
                started = false;
            },
            end() {
                if (running) {
                    cleanup();
                    running = false;
                }
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.49.0' }, detail), { bubbles: true }));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function prop_dev(node, property, value) {
        node[property] = value;
        dispatch_dev('SvelteDOMSetProperty', { node, property, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var keys = [{
    	"row": 0,
    	"value": "q"
    }, {
    	"row": 0,
    	"value": "w"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    },  {
    	"row": 0,
    	"value": "i"
    },  {
    	"row": 0,
    	"value": "o"
    },  {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "a"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 1,
    	"value": ";"
    }, {
    	"row": 2,
    	"value": "Shift",
    }, {
    	"row": 2,
    	"value": "z"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }, {
    	"row": 3,
    	"value": "Page1",
    },  {
    	"row": 3,
    	"value": ",",
    },  {
    	"row": 3,
    	"value": "Space",
    },  {
    	"row": 3,
    	"value": ".",
    },  {
    	"row": 3,
    	"value": "Enter",
    }, {
    	"row": 0,
    	"value": "1",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "2",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "3",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "4",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "5",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "6",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "7",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "8",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "9",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "0",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "!",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "@",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "#",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "$",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "%",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "^",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "&",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "*",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "(",
    	"page": 1
    }, {
    	"row": 1,
    	"value": ")",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "-",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "_",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "=",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "+",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ";",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ":",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "'",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "\"",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "<",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ">",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "Page0",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "/",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "?",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "[",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "]",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "{",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "}",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "|",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "\\",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "~",
    	"page": 1
    }];

    var qwertyCrossword = [{
    	"row": 0,
    	"value": "q"
    }, {
    	"row": 0,
    	"value": "w"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    }, {
    	"row": 0,
    	"value": "i"
    }, {
    	"row": 0,
    	"value": "o"
    }, {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "a"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 2,
    	"value": "z"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }];

    var qwertyWordle = [{
    	"row": 0,
    	"value": "q"
    }, {
    	"row": 0,
    	"value": "w"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    }, {
    	"row": 0,
    	"value": "i"
    }, {
    	"row": 0,
    	"value": "o"
    }, {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "a"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 2,
    	"value": "Enter"
    }, {
    	"row": 2,
    	"value": "z"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }];

    var azertyStandard = [{
    	"row": 0,
    	"value": "a"
    }, {
    	"row": 0,
    	"value": "z"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    },  {
    	"row": 0,
    	"value": "i"
    },  {
    	"row": 0,
    	"value": "o"
    },  {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "q"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 1,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Shift",
    }, {
    	"row": 2,
    	"value": "w"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }, {
    	"row": 3,
    	"value": "Page1",
    },  {
    	"row": 3,
    	"value": ",",
    },  {
    	"row": 3,
    	"value": "Space",
    },  {
    	"row": 3,
    	"value": ".",
    },  {
    	"row": 3,
    	"value": "Enter",
    }, {
    	"row": 0,
    	"value": "1",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "2",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "3",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "4",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "5",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "6",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "7",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "8",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "9",
    	"page": 1
    }, {
    	"row": 0,
    	"value": "0",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "!",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "@",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "#",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "$",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "%",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "^",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "&",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "*",
    	"page": 1
    }, {
    	"row": 1,
    	"value": "(",
    	"page": 1
    }, {
    	"row": 1,
    	"value": ")",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "-",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "_",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "=",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "+",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ";",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ":",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "'",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "\"",
    	"page": 1
    }, {
    	"row": 2,
    	"value": "<",
    	"page": 1
    }, {
    	"row": 2,
    	"value": ">",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "Page0",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "/",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "?",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "[",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "]",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "{",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "}",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "|",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "\\",
    	"page": 1
    }, {
    	"row": 3,
    	"value": "~",
    	"page": 1
    }];

    var azertyCrossword = [{
    	"row": 0,
    	"value": "a"
    }, {
    	"row": 0,
    	"value": "z"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    }, {
    	"row": 0,
    	"value": "i"
    }, {
    	"row": 0,
    	"value": "o"
    }, {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "q"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 1,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "w"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }];

    var azertyWordle = [{
    	"row": 0,
    	"value": "a"
    }, {
    	"row": 0,
    	"value": "z"
    }, {
    	"row": 0,
    	"value": "e"
    }, {
    	"row": 0,
    	"value": "r"
    }, {
    	"row": 0,
    	"value": "t"
    }, {
    	"row": 0,
    	"value": "y"
    }, {
    	"row": 0,
    	"value": "u"
    }, {
    	"row": 0,
    	"value": "i"
    }, {
    	"row": 0,
    	"value": "o"
    }, {
    	"row": 0,
    	"value": "p"
    }, {
    	"row": 1,
    	"value": "q"
    }, {
    	"row": 1,
    	"value": "s"
    }, {
    	"row": 1,
    	"value": "d"
    }, {
    	"row": 1,
    	"value": "f"
    }, {
    	"row": 1,
    	"value": "g"
    }, {
    	"row": 1,
    	"value": "h"
    }, {
    	"row": 1,
    	"value": "j"
    }, {
    	"row": 1,
    	"value": "k"
    }, {
    	"row": 1,
    	"value": "l"
    }, {
    	"row": 1,
    	"value": "m"
    }, {
    	"row": 2,
    	"value": "Enter"
    }, {
    	"row": 2,
    	"value": "w"
    }, {
    	"row": 2,
    	"value": "x"
    }, {
    	"row": 2,
    	"value": "c"
    }, {
    	"row": 2,
    	"value": "v"
    }, {
    	"row": 2,
    	"value": "b"
    }, {
    	"row": 2,
    	"value": "n"
    }, {
    	"row": 2,
    	"value": "Backspace"
    }];

    var backspaceSVG = `<svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-delete"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>`;

    var enterSVG = `<svg width="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-corner-down-left"><polyline points="9 10 4 15 9 20"></polyline><path d="M20 4v7a4 4 0 0 1-4 4H4"></path></svg>`;

    /* src/lib/Keyboard.svelte generated by Svelte v3.49.0 */
    const file$3 = "src/lib/Keyboard.svelte";

    function get_each_context$2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[36] = list[i];
    	child_ctx[38] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[39] = list[i];
    	child_ctx[41] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[42] = list[i].value;
    	child_ctx[43] = list[i].display;
    	return child_ctx;
    }

    // (186:12) {:else}
    function create_else_block$2(ctx) {
    	let t_value = /*display*/ ctx[43] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData*/ 256 && t_value !== (t_value = /*display*/ ctx[43] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(186:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (184:14) {#if display && display.includes("<svg")}
    function create_if_block$2(ctx) {
    	let html_tag;
    	let raw_value = /*display*/ ctx[43] + "";
    	let html_anchor;

    	const block = {
    		c: function create() {
    			html_tag = new HtmlTag(false);
    			html_anchor = empty();
    			html_tag.a = html_anchor;
    		},
    		m: function mount(target, anchor) {
    			html_tag.m(raw_value, target, anchor);
    			insert_dev(target, html_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData*/ 256 && raw_value !== (raw_value = /*display*/ ctx[43] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(184:14) {#if display && display.includes(\\\"<svg\\\")}",
    		ctx
    	});

    	return block;
    }

    // (167:10) {#key boxsize}
    function create_key_block$1(ctx) {
    	let button;
    	let div;
    	let show_if;
    	let style_color = `#${/*keycolor*/ ctx[2]}`;
    	let button_class_value;

    	let style_background_color = `#${/*pressed*/ ctx[0] == /*value*/ ctx[42]
	? 'd6ce9d'
	: /*keybackground*/ ctx[3]}`;

    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*rowData*/ 256) show_if = null;
    		if (show_if == null) show_if = !!(/*display*/ ctx[43] && /*display*/ ctx[43].includes("<svg"));
    		if (show_if) return create_if_block$2;
    		return create_else_block$2;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block = current_block_type(ctx);

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[26](/*value*/ ctx[42], ...args);
    	}

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[27](/*value*/ ctx[42], ...args);
    	}

    	function touchend_handler() {
    		return /*touchend_handler*/ ctx[28](/*value*/ ctx[42]);
    	}

    	function mouseup_handler() {
    		return /*mouseup_handler*/ ctx[29](/*value*/ ctx[42]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			div = element("div");
    			if_block.c();
    			set_style(div, "background", `inherit`, false);
    			set_style(div, "color", style_color, false);
    			add_location(div, file$3, 182, 14, 4734);
    			set_style(button, "--box-shadow", /*boxsize*/ ctx[5] + "px " + /*boxsize*/ ctx[5] * 2 + "px 2em #" + /*boxshadowcolor*/ ctx[4]);
    			attr_dev(button, "class", button_class_value = "key key--" + /*value*/ ctx[42] + " " + (/*keyClass*/ ctx[1][/*value*/ ctx[42]] || '') + " svelte-w0k3hv");
    			toggle_class(button, "single", /*value*/ ctx[42] != undefined && /*value*/ ctx[42].length === 1);
    			toggle_class(button, "half", /*value*/ ctx[42] == ";");
    			toggle_class(button, "active", /*value*/ ctx[42] === /*active*/ ctx[6]);
    			toggle_class(button, "pressed", /*value*/ ctx[42] === /*pressed*/ ctx[0]);
    			set_style(button, "background-color", style_background_color, false);
    			add_location(button, file$3, 167, 12, 3995);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, div);
    			if_block.m(div, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(button, "touchstart", touchstart_handler, false, false, false),
    					listen_dev(button, "mousedown", mousedown_handler, false, false, false),
    					listen_dev(button, "touchend", touchend_handler, { passive: true }, false, false),
    					listen_dev(button, "mouseup", mouseup_handler, false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (current_block_type === (current_block_type = select_block_type(ctx, dirty)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div, null);
    				}
    			}

    			if (dirty[0] & /*keycolor*/ 4 && style_color !== (style_color = `#${/*keycolor*/ ctx[2]}`)) {
    				set_style(div, "color", style_color, false);
    			}

    			if (dirty[0] & /*boxsize, boxshadowcolor*/ 48) {
    				set_style(button, "--box-shadow", /*boxsize*/ ctx[5] + "px " + /*boxsize*/ ctx[5] * 2 + "px 2em #" + /*boxshadowcolor*/ ctx[4]);
    			}

    			if (dirty[0] & /*rowData, keyClass*/ 258 && button_class_value !== (button_class_value = "key key--" + /*value*/ ctx[42] + " " + (/*keyClass*/ ctx[1][/*value*/ ctx[42]] || '') + " svelte-w0k3hv")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData*/ 258) {
    				toggle_class(button, "single", /*value*/ ctx[42] != undefined && /*value*/ ctx[42].length === 1);
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData*/ 258) {
    				toggle_class(button, "half", /*value*/ ctx[42] == ";");
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData, active*/ 322) {
    				toggle_class(button, "active", /*value*/ ctx[42] === /*active*/ ctx[6]);
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData, pressed*/ 259) {
    				toggle_class(button, "pressed", /*value*/ ctx[42] === /*pressed*/ ctx[0]);
    			}

    			if (dirty[0] & /*pressed, rowData, keybackground*/ 265 && style_background_color !== (style_background_color = `#${/*pressed*/ ctx[0] == /*value*/ ctx[42]
			? 'd6ce9d'
			: /*keybackground*/ ctx[3]}`)) {
    				set_style(button, "background-color", style_background_color, false);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block$1.name,
    		type: "key",
    		source: "(167:10) {#key boxsize}",
    		ctx
    	});

    	return block;
    }

    // (166:10) {#each keys as { value, display }}
    function create_each_block_2(ctx) {
    	let previous_key = /*boxsize*/ ctx[5];
    	let key_block_anchor;
    	let key_block = create_key_block$1(ctx);

    	const block = {
    		c: function create() {
    			key_block.c();
    			key_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			key_block.m(target, anchor);
    			insert_dev(target, key_block_anchor, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*boxsize*/ 32 && safe_not_equal(previous_key, previous_key = /*boxsize*/ ctx[5])) {
    				key_block.d(1);
    				key_block = create_key_block$1(ctx);
    				key_block.c();
    				key_block.m(key_block_anchor.parentNode, key_block_anchor);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(key_block_anchor);
    			key_block.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(166:10) {#each keys as { value, display }}",
    		ctx
    	});

    	return block;
    }

    // (163:6) {#each row as keys, j}
    function create_each_block_1(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*shiftKeys*/ ctx[11](/*j*/ ctx[41]) + "";
    	let t;
    	let each_value_2 = /*keys*/ ctx[39];
    	validate_each_argument(each_value_2);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_2.length; i += 1) {
    		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");
    			html_tag = new HtmlTag(false);
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			html_tag.a = t;
    			attr_dev(div, "class", "row row--" + /*i*/ ctx[38] + " svelte-w0k3hv");
    			add_location(div, file$3, 163, 8, 3855);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			html_tag.m(raw_value, div);
    			append_dev(div, t);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*boxsize, boxshadowcolor, rowData, keyClass, active, pressed, keybackground, onKeyStart, onKeyEnd, keycolor*/ 1919) {
    				each_value_2 = /*keys*/ ctx[39];
    				validate_each_argument(each_value_2);
    				let i;

    				for (i = 0; i < each_value_2.length; i += 1) {
    					const child_ctx = get_each_context_2(ctx, each_value_2, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_2.length;
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block_1.name,
    		type: "each",
    		source: "(163:6) {#each row as keys, j}",
    		ctx
    	});

    	return block;
    }

    // (161:2) {#each rowData as row, i}
    function create_each_block$2(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[36];
    	validate_each_argument(each_value_1);
    	let each_blocks = [];

    	for (let i = 0; i < each_value_1.length; i += 1) {
    		each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t = space();
    			attr_dev(div, "class", "page svelte-w0k3hv");
    			toggle_class(div, "visible", /*i*/ ctx[38] === /*page*/ ctx[7]);
    			add_location(div, file$3, 161, 4, 3772);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData, boxsize, boxshadowcolor, keyClass, active, pressed, keybackground, onKeyStart, onKeyEnd, keycolor, shiftKeys*/ 3967) {
    				each_value_1 = /*row*/ ctx[36];
    				validate_each_argument(each_value_1);
    				let i;

    				for (i = 0; i < each_value_1.length; i += 1) {
    					const child_ctx = get_each_context_1(ctx, each_value_1, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block_1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, t);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value_1.length;
    			}

    			if (dirty[0] & /*page*/ 128) {
    				toggle_class(div, "visible", /*i*/ ctx[38] === /*page*/ ctx[7]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$2.name,
    		type: "each",
    		source: "(161:2) {#each rowData as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div;
    	let each_value = /*rowData*/ ctx[8];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$2(get_each_context$2(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-keyboard");
    			add_location(div, file$3, 159, 0, 3710);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*page, rowData, boxsize, boxshadowcolor, keyClass, active, pressed, keybackground, onKeyStart, onKeyEnd, keycolor, shiftKeys*/ 4095) {
    				each_value = /*rowData*/ ctx[8];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$2(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$2(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function instance$3($$self, $$props, $$invalidate) {
    	let rawData;
    	let data;
    	let page0;
    	let page1;
    	let rows0;
    	let rows1;
    	let rowData0;
    	let rowData1;
    	let rowData;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Keyboard', slots, []);
    	let { custom } = $$props;
    	let { localizationLayout = "qwerty" } = $$props;
    	let { layout = "standard" } = $$props;
    	let { noSwap = [] } = $$props;
    	let { keyClass = {} } = $$props;
    	keyClass[";"] = "half";
    	let { timestamp } = $$props;
    	let { keycolor } = $$props;
    	let { keybackground } = $$props;
    	let { boxshadowcolor } = $$props;
    	let { boxsize } = $$props;

    	// vars
    	let page = 0;

    	let { shifted = false } = $$props;
    	let active = undefined;
    	let { pressed } = $$props;

    	// Use later
    	let upperCase = false;

    	const layouts = {
    		qwerty: {
    			standard: keys,
    			crossword: qwertyCrossword,
    			wordle: qwertyWordle
    		},
    		azerty: {
    			standard: azertyStandard,
    			crossword: azertyCrossword,
    			wordle: azertyWordle
    		}
    	};

    	const dispatch = createEventDispatcher();

    	const swaps = {
    		Page0: "cap",
    		Page1: "?123",
    		Space: " ",
    		Shift: "cap",
    		Enter: enterSVG,
    		Backspace: backspaceSVG
    	};

    	// functions
    	const unique = arr => [...new Set(arr)];

    	const onKeyStart = (event, value) => {
    		$$invalidate(13, timestamp = Date.now());
    		event.preventDefault();

    		//console.log(value)
    		$$invalidate(6, active = value);

    		if (value != undefined && value.includes("Page")) {
    			$$invalidate(7, page = +value?.substr(-1));
    		} else if (value === "Shift") {
    			$$invalidate(12, shifted = !shifted);
    		} else {
    			let output = value; //|| "";
    			if (shifted && alphabet.includes(value)) output = value.toUpperCase() || "";
    			dispatch("keydown", output);
    		}

    		event.stopPropagation();
    		$$invalidate(0, pressed = undefined);
    		return false;
    	};

    	const onKeyEnd = value => {
    		setTimeout(
    			() => {
    				$$invalidate(0, pressed = active);

    				if (value === active) {
    					//  active = undefined;
    					$$invalidate(0, pressed = active);
    				}
    			},
    			50
    		);
    	};

    	//$: active = pressed;
    	let indent = 0;

    	const shiftKeys = m => {
    		if (m > 2) return "";
    		let spaces = "";

    		for (let i = 0; i < m; i++) {
    			spaces += "&nbsp;&nbsp&nbsp";
    		}

    		return spaces;
    	};

    	const writable_props = [
    		'custom',
    		'localizationLayout',
    		'layout',
    		'noSwap',
    		'keyClass',
    		'timestamp',
    		'keycolor',
    		'keybackground',
    		'boxshadowcolor',
    		'boxsize',
    		'shifted',
    		'pressed'
    	];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const touchstart_handler = (value, e) => onKeyStart(e, value);
    	const mousedown_handler = (value, e) => onKeyStart(e, value);
    	const touchend_handler = value => onKeyEnd(value);
    	const mouseup_handler = value => onKeyEnd(value);

    	$$self.$$set = $$props => {
    		if ('custom' in $$props) $$invalidate(14, custom = $$props.custom);
    		if ('localizationLayout' in $$props) $$invalidate(15, localizationLayout = $$props.localizationLayout);
    		if ('layout' in $$props) $$invalidate(16, layout = $$props.layout);
    		if ('noSwap' in $$props) $$invalidate(17, noSwap = $$props.noSwap);
    		if ('keyClass' in $$props) $$invalidate(1, keyClass = $$props.keyClass);
    		if ('timestamp' in $$props) $$invalidate(13, timestamp = $$props.timestamp);
    		if ('keycolor' in $$props) $$invalidate(2, keycolor = $$props.keycolor);
    		if ('keybackground' in $$props) $$invalidate(3, keybackground = $$props.keybackground);
    		if ('boxshadowcolor' in $$props) $$invalidate(4, boxshadowcolor = $$props.boxshadowcolor);
    		if ('boxsize' in $$props) $$invalidate(5, boxsize = $$props.boxsize);
    		if ('shifted' in $$props) $$invalidate(12, shifted = $$props.shifted);
    		if ('pressed' in $$props) $$invalidate(0, pressed = $$props.pressed);
    	};

    	$$self.$capture_state = () => ({
    		createEventDispatcher,
    		qwertyStandard: keys,
    		qwertyCrossword,
    		qwertyWordle,
    		azertyStandard,
    		azertyCrossword,
    		azertyWordle,
    		backspaceSVG,
    		enterSVG,
    		custom,
    		localizationLayout,
    		layout,
    		noSwap,
    		keyClass,
    		timestamp,
    		keycolor,
    		keybackground,
    		boxshadowcolor,
    		boxsize,
    		page,
    		shifted,
    		active,
    		pressed,
    		upperCase,
    		layouts,
    		dispatch,
    		alphabet,
    		swaps,
    		unique,
    		onKeyStart,
    		onKeyEnd,
    		indent,
    		shiftKeys,
    		rowData1,
    		rowData0,
    		rowData,
    		page1,
    		rows0,
    		page0,
    		rows1,
    		data,
    		rawData
    	});

    	$$self.$inject_state = $$props => {
    		if ('custom' in $$props) $$invalidate(14, custom = $$props.custom);
    		if ('localizationLayout' in $$props) $$invalidate(15, localizationLayout = $$props.localizationLayout);
    		if ('layout' in $$props) $$invalidate(16, layout = $$props.layout);
    		if ('noSwap' in $$props) $$invalidate(17, noSwap = $$props.noSwap);
    		if ('keyClass' in $$props) $$invalidate(1, keyClass = $$props.keyClass);
    		if ('timestamp' in $$props) $$invalidate(13, timestamp = $$props.timestamp);
    		if ('keycolor' in $$props) $$invalidate(2, keycolor = $$props.keycolor);
    		if ('keybackground' in $$props) $$invalidate(3, keybackground = $$props.keybackground);
    		if ('boxshadowcolor' in $$props) $$invalidate(4, boxshadowcolor = $$props.boxshadowcolor);
    		if ('boxsize' in $$props) $$invalidate(5, boxsize = $$props.boxsize);
    		if ('page' in $$props) $$invalidate(7, page = $$props.page);
    		if ('shifted' in $$props) $$invalidate(12, shifted = $$props.shifted);
    		if ('active' in $$props) $$invalidate(6, active = $$props.active);
    		if ('pressed' in $$props) $$invalidate(0, pressed = $$props.pressed);
    		if ('upperCase' in $$props) upperCase = $$props.upperCase;
    		if ('indent' in $$props) indent = $$props.indent;
    		if ('rowData1' in $$props) $$invalidate(18, rowData1 = $$props.rowData1);
    		if ('rowData0' in $$props) $$invalidate(19, rowData0 = $$props.rowData0);
    		if ('rowData' in $$props) $$invalidate(8, rowData = $$props.rowData);
    		if ('page1' in $$props) $$invalidate(20, page1 = $$props.page1);
    		if ('rows0' in $$props) $$invalidate(21, rows0 = $$props.rows0);
    		if ('page0' in $$props) $$invalidate(22, page0 = $$props.page0);
    		if ('rows1' in $$props) $$invalidate(23, rows1 = $$props.rows1);
    		if ('data' in $$props) $$invalidate(24, data = $$props.data);
    		if ('rawData' in $$props) $$invalidate(25, rawData = $$props.rawData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pressed, active*/ 65) {
    			// reactive vars
    			if (!pressed) {
    				setTimeout(
    					() => {
    						{
    							$$invalidate(0, pressed = active);
    						}
    					},
    					100
    				);
    			} else {
    				$$invalidate(6, active = pressed);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*custom, localizationLayout, layout*/ 114688) {
    			$$invalidate(25, rawData = custom || layouts[localizationLayout][layout] || standard);
    		}

    		if ($$self.$$.dirty[0] & /*rawData, noSwap, shifted*/ 33689600) {
    			$$invalidate(24, data = rawData.map(d => {
    				//console.log("foo", d)
    				let display = d.display;

    				const s = swaps[d.value];
    				const shouldSwap = s && !noSwap.includes(d.value) && !d.noSwap;

    				//console.log("bar")
    				if (shouldSwap) display = s;

    				if (!display && d.value) display = shifted
    				? d.value.toUpperCase() || ""
    				: d.value.toLowerCase() || "";

    				if (d.value === "Shift") display = shifted ? s || "" : s.toUpperCase() || "";
    				return { ...d, display };
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 16777216) {
    			$$invalidate(22, page0 = data.filter(d => !d.page));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 16777216) {
    			$$invalidate(20, page1 = data.filter(d => d.page));
    		}

    		if ($$self.$$.dirty[0] & /*page0*/ 4194304) {
    			$$invalidate(21, rows0 = unique(page0.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0*/ 2097152) {
    			(rows0.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*page1*/ 1048576) {
    			$$invalidate(23, rows1 = unique(page1.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows1*/ 8388608) {
    			(rows1.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page0*/ 6291456) {
    			$$invalidate(19, rowData0 = rows0.map(r => page0.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page1*/ 3145728) {
    			$$invalidate(18, rowData1 = rows0.map(r => page1.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rowData0, rowData1*/ 786432) {
    			$$invalidate(8, rowData = [rowData0, rowData1]);
    		}
    	};

    	return [
    		pressed,
    		keyClass,
    		keycolor,
    		keybackground,
    		boxshadowcolor,
    		boxsize,
    		active,
    		page,
    		rowData,
    		onKeyStart,
    		onKeyEnd,
    		shiftKeys,
    		shifted,
    		timestamp,
    		custom,
    		localizationLayout,
    		layout,
    		noSwap,
    		rowData1,
    		rowData0,
    		page1,
    		rows0,
    		page0,
    		rows1,
    		data,
    		rawData,
    		touchstart_handler,
    		mousedown_handler,
    		touchend_handler,
    		mouseup_handler
    	];
    }

    class Keyboard extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance$3,
    			create_fragment$3,
    			safe_not_equal,
    			{
    				custom: 14,
    				localizationLayout: 15,
    				layout: 16,
    				noSwap: 17,
    				keyClass: 1,
    				timestamp: 13,
    				keycolor: 2,
    				keybackground: 3,
    				boxshadowcolor: 4,
    				boxsize: 5,
    				shifted: 12,
    				pressed: 0
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*custom*/ ctx[14] === undefined && !('custom' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'custom'");
    		}

    		if (/*timestamp*/ ctx[13] === undefined && !('timestamp' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'timestamp'");
    		}

    		if (/*keycolor*/ ctx[2] === undefined && !('keycolor' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'keycolor'");
    		}

    		if (/*keybackground*/ ctx[3] === undefined && !('keybackground' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'keybackground'");
    		}

    		if (/*boxshadowcolor*/ ctx[4] === undefined && !('boxshadowcolor' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'boxshadowcolor'");
    		}

    		if (/*boxsize*/ ctx[5] === undefined && !('boxsize' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'boxsize'");
    		}

    		if (/*pressed*/ ctx[0] === undefined && !('pressed' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'pressed'");
    		}
    	}

    	get custom() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set custom(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get localizationLayout() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set localizationLayout(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get layout() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set layout(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get noSwap() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set noSwap(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keyClass() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keyClass(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timestamp() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timestamp(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keycolor() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keycolor(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get keybackground() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set keybackground(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boxshadowcolor() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boxshadowcolor(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get boxsize() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set boxsize(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shifted() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shifted(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pressed() {
    		throw new Error("<Keyboard>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pressed(value) {
    		throw new Error("<Keyboard>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const shortcut = (node, params) => {
        let handler;
        const removeHandler = () => window.removeEventListener('keydown', handler), setHandler = () => {
            removeHandler();
            if (!params)
                return;
            if (typeof params.code == "string") {
                handler = (e) => {
                    if ((!!params.alt != e.altKey) ||
                        (!!params.shift != e.shiftKey) ||
                        (!!params.control != (e.ctrlKey || e.metaKey)) ||
                        params.code != e.code)
                        return;
                    e.preventDefault();
                    params.callback ? params.callback(e.code) : node.click();
                };
                window.addEventListener('keydown', handler);
            } else {
                for ( const code of params.code) {
                    handler = (e) => {
                        if ((!!params.alt != e.altKey) ||
                            (!!params.shift != e.shiftKey) ||
                            (!!params.control != (e.ctrlKey || e.metaKey)) ||
                            code != e.code)
                            return;
                        e.preventDefault();
                        params.callback ? params.callback(e.code) : node.click();
                    };
                    window.addEventListener('keydown', handler);
                    
                }
                
                

            }

            


        };
        setHandler();
        return {
            update: setHandler,
            destroy: removeHandler,
        };

    };

    function bounceOut(t) {
        const a = 4.0 / 11.0;
        const b = 8.0 / 11.0;
        const c = 9.0 / 10.0;
        const ca = 4356.0 / 361.0;
        const cb = 35442.0 / 1805.0;
        const cc = 16061.0 / 1805.0;
        const t2 = t * t;
        return t < a
            ? 7.5625 * t2
            : t < b
                ? 9.075 * t2 - 9.9 * t + 3.4
                : t < c
                    ? ca * t2 - cb * t + cc
                    : 10.8 * t * t - 20.52 * t + 10.72;
    }
    function bounceInOut(t) {
        return t < 0.5
            ? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
            : 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
    }
    function circIn(t) {
        return 1.0 - Math.sqrt(1.0 - t * t);
    }
    function circOut(t) {
        return Math.sqrt(1 - --t * t);
    }
    function cubicIn(t) {
        return t * t * t;
    }
    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }
    function elasticOut(t) {
        return (Math.sin((-13.0 * (t + 1.0) * Math.PI) / 2) * Math.pow(2.0, -10.0 * t) + 1.0);
    }
    function quadIn(t) {
        return t * t;
    }
    function quintIn(t) {
        return t * t * t * t * t;
    }
    function quintOut(t) {
        return --t * t * t * t * t + 1;
    }
    function sineInOut(t) {
        return -0.5 * (Math.cos(Math.PI * t) - 1);
    }
    function sineIn(t) {
        const v = Math.cos(t * Math.PI * 0.5);
        if (Math.abs(v) < 1e-14)
            return 1;
        else
            return 1 - v;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity } = {}) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }
    function slide(node, { delay = 0, duration = 400, easing = cubicOut } = {}) {
        const style = getComputedStyle(node);
        const opacity = +style.opacity;
        const height = parseFloat(style.height);
        const padding_top = parseFloat(style.paddingTop);
        const padding_bottom = parseFloat(style.paddingBottom);
        const margin_top = parseFloat(style.marginTop);
        const margin_bottom = parseFloat(style.marginBottom);
        const border_top_width = parseFloat(style.borderTopWidth);
        const border_bottom_width = parseFloat(style.borderBottomWidth);
        return {
            delay,
            duration,
            easing,
            css: t => 'overflow: hidden;' +
                `opacity: ${Math.min(t * 20, 1) * opacity};` +
                `height: ${t * height}px;` +
                `padding-top: ${t * padding_top}px;` +
                `padding-bottom: ${t * padding_bottom}px;` +
                `margin-top: ${t * margin_top}px;` +
                `margin-bottom: ${t * margin_bottom}px;` +
                `border-top-width: ${t * border_top_width}px;` +
                `border-bottom-width: ${t * border_bottom_width}px;`
        };
    }
    function scale(node, { delay = 0, duration = 400, easing = cubicOut, start = 0, opacity = 0 } = {}) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const sd = 1 - start;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (_t, u) => `
			transform: ${transform} scale(${1 - (sd * u)});
			opacity: ${target_opacity - (od * u)}
		`
        };
    }

    function flip(node, { from, to }, params = {}) {
        const style = getComputedStyle(node);
        const transform = style.transform === 'none' ? '' : style.transform;
        const [ox, oy] = style.transformOrigin.split(' ').map(parseFloat);
        const dx = (from.left + from.width * ox / to.width) - (to.left + ox);
        const dy = (from.top + from.height * oy / to.height) - (to.top + oy);
        const { delay = 0, duration = (d) => Math.sqrt(d) * 120, easing = cubicOut } = params;
        return {
            delay,
            duration: is_function(duration) ? duration(Math.sqrt(dx * dx + dy * dy)) : duration,
            easing,
            css: (t, u) => {
                const x = u * dx;
                const y = u * dy;
                const sx = t + u * from.width / to.width;
                const sy = t + u * from.height / to.height;
                return `transform: ${transform} translate(${x}px, ${y}px) scale(${sx}, ${sy});`;
            }
        };
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    function is_date(obj) {
        return Object.prototype.toString.call(obj) === '[object Date]';
    }

    function get_interpolator(a, b) {
        if (a === b || a !== a)
            return () => a;
        const type = typeof a;
        if (type !== typeof b || Array.isArray(a) !== Array.isArray(b)) {
            throw new Error('Cannot interpolate values of different type');
        }
        if (Array.isArray(a)) {
            const arr = b.map((bi, i) => {
                return get_interpolator(a[i], bi);
            });
            return t => arr.map(fn => fn(t));
        }
        if (type === 'object') {
            if (!a || !b)
                throw new Error('Object cannot be null');
            if (is_date(a) && is_date(b)) {
                a = a.getTime();
                b = b.getTime();
                const delta = b - a;
                return t => new Date(a + t * delta);
            }
            const keys = Object.keys(b);
            const interpolators = {};
            keys.forEach(key => {
                interpolators[key] = get_interpolator(a[key], b[key]);
            });
            return t => {
                const result = {};
                keys.forEach(key => {
                    result[key] = interpolators[key](t);
                });
                return result;
            };
        }
        if (type === 'number') {
            const delta = b - a;
            return t => a + t * delta;
        }
        throw new Error(`Cannot interpolate ${type} values`);
    }
    function tweened(value, defaults = {}) {
        const store = writable(value);
        let task;
        let target_value = value;
        function set(new_value, opts) {
            if (value == null) {
                store.set(value = new_value);
                return Promise.resolve();
            }
            target_value = new_value;
            let previous_task = task;
            let started = false;
            let { delay = 0, duration = 400, easing = identity, interpolate = get_interpolator } = assign(assign({}, defaults), opts);
            if (duration === 0) {
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                store.set(value = target_value);
                return Promise.resolve();
            }
            const start = now() + delay;
            let fn;
            task = loop(now => {
                if (now < start)
                    return true;
                if (!started) {
                    fn = interpolate(value, new_value);
                    if (typeof duration === 'function')
                        duration = duration(value, new_value);
                    started = true;
                }
                if (previous_task) {
                    previous_task.abort();
                    previous_task = null;
                }
                const elapsed = now - start;
                if (elapsed > duration) {
                    store.set(value = new_value);
                    return false;
                }
                // @ts-ignore
                store.set(value = fn(easing(elapsed / duration)));
                return true;
            });
            return task.promise;
        }
        return {
            set,
            update: (fn, opts) => set(fn(target_value, value), opts),
            subscribe: store.subscribe
        };
    }

    /* src/Switch.svelte generated by Svelte v3.49.0 */

    const file$2 = "src/Switch.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[11] = list[i];
    	return child_ctx;
    }

    // (57:0) {:else}
    function create_else_block$1(ctx) {
    	let div2;
    	let div1;
    	let div0;
    	let t0;
    	let t1;
    	let each_value = /*options*/ ctx[4];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "legend");
    			attr_dev(div0, "id", `label-${/*uniqueID*/ ctx[6]}`);
    			add_location(div0, file$2, 63, 4, 1781);
    			attr_dev(div1, "role", "radiogroup");
    			attr_dev(div1, "class", "group-container svelte-18nsj0r");
    			attr_dev(div1, "aria-labelledby", `label-${/*uniqueID*/ ctx[6]}`);
    			set_style(div1, "font-size", /*fontSize*/ ctx[5] + "px");
    			attr_dev(div1, "id", `group-${/*uniqueID*/ ctx[6]}`);
    			add_location(div1, file$2, 58, 4, 1614);
    			attr_dev(div2, "class", "s s--multi svelte-18nsj0r");
    			add_location(div2, file$2, 57, 0, 1585);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div2, anchor);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div0, t0);
    			append_dev(div1, t1);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div1, null);
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 4) set_data_dev(t0, /*label*/ ctx[2]);

    			if (dirty & /*options, uniqueID, value*/ 81) {
    				each_value = /*options*/ ctx[4];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(div1, null);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}

    			if (dirty & /*fontSize*/ 32) {
    				set_style(div1, "font-size", /*fontSize*/ ctx[5] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div2);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(57:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (47:29) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let span;
    	let t0;
    	let t1;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span = element("span");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			button = element("button");
    			attr_dev(span, "id", `switch-${/*uniqueID*/ ctx[6]}`);
    			add_location(span, file$2, 48, 4, 1365);
    			attr_dev(button, "role", "switch");
    			attr_dev(button, "aria-checked", /*checked*/ ctx[1]);
    			attr_dev(button, "aria-labelledby", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(button, "class", "svelte-18nsj0r");
    			add_location(button, file$2, 49, 4, 1416);
    			attr_dev(div, "class", "s s--slider svelte-18nsj0r");
    			set_style(div, "font-size", /*fontSize*/ ctx[5] + "px");
    			add_location(div, file$2, 47, 0, 1304);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span);
    			append_dev(span, t0);
    			append_dev(div, t1);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 4) set_data_dev(t0, /*label*/ ctx[2]);

    			if (dirty & /*checked*/ 2) {
    				attr_dev(button, "aria-checked", /*checked*/ ctx[1]);
    			}

    			if (dirty & /*fontSize*/ 32) {
    				set_style(div, "font-size", /*fontSize*/ ctx[5] + "px");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(47:29) ",
    		ctx
    	});

    	return block;
    }

    // (35:0) {#if design == 'inner'}
    function create_if_block$1(ctx) {
    	let div;
    	let span0;
    	let t0;
    	let t1;
    	let button;
    	let span1;
    	let t3;
    	let span2;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			span0 = element("span");
    			t0 = text(/*label*/ ctx[2]);
    			t1 = space();
    			button = element("button");
    			span1 = element("span");
    			span1.textContent = "on";
    			t3 = space();
    			span2 = element("span");
    			span2.textContent = "off";
    			attr_dev(span0, "id", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(span0, "class", "svelte-18nsj0r");
    			add_location(span0, file$2, 36, 4, 1005);
    			attr_dev(span1, "class", "svelte-18nsj0r");
    			add_location(span1, file$2, 42, 12, 1208);
    			attr_dev(span2, "class", "svelte-18nsj0r");
    			add_location(span2, file$2, 43, 12, 1236);
    			attr_dev(button, "role", "switch");
    			attr_dev(button, "aria-checked", /*checked*/ ctx[1]);
    			attr_dev(button, "aria-labelledby", `switch-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(button, "class", "svelte-18nsj0r");
    			add_location(button, file$2, 37, 4, 1056);
    			attr_dev(div, "class", "s s--inner svelte-18nsj0r");
    			add_location(div, file$2, 35, 0, 976);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, span0);
    			append_dev(span0, t0);
    			append_dev(div, t1);
    			append_dev(div, button);
    			append_dev(button, span1);
    			append_dev(button, t3);
    			append_dev(button, span2);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*handleClick*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*label*/ 4) set_data_dev(t0, /*label*/ ctx[2]);

    			if (dirty & /*checked*/ 2) {
    				attr_dev(button, "aria-checked", /*checked*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(35:0) {#if design == 'inner'}",
    		ctx
    	});

    	return block;
    }

    // (65:8) {#each options as option}
    function create_each_block$1(ctx) {
    	let input;
    	let input_id_value;
    	let input_value_value;
    	let t0;
    	let label_1;
    	let t1_value = /*option*/ ctx[11] + "";
    	let t1;
    	let t2;
    	let label_1_for_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			input = element("input");
    			t0 = space();
    			label_1 = element("label");
    			t1 = text(t1_value);
    			t2 = space();
    			attr_dev(input, "type", "radio");
    			attr_dev(input, "id", input_id_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`);
    			input.__value = input_value_value = /*option*/ ctx[11];
    			input.value = input.__value;
    			attr_dev(input, "class", "svelte-18nsj0r");
    			/*$$binding_groups*/ ctx[9][0].push(input);
    			add_location(input, file$2, 65, 12, 1886);
    			attr_dev(label_1, "for", label_1_for_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`);
    			attr_dev(label_1, "class", "svelte-18nsj0r");
    			add_location(label_1, file$2, 66, 12, 1982);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, input, anchor);
    			input.checked = input.__value === /*value*/ ctx[0];
    			insert_dev(target, t0, anchor);
    			insert_dev(target, label_1, anchor);
    			append_dev(label_1, t1);
    			append_dev(label_1, t2);

    			if (!mounted) {
    				dispose = listen_dev(input, "change", /*input_change_handler*/ ctx[8]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*options*/ 16 && input_id_value !== (input_id_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`)) {
    				attr_dev(input, "id", input_id_value);
    			}

    			if (dirty & /*options*/ 16 && input_value_value !== (input_value_value = /*option*/ ctx[11])) {
    				prop_dev(input, "__value", input_value_value);
    				input.value = input.__value;
    			}

    			if (dirty & /*value*/ 1) {
    				input.checked = input.__value === /*value*/ ctx[0];
    			}

    			if (dirty & /*options*/ 16 && t1_value !== (t1_value = /*option*/ ctx[11] + "")) set_data_dev(t1, t1_value);

    			if (dirty & /*options*/ 16 && label_1_for_value !== (label_1_for_value = `${/*option*/ ctx[11]}-${/*uniqueID*/ ctx[6]}`)) {
    				attr_dev(label_1, "for", label_1_for_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(input);
    			/*$$binding_groups*/ ctx[9][0].splice(/*$$binding_groups*/ ctx[9][0].indexOf(input), 1);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(label_1);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(65:8) {#each options as option}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let if_block_anchor;

    	function select_block_type(ctx, dirty) {
    		if (/*design*/ ctx[3] == 'inner') return create_if_block$1;
    		if (/*design*/ ctx[3] == 'slider') return create_if_block_1$1;
    		return create_else_block$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type(ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if_block.d(1);
    				if_block = current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Switch', slots, []);
    	let { label } = $$props;
    	let { design = 'inner label' } = $$props;
    	let { options = [] } = $$props;
    	let { fontSize = 16 } = $$props;
    	let { value = 'on' } = $$props;
    	let { checked = value == 'on' ? true : false } = $$props;
    	const uniqueID = Math.floor(Math.random() * 100);

    	function handleClick(event) {
    		const target = event.target;
    		const state = target.getAttribute('aria-checked');
    		$$invalidate(1, checked = state === 'true' ? false : true);
    		$$invalidate(0, value = checked === true ? 'on' : 'off');
    	}

    	const slugify = (str = "") => str.toLowerCase().replace(/ /g, "-").replace(/\./g, "");
    	const writable_props = ['label', 'design', 'options', 'fontSize', 'value', 'checked'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Switch> was created with unknown prop '${key}'`);
    	});

    	const $$binding_groups = [[]];

    	function input_change_handler() {
    		value = this.__value;
    		$$invalidate(0, value);
    	}

    	$$self.$$set = $$props => {
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('design' in $$props) $$invalidate(3, design = $$props.design);
    		if ('options' in $$props) $$invalidate(4, options = $$props.options);
    		if ('fontSize' in $$props) $$invalidate(5, fontSize = $$props.fontSize);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('checked' in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	$$self.$capture_state = () => ({
    		label,
    		design,
    		options,
    		fontSize,
    		value,
    		checked,
    		uniqueID,
    		handleClick,
    		slugify
    	});

    	$$self.$inject_state = $$props => {
    		if ('label' in $$props) $$invalidate(2, label = $$props.label);
    		if ('design' in $$props) $$invalidate(3, design = $$props.design);
    		if ('options' in $$props) $$invalidate(4, options = $$props.options);
    		if ('fontSize' in $$props) $$invalidate(5, fontSize = $$props.fontSize);
    		if ('value' in $$props) $$invalidate(0, value = $$props.value);
    		if ('checked' in $$props) $$invalidate(1, checked = $$props.checked);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		value,
    		checked,
    		label,
    		design,
    		options,
    		fontSize,
    		uniqueID,
    		handleClick,
    		input_change_handler,
    		$$binding_groups
    	];
    }

    class Switch extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			label: 2,
    			design: 3,
    			options: 4,
    			fontSize: 5,
    			value: 0,
    			checked: 1
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Switch",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*label*/ ctx[2] === undefined && !('label' in props)) {
    			console.warn("<Switch> was created without expected prop 'label'");
    		}
    	}

    	get label() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set label(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get design() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set design(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get options() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set options(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get fontSize() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set fontSize(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get value() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set value(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get checked() {
    		throw new Error("<Switch>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set checked(value) {
    		throw new Error("<Switch>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/SoundTest.svelte generated by Svelte v3.49.0 */

    const file$1 = "src/SoundTest.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	child_ctx[7] = i;
    	return child_ctx;
    }

    // (12:0) {#each sound as f, i}
    function create_each_block(ctx) {
    	let button;
    	let t0;
    	let t1_value = /*i*/ ctx[7] + 1 + "";
    	let t1;
    	let mounted;
    	let dispose;

    	function click_handler() {
    		return /*click_handler*/ ctx[4](/*f*/ ctx[5]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			t0 = text("sound ");
    			t1 = text(t1_value);
    			add_location(button, file$1, 13, 0, 261);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, t0);
    			append_dev(button, t1);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", click_handler, false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(12:0) {#each sound as f, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let audio_1;
    	let audio_1_src_value;
    	let t;
    	let each_1_anchor;
    	let each_value = /*sound*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			audio_1 = element("audio");
    			t = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    			if (!src_url_equal(audio_1.src, audio_1_src_value = "")) attr_dev(audio_1, "src", audio_1_src_value);
    			add_location(audio_1, file$1, 10, 0, 197);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio_1, anchor);
    			/*audio_1_binding*/ ctx[3](audio_1);
    			insert_dev(target, t, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*audio, sound*/ 3) {
    				each_value = /*sound*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				for (; i < each_blocks.length; i += 1) {
    					each_blocks[i].d(1);
    				}

    				each_blocks.length = each_value.length;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(audio_1);
    			/*audio_1_binding*/ ctx[3](null);
    			if (detaching) detach_dev(t);
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('SoundTest', slots, []);
    	let audio;
    	let { randomNumber } = $$props;
    	const sound = [];

    	for (let index = 0; index < 50; index++) {
    		sound.push(`sounds/powerup (${index + 1}).wav`);
    	}

    	const writable_props = ['randomNumber'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<SoundTest> was created with unknown prop '${key}'`);
    	});

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audio = $$value;
    			$$invalidate(0, audio);
    		});
    	}

    	const click_handler = f => {
    		$$invalidate(0, audio.src = f, audio);
    		audio.play();
    	};

    	$$self.$$set = $$props => {
    		if ('randomNumber' in $$props) $$invalidate(2, randomNumber = $$props.randomNumber);
    	};

    	$$self.$capture_state = () => ({ audio, randomNumber, sound });

    	$$self.$inject_state = $$props => {
    		if ('audio' in $$props) $$invalidate(0, audio = $$props.audio);
    		if ('randomNumber' in $$props) $$invalidate(2, randomNumber = $$props.randomNumber);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [audio, sound, randomNumber, audio_1_binding, click_handler];
    }

    class SoundTest extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { randomNumber: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "SoundTest",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*randomNumber*/ ctx[2] === undefined && !('randomNumber' in props)) {
    			console.warn("<SoundTest> was created without expected prop 'randomNumber'");
    		}
    	}

    	get randomNumber() {
    		throw new Error("<SoundTest>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set randomNumber(value) {
    		throw new Error("<SoundTest>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    // (373:5) {:else}
    function create_else_block_1(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("View key map");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(373:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (371:5) {#if showLayout}
    function create_if_block_3(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Hide");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(371:5) {#if showLayout}",
    		ctx
    	});

    	return block;
    }

    // (382:5) {:else}
    function create_else_block(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Start");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(382:5) {:else}",
    		ctx
    	});

    	return block;
    }

    // (380:5) {#if slideshow}
    function create_if_block_2(ctx) {
    	let t;

    	const block = {
    		c: function create() {
    			t = text("Stop");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(380:5) {#if slideshow}",
    		ctx
    	});

    	return block;
    }

    // (401:1) {#if showLayout}
    function create_if_block_1(ctx) {
    	let center;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			center = element("center");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "./keyboard.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "class", "svelte-1sthij4");
    			add_location(img, file, 402, 3, 8782);
    			add_location(center, file, 401, 2, 8770);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, center, anchor);
    			append_dev(center, img);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(center);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(401:1) {#if showLayout}",
    		ctx
    	});

    	return block;
    }

    // (435:5) {#if hangulCharacter}
    function create_if_block(ctx) {
    	let div1;
    	let div0;

    	let t_value = (/*hangulCharacter*/ ctx[6] == "undefined"
    	? /*funnyface*/ ctx[17]()
    	: /*hangulCharacter*/ ctx[6]) + "";

    	let t;
    	let div0_intro;
    	let div1_intro;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = text(t_value);
    			add_location(div0, file, 444, 7, 9626);
    			add_location(div1, file, 435, 6, 9481);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div0, t);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (dirty[0] & /*hangulCharacter*/ 64 && t_value !== (t_value = (/*hangulCharacter*/ ctx[6] == "undefined"
    			? /*funnyface*/ ctx[17]()
    			: /*hangulCharacter*/ ctx[6]) + "")) set_data_dev(t, t_value);
    		},
    		i: function intro(local) {
    			if (!div0_intro) {
    				add_render_callback(() => {
    					div0_intro = create_in_transition(div0, /*spin*/ ctx[26], { duration: 1200 });
    					div0_intro.start();
    				});
    			}

    			if (!div1_intro) {
    				add_render_callback(() => {
    					div1_intro = create_in_transition(div1, fly, {
    						easing: cubicIn,
    						start: 0.5,
    						opacity: 0.5,
    						x: 0,
    						y: -320
    					});

    					div1_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(435:5) {#if hangulCharacter}",
    		ctx
    	});

    	return block;
    }

    // (429:3) {#key timestamp}
    function create_key_block(ctx) {
    	let div;
    	let div_intro;
    	let if_block = /*hangulCharacter*/ ctx[6] && create_if_block(ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div, "class", "hangul svelte-1sthij4");
    			set_style(div, "color", "#" + /*$color*/ ctx[10]);
    			add_location(div, file, 429, 4, 9350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*hangulCharacter*/ ctx[6]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty[0] & /*hangulCharacter*/ 64) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty[0] & /*$color*/ 1024) {
    				set_style(div, "color", "#" + /*$color*/ ctx[10]);
    			}
    		},
    		i: function intro(local) {
    			transition_in(if_block);

    			if (!div_intro) {
    				add_render_callback(() => {
    					div_intro = create_in_transition(div, scale, { easing: cubicOut });
    					div_intro.start();
    				});
    			}
    		},
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_key_block.name,
    		type: "key",
    		source: "(429:3) {#key timestamp}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let nav;
    	let audio_1;
    	let audio_1_src_value;
    	let t0;
    	let div0;
    	let soundtest;
    	let t1;
    	let span0;
    	let h1;
    	let t3;
    	let small;
    	let i;
    	let t5;
    	let br;
    	let t6;
    	let table;
    	let tr;
    	let td0;
    	let span1;
    	let t8;
    	let td1;
    	let button0;
    	let t9;
    	let td2;
    	let button1;
    	let t10;
    	let t11;
    	let td3;
    	let switch0;
    	let updating_checked;
    	let t12;
    	let td4;
    	let switch1;
    	let updating_checked_1;
    	let t13;
    	let t14;
    	let main;
    	let div1;
    	let center;
    	let p;
    	let keyboard;
    	let updating_pressed;
    	let updating_shifted;
    	let updating_timestamp;
    	let updating_keycolor;
    	let updating_keybackground;
    	let updating_boxshadowcolor;
    	let updating_boxsize;
    	let t15;
    	let previous_key = /*timestamp*/ ctx[2];
    	let current;
    	let mounted;
    	let dispose;

    	soundtest = new SoundTest({
    			props: { randomNumber: /*randomNumber*/ ctx[16] },
    			$$inline: true
    		});

    	function select_block_type(ctx, dirty) {
    		if (/*showLayout*/ ctx[8]) return create_if_block_3;
    		return create_else_block_1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block0 = current_block_type(ctx);

    	function select_block_type_1(ctx, dirty) {
    		if (/*slideshow*/ ctx[7]) return create_if_block_2;
    		return create_else_block;
    	}

    	let current_block_type_1 = select_block_type_1(ctx);
    	let if_block1 = current_block_type_1(ctx);

    	function switch0_checked_binding(value) {
    		/*switch0_checked_binding*/ ctx[36](value);
    	}

    	let switch0_props = { label: "Randomize", design: "inner" };

    	if (/*randomize*/ ctx[9] !== void 0) {
    		switch0_props.checked = /*randomize*/ ctx[9];
    	}

    	switch0 = new Switch({ props: switch0_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch0, 'checked', switch0_checked_binding));

    	function switch1_checked_binding(value) {
    		/*switch1_checked_binding*/ ctx[37](value);
    	}

    	let switch1_props = { label: "Sound", design: "inner" };

    	if (/*sound*/ ctx[5] !== void 0) {
    		switch1_props.checked = /*sound*/ ctx[5];
    	}

    	switch1 = new Switch({ props: switch1_props, $$inline: true });
    	binding_callbacks.push(() => bind(switch1, 'checked', switch1_checked_binding));
    	let if_block2 = /*showLayout*/ ctx[8] && create_if_block_1(ctx);

    	function keyboard_pressed_binding(value) {
    		/*keyboard_pressed_binding*/ ctx[38](value);
    	}

    	function keyboard_shifted_binding(value) {
    		/*keyboard_shifted_binding*/ ctx[39](value);
    	}

    	function keyboard_timestamp_binding(value) {
    		/*keyboard_timestamp_binding*/ ctx[40](value);
    	}

    	function keyboard_keycolor_binding(value) {
    		/*keyboard_keycolor_binding*/ ctx[41](value);
    	}

    	function keyboard_keybackground_binding(value) {
    		/*keyboard_keybackground_binding*/ ctx[42](value);
    	}

    	function keyboard_boxshadowcolor_binding(value) {
    		/*keyboard_boxshadowcolor_binding*/ ctx[43](value);
    	}

    	function keyboard_boxsize_binding(value) {
    		/*keyboard_boxsize_binding*/ ctx[44](value);
    	}

    	let keyboard_props = {};

    	if (/*pressed*/ ctx[1] !== void 0) {
    		keyboard_props.pressed = /*pressed*/ ctx[1];
    	}

    	if (/*shifted*/ ctx[0] !== void 0) {
    		keyboard_props.shifted = /*shifted*/ ctx[0];
    	}

    	if (/*timestamp*/ ctx[2] !== void 0) {
    		keyboard_props.timestamp = /*timestamp*/ ctx[2];
    	}

    	if (/*$keycolor*/ ctx[11] !== void 0) {
    		keyboard_props.keycolor = /*$keycolor*/ ctx[11];
    	}

    	if (/*$keybgcolor*/ ctx[12] !== void 0) {
    		keyboard_props.keybackground = /*$keybgcolor*/ ctx[12];
    	}

    	if (/*$boxshadowcolor*/ ctx[13] !== void 0) {
    		keyboard_props.boxshadowcolor = /*$boxshadowcolor*/ ctx[13];
    	}

    	if (/*$boxsize*/ ctx[14] !== void 0) {
    		keyboard_props.boxsize = /*$boxsize*/ ctx[14];
    	}

    	keyboard = new Keyboard({ props: keyboard_props, $$inline: true });
    	binding_callbacks.push(() => bind(keyboard, 'pressed', keyboard_pressed_binding));
    	binding_callbacks.push(() => bind(keyboard, 'shifted', keyboard_shifted_binding));
    	binding_callbacks.push(() => bind(keyboard, 'timestamp', keyboard_timestamp_binding));
    	binding_callbacks.push(() => bind(keyboard, 'keycolor', keyboard_keycolor_binding));
    	binding_callbacks.push(() => bind(keyboard, 'keybackground', keyboard_keybackground_binding));
    	binding_callbacks.push(() => bind(keyboard, 'boxshadowcolor', keyboard_boxshadowcolor_binding));
    	binding_callbacks.push(() => bind(keyboard, 'boxsize', keyboard_boxsize_binding));
    	keyboard.$on("keydown", /*keydown_handler*/ ctx[45]);
    	let key_block = create_key_block(ctx);

    	const block = {
    		c: function create() {
    			nav = element("nav");
    			audio_1 = element("audio");
    			t0 = space();
    			div0 = element("div");
    			create_component(soundtest.$$.fragment);
    			t1 = space();
    			span0 = element("span");
    			h1 = element("h1");
    			h1.textContent = "한글 Keyboard";
    			t3 = space();
    			small = element("small");
    			i = element("i");
    			i.textContent = "By sir-tonytiger-201";
    			t5 = space();
    			br = element("br");
    			t6 = space();
    			table = element("table");
    			tr = element("tr");
    			td0 = element("td");
    			span1 = element("span");
    			span1.textContent = "Learn the layout.  ";
    			t8 = space();
    			td1 = element("td");
    			button0 = element("button");
    			if_block0.c();
    			t9 = space();
    			td2 = element("td");
    			button1 = element("button");
    			if_block1.c();
    			t10 = text("\n\t\t\t\t\tslideshow");
    			t11 = space();
    			td3 = element("td");
    			create_component(switch0.$$.fragment);
    			t12 = space();
    			td4 = element("td");
    			create_component(switch1.$$.fragment);
    			t13 = space();
    			if (if_block2) if_block2.c();
    			t14 = space();
    			main = element("main");
    			div1 = element("div");
    			center = element("center");
    			p = element("p");
    			create_component(keyboard.$$.fragment);
    			t15 = space();
    			key_block.c();
    			if (!src_url_equal(audio_1.src, audio_1_src_value = "")) attr_dev(audio_1, "src", audio_1_src_value);
    			add_location(audio_1, file, 353, 1, 7935);
    			div0.hidden = true;
    			add_location(div0, file, 354, 1, 7971);
    			attr_dev(h1, "class", "svelte-1sthij4");
    			add_location(h1, file, 358, 3, 8033);
    			add_location(i, file, 359, 9, 8063);
    			add_location(small, file, 359, 2, 8056);
    			attr_dev(span0, "class", "svelte-1sthij4");
    			add_location(span0, file, 357, 1, 8024);
    			add_location(br, file, 361, 1, 8109);
    			attr_dev(span1, "class", "svelte-1sthij4");
    			add_location(span1, file, 366, 4, 8145);
    			attr_dev(td0, "class", "svelte-1sthij4");
    			add_location(td0, file, 365, 3, 8136);
    			attr_dev(button0, "class", "svelte-1sthij4");
    			add_location(button0, file, 369, 4, 8206);
    			attr_dev(td1, "class", "svelte-1sthij4");
    			add_location(td1, file, 368, 3, 8197);
    			attr_dev(button1, "class", "svelte-1sthij4");
    			add_location(button1, file, 378, 4, 8348);
    			attr_dev(td2, "class", "svelte-1sthij4");
    			add_location(td2, file, 377, 3, 8339);
    			set_style(td3, "font-size", "small");
    			attr_dev(td3, "class", "svelte-1sthij4");
    			add_location(td3, file, 387, 3, 8493);
    			set_style(td4, "font-size", "small");
    			attr_dev(td4, "class", "svelte-1sthij4");
    			add_location(td4, file, 394, 3, 8627);
    			add_location(tr, file, 364, 2, 8128);
    			add_location(table, file, 363, 1, 8118);
    			attr_dev(nav, "class", "svelte-1sthij4");
    			add_location(nav, file, 352, 0, 7928);
    			attr_dev(p, "class", "keyboard  svelte-1sthij4");
    			add_location(p, file, 413, 3, 8968);
    			attr_dev(center, "class", "svelte-1sthij4");
    			add_location(center, file, 412, 2, 8956);
    			attr_dev(div1, "class", "info  svelte-1sthij4");
    			add_location(div1, file, 411, 1, 8934);
    			main.hidden = false;
    			attr_dev(main, "class", "svelte-1sthij4");
    			add_location(main, file, 407, 0, 8838);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, nav, anchor);
    			append_dev(nav, audio_1);
    			/*audio_1_binding*/ ctx[35](audio_1);
    			append_dev(nav, t0);
    			append_dev(nav, div0);
    			mount_component(soundtest, div0, null);
    			append_dev(nav, t1);
    			append_dev(nav, span0);
    			append_dev(span0, h1);
    			append_dev(span0, t3);
    			append_dev(span0, small);
    			append_dev(small, i);
    			append_dev(nav, t5);
    			append_dev(nav, br);
    			append_dev(nav, t6);
    			append_dev(nav, table);
    			append_dev(table, tr);
    			append_dev(tr, td0);
    			append_dev(td0, span1);
    			append_dev(tr, t8);
    			append_dev(tr, td1);
    			append_dev(td1, button0);
    			if_block0.m(button0, null);
    			append_dev(tr, t9);
    			append_dev(tr, td2);
    			append_dev(td2, button1);
    			if_block1.m(button1, null);
    			append_dev(button1, t10);
    			append_dev(tr, t11);
    			append_dev(tr, td3);
    			mount_component(switch0, td3, null);
    			append_dev(tr, t12);
    			append_dev(tr, td4);
    			mount_component(switch1, td4, null);
    			append_dev(nav, t13);
    			if (if_block2) if_block2.m(nav, null);
    			insert_dev(target, t14, anchor);
    			insert_dev(target, main, anchor);
    			append_dev(main, div1);
    			append_dev(div1, center);
    			append_dev(center, p);
    			mount_component(keyboard, p, null);
    			append_dev(center, t15);
    			key_block.m(center, null);
    			current = true;

    			if (!mounted) {
    				dispose = [
    					listen_dev(button0, "click", /*toggleView*/ ctx[19], false, false, false),
    					listen_dev(button1, "click", /*toggleSlideshow*/ ctx[20], false, false, false),
    					action_destroyer(shortcut.call(null, main, {
    						code: /*keyArray*/ ctx[15],
    						callback: /*shortcut_function*/ ctx[46]
    					}))
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (current_block_type !== (current_block_type = select_block_type(ctx))) {
    				if_block0.d(1);
    				if_block0 = current_block_type(ctx);

    				if (if_block0) {
    					if_block0.c();
    					if_block0.m(button0, null);
    				}
    			}

    			if (current_block_type_1 !== (current_block_type_1 = select_block_type_1(ctx))) {
    				if_block1.d(1);
    				if_block1 = current_block_type_1(ctx);

    				if (if_block1) {
    					if_block1.c();
    					if_block1.m(button1, t10);
    				}
    			}

    			const switch0_changes = {};

    			if (!updating_checked && dirty[0] & /*randomize*/ 512) {
    				updating_checked = true;
    				switch0_changes.checked = /*randomize*/ ctx[9];
    				add_flush_callback(() => updating_checked = false);
    			}

    			switch0.$set(switch0_changes);
    			const switch1_changes = {};

    			if (!updating_checked_1 && dirty[0] & /*sound*/ 32) {
    				updating_checked_1 = true;
    				switch1_changes.checked = /*sound*/ ctx[5];
    				add_flush_callback(() => updating_checked_1 = false);
    			}

    			switch1.$set(switch1_changes);

    			if (/*showLayout*/ ctx[8]) {
    				if (if_block2) ; else {
    					if_block2 = create_if_block_1(ctx);
    					if_block2.c();
    					if_block2.m(nav, null);
    				}
    			} else if (if_block2) {
    				if_block2.d(1);
    				if_block2 = null;
    			}

    			const keyboard_changes = {};

    			if (!updating_pressed && dirty[0] & /*pressed*/ 2) {
    				updating_pressed = true;
    				keyboard_changes.pressed = /*pressed*/ ctx[1];
    				add_flush_callback(() => updating_pressed = false);
    			}

    			if (!updating_shifted && dirty[0] & /*shifted*/ 1) {
    				updating_shifted = true;
    				keyboard_changes.shifted = /*shifted*/ ctx[0];
    				add_flush_callback(() => updating_shifted = false);
    			}

    			if (!updating_timestamp && dirty[0] & /*timestamp*/ 4) {
    				updating_timestamp = true;
    				keyboard_changes.timestamp = /*timestamp*/ ctx[2];
    				add_flush_callback(() => updating_timestamp = false);
    			}

    			if (!updating_keycolor && dirty[0] & /*$keycolor*/ 2048) {
    				updating_keycolor = true;
    				keyboard_changes.keycolor = /*$keycolor*/ ctx[11];
    				add_flush_callback(() => updating_keycolor = false);
    			}

    			if (!updating_keybackground && dirty[0] & /*$keybgcolor*/ 4096) {
    				updating_keybackground = true;
    				keyboard_changes.keybackground = /*$keybgcolor*/ ctx[12];
    				add_flush_callback(() => updating_keybackground = false);
    			}

    			if (!updating_boxshadowcolor && dirty[0] & /*$boxshadowcolor*/ 8192) {
    				updating_boxshadowcolor = true;
    				keyboard_changes.boxshadowcolor = /*$boxshadowcolor*/ ctx[13];
    				add_flush_callback(() => updating_boxshadowcolor = false);
    			}

    			if (!updating_boxsize && dirty[0] & /*$boxsize*/ 16384) {
    				updating_boxsize = true;
    				keyboard_changes.boxsize = /*$boxsize*/ ctx[14];
    				add_flush_callback(() => updating_boxsize = false);
    			}

    			keyboard.$set(keyboard_changes);

    			if (dirty[0] & /*timestamp*/ 4 && safe_not_equal(previous_key, previous_key = /*timestamp*/ ctx[2])) {
    				group_outros();
    				transition_out(key_block, 1, 1, noop);
    				check_outros();
    				key_block = create_key_block(ctx);
    				key_block.c();
    				transition_in(key_block, 1);
    				key_block.m(center, null);
    			} else {
    				key_block.p(ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(soundtest.$$.fragment, local);
    			transition_in(switch0.$$.fragment, local);
    			transition_in(switch1.$$.fragment, local);
    			transition_in(keyboard.$$.fragment, local);
    			transition_in(key_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(soundtest.$$.fragment, local);
    			transition_out(switch0.$$.fragment, local);
    			transition_out(switch1.$$.fragment, local);
    			transition_out(keyboard.$$.fragment, local);
    			transition_out(key_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(nav);
    			/*audio_1_binding*/ ctx[35](null);
    			destroy_component(soundtest);
    			if_block0.d();
    			if_block1.d();
    			destroy_component(switch0);
    			destroy_component(switch1);
    			if (if_block2) if_block2.d();
    			if (detaching) detach_dev(t14);
    			if (detaching) detach_dev(main);
    			destroy_component(keyboard);
    			key_block.d(detaching);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $color;
    	let $keycolor;
    	let $keybgcolor;
    	let $boxshadowcolor;
    	let $boxsize;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const keyClass = {};
    	let hangulCharacter = "";
    	let { pressed = undefined } = $$props;
    	let slideshow = false;
    	let slideIndex = 0;
    	let currentChar = "";
    	let { timestamp = Date.now() } = $$props;
    	let { shifted } = $$props;
    	let pressedKey = " ";

    	const hangulValue = {
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
    		P: "ㅖ"
    	};

    	const numberOfCharacters = Object.keys(hangulValue).length;
    	const characters = Object.keys(hangulValue);
    	let keyArray = [];
    	characters.forEach(m => keyArray.push("Key" + m.toUpperCase()));

    	// Will return a number from 1 to m.
    	const randomNumber = m => {
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

    	const handleKeypress = m => {
    		$$invalidate(2, timestamp = Date.now());
    		if (slideshow) toggleSlideshow();

    		//const k =  shifted ? m[m.length - 1] :  m[m.length - 1].toLowerCase();
    		const k = m[m.length - 1].toLowerCase();

    		$$invalidate(1, pressed = k);
    		$$invalidate(3, pressedKey = k);
    	};

    	let showLayout = false;

    	const showkey = i => {
    		$$invalidate(2, timestamp = Date.now());
    		console.log(i);
    		const keycode = "Key" + Object.keys(hangulValue)[i].toUpperCase();
    		const k = keycode[keycode.length - 1].toLowerCase();
    		$$invalidate(1, pressed = k);
    		$$invalidate(3, pressedKey = k);
    	};

    	const toggleView = () => {
    		$$invalidate(8, showLayout = !showLayout);
    	};

    	let clearTimer;

    	const toggleSlideshow = () => {
    		$$invalidate(7, slideshow = !slideshow);
    		console.log("randomize", randomize);

    		if (slideshow) {
    			slideIndex = 0;

    			clearTimer = setInterval(
    				() => {
    					if (!randomize) {
    						showkey(slideIndex++);
    					} else {
    						slideIndex = Math.floor(Math.random() * numberOfCharacters);
    						showkey(slideIndex);
    					}

    					if (slideIndex > Object.keys(hangulValue).length - 1) slideIndex = 0;
    				},
    				1500
    			);
    		} else {
    			clearInterval(clearTimer);
    		}
    	};

    	let colorIndex = 0;
    	let keycolorIndex = 0;
    	let keybgcolorIndex = 0;
    	let boxshadowIndex = 0;
    	let boxsizeIndex = 0;
    	let randomize = true;
    	const colors = ["fa0024", "efff11", "00ff00", "072e5b", "f9be8a", "f36729", "59e8eb", "3548b7"]; // red, yellow, green, blue
    	const keycolors = [];
    	colors.forEach(m => keycolors.unshift(m));
    	const boxsizes = [2, 7];
    	const keybgcolors = ["023e8a", "9CAEA9", "2B2D42", "6A4C93", "6C757D"];
    	const boxshadowcolors = ["E500A4", "f5a218", "228abf", "3dfa40", "e893e9", "0186cc", "c51e85"];

    	//const colors = ['ff0000', '00ff00', '0000ff', '072e5b']; // red, green, blue
    	// This converts a decimal number to a two-character hex number.
    	const decimalToHex = decimal => Math.round(decimal).toString(16).padStart(2, "0");

    	// This cycles through the indexes of the colors array.
    	const goToNextColor = () => {
    		$$invalidate(28, colorIndex = (colorIndex + 1) % colors.length);
    	};

    	const goToNextKeyColor = () => {
    		$$invalidate(29, keycolorIndex = (keycolorIndex + 1) % keycolors.length);
    	};

    	const goToNextKeybgColor = () => {
    		$$invalidate(30, keybgcolorIndex = (keybgcolorIndex + 1) % keybgcolors.length);
    	};

    	const goToNextBoxShadow = () => {
    		$$invalidate(31, boxshadowIndex = (boxshadowIndex + 1) % boxshadowcolors.length);
    	};

    	const goToNextBoxSize = () => {
    		$$invalidate(32, boxsizeIndex = (boxsizeIndex + 1) % boxsizes.length);
    	};

    	// This extracts two hex characters from an "rrggbb" color string
    	// and returns the value as a number between 0 and 255.
    	const getColor = (hex, index) => parseInt(hex.substring(index, index + 2), 16);

    	// This gets an array of red, green, and blue values in the range 0 to 255
    	// from an "rrggbb" hex color string.
    	const getRGBs = hex => [getColor(hex, 0), getColor(hex, 2), getColor(hex, 4)];

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

    		return t => {
    			const red = scaledValue(fromRed, deltaRed, t);
    			const green = scaledValue(fromGreen, deltaGreen, t);
    			const blue = scaledValue(fromBlue, deltaBlue, t);
    			return decimalToHex(red) + decimalToHex(green) + decimalToHex(blue);
    		};
    	}

    	const boxsize = tweened(boxsizes[boxsizeIndex], { duration: 1000, easing: sineIn });
    	validate_store(boxsize, 'boxsize');
    	component_subscribe($$self, boxsize, value => $$invalidate(14, $boxsize = value));

    	// Create a tweened store that holds an "rrggbb" hex color.
    	const color = tweened(colors[colorIndex], {
    		duration: 2000,
    		easing: sineIn,
    		interpolate: rgbInterpolate
    	});

    	validate_store(color, 'color');
    	component_subscribe($$self, color, value => $$invalidate(10, $color = value));

    	const keycolor = tweened(keycolors[keycolorIndex], {
    		duration: 1000,
    		easing: circIn,
    		interpolate: rgbInterpolate
    	});

    	validate_store(keycolor, 'keycolor');
    	component_subscribe($$self, keycolor, value => $$invalidate(11, $keycolor = value));

    	const keybgcolor = tweened(keybgcolors[keybgcolorIndex], {
    		duration: 3000,
    		easing: quadIn,
    		interpolate: rgbInterpolate
    	});

    	validate_store(keybgcolor, 'keybgcolor');
    	component_subscribe($$self, keybgcolor, value => $$invalidate(12, $keybgcolor = value));

    	const boxshadowcolor = tweened(boxshadowcolors[boxshadowIndex], {
    		duration: 1000,
    		interpolate: rgbInterpolate
    	});

    	validate_store(boxshadowcolor, 'boxshadowcolor');
    	component_subscribe($$self, boxshadowcolor, value => $$invalidate(13, $boxshadowcolor = value));

    	//$: console.log("color", $color, "keycolor", $keycolor)
    	let prevColor = $color;

    	setInterval(
    		() => {
    			goToNextColor();
    			clearInterval();
    		},
    		2000
    	);

    	setInterval(
    		() => {
    			goToNextKeyColor();
    			clearInterval();
    		},
    		1000
    	);

    	setInterval(
    		() => {
    			goToNextKeybgColor();
    			clearInterval();
    			goToNextBoxSize();
    		},
    		3000
    	);

    	setInterval(
    		() => {
    			goToNextBoxShadow();
    			clearInterval();
    		},
    		1000
    	);

    	let visible = true;

    	function spin(node, { duration }) {
    		return {
    			duration,
    			css: t => {
    				const eased = elasticOut(t);

    				return `
					transform: scale(${eased}) rotate(${eased * 720}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`;
    			}
    		};
    	}

    	let switchValue;
    	let sliderValue;
    	let multiValue;
    	let audio = {};
    	let volume = 0.5;
    	let sound = true;
    	let savedvolume = volume;
    	const writable_props = ['pressed', 'timestamp', 'shifted'];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function audio_1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audio = $$value;
    			(((($$invalidate(4, audio), $$invalidate(3, pressedKey)), $$invalidate(33, volume)), $$invalidate(5, sound)), $$invalidate(34, savedvolume));
    		});
    	}

    	function switch0_checked_binding(value) {
    		randomize = value;
    		$$invalidate(9, randomize);
    	}

    	function switch1_checked_binding(value) {
    		sound = value;
    		$$invalidate(5, sound);
    	}

    	function keyboard_pressed_binding(value) {
    		pressed = value;
    		$$invalidate(1, pressed);
    	}

    	function keyboard_shifted_binding(value) {
    		shifted = value;
    		$$invalidate(0, shifted);
    	}

    	function keyboard_timestamp_binding(value) {
    		timestamp = value;
    		$$invalidate(2, timestamp);
    	}

    	function keyboard_keycolor_binding(value) {
    		$keycolor = value;
    		keycolor.set($keycolor);
    	}

    	function keyboard_keybackground_binding(value) {
    		$keybgcolor = value;
    		keybgcolor.set($keybgcolor);
    	}

    	function keyboard_boxshadowcolor_binding(value) {
    		$boxshadowcolor = value;
    		boxshadowcolor.set($boxshadowcolor);
    	}

    	function keyboard_boxsize_binding(value) {
    		$boxsize = value;
    		boxsize.set($boxsize);
    	}

    	const keydown_handler = ({ detail }) => {
    		$$invalidate(3, pressedKey = detail);
    		if (slideshow) toggleSlideshow();
    	};

    	const shortcut_function = m => handleKeypress(m);

    	$$self.$$set = $$props => {
    		if ('pressed' in $$props) $$invalidate(1, pressed = $$props.pressed);
    		if ('timestamp' in $$props) $$invalidate(2, timestamp = $$props.timestamp);
    		if ('shifted' in $$props) $$invalidate(0, shifted = $$props.shifted);
    	};

    	$$self.$capture_state = () => ({
    		keys,
    		Keyboard,
    		shortcut,
    		fly,
    		fade,
    		slide,
    		scale,
    		flip,
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
    		keyClass,
    		hangulCharacter,
    		pressed,
    		slideshow,
    		slideIndex,
    		currentChar,
    		timestamp,
    		shifted,
    		pressedKey,
    		hangulValue,
    		numberOfCharacters,
    		characters,
    		keyArray,
    		randomNumber,
    		faceIdx,
    		funnyface,
    		handleKeypress,
    		showLayout,
    		showkey,
    		toggleView,
    		clearTimer,
    		toggleSlideshow,
    		tweened,
    		colorIndex,
    		keycolorIndex,
    		keybgcolorIndex,
    		boxshadowIndex,
    		boxsizeIndex,
    		randomize,
    		colors,
    		keycolors,
    		boxsizes,
    		keybgcolors,
    		boxshadowcolors,
    		decimalToHex,
    		goToNextColor,
    		goToNextKeyColor,
    		goToNextKeybgColor,
    		goToNextBoxShadow,
    		goToNextBoxSize,
    		getColor,
    		getRGBs,
    		scaledValue,
    		rgbInterpolate,
    		boxsize,
    		color,
    		keycolor,
    		keybgcolor,
    		boxshadowcolor,
    		prevColor,
    		elasticOut,
    		visible,
    		spin,
    		Switch,
    		SoundTest,
    		switchValue,
    		sliderValue,
    		multiValue,
    		audio,
    		volume,
    		sound,
    		savedvolume,
    		$color,
    		$keycolor,
    		$keybgcolor,
    		$boxshadowcolor,
    		$boxsize
    	});

    	$$self.$inject_state = $$props => {
    		if ('hangulCharacter' in $$props) $$invalidate(6, hangulCharacter = $$props.hangulCharacter);
    		if ('pressed' in $$props) $$invalidate(1, pressed = $$props.pressed);
    		if ('slideshow' in $$props) $$invalidate(7, slideshow = $$props.slideshow);
    		if ('slideIndex' in $$props) slideIndex = $$props.slideIndex;
    		if ('currentChar' in $$props) currentChar = $$props.currentChar;
    		if ('timestamp' in $$props) $$invalidate(2, timestamp = $$props.timestamp);
    		if ('shifted' in $$props) $$invalidate(0, shifted = $$props.shifted);
    		if ('pressedKey' in $$props) $$invalidate(3, pressedKey = $$props.pressedKey);
    		if ('keyArray' in $$props) $$invalidate(15, keyArray = $$props.keyArray);
    		if ('faceIdx' in $$props) faceIdx = $$props.faceIdx;
    		if ('showLayout' in $$props) $$invalidate(8, showLayout = $$props.showLayout);
    		if ('clearTimer' in $$props) clearTimer = $$props.clearTimer;
    		if ('colorIndex' in $$props) $$invalidate(28, colorIndex = $$props.colorIndex);
    		if ('keycolorIndex' in $$props) $$invalidate(29, keycolorIndex = $$props.keycolorIndex);
    		if ('keybgcolorIndex' in $$props) $$invalidate(30, keybgcolorIndex = $$props.keybgcolorIndex);
    		if ('boxshadowIndex' in $$props) $$invalidate(31, boxshadowIndex = $$props.boxshadowIndex);
    		if ('boxsizeIndex' in $$props) $$invalidate(32, boxsizeIndex = $$props.boxsizeIndex);
    		if ('randomize' in $$props) $$invalidate(9, randomize = $$props.randomize);
    		if ('prevColor' in $$props) prevColor = $$props.prevColor;
    		if ('visible' in $$props) visible = $$props.visible;
    		if ('switchValue' in $$props) switchValue = $$props.switchValue;
    		if ('sliderValue' in $$props) sliderValue = $$props.sliderValue;
    		if ('multiValue' in $$props) multiValue = $$props.multiValue;
    		if ('audio' in $$props) $$invalidate(4, audio = $$props.audio);
    		if ('volume' in $$props) $$invalidate(33, volume = $$props.volume);
    		if ('sound' in $$props) $$invalidate(5, sound = $$props.sound);
    		if ('savedvolume' in $$props) $$invalidate(34, savedvolume = $$props.savedvolume);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*pressedKey, shifted*/ 9) {
    			$$invalidate(6, hangulCharacter = String(pressedKey.length == 1
    			? shifted
    				? hangulValue[pressedKey.toUpperCase()] || undefined
    				: hangulValue[pressedKey] || ""
    			: ""));
    		}

    		if ($$self.$$.dirty[0] & /*colorIndex*/ 268435456) {
    			// Trigger tweening if colorIndex changes.
    			color.set(colors[colorIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*keycolorIndex*/ 536870912) {
    			keycolor.set(keycolors[keycolorIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*keybgcolorIndex*/ 1073741824) {
    			keybgcolor.set(keybgcolors[keybgcolorIndex]);
    		}

    		if ($$self.$$.dirty[1] & /*boxshadowIndex*/ 1) {
    			boxshadowcolor.set(boxshadowcolors[boxshadowIndex]);
    		}

    		if ($$self.$$.dirty[1] & /*boxsizeIndex*/ 2) {
    			boxsize.set(boxsizes[boxsizeIndex]);
    		}

    		if ($$self.$$.dirty[0] & /*sound*/ 32 | $$self.$$.dirty[1] & /*volume, savedvolume*/ 12) {
    			if (sound == false) {
    				$$invalidate(34, savedvolume = volume);
    				$$invalidate(33, volume = 0);
    			} else {
    				$$invalidate(33, volume = savedvolume);
    			}
    		}

    		if ($$self.$$.dirty[0] & /*pressedKey, audio*/ 24 | $$self.$$.dirty[1] & /*volume*/ 4) {
    			if (pressedKey && audio.src) {
    				if (characters.find(m => m == pressedKey)) //audio.src =`sounds/powerup_4_reverb.wav`;
    				$$invalidate(4, audio.src = `sounds/Spin.wav`, audio); else $$invalidate(4, audio.src = `sounds/powerup (${randomNumber(50)}).wav`, audio);

    				if (volume != undefined) $$invalidate(4, audio.volume = volume, audio);
    				audio.play();
    			}
    		}

    		if ($$self.$$.dirty[1] & /*volume*/ 4) {
    			if (volume != undefined) $$invalidate(4, audio.volume = volume, audio);
    		}
    	};

    	console.log("numberOfCharacters", numberOfCharacters);

    	return [
    		shifted,
    		pressed,
    		timestamp,
    		pressedKey,
    		audio,
    		sound,
    		hangulCharacter,
    		slideshow,
    		showLayout,
    		randomize,
    		$color,
    		$keycolor,
    		$keybgcolor,
    		$boxshadowcolor,
    		$boxsize,
    		keyArray,
    		randomNumber,
    		funnyface,
    		handleKeypress,
    		toggleView,
    		toggleSlideshow,
    		boxsize,
    		color,
    		keycolor,
    		keybgcolor,
    		boxshadowcolor,
    		spin,
    		hangulValue,
    		colorIndex,
    		keycolorIndex,
    		keybgcolorIndex,
    		boxshadowIndex,
    		boxsizeIndex,
    		volume,
    		savedvolume,
    		audio_1_binding,
    		switch0_checked_binding,
    		switch1_checked_binding,
    		keyboard_pressed_binding,
    		keyboard_shifted_binding,
    		keyboard_timestamp_binding,
    		keyboard_keycolor_binding,
    		keyboard_keybackground_binding,
    		keyboard_boxshadowcolor_binding,
    		keyboard_boxsize_binding,
    		keydown_handler,
    		shortcut_function
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(
    			this,
    			options,
    			instance,
    			create_fragment,
    			safe_not_equal,
    			{
    				pressed: 1,
    				timestamp: 2,
    				shifted: 0,
    				hangulValue: 27
    			},
    			null,
    			[-1, -1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*shifted*/ ctx[0] === undefined && !('shifted' in props)) {
    			console_1.warn("<App> was created without expected prop 'shifted'");
    		}
    	}

    	get pressed() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pressed(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get timestamp() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set timestamp(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get shifted() {
    		throw new Error("<App>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set shifted(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hangulValue() {
    		return this.$$.ctx[27];
    	}

    	set hangulValue(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	},
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
