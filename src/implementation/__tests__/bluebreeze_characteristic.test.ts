import mockNativeBlueBreeze, { emitNative, resetNativeBlueBreezeMock } from '../../__mocks__/NativeBlueBreeze'
import { BBCharacteristic } from '../bluebreeze_characteristic'

jest.mock('../../NativeBlueBreeze')

// Every test uses a characteristic id unique to it -- see bluebreeze_device.test.ts for why.
let nextId = 0
const freshId = () => `char-${nextId++}`

beforeEach(() => {
    resetNativeBlueBreezeMock()
})

it('exposes the constructor arguments', () => {
    const characteristic = new BBCharacteristic('device-1', 'service-1', 'char-fixed', 'My Char', ['read', 'notify'])

    expect(characteristic.id).toBe('char-fixed')
    expect(characteristic.name).toBe('My Char')
    expect(characteristic.properties).toEqual(['read', 'notify'])
})

it('reflects native data and updates on a native event', () => {
    const id = freshId()
    mockNativeBlueBreeze.deviceCharacteristicData.mockReturnValue([1, 2])
    const characteristic = new BBCharacteristic('device-1', 'service-1', id, undefined, ['read'])

    expect(characteristic.data.value).toEqual([1, 2])

    emitNative('deviceCharacteristicData', {
        id: 'device-1',
        serviceId: 'service-1',
        characteristicId: id,
        value: [9],
    })

    expect(characteristic.data.value).toEqual([9])
})

it('reflects native notifyEnabled and updates on a native event', () => {
    const id = freshId()
    const characteristic = new BBCharacteristic('device-1', 'service-1', id, undefined, ['notify'])

    expect(characteristic.notifyEnabled.value).toBe(false)

    emitNative('deviceCharacteristicNotifyEnabled', {
        id: 'device-1',
        serviceId: 'service-1',
        characteristicId: id,
        value: true,
    })

    expect(characteristic.notifyEnabled.value).toBe(true)
})

it('does not react to an event for a different characteristic id', () => {
    const idA = freshId()
    const idB = freshId()
    const a = new BBCharacteristic('device-1', 'service-1', idA, undefined, ['notify'])
    const b = new BBCharacteristic('device-1', 'service-1', idB, undefined, ['notify'])

    emitNative('deviceCharacteristicNotifyEnabled', {
        id: 'device-1',
        serviceId: 'service-1',
        characteristicId: idA,
        value: true,
    })

    expect(a.notifyEnabled.value).toBe(true)
    expect(b.notifyEnabled.value).toBe(false)
})

it('read/write/subscribe/unsubscribe delegate to the native module with this characteristic\'s ids', async () => {
    const id = freshId()
    const characteristic = new BBCharacteristic('device-1', 'service-1', id, undefined, ['read', 'writeWithResponse', 'notify'])

    mockNativeBlueBreeze.deviceCharacteristicRead.mockResolvedValue([1, 2, 3])
    await expect(characteristic.read()).resolves.toEqual([1, 2, 3])
    expect(mockNativeBlueBreeze.deviceCharacteristicRead).toHaveBeenCalledWith('device-1', 'service-1', id)

    await characteristic.write([4, 5], true)
    expect(mockNativeBlueBreeze.deviceCharacteristicWrite).toHaveBeenCalledWith('device-1', 'service-1', id, [4, 5], true)

    await characteristic.subscribe()
    expect(mockNativeBlueBreeze.deviceCharacteristicSubscribe).toHaveBeenCalledWith('device-1', 'service-1', id)

    await characteristic.unsubscribe()
    expect(mockNativeBlueBreeze.deviceCharacteristicUnsubscribe).toHaveBeenCalledWith('device-1', 'service-1', id)
})
