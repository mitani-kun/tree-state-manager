"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault");

var _Object$defineProperty = require("@babel/runtime-corejs3/core-js-stable/object/define-property");

_Object$defineProperty(exports, "__esModule", {
  value: true
});

exports.mergeMapWrappers = mergeMapWrappers;
exports.createMergeMapWrapper = createMergeMapWrapper;
exports.mergeMaps = mergeMaps;
exports.MergeMapWrapper = exports.MergeObjectWrapper = void 0;

var _concat = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/concat"));

var _isArray = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/array/is-array"));

var _toStringTag = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/symbol/to-string-tag"));

var _keys = _interopRequireDefault(require("@babel/runtime-corejs3/core-js-stable/instance/keys"));

var _getIterator2 = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/get-iterator"));

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/createClass"));

var _helpers = require("../../helpers/helpers");

/* tslint:disable:no-identical-functions */
function mergeMapWrappers(merge, base, older, newer, preferCloneOlder, preferCloneNewer, options) {
  var changed = false;
  var addItems = [];

  var fill = function fill(olderItem, newerItem) {
    var setItem = _helpers.EMPTY;
    merge(_helpers.EMPTY, olderItem, newerItem, function (o) {
      setItem = o;
    }, preferCloneOlder, preferCloneNewer, options);

    if (setItem === _helpers.EMPTY) {
      throw new Error('setItem === NONE');
    }

    return setItem;
  };

  if (older === newer) {
    // [- n n]
    newer.forEachKeys(function (key) {
      if (!base.has(key)) {
        addItems.push([key, fill(_helpers.EMPTY, newer.get(key))]);
      }
    });
  } else {
    // [- - n]
    newer.forEachKeys(function (key) {
      if (!base.has(key) && !older.has(key)) {
        addItems.push([key, fill(_helpers.EMPTY, newer.get(key))]);
      }
    }); // [- o *]

    older.forEachKeys(function (key) {
      if (!base.has(key)) {
        if (!newer.has(key)) {
          addItems.push([key, fill(older.get(key), _helpers.EMPTY)]);
        } else {
          addItems.push([key, fill(older.get(key), newer.get(key))]);
        }
      }
    });
  }

  var deleteItems = []; // [b * *]

  base.forEachKeys(function (key) {
    changed = merge(base.get(key), older.has(key) ? older.get(key) : _helpers.EMPTY, newer.has(key) ? newer.get(key) : _helpers.EMPTY, function (o) {
      if (o === _helpers.EMPTY) {
        deleteItems.push(key);
      } else {
        base.set(key, o);
      }
    }, preferCloneOlder, preferCloneNewer, options) || changed;
  });
  var len = deleteItems.length;

  if (len > 0) {
    changed = true;

    for (var i = len - 1; i >= 0; i--) {
      base.delete(deleteItems[i]);
    }
  }

  len = addItems.length;

  if (len > 0) {
    changed = true;

    for (var _i = 0; _i < len; _i++) {
      base.set.apply(base, addItems[_i]);
    }
  }

  return changed;
}

var MergeObjectWrapper =
/*#__PURE__*/
function () {
  function MergeObjectWrapper(object, keyAsValue) {
    (0, _classCallCheck2.default)(this, MergeObjectWrapper);
    this._object = object;

    if (keyAsValue) {
      this._keyAsValue = true;
    }
  }

  (0, _createClass2.default)(MergeObjectWrapper, [{
    key: "delete",
    value: function _delete(key) {
      delete this._object[key];
    }
  }, {
    key: "forEachKeys",
    value: function forEachKeys(callbackfn) {
      var _object = this._object;

      for (var _key in _object) {
        if (Object.prototype.hasOwnProperty.call(_object, _key)) {
          callbackfn(_key);
        }
      }
    }
  }, {
    key: "get",
    value: function get(key) {
      return this._keyAsValue ? key : this._object[key];
    }
  }, {
    key: "has",
    value: function has(key) {
      return Object.prototype.hasOwnProperty.call(this._object, key);
    }
  }, {
    key: "set",
    value: function set(key, value) {
      this._object[key] = this._keyAsValue ? true : value;
    }
  }]);
  return MergeObjectWrapper;
}();

exports.MergeObjectWrapper = MergeObjectWrapper;

var MergeMapWrapper =
/*#__PURE__*/
function () {
  function MergeMapWrapper(map) {
    (0, _classCallCheck2.default)(this, MergeMapWrapper);
    this._map = map;
  }

  (0, _createClass2.default)(MergeMapWrapper, [{
    key: "delete",
    value: function _delete(key) {
      this._map.delete(key);
    }
  }, {
    key: "forEachKeys",
    value: function forEachKeys(callbackfn) {
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = (0, _getIterator2.default)((0, _keys.default)(_context = this._map).call(_context)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var _context;

          var _key2 = _step.value;
          callbackfn(_key2);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator.return != null) {
            _iterator.return();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }
    }
  }, {
    key: "get",
    value: function get(key) {
      return this._map.get(key);
    }
  }, {
    key: "has",
    value: function has(key) {
      return this._map.has(key);
    }
  }, {
    key: "set",
    value: function set(key, value) {
      this._map.set(key, value);
    }
  }]);
  return MergeMapWrapper;
}();

exports.MergeMapWrapper = MergeMapWrapper;

function createMergeMapWrapper(target, source, arrayOrIterableToMap) {
  var _context2;

  if (source[_toStringTag.default] === 'Map') {
    return new MergeMapWrapper(source);
  }

  if (arrayOrIterableToMap && ((0, _isArray.default)(source) || (0, _helpers.isIterable)(source))) {
    return createMergeMapWrapper(target, arrayOrIterableToMap(source), null);
  }

  if (source.constructor === Object) {
    return new MergeObjectWrapper(source);
  }

  throw new Error((0, _concat.default)(_context2 = "".concat(target.constructor.name, " cannot be merge with ")).call(_context2, source.constructor.name));
} // 10039 cycles


function mergeMaps(createSourceMapWrapper, merge, base, older, newer, preferCloneOlder, preferCloneNewer, options) {
  var baseWrapper = createSourceMapWrapper(base, base);
  var olderWrapper = older === base ? baseWrapper : createSourceMapWrapper(base, older);
  var newerWrapper = newer === base ? baseWrapper : newer === older ? olderWrapper : createSourceMapWrapper(base, newer);
  return mergeMapWrappers(merge, baseWrapper, olderWrapper, newerWrapper, preferCloneOlder, preferCloneNewer, options);
}