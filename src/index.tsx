import { BBCharacteristic } from './implementation/bluebreeze_characteristic'
import { BBDevice } from './implementation/bluebreeze_device'
import { BBScanResult } from './implementation/bluebreeze_scan_result'
import { BBService } from './implementation/bluebreeze_service'
import { EventEmitter, StateEventEmitter } from './implementation/emitters'
import NativeBlueBreeze, { type SpecDevice, type SpecDeviceCharacteristic, type SpecDeviceService, type SpecScanResult } from './NativeBlueBreeze'

// State

export const state = new StateEventEmitter<string>(NativeBlueBreeze.state())

NativeBlueBreeze.stateEmitter((value) => {
    state.add(value)
})

// Authorization to use BLE

export const authorizationRequest = NativeBlueBreeze.authorizationRequest

export const authorizationStatus = new StateEventEmitter<string>(NativeBlueBreeze.authorizationStatus())

NativeBlueBreeze.authorizationStatusEmitter((value) => {
    authorizationStatus.add(value)
})

// Scanning

export const scanEnabled = new StateEventEmitter<boolean>(NativeBlueBreeze.scanEnabled())

NativeBlueBreeze.scanEnabledEmitter((value) => {
    scanEnabled.add(value)
})

export const scanResults = new EventEmitter<BBScanResult>()

NativeBlueBreeze.scanResultEmitter((value) => {
    scanResults.add(convertScanResult(value))
})

export const scanStart = NativeBlueBreeze.scanStart

export const scanStop = NativeBlueBreeze.scanStop

// Device

export const devices = new StateEventEmitter<BBDevice[]>(
    NativeBlueBreeze.devices().map((d) => convertDevice(d))
)

NativeBlueBreeze.devicesEmitter((value) => {
    devices.add(value.map((d) => convertDevice(d)))
})

// Device services

const _deviceServices = new Map<string, StateEventEmitter<BBService[]>>()

export const deviceServices = (id: string): StateEventEmitter<BBService[]> => {
    return mapGetOrSet(
        _deviceServices,
        id,
        () => new StateEventEmitter<BBService[]>(
            NativeBlueBreeze.deviceServices(id).map(
                (s) => convertDeviceService(id, s)
            )
        )
    )
}

NativeBlueBreeze.deviceServicesEmitter((value) => {
    deviceServices(value.id).add(
        value.value.map((s) => convertDeviceService(value.id, s))
    )
})

// Device connection status

const _deviceConnectionStatus = new Map<string, StateEventEmitter<string>>()

export const deviceConnectionStatus = (id: string): StateEventEmitter<string> => {
    return mapGetOrSet(
        _deviceConnectionStatus,
        id,
        () => new StateEventEmitter<string>(
            NativeBlueBreeze.deviceConnectionStatus(id)
        )
    )
}

NativeBlueBreeze.deviceConnectionStatusEmitter((value) => {
    deviceConnectionStatus(value.id).add(value.value)
})

// Device MTU

const _deviceMTU = new Map<string, StateEventEmitter<number>>()

export const deviceMTU = (id: string): StateEventEmitter<number> => {
    return mapGetOrSet(
        _deviceMTU,
        id,
        () => new StateEventEmitter<number>(
            NativeBlueBreeze.deviceMTU(id)
        )
    )
}

NativeBlueBreeze.deviceMTUEmitter((value) => {
    deviceMTU(value.id).add(value.value)
})

// Device operation

export const deviceConnect = NativeBlueBreeze.deviceConnect

export const deviceDisconnect = NativeBlueBreeze.deviceDisconnect

export const deviceDiscoverServices = NativeBlueBreeze.deviceDiscoverServices

export const deviceRequestMTU = NativeBlueBreeze.deviceRequestMTU

// Device characteristic notify enabled

const _deviceCharacteristicNotifyEnabled = new Map<string, Map<string, Map<string, StateEventEmitter<boolean>>>>()

export const deviceCharacteristicNotifyEnabled = (
    id: string,
    serviceId: string,
    characteristicId: string
): StateEventEmitter<boolean> => {
    const deviceMap = mapGetOrSet(
        _deviceCharacteristicNotifyEnabled,
        id,
        () => new Map<string, Map<string, StateEventEmitter<boolean>>>()
    )

    const serviceMap = mapGetOrSet(
        deviceMap,
        serviceId,
        () => new Map<string, StateEventEmitter<boolean>>()
    )

    return mapGetOrSet(
        serviceMap,
        characteristicId,
        () => new StateEventEmitter<boolean>(
            NativeBlueBreeze.deviceCharacteristicNotifyEnabled(id, serviceId, characteristicId)
        )
    )
}

NativeBlueBreeze.deviceCharacteristicNotifyEnabledEmitter((value) => {
    deviceCharacteristicNotifyEnabled(value.id, value.serviceId, value.characteristicId).add(value.value)
})

// Device characteristic data

const _deviceCharacteristicData = new Map<string, Map<string, Map<string, StateEventEmitter<number[]>>>>()

export const deviceCharacteristicData = (
    id: string,
    serviceId: string,
    characteristicId: string
): StateEventEmitter<number[]> => {
    const deviceMap = mapGetOrSet(
        _deviceCharacteristicData,
        id,
        () => new Map<string, Map<string, StateEventEmitter<number[]>>>()
    )

    const serviceMap = mapGetOrSet(
        deviceMap,
        serviceId,
        () => new Map<string, StateEventEmitter<number[]>>()
    )

    return mapGetOrSet(
        serviceMap,
        characteristicId,
        () => new StateEventEmitter<number[]>(
            NativeBlueBreeze.deviceCharacteristicData(id, serviceId, characteristicId)
        )
    )
}

NativeBlueBreeze.deviceCharacteristicDataEmitter((value) => {
    deviceCharacteristicData(value.id, value.serviceId, value.characteristicId).add(value.value)
})

// Device characteristic operations

export const deviceCharacteristicRead = NativeBlueBreeze.deviceCharacteristicRead

export const deviceCharacteristicWrite = NativeBlueBreeze.deviceCharacteristicWrite

export const deviceCharacteristicSubscribe = NativeBlueBreeze.deviceCharacteristicSubscribe

export const deviceCharacteristicUnsubscribe = NativeBlueBreeze.deviceCharacteristicUnsubscribe

// Map helper

function mapGetOrSet<T>(map: Map<string, T>, key: string, defaultValue: () => T): T {
    if (map.get(key) == undefined) {
        map.set(key, defaultValue())
    }

    return map.get(key)!
}

// Object decoders

const convertDevice = (device: SpecDevice): BBDevice => {
    return new BBDevice(
        device.id,
        device.name
    )
}

const convertScanResult = (scanResult: SpecScanResult): BBScanResult => {
    return new BBScanResult(
        scanResult.id,
        scanResult.name,
        scanResult.rssi,
        scanResult.connectable,
        scanResult.advertisedServices,
        scanResult.manufacturerId,
        scanResult.manufacturerName,
        scanResult.manufacturerData,
    )
}

const convertDeviceService = (
    deviceId: string,
    service: SpecDeviceService
): BBService => {
    return new BBService(
        service.id,
        service.name,
        service.characteristics.map(
            (c) => convertDeviceCharacteristic(deviceId, service.id, c)
        )
    )
}

const convertDeviceCharacteristic = (
    deviceId: string,
    serviceId: string,
    characteristic: SpecDeviceCharacteristic
): BBCharacteristic => {
    return new BBCharacteristic(
        deviceId,
        serviceId,
        characteristic.id,
        characteristic.name,
        characteristic.properties,
    )
}