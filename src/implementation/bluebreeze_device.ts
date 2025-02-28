import { deviceConnect, deviceConnectionStatus, deviceDisconnect, deviceDiscoverServices, deviceMTU, deviceRequestMTU, deviceServices } from "react-native-bluebreeze"
import type { BBService } from "./bluebreeze_service"
import { StateEventEmitter } from "./emitters"

export class BBDevice {
    constructor(
        id: string,
        name?: string,
    ) {
        this.id = id
        this.name = name

        this.services = deviceServices(id)
        this.connectionStatus = deviceConnectionStatus(id)
        this.mtu = deviceMTU(id)

        this.connect = () => deviceConnect(id)
        this.disconnect = () => deviceDisconnect(id)
        this.discoverServices = () => deviceDiscoverServices(id)
        this.requestMTU = (mtu: number) => deviceRequestMTU(id, mtu)
    }

    id: string
    name?: string

    // Services
    services: StateEventEmitter<BBService[]>

    // Connection status
    connectionStatus: StateEventEmitter<string>

    // MTU
    mtu: StateEventEmitter<number>

    // Operations
    connect: () => Promise<void>
    disconnect: () => Promise<void>
    discoverServices: () => Promise<void>
    requestMTU: (mtu: number) => Promise<number>
}
