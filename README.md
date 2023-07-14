# Dumbux

Dumbux is meant to be a compromise between keeping your architecture super
simple and taking advantage of the flux pattern. It's an agnostic store,
allowing for central state management and propagation to your UI, while
staying dirt simple - both as in conceptual simplicity and as in ease of
use.

## Install

Dumbux is a single file (base_store.js, the rest is just for the test
suite), just copy it in your codebase! It's meant to stay simple and I've
used the current version unmodified for years before publishing it, so
don't fear missing an update or something.  I recommend you read it and
take ownership of it, it's very simple. Now it's yours, congratulations. :)

## Usage

```js
// user_store.js
import BaseStore from "./base_store.js"

class UserStore extends BaseStore {
  setDefaults() {
    this.state = {
      name: "Alice",
      email: "alice@example.com",
      active: true,
    };
  }
}

const store = new UserStore();
export default store;
```

And that's it, you have a store. Whatever your UI looks like, be it React,
Vue, vanilla-js, etc, you can now **subscribe** to that store to be
notified when something changed:

```js
import userStore from "./base_store.js"
const $name = document.getElementById("name");

userStore.subscribe(state => $name.value = state.name);
```

If you have a big store, you can subscribe to the change of only a part of
it:

```
// subscribe only to changes on "name"
userStore.subscribe(state => { $name.value = state.name }, "name");

// subscribe only to changes on "name" and "email"
userStore.subscribe(state => { $name.value = state.name }, ["name", "email"]);
```

Now, subscribing is nice and all, but you also want to change your state.
For this, if you are familiar with React, you won't be at lost when using
dumbux' **setState** :

```js
// user_store.js
import BaseStore from "./base_store.js"

class UserStore extends BaseStore {
  setDefaults() {
    this.state = {
      name: "Alice",
      email: "alice@example.com",
      active: true,
    };
  }

  // you can pass simple objects
  // @arg Boolean
  activeChanged(active) {
    this.setState(active);
  }

  // or you can pass a function
  // @arg1 String
  // @arg2 Any
  attributeChanged(attribute, value) {
    this.setState(state => {
      state[attribute] = value;
      return state; // don't forget to return state here!
    });
  }
}

const store = new UserStore();
export default store;
```

You can now allow your interface to change states:

```js
import userStore from "./base_store.js"
const $name = document.getElementById("name");

userStore.subscribe(state => $name.value = state.name);
$name.addEventListener("keyup", userStore.attributeChanged("name", $name.value));
```

> *Note*: if you really want to, you can manipulate `this.state` directly
> in your store, but then you have to call `this.emitChange()` to notify
> subscribers of the change. You probably should avoid that.

Finally, you can unsubscribe by passing the callback you subscribed with:

```js
import userStore from "./base_store.js"

const updateName = state => $name.value = state.name;
userStore.subscribe(updateName, "name");
userStore.unsubscribe(updateName);
```

From there, your store is a just a class under your control, do whatever
you need to get your data in there. :) You can fetch, you can compute, you
can have async functions : it's just plain javascript. You could even have
a store subscribing to other stores to let them all manage their own part
of the state (did that, wouldn't recommend : that's opening door to
complexity).

Have fun!
