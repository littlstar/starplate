'use strict';

/**
 * Module dependencies.
 */

const Parser = require('..').Parser;
const assert = require('assert');

/**
 * Our Parser instance.
 */

const parser = Parser.sharedInstance();

/**
 * Slices an array like object into
 * an Array instance.
 */

const slice = o => Array.prototype.slice.call(o);

/**
 * Creates a patch that sets 'Ruler' title
 * and points to 'ruler.png' image source.
 */

const rulerPatch = parser.createPatch(`
  <div class="foo ruler">
    <h3>Ruler</h3>
    <img src="/ruler.png" />
  </div>
`);

/**
 * Creates a patch that sets 'Painr Bucket' title
 * and points to 'paint-bucket.png' image source.
 */

const paintBucketPatch = parser.createPatch(`
  <div class="foo paint-bucket">
    <h3>Paint Bucket</h3>
    <img src="/paint-bucket.png" />
  </div>
`);

/**
 * Creates a patch that sets 'Chicken in an Egg' title
 * and points to 'chicken-egg.png' image source.
 */

const chickenEggPatch = parser.createPatch(`
  <div class="foo">
    <h3>Chicken in an egg</h3>
    <img src="/chicken-egg.png" />
  </div>
`);

/**
 * Naive DOM element creation. This will throw an
 * error thrown by the DOM.
 */

const dom = html => {
  const tmp = document.createDocumentFragment();
  const body = document.createElement('body');
  body.innerHTML = html;
  tmp.appendChild(body);
  const nodes = body.children;
  return (nodes.length > 1 ? slice(nodes) : nodes[0]) || null;
};

// DOM element instance
const domElement = dom(`
  <section>
    <div class="foo">
      <h3></h3>
      <img src="" />
    </div>
  </section>
`);

// known patches array
const patches = [
  rulerPatch,
  paintBucketPatch,
  chickenEggPatch,
];

// current patch index
let currentPatchIndex = 0;

// render DOM element
document.body.appendChild(domElement);

// initial DOM state
const foo = domElement.querySelector('.foo');
const h3 = domElement.querySelector('h3');

// duh...
assert(foo);
assert(h3);

// apply new patch every second
setInterval(_ => {
  const index = currentPatchIndex++ % patches.length;
  const patch = patches[index];
  patch(domElement);
}, 1000);
