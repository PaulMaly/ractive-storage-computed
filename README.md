ractive-storage-computed 1.0.0
==============================

Ready-to-use constructor of [Ractive]'s computed properties for Storage interface and compatible things.

*Find more Ractive.js things at
[ractive.js.org/integrations/](https://ractive.js.org/integrations/)*

Installation & Configuration
--------------------

Include `ractive.storageComputed.js` on your page below Ractive, e.g:

```html
<script src='lib/ractive.min.js'></script>
<script src='dist/ractive.storageComputed.js'></script>
```

To get ractive-storage-computed you can:


#### Use npm

    $ npm install --save ractive-storage-computed

-------

#### Development setup

Build UMD package in ./dist

    $ npm install
    $ npm run build


Quick example
-------------

```js

//commonJs

const Ractive = require('ractive');
const storageComputed = require('ractive-storage-computed');

const $$ = new Ractive({
    computed: {
        foo: storageComputed('foo', ''), // store in-memory
        bar: storageComputed('bar', '', null, { store: 'local' }), // use localStorage API
        baz: storageComputed('baz', '', null, { store: 'session' }), // use sessionStorage API
    }
});
```


Basics
------

##### storageComputed([keyName[, defaultValue, [, modifier[, options]]]])

- The `keyName` optional parameter; can be a string key, a function which has return string key or expression:

```js
const nameComputed = storageComputed('name');
const nameComputed = storageComputed(function() {
    return this.component.name + '_name'; // any dynamic keyName
}, 0);
const nameComputed = storageComputed('this.component.name + "_name"');
const nameComputed = storageComputed(); // auto-generated key

```
The function and expression will be triggered within current Ractive's instance context. If `keyName` is undefined or null, key will be generated automatically. 

- The `defaultValue` optional parameter; can be any type value, e.g. string, number. object, etc. The main thing, that the type of this value will be considered as the right type for the subsequent values of computed property and will be used for converting operations. If `defaultValue` is undefined, it will be assumed that type of value is a string.

```js
const langComputed = storageComputed('language', 'en'); //string
const countComputed = storageComputed('count', 0); // number
const postsComputed = storageComputed('posts', []); // array
etc.

```
- The `modifier` optional parameter; the callback function which will be triggered, before any `get` and `set` operations under the current computed property. More about `Modifiers` read below.

```js
const usernameComputed = storageComputed('username', '', function(key, val, keypath) {
    return val.charAt(0).toUpperCase() + val.slice(1); // modify value as you need, for example, capitalize first letter
});

```

- The available `options` are:
  - store: `in-memory` by default. `local` (for localStorage), `session` (for sessionStorage) and any custom Storage interface compatible driver (read below).
  - sync:  `true` (default) or `false`; used to sync changes in the storage between browser tabs.
  - cache: `false` (default) or `false`; whether or not to trigger modifier every `get` operation or just get value from the storage as is.


Modifiers
---------
The modifier is a simple callback function which can be used with storage-computed to modify the value on the fly. Modifier takes 3 parameters: `key` in storage, `value`, and `keypath` of computed itself.
The modifier also will be triggered in the current Ractive's instance context, so you can use `this` to manipulate the instance's data.       

```js
const isOnComputed = storageComputed('isOn', false, function(key, val, keypath) {   
    return !!val || this.get('forceOn');   
});

```

Custom drivers
--------------
You able to add your own Storage interface implementation to `drivers` object and use it by name:
```js

storageComputed.drivers.my = new MyStorage(); // compatible with Storage interface

const userComputed = storageComputed('user', {}, null, { store: 'my' });

```


Advanced usage
--------------
If you're using `Promise adaptor` or `Ractive-app` module, you able to use storage-computed to make asynchronous operation is declarative and in lazy-manner.
For example, load some data from the server only once for a session regarding some condition using `Ractive-app`:
```js

const App = require('ractive-app')();
const storageComputed = require('ractive-storage-computed');

function fetchPostsModifier(key, val, keypath) {
    if ( ! val) {
        val = fetch('/posts').then(r => r.json());
    }
    return val;
}

const $$ = new App({
    template: `
    {{#if isEditor }}
    <nav>
        {{#posts}}
        <a href="{{ .permalink }}">{{ .title }}</a>
        {{/posts}}
    </nav>
    {{/if}}
    `,
     data: {
        isEditor: false     
     },
     computed: {
        posts: storageComputed('posts', [], fetchPostsModifier, { store: 'session', cache: true })
     }
});


$$.toggel('isEditor'); // toggle to true, data are loaded from the server and stored in sessionStorage.
$$.toggel('isEditor'); // toggle to false again, a list become unrendered.
$$.toggel('isEditor'); // toggle to true again, data are loaded from sessionStorage.

```

Data won't be loaded until `isEditor` variable untrue and vice versa. Anyway, we don't need to worry about it anymore.

Examples
--------

Please, run an examples `speed-converter` and `shop-filtres` to see library in the action.

Build & run examples:

    $ npm run build:examples
    $ npm run examples

Then open localhost:8080 in your browser.