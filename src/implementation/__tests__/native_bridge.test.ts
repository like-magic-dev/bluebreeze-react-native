import mockNativeBlueBreeze, { emitNative, resetNativeBlueBreezeMock } from '../../__mocks__/NativeBlueBreeze'
import {
    deviceCharacteristicData,
    deviceCharacteristicNotifyEnabled,
    deviceCharacteristicRead,
    deviceCharacteristicSubscribe,
    deviceCharacteristicUnsubscribe,
    deviceCharacteristicWrite,
    deviceConnect,
    deviceConnectionStatus,
    deviceDisconnect,
    deviceDiscoverServices,
    deviceMTU,
    deviceRequestMTU,
    deviceServices,
} from '../native_bridge'

jest.mock('../../NativeBlueBreeze')

// Every test below uses a device id unique to it. native_bridge's per-id StateValueEmitters are
// memoized for the whole test file's run (the module is only loaded once), so reusing an id
// across tests would leak state between them.
let nextId = 0
const freshId = () => `id-${nextId++}`

beforeEach(() => {
    resetNativeBlueBreezeMock()
})

describe('deviceServices', () => {
    it('memoizes one StateValueEmitter per device id', () => {
        const id = freshId()
        expect(deviceServices(id)).toBe(deviceServices(id))
        expect(deviceServices(id)).not.toBe(deviceServices(freshId()))
    })

    it('converts the native services/characteristics from the initial synchronous fetch', () => {
        const id = freshId()
        mockNativeBlueBreeze.deviceServices.mockReturnValue([
            {
                id: 'service-1',
                name: 'Service One',
                characteristics: [
                    { id: 'char-1', name: 'Char One', properties: ['read'] },
                ],
            },
        ])

        const [service] = deviceServices(id).value

        expect(service).toBeDefined()
        expect(service?.id).toBe('service-1')
        expect(service?.name).toBe('Service One')
        expect(service?.characteristics).toHaveLength(1)
        expect(service?.characteristics[0]?.id).toBe('char-1')
        expect(service?.characteristics[0]?.properties).toEqual(['read'])
    })

    it('updates the memoized emitter when the native module reports a services change', () => {
        const id = freshId()
        const emitter = deviceServices(id)

        emitNative('deviceServices', {
            id,
            value: [{ id: 'service-2', name: undefined, characteristics: [] }],
        })

        expect(emitter.value).toHaveLength(1)
        expect(emitter.value[0]?.id).toBe('service-2')
    })

    it('does not affect a different device id', () => {
        const idA = freshId()
        const idB = freshId()
        const emitterA = deviceServices(idA)
        const emitterB = deviceServices(idB)

        emitNative('deviceServices', { id: idA, value: [{ id: 'service-1', name: undefined, characteristics: [] }] })

        expect(emitterA.value).toHaveLength(1)
        expect(emitterB.value).toHaveLength(0)
    })
})

describe('deviceConnectionStatus', () => {
    it('reflects the native initial value and updates on a native event', () => {
        const id = freshId()
        mockNativeBlueBreeze.deviceConnectionStatus.mockReturnValue('disconnected')

        const status = deviceConnectionStatus(id)
        expect(status.value).toBe('disconnected')

        emitNative('deviceConnectionStatus', { id, value: 'connected' })
        expect(status.value).toBe('connected')
    })

    it('is memoized per device id, independent of other devices', () => {
        const idA = freshId()
        const idB = freshId()

        emitNative('deviceConnectionStatus', { id: idA, value: 'connected' })

        expect(deviceConnectionStatus(idA).value).toBe('connected')
        expect(deviceConnectionStatus(idB).value).toBe('disconnected')
    })
})

describe('deviceMTU', () => {
    it('reflects the native initial value and updates on a native event', () => {
        const id = freshId()
        mockNativeBlueBreeze.deviceMTU.mockReturnValue(23)

        const mtu = deviceMTU(id)
        expect(mtu.value).toBe(23)

        emitNative('deviceMTU', { id, value: 185 })
        expect(mtu.value).toBe(185)
    })
})

describe('device operations', () => {
    it('delegate straight to the native module with the same arguments', async () => {
        const id = freshId()

        await deviceConnect(id)
        expect(mockNativeBlueBreeze.deviceConnect).toHaveBeenCalledWith(id)

        await deviceDisconnect(id)
        expect(mockNativeBlueBreeze.deviceDisconnect).toHaveBeenCalledWith(id)

        await deviceDiscoverServices(id)
        expect(mockNativeBlueBreeze.deviceDiscoverServices).toHaveBeenCalledWith(id)

        mockNativeBlueBreeze.deviceRequestMTU.mockResolvedValue(247)
        await expect(deviceRequestMTU(id, 512)).resolves.toBe(247)
        expect(mockNativeBlueBreeze.deviceRequestMTU).toHaveBeenCalledWith(id, 512)
    })

    it('propagates a native rejection', async () => {
        const id = freshId()
        mockNativeBlueBreeze.deviceConnect.mockRejectedValue(new Error('connect failed'))

        await expect(deviceConnect(id)).rejects.toThrow('connect failed')
    })
})

describe('deviceCharacteristicNotifyEnabled', () => {
    it('is memoized per device/service/characteristic triple', () => {
        const id = freshId()
        const a = deviceCharacteristicNotifyEnabled(id, 'service-1', 'char-1')
        const sameKey = deviceCharacteristicNotifyEnabled(id, 'service-1', 'char-1')
        const differentCharacteristic = deviceCharacteristicNotifyEnabled(id, 'service-1', 'char-2')
        const differentService = deviceCharacteristicNotifyEnabled(id, 'service-2', 'char-1')

        expect(a).toBe(sameKey)
        expect(a).not.toBe(differentCharacteristic)
        expect(a).not.toBe(differentService)
    })

    it('updates only the matching triple on a native event', () => {
        const id = freshId()
        const target = deviceCharacteristicNotifyEnabled(id, 'service-1', 'char-1')
        const other = deviceCharacteristicNotifyEnabled(id, 'service-1', 'char-2')

        expect(target.value).toBe(false)

        emitNative('deviceCharacteristicNotifyEnabled', {
            id,
            serviceId: 'service-1',
            characteristicId: 'char-1',
            value: true,
        })

        expect(target.value).toBe(true)
        expect(other.value).toBe(false)
    })
})

describe('deviceCharacteristicData', () => {
    it('reflects the native initial value and updates on a native event', () => {
        const id = freshId()
        mockNativeBlueBreeze.deviceCharacteristicData.mockReturnValue([1, 2, 3])

        const data = deviceCharacteristicData(id, 'service-1', 'char-1')
        expect(data.value).toEqual([1, 2, 3])

        emitNative('deviceCharacteristicData', {
            id,
            serviceId: 'service-1',
            characteristicId: 'char-1',
            value: [4, 5],
        })

        expect(data.value).toEqual([4, 5])
    })
})

describe('characteristic operations', () => {
    it('delegate straight to the native module with the same arguments', async () => {
        const id = freshId()

        mockNativeBlueBreeze.deviceCharacteristicRead.mockResolvedValue([9, 9])
        await expect(deviceCharacteristicRead(id, 'service-1', 'char-1')).resolves.toEqual([9, 9])
        expect(mockNativeBlueBreeze.deviceCharacteristicRead).toHaveBeenCalledWith(id, 'service-1', 'char-1')

        await deviceCharacteristicWrite(id, 'service-1', 'char-1', [1, 2], true)
        expect(mockNativeBlueBreeze.deviceCharacteristicWrite).toHaveBeenCalledWith(id, 'service-1', 'char-1', [1, 2], true)

        await deviceCharacteristicSubscribe(id, 'service-1', 'char-1')
        expect(mockNativeBlueBreeze.deviceCharacteristicSubscribe).toHaveBeenCalledWith(id, 'service-1', 'char-1')

        await deviceCharacteristicUnsubscribe(id, 'service-1', 'char-1')
        expect(mockNativeBlueBreeze.deviceCharacteristicUnsubscribe).toHaveBeenCalledWith(id, 'service-1', 'char-1')
    })
})
