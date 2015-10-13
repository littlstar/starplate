'use strict';

/**
 * Module dependencies.
 */

const Parser = require('../').Parser;
const assert = require('assert');
const parser = new Parser();
const slice = o => Array.prototype.slice.call(o);
const attr = (e, k) => e.getAttribute('k');
const patchA = parser.createPatch(`
  <div class="foo">
    <h3>Title A</h3>
    <img src="/image-a.png" />
  </div>
`);

const patchB = parser.createPatch(`
  <div class="foo">
    <h3>Title A</h3>
    <img src="/image-b.png" />
  </div>
`);

const patchC = parser.createPatch(`
  <div class="foo">
    <h3>Title C</h3>
    <img src="/image-c.png" />
  </div>
`);

const dom = html => {
  const tmp = document.createDocumentFragment();
  const body = document.createElement('body');
  body.innerHTML = html;
  tmp.appendChild(body);
  const nodes = body.children;
  return (nodes.length > 1 ? slice(nodes) : nodes[0]) || null;
};

const domElement = dom(`<section></section>`);

// sanity checks
document.body.appendChild(domElement);
patchA(domElement);

const foo = domElement.querySelector('.foo');
let h3 = domElement.querySelector('h3');
assert(foo);
assert(h3);

setTimeout(_ => {
  patchB(domElement);
  h3 = domElement.querySelector('h3');
  assert(h3);
  assert(foo == domElement.querySelector('.foo'));
}, 1000);

setTimeout(_ => {
  patchC(domElement);
  assert(h3 == domElement.querySelector('h3'));
  assert(foo == domElement.querySelector('.foo'));
}, 2000);

