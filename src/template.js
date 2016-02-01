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

function makeSafeObject (o) {
  let out = String();

  if ('function' == typeof o) {
    return o;
  }

  if (null == o || 'object' != typeof o) {
    if ('string' == typeof o) {
      try { return JSON.stringify(JSON.parse(o)); }
      catch (e) {}
    }
    return JSON.stringify(o);
  }

  if ('object' == typeof o) {
    for (let k in o) o[k] = makeSafeObject(o[k]);
    if (Array.isArray(o)) {
      out += '[';
      for (let k in o) out += `${o[k]}, `;
      out += ']';
    } else {
      out += '{';
      for (let k in o) out += `${k}: ${o[k]}, `;
      out += '}';
    }
  }

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
    if ('string' == typeof string)
      string = string.replace(RegExp('`', 'g', '\\`'))

    /**
     * Partial template function that accepts
     * an optional variable scope object.
     *
     * @public
     * @function
     * @param {Object} [data = {}]
     * @return {String}
     */

    return (data, scope) => {
      data  = ensureObject(data)
      scope = scope || this

      // allow use of #{} inside of ES6 template strings
      if ('string' == typeof string) {
        var helpersList = string.match(/\{{([^{}]*) ([^{}]*)}}(.*?)\{{\/([^{}]*)}}/)

        // Only apply helpers matching if helpers exist
        if(helpersList && helpersList.length >= 5) {

          var opener  = helpersList[1],
              item    = helpersList[2],
              content = helpersList[3],
              closer  = helpersList[4]

          // If the helpers do not line up, bail
          // Example: {{each}} whatever {{/foo}} would not match
          if(opener != closer) {
            //console.error('Tags did not match', opener, closer)
            return
          }

          // This is just an example. Really want to inject into middleware here
          if(opener == 'each') {

            // Remove helper opener
            string = string.replace(`{{${opener} ${item}}}`, '')
            // Get helper string
            var helperString = data.collection.map( (collectionItem) => this.processString(content, collectionItem, scope))
            // Inject helper string into partial string
            string = string.replace(content, helperString.join(''))
            // Remove helper closer
            string = string.replace(`{{/${closer}}}`, '')

          }

        }

      }

      string = this.processString(string, data, scope)

      return string
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
    this.render = Template.createPartial(source)
    return this;
  }

  static processString(tpl = '', data = {}, scope) {
    scope = scope || this

    /*
    If a template variable doesn't exist, return a blank string for that var.
    This prevents the template from throwing an error on a missing var.
    */
    var objects = tpl.match(/#\{([^{}]*)}/g)
    if(objects) {

      objects.forEach( (o) => {
        o = o.replace('#{', '').replace('}', '')

        // Check whether a property of an object is being applied
        if(o.indexOf('.') > -1) {
          var p = o.split('.')

          /*
          TODO: I'm sure there's a better way to do this
          */
          p.forEach(function(prop, i) {

            switch(i) {

              case 0:

                if(!data[prop]) {
                  data[prop] = ''
                  break
                }

              case 1:
                /*console.log('case 1 fired', data[p[0]][prop])
                console.log('p 0',
                  p[0], // text
                  data[p[0]], // the text object
                  data[p[0]][prop] // the value of prop 'save' -> Save
                )*/

                if(typeof data[p[0]] == 'object' && data[p[0]][prop]) {
                  break
                }

                if(typeof data[p[0]] == 'object' && !data[p[0]][prop]) {
                  data[p[0]][prop] = ''
                  break
                }

              case 2:
                /*console.log('case 2 fired', data[p[0]][prop])
                console.log('p 0',
                  p[0], // text
                  data[p[0]], // the text object
                  data[p[0]][prop] // the value of prop 'save' -> Save
                )*/

                if(typeof data[p[0]] == 'object' && typeof data[p[0]][p[1]] == 'object' && data[p[0]][p[1]][prop]) {
                  break
                }

                if(typeof data[p[0]] == 'object' && typeof data[p[0]][p[1]] == 'object' && !data[p[0]][p[1]][prop]) {
                  data[p[0]][p[1]][prop] = ''
                  break
                }

              default:

                console.error('data tree', data)
                throw new Error(`Property ${prop} doesnt exist`)

            }
          })


        }

        else {
          if(!data[o]) data[o] = ''
        }

      })

    }

    var inject = (
      Object
      .keys(data)
      .filter(key => false == helpers.has(key))
      .map(key => {
        let value = makeSafeObject(data[key])
        return `${key} = ${value}`
      })
    )

    for (let kv of helpers.entries()) {
      inject.push(`${kv[0]} = ${makeSafeObject(kv[1])}`)
    }

    inject = ( inject.length
              ? `var ${inject.join(', ')};`
              : '' )

    // TODO: figure out why sometimes a semicolon is applied, and not others
    if(inject.substr(inject.length - 1) != ';') inject += ';'

    // Remove new line characters
    tpl = tpl.replace(/(\r\n|\n|\r)/gm, '')
    tpl = tpl.replace(/\#\{/g, '${')

    var wrap = new Function('injectDataWrapper', `'use strict'; ${inject} return \`${tpl}\``)

    return wrap.call(scope)
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
    return String(this.source || '');
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
    return this.source;
  }
}
