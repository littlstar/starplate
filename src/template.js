'use strict';

/**
 * Module dependencies.
 */

import {helpers} from './view';

/**
 * Ensures an object.
 *
 * @private
 * @function
 * @name ensureObject
 * @param {Mixed} o
 * @return {Object}
 */

const ensureObject = o => null != o && 'object' == typeof o ? o : {};

/**
 * Recursively makes an object safe for partial
 * usage.
 *
 * @private
 * @function
 * @name makeSafeObject
 * @param {Mixed} o
 * @return {Mixed}
 */

const makeSafeObject = o => {
  let out = String();

  if ('function' == typeof o) {
    return o;
  }

  if (null == o || 'object' != typeof o) {
    return JSON.stringify(o);
  }

  if ('object' == typeof o) {
    for (let k in o) o[k] = makeSafeObject(o[k]);
  }

  out += '{';
  for (let k in o) out += `${k}: ${o[k]}, `;
  out += '}';

  return out;
}

/**
 * Template class.
 *
 * @public
 * @class Template
 */

export default class Template {

  /**
   * Creates a function that accepts an optional
   * object creating a variable scope for the
   * template string. You may pass a string or
   * function. If a function is passed it is
   * called when the partial is created. All
   * data is propagated to functions passed to
   * this function.
   *
   * @public
   * @static
   * @method
   * @name createPartial
   * @param {String|Function}
   * @return {Function} (data) => {String}
   */

  static createPartial (string) {

    /**
     * Partial template function that accepts
     * an optional variable scope object.
     *
     * @public
     * @function
     * @param {Object} [data = {}]
     * @return {String}
     */

    return (data) => {
      data = ensureObject(data);

      let wrap = string;
      let header = (
        Object
        .keys(data)
        .filter(key => false == helpers.has(key))
        .map(key => {
          let value = makeSafeObject(data[key]);
          return `${key} = ${value}`
        })
      );

      for (let kv of helpers.entries())
        header.push(`${kv[0]} = ${makeSafeObject(kv[1])}`);

      header = `var ${header.join(', ')};`;


      if ('function' != typeof wrap) {
        wrap = new Function('data', `'use strict'; ${header} return \`${string}\``);
      }

      const src = `'use strict'; return wrap(data);`;
      const fn = new Function('data', 'wrap', src);
      return String(fn(data, wrap) || '');
    }
  }

  /**
   * Template class constructor.
   *
   * @public
   * @constructor
   * @param {String|Function} source
   */

  constructor (source) {

    /**
     * The template source.
     *
     * @public
     * @type {Function|String}
     * @name source
     */

    this.source = null;

    /**
     * A partial function used to
     * render a template.
     *
     * @public
     * @method
     * @name render
     * @param {Object} [data = {}]
     */

    this.render = null;

    // intial definition
    this.define(source);
  }

  /**
   * Defines the template source.
   *
   * @public
   * @method
   * @name define
   * @param {String|Function} source
   */

  define (source) {
    this.source = source;
    this.render = Template.createPartial(source);
    return this;
  }
}
