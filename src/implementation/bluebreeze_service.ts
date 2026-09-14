import type { BBCharacteristic } from "./bluebreeze_characteristic"

/**
 * A GATT service belonging to a {@link BBDevice}.
 */
export class BBService {
    constructor(
        id: string,
        name: string | undefined,
        characteristics: BBCharacteristic[]
    ) {
        this.id = id
        this.name = name
        this.characteristics = characteristics
    }

    /** The service's UUID. */
    id: string

    /** A human-readable name for well-known (Bluetooth SIG assigned-number) services, if recognized. */
    name?: string

    /** This service's characteristics. */
    characteristics: BBCharacteristic[]
}
