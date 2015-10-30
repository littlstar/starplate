"use strict";

/**
 * Module dependencies.
 */


let EventEmitter = (function() {
  try {
    return require('events').EventEmitter;
  } catch (e) {
    return require('component/emitter');
  }
})();

import Template from './template';
import Parser from './parser';

/**
 * Grab first element of an array like object
 * if possible, otherwise use argument.
 *
 * @private
 * @function
 * @name first
 * @param {Mixed} a
 * @return {Mixed}
 */

const first = a => a && a.length && a[0] ? a[0] : a;

/**
 * Creates a DOM from an HTML string.
 *
 * @private
 * @function
 * @name dom
 * @param {String} html
 * @return {Element|NodeList}
 */

const dom = html => {
  const body = document.createElement('body');
  const tmp = document.createDocumentFragment();
  let nodes = null;
  try {
    body.innerHTML = html;
    tmp.appendChild(body);
    nodes = body.children;
  } catch (e) { }
  return (nodes && nodes.length > 1 ? nodes : nodes[0]) || html;
};

/**
 * Deep merge objects
 *
 * @private
 * @function
 * @name merge
 * @param {Object} a
 * @param {Object} b
 * @return {Object}
 */

const merge = (a, b) => {
  for (let k in b) {
    if ('object' == typeof b[k] &&
        'object' == typeof a[k])
      merge(a[k], b[k]);
    else
      a[k] = b[k];
  }
  return a;
};

/**
 * Known view helpers defined with View.helper().
 *
 * @public
 * @const
 * @type {Map}
 * @name helpers
 */

export const helpers = new Map();

/**
 * View class.
 *
 * @public
 * @class View
 * @extends EventEmitter
 */

export default class View extends EventEmitter {

  /**
   * Gets or sets a helper by name.
   *
   * @public
   * @static
   * @method
   * @name helper
   * @param {String} name
   * @param {Function} [definition]
   * @return {View|Function}
   */

  static helper (name, definition) {
    if (name && definition) {
      if ('function' != typeof definition) {
        throw new TypeError("Expecting definition to be a function.");
      }

      if ('string' != typeof name) {
        throw new TypeError("Expecting name to be a string.");
      }

      helpers.set(name, definition);
      return View;
    } else if (name) {
      return helpers.get(name) || null;
    }

    throw new TypeError("Expecting at least 1 argument.");
  }

  /**
   * View class constructor.
   *
   * @public
   * @constructor
   * @param {Template} template
   * @param {Object} model
   */

  constructor (template, model = {}) {
    super();

    // ensure template
    if (false == template instanceof Template) {
      template = new Template(template);
    }

    /**
     * View data model.
     *
     * @public
     * @type {Object}
     * @name model
     */

    this.model = model || {};

    /**
     * The template associated with this view.
     *
     * @public
     * @type {Template}
     * @name template
     */

    this.template = template;

    /**
     * The DOM Element associated with this view.
     *
     * @public
     * @type {Element}
     * @name domElement
     */

    this.domElement = first(dom(this.template.render(this.model)));
  }

  /**
   * Renders view to target DOM element.
   *
   * @public
   * @method
   * @name render
   * @param {Element} parentDomElement
   * @return {View}
   */

  render (parentDomElement = document.body) {
    const domElement = this.domElement;

    // ensure DOM element
    if (false == parentDomElement instanceof Element) {
       throw new TypeError("Expecting a DOM Element.");
    }

    // only append if parent does not contain element
    if (false == parentDomElement.contains(domElement)) {
      parentDomElement.appendChild(domElement);
    }
    return this;
  }

  /**
   * Updates DOM element with optional data
   *
   * @public
   * @method
   * @name update
   * @param {Object} data
   * @return {View}
   */

  update (data) {
    this.patch(dom(this.template.render(merge(this.model, data || {}))));
    return this;
  }

  /**
   * Patches view DOM tree with source string
   * or a given DOM Element.
   *
   * @public
   * @method
   * @name patch
   * @param {String|Element} source
   * @return {View}
   */

  patch (source) {
    const domElement = this.domElement;
    const parser = Parser.sharedInstance();
    const patch = parser.createPatch(source);
    patch(domElement);
    return this
  }

  /**
   * Destroys view and removes DOM element.
   *
   * @public
   * @method
   * @name destroy
   * @return {View}
   */

  destroy () {
    const domElement = this.domElement;
    const parentElement = domElement && domElement.parentElement;
    if (parentElement && domElement) {
      if (parentElement.contains(domElement)) {
        parentElement.removeChild(domElement);
      }
    }
    return this;
  }

  /**
   * Implements toString.
   *
   * @public
   * @method
   * @name toString
   * @return {String}
   */

  toString () {
    return String(this.domElement ? this.domElement.outerHTML || '' : '');
  }

  /**
   * Implements valueOf.
   *
   * @public
   * @method
   * @name valueOf
   * @return {Element}
   */

  valueOf () {
    return this.domElement;
  }
}
