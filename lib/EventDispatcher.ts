import { EventEmitter } from 'events';


export interface EventEmitters {
  [index: string]: EventEmitter
};

export class EventDispatcher {
  static eventEmitters: EventEmitters;
  static getInstance(name: string = 'default') {
    if (!this.eventEmitters) {
      this.eventEmitters = {};
    };
    if (!this.eventEmitters[name]) {
      this.eventEmitters[name] = new EventEmitter();
    };
    return this.eventEmitters[name];
  };
};
