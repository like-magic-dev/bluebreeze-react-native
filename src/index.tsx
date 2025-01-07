import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';
import BlueBreeze, {type BBDevice, type BBService} from './NativeBlueBreeze';

// Authorization to use BLE

export const authorizationRequest = BlueBreeze.authorizationRequest;

export const authorizationStatus = BlueBreeze.authorizationStatus;

export const authorizationStatusEmitter = BlueBreeze.authorizationStatusEmitter;

// State

export const state = BlueBreeze.state;

export const stateEmitter = BlueBreeze.stateEmitter;

// Scanning

export const scanningEnabled = BlueBreeze.scanningEnabled;

export const scanningEnabledEmitter = BlueBreeze.scanningEnabledEmitter;

export const scanningStart = BlueBreeze.scanningStart;

export const scanningStop = BlueBreeze.scanningStop;

// Devices

const deviceAddMethods = (device: BBDevice): BBDevice => {
    return {
        ...device,
        connectionStatus: () => BlueBreeze.deviceConnectionStatus(device.id),
        connectionStatusEmitter: (handler: (arg: string) => void | Promise<void>) => {
            return BlueBreeze.deviceConnectionStatusEmitter((value) => {
                if ((value["id"] === device.id) && (value["value"] != undefined)) {
                    handler(value["value"]);
                }
            });
        },
        services: () => BlueBreeze.deviceServices(device.id),
        servicesEmitter: (handler: (arg: BBService[]) => void | Promise<void>) => {
            return BlueBreeze.deviceServicesEmitter((value) => {
                if ((value["id"] === device.id) && (value["value"] != undefined)) {
                    handler(value["value"]);
                }
            });
        },
        connect: () => BlueBreeze.deviceConnect(device.id),
        disconnect: () => BlueBreeze.deviceDisconnect(device.id),
        discoverServices: () => BlueBreeze.deviceDiscoverServices(device.id),
        requestMTU: (mtu: number) => BlueBreeze.deviceRequestMTU(device.id, mtu),
    };
}

export const devices = (): BBDevice[] => {
    return BlueBreeze.devices().map((device) => deviceAddMethods(device));
}

export const devicesEmitter: EventEmitter<BBDevice[]> = (handler: (arg: BBDevice[]) => void | Promise<void>) => {
    handler(devices());
    return BlueBreeze.devicesEmitter((devices) => {
        handler(devices.map((device) => deviceAddMethods(device)));
    });
}