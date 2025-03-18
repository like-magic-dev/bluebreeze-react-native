import type { TurboModule } from 'react-native'
import { TurboModuleRegistry } from 'react-native'
import type { EventEmitter } from 'react-native/Libraries/Types/CodegenTypes'

/// Events

export interface SpecScanResult {
    id: string
    name?: string
    rssi: number
    connectable: boolean
    advertisedServices: string[]
    manufacturerId?: number
    manufacturerName?: string
    manufacturerData?: number[]
}

export interface SpecDevice {
    id: string
    name?: string
}

export interface SpecDeviceCharacteristic {
    id: string
    name?: string
    properties: string[]
}

export interface SpecDeviceService {
    id: string
    name?: string
    characteristics: SpecDeviceCharacteristic[]
}

export interface SpecDeviceServices {
    id: string
    value: SpecDeviceService[]
}

export interface SpecDeviceConnectionStatus {
    id: string
    value: string
}

export interface SpecDeviceMTU {
    id: string
    value: number
}

export interface BBDeviceCharacteristicDataEvent {
    id: string
    serviceId: string
    characteristicId: string
    value: number[]
}

export interface BBDeviceCharacteristicNotifyEnabledEvent {
    id: string
    serviceId: string
    characteristicId: string
    value: boolean
}

/// Module specifications

export interface Spec extends TurboModule {
    // State
    state(): string
    readonly stateEmitter: EventEmitter<string>

    // Authorization
    authorizationStatus(): string
    readonly authorizationStatusEmitter: EventEmitter<string>
    authorizationRequest(): void
    authorizationOpenSettings(): void

    // Scanning
    scanEnabled(): boolean
    readonly scanEnabledEmitter: EventEmitter<boolean>
    readonly scanResultEmitter: EventEmitter<SpecScanResult>
    scanStart(ids?: string[]): void
    scanStop(): void

    // Devices
    devices(): SpecDevice[]
    readonly devicesEmitter: EventEmitter<SpecDevice[]>

    // Device services
    deviceServices(id: string): SpecDeviceService[]
    readonly deviceServicesEmitter: EventEmitter<SpecDeviceServices>

    // Device connection status
    deviceConnectionStatus(id: string): string
    readonly deviceConnectionStatusEmitter: EventEmitter<SpecDeviceConnectionStatus>

    // Device MTU
    deviceMTU(id: string): number
    readonly deviceMTUEmitter: EventEmitter<SpecDeviceMTU>

    // Device operations
    deviceConnect(id: string): Promise<void>
    deviceDisconnect(id: string): Promise<void>
    deviceDiscoverServices(id: string): Promise<void>
    deviceRequestMTU(id: string, mtu: number): Promise<number>

    // Device characteristic data
    deviceCharacteristicData(id: string, serviceId: string, characteristicId: string): number[]
    readonly deviceCharacteristicDataEmitter: EventEmitter<BBDeviceCharacteristicDataEvent>

    // Device characteristic notify enabled
    deviceCharacteristicNotifyEnabled(id: string, serviceId: string, characteristicId: string): boolean
    readonly deviceCharacteristicNotifyEnabledEmitter: EventEmitter<BBDeviceCharacteristicNotifyEnabledEvent>

    // Device characteristic operations
    deviceCharacteristicRead(id: string, serviceId: string, characteristicId: string): Promise<number[]>
    deviceCharacteristicWrite(id: string, serviceId: string, characteristicId: string, data: number[], withResponse: boolean): Promise<void>
    deviceCharacteristicSubscribe(id: string, serviceId: string, characteristicId: string): Promise<void>
    deviceCharacteristicUnsubscribe(id: string, serviceId: string, characteristicId: string): Promise<void>
}

export default TurboModuleRegistry.getEnforcing<Spec>('BlueBreeze')
