// https://github.com/Canop/bounded-cache
"use strict";

module.exports = function(capacity){
	var n = 0, cap = capacity||100,
		first = null, last = null,
		map = {};
	return {
		set: function(k, v, ttl){
			var c = map[k];
			if (c) { // a value change doesn't count as an access
				c.v = v;
				return;
			}
			if (n>=cap) {
				delete map[first.k];
				first = first.n;
				first.p = null;
			} else {
				n++;
			}
			c = {k:k, v:v, p:last};
			if (ttl) c.exp = Date.now()+ttl;
			if (last) last.n = c;
			else first = c;
			last = c;
			map[k] = c;
		},
		get: function(k){
			var c = map[k];
			if (c === undefined) return;
			if (c.exp && c.exp<Date.now()) {
				if (c.p) c.p.n = c.n;
				else first = c.n;
				if (c.n) c.n.p = c.p;
				else last = c.p;
				n--;
				delete map[k];
				return;
			}
			if (c !== last) {
				if (c.p) c.p.n = c.n;
				else first = c.n;
				c.n.p = c.p;
				last.n = c;
				c.p = last;
				last = c;
			}
			return c.v;
		},
		peek: function(k){
			var c = map[k];
			if (c === undefined) return;
			if (c.exp && c.exp<Date.now()) {
				if (!c) return;
				if (c.p) c.p.n = c.n;
				else first = c.n;
				if (c.n) c.n.p = c.p;
				else last = c.p;
				n--;
				delete map[k];
				return;
			}
			return c.v;
		},
		del: function(k){
			var c = map[k];
			if (!c) return;
			if (c.p) c.p.n = c.n;
			else first = c.n;
			if (c.n) c.n.p = c.p;
			else last = c.p;
			n--;
			delete map[k];
			return c.v;
		},
		size: function(){
			return n;
		},
		content: function(){
			var c = first, a = [];
			while (c) {
				a.push({key:c.k, value:c.v});
				c = c.n;
			}
			return a;
		},
		empty: function(){
			first = null;
			last = null;
			map = {};
			n = 0;
		}
	}
}
