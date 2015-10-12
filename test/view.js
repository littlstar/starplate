'use strict';

const Template = require('../').Template;
const assert = require('assert');
const View = require('../').View;

const getTime = _ => {
  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  return `${hours}:${minutes}:${seconds}`;
};

const tpl = new Template('<section>Time <span class="time">${time}</span></section>');
const view = new View(tpl, {time: getTime()});
global.view = view;

view.render();

setInterval(_ => {
  view.update({time: getTime()});
}, 1000);
