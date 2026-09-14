import type { BBDevice } from "./bluebreeze_device"

/**
 * A single BLE advertisement seen while scanning. 
 */
export class BBScanResult {
    constructor(
        device: BBDevice,
        name: string | undefined,
        rssi: number,
        connectable: boolean,
        advertisedServices: string[],
        manufacturerId?: number,
        manufacturerName?: string,
        manufacturerData?: number[]
    ) {
        this.device = device
        this.name = name
        this.rssi = rssi
        this.connectable = connectable
        this.advertisedServices = advertisedServices
        this.manufacturerId = manufacturerId
        this.manufacturerName = manufacturerName
        this.manufacturerData = manufacturerData
    }

    /** The device that sent this advertisement. */
    device: BBDevice

    /** The advertised local name, if any. Falls back to {@link device}'s name. */
    name?: string

    /** Received signal strength, in dBm. */
    rssi: number

    /** Whether this advertisement indicates the device currently accepts connections. */
    connectable: boolean

    /** Service UUIDs included in this advertisement. */
    advertisedServices: string[]

    /** The Bluetooth SIG-assigned company identifier for manufacturer-specific data, if present. */
    manufacturerId?: number

    /** A human-readable name for {@link manufacturerId}, if recognized. */
    manufacturerName?: string

    /** Raw manufacturer-specific advertisement data, if present. */
    manufacturerData?: number[]
}
