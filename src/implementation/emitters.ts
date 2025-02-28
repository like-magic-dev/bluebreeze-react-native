import _EventEmitter, { type EmitterSubscription } from "react-native/Libraries/vendor/emitter/EventEmitter"

export class EventEmitter<T> extends _EventEmitter {
    constructor() {
        super()
    }

    add(v: T) {
        this.emit('value', v)
    }

    onValue: (handler: (v: T) => void) => EmitterSubscription = (handler) => {
        return this.addListener('value', handler)
    }
}
export class StateEventEmitter<T> extends EventEmitter<T> {
    constructor(initialValue: T | undefined = undefined) {
        super()
        this.value = initialValue
    }

    add(v: T) {
        this.value = v
        super.add(v)
    }

    value: T | undefined
}