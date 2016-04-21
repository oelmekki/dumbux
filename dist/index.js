"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var DataManager = function () {
  function DataManager(props, parent) {
    _classCallCheck(this, DataManager);

    this.props = props || {};
    this.parent = parent;

    if (this.parent) {
      this.root = this.parent;
      while (this.root.parent) {
        this.root = this.root.parent;
      }
    }

    this.initializeSubManagers();
    this.initializeData();
  }

  _createClass(DataManager, [{
    key: 'initializeSubManagers',
    value: function initializeSubManagers() {
      var _this = this;

      if (!this._submanagers) {
        this._submanagers = function () {
          if (_this.hasSubmanagers()) {
            var _ret = function () {
              var managers = {};
              Object.keys(_this.getSubManagers()).forEach(function (key) {
                var managerClass = _this.getSubManagers()[key];
                managers[key] = new managerClass(_this.props[key], _this);
                managers[key].subscribe(_this._changed.bind(_this));
                _this[key] = managers[key];
              });

              return {
                v: managers
              };
            }();

            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
          } else return {};
        }();
      }
    }
  }, {
    key: 'initializeData',
    value: function initializeData() {
      return this.state = this.mergeInitial(this.getInitialState());
    }
  }, {
    key: 'callbacks',
    value: function callbacks() {
      if (!this._callbacks) this._callbacks = [];
      return this._callbacks;
    }
  }, {
    key: 'getInitialState',
    value: function getInitialState() {
      return {};
    }
  }, {
    key: 'subscribe',
    value: function subscribe(callback) {
      this.callbacks().push(callback);
    }
  }, {
    key: 'unsubscribe',
    value: function unsubscribe(callback) {
      this._callbacks = this._callbacks.filter(function (cb) {
        return cb !== callback;
      });
    }
  }, {
    key: 'hasSubmanagers',
    value: function hasSubmanagers() {
      return this.getSubManagers && Object.keys(this.getSubManagers()).length > 0;
    }
  }, {
    key: 'mergeInitial',
    value: function mergeInitial(data) {
      var _this2 = this;

      Object.keys(this._submanagers).forEach(function (key) {
        data[key] = _this2._submanagers[key].initializeData();
      });

      return data;
    }
  }, {
    key: 'getState',
    value: function getState() {
      var _this3 = this;

      var state = {};
      Object.keys(this.state).forEach(function (key) {
        state[key] = _this3.state[key];
      });

      Object.keys(this._submanagers).forEach(function (key) {
        state[key] = _this3._submanagers[key].getState();
      });

      return state;
    }
  }, {
    key: 'setState',
    value: function setState(data, propagate) {
      var _this4 = this;

      if (typeof propagate === 'undefined') propagate = true;

      Object.keys(data).forEach(function (key) {
        if (_this4._submanagers[key]) _this4._submanagers[key].setState(data[key], false);else _this4.state[key] = data[key];
      });

      if (propagate) this._changed();
    }
  }, {
    key: '_changed',
    value: function _changed() {
      var _this5 = this;

      this.callbacks().forEach(function (callback) {
        return callback(_this5.getState());
      });
    }
  }, {
    key: 'resetData',
    value: function resetData() {
      var _this6 = this;

      Object.keys(this._submanagers).forEach(function (name) {
        _this6._submanagers[name].resetData();
      });

      this.initializeData();
    }
  }]);

  return DataManager;
}();

DataManager.rememberedStates = 100;

DataManager.createClass = function (properties) {
  var klass = function klass(props, parent) {
    var _this7 = this;

    this.props = props;this.parent = parent;
    if (!this.props) this.props = {};

    Object.keys(properties).forEach(function (name) {
      var property = properties[name];
      if (typeof property === 'function') _this7[name] = property.bind(_this7);else _this7[name] = property;
    });

    DataManager.call(this, props, parent);
    return this;
  };

  klass.prototype = DataManager.prototype;
  return klass;
};

if (typeof module !== 'undefined' && module['exports']) {
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
  exports['default'] = DataManager;
} else if (typeof undefined !== 'undefined') {
  undefined['DataManager'] = DataManager;
}