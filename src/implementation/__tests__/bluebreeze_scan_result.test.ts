import { BBDevice } from '../bluebreeze_device'
import { BBScanResult } from '../bluebreeze_scan_result'

// BBDevice construction reaches into native_bridge -> NativeBlueBreeze, so this needs mocking
// too even though these tests are only about BBScanResult's own field wiring.
jest.mock('../../NativeBlueBreeze')

it('exposes the constructor arguments', () => {
    const device = new BBDevice('device-1', 'My Device')
    const result = new BBScanResult(device, 'Adv Name', -50, true, ['service-1'], 76, 'Apple', [1, 2])

    expect(result.device).toBe(device)
    expect(result.name).toBe('Adv Name')
    expect(result.rssi).toBe(-50)
    expect(result.connectable).toBe(true)
    expect(result.advertisedServices).toEqual(['service-1'])
    expect(result.manufacturerId).toBe(76)
    expect(result.manufacturerName).toBe('Apple')
    expect(result.manufacturerData).toEqual([1, 2])
})
