import type { TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';
import type {EventEmitter} from 'react-native/Libraries/Types/CodegenTypes';

export interface Spec extends TurboModule {
    authorizationStatus(): string;
    readonly authorizationStatusEmitter: EventEmitter<string>
    authorizationRequest(): void;
    scanningEnabled(): boolean;
    readonly scanningEnabledEmitter: EventEmitter<boolean>
    scanningStart(): void;
    scanningStop(): void;
}

export default TurboModuleRegistry.getEnforcing<Spec>('BlueBreeze');
