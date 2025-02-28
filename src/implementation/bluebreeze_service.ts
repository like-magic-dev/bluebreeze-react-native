import type { BBCharacteristic } from "./bluebreeze_characteristic";

export interface BBService {
    id: string;
    name?: string;
    characteristics: BBCharacteristic[];
}
