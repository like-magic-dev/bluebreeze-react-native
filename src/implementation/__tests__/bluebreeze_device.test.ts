import mockNativeBlueBreeze, { emitNative, resetNativeBlueBreezeMock } from '../../__mocks__/NativeBlueBreeze'
import { BBDevice } from '../bluebreeze_device'

jest.mock('../../NativeBlueBreeze')

// Every test uses a device id unique to it -- native_bridge's per-id StateValueEmitters are
// memoized for the whole test file's run, so reusing an id across tests would leak state.
let nextId = 0
const freshId = () => `device-${nextId++}`

beforeEach(() => {
    resetNativeBlueBreezeMock()
})

it('exposes the constructor arguments as id/name', () => {
    const device = new BBDevice('device-fixed', 'My Device')

    expect(device.id).toBe('device-fixed')
    expect(device.name).toBe('My Device')
})

it('reflects the native connection status and updates on a native event', () => {
    const id = freshId()
    mockNativeBlueBreeze.deviceConnectionStatus.mockReturnValue('disconnected')
    const device = new BBDevice(id)

    expect(device.connectionStatus.value).toBe('disconnected')

    emitNative('deviceConnectionStatus', { id, value: 'connected' })
    expect(device.connectionStatus.value).toBe('connected')
})

it('reflects the native MTU and updates on a native event', () => {
    const id = freshId()
    mockNativeBlueBreeze.deviceMTU.mockReturnValue(23)
    const device = new BBDevice(id)

    expect(device.mtu.value).toBe(23)

    emitNative('deviceMTU', { id, value: 512 })
    expect(device.mtu.value).toBe(512)
})

it('reflects native services and rebuilds them on a services event', () => {
    const id = freshId()
    const device = new BBDevice(id)

    expect(device.services.value).toEqual([])

    emitNative('deviceServices', {
        id,
        value: [{ id: 'service-1', name: 'Svc', characteristics: [] }],
    })

    expect(device.services.value).toHaveLength(1)
    expect(device.services.value[0]?.id).toBe('service-1')
})

it('connect/disconnect/discoverServices/requestMTU delegate to the native module with this device\'s id', async () => {
    const id = freshId()
    const device = new BBDevice(id)

    await device.connect()
    expect(mockNativeBlueBreeze.deviceConnect).toHaveBeenCalledWith(id)

    await device.disconnect()
    expect(mockNativeBlueBreeze.deviceDisconnect).toHaveBeenCalledWith(id)

    await device.discoverServices()
    expect(mockNativeBlueBreeze.deviceDiscoverServices).toHaveBeenCalledWith(id)

    mockNativeBlueBreeze.deviceRequestMTU.mockResolvedValue(247)
    await expect(device.requestMTU(512)).resolves.toBe(247)
    expect(mockNativeBlueBreeze.deviceRequestMTU).toHaveBeenCalledWith(id, 512)
})

it('propagates a rejected connect() as a thrown error', async () => {
    const id = freshId()
    const device = new BBDevice(id)
    mockNativeBlueBreeze.deviceConnect.mockRejectedValue(new Error('nope'))

    await expect(device.connect()).rejects.toThrow('nope')
})
