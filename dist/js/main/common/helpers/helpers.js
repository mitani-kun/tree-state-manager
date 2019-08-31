"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isIterable = isIterable;
exports.isIterator = isIterator;
exports.typeToDebugString = typeToDebugString;
exports.delay = delay;
exports.checkIsFuncOrNull = checkIsFuncOrNull;
exports.toSingleCall = toSingleCall;
exports.createFunction = createFunction;
exports.hideObjectProperty = hideObjectProperty;
exports.VALUE_PROPERTY_DEFAULT = exports.EMPTY = void 0;

function isIterable(value) {
  return value != null && typeof value[Symbol.iterator] === 'function';
}

function isIterator(value) {
  return value != null && typeof value[Symbol.iterator] === 'function' && typeof value.next === 'function';
}

function typeToDebugString(type) {
  return type == null ? type + '' : type && type.name || type.toString();
} // tslint:disable-next-line:no-empty no-shadowed-variable


const EMPTY = function EMPTY() {};

exports.EMPTY = EMPTY;

function delay(timeMilliseconds) {
  return new Promise(resolve => setTimeout(resolve, timeMilliseconds));
}

function checkIsFuncOrNull(func) {
  // PROF: 66 - 0.1%
  if (func != null && typeof func !== 'function') {
    throw new Error(`Value is not a function or null/undefined: ${func}`);
  }

  return func;
}

function toSingleCall(func, throwOnMultipleCall) {
  if (func == null) {
    return func;
  }

  func = checkIsFuncOrNull(func);
  let isCalled = false;
  return (...args) => {
    if (isCalled) {
      if (throwOnMultipleCall) {
        throw new Error(`Multiple call for single call function: ${func}`);
      }

      return;
    }

    isCalled = true;
    return func(...args);
  };
}

const createFunctionCache = {}; // tslint:disable-next-line:ban-types

function createFunction(...args) {
  const id = args[args.length - 1] + '';
  let func = createFunctionCache[id];

  if (!func) {
    createFunctionCache[id] = func = Function(...args);
  }

  return func;
}

function hideObjectProperty(object, propertyName) {
  const descriptor = Object.getOwnPropertyDescriptor(object, propertyName);

  if (descriptor) {
    descriptor.enumerable = false;
    return;
  }

  Object.defineProperty(object, propertyName, {
    configurable: true,
    enumerable: false,
    value: object[propertyName]
  });
}

const VALUE_PROPERTY_DEFAULT = '';
exports.VALUE_PROPERTY_DEFAULT = VALUE_PROPERTY_DEFAULT;