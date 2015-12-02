# Starplate

Starplate is a lightning fast template and view engine built on top of
[incremental-dom](https://github.com/google/incremental-dom) and Babel.
Think ES6 Templates + Incremental DOM working
together. DOM travseral is made possible with
[parse5](https://github.com/inikulin/parse5).

## Status

This is still new and lacks heavy testing. As this project matures its
documentation and test will as well.

## Installation

Install `starplate` with NPM:

```sh
$ npm install starplate --save
```

## Usage

Starplate is written in ES6 and intended for use in browser environments.
If you intend to use it with build systems
like [duo](https://github.com/duojs/duo) then consider using a plugin
like [duo-babel](https://github.com/babel/duo-babel). You can grab the
latest standalone build from the [dist/](dist/) directory.

## Examples

### Template

The most basic example is the usage of the `Template` class.
A `Template` instance represents a partial that may interpolate with
data.

```js
import { Template } from 'starplate'
const template = new Template('Hello ${name}')
const output = template.render({name: 'kinkajou'})
console.log(output) // Hello kinkajou
```

### View

Consider the following subclass of the `View`. We define a clock that
has an `update()` method that renders a new time. We call the `.update()`
method every second.

```js
import { Template, View } from 'starplate'

function getTime (date = new Date()) {
  const h = date.getHours(), m = date.getMinutes(), s = date.getSeconds()
  return `${h}:${m}:${s}`
}

class Clock extends View {
  constructor () {
    super(new Template(
      '<section>Time <span class="time">#{time}</span></section>'
    ), {time: getTime()})
  }

  update (date = new Date()) {
    return super.update({time: getTime(date)})
  }
}

const clock = new Clock()
clock.render(document.body)
setInterval(_ => clock.update(), 1000)
```

## License

MIT
