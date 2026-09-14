import { StateValueEmitter, ValueEmitter } from 'react-native-value-emitter'
import type { BBAuthorization } from './implementation/bluebreeze_authorization'
import { BBCharacteristic } from './implementation/bluebreeze_characteristic'
import { BBDevice } from './implementation/bluebreeze_device'
import { BBScanResult } from './implementation/bluebreeze_scan_result'
import { BBService } from './implementation/bluebreeze_service'
import type { BBState } from './implementation/bluebreeze_state'
import NativeBlueBreeze, { type SpecDevice, type SpecScanResult } from './NativeBlueBreeze'

// State

/** The power/availability state of the device's Bluetooth adapter. */
const state = new StateValueEmitter<BBState>(NativeBlueBreeze.state() as BBState)

NativeBlueBreeze.stateEmitter((value) => {
    state.add(value as BBState)
})

// Authorization to use BLE

/** Whether this app is currently allowed to use Bluetooth. */
const authorizationStatus = new StateValueEmitter<BBAuthorization>(NativeBlueBreeze.authorizationStatus() as BBAuthorization)

NativeBlueBreeze.authorizationStatusEmitter((value) => {
    authorizationStatus.add(value as BBAuthorization)
})

/** Requests Bluetooth authorization from the user, if not already granted or permanently denied. */
const authorizationRequest = NativeBlueBreeze.authorizationRequest

/** Opens the OS settings screen for this app, for a user to grant Bluetooth authorization after denying it. */
const authorizationOpenSettings = NativeBlueBreeze.authorizationOpenSettings

// Scanning

/** Whether a BLE scan is currently running. */
const scanEnabled = new StateValueEmitter<boolean>(NativeBlueBreeze.scanEnabled())

NativeBlueBreeze.scanEnabledEmitter((value) => {
    scanEnabled.add(value)
})

/** Emits every advertisement seen while scanning, including repeat sightings of the same device. */
const scanResults = new ValueEmitter<BBScanResult>()

NativeBlueBreeze.scanResultEmitter((value) => {
    let device = devices.value?.get(value.id)

    // The native "device discovered" and "scan result" events are emitted independently.
    // We register a new device locally rather than dropping the result.
    if (device == undefined) {
        device = convertDevice(value)
        devices.add(new Map(devices.value).set(value.id, device))
    }

    scanResults.add(convertScanResult(device, value))
})

/**
 * Starts a BLE scan.
 * @param ids Service UUIDs to filter for. When omitted, every nearby advertisement is reported.
 */
const scanStart = (ids: string[] | undefined = undefined) => NativeBlueBreeze.scanStart(ids)

/** Stops the current BLE scan. */
const scanStop = NativeBlueBreeze.scanStop

// Devices

/**
 * Every device seen so far, either via scanning or a prior connection this session, keyed by
 * platform device ID. A device is added here the moment it's first seen in a scan result and
 * stays here for the app's lifetime.
 */
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
}

export {
    BBCharacteristic,
    BBDevice,
    BBScanResult,
    BBService,
    type BBAuthorization,
    type BBState
}
