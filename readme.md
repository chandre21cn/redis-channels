
Redis Channels
==============

[![Build Status](https://secure.travis-ci.org/sorensen/redis-channels.png)](http://travis-ci.org/sorensen/redis-channels)

Turn redis into a multi-process event emitter! Handles the routing of redis 
pubsub messages for you, EventEmitter style, taking care of the tedious work 
of routing the channel on a `redis.on('message')` callback.


Usage
-----

```js
var Channels = require('redis-channels')
```


Methods
-------

### Channels(client, options)

Constructor method, create a new Channels object to wrap the pubsub 
handlers of the given redis client. If `toJSON` is passed into the options, all 
messages received will be passed through `JSON.stringify`.

* `client` - redis client (will be put into pubsub mode)
* `options` - configuration hash (optional)

```js
var Channels = require('redis-channels')
  , redis = require('redis')
  , pubsub = redis.createClient()
  , channels = new Channels(pubsub)
```


### instance.subscribe(channel, [channel2], [...], callback)

Subscribe to any number of channels, if a callback is supplied it will be 
executed anytime a message is received for any of the channels.

* `param` - parameter

```js
```


### instance.psubscribe(pattern, [pattern2], [...], callback)

Pattern subscribe to any number of patterns, broadcasts to any subscribed 
channels that match the glob-style patterns using [minimatch](https://github.com/isaacs/minimatch).

* `param` - parameter

```js
```


### instance.unsubscribe(channel, [channel2], [...], [listener])

Unsubscribe from any number of channels, if a `listener` is provided, only that 
listener will be removed from the subscriptions, similar to node EventEmitter, if 
there are no other listeners left, or one is not provided, all subscription events 
will be removed and an `unsubscribe` will be issued to the redis client.

* `param` - parameter

```js
```


### instance.punsubscribe(pattern, [pattern2], [...], [listener])

Pattern unsubscribe, see `psubscribe` and `unsubscribe` for details.

* `param` - parameter

```js
```


### instance.on(channel, callback)

Proxy to EventEmitter.on, can be used to attach multiple callback handlers 
for any given `channel` received from a redis publish event.

* `channel` - event listener / redis channel
* `callback` - function callback handler

```js
channels.subscribe('foo', 'bar')
channels.on('foo', 'bar', function(channel, data) {
  // message receive from either foo or bar!
})
channels.publish('foo', 30)
channels.publish('bar', 'meow')
```


Install
-------

With [npm](https://npmjs.org)

```
npm install redis-channels
```


License
-------

(The MIT License)

Copyright (c) 2013 Beau Sorensen <mail@beausorensen.com>

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.