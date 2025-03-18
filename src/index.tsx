import type { BBAuthorization } from './implementation/bluebreeze_authorization'
import { BBCharacteristic } from './implementation/bluebreeze_characteristic'
import { BBDevice } from './implementation/bluebreeze_device'
import { BBScanResult } from './implementation/bluebreeze_scan_result'
import { BBService } from './implementation/bluebreeze_service'
import type { BBState } from './implementation/bluebreeze_state'
import { EventEmitter, StateEventEmitter } from './implementation/emitters'
import NativeBlueBreeze, { type SpecDevice, type SpecDeviceCharacteristic, type SpecDeviceService, type SpecScanResult } from './NativeBlueBreeze'


// State

const state = new StateEventEmitter<BBState>(NativeBlueBreeze.state() as BBState)

NativeBlueBreeze.stateEmitter((value) => {
    state.add(value as BBState)
})

// Authorization to use BLE

const authorizationStatus = new StateEventEmitter<BBAuthorization>(NativeBlueBreeze.authorizationStatus() as BBAuthorization)

NativeBlueBreeze.authorizationStatusEmitter((value) => {
    authorizationStatus.add(value as BBAuthorization)
})

const authorizationRequest = NativeBlueBreeze.authorizationRequest

const authorizationOpenSettings = NativeBlueBreeze.authorizationOpenSettings

// Scanning

const scanEnabled = new StateEventEmitter<boolean>(NativeBlueBreeze.scanEnabled())

NativeBlueBreeze.scanEnabledEmitter((value) => {
    scanEnabled.add(value)
})

const scanResults = new EventEmitter<BBScanResult>()

NativeBlueBreeze.scanResultEmitter((value) => {
    const device = devices.value?.get(value.id)
    if (device == undefined) {
        return
    }

    scanResults.add(convertScanResult(device, value))
})

const scanStart = (ids: string[] | undefined = undefined) => NativeBlueBreeze.scanStart(ids)

const scanStop = NativeBlueBreeze.scanStop

// Device

const devices = new StateEventEmitter<Map<string, BBDevice>>(
    new Map(
        NativeBlueBreeze.devices().map((d) => [
            d.id,
            convertDevice(d)
        ])
    )
)

NativeBlueBreeze.devicesEmitter((value) => {
    devices.add(
        new Map(
            value.map((d) => [
                d.id,
                devices.value?.get(d.id) ?? convertDevice(d)
            ])
        )
    )
})

// Device services

const _deviceServices = new Map<string, StateEventEmitter<BBService[]>>()

const deviceServices = (id: string): StateEventEmitter<BBService[]> => {
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

const deviceConnectionStatus = (id: string): StateEventEmitter<string> => {
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

const deviceMTU = (id: string): StateEventEmitter<number> => {
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

const deviceConnect = NativeBlueBreeze.deviceConnect

const deviceDisconnect = NativeBlueBreeze.deviceDisconnect

const deviceDiscoverServices = NativeBlueBreeze.deviceDiscoverServices

const deviceRequestMTU = NativeBlueBreeze.deviceRequestMTU

// Device characteristic notify enabled

const _deviceCharacteristicNotifyEnabled = new Map<string, Map<string, Map<string, StateEventEmitter<boolean>>>>()

const deviceCharacteristicNotifyEnabled = (
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

const deviceCharacteristicData = (
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

const deviceCharacteristicRead = NativeBlueBreeze.deviceCharacteristicRead

const deviceCharacteristicWrite = NativeBlueBreeze.deviceCharacteristicWrite

const deviceCharacteristicSubscribe = NativeBlueBreeze.deviceCharacteristicSubscribe

const deviceCharacteristicUnsubscribe = NativeBlueBreeze.deviceCharacteristicUnsubscribe

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

const convertScanResult = (
    device: BBDevice,
    scanResult: SpecScanResult,
): BBScanResult => {
    return new BBScanResult(
        device,
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

// Export

export default {
    state,
    authorizationStatus,
    authorizationRequest,
    authorizationOpenSettings,
    scanEnabled,
    scanResults,
    scanStart,
    scanStop,
    devices,
    deviceServices,
    deviceConnectionStatus,
    deviceMTU,
    deviceConnect,
    deviceDisconnect,
    deviceDiscoverServices,
    deviceRequestMTU,
    deviceCharacteristicNotifyEnabled,
    deviceCharacteristicData,
    deviceCharacteristicRead,
    deviceCharacteristicWrite,
    deviceCharacteristicSubscribe,
    deviceCharacteristicUnsubscribe,
}

export {
    BBCharacteristic, BBDevice,
    BBScanResult,
    BBService, EventEmitter,
    StateEventEmitter, type BBAuthorization, type BBState
}

