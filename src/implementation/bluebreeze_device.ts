import BlueBreeze from "react-native-bluebreeze"
import type { BBService } from "./bluebreeze_service"
import { StateEventEmitter } from "./emitters"

export class BBDevice {
    constructor(
        id: string,
        name?: string,
    ) {
        this.id = id
        this.name = name

        this.services = BlueBreeze.deviceServices(id)
        this.connectionStatus = BlueBreeze.deviceConnectionStatus(id)
        this.mtu = BlueBreeze.deviceMTU(id)

        this.connect = () => BlueBreeze.deviceConnect(id)
        this.disconnect = () => BlueBreeze.deviceDisconnect(id)
        this.discoverServices = () => BlueBreeze.deviceDiscoverServices(id)
        this.requestMTU = (mtu: number) => BlueBreeze.deviceRequestMTU(id, mtu)
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
