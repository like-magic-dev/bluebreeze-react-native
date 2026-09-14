import type { StateValueEmitter } from "react-native-value-emitter"
import type { BBDeviceConnectionStatus } from "./bluebreeze_connection_status"
import type { BBService } from "./bluebreeze_service"
import {
    deviceConnect,
    deviceConnectionStatus,
    deviceDisconnect,
    deviceDiscoverServices,
    deviceMTU,
    deviceRequestMTU,
    deviceServices,
} from "./native_bridge"

/**
 * A Bluetooth Low Energy peripheral, either seen while scanning or already connected from a
 * prior session. Obtained via `BlueBreeze.devices` -- never constructed directly.
 *
 * A `BBDevice` stays valid for the app's lifetime once created: it isn't recreated across a
 * connect/disconnect cycle, so its {@link connectionStatus}, {@link mtu}, and object identity
 * all stay stable. Its {@link services} list, however, is rebuilt from scratch on every
 * {@link discoverServices} call -- including one after a reconnect -- so a {@link BBService} or
 * its {@link BBCharacteristic}s should not be held onto across a disconnect/reconnect; re-read
 * `services` instead.
 */
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

    /** The device's unique identifier. */
    id: string

    /** The device's advertised name, if any. */
    name?: string

    /** The device's services discovered so far. Empty until {@link discoverServices} has been called and completed. */
    services: StateValueEmitter<BBService[]>

    /** Current connection status of the device. */
    connectionStatus: StateValueEmitter<BBDeviceConnectionStatus>

    /**
     * The negotiated ATT MTU in bytes. Stays at the platform default until {@link requestMTU}
     * has been called and resolved.
     */
    mtu: StateValueEmitter<number>

    /**
     * Connects the device.
     * @throws if the connection attempt fails or times out.
     */
    connect: () => Promise<void>

    /**
     * Disconnects the device.
     * @throws if the disconnect attempt fails or times out.
     */
    disconnect: () => Promise<void>

    /**
     * Discovers all of the device's services and their characteristics, populating
     * {@link services}. Requires an active connection.
     * @throws if discovery fails or times out.
     */
    discoverServices: () => Promise<void>

    /**
     * Requests a larger MTU, updating {@link mtu} with whatever size the device actually 
     * negotiates. Requires an active connection.
     *
     * @param mtu The desired MTU size in bytes.
     * @returns The negotiated MTU size.
     * @throws if the request fails or times out.
     */
    requestMTU: (mtu: number) => Promise<number>
}
