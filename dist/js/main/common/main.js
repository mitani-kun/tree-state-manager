"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = main;
exports.default = void 0;

var _helpers = require("./helpers/helpers");

function main(args) {
  console.log(JSON.stringify(args), _helpers.isIterable);
}

var _default = {
  main
};
exports.default = _default;