var buster = require("buster"),
	impls = {};

impls['bounded-cache-prototype'] = {
	make: function(cap){
		return require('../src/bounded-cache_prototypeImpl.js')(cap);
	}
};
impls['bounded-cache-prototype-direct'] = {
	make: function(cap){
		return require('../src/bounded-cache_prototypeDirectImpl.js')(cap);
	}
};
impls['bounded-cache-prototype-entry'] = {
	make: function(cap){
		return require('../src/bounded-cache_prototypeEntryImpl.js')(cap);
	}
};
impls['bounded-cache-closure'] = {
	make: function(cap){
		return require('../src/bounded-cache_closureImpl.js')(cap);
	}
};

for (name in impls) {
	(function(name){
		buster.testCase(name, {
			"set/get/del, overflow": function () {
				var c = impls[name].make(3);
				buster.assert.equals(c.size(), 0);
				c.set('0', 'zero')
				c.set('a', 'A');
				c.set('b', 'B'); // -> keys : 0, a, b
				buster.assert.equals(c.peek('0'), 'zero');
				buster.assert.equals(c.size(), 3);
				c.set('a', 'a'); // -> keys : 0, a, b (a value change doesn't count as an access)
				c.set('onetoomany', null); // -> keys : a, b, onetoomany
				buster.assert.equals(c.peek('0'), undefined);
				buster.assert.equals(c.peek('a'), 'a');
				c.get('a'); // -> keys : b, onetoomany, a
				c.set('d','d'); // -> keys : onetoomany, a, d
				buster.assert.equals(c.peek('b'), undefined);
				buster.assert.equals(c.peek('a'), 'a');
				buster.assert.equals(c.size(), 3);
				c.del('a'); // -> keys : onetoomany, d
				c.del('nothere');
				buster.assert.equals(c.size(), 2);
				buster.assert.equals(c.peek('onetoomany'), null);
				buster.assert.equals(c.peek('a'), undefined);
				buster.assert.equals(c.peek('d'), 'd');
				c.set('e', 'e', -1); // -1 to force immediate expiration
				buster.assert.equals(c.peek('e'), undefined);
				c.empty();
				buster.assert.equals(c.size(), 0);
			}
		});
	})(name);
}
