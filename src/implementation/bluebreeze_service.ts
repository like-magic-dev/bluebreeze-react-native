import type { BBCharacteristic } from "./bluebreeze_characteristic"

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

    id: string
    name?: string
    characteristics: BBCharacteristic[]
}
