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
