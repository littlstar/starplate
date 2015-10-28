'use strict';

/**
 * Module dependencies.
 */

import parse5 from 'parse5';
import {
  text,
  patch,
  elementVoid,
  elementOpen,
  elementClose
} from 'incremental-dom';

/**
 * Generates a random unique hex ID string.
 *
 * @private
 * @function
 * @name uid
 * @return {String}
 */

const uid = _ => Math.abs(Math.random() * Date.now()|0).toString('16');

/**
 * Ensures a function.
 *
 * @private
 * @function
 * @name ensureFunction
 * @param {Mixed} fn
 * @return {Function}
 */

const ensureFunction = fn => 'function' == typeof fn ? fn : (() => void 0);

/**
 * Parser class.
 *
 * @public
 * @class Parser
 * @extends parse5.Parser
 */

// Parser shared instance
let instance_ = null;
export default class Parser extends parse5.Parser {

  /**
   * Shared parser instance
   *
   * @public
   * @static
   * @method
   * @name sharedInstance
   * @return {Parser}
   */

  static sharedInstance () {
    instance_ = instance_ || new Parser();
    return instance_;
  }

  /**
   * Parser constructor.
   *
   * @public
   * @constructor
   */

  constructor () {
    super(parse5.TreeAdapters.htmlparser2);

    /**
     * Known patches for this parser state.
     *
     * @public
     * @type {Map}
     * @name patches
     */

    this.patches = new Map();
  }

  /**
   * Creates a patch function used for updating
   * a given DOM Element from the provided source
   * HTML or DOM Element.
   *
   * @public
   * @method
   * @name createPatch
   * @param {String|Element} source
   * @return {Function} (domElement, [done]) => {Undefined}
   */

  createPatch (source) {
    let html = source;

    // get cached patch if diff doesn't exist
    if (!this.hasPatch(source)) {
      return this.getPatch(source);
    }

    // consume source HTML if an element is given
    if (source instanceof HTMLElement) {
      html = source.outerHTML;
    }

    const root = this.parseFragment(String(html));
    const nodes = root.children;
    const stack = [];

    /**
     * Creates and pushes an instruction
     * to the render stack.
     *
     * @private
     * @function
     * @name createInstruction
     * @param {Function} fn
     */

    const createInstruction = fn => stack.push(fn);

    /**
     * Call each routine in stack.
     *
     * @private
     * @function
     * @name render
     */

    const render = _ => stack.forEach(routine => routine());

    /**
     * Traverse node recursively appending
     * instructions to stack.
     *
     * @private
     * @function
     * @name traverse
     * @param {Object} node
     */

    const traverse = node => {
      const kv = [];
      const id = node.attribs ? node.attribs.id : uid();
      const attrs = node.attribs;
      const parent = node.parent;
      const hasChildren = Boolean(node.children ? node.children.length : 0);

      // skip lingering text
      if ('root' == parent.type && 'text' == node.type)
        return;

      if (attrs && Object.keys(attrs).length)
        for (let key in attrs) kv.push(key, attrs[key]);

      if ('tag' == node.type) {
        // begin node
        createInstruction(_ => elementOpen(node.name, id, null, ...kv));

        // define child nodes
        if (hasChildren)
          node.children.forEach(traverse);

        // close node
        createInstruction(_ => elementClose(node.name));
      } else if ('text' == node.type) {
        // handle text nodes
        createInstruction(_ => text(node.data));
      } else {
        // @TODO(werle) - what else ?
        throw new TypeError(`Unhandled node type ${node.type}.`);
      }
    };

    // Walk tree and generate
    // incremental DOM routines
    nodes.forEach(traverse)

    /**
     * Patch routine for a given DOM Element.
     *
     * @public
     * @function
     * @param {Element} domElement
     * @param {Function} [done]
     */

    const partial = (domElement, done) => {
      done = ensureFunction(done);
      patch(domElement, _ => {
        stack.forEach(routine => routine());
        done();
      });
    };

    // set patch
    this.patches.set(source, patch);

    // provide partial patch function
    return partial;
  }

  /**
   * Predicate to determine if source given
   * is an already defined patch.
   *
   * @public
   * @method
   * @name hasPatch
   * @param {Mixed} source
   * @return {Boolean}
   */

  hasPatch (source) {
    return false == this.patches.has(source);
  }

  /**
   * Returns patch by source.
   *
   * @public
   * @method
   * @name getPatch
   * @param {Mixed} source
   * @return {Function}
   */

  getPatch (source) {
    return this.patches.get(source) || null;
  }
}
