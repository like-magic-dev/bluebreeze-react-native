import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';
import BlueBreeze, {type BBDevice} from './NativeBlueBreeze';

// Authorization to use BLE

export const authorizationRequest = (): void => {
    BlueBreeze.authorizationRequest();
}

export const authorizationStatus = (): string => {
    return BlueBreeze.authorizationStatus();
}

export const authorizationStatusEmitter: EventEmitter<string> = (handler: (arg: string) => void | Promise<void>) => {
    handler(authorizationStatus());
    return BlueBreeze.authorizationStatusEmitter((status) => {
        handler(status);
    });
}

// State

export const state = (): string => {
    return BlueBreeze.state();
}

export const stateEmitter: EventEmitter<string> = (handler: (arg: string) => void | Promise<void>) => {
    handler(state());
    return BlueBreeze.stateEmitter((value) => handler(value));
}

// Scanning

export const scanningEnabled = (): boolean => {
    return BlueBreeze.scanningEnabled();
}

export const scanningEnabledEmitter: EventEmitter<boolean> = (handler: (arg: boolean) => void | Promise<void>) => {
    handler(scanningEnabled());
    return BlueBreeze.scanningEnabledEmitter((value) => handler(value));
}

export const scanningStart = (): void => {
    BlueBreeze.scanningStart();
}

export const scanningStop = (): void => {
    BlueBreeze.scanningStop();
}

// Devices

const deviceFix = (device: BBDevice): BBDevice => {
    return {
        ...device,
        connect: () => {
            console.log('Connecting to ' + device.name);
        },
    };
}

export const devices = (): BBDevice[] => {
    return BlueBreeze.devices().map((device) => deviceFix(device));
}

export const devicesEmitter: EventEmitter<BBDevice[]> = (handler: (arg: BBDevice[]) => void | Promise<void>) => {
    handler(devices());
    return BlueBreeze.devicesEmitter((devices) => {
        handler(devices.map((device) => deviceFix(device)));
    });
}