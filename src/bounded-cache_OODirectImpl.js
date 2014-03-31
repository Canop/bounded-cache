// https://github.com/Canop/bounded-cache
"use strict";

(function(){
	
	function BCache(capacity){
		this.cap = capacity||100;
		this.n = 0;
		this.first = null;
		this.last = null;
		this.map = {};
	}

	module.exports = function(capacity){
		var bc = new BCache(capacity);
		bc.set = function(k, v, ttl){
			var c = this.map[k];
			if (c) { // a value change doesn't count as an access
				c.v = v;
				return;
			}
			if (this.n>=this.cap) {
				delete this.map[this.first.k];
				this.first = this.first.n;
				this.first.p = null;
			} else {
				this.n++;
			}
			c = {k:k, v:v, p:this.last};
			if (ttl) c.exp = Date.now()+ttl;
			if (this.last) this.last.n = c;
			else this.first = c;
			this.last = c;
			this.map[k] = c;
		}

		bc.get = function(k){
			var c = this.map[k];
			if (c === undefined) return;
			if (c.exp && c.exp<Date.now()) {
				if (c.p) c.p.n = c.n;
				else this.first = c.n;
				if (c.n) c.n.p = c.p;
				else this.last = c.p;
				this.n--;
				delete this.map[k];
				return;
			}
			if (c!=this.last) {
				if (c.p) c.p.n = c.n;
				else this.first = c.n;
				c.n.p = c.p;
				this.last.n = c;
				c.p = this.last;
				this.last = c;
			}
			return c.v;
		}

		bc.peek = function(k){
			var c = this.map[k];
			if (c === undefined) return;
			if (c.exp && c.exp<Date.now()) {
				this.del(k);
				return;
			}
			return c.v;
		}

		bc.del = function(k){
			var c = this.map[k];
			if (!c) return;
			if (c.p) c.p.n = c.n;
			else this.first = c.n;
			if (c.n) c.n.p = c.p;
			else this.last = c.p;
			this.n--;
			delete this.map[k];
			return c.v;
		}

		BCache.prototype.size = function(){
			return this.n;
		}

		bc.content = function(){
			var c = this.first, a = [];
			while (c) {
				a.push({key:c.k, value:c.v});
				c = c.n;
			}
			return a;
		}

		bc.empty = function(){
			this.first = null;
			this.last = null;
			this.map = {};
			this.n = 0;
		}
		return bc;
	}
})();
