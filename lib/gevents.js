'use strict';

/*!
 * Module dependencies.
 */

var EventEmitter = require('events').EventEmitter
  , minimatch = require('minimatch')
  , slice = Array.prototype.slice
  , tick = process.nextTick
  , noop = function() {}

/**
 * Gevents constructor
 *
 * @param {Object} redis subscription client
 * @param {Object} options
 * @inherits EventEmitter
 */

function Gevent() {
  return EventEmitter.apply(this, arguments)
}

/*!
 * Inherit from EventEmitter.
 */

Gevent.prototype.__proto__ = EventEmitter.prototype

/*!
 * EE emit caching
 */

Gevent.prototype._emit = Gevent.prototype.emit

/**
 * Emit the event by using glob pattern matching for all current events
 *
 * @param {String} event name
 * @param {...} data arguments
 * @api public
 */

Gevent.prototype.emit = function(event) {
  var self = this
    , args = slice.call(arguments, 1)
    , events = Object.keys(this._events || {})

  events.forEach(function(name) {
    tick(function() {
      if (minimatch(event, name)) {
        self._emit.apply(self, [name].concat(args))
      }
    })
  })
  return this
}

/*!
 * Module exports.
 */

module.exports = Gevent
