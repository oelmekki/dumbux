import BaseStore from "../base_store.js";

class Example1Store extends BaseStore {
  setDefaults() {
    this.state = {
      properlySet: true,
      otherAttr: "not_changed",
      yetAnother: "not_changed",
      deep: {
        deepAttr: "not_changed",
        dontChangeMe: "not_changed",
      }
    }
  }
}

describe("Default state", () => {
    it("can be retrieved", () => {
      const store = new Example1Store();

      expect(store.state.properlySet).toBe(true);
    });
});

describe("setState()", () => {
  it("allows to update state", () => {
    const store = new Example1Store();
    store.setState({otherAttr: "changed"});

    expect(store.state.otherAttr).toBe("changed");
  });

  it("does not change other attributes", () => {
    const store = new Example1Store();
    store.setState({otherAttr: "changed"});

    expect(store.state.yetAnother).toBe("not_changed");
  });

  it("accepts a function as change handler", () => {
    const store = new Example1Store();
    store.setState(state => {
      state.deep.deepAttr = "changed";
      return state;
    });

    expect(store.state.deep.deepAttr).toBe("changed");
    expect(store.state.deep.dontChangeMe).toBe("not_changed");
  });
});

describe("subscribe()", () => {
  it("notifies handler on change", () => {
    let notified = false;
    const store = new Example1Store();
    store.subscribe(state => notified = stated.otherAttr);
    store.setState({otherAttr: "changed"});

    setTimeout(() => {
      expect(notified).toBe("changed");
    }, 1);
  });

  it("allows to filter notification by attribute", () => {
    let notified1 = false;
    let notified2 = false;

    const store = new Example1Store();
    store.subscribe(state => notified1 = stated.otherAttr, "otherAttr");
    store.subscribe(state => notified2 = stated.yetAnother, "yetAnother");

    store.setState({otherAttr: "changed"});
    store.setState({yetAnother: "changed"});

    setTimeout(() => {
      expect(notified1).toBe("changed");
      expect(notified2).toBe(false);
    }, 1);
  });

  it("allows to use multiple attributes for the filter", () => {
    let notified = 0;
    const store = new Example1Store();
    store.subscribe(state => notified++, ["otherAttr", "yetAnother"]);
    store.setState({otherAttr: "changed"});

    setTimeout(() => {
      expect(notified).toBe(1);
      store.setState({yetAnother: "changed"});
      setTimeout(() => {
        expect(notified).toBe(2);
      }, 1);
    }, 1);
  });
});

describe("unsubscribe()", () => {
  it("removes change handler", () => {
    let notified = false;
    const store = new Example1Store();
    const handler = state => notified = true;
    store.subscribe(handler);
    store.unsubscribe(handler);

    store.setState({otherAttr: "changed"});

    setTimeout(() => {
      expect(notified).toBe(false);
    }, 1);
  });
});
