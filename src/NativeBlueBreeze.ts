import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

/// Data structures

export interface BBCharacteristic {
    id: string;
    name?: string;
    properties: string[];

    // Data
    data(): number[];
    readonly dataEmitter: EventEmitter<number[]>;

    // Notifying
    notifyEnabled(): boolean;
    readonly notifyEnabledEmitter: EventEmitter<boolean>;

    // Operations
    read: () => Promise<number[]>;
    write: (data: number[], withResponse: boolean) => Promise<void>;
    subscribe: () => Promise<void>;
    unsubscribe: () => Promise<void>;
}

export interface BBService {
    device: BBDevice;
    id: string;
    name?: string;
    characteristics: BBCharacteristic[];
}

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

export interface BBDevice {
    id: string;
    name?: string;

    // Services
    services: () => BBService[];
    readonly servicesEmitter: EventEmitter<BBService[]>;

    // Connection status
    connectionStatus: () => string;
    readonly connectionStatusEmitter: EventEmitter<string>;

    // MTU
    mtu: () => number;
    readonly mtuEmitter: EventEmitter<number>;

    // Operations
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    discoverServices: () => Promise<void>;
    requestMTU: (mtu: number) => Promise<number>;
}

/// Events

export interface BBBooleanEvent {
    value: boolean;
}

export interface BBStringEvent {
    value: string;
}

export interface BBScanResultEvent {
    value: BBScanResult;
}

export interface BBDevicesEvent {
    value: BBDevice[];
}

export interface BBDeviceServicesEvent {
    id: string;
    value: BBService[];
}

export interface BBDeviceConnectionStatusEvent {
    id: string;
    value: string;
}

export interface BBDeviceMTUEvent {
    id: string;
    value: number;
}

export interface BBDeviceCharacteristicDataEvent {
    id: string;
    serviceId: string;
    characteristicId: string;
    value: number[];
}

export interface BBDeviceCharacteristicNotifyEnabledEvent {
    id: string;
    serviceId: string;
    characteristicId: string;
    value: boolean;
}

/// Module specifications

export interface Spec extends TurboModule {
    // State
    state(): string;
    readonly stateEmitter: EventEmitter<string>;

    // Authorization
    authorizationStatus(): string;
    readonly authorizationStatusEmitter: EventEmitter<string>;
    authorizationRequest(): void;
    authorizationOpenSettings(): void;

    // Scanning
    scanEnabled(): boolean;
    readonly scanEnabledEmitter: EventEmitter<boolean>;
    readonly scanResultsEmitter: EventEmitter<BBScanResult[]>;
    scanStart(): void;
    scanStop(): void;

    // Devices
    devices(): BBDevice[];
    readonly devicesEmitter: EventEmitter<BBDevice[]>;

    // Device services
    deviceServices(id: string): BBService[];
    readonly deviceServicesEmitter: EventEmitter<BBDeviceServicesEvent>;

    // Device connection status
    deviceConnectionStatus(id: string): string;
    readonly deviceConnectionStatusEmitter: EventEmitter<BBDeviceConnectionStatusEvent>;

    // Device MTU
    deviceMTU(id: string): number;
    readonly deviceMTUEmitter: EventEmitter<BBDeviceMTUEvent>;

    // Device operations
    deviceConnect(id: string): Promise<void>;
    deviceDisconnect(id: string): Promise<void>;
    deviceDiscoverServices(id: string): Promise<void>;
    deviceRequestMTU(id: string, mtu: number): Promise<number>;

    // Device characteristic data
    deviceCharacteristicData(id: string, serviceId: string, characteristicId: string): number[];
    readonly deviceCharacteristicDataEmitter: EventEmitter<BBDeviceCharacteristicDataEvent>;

    // Device characteristic notify enabled
    deviceCharacteristicNotifyEnabled(id: string, serviceId: string, characteristicId: string): boolean;
    readonly deviceCharacteristicNotifyEnabledEmitter: EventEmitter<BBDeviceCharacteristicNotifyEnabledEvent>;

    // Device characteristic operations
    deviceCharacteristicRead(id: string, serviceId: string, characteristicId: string): Promise<number[]>;
    deviceCharacteristicWrite(id: string, serviceId: string, characteristicId: string, data: number[], withResponse: boolean): Promise<void>;
    deviceCharacteristicSubscribe(id: string, serviceId: string, characteristicId: string): Promise<void>;
    deviceCharacteristicUnsubscribe(id: string, serviceId: string, characteristicId: string): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BlueBreeze');
