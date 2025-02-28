import EventEmitter, { type EmitterSubscription } from "react-native/Libraries/vendor/emitter/EventEmitter";

export class StateEventEmitter<T> extends EventEmitter {
    constructor() {
        super();
    }

    add(v: T) {
        this.value = v;
        this.emit('value', v);
    }

    value: T | undefined;

    onValue: (handler: (v: T) => void) => EmitterSubscription = (handler) => {
        return this.addListener('value', handler);
    }
}