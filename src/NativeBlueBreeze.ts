import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface BBDevice {
    id: string;
    name: string;
    connect: () => void;
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
}

export default TurboModuleRegistry.getEnforcing<Spec>('BlueBreeze');
