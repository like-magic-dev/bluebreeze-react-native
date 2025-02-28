import type { BBService } from "./bluebreeze_service";
import type { StateEventEmitter } from "./state_event_emitter";

export interface BBDevice {
    id: string;
    name?: string;

    // Services
    services: () => BBService[];
    readonly servicesEmitter: StateEventEmitter<BBService[]>;

    // Connection status
    connectionStatus: () => string;
    readonly connectionStatusEmitter: StateEventEmitter<string>;

    // MTU
    mtu: () => number;
    readonly mtuEmitter: StateEventEmitter<number>;

    // Operations
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    discoverServices: () => Promise<void>;
    requestMTU: (mtu: number) => Promise<number>;
}
