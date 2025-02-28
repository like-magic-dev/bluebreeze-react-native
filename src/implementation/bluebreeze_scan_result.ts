
export interface BBScanResult {
    id: string;
    name?: string;
    rssi: number;
    isConnectable: boolean;
    advertisedServices: string[];
    manufacturerId?: number;
    manufacturerName?: string;
    manufacturerData?: number[];
}
