'use strict';

const Template = require('../').Template;
const assert = require('assert');
const View = require('../').View;

const tpl = new Template('<section>Date <span class="data">${date}</span></section>');
const view = new View(tpl, {date: Date()});
global.view = view;

view.render();

setInterval(_ => {
  view.update({date: Date()});
}, 500);
