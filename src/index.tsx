import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes';
import BlueBreeze, {type BBCharacteristic, type BBDevice, type BBService} from './NativeBlueBreeze';

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

const characteristicAddMethods = (device: BBDevice, service: BBService, characteristic: BBCharacteristic): BBCharacteristic => {
    return {
        ...characteristic,
        data: () => BlueBreeze.deviceCharacteristicData(device.id, service.id, characteristic.id),
        dataEmitter: (handler: (arg: number[]) => void | Promise<void>) => {
            return BlueBreeze.deviceCharacteristicDataEmitter((value) => {
                if ((value["id"] === device.id) && (value["serviceId"] === service.id) && (value["characteristicId"] === characteristic.id) && (value["value"] != undefined)) {
                    handler(value["value"]);
                }
            });
        },
        notifyEnabled: () => BlueBreeze.deviceCharacteristicNotifyEnabled(device.id, service.id, characteristic.id),
        notifyEnabledEmitter: (handler: (arg: boolean) => void | Promise<void>) => {
            return BlueBreeze.deviceCharacteristicNotifyEnabledEmitter((value) => {
                if ((value["id"] === device.id) && (value["serviceId"] === service.id) && (value["characteristicId"] === characteristic.id) && (value["value"] != undefined)) {
                    handler(value["value"]);
                }
            });
        },
        read: () => BlueBreeze.deviceCharacteristicRead(device.id, service.id, characteristic.id),
        write: (data: number[], withResponse: boolean) => BlueBreeze.deviceCharacteristicWrite(device.id, service.id, characteristic.id, data, withResponse),
        subscribe: () => BlueBreeze.deviceCharacteristicSubscribe(device.id, service.id, characteristic.id),
        unsubscribe: () => BlueBreeze.deviceCharacteristicUnsubscribe(device.id, service.id, characteristic.id),
    };
}

const serviceAddMethods = (device: BBDevice, service: BBService): BBService => {
    return {
        ...service,
        characteristics: service.characteristics.map((characteristic) => characteristicAddMethods(device, service, characteristic)),
    };
}

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
        services: () => BlueBreeze.deviceServices(device.id).map((service) => serviceAddMethods(device, service)),
        servicesEmitter: (handler: (arg: BBService[]) => void | Promise<void>) => {
            return BlueBreeze.deviceServicesEmitter((value) => {
                if ((value["id"] === device.id) && (value["value"] != undefined)) {
                    const services = value["value"];
                    handler(services.map((service) => serviceAddMethods(device, service)));
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