'use strict';

function parseKeyName(keyName) {
	let key;
	try {
		key = (typeof keyName === 'function') ? keyName.call(this) : eval(keyName);
	} catch(e) {
		key = !!keyName ? keyName : Math.random().toString(36).slice(2);
	}
	return (key + '');
}

function getComputedName(computed) {
	return this && this.computed && Object.keys(this.computed).filter(k => this.computed[k] === computed)[0];
}

function stringify(val) {
	if (typeof val === 'string') {
		return val;
	}
	let refs = [];
	return JSON.stringify(val, (k, v) => {
		if (typeof v === 'object' && v !== null) {
			if (refs.includes(v)) return;
			refs.push(value);
		}
		return value;
	});
}

const ms = {},
	memoryStorage = {
		setItem: (k, v) => ( (k = k + '') && (ms[k] = v + '') ),
		getItem: (k) => ( (k = k + '') && ms.hasOwnProperty(k) ? ms[k] : null ),
		removeItem: (k) => ( (k = k + '') && ((ms.hasOwnProperty(k)) && delete ms[k]) ),
		clear: () => { for (let k in ms) if (ms.hasOwnProperty(k)) delete ms[k]; },
		key: (k) => Object.keys(ms)[k] || null
	};

Object.defineProperty(memoryStorage, 'length', { get: () => Object.keys(ms).length });

const storageComputed = (keyName, defaultValue, modifier, options) => {

	const isModifier = (typeof modifier === 'function'),
		store = ((!!options && options.store) || 'local'),
		cache = !!options && options.cache,
		sync = !!options && options.sync;

	let type = 'string';
	!!defaultValue && (type = typeof defaultValue);
	(type !== 'string') && (defaultValue = JSON.stringify(defaultValue));

	let storage = memoryStorage, key, keypath, $$, self, teardown;

	if (!!store) {
		switch(store) {
			case 'local':
				storage = (typeof localStorage !== 'undefined') ? localStorage : storage;
				break;
			case 'session':
				storage = (typeof sessionStorage !== 'undefined') ? sessionStorage : storage;
				break;
			default: storage = Object.keys(storageComputed.drivers).find(store) || storage;
		}

		if (typeof window !== 'undefined' && sync !== false && store === 'local') {
			let handler = (e) => {
				if (e.key === key && e.storageArea === storage) {
					let val = e.newValue;
					storage.setItem(key, stringify(val));

					if (!!$$) {
						$$.update(keypath, {force: true});
					}
				}
			};

			window.addEventListener('storage', handler);

			teardown = () => {
				window.removeEventListener('storage', handler);
			};
		}
	}

	return self = {
		get: function()	{
			$$ = this;
			!!key || (key = parseKeyName.call($$, keyName));
			!!keypath || (keypath = getComputedName.call($$, self));
			!!teardown && ($$.on('teardown', teardown));

			let val = storage.getItem(key);
			(isModifier && (val === null || ! cache)) && (val = modifier.call($$, key, val, keypath));
			!!val || (val = defaultValue);

			return (typeof val !== type) ? JSON.parse(val) : val;
		},
		set: function(val) {
			$$ = this;
			!!key || (key = parseKeyName.call($$, keyName));
			!!keypath || (keypath = getComputedName.call($$, self));
			!!teardown && ($$.on('teardown', teardown));

			isModifier && (val = modifier.call($$, key, val, keypath));
			storage.setItem(key, stringify(val));
		}
	};
};

storageComputed.drivers = {};

module.exports = storageComputed;