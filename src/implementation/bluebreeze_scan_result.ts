import type { BBDevice } from "./bluebreeze_device"

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

    device: BBDevice
    name?: string
    rssi: number
    connectable: boolean
    advertisedServices: string[]
    manufacturerId?: number
    manufacturerName?: string
    manufacturerData?: number[]
}
