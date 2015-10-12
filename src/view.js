"use strict";

import EventEmitter from 'events';
import Parser from './parser';

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
  body.innerHTML = html;
  tmp.appendChild(body);
  const nodes = body.children;
  return (nodes.length > 1 ? nodes : nodes[0]) || null;
};

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

    this.template = template;
    this.domElement = dom(this.template.partial(model));
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
    const domElement = this.domElement;
    const parser = Parser.sharedInstance();
    const patch = parser.createPatch(this.template.partial(data));
    patch(domElement);
    return this;
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
}
