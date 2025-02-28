import type { StateEventEmitter } from "./state_event_emitter";

export interface BBCharacteristic {
    id: string;
    name?: string;
    properties: string[];

    // Data
    data(): number[];
    readonly dataEmitter: StateEventEmitter<number[]>;

    // Notifying
    notifyEnabled(): boolean;
    readonly notifyEnabledEmitter: StateEventEmitter<boolean>;

    // Operations
    read: () => Promise<number[]>;
    write: (data: number[], withResponse: boolean) => Promise<void>;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}
