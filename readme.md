
A simple in memory cache forgetting the least recently accessed entry when the maximal number of entries is reached.

All operations are fast, O(1) and synchronous.

WARNING : this isn't yet officialy released and is only on github for peer-review !

## When to use it

This cache is mainly useful when :

* it's hard to predict what resources may be queried
* queried resources are often queried again shortly after
* you want to ensure the used memory is bounded
* you may have a big (but bounded) number of entries

Gotchas :

* if the logic of your application is based on time-to-leave and bounded memory isn't a requirement, this isn't for you
* the implementation doesn't guarantee a removal of entries based on TTL, least recently accessed entry is the main criterium (it does guarantee get or peek don't return an expired value, though)
* as said precedently, it's not even released, so obviously you should *not* use it...

## Examples 

### Example 1 - no invalidation, standard use case


### Example 2 - with TTL based invalidation


### Example 3 - with explicit invalidation of entries

	var cache = require('bounded-cache')(20);

	// we're informed our object isn't up to date, let's clean the cache
	function objectIsInvalid(key){
		cache.del(key);
	}
	
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

## API

### set(key, value)

	Sets a pair (key,value). If the key wasn't in the cache, it's considered to be the most recently accessed. If the cache is full, the least recently (key,value) is removed.

### set(key, value, ttl)

	Sets a pair (key,value) with an additionl validity duration in ms. If the key wasn't in the cache, it's considered to be the most recently accessed. If the cache is full, the least recently (key,value) is removed.

### get(key)

	Returns the value. The pair (key,value) is considered to be the most recently accessed. If nothing was set for this key, returns undefined. If the object is too old (which can only happen if a ttl was provided in set), undefined is returned.
	
### peek(key)

	Same as get without accessing the pair (and thus not preventing a removal from the cache).
	
### del(key)

	Removes the pair (key,value). Returns the value.
	
### size()
	
	Returns the number of cached keys, in [0, capacity].
	
### content()

	Returns all pairs (key,value), from the oldest to the last recently accessed. This operation is only here for test purposes.
