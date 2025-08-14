import { StateValueEmitter, ValueEmitter } from 'react-native-value-emitter'
import type { BBAuthorization } from './implementation/bluebreeze_authorization'
import { BBCharacteristic } from './implementation/bluebreeze_characteristic'
import { BBDevice } from './implementation/bluebreeze_device'
import { BBScanResult } from './implementation/bluebreeze_scan_result'
import { BBService } from './implementation/bluebreeze_service'
import type { BBState } from './implementation/bluebreeze_state'
import NativeBlueBreeze, { type SpecDevice, type SpecDeviceCharacteristic, type SpecDeviceService, type SpecScanResult } from './NativeBlueBreeze'


// State

const state = new StateValueEmitter<BBState>(NativeBlueBreeze.state() as BBState)

NativeBlueBreeze.stateEmitter((value) => {
    state.add(value as BBState)
})

// Authorization to use BLE

const authorizationStatus = new StateValueEmitter<BBAuthorization>(NativeBlueBreeze.authorizationStatus() as BBAuthorization)

NativeBlueBreeze.authorizationStatusEmitter((value) => {
    authorizationStatus.add(value as BBAuthorization)
})

const authorizationRequest = NativeBlueBreeze.authorizationRequest

const authorizationOpenSettings = NativeBlueBreeze.authorizationOpenSettings

// Scanning

const scanEnabled = new StateValueEmitter<boolean>(NativeBlueBreeze.scanEnabled())

NativeBlueBreeze.scanEnabledEmitter((value) => {
    scanEnabled.add(value)
})

const scanResults = new ValueEmitter<BBScanResult>()

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

const devices = new StateValueEmitter<Map<string, BBDevice>>(
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

const _deviceServices = new Map<string, StateValueEmitter<BBService[]>>()

const deviceServices = (id: string): StateValueEmitter<BBService[]> => {
    return mapGetOrSet(
        _deviceServices,
        id,
        () => new StateValueEmitter<BBService[]>(
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

const _deviceConnectionStatus = new Map<string, StateValueEmitter<string>>()

const deviceConnectionStatus = (id: string): StateValueEmitter<string> => {
    return mapGetOrSet(
        _deviceConnectionStatus,
        id,
        () => new StateValueEmitter<string>(
            NativeBlueBreeze.deviceConnectionStatus(id)
        )
    )
}

NativeBlueBreeze.deviceConnectionStatusEmitter((value) => {
    deviceConnectionStatus(value.id).add(value.value)
})

// Device MTU

const _deviceMTU = new Map<string, StateValueEmitter<number>>()

const deviceMTU = (id: string): StateValueEmitter<number> => {
    return mapGetOrSet(
        _deviceMTU,
        id,
        () => new StateValueEmitter<number>(
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

const _deviceCharacteristicNotifyEnabled = new Map<string, Map<string, Map<string, StateValueEmitter<boolean>>>>()

const deviceCharacteristicNotifyEnabled = (
    id: string,
    serviceId: string,
    characteristicId: string
): StateValueEmitter<boolean> => {
    const deviceMap = mapGetOrSet(
        _deviceCharacteristicNotifyEnabled,
        id,
        () => new Map<string, Map<string, StateValueEmitter<boolean>>>()
    )

    const serviceMap = mapGetOrSet(
        deviceMap,
        serviceId,
        () => new Map<string, StateValueEmitter<boolean>>()
    )

    return mapGetOrSet(
        serviceMap,
        characteristicId,
        () => new StateValueEmitter<boolean>(
            NativeBlueBreeze.deviceCharacteristicNotifyEnabled(id, serviceId, characteristicId)
        )
    )
}

NativeBlueBreeze.deviceCharacteristicNotifyEnabledEmitter((value) => {
    deviceCharacteristicNotifyEnabled(value.id, value.serviceId, value.characteristicId).add(value.value)
})

// Device characteristic data

const _deviceCharacteristicData = new Map<string, Map<string, Map<string, StateValueEmitter<number[]>>>>()

const deviceCharacteristicData = (
    id: string,
    serviceId: string,
    characteristicId: string
): StateValueEmitter<number[]> => {
    const deviceMap = mapGetOrSet(
        _deviceCharacteristicData,
        id,
        () => new Map<string, Map<string, StateValueEmitter<number[]>>>()
    )

    const serviceMap = mapGetOrSet(
        deviceMap,
        serviceId,
        () => new Map<string, StateValueEmitter<number[]>>()
    )

    return mapGetOrSet(
        serviceMap,
        characteristicId,
        () => new StateValueEmitter<number[]>(
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
    BBCharacteristic,
    BBDevice,
    BBScanResult,
    BBService,
    type BBAuthorization,
    type BBState
}

