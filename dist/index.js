'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function parseKeyName(keyName) {
	var key = void 0;
	try {
		key = typeof keyName === 'function' ? keyName.call(this) : eval(keyName);
	} catch (e) {
		key = !!keyName ? keyName : Math.random().toString(36).slice(2);
	}
	return key + '';
}

function getComputedName(computed) {
	var _this = this;

	return this && this.computed && Object.keys(this.computed).filter(function (k) {
		return _this.computed[k] === computed;
	})[0];
}

function stringify(val) {
	return typeof val !== 'string' ? JSON.stringify(val) : val;
}

var ms = {},
    memoryStorage = {
	setItem: function setItem(k, v) {
		return (k = k + '') && (ms[k] = v + '');
	},
	getItem: function getItem(k) {
		return (k = k + '') && ms.hasOwnProperty(k) ? ms[k] : null;
	},
	removeItem: function removeItem(k) {
		return (k = k + '') && ms.hasOwnProperty(k) && delete ms[k];
	},
	clear: function clear() {
		for (var k in ms) {
			if (ms.hasOwnProperty(k)) delete ms[k];
		}
	},
	key: function key(k) {
		return Object.keys(ms)[k] || null;
	}
};

Object.defineProperty(memoryStorage, 'length', { get: function get() {
		return Object.keys(ms).length;
	} });

var storageComputed = function storageComputed(keyName, defaultValue, modifier, options) {

	var isModifier = typeof modifier === 'function',
	    store = !!options && options.store || 'local',
	    cache = !!options && options.cache,
	    sync = !!options && options.sync;

	var type = 'string';
	!!defaultValue && (type = typeof defaultValue === 'undefined' ? 'undefined' : _typeof(defaultValue));
	type !== 'string' && (defaultValue = JSON.stringify(defaultValue));

	var storage = memoryStorage,
	    key = void 0,
	    keypath = void 0,
	    $$ = void 0,
	    self = void 0,
	    teardown = void 0;

	if (!!store) {
		switch (store) {
			case 'local':
				storage = typeof localStorage !== 'undefined' ? localStorage : storage;
				break;
			case 'session':
				storage = typeof sessionStorage !== 'undefined' ? sessionStorage : storage;
				break;
			default:
				storage = Object.keys(storageComputed.drivers).find(store) || storage;
		}

		if (typeof window !== 'undefined' && sync !== false && store === 'local') {
			var handler = function handler(e) {
				if (e.key === key && e.storageArea === storage) {
					var val = e.newValue;
					storage.setItem(key, stringify(val));

					if (!!$$) {
						$$.update(keypath, { force: true });
					}
				}
			};

			window.addEventListener('storage', handler);

			teardown = function teardown() {
				window.removeEventListener('storage', handler);
			};
		}
	}

	return self = {
		get: function get() {
			$$ = this;
			!!key || (key = parseKeyName.call($$, keyName));
			!!keypath || (keypath = getComputedName.call($$, self));
			!!teardown && $$.on('teardown', teardown);

			var val = storage.getItem(key);
			isModifier && (val === null || !cache) && modifier.call($$, key, val, keypath);
			!!val || (val = defaultValue);

			return (typeof val === 'undefined' ? 'undefined' : _typeof(val)) !== type ? JSON.parse(val) : val;
		},
		set: function set(val) {
			$$ = this;
			!!key || (key = parseKeyName.call($$, keyName));
			!!keypath || (keypath = getComputedName.call($$, self));
			!!teardown && $$.on('teardown', teardown);

			isModifier && (val = modifier.call($$, key, val, keypath));
			storage.setItem(key, stringify(val));
		}
	};
};

storageComputed.drivers = {};

module.exports = storageComputed;