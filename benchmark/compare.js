// to run this bench, you need 
//  npm install lru-cache

var N = 2000000;



var impls = {};
impls['lru-cache'] = {
	make: function(cap){
		return require("lru-cache")(cap);
	}
};
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

function time(name, f){
	var start = Date.now(), end;
	try {
		f();
	} catch(e){
		console.log('  Task "'+name+'" failed : ' + e);
	} finally {
		end = Date.now();
		console.log('  Task "'+name+'" took ' + (end-start) + ' ms');
	}
}

for (name in impls) {
	[2000, 50000].forEach(function(cacheSize){
		var c = impls[name].make(cacheSize),
			ns3 = Math.floor(N/3),
			s = name + "("+cacheSize+")" + " - " + N + " ";
		time(s+"set", function(){
			for (var i=0; i<N; i++) c.set(''+i, i); 
		});
		time(s+"get", function(){
			for (var i=0; i<N; i++) {
				c.get(''+((i*31)%(N+ns3)));
			}
		});
		time(s+"set, get and get", function(){
			for (var i=0; i<N; i++) {
				var k = ''+((i%ns3) + ns3); 
				c.set(k);
				c.get(k); 
				c.get(''+(N-i));
			}
		});
		time(s+"del", function(){
			for (var i=0; i<ns3; i++) {
				c.del(''+(i*2));
			}
		});
	});
}
