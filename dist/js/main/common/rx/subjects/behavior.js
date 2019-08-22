"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.behavior = behavior;
exports.BehaviorSubject = void 0;

var _subject = require("./subject");

function behavior(base) {
  return class Behavior extends base {
    constructor(value) {
      super();

      if (typeof value !== 'undefined') {
        this.value = value;
      }
    }

    subscribe(subscriber) {
      if (!subscriber) {
        return null;
      }

      let unsubscribe = super.subscribe(subscriber);
      const {
        value
      } = this;

      if (typeof value !== 'undefined') {
        subscriber(value);
      }

      return () => {
        if (!unsubscribe) {
          return;
        }

        try {
          // eslint-disable-next-line no-shadow
          // tslint:disable-next-line:no-shadowed-variable
          const {
            value,
            unsubscribeValue
          } = this;

          if (typeof unsubscribeValue !== 'undefined' && unsubscribeValue !== value) {
            subscriber(unsubscribeValue);
          }
        } finally {
          unsubscribe();
          unsubscribe = null;
        }
      };
    }

    emit(value) {
      this.value = value;
      super.emit(value);
      return this;
    }

  };
}

const BehaviorSubject = behavior(_subject.Subject);
exports.BehaviorSubject = BehaviorSubject;