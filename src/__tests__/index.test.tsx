import mockNativeBlueBreeze, { emitNative, resetNativeBlueBreezeMock } from '../__mocks__/NativeBlueBreeze'
import BlueBreeze from '../index'

jest.mock('../NativeBlueBreeze')

// Every test uses a device id unique to it -- `devices`/`scanResults` are singletons for the
// whole test file's run (index.tsx is only loaded once), so reusing an id across tests would
// leak state between them.
let nextId = 0
const freshId = () => `device-${nextId++}`

beforeEach(() => {
    resetNativeBlueBreezeMock()
})

describe('state', () => {
    it('updates on a native state event', () => {
        emitNative('state', 'poweredOn')
        expect(BlueBreeze.state.value).toBe('poweredOn')
    })
})

describe('authorizationStatus', () => {
    it('updates on a native authorizationStatus event', () => {
        emitNative('authorizationStatus', 'authorized')
        expect(BlueBreeze.authorizationStatus.value).toBe('authorized')
    })
})

describe('scanEnabled', () => {
    it('updates on a native scanEnabled event', () => {
        emitNative('scanEnabled', true)
        expect(BlueBreeze.scanEnabled.value).toBe(true)
    })
})

describe('scanStart / scanStop / authorizationRequest / authorizationOpenSettings', () => {
    it('delegate straight to the native module', () => {
        BlueBreeze.scanStart(['service-1'])
        expect(mockNativeBlueBreeze.scanStart).toHaveBeenCalledWith(['service-1'])

        BlueBreeze.scanStart()
        expect(mockNativeBlueBreeze.scanStart).toHaveBeenCalledWith(undefined)

        BlueBreeze.scanStop()
        expect(mockNativeBlueBreeze.scanStop).toHaveBeenCalled()

        BlueBreeze.authorizationRequest()
        expect(mockNativeBlueBreeze.authorizationRequest).toHaveBeenCalled()

        BlueBreeze.authorizationOpenSettings()
        expect(mockNativeBlueBreeze.authorizationOpenSettings).toHaveBeenCalled()
    })
})

describe('devices', () => {
    it('adds a new device seen in a devicesEmitter event', () => {
        const id = freshId()
        emitNative('devices', [{ id, name: 'Device One' }])

        expect(BlueBreeze.devices.value.get(id)?.name).toBe('Device One')
    })

    it('preserves BBDevice object identity across repeated devicesEmitter events for the same id', () => {
        const id = freshId()
        emitNative('devices', [{ id, name: 'Original Name' }])
        const first = BlueBreeze.devices.value.get(id)

        // A live BBDevice (and anything subscribed to its services/connectionStatus/mtu) must
        // keep working across further devicesEmitter events for the same device -- it must not
        // be silently replaced with a new instance.
        emitNative('devices', [{ id, name: 'Original Name' }])
        const second = BlueBreeze.devices.value.get(id)

        expect(second).toBe(first)
    })

    it('replaces the whole devices map with each devicesEmitter snapshot', () => {
        const idA = freshId()
        const idB = freshId()
        emitNative('devices', [{ id: idA, name: 'Device A' }])

        // Each devicesEmitter event is the native side's full current snapshot, not an
        // incremental delta -- a device missing from a later snapshot is dropped here too.
        // (A device introduced via a scan result, covered below, behaves differently: that path
        // adds to the existing map rather than replacing it.)
        emitNative('devices', [{ id: idB, name: 'Device B' }])

        expect(BlueBreeze.devices.value.has(idA)).toBe(false)
        expect(BlueBreeze.devices.value.has(idB)).toBe(true)
    })
})

describe('scanResults', () => {
    it('registers a new device for a scan result whose device is not yet in the devices map', () => {
        const id = freshId()
        const seen: { device: { id: string } }[] = []
        BlueBreeze.scanResults.onValue((r) => seen.push(r))

        emitNative('scanResult', {
            id,
            name: 'Adv Name',
            rssi: -40,
            connectable: true,
            advertisedServices: [],
        })

        expect(BlueBreeze.devices.value.has(id)).toBe(true)
        expect(seen).toHaveLength(1)
        expect(seen[0]?.device.id).toBe(id)
    })

    it('reuses the existing device for a scan result of an already-known device', () => {
        const id = freshId()
        emitNative('devices', [{ id, name: 'Device Six' }])
        const existing = BlueBreeze.devices.value.get(id)

        emitNative('scanResult', {
            id,
            name: undefined,
            rssi: -60,
            connectable: true,
            advertisedServices: [],
        })

        expect(BlueBreeze.devices.value.get(id)).toBe(existing)
    })
})
