import type { StateValueEmitter } from "react-native-value-emitter"
import {
    deviceCharacteristicData,
    deviceCharacteristicNotifyEnabled,
    deviceCharacteristicRead,
    deviceCharacteristicSubscribe,
    deviceCharacteristicUnsubscribe,
    deviceCharacteristicWrite,
} from "./native_bridge"

/**
 * A GATT characteristic belonging to a {@link BBService}.
 *
 * Rediscovered (and replaced with a new instance) every time services are discovered.
 * Do not hold onto a `BBCharacteristic` reference across a disconnect/reconnect cycle.
 */
export class BBCharacteristic {
    constructor(
        deviceId: string,
        serviceId: string,
        id: string,
        name: string | undefined,
        properties: string[]
    ) {
        this.id = id
        this.name = name
        this.properties = properties

        this.data = deviceCharacteristicData(deviceId, serviceId, id)
        this.notifyEnabled = deviceCharacteristicNotifyEnabled(deviceId, serviceId, id)

        this.read = () => deviceCharacteristicRead(deviceId, serviceId, id)
        this.write = (data: number[], withResponse: boolean) => deviceCharacteristicWrite(deviceId, serviceId, id, data, withResponse)
        this.subscribe = () => deviceCharacteristicSubscribe(deviceId, serviceId, id)
        this.unsubscribe = () => deviceCharacteristicUnsubscribe(deviceId, serviceId, id)
    }

    /** The characteristic's UUID. */
    id: string

    /** A human-readable name for well-known (Bluetooth SIG assigned-number) characteristics, if recognized. */
    name?: string

    /** The GATT properties this characteristic declares. */
    properties: string[]

    /** The last value read or notified for this characteristic. Empty until first populated. */
    data: StateValueEmitter<number[]>

    /** Whether this app is currently subscribed to notifications for this characteristic. */
    notifyEnabled: StateValueEmitter<boolean>

    /**
     * Reads this characteristic's current value, also updating {@link data}.
     * @throws if the read fails or times out.
     */
    read: () => Promise<number[]>

    /**
     * Writes a value to this characteristic.
     * @param data The bytes to write.
     * @param withResponse Whether to wait for the peripheral's write acknowledgment.
     * @throws if the write fails or times out.
     */
    write: (data: number[], withResponse: boolean) => Promise<void>

    /**
     * Subscribes to notifications.
     * @throws if the subscribe request fails or times out.
     */
    subscribe: () => Promise<void>

    /**
     * Unsubscribes from notifications.
     * @throws if the unsubscribe request fails or times out.
     */
    unsubscribe: () => Promise<void>
}
