// https://github.com/Canop/bounded-cache
"use strict";

(function(){

	function BCache(capacity){
		this.cap = capacity||100;
		this.n = 0;
		this.lru = null; // least recently used
		this.mru = null; // most recently used
		this.map = {};   // points to the node before in the linked list
	}

	BCache.prototype.set = function(k, v, ttl){
		var c = this.map[k];
		if (c !== undefined) {
			if (c === null) this.lru.v = v;
			else c.n.v = v;
			return; // a value change doesn't count as an access
		}
		c = {k:k, v:v, n:null};
		if (ttl) c.exp = Date.now()+ttl;
		if (this.n === 0) {
			this.lru = this.mru = c;
			this.map[k] = null;
			this.n = 1;
			return;
		}
		if (this.n === this.cap) {
			// TODO (depending on a setting and not at each set ?) :
			// search what objects expired before removing the least recently accessed
			delete this.map[this.lru.k];
			this.lru = this.lru.n;
			this.map[this.lru.k] = null;
		} else {
			this.n++;
		}
		this.mru.n = c;
		this.map[k] = this.mru;
		this.mru  = c;
	}

	BCache.prototype.get = function(k){
		var c = this.map[k], o;
		if (c === undefined) return;
		if (c === null) { // get the LRU
			o = this.lru;
			if (o.exp && o.exp<Date.now()) {
				delete this.map[o.k];
				this.lru = o.n;
				this.n--;
				return;
			}
			if (this.n > 1) {
				this.map[o.n.k] = null;
				this.lru = o.n;
				this.mru.n = o;
				this.map[k] = this.mru;
				this.mru = o;
			}
			return o.v;
		}
		var o = c.n;
		if (o === this.mru) {
			if (o.exp && o.exp<Date.now()) {
				delete this.map[o.k];
				this.mru.n = null;
				this.mru = c;
				this.n--;
				return;
			}
			return o.v;
		}
		this.map[o.n.k] = c;
		c.n = o.n;
		if (o.exp && o.exp<Date.now()) {
			this.n--;
			delete this.map[k];
			return;
		}
		this.map[o.k] = this.mru;
		this.mru.n = o;
		this.mru = o;
		return o.v;
	}

	BCache.prototype.peek = function(k){
		var c = this.map[k];
		if (c === undefined) return;
		var o = c === null ? this.lru : c.n;
		if (o.exp && o.exp<Date.now()) {
			this.del(k);
			return;
		}
		return o.v;
	}

	BCache.prototype.del = function(k){
		var c = this.map[k], v;
		if (c === undefined) return;
		delete this.map[k];
		this.n--;
		if (c === null) {
			this.map[this.lru.n] = null;
			v = this.lru.v;
			this.lru = this.lru.n;
			return v;
		}
		v = c.n.v;
		if (c.n === this.mru) {
			this.mru = c;
			c.n = null;
		} else {
			this.map[c.n.n.k] = c;
			c.n = c.n.n;			
		}
		return v;
	}

	BCache.prototype.size = function(){
		return this.n;
	}

	BCache.prototype.content = function(){
		var c = this.lru, a = [];
		while (c) {
			a.push({key:c.k, value:c.v, exp:c.exp});
			c = c.n;
		}
		return a;
	}

	BCache.prototype.empty = function(){
		this.mru = null;
		this.lru = null;
		this.map = {};
		this.n = 0;
	}

	module.exports = function(capacity){
		return new BCache(capacity);
	}
})();
