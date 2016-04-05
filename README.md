`ohio.js` is a tool for allowing javascript programmers to assert isolation of a given function. "Isolation", here, is defined as "making no reference to anything that isn't either (1) a built-in language feature or (2) an explicit argument."

In other words, this function would be considered isolated:

```isolated function sum(a, b) { return a + b; }```

However, this function would not be:

```isolated function sum(a, b) { return add(a, b); }```

because that `add` function invoked by the implementation is neither a native JS language feature nor an argument that was passed into the function.

However, the following approach would be valid:

```isolated function sum(a, b, add) { return add(a, b); }```

Because the `add` function was passed in as an argument, this is legal.

### What about things like jquery or window functions? ###
I'm explicitly trying to prohibit scope inheritance. If JQ is in your scope, you can certainly use it - just not in any function that's marked `isolated`. If you DO need to use something like JQuery or window in your function definition, just pass them in as arguments! One convention I'd like to see looks something like this: you'd define your isolated functions privately in your module, but then export bound versions of these functions.

```
isolated function addClass(scope, selector, class) {
  scope.$(selector).addClass(class);
}

const addClass = addClassBase.bind(null, {$: window.$});

export default function addClass;
```

### Why would anyone want that? ###
Because of testing. The current javascript testing infrastructure is a nightmare of boilerplate and complexity. Tests are run against compiled/built output from dozens of source files, and because javascript you're constantly fighting with isolation. If you want to test a function you have to export it so that you can get a refernce to it, for instance. This leads to a lot of unnecessary exposure of implementation details into public APIs.

If, however, a given function can be marked `isolated`, then we _know for a fact_ that it doesn't rely on any kind of external scope or logic. That means that we can grab that function _by value_ and run tests against it.

The larger purpose of ohio.js is to give programmers the ability to annotate their comments with tests, which then run in complete isolation from the rest of the codebase. Consider this:

```
/*
  sums two inputs.

  > sum(1, 3)
  < 4

  > sum("hello ", "world")
  < "hello world"
*/
isolated function sum(a, b) { return a + b; }

export default const whatever {
  foobar: someFunction(a, b, c) { return sum(a, c); }
}
```

If we can get to this point we've changed the game, a bit. Tests, in this way, would run in an isolated instance of node.js! Those asserts would be truly and completely isolated from anything else in the codebase, and they are accessible to tests even though they're not being directly exported anywhere!

### So should my whole codebase be isolated? ###
No! This is JavaScript, not Haskell! Most of your codebase is going to be a hodge-podge of untyped references that you hope resolve in a way that doesn't set the user's computer on fire!

But, a valid goal is to make sure that as much of your core logic as possible is in isolated functions. For instance, if you're writing a React application and using Redux as your data store, your redux reducers could all be implemented as isolated functions and tested in this way!

Is this a good idea?

### What about third-party functions and injected dependencies? Those seem hard to test in doctests! ###
Right, so, an eventual goal here is to provide seamless and trivial mocking. Let's go back to our addClass function and add some hypothetical doctests (I'm really open to ideas here):

```
/*
  Uses jquery to select a DOM element based on the selector, and adds the provided class to that element.

  > let addClassMock = createMock();
  > let jqMock = createMock().andReturn(addClassMock);
  > addClassBase({$: jqMock}, "foo", "bar");
  > addClassMock.wasCalledWith("bar")
  < true
  > jqMock.wasCalledWith("foo")
  < true
*/
isolated function addClassBase(scope, selector, class) {
  scope.$(selector).addClass(class);
}

const addClass = addClassBase.bind(null, {$: window.$});

export default function addClass;
```

Does this work? And we can have a convenient syntax for expecting errors, too - something like this:
```
/*
  adds two numbers, fails if you try to add non-numeric values.

  > sum(2, 2)
  < 4

  > sum("hello ", "world")
  < ! "arguments should be numeric"
*/
isolated function sum(a, b) {
  if (isNaN(a) || isNaN(b)) {
    throw new Error("arguments should be numeric");
  }

  return a + b;
}
```

Does this work? One thing that strikes me is that throwing typed errors is tricky, you'd have to pass those errors in as parts of the scope (i.e. if you wanted to use a custom ArgumentError error) - but that's kinda like in Java declaring what kinds of errors you have to handle, I guess? I dunno.

Thoughts?