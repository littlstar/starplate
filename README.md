# starplate

Starplate is a lightening fast template and view engine built on top of
Incremental DOM and Babel. Think ES6 Templates + Incremental DOM working
together. DOM travseral is made possible with
[parse5](https://github.com/inikulin/parse5).

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

## Example

```js
const Template = require('starplate').Template;
const View = require('starplate').View;

// creates a time string representing current
// hours, minutes, and seconds
const getTime = _ => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const milliseconds = date.getMilliseconds();
  return `${hours}:${minutes}:${seconds}`;
};

// the view template
const tpl = new Template('<section>Time <span class="time">${time}</span></section>');

// the view instance with an initial data model
const view = new View(tpl, {time: getTime()});

// update view every a second
setInterval(_ => {
  view.update({time: getTime()});
}, 1000);

// render to body
view.render(document.body);
```

## Templates

Templates are just a light weight wrapper around a Javascript string
that is interpreted as a partial later on. Pass the `Templates` constructor
a string (or even a function) and you're almost ready to render a template.
Rendering a template is done by calling the `.render()` method on a
`Template` instance.

```js
const tpl = new Template('<div>Hello ${name}</div>');
const str = tpl.render({name: 'kinkajou'}); // <div>Hello kinkajou}</div>'
```

## Views

Views are a mechanism for consuming a template instance and creating a
DOM element that is managed with incremental-dom. Upon creation the view
calls the template's `.render()` method passing its results to a
function that creates DOM nodes. To render the view to the DOM call the
views `.render()` method. By default, a view is rendered to
`document.body`. You can pass an optional DOM element to the `.render()`
as an override. After rendering a view you can call the views
`update(data)` method to update its DOM tree. This is where
incremental-dom is used. A patch is applied if needed, otherwise the
tree is left intact.

## License

MIT

