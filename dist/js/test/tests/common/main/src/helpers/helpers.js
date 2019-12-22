"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

exports.__esModule = true;
exports.createIterableIterator = createIterableIterator;
exports.createIterable = createIterable;
exports.createComplexObject = createComplexObject;
exports.CircularClass = void 0;

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/keys"));

var _reverse = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/reverse"));

var _startsWith = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/starts-with"));

var _setTimeout2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set-timeout"));

var _map = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/map"));

var _map2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/map"));

var _set = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/set"));

var _assign = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/object/assign"));

var _iterator3 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/symbol/iterator"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _isArray3 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _from = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/from"));

var _regenerator = _interopRequireDefault(require("@babel/runtime-corejs3/regenerator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/inherits"));

var _mergers = require("../../../../../../main/common/extensions/merge/mergers");

var _serializers = require("../../../../../../main/common/extensions/serialization/serializers");

var _helpers = require("../../../../../../main/common/helpers/helpers");

var _ArrayMap = require("../../../../../../main/common/lists/ArrayMap");

var _ArraySet = require("../../../../../../main/common/lists/ArraySet");

var _ObjectMap = require("../../../../../../main/common/lists/ObjectMap");

var _ObjectSet = require("../../../../../../main/common/lists/ObjectSet");

var _ObservableMap = require("../../../../../../main/common/lists/ObservableMap");

var _ObservableSet = require("../../../../../../main/common/lists/ObservableSet");

var _SortedList = require("../../../../../../main/common/lists/SortedList");

var _ObservableClass2 = require("../../../../../../main/common/rx/object/ObservableClass");

var _ObservableObjectBuilder = require("../../../../../../main/common/rx/object/ObservableObjectBuilder");

var _Property = require("../../../../../../main/common/rx/object/properties/Property");

var _marked2 =
/*#__PURE__*/
_regenerator.default.mark(createIterableIterator);

var CircularClass =
/*#__PURE__*/
function (_ObservableClass) {
  (0, _inherits2.default)(CircularClass, _ObservableClass);

  function CircularClass(array, value) {
    var _this;

    (0, _classCallCheck2.default)(this, CircularClass);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(CircularClass).call(this));
    _this.array = array;
    _this.value = value;
    return _this;
  } // region IMergeable


  (0, _createClass2.default)(CircularClass, [{
    key: "_canMerge",
    value: function _canMerge(source) {
      if (source.constructor === CircularClass) {
        return null;
      }

      return source.constructor === CircularClass; // || Array.isArray(source)
      // || isIterable(source)
    }
  }, {
    key: "_merge",
    value: function _merge(merge, older, newer, preferCloneOlder, preferCloneNewer, options) {
      var _this2 = this;

      var changed = false;
      changed = merge(this.array, older.array, newer.array, function (o) {
        _this2.array = o;
      }) || changed;
      changed = merge(this.value, older.value, newer.value, function (o) {
        _this2.value = o;
      }) || changed;
      return changed;
    } // endregion
    // region ISerializable

  }, {
    key: "serialize",
    value: function serialize(_serialize) {
      return {
        array: _serialize(this.array),
        value: _serialize(this.value)
      };
    }
  }, {
    key: "deSerialize",
    value:
    /*#__PURE__*/
    _regenerator.default.mark(function deSerialize(_deSerialize, serializedValue) {
      return _regenerator.default.wrap(function deSerialize$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _deSerialize(serializedValue.value);

            case 2:
              this.value = _context.sent;

            case 3:
            case "end":
              return _context.stop();
          }
        }
      }, deSerialize, this);
    }) // endregion

  }]);
  return CircularClass;
}(_ObservableClass2.ObservableClass);

exports.CircularClass = CircularClass;
CircularClass.uuid = 'e729e03fd0f449949f0f97da23c7bab8';
(0, _mergers.registerMergeable)(CircularClass);
(0, _serializers.registerSerializable)(CircularClass, {
  serializer: {
    deSerialize: function (_deSerialize2) {
      var _marked =
      /*#__PURE__*/
      _regenerator.default.mark(deSerialize);

      function deSerialize(_x, _x2, _x3) {
        var _args2 = arguments;
        return _regenerator.default.wrap(function deSerialize$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                return _context2.delegateYield(_deSerialize2.apply(this, _args2), "t0", 1);

              case 1:
                return _context2.abrupt("return", _context2.t0);

              case 2:
              case "end":
                return _context2.stop();
            }
          }
        }, _marked, this);
      }

      deSerialize.toString = function () {
        return _deSerialize2.toString();
      };

      return deSerialize;
    }(
    /*#__PURE__*/
    _regenerator.default.mark(function _callee(deSerialize, serializedValue, valueFactory) {
      var array, value;
      return _regenerator.default.wrap(function _callee$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return deSerialize(serializedValue.array);

            case 2:
              array = _context3.sent;
              value = valueFactory(array);
              _context3.next = 6;
              return value.deSerialize(deSerialize, serializedValue);

            case 6:
              return _context3.abrupt("return", value);

            case 7:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee);
    }))
  }
});
new _ObservableObjectBuilder.ObservableObjectBuilder(CircularClass.prototype).writable('array');

function createIterableIterator(iterable) {
  var array, _iterator, _isArray, _i, _ref, item;

  return _regenerator.default.wrap(function createIterableIterator$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          array = (0, _from.default)(iterable);
          _iterator = array, _isArray = (0, _isArray3.default)(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator2.default)(_iterator);

        case 2:
          if (!_isArray) {
            _context4.next = 8;
            break;
          }

          if (!(_i >= _iterator.length)) {
            _context4.next = 5;
            break;
          }

          return _context4.abrupt("break", 17);

        case 5:
          _ref = _iterator[_i++];
          _context4.next = 12;
          break;

        case 8:
          _i = _iterator.next();

          if (!_i.done) {
            _context4.next = 11;
            break;
          }

          return _context4.abrupt("break", 17);

        case 11:
          _ref = _i.value;

        case 12:
          item = _ref;
          _context4.next = 15;
          return item;

        case 15:
          _context4.next = 2;
          break;

        case 17:
        case "end":
          return _context4.stop();
      }
    }
  }, _marked2);
}

function createIterable(iterable) {
  var _ref2;

  var array = (0, _from.default)(iterable);
  return _ref2 = {}, _ref2[_iterator3.default] = function () {
    return createIterableIterator(array);
  }, _ref2;
}

function createComplexObject(options) {
  if (options === void 0) {
    options = {};
  }

  var array = [];
  var object = {};
  var circularClass = new CircularClass(array);
  circularClass.value = object;
  (0, _assign.default)(object, {
    _undefined: void 0,
    _null: null,
    _false: false,
    _stringEmpty: '',
    _zero: 0,
    true: true,
    string: 'string',
    date: new Date(12345),
    number: 123.45,
    'nan': NaN,
    'infinity': Infinity,
    '-infinity': -Infinity,
    StringEmpty: new String(''),
    String: new String('String'),
    Number: new Number(123),
    NaN: new Number(NaN),
    Infinity: new Number(Infinity),
    '-Infinity': new Number(-Infinity),
    Boolean: new Boolean(true),
    circularClass: options.circular && options.circularClass && circularClass,
    object: options.circular && object,
    array: options.array && array,
    sortedList: options.sortedList && new _SortedList.SortedList(),
    set: options.set && new _set.default(),
    arraySet: options.arraySet && new _ArraySet.ArraySet(),
    objectSet: options.objectSet && new _ObjectSet.ObjectSet(),
    map: (0, _map2.default)(options) && new _map.default(),
    arrayMap: options.arrayMap && new _ArrayMap.ArrayMap(),
    objectMap: options.objectMap && new _ObjectMap.ObjectMap(),
    iterable: options.function && createIterable(array),
    // iterator: options.function && toIterableIterator(array),
    promiseSync: options.function && {
      then: function then(resolve) {
        return resolve(object);
      }
    },
    promiseAsync: options.function && {
      then: function then(resolve) {
        return (0, _setTimeout2.default)(function () {
          return resolve(object);
        }, 0);
      }
    },
    property: new _Property.Property(null, object)
  });
  object.setObservable = options.set && options.observableSet && new _ObservableSet.ObservableSet(object.set);
  object.arraySetObservable = options.arraySet && options.observableSet && new _ObservableSet.ObservableSet(object.arraySet);
  object.objectSetObservable = options.objectSet && options.observableSet && new _ObservableSet.ObservableSet(object.objectSet);
  object.mapObservable = (0, _map2.default)(options) && options.observableMap && new _ObservableMap.ObservableMap((0, _map2.default)(object));
  object.arrayMapObservable = options.arrayMap && options.observableMap && new _ObservableMap.ObservableMap(object.arrayMap);
  object.objectMapObservable = options.objectMap && options.observableMap && new _ObservableMap.ObservableMap(object.objectMap);

  var valueIsCollection = function valueIsCollection(value) {
    return value && ((0, _helpers.isIterable)(value) || value.constructor === Object);
  };

  for (var key in object) {
    if (Object.prototype.hasOwnProperty.call(object, key)) {
      var value = object[key];

      if (!value && !(0, _startsWith.default)(key).call(key, '_')) {
        delete object[key];
        continue;
      }

      if (options.circular || !valueIsCollection(value)) {
        if (object.sortedList) {
          object.sortedList.add(value);
        }

        if (object.set) {
          object.set.add(value);
        }

        if ((0, _map2.default)(object)) {
          (0, _map2.default)(object).set(value, value);
        }

        if (object.array) {
          array.push(value);
        }
      }
    }
  }

  for (var _iterator2 = (0, _reverse.default)(_context5 = (0, _keys.default)(object)).call(_context5), _isArray2 = (0, _isArray3.default)(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator2.default)(_iterator2);;) {
    var _context5;

    var _ref3;

    if (_isArray2) {
      if (_i2 >= _iterator2.length) break;
      _ref3 = _iterator2[_i2++];
    } else {
      _i2 = _iterator2.next();
      if (_i2.done) break;
      _ref3 = _i2.value;
    }

    var _key = _ref3;

    if (Object.prototype.hasOwnProperty.call(object, _key)) {
      var _value = object[_key];

      if (!options.undefined && typeof _value === 'undefined') {
        delete object[_key];
      }

      if (options.circular || !valueIsCollection(_value)) {
        if (object.arraySet && _value && typeof _value === 'object') {
          object.arraySet.add(_value);
        }

        if (object.objectSet) {
          object.objectSet.add(_key);
        }

        if (object.arrayMap && _value && typeof _value === 'object') {
          object.arrayMap.set(_value, _value);
        }

        if (object.objectMap) {
          object.objectMap.set(_key, _value);
        }
      }
    }
  }

  return object;
}