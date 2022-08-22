
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
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
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function action_destroyer(action_result) {
        return action_result && is_function(action_result.destroy) ? action_result.destroy : noop;
    }
    function append(target, node) {
        target.appendChild(node);
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
    const outroing = new Set();
    let outros;
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

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
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
    const file$1 = "src/lib/Keyboard.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[29] = list[i];
    	child_ctx[31] = i;
    	return child_ctx;
    }

    function get_each_context_1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[32] = list[i];
    	child_ctx[34] = i;
    	return child_ctx;
    }

    function get_each_context_2(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[35] = list[i].value;
    	child_ctx[36] = list[i].display;
    	return child_ctx;
    }

    // (135:14) {:else}
    function create_else_block(ctx) {
    	let t_value = /*display*/ ctx[36] + "";
    	let t;

    	const block = {
    		c: function create() {
    			t = text(t_value);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, t, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData*/ 8 && t_value !== (t_value = /*display*/ ctx[36] + "")) set_data_dev(t, t_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(t);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(135:14) {:else}",
    		ctx
    	});

    	return block;
    }

    // (133:14) {#if display && display.includes("<svg")}
    function create_if_block(ctx) {
    	let html_tag;
    	let raw_value = /*display*/ ctx[36] + "";
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
    			if (dirty[0] & /*rowData*/ 8 && raw_value !== (raw_value = /*display*/ ctx[36] + "")) html_tag.p(raw_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(html_anchor);
    			if (detaching) html_tag.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(133:14) {#if display && display.includes(\\\"<svg\\\")}",
    		ctx
    	});

    	return block;
    }

    // (122:10) {#each keys as { value, display }}
    function create_each_block_2(ctx) {
    	let button;
    	let show_if;
    	let button_class_value;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (dirty[0] & /*rowData*/ 8) show_if = null;
    		if (show_if == null) show_if = !!(/*display*/ ctx[36] && /*display*/ ctx[36].includes("<svg"));
    		if (show_if) return create_if_block;
    		return create_else_block;
    	}

    	let current_block_type = select_block_type(ctx, [-1, -1]);
    	let if_block = current_block_type(ctx);

    	function touchstart_handler(...args) {
    		return /*touchstart_handler*/ ctx[20](/*value*/ ctx[35], ...args);
    	}

    	function mousedown_handler(...args) {
    		return /*mousedown_handler*/ ctx[21](/*value*/ ctx[35], ...args);
    	}

    	function touchend_handler() {
    		return /*touchend_handler*/ ctx[22](/*value*/ ctx[35]);
    	}

    	function mouseup_handler() {
    		return /*mouseup_handler*/ ctx[23](/*value*/ ctx[35]);
    	}

    	const block = {
    		c: function create() {
    			button = element("button");
    			if_block.c();
    			attr_dev(button, "class", button_class_value = "key key--" + /*value*/ ctx[35] + " " + (/*keyClass*/ ctx[0][/*value*/ ctx[35]] || '') + " svelte-fkzg6r");
    			toggle_class(button, "single", /*value*/ ctx[35] && /*value*/ ctx[35].length === 1);
    			toggle_class(button, "half", /*value*/ ctx[35] == ";");
    			toggle_class(button, "active", /*value*/ ctx[35] === /*active*/ ctx[2]);
    			add_location(button, file$1, 122, 12, 3350);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			if_block.m(button, null);

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
    					if_block.m(button, null);
    				}
    			}

    			if (dirty[0] & /*rowData, keyClass*/ 9 && button_class_value !== (button_class_value = "key key--" + /*value*/ ctx[35] + " " + (/*keyClass*/ ctx[0][/*value*/ ctx[35]] || '') + " svelte-fkzg6r")) {
    				attr_dev(button, "class", button_class_value);
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData*/ 9) {
    				toggle_class(button, "single", /*value*/ ctx[35] && /*value*/ ctx[35].length === 1);
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData*/ 9) {
    				toggle_class(button, "half", /*value*/ ctx[35] == ";");
    			}

    			if (dirty[0] & /*rowData, keyClass, rowData, active*/ 13) {
    				toggle_class(button, "active", /*value*/ ctx[35] === /*active*/ ctx[2]);
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
    		id: create_each_block_2.name,
    		type: "each",
    		source: "(122:10) {#each keys as { value, display }}",
    		ctx
    	});

    	return block;
    }

    // (119:6) {#each row as keys, j}
    function create_each_block_1(ctx) {
    	let div;
    	let html_tag;
    	let raw_value = /*shiftKeys*/ ctx[6](/*j*/ ctx[34]) + "";
    	let t;
    	let each_value_2 = /*keys*/ ctx[32];
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
    			attr_dev(div, "class", "row row--" + /*i*/ ctx[31] + " svelte-fkzg6r");
    			add_location(div, file$1, 119, 8, 3235);
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
    			if (dirty[0] & /*rowData, keyClass, active, onKeyStart, onKeyEnd*/ 61) {
    				each_value_2 = /*keys*/ ctx[32];
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
    		source: "(119:6) {#each row as keys, j}",
    		ctx
    	});

    	return block;
    }

    // (117:2) {#each rowData as row, i}
    function create_each_block(ctx) {
    	let div;
    	let t;
    	let each_value_1 = /*row*/ ctx[29];
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
    			attr_dev(div, "class", "page svelte-fkzg6r");
    			toggle_class(div, "visible", /*i*/ ctx[31] === /*page*/ ctx[1]);
    			add_location(div, file$1, 117, 4, 3152);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div, null);
    			}

    			append_dev(div, t);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty[0] & /*rowData, keyClass, active, onKeyStart, onKeyEnd, shiftKeys*/ 125) {
    				each_value_1 = /*row*/ ctx[29];
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

    			if (dirty[0] & /*page*/ 2) {
    				toggle_class(div, "visible", /*i*/ ctx[31] === /*page*/ ctx[1]);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(117:2) {#each rowData as row, i}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let div;
    	let each_value = /*rowData*/ ctx[3];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const block = {
    		c: function create() {
    			div = element("div");

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div, "class", "svelte-keyboard");
    			add_location(div, file$1, 115, 0, 3090);
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
    			if (dirty[0] & /*page, rowData, keyClass, active, onKeyStart, onKeyEnd, shiftKeys*/ 127) {
    				each_value = /*rowData*/ ctx[3];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
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
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const alphabet = "abcdefghijklmnopqrstuvwxyz";

    function instance$1($$self, $$props, $$invalidate) {
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

    	// vars
    	let page = 0;

    	let shifted = false;
    	let active = undefined;

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
    		event.preventDefault();
    		$$invalidate(2, active = value);

    		if (value && value.includes("Page")) {
    			$$invalidate(1, page = +value.substr(-1));
    		} else if (value === "Shift") {
    			$$invalidate(11, shifted = !shifted);
    		} else {
    			let output = value || "";
    			if (shifted && alphabet.includes(value)) output = value.toUpperCase() || "";
    			dispatch("keydown", output);
    		}

    		event.stopPropagation();
    		return false;
    	};

    	const onKeyEnd = value => {
    		setTimeout(
    			() => {
    				if (value === active) $$invalidate(2, active = undefined);
    			},
    			50
    		);
    	};

    	let indent = 0;

    	const shiftKeys = m => {
    		if (m > 1) return "";
    		let spaces = "";

    		for (let i = 0; i < m; i++) {
    			spaces += "&nbsp;&nbsp&nbsp";
    		}

    		return spaces;
    	};

    	const writable_props = ['custom', 'localizationLayout', 'layout', 'noSwap', 'keyClass'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Keyboard> was created with unknown prop '${key}'`);
    	});

    	const touchstart_handler = (value, e) => onKeyStart(e, value);
    	const mousedown_handler = (value, e) => onKeyStart(e, value);
    	const touchend_handler = value => onKeyEnd(value);
    	const mouseup_handler = value => onKeyEnd(value);

    	$$self.$$set = $$props => {
    		if ('custom' in $$props) $$invalidate(7, custom = $$props.custom);
    		if ('localizationLayout' in $$props) $$invalidate(8, localizationLayout = $$props.localizationLayout);
    		if ('layout' in $$props) $$invalidate(9, layout = $$props.layout);
    		if ('noSwap' in $$props) $$invalidate(10, noSwap = $$props.noSwap);
    		if ('keyClass' in $$props) $$invalidate(0, keyClass = $$props.keyClass);
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
    		page,
    		shifted,
    		active,
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
    		if ('custom' in $$props) $$invalidate(7, custom = $$props.custom);
    		if ('localizationLayout' in $$props) $$invalidate(8, localizationLayout = $$props.localizationLayout);
    		if ('layout' in $$props) $$invalidate(9, layout = $$props.layout);
    		if ('noSwap' in $$props) $$invalidate(10, noSwap = $$props.noSwap);
    		if ('keyClass' in $$props) $$invalidate(0, keyClass = $$props.keyClass);
    		if ('page' in $$props) $$invalidate(1, page = $$props.page);
    		if ('shifted' in $$props) $$invalidate(11, shifted = $$props.shifted);
    		if ('active' in $$props) $$invalidate(2, active = $$props.active);
    		if ('indent' in $$props) indent = $$props.indent;
    		if ('rowData1' in $$props) $$invalidate(12, rowData1 = $$props.rowData1);
    		if ('rowData0' in $$props) $$invalidate(13, rowData0 = $$props.rowData0);
    		if ('rowData' in $$props) $$invalidate(3, rowData = $$props.rowData);
    		if ('page1' in $$props) $$invalidate(14, page1 = $$props.page1);
    		if ('rows0' in $$props) $$invalidate(15, rows0 = $$props.rows0);
    		if ('page0' in $$props) $$invalidate(16, page0 = $$props.page0);
    		if ('rows1' in $$props) $$invalidate(17, rows1 = $$props.rows1);
    		if ('data' in $$props) $$invalidate(18, data = $$props.data);
    		if ('rawData' in $$props) $$invalidate(19, rawData = $$props.rawData);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty[0] & /*custom, localizationLayout, layout*/ 896) {
    			// reactive vars
    			$$invalidate(19, rawData = custom || layouts[localizationLayout][layout] || standard);
    		}

    		if ($$self.$$.dirty[0] & /*rawData, noSwap, shifted*/ 527360) {
    			$$invalidate(18, data = rawData.map(d => {
    				let display = d.display;
    				const s = swaps[d.value];
    				const shouldSwap = s && !noSwap.includes(d.value) && !d.noSwap;
    				if (shouldSwap) display = s;

    				if (!display && d.value) display = shifted
    				? d && d.value.toUpperCase() || ""
    				: d && d.value.toLowerCase() || "";

    				if (d.value === "Shift") display = shifted ? s || "" : s && s.toUpperCase() || "";
    				return { ...d, display };
    			}));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			$$invalidate(16, page0 = data.filter(d => !d.page));
    		}

    		if ($$self.$$.dirty[0] & /*data*/ 262144) {
    			$$invalidate(14, page1 = data.filter(d => d.page));
    		}

    		if ($$self.$$.dirty[0] & /*page0*/ 65536) {
    			$$invalidate(15, rows0 = unique(page0.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0*/ 32768) {
    			(rows0.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*page1*/ 16384) {
    			$$invalidate(17, rows1 = unique(page1.map(d => d.row)));
    		}

    		if ($$self.$$.dirty[0] & /*rows1*/ 131072) {
    			(rows1.sort((a, b) => a - b));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page0*/ 98304) {
    			$$invalidate(13, rowData0 = rows0.map(r => page0.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rows0, page1*/ 49152) {
    			$$invalidate(12, rowData1 = rows0.map(r => page1.filter(k => k.row === r)));
    		}

    		if ($$self.$$.dirty[0] & /*rowData0, rowData1*/ 12288) {
    			$$invalidate(3, rowData = [rowData0, rowData1]);
    		}
    	};

    	return [
    		keyClass,
    		page,
    		active,
    		rowData,
    		onKeyStart,
    		onKeyEnd,
    		shiftKeys,
    		custom,
    		localizationLayout,
    		layout,
    		noSwap,
    		shifted,
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
    			instance$1,
    			create_fragment$1,
    			safe_not_equal,
    			{
    				custom: 7,
    				localizationLayout: 8,
    				layout: 9,
    				noSwap: 10,
    				keyClass: 0
    			},
    			null,
    			[-1, -1]
    		);

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Keyboard",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*custom*/ ctx[7] === undefined && !('custom' in props)) {
    			console.warn("<Keyboard> was created without expected prop 'custom'");
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

    /* src/App.svelte generated by Svelte v3.49.0 */

    const { Object: Object_1, console: console_1 } = globals;
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let main;
    	let h1;
    	let t1;
    	let p0;
    	let t3;
    	let div1;
    	let div0;
    	let keyboard;
    	let t4;
    	let p1;
    	let t5;
    	let strong;

    	let t6_value = (typeof /*keys*/ ctx[0][0] == "string"
    	? /*keys*/ ctx[0][0]
    	: "") + "";

    	let t6;
    	let t7;
    	let center;
    	let p2;
    	let t9;
    	let p3;
    	let t10;
    	let current;
    	let mounted;
    	let dispose;
    	keyboard = new Keyboard({ $$inline: true });
    	keyboard.$on("keydown", /*keydown_handler*/ ctx[5]);

    	const block = {
    		c: function create() {
    			main = element("main");
    			h1 = element("h1");
    			h1.textContent = "Hangul Keyboard";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Learn the layout.";
    			t3 = space();
    			div1 = element("div");
    			div0 = element("div");
    			create_component(keyboard.$$.fragment);
    			t4 = space();
    			p1 = element("p");
    			t5 = text("key pressed: ");
    			strong = element("strong");
    			t6 = text(t6_value);
    			t7 = space();
    			center = element("center");
    			p2 = element("p");
    			p2.textContent = "Hangul character:";
    			t9 = space();
    			p3 = element("p");
    			t10 = text(/*hangulCharacter*/ ctx[1]);
    			attr_dev(h1, "class", "svelte-a1zezl");
    			add_location(h1, file, 56, 1, 966);
    			attr_dev(p0, "class", "svelte-a1zezl");
    			add_location(p0, file, 57, 1, 992);
    			attr_dev(div0, "class", "keyboard svelte-a1zezl");
    			add_location(div0, file, 60, 2, 1040);
    			add_location(strong, file, 64, 16, 1158);
    			attr_dev(p1, "class", "svelte-a1zezl");
    			add_location(p1, file, 63, 2, 1138);
    			attr_dev(p2, "class", "svelte-a1zezl");
    			add_location(p2, file, 69, 3, 1249);
    			attr_dev(p3, "class", "hangul svelte-a1zezl");
    			add_location(p3, file, 70, 3, 1277);
    			attr_dev(center, "class", "svelte-a1zezl");
    			add_location(center, file, 68, 2, 1237);
    			attr_dev(div1, "class", "info svelte-a1zezl");
    			add_location(div1, file, 59, 1, 1019);
    			attr_dev(main, "class", "svelte-a1zezl");
    			add_location(main, file, 55, 0, 888);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, h1);
    			append_dev(main, t1);
    			append_dev(main, p0);
    			append_dev(main, t3);
    			append_dev(main, div1);
    			append_dev(div1, div0);
    			mount_component(keyboard, div0, null);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(p1, t5);
    			append_dev(p1, strong);
    			append_dev(strong, t6);
    			append_dev(div1, t7);
    			append_dev(div1, center);
    			append_dev(center, p2);
    			append_dev(center, t9);
    			append_dev(center, p3);
    			append_dev(p3, t10);
    			current = true;

    			if (!mounted) {
    				dispose = action_destroyer(shortcut.call(null, main, {
    					code: /*keyArray*/ ctx[2],
    					callback: /*shortcut_function*/ ctx[6]
    				}));

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if ((!current || dirty & /*keys*/ 1) && t6_value !== (t6_value = (typeof /*keys*/ ctx[0][0] == "string"
    			? /*keys*/ ctx[0][0]
    			: "") + "")) set_data_dev(t6, t6_value);

    			if (!current || dirty & /*hangulCharacter*/ 2) set_data_dev(t10, /*hangulCharacter*/ ctx[1]);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(keyboard.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(keyboard.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(keyboard);
    			mounted = false;
    			dispose();
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
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	const keyClass = {};
    	let hangulCharacter = "";

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
    		m: "ㅡ"
    	};

    	let characters = Object.keys(hangulValue);
    	let keyArray = [];
    	characters.forEach(m => keyArray.push("Key" + m.toUpperCase()));

    	const handleKeypress = m => {
    		const k = m[m.length - 1].toLowerCase();
    		$$invalidate(0, keys[0] = k, keys);
    	};

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	const keydown_handler = ({ detail }) => $$invalidate(0, keys[0] = detail, keys);
    	const shortcut_function = m => handleKeypress(m);

    	$$self.$capture_state = () => ({
    		keys,
    		Keyboard,
    		shortcut,
    		keyClass,
    		hangulCharacter,
    		hangulValue,
    		characters,
    		keyArray,
    		handleKeypress
    	});

    	$$self.$inject_state = $$props => {
    		if ('hangulCharacter' in $$props) $$invalidate(1, hangulCharacter = $$props.hangulCharacter);
    		if ('characters' in $$props) characters = $$props.characters;
    		if ('keyArray' in $$props) $$invalidate(2, keyArray = $$props.keyArray);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*keys*/ 1) {
    			console.log(keys[0]);
    		}

    		if ($$self.$$.dirty & /*keys*/ 1) {
    			console.log(typeof keys[0]);
    		}

    		if ($$self.$$.dirty & /*keys*/ 1) {
    			$$invalidate(1, hangulCharacter = String(keys[0].length == 1 ? hangulValue[keys[0]] || "" : ""));
    		}
    	};

    	return [
    		keys,
    		hangulCharacter,
    		keyArray,
    		handleKeypress,
    		hangulValue,
    		keydown_handler,
    		shortcut_function
    	];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { hangulValue: 4 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get hangulValue() {
    		return this.$$.ctx[4];
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
