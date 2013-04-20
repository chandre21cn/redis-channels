'use strict';

var assert = require('assert')
  , ase = assert.strictEqual
  , redis = require('redis')
  , Channels = require('./lib/channels')
  , Gevent = require('./lib/gevents')

describe('Channels', function() {
  var sub = redis.createClient()
    , pub = redis.createClient()
    , channels = new Channels(sub)

  it('should emit a `ready` event', function(done) {
    channels.ready ? done() : channels.on('ready', done)
  })

  it('should connect to redis', function(done) {
    pub.ready ? done() : pub.on('ready', done)
  })

  it('should use the callback from subscribe on publish', function(done) {
    channels.subscribe('foo', function(chan, msg) {
      ase(chan, 'foo')
      ase(msg, 'hello')
      done()
    })
    pub.publish('foo', 'hello')
  })

  it('should use a listener style callback for publish', function(done) {
    channels.on('bar', function(chan, msg) {
      ase(chan, 'bar')
      ase(msg, 'oh hai')
      done()
    })
    channels.subscribe('bar')
    pub.publish('bar', 'oh hai')
  })

  it('should subscribe to multiple channels at once', function(done) {
    var len = 3
    channels.subscribe('one', 'two', 'three', function(chan, msg) {
      --len || done()
    })
    pub.publish('one', 1)
    pub.publish('two', 2)
    pub.publish('three', 3)
  })

  it('should use pattern subscribtions', function(done) {
    channels.on('*il*', function(chan, msg) {
      ase(chan, 'milk')
      ase(msg, 'chocolate')
      done()
    })
    channels.psubscribe('*il*')
    pub.publish('milk', 'chocolate')
  })

  it('should use pattern callback on subscribe', function(done) {
    channels.psubscribe('foo.*', function(chan, msg) {
      ase(chan, 'foo.bar')
      ase(msg, 'howdy')
      done()
    })
    pub.publish('foo.bar', 'howdy')
  })

  it('should subscribe to multiple patterns at once', function(done) {
    var len = 3
    channels.psubscribe('a?c', 'w*t', 'c[o]w', function(chan, msg) {
      --len || done()
    })
    pub.publish('abc', 'abc')
    pub.publish('what', 'what')
    pub.publish('cow', 'cow')
  })

  it('should disconnect from redis', function(done) {
    var len = 2
    function callback() {
      --len || done()
    }
    pub.on('end', callback)
    pub.quit()

    sub.on('end', callback)
    sub.quit()
  })

  describe('Gevents', function() {
    var EE = new Gevent()
    
    it('should work with normal events', function(done) {
      EE.on('Gevent.foo', done)
      EE.emit('Gevent.foo')
    })

    it('should keep all args for normal events', function(done) {
      EE.on('Gevent.bar', function(a, b, c) {
        ase(a, 'a')
        ase(b, 'b')
        ase(c, 'c')
        done()
      })
      EE.emit('Gevent.bar', 'a', 'b', 'c')
    })

    it('should work for glob style patterns', function(done) {
      EE.on('Gevent.foo.*', done)
      EE.emit('Gevent.foo.bar')
    })

    it('should unsubscribe normally', function(done) {
      EE.on('Gevent.blah', done)
      EE.emit('Gevent.blah')
      process.nextTick(function() {
        EE.removeAllListeners('Gevent.blah')
        EE.emit('Gevent.blah')
      })
    })
  })

})
