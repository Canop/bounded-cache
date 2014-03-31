

# Double-linked list, closure based (bounded-cache_closureImpl.js)

A double-linked list and a map. All properties are stored in a closure.

This makes for a very clean code and the only one with private properties, but it's sligthly slower than using a prototype.

# Double-linked list, prototype based (bounded-cache_prototypeImpl.js)

A double-linked list and a map. All properties are stored in a closure.

This one is generally the fastest one.

# new Object, with properties directly attached to the object (bounded-cache_OODirectImpl.js)

The only difference with the prototype based solution is that functions are directly attached to the object, in an attempt to avoid prototype chain lookup, but it seems V8 doesn't need this help.

# Entry object created with a constructor too (bounded-cache_prototypeEntryImpl.js)

In order to see if using an object created with a constructor is faster, as is often claimed, I replaced the object literal creation for the node elements by a constructor.

This doesn't help

# Single-linked list (bounded-cache_singleListPrototypeImpl.js)

Departing from the obvious double-linked list solution (which makes it easy to remove nodes in the middle of the list), this one uses a single linked list.

But, even while it uses less memory, the algorithm is much more complex and it ends slower than the double-linked list solution. It's still interesting.
