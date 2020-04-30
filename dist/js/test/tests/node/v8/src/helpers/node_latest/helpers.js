"use strict";

var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard");

exports.__esModule = true;
exports.getObjectOptimizationInfo = getObjectOptimizationInfo;
exports.v8 = exports.shouldNotOptimizationStatus = exports.shouldOptimizationStatus = exports.shouldObjectOptimizationInfo = exports.shouldArrayOptimizationInfo = void 0;

var _contracts = require("../contracts");

var v8 = _interopRequireWildcard(require("./runtime"));

exports.v8 = v8;

function getObjectOptimizationInfo(obj) {
  var result = {
    CountElementsTypes: 0,
    HasFastPackedElements: v8.HasFastPackedElements(obj),
    HasDictionaryElements: v8.HasDictionaryElements(obj),
    HasDoubleElements: v8.HasDoubleElements(obj),
    // HasElementsInALargeObjectSpace: v8.HasElementsInALargeObjectSpace(obj),
    HasFastElements: v8.HasFastElements(obj),
    HasFastProperties: v8.HasFastProperties(obj),
    HasFixedBigInt64Elements: v8.HasFixedBigInt64Elements(obj),
    HasFixedBigUint64Elements: v8.HasFixedBigUint64Elements(obj),
    HasFixedFloat32Elements: v8.HasFixedFloat32Elements(obj),
    HasFixedFloat64Elements: v8.HasFixedFloat64Elements(obj),
    HasFixedInt16Elements: v8.HasFixedInt16Elements(obj),
    HasFixedInt32Elements: v8.HasFixedInt32Elements(obj),
    HasFixedInt8Elements: v8.HasFixedInt8Elements(obj),
    HasFixedUint16Elements: v8.HasFixedUint16Elements(obj),
    HasFixedUint32Elements: v8.HasFixedUint32Elements(obj),
    HasFixedUint8ClampedElements: v8.HasFixedUint8ClampedElements(obj),
    HasFixedUint8Elements: v8.HasFixedUint8Elements(obj),
    HasHoleyElements: v8.HasHoleyElements(obj),
    HasObjectElements: v8.HasObjectElements(obj),
    HasPackedElements: v8.HasPackedElements(obj),
    HasSloppyArgumentsElements: v8.HasSloppyArgumentsElements(obj),
    HasSmiElements: v8.HasSmiElements(obj),
    HasSmiOrObjectElements: v8.HasSmiOrObjectElements(obj),
    HeapObjectVerify: v8.HeapObjectVerify(obj)
  };

  if (result.HasFixedFloat32Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedBigUint64Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedBigInt64Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasDoubleElements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedInt32Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedFloat64Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedInt8Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedInt16Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedUint8ClampedElements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedUint8Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedUint16Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasFixedUint32Elements) {
    result.CountElementsTypes++;
  }

  if (result.HasObjectElements) {
    result.CountElementsTypes++;
  }

  if (result.HasSmiElements) {
    result.CountElementsTypes++;
  }

  return result;
}

var shouldArrayOptimizationInfo = {
  CountElementsTypes: 1,
  HasFastPackedElements: true,
  HasDictionaryElements: false,
  HasFastElements: true
};
exports.shouldArrayOptimizationInfo = shouldArrayOptimizationInfo;
var shouldObjectOptimizationInfo = {
  CountElementsTypes: 1,
  HasDictionaryElements: false,
  HasFastElements: true,
  HasHoleyElements: true,
  HasObjectElements: true,
  HasSmiOrObjectElements: true
};
exports.shouldObjectOptimizationInfo = shouldObjectOptimizationInfo;
var shouldOptimizationStatus = _contracts.OptimizationStatus.IsFunction | _contracts.OptimizationStatus.Optimized | _contracts.OptimizationStatus.TurboFanned;
exports.shouldOptimizationStatus = shouldOptimizationStatus;
var shouldNotOptimizationStatus = _contracts.OptimizationStatus.NeverOptimize | _contracts.OptimizationStatus.AlwaysOptimize | _contracts.OptimizationStatus.Interpreted | _contracts.OptimizationStatus.MaybeDeopted | _contracts.OptimizationStatus.IsExecuting | _contracts.OptimizationStatus.LiteMode | _contracts.OptimizationStatus.MarkedForDeoptimization;
exports.shouldNotOptimizationStatus = shouldNotOptimizationStatus;