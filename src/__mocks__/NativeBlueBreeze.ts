/**
 * Manual mock for the native TurboModule (see jest docs on `__mocks__` for user modules --
 * every test file that needs it must call `jest.mock('../NativeBlueBreeze')` or
 * `jest.mock('./NativeBlueBreeze')` explicitly).
 *
 * Every `*Emitter` registration function records its handler so a test can simulate a native
 * event with `emitNative('deviceServices', value)`. Call `resetNativeBlueBreezeMock()` in
 * `beforeEach` to clear captured handlers and call history and restore default return values.
 */

import type { SpecDevice, SpecDeviceService } from '../NativeBlueBreeze'

type Handler = (value: never) => void

const listeners = new Map<string, Handler[]>()

function makeEmitter(name: string) {
    return jest.fn((handler: Handler) => {
        const forName = listeners.get(name) ?? []
        forName.push(handler)
        listeners.set(name, forName)
        return { remove: jest.fn() }
    })
}

/** Invokes every handler registered for `name`'s `*Emitter`, simulating a native event. */
export function emitNative<T>(name: string, value: T): void {
    for (const handler of listeners.get(name) ?? []) {
        (handler as (value: T) => void)(value)
    }
}

/**
 * Resets call history and restores default return values for the next test. Deliberately does
 * NOT clear captured `*Emitter` handlers: production code (e.g. `native_bridge.ts`) registers
 * those exactly once, at module-load time, and expects them to keep working for the module's
 * whole lifetime -- clearing them here would silently break `emitNative(...)` in every test
 * after the first.
 */
export function resetNativeBlueBreezeMock(): void {
    mock.state.mockReset().mockReturnValue('unknown')
    mock.stateEmitter.mockClear()

    mock.authorizationStatus.mockReset().mockReturnValue('unknown')
    mock.authorizationStatusEmitter.mockClear()
    mock.authorizationRequest.mockReset()
    mock.authorizationOpenSettings.mockReset()

    mock.scanEnabled.mockReset().mockReturnValue(false)
    mock.scanEnabledEmitter.mockClear()
    mock.scanResultEmitter.mockClear()
    mock.scanStart.mockReset()
    mock.scanStop.mockReset()

    mock.devices.mockReset().mockReturnValue([])
    mock.devicesEmitter.mockClear()

    mock.deviceServices.mockReset().mockReturnValue([])
    mock.deviceServicesEmitter.mockClear()

    mock.deviceConnectionStatus.mockReset().mockReturnValue('disconnected')
    mock.deviceConnectionStatusEmitter.mockClear()

    mock.deviceMTU.mockReset().mockReturnValue(0)
    mock.deviceMTUEmitter.mockClear()

    mock.deviceConnect.mockReset().mockResolvedValue(undefined)
    mock.deviceDisconnect.mockReset().mockResolvedValue(undefined)
    mock.deviceDiscoverServices.mockReset().mockResolvedValue(undefined)
    mock.deviceRequestMTU.mockReset().mockResolvedValue(0)

    mock.deviceCharacteristicNotifyEnabled.mockReset().mockReturnValue(false)
    mock.deviceCharacteristicNotifyEnabledEmitter.mockClear()

    mock.deviceCharacteristicData.mockReset().mockReturnValue([])
    mock.deviceCharacteristicDataEmitter.mockClear()

    mock.deviceCharacteristicNotifications.mockReset().mockReturnValue([])
    mock.deviceCharacteristicNotificationsEmitter.mockClear()

    mock.deviceCharacteristicRead.mockReset().mockResolvedValue([])
    mock.deviceCharacteristicWrite.mockReset().mockResolvedValue(undefined)
    mock.deviceCharacteristicSubscribe.mockReset().mockResolvedValue(undefined)
    mock.deviceCharacteristicUnsubscribe.mockReset().mockResolvedValue(undefined)
}

const mock = {
    state: jest.fn(() => 'unknown'),
    stateEmitter: makeEmitter('state'),

    authorizationStatus: jest.fn(() => 'unknown'),
    authorizationStatusEmitter: makeEmitter('authorizationStatus'),
    authorizationRequest: jest.fn(),
    authorizationOpenSettings: jest.fn(),

    scanEnabled: jest.fn(() => false),
    scanEnabledEmitter: makeEmitter('scanEnabled'),
    scanResultEmitter: makeEmitter('scanResult'),
    scanStart: jest.fn(),
    scanStop: jest.fn(),

    devices: jest.fn((): SpecDevice[] => []),
    devicesEmitter: makeEmitter('devices'),

    deviceServices: jest.fn((): SpecDeviceService[] => []),
    deviceServicesEmitter: makeEmitter('deviceServices'),

    deviceConnectionStatus: jest.fn(() => 'disconnected'),
    deviceConnectionStatusEmitter: makeEmitter('deviceConnectionStatus'),

    deviceMTU: jest.fn(() => 0),
    deviceMTUEmitter: makeEmitter('deviceMTU'),

    deviceConnect: jest.fn(() => Promise.resolve()),
    deviceDisconnect: jest.fn(() => Promise.resolve()),
    deviceDiscoverServices: jest.fn(() => Promise.resolve()),
    deviceRequestMTU: jest.fn(() => Promise.resolve(0)),

    deviceCharacteristicNotifyEnabled: jest.fn(() => false),
    deviceCharacteristicNotifyEnabledEmitter: makeEmitter('deviceCharacteristicNotifyEnabled'),

    deviceCharacteristicData: jest.fn((): number[] => []),
    deviceCharacteristicDataEmitter: makeEmitter('deviceCharacteristicData'),

    deviceCharacteristicNotifications: jest.fn((): number[] => []),
    deviceCharacteristicNotificationsEmitter: makeEmitter('deviceCharacteristicNotifications'),

    deviceCharacteristicRead: jest.fn((): Promise<number[]> => Promise.resolve([])),
    deviceCharacteristicWrite: jest.fn(() => Promise.resolve()),
    deviceCharacteristicSubscribe: jest.fn(() => Promise.resolve()),
    deviceCharacteristicUnsubscribe: jest.fn(() => Promise.resolve()),
}

export default mock
