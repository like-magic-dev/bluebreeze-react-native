import { StateValueEmitter } from 'react-native-value-emitter'
import NativeBlueBreeze, { type SpecDeviceCharacteristic, type SpecDeviceService } from '../NativeBlueBreeze'
import { BBCharacteristic } from './bluebreeze_characteristic'
import type { BBDeviceConnectionStatus } from './bluebreeze_connection_status'
import { BBService } from './bluebreeze_service'

/**
 * Per-device/per-characteristic wiring between the native module and {@link BBDevice}/
 * {@link BBCharacteristic}. Not part of the package's public API: everything here is consumed
 * directly by those two classes' constructors and is intentionally not re-exported from the
 * package entry point (`src/index.tsx`) -- callers use `BBDevice`/`BBCharacteristic` methods
 * instead of these raw, ID-keyed functions.
 */

function mapGetOrSet<T>(map: Map<string, T>, key: string, defaultValue: () => T): T {
    if (map.get(key) == undefined) {
        map.set(key, defaultValue())
    }

    return map.get(key)!
}

// Device services

const _deviceServices = new Map<string, StateValueEmitter<BBService[]>>()

export const deviceServices = (id: string): StateValueEmitter<BBService[]> => {
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

const _deviceConnectionStatus = new Map<string, StateValueEmitter<BBDeviceConnectionStatus>>()

export const deviceConnectionStatus = (id: string): StateValueEmitter<BBDeviceConnectionStatus> => {
    return mapGetOrSet(
        _deviceConnectionStatus,
        id,
        () => new StateValueEmitter<BBDeviceConnectionStatus>(
            NativeBlueBreeze.deviceConnectionStatus(id) as BBDeviceConnectionStatus
        )
    )
}

NativeBlueBreeze.deviceConnectionStatusEmitter((value) => {
    deviceConnectionStatus(value.id).add(value.value as BBDeviceConnectionStatus)
})

// Device MTU

const _deviceMTU = new Map<string, StateValueEmitter<number>>()

export const deviceMTU = (id: string): StateValueEmitter<number> => {
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

// Device operations

export const deviceConnect = NativeBlueBreeze.deviceConnect

export const deviceDisconnect = NativeBlueBreeze.deviceDisconnect

export const deviceDiscoverServices = NativeBlueBreeze.deviceDiscoverServices

export const deviceRequestMTU = NativeBlueBreeze.deviceRequestMTU

// Device characteristic notify enabled

const _deviceCharacteristicNotifyEnabled = new Map<string, Map<string, Map<string, StateValueEmitter<boolean>>>>()

export const deviceCharacteristicNotifyEnabled = (
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

export const deviceCharacteristicData = (
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

export const deviceCharacteristicRead = NativeBlueBreeze.deviceCharacteristicRead

export const deviceCharacteristicWrite = NativeBlueBreeze.deviceCharacteristicWrite

export const deviceCharacteristicSubscribe = NativeBlueBreeze.deviceCharacteristicSubscribe

export const deviceCharacteristicUnsubscribe = NativeBlueBreeze.deviceCharacteristicUnsubscribe

// Object decoders

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
