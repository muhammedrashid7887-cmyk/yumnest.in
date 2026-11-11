import { EventEmitter } from 'events';

class OrderEventEmitter extends EventEmitter {
  emitOrderUpdate(order: unknown): boolean {
    return this.emit('orderUpdate', order);
  }
}

export const orderEvents = new OrderEventEmitter();
orderEvents.setMaxListeners(500);
