import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface BBCharacteristic {
    id: string;
    name: string;
}

export interface BBService {
    id: string;
    name: string;
    characteristics: BBCharacteristic[];
}

export interface BBDeviceConnectionStatusEvent {
    id: string;
    value: string;
}

export interface BBDeviceServicesEvent {
    id: string;
    value: BBService[];
}

export interface BBDevice {
    id: string;
    name: string;
    rssi: number;

    // Connection status
    connectionStatus(): string;
    readonly connectionStatusEmitter: EventEmitter<string>;

    // Services
    services(): BBService[];
    readonly servicesEmitter: EventEmitter<BBService[]>;

    // Operations
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    discoverServices: () => Promise<void>;
    requestMTU: (mtu: number) => Promise<number>;
}

export interface Spec extends TurboModule {
    // Authorization
    authorizationStatus(): string;
    readonly authorizationStatusEmitter: EventEmitter<string>;
    authorizationRequest(): void;

    // State
    state(): string;
    readonly stateEmitter: EventEmitter<string>;

    // Scanning
    scanningEnabled(): boolean;
    readonly scanningEnabledEmitter: EventEmitter<boolean>;
    scanningStart(): void;
    scanningStop(): void;

    // Devices
    devices(): BBDevice[];
    readonly devicesEmitter: EventEmitter<BBDevice[]>;

    // Device connection status
    deviceConnectionStatus(id: string): string;
    readonly deviceConnectionStatusEmitter: EventEmitter<BBDeviceConnectionStatusEvent>;

    // Device services
    deviceServices(id: string): BBService[];
    readonly deviceServicesEmitter: EventEmitter<BBDeviceServicesEvent>;

    // Device operation
    deviceConnect(id: string): Promise<void>;
    deviceDisconnect(id: string): Promise<void>;
    deviceDiscoverServices(id: string): Promise<void>;
    deviceRequestMTU(id: string, mtu: number): Promise<number>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BlueBreeze');
