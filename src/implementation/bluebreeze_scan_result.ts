
export class BBScanResult {
    constructor(
        id: string,
        name: string | undefined,
        rssi: number,
        connectable: boolean,
        advertisedServices: string[],
        manufacturerId?: number,
        manufacturerName?: string,
        manufacturerData?: number[]
    ) {
        this.id = id
        this.name = name
        this.rssi = rssi
        this.connectable = connectable
        this.advertisedServices = advertisedServices
        this.manufacturerId = manufacturerId
        this.manufacturerName = manufacturerName
        this.manufacturerData = manufacturerData
    }

    id: string
    name?: string
    rssi: number
    connectable: boolean
    advertisedServices: string[]
    manufacturerId?: number
    manufacturerName?: string
    manufacturerData?: number[]
}
