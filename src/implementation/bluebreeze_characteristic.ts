import { deviceCharacteristicData, deviceCharacteristicNotifyEnabled, deviceCharacteristicRead, deviceCharacteristicSubscribe, deviceCharacteristicUnsubscribe, deviceCharacteristicWrite } from "react-native-bluebreeze"
import type { StateEventEmitter } from "./emitters"

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

    id: string
    name?: string
    properties: string[]

    // Data
    data: StateEventEmitter<number[]>

    // Notifying
    notifyEnabled: StateEventEmitter<boolean>

    // Operations
    read: () => Promise<number[]>
    write: (data: number[], withResponse: boolean) => Promise<void>
    subscribe: () => Promise<void>
    unsubscribe: () => Promise<void>
}
