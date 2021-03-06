
## Introduction

A fast and light LRU cache forgetting the least recently accessed entry when the maximal number of entries is reached. Optionally, age of entries can be checked to invalidate those whose time-to-leave is exceeded.

All operations are fast, O(1) and synchronous.

## When to use it

This cache is mainly useful when :

* you want to keep in memories some resources that aren't instantly loaded
* it's hard to predict what resources may be queried
* queried resources are often queried again shortly after
* you want to ensure the used memory is bounded
* you may want to cache a big (but bounded) number of entries

Gotchas :

* if the logic of your application is mainly based on time-to-leave and bounded memory isn't a requirement, this isn't for you
* the implementation doesn't guarantee a fast removal of entries based on TTL, as the removal criterium is the least recently accessed entry (it does guarantee that `get` or `peek` don't return an expired value, though)

## Quick Start

	npm install bounded-cache
	
```js
var cache = require('bounded-cache')(2000);
cache.set('A', {my:'object'});
cache.set('B', null);
console.log(cache.get('A')); // {my:'object'}
console.log(cache.get('B')); // null
console.log(cache.get('C')); // undefined
```

## Example 

```js
var cache = require('bounded-cache')(2000);
function serve(key){
	var obj = cache.get(key);
	if (obj === undefined) {
		asynchronousLoad(key, function(err, obj){
			// we store null in case of err to avoid fetching again and again
			cache.set(key, err ? null : obj);
			ui.display(err, obj);
		});
	} else if (obj === null) {
		ui.display("object doesn't exist");
	} else {
		ui.display(null, obj);
	}	
}
```

## API

#### set(key, value)

Sets a pair (key,value). If the key wasn't in the cache, it's considered to be the most recently accessed. If the cache is full, the least recently (key,value) is removed.

#### set(key, value, ttl)

Sets a pair (key,value) with an additional validity duration in ms. If the key wasn't in the cache, it's considered to be the most recently accessed. If the cache is full, the least recently (key,value) is removed.

#### get(key)

Returns the value. The pair (key,value) is considered to be the most recently accessed. If nothing was set for this key, returns `undefined`. If the object is too old (which can only happen if a ttl was provided in set), `undefined` is returned.
	
#### peek(key)

Same as get without "accessing" the pair (and thus not preventing a removal from the cache).
	
#### del(key)

Removes the pair (key,value). Returns the value.
	
#### size()
	
Returns the number of cached keys, in [0, capacity].
	
#### content()

Returns all pairs (key,value), from the oldest to the last recently accessed. This operation is only here for test purposes.

## Development

Most well known V8 optimization tricks/advices are trade-offs which pay or not depending on many factors (making the object bigger to enable faster operations is cool until the GC kicks in). I wrote a few implementations to compare and find what's more efficient in the specific case of bounded-cache.

### Tests

Test the correctness of all implementations :
	
	npm install -g buster-test
	./buster-test

### Benchmark

Run the benchmark :

	./bench

The tests are in `benchmark/compare.js`

I've included in the benchmark another popular and similar library, you'll have to install it (read the compare.js file) to run the benchmarks.
