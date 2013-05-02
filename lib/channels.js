'use strict';

/*!
 * Module dependencies.
 */

var EventEmitter = require('./gevents')
  , slice = Array.prototype.slice
  , toString = Object.prototype.toString
  , tick = process.nextTick
  , noop = function() {}

/**
 * Pubsub router constructor
 *
 * @param {Object} redis subscription client
 * @param {Object} options
 * @inherits EventEmitter
 * @event `ready`: Emitted when redis client connected
 */

function Channels(client, options) {
  var self = this
  this.client = client
  this.options = options || {}

  // Ready callback
  function ready() {
    self.ready = true
    self.emit('ready')
  }
  // Create public methods for normal and pattern subs/unsubs, done
  // this way as to create/cache once with proper bindings instead 
  // of doing so each method call.
  this.subscribe = this._sub('SUBSCRIBE')
  this.psubscribe = this._sub('PSUBSCRIBE')
  this.unsubscribe = this._unsub('UNSUBSCRIBE')
  this.punsubscribe = this._unsub('PUNSUBSCRIBE')

  // Listen for incomming messages to route
  this.client.on('message', this._message.bind(this))
  this.client.on('pmessage', this._pmessage.bind(this))

  // Wait for redis client ready event
  if (this.client.ready) ready()
  else this.client.on('ready', ready)
}

/*!
 * Inherit from EventEmitter.
 */

Channels.prototype.__proto__ = EventEmitter.prototype

/**
 * Extend EventEmitter `on` listener to take multiple event 
 * parameters to match redis subscribe
 *
 * @param {...} redis channels
 * @param {Function} callback
 */

Channels.prototype.on = function() {
  var self = this
    , args = slice.call(arguments)
    , next = args.pop()

  args.forEach(function(arg) {
    EventEmitter.prototype.on.apply(self, [arg, next])
  })
  return this
}

/**
 * Proxy to redis publish method
 */

Channels.prototype.publish = function() {
  this.client.publish.apply(this.client, arguments)
  return this
}

/**
 * Pattern message handler
 *
 * @param {String} initial pattern sent
 * @param {String} channel
 * @param {String} data payload
 * @api private
 */

Channels.prototype._pmessage = function(pattern, channel, data) {
  return this._message(channel, data)
}

/**
 * Message handler
 *
 * @param {String} channel
 * @param {String} data payload
 * @api private
 */

Channels.prototype._message = function(channel, data) {
  if (!channel) return this
  if (this.options.toJSON && toString.call(data) === '[object String]') {
    data = JSON.parse(data)
  }
  this.emit(channel, channel, data)
  return this
}

/**
 * Subscribe method factory
 *
 * @param {String} method
 * @return {Function} subscribe function
 * @api private
 */

Channels.prototype._sub = function(method) {
  return function() {
    var self = this
      , args = slice.call(arguments)
      , next = noop

    if (toString.call(args[args.length - 1]) === '[object Function]') {
      next = args.pop()
    }
    if (next) {
      args.forEach(function(channel) {
        self.on(channel, next)
      })
    }
    this.client[method].apply(this.client, args)
    return this
  }
}

/**
 * Unsubscribe method factory
 *
 * @param {String} method
 * @return {Function} unsubscribe function
 * @api private
 */

Channels.prototype._unsub = function(method) {
  return function() {
    var self = this
      , args = slice.call(arguments)
      , next
      , unsubs = []

    if (toString.call(args[args.length - 1]) === '[object Function]') {
      next = args.pop()
    }
    args.forEach(function(channel) {
      next
        ? self.removeListener(channel, next)
        : self.removeAllListeners(channel)
      
      if (!self.listeners(channel)) {
        unsubs.push(channel)
      }
    })
    this.client[method].apply(this.client, unsubs)
    return this
  }
}

/**
 * Subscribe to a channel
 *
 * @param {...} channels
 * @param {Function} subscribe callback (optional)
 * @api public
 */

Channels.prototype.subscribe = undefined

/**
 * Subscribe to a channel by pattern
 *
 * @param {...} patterns
 * @param {Function} subscribe callback (optional)
 * @api public
 */

Channels.prototype.psubscribe = undefined

/**
 * Unsubscribe from any number of channels, if a function is
 * supplied as the last argument, only remove that function 
 * from the callback chain, if it is the only listener then 
 * the channel will be unsubscribed from redis
 *
 * @param {...} channels
 * @param {Function} subscribe callback (optional)
 * @api public
 */

Channels.prototype.unsubscribe = undefined

/**
 * Unsubscribe from any number of channels, if a function is
 * supplied as the last argument, only remove that function 
 * from the callback chain, if it is the only listener then 
 * the channel will be unsubscribed from redis
 *
 * @param {...} channels
 * @param {Function} subscribe callback (optional)
 * @api public
 */

Channels.prototype.punsubscribe = undefined

/*!
 * Module exports.
 */

module.exports = Channels
