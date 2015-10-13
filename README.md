# Starplate

Starplate is a lightening fast template and view engine built on top of
[incremental-dom](https://github.com/google/incremental-dom) and Babel.
Think ES6 Templates + Incremental DOM working
together. DOM travseral is made possible with
[parse5](https://github.com/inikulin/parse5).

## Status

This is still new and lacks heavy testing. As this project matures its
documentation and test will as well.

## How does it work?

Templates are just Javascript strings with special scope. In fact, there
is no parsing required as the work is done by creating a scope for a
view template, providing scope level variables defined as normal
Javascript variables in a closure, and letting ES6 (babel) take care of
the template parsing. Views make use of
[incremental-dom](https://github.com/google/incremental-dom) applying
updates to their DOM elements only when necessary.

A generated view template partial may look like this:

```js
const partial = function () {
  var name = 'joe';
  return `<span>Hello ${name}</span>`;
}
```

where the variable `name` is dynamically created and inlined in the
generated partial function. ES6 templating is used for parsing the user
defined template string. Therefore the template language itself is
the ES6 string template language.

## Usage

Starplate is written in ES6 and intended for use in browser environments.
If you intend to use it with build systems
like [duo](https://github.com/duojs/duo) then consider using a plugin
like [duo-babel](https://github.com/babel/duo-babel). You can grab the
latest standalone build from the [dist/](dist/) directory.

### Duo/CommonJS

The Starplate API is defined in the `'starplate'` module.

```js
const Template = require('starplate').Template;
const Parser = require('starplate').Parser;
const View = require('starplate').View;
```

### Browser/Standalone

The browser Starplate API is defined in the `starplate` namespace.

```js
var Template = starplate.Template;
var Parser = starplate.Parser;
var View = starplate.View;
```

### Template

A `Template` instance represents a partial that may interpolate with
data.

```js
const source = 'Hello ${name}';
const tpl = new starplate.Template(source);
const str = tpl.render({name: 'kinkajou'});

console.log(str); // Hello kinkajou
```

You can re-define a template source with the `.define(source)` method.

```js
tpl.define('Goodbye ${name}');
const str = tpl.render({name: 'kinkajou'});

console.log(str); // Goodbye kinkajou
```

### View

A `View` instance represents an API to interacting with a DOM tree.
[Incremental-DOM](https://github.com/google/incremental-dom) manages DOM
rendering and updates which gives Starplate its performance. Updates

## Example

```js
'use strict';

/**
 * Module dependencies.
 */

const Template = require('../').Template;
const assert = require('assert');
const View = require('../').View;

/**
 * Clock class.
 *
 * @public
 * @class Clock
 * @extends View
 */

class Clock extends View {

  /**
   * Returns a string representing time
   * in hours, minutes, and seconds.
   *
   * @public
   * @static
   * @method
   * @name getTime
   * @param {Date} [date = new Date()]
   * @return {String}
   */

  static getTime (date = new Date) {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    return `${hours}:${minutes}:${seconds}`;
  };

  /**
   * Clock class constructor.
   *
   * @public
   * @constructor
   * @param {HTMLElement} [parent = document.body]
   */

  constructor (parent = document.body) {
    super('<section>Time <span class="time">#{time}</span></section>' ,
          {time: Clock.getTime()});
  }

  /**
   * Updates clock time. An optional date argument
   * will override time.
   *
   * @public
   * @method
   * @name update
   * @param {Date} [date = new Date]
   */

  update (date = new Date()) {
    return super.update({time: Clock.getTime(date)});
  }
}

// create Clock instance
const clock = new Clock();

// render clock to body
clock.render(document.body);

// update every second (1000ms)
setInterval(_ => clock.update(), 1000);
```

## Templates

Templates are just a light weight wrapper around a Javascript string
that is interpreted as a partial later on. Pass the `Templates` constructor
a string (or even a function) and you're almost ready to render a template.
Rendering a template is done by calling the `.render()` method on a
`Template` instance.

```js
const tpl = new Template('<div>Hello ${name}</div>');
const str = tpl.render({name: 'kinkajou'}); // <div>Hello kinkajou</div>'
```

A templates source for rendering can be changed dynamically. You can
define a new source for a template with the `.define(source)` method on
a `Template` instance.

```js
tpl.source('<div>Goodbye ${name}</div>');
```

This makes it easy for views with multiple purposes to reuse the same
template.

## Views

Views are a mechanism for consuming a template instance and creating a
DOM element that is managed with
[incremental-dom](https://github.com/google/incremental-dom) Upon
creation the view
calls the template's `.render()` method passing its results to a
function that creates DOM nodes. To render the view to the DOM call the
views `.render()` method. By default, a view is rendered to
`document.body`. You can pass an optional DOM element to the `.render()`
as an override. After rendering a view you can call the views
`update(data)` method to update its DOM tree. This is where
[incremental-dom](https://github.com/google/incremental-dom)
is used. A patch is applied if needed, otherwise the
tree is left intact.

```js
const tpl = new Template('<img src="${url}" />');
const view = new View(tpl, {url: '/logo.png'});
view.render(document.querySelector('#element'));
```

## License

MIT
