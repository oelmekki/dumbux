class BaseStore {
  constructor() {
    this.setDefaults();
    this._callbacks = {any: []};
  }

  /*
   * setDefaults is the default setDefaults. Yo dawg.
   *
   * Implement this is your class to set the default state. Even if a fetch
   * request will populate it, it's still a good idea to define it with zero
   * values to avoid UI having to test if an array is actually present each
   * time it wants to use it, and also for documentation purpose (two years
   * later, you will be happy to see at a glance all the attributes the store
   * is managing).
   */
  setDefaults() {
    this.state = {};
  }

  /*
   * subscribe allows to register component callback for store change.
   *
   * `keys` can either be a string or an array of strings. Each string
   * is a key to subscribe to : if keys other than "any" are provided,
   * the callback will only be called if one of those keys changed.
   *
   * If a nonexisting key is passed here, the callback will be registered
   * but never called.
   *
   * The `keys` param can be omitted.
   */
  subscribe(cb, keys) {
    if (!keys) keys = "any";
    if (keys && !keys.forEach) keys = [keys];

    keys.forEach(key => {
      if (!this._callbacks[key]) this._callbacks[key] = [];
      this._callbacks[key].push(cb);
    });
  }

  /*
   * unsubscribe allows to remove the given callback from the list of
   * callbacks called when emitting a change.
   *
   * You need to pass the actual reference of the callback you registered,
   * not the same definition. So this will work:
   *
   *     const myFunc = () => alert("hello");
   *     store.subscribe(myFunc);
   *     store.unsubscribe(myFunc);
   *
   * While this won't:
   *
   *     store.subscribe(() => alert("hello"));
   *     store.unsubscribe(() => alert("hello"));
   *
   * If the callback is unknown, it will simply do nothing.
   */
  unsubscribe(cb) {
    Object.keys(this._callbacks).forEach(key => {
      this._callbacks[key] = this._callbacks[key].filter(c => c !== cb);
    });
  }

  /*
   * emitChange notifies subscribers that a change has occured.
   *
   * `keys` is a string or an array of strings specifying for
   * which keys of the store a change should be emitted.
   *
   * `keys` can be omitted, in which case changes are emitted for
   * all keys.
   */
  async emitChange(keys) {
    if (keys && !keys.forEach) keys = [keys];
    if (keys) {
      keys.forEach(key => {
        if (key != "any") {
          if (this._callbacks[key])
            this._callbacks[key].forEach(cb => cb(this.state));
        }
      });
    }

    this._callbacks.any.forEach(cb => cb(this.state));
  }

  /*
   * Diff two states to find which top level keys changed.
   *
   * It returns an array of string, containing the key names (or
   * being empty if there is no change).
   */
  findChangedKeys(oldState, newState) {
    const changed = [];
    Object.keys(newState).forEach(key => {
      if (JSON.stringify(newState[key]) != JSON.stringify(oldState[key]))
        changed.push(key);
    });

    return changed;
  }

  /*
   * setState is an helper to change state and triggers emitChange at once.
   *
   * It's also meant to reflect react's setState api.
   *
   * `changeDef` can be either an Object or a Function.
   *
   * If it's an Object, the value under each of its toplevel keys will be use
   * to overwrite a toplevel key of the store. Eg:
   *
   *     this.setState({name: "Bob", location: {city: "Paris", country: "France"}})
   *
   * This will update `this.state.name` and `this.state.location`, leaving the
   * rest of the state untouched. Note that `this.state.location` is
   * overwritten with the value provided, though. If it used to contain a
   * `streetName` value, it's now gone. For this kind of partial update, you
   * can use a Function.
   *
   * If `changeDef` is a Function, the function is passed the current state as
   * parameter and is expected to return the new state.
   *
   *     this.setState(state => {
   *       state.name = "Bob";
   *       state.location.city = "Paris";
   *       state.location.country = "France";
   *       // state.location.streetName is untouched
   *
   *       return state; // don't forget that, or you'll blank your state,
   *                     // by implicitely returning `undefined`!
   *     });
   *
   * `cb` is a callback that will be issued after the state has changed and
   * will be passed the new state as argument.
   *
   */
  setState(changeDef, cb) {
    let changedKeys = [];

    if (typeof changeDef === 'function') {
      const oldState = JSON.parse(JSON.stringify(this.state));
      const newState = changeDef(JSON.parse(JSON.stringify(this.state)));
      changedKeys = this.findChangedKeys(oldState, newState);
      this.state = newState;
    } else {
      changedKeys = Object.keys(changeDef);
      changedKeys.forEach(key => {
        this.state[key] = changeDef[key];
      });
    }

    if (changedKeys.length) {
      this.emitChange(changedKeys).then(() => {
        if (cb) cb(this.state);
      });
    }
  }

  /*
   * reset restores the default state.
   *
   * It's just calling setDefaults(), this is basically syntactic sugar.
   */
  reset() {
    this.setDefaults();
  }
}

export default BaseStore;
