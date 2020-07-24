/**
 * H3 v0.10.0 "Jittery Jem'Hadar"
 * Copyright 2020 Fabio Cevasco <h3rald@h3rald.com>
 *
 * @license MIT
 * For the full license, see: https://github.com/h3rald/h3/blob/master/LICENSE
 */

export const settings = {
    $onrenderCallbacks: false,
};
export let $onrenderCallbacks = [];

const checkProperties = (obj1, obj2) => {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }
    for (const key in obj1) {
        if (!equal(obj1[key], obj2[key])) {
            return false;
        }
    }
    return true;
};

const equal = (obj1, obj2) => {
    if (
        (obj1 === null && obj2 === null) ||
        (obj1 === undefined && obj2 === undefined)
    ) {
        return true;
    }
    if (
        (obj1 === undefined && obj2 !== undefined) ||
        (obj1 !== undefined && obj2 === undefined) ||
        (obj1 === null && obj2 !== null) ||
        (obj1 !== null && obj2 === null)
    ) {
        return false;
    }
    if (obj1.constructor !== obj2.constructor) {
        return false;
    }
    /////FC
    if (obj1.constructor === Function) {
        return true; // consider functions equal, they'll be re-added every time.
    }
    //////
    if ([String, Number, Boolean, Function].includes(obj1.constructor)) {
        return obj1 === obj2;
    }
    if (obj1.constructor === Array) {
        if (obj1.length !== obj2.length) {
            return false;
        }
        for (let i = 0; i < obj1.length; i++) {
            if (!equal(obj1[i], obj2[i])) {
                return false;
            }
        }
        return true;
    }
    return checkProperties(obj1, obj2);
};

const selectorRegex = /^([a-z][a-z0-9:_=-]*)?(#[a-z0-9:_=-]+)?(\.[^ ]+)*$/i;

class VNode {
    constructor(...args) {
        this.type = undefined;
        this.props = {};
        this.data = {};
        this.id = undefined;
        this.$html = undefined;
        this.$onrender = undefined;
        this.style = undefined;
        this.value = undefined;
        this.children = [];
        this.classList = [];
        this.eventListeners = {};
        if (args.length === 0) {
            throw new Error(
                "[VNode] No arguments passed to VNode constructor."
            );
        }
        if (args.length === 1) {
            let vnode = args[0];
            if (typeof vnode === "string") {
                // Assume empty element
                this.processSelector(vnode);
            } else if (
                typeof vnode === "function" ||
                (typeof vnode === "object" && vnode !== null)
            ) {
                // Text node
                if (vnode.type === "#text") {
                    this.type = "#text";
                    this.value = vnode.value;
                } else {
                    this.from(this.processVNodeObject(vnode));
                }
            } else {
                throw new Error(
                    "[VNode] Invalid first argument passed to VNode constructor."
                );
            }
        } else if (args.length === 2) {
            let [selector, data] = args;
            if (typeof selector !== "string") {
                throw new Error(
                    "[VNode] Invalid first argument passed to VNode constructor."
                );
            }
            this.processSelector(selector);
            if (typeof data === "string") {
                // Assume single child text node
                this.children = [new VNode({ type: "#text", value: data })];
                return;
            }
            if (
                typeof data !== "function" &&
                (typeof data !== "object" || data === null)
            ) {
                throw new Error(
                    "[VNode] The second argument of a VNode constructor must be an object, an array or a string."
                );
            }
            if (Array.isArray(data)) {
                // Assume 2nd argument as children
                this.processChildren(data);
            } else {
                if (data instanceof Function || data instanceof VNode) {
                    this.processChildren(data);
                } else {
                    // Not a VNode, assume props object
                    this.processProperties(data);
                }
            }
        } else {
            let [selector, props, children] = args;
            if (args.length > 3) {
                children = args.slice(2);
            }
            children = Array.isArray(children) ? children : [children];
            if (typeof selector !== "string") {
                throw new Error(
                    "[VNode] Invalid first argument passed to VNode constructor."
                );
            }
            this.processSelector(selector);
            if (
                props instanceof Function ||
                props instanceof VNode ||
                typeof props === "string"
            ) {
                // 2nd argument is a child
                children = [props].concat(children);
            } else {
                if (typeof props !== "object" || props === null) {
                    throw new Error(
                        "[VNode] Invalid second argument passed to VNode constructor."
                    );
                }
                this.processProperties(props);
            }
            this.processChildren(children);
        }
    }

    from(data) {
        this.value = data.value;
        this.type = data.type;
        this.id = data.id;
        this.$html = data.$html;
        this.$onrender = data.$onrender;
        this.style = data.style;
        this.data = data.data;
        this.value = data.value;
        this.eventListeners = data.eventListeners;
        this.children = data.children;
        this.props = data.props;
        this.classList = data.classList;
    }

    equal(a, b) {
        return equal(a, b === undefined ? this : b, { ignoreFunctions: true });
    }

    processProperties(attrs) {
        this.id = this.id || attrs.id;
        this.$html = attrs.$html;
        this.$onrender = attrs.$onrender;
        this.style = attrs.style;
        this.value = attrs.value;
        this.data = attrs.data || {};
        this.classList =
            attrs.classList && attrs.classList.length > 0
                ? attrs.classList
                : this.classList;
        this.props = attrs;
        Object.keys(attrs)
            .filter((a) => a.startsWith("on") && attrs[a])
            .forEach((key) => {
                if (typeof attrs[key] !== "function") {
                    throw new Error(
                        `[VNode] Event handler specified for ${key} event is not a function.`
                    );
                }
                this.eventListeners[key.slice(2)] = attrs[key];
                delete this.props[key];
            });
        delete this.props.value;
        delete this.props.$html;
        delete this.props.$onrender;
        delete this.props.id;
        delete this.props.data;
        delete this.props.style;
        delete this.props.classList;
    }

    processSelector(selector) {
        if (!selector.match(selectorRegex) || selector.length === 0) {
            throw new Error(`[VNode] Invalid selector: ${selector}`);
        }
        const [, type, id, classes] = selector.match(selectorRegex);
        this.type = type;
        if (id) {
            this.id = id.slice(1);
        }
        this.classList = (classes && classes.split(".").slice(1)) || [];
    }

    processVNodeObject(arg) {
        if (arg instanceof VNode) {
            return arg;
        }
        if (arg instanceof Function) {
            let vnode = arg();
            if (typeof vnode === "string") {
                vnode = new VNode({ type: "#text", value: vnode });
            }
            if (!(vnode instanceof VNode)) {
                throw new Error(
                    "[VNode] Function argument does not return a VNode"
                );
            }
            return vnode;
        }
        throw new Error(
            "[VNode] Invalid first argument provided to VNode constructor."
        );
    }

    processChildren(arg) {
        const children = Array.isArray(arg) ? arg : [arg];
        this.children = children
            .map((c) => {
                if (typeof c === "string") {
                    return new VNode({ type: "#text", value: c });
                }
                if (
                    typeof c === "function" ||
                    (typeof c === "object" && c !== null)
                ) {
                    return this.processVNodeObject(c);
                }
                if (c) {
                    throw new Error(
                        `[VNode] Specified child is not a VNode: ${c}`
                    );
                }
            })
            .filter((c) => c);
    }

    // Renders the actual DOM Node corresponding to the current Virtual Node
    render() {
        if (this.type === "#text") {
            return document.createTextNode(this.value);
        }
        const node = document.createElement(this.type);
        if (this.id) {
            node.id = this.id;
        }
        Object.keys(this.props).forEach((attr) => {
            // Set props (only if non-empty strings)
            if (this.props[attr] && typeof this.props[attr] === "string") {
                const a = document.createAttribute(attr);
                a.value = this.props[attr];
                node.setAttributeNode(a);
            }
            // Set properties
            if (typeof this.props[attr] !== "string" || !node[attr]) {
                node[attr] = this.props[attr];
            }
        });
        // Event Listeners
        Object.keys(this.eventListeners).forEach((event) => {
            node.addEventListener(event, this.eventListeners[event]);
        });
        // Value
        if (this.value) {
            node.value = this.value;
        }
        // Style
        if (this.style) {
            node.style.cssText = this.style;
        }
        // Classes
        this.classList.forEach((c) => {
            node.classList.add(c);
        });
        // Data
        Object.keys(this.data).forEach((key) => {
            node.dataset[key] = this.data[key];
        });
        // Children
        this.children.forEach((c) => {
            const cnode = c.render();
            node.appendChild(cnode);
            typeof $onrenderCallbacks !== "undefined" &&
                c.$onrender &&
                $onrenderCallbacks.push(() => c.$onrender(cnode));
        });
        if (this.$html) {
            node.innerHTML = this.$html;
        }
        return node;
    }

    // Updates the current Virtual Node with a new Virtual Node (and syncs the existing DOM Node)
    redraw(data) {
        let { node, vnode } = data;
        const newvnode = vnode;
        const oldvnode = this;
        if (
            oldvnode.constructor !== newvnode.constructor ||
            oldvnode.type !== newvnode.type ||
            (oldvnode.type === newvnode.type &&
                oldvnode.type === "#text" &&
                oldvnode !== newvnode)
        ) {
            const renderedNode = newvnode.render();
            node.parentNode.replaceChild(renderedNode, node);
            newvnode.$onrender && newvnode.$onrender(renderedNode);
            oldvnode.from(newvnode);
            return;
        }
        // ID
        if (oldvnode.id !== newvnode.id) {
            node.id = newvnode.id || "";
            oldvnode.id = newvnode.id;
        }
        // Value
        if (oldvnode.value !== newvnode.value) {
            node.value = newvnode.value || "";
            oldvnode.value = newvnode.value;
        }
        // Classes
        if (!equal(oldvnode.classList, newvnode.classList)) {
            oldvnode.classList.forEach((c) => {
                if (!newvnode.classList.includes(c)) {
                    node.classList.remove(c);
                }
            });
            newvnode.classList.forEach((c) => {
                if (!oldvnode.classList.includes(c)) {
                    node.classList.add(c);
                }
            });
            oldvnode.classList = newvnode.classList;
        }
        // Style
        if (oldvnode.style !== newvnode.style) {
            node.style.cssText = newvnode.style || "";
            oldvnode.style = newvnode.style;
        }
        // Data
        if (!equal(oldvnode.data, newvnode.data)) {
            Object.keys(oldvnode.data).forEach((a) => {
                if (!newvnode.data[a]) {
                    delete node.dataset[a];
                } else if (newvnode.data[a] !== oldvnode.data[a]) {
                    node.dataset[a] = newvnode.data[a];
                }
            });
            Object.keys(newvnode.data).forEach((a) => {
                if (!oldvnode.data[a]) {
                    node.dataset[a] = newvnode.data[a];
                }
            });
            oldvnode.data = newvnode.data;
        }
        // props
        if (!equal(oldvnode.props, newvnode.props)) {
            Object.keys(oldvnode.props).forEach((a) => {
                if (newvnode.props[a] === false) {
                    node[a] = false;
                }
                if (!newvnode.props[a]) {
                    node.removeAttribute(a);
                } else if (
                    newvnode.props[a] &&
                    newvnode.props[a] !== oldvnode.props[a]
                ) {
                    node.setAttribute(a, newvnode.props[a]);
                }
            });
            Object.keys(newvnode.props).forEach((a) => {
                if (!oldvnode.props[a] && newvnode.props[a]) {
                    node.setAttribute(a, newvnode.props[a]);
                }
            });
            oldvnode.props = newvnode.props;
        }
        // Event listeners
        /////FC
        Object.keys(oldvnode.eventListeners).forEach((a) => {
            if (!newvnode.eventListeners[a]) {
                node.removeEventListener(a, oldvnode.eventListeners[a]);
            } else {
                node.removeEventListener(a, oldvnode.eventListeners[a]);
                node.addEventListener(a, newvnode.eventListeners[a]);
            }
        });
        Object.keys(newvnode.eventListeners).forEach((a) => {
            if (!oldvnode.eventListeners[a]) {
                node.addEventListener(a, newvnode.eventListeners[a]);
            }
        });
        oldvnode.eventListeners = newvnode.eventListeners;
        /////
        // Children
        function mapChildren(oldvnode, newvnode) {
            let map = [];
            let nodesFound = 0;
            /* 
        Construct a map of operations to be performed on the current DOM node children (
        corresponding to oldvnode.children), therefore it has to be the same length as
        max(newvnode.children, oldvnode.children).
      */
            let maxChildrenNode;
            let minChildrenNode;
            if (newvnode.children >= oldvnode.children) {
                maxChildrenNode = newvnode;
                minChildrenNode = oldvnode;
            } else {
                maxChildrenNode = oldvnode;
                minChildrenNode = newvnode;
            }
            for (
                let maxIndex = 0;
                maxIndex < maxChildrenNode.children.length;
                maxIndex++
            ) {
                let found = -1;
                for (
                    let minIndex = 0;
                    minIndex < minChildrenNode.children.length;
                    minIndex++
                ) {
                    if (
                        equal(
                            minChildrenNode.children[minIndex],
                            maxChildrenNode.children[maxIndex]
                        ) &&
                        !map.includes(maxIndex)
                    ) {
                        found = maxIndex;
                        nodesFound++;
                        break;
                    }
                }
                map.push(found);
            }
            if (newvnode.children.length === oldvnode.children.length) {
                // If the length of children arrays is the same there are no added/removed nodes
                return map;
            } else if (newvnode.children.length >= oldvnode.children.length) {
                if (nodesFound === oldvnode.children.length) {
                    map = map.map((n) => (n === -1 ? -2 : n)); // Add extra nodes
                }
            } else {
                if (nodesFound === newvnode.children.length) {
                    map = map.map((n) => (n === -1 ? -3 : n)); // Remove extra nodes
                }
            }
            return map;
        }
        let childMap = mapChildren(oldvnode, newvnode);
        let resultMap = [
            ...Array(childMap.filter((i) => i !== -3).length).keys(),
        ];
        while (!equal(childMap, resultMap)) {
            let count = -1;
            for (let i of childMap) {
                count++;
                let breakFor = false;
                if (i === count) {
                    // Matching nodes;
                    continue;
                }
                switch (i) {
                    case -1:
                        // different node, check
                        oldvnode.children[count].redraw({
                            node: node.childNodes[count],
                            vnode: newvnode.children[count],
                        });
                        break;
                    case -2:
                        // add node
                        oldvnode.children.splice(
                            count,
                            0,
                            newvnode.children[count]
                        );
                        const renderedNode = newvnode.children[count].render();
                        node.insertBefore(renderedNode, node.childNodes[count]);
                        newvnode.children[count].$onrender &&
                            newvnode.children[count].$onrender(renderedNode);
                        breakFor = true;
                        break;
                    case -3:
                        // remove node
                        oldvnode.children.splice(count, 1);
                        node.removeChild(node.childNodes[count]);
                        breakFor = true;
                        break;
                    default:
                        // Node found, move nodes and remap
                        const vtarget = oldvnode.children.splice(i, 1)[0];
                        oldvnode.children.splice(count, 0, vtarget);
                        node.insertBefore(
                            node.childNodes[i],
                            node.childNodes[count]
                        );
                        breakFor = true;
                        break;
                }
                if (breakFor) {
                    break;
                }
            }
            childMap = mapChildren(oldvnode, newvnode);
            resultMap = [...Array(childMap.length).keys()];
        }
        // $onrender
        //// FC
        oldvnode.$onrender = newvnode.$onrender;
        /////
        // innerHTML
        if (oldvnode.$html !== newvnode.$html) {
            node.innerHTML = newvnode.$html;
            oldvnode.$html = newvnode.$html;
            oldvnode.$onrender && oldvnode.$onrender(node);
        }
    }
}

export const h = (...args) => {
    return new VNode(...args);
};

export const update = (oldvnode, newvnode) => {
    if (oldvnode instanceof HTMLElement) {
        // First time
        const element = newvnode.render();
        oldvnode.parentNode.replaceChild(element, oldvnode);
        newvnode.element = element;
        return newvnode;
    }
    if (!oldvnode.element) {
        throw new Error(
            "[update] Old VNode does not include a reference to its corresponding DOM element."
        );
    }
    oldvnode.redraw({ node: oldvnode.element, vnode: newvnode });
    return oldvnode;
};

/**
 * The code of the following class is heavily based on Storeon
 * Modified according to the terms of the MIT License
 * <https://github.com/storeon/storeon/blob/master/LICENSE>
 * Copyright 2019 Andrey Sitnik <andrey@sitnik.ru>
 */
export class Store {
    constructor() {
        this.events = {};
        this.state = {};
    }
    dispatch(event, data) {
        if (event !== "$log") this.dispatch("$log", { event, data });
        if (this.events[event]) {
            let changes = {};
            let changed;
            this.events[event].forEach((i) => {
                this.state = { ...this.state, ...i(this.state, data) };
            });
        }
    }

    on(event, cb) {
        (this.events[event] || (this.events[event] = [])).push(cb);

        return () => {
            this.events[event] = this.events[event].filter((i) => i !== cb);
        };
    }
}

class Route {
    constructor({ path, def, query, parts }) {
        this.path = path;
        this.def = def;
        this.query = query;
        this.parts = parts;
        this.params = {};
        if (this.query) {
            const rawParams = this.query.split("&");
            rawParams.forEach((p) => {
                const [name, value] = p.split("=");
                this.params[decodeURIComponent(name)] = decodeURIComponent(
                    value
                );
            });
        }
    }
}

export class Router {
    constructor({ element, routes, store, location, $onrenderCallbacks }) {
        if (!routes || Object.keys(routes).length === 0) {
            throw new Error("[Router] No routes defined.");
        }
        this.element = element || document.body;
        this.routes = routes;
        this.redraw = null;
        this.redrawing = false;
        this.store = store;
        this.$onrenderCallbacks = $onrenderCallbacks;
        this.location = location || window.location;
    }

    setRedraw(vnode, state) {
        this.redraw = () => {
            vnode.redraw({
                node: this.element.childNodes[0],
                vnode: this.routes[this.route.def](state),
            });
            this.store && this.store.dispatch("$redraw");
        };
    }

    async processPath(event) {
        const oldRoute = this.route;
        const fragment =
            (event &&
                event.newURL &&
                event.newURL.match(/(#.+)$/) &&
                event.newURL.match(/(#.+)$/)[1]) ||
            this.location.hash;
        const path = fragment.replace(/\?.+$/, "").slice(1);
        const rawQuery = fragment.match(/\?(.+)$/);
        const query = rawQuery && rawQuery[1] ? rawQuery[1] : "";
        const pathParts = path.split("/").slice(1);
        let parts = {};
        this.route = null;
        for (let def of Object.keys(this.routes)) {
            let routeParts = def.split("/").slice(1);
            let match = true;
            let index = 0;
            parts = {};
            while (match && routeParts[index]) {
                const rP = routeParts[index];
                const pP = pathParts[index];
                if (rP.startsWith(":") && pP) {
                    parts[rP.slice(1)] = pP;
                } else {
                    match = rP === pP;
                }
                index++;
            }
            if (match) {
                this.route = new Route({ query, path, def, parts });
                break;
            }
        }
        if (!this.route) {
            this.route = oldRoute;
            return; // Halt navigation;
        }
        // Old route component teardown
        if (oldRoute) {
            const oldRouteComponent = this.routes[oldRoute.def];
            oldRouteComponent.state =
                oldRouteComponent.teardown &&
                (await oldRouteComponent.teardown(oldRouteComponent.state));
        }
        // New route component setup
        const newRouteComponent = this.routes[this.route.def];
        newRouteComponent.state = {};
        newRouteComponent.setup &&
            (await newRouteComponent.setup(newRouteComponent.state));
        // Redrawing...
        this.redrawing = true;
        this.store && this.store.dispatch("$navigation", this.route);
        while (this.element.firstChild) {
            this.element.removeChild(this.element.firstChild);
        }
        const vnode = newRouteComponent(newRouteComponent.state);
        const node = vnode.render();
        this.element.appendChild(node);
        this.setRedraw(vnode, newRouteComponent.state);
        this.redrawing = false;
        vnode.$onrender && vnode.$onrender(node);
        if (this.$onrenderCallbacks) {
            this.$onrenderCallbacks.forEach((cbk) => cbk());
            this.$onrenderCallbacks.length = 0;
        }
        window.scrollTo(0, 0);
        this.store && this.store.dispatch("$redraw");
    }

    async start() {
        window.addEventListener("hashchange", (e) => this.processPath(e));
        await this.processPath();
    }

    navigateTo(path, params) {
        let query = Object.keys(params || {})
            .map(
                (p) =>
                    `${encodeURIComponent(p)}=${encodeURIComponent(params[p])}`
            )
            .join("&");
        query = query ? `?${query}` : "";
        this.location.hash = `#${path}${query}`;
    }
}

/*** High Level API ***/
export const h3 = {};

settings.$onrenderCallbacks = true;
let store = null;
let router = null;

h3.init = (config) => {
    let { element, routes, modules, preStart, postStart, location } = config;
    if (!routes) {
        // Assume config is a component object, define default route
        if (typeof config !== "function") {
            throw new Error(
                "[h3.init] The specified argument is not a valid configuration object or component function"
            );
        }
        routes = { "/": config };
    }
    element = element || document.body;
    if (!(element && element instanceof Element)) {
        throw new Error("[h3.init] Invalid element specified.");
    }
    // Initialize store
    store = new Store();
    (modules || []).forEach((i) => {
        i(store);
    });
    store.dispatch("$init");
    // Initialize router
    router = new Router({
        element,
        routes,
        store,
        location,
        $onrenderCallbacks,
    });
    return Promise.resolve(preStart && preStart())
        .then(() => router.start())
        .then(() => postStart && postStart());
};

h3.navigateTo = (path, params) => {
    if (!router) {
        throw new Error(
            "[h3.navigateTo] No application initialized, unable to navigate."
        );
    }
    return router.navigateTo(path, params);
};

Object.defineProperty(h3, "route", {
    get: () => {
        if (!router) {
            throw new Error(
                "[h3.route] No application initialized, unable to retrieve current route."
            );
        }
        return router.route;
    },
});

Object.defineProperty(h3, "state", {
    get: () => {
        if (!store) {
            throw new Error(
                "[h3.state] No application initialized, unable to retrieve current state."
            );
        }
        return store.state;
    },
});

h3.on = (event, cb) => {
    if (!store) {
        throw new Error(
            "[h3.on] No application initialized, unable to listen to events."
        );
    }
    return store.on(event, cb);
};

h3.dispatch = (event, data) => {
    if (!store) {
        throw new Error(
            "[h3.dispatch] No application initialized, unable to dispatch events."
        );
    }
    return store.dispatch(event, data);
};

h3.redraw = (setRedrawing) => {
    if (!router || !router.redraw) {
        throw new Error(
            "[h3.redraw] No application initialized, unable to redraw."
        );
    }
    if (router.redrawing) {
        return;
    }
    router.redrawing = true;
    router.redraw();
    router.redrawing = setRedrawing || false;
};

export default h3;
