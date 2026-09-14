import { BBCharacteristic } from '../bluebreeze_characteristic'
import { BBService } from '../bluebreeze_service'

// BBCharacteristic construction reaches into native_bridge -> NativeBlueBreeze, so this needs
// mocking too even though these tests are only about BBService's own field wiring.
jest.mock('../../NativeBlueBreeze')

it('exposes the constructor arguments', () => {
    const characteristic = new BBCharacteristic('device-1', 'service-1', 'char-1', undefined, [])
    const service = new BBService('service-1', 'My Service', [characteristic])

    expect(service.id).toBe('service-1')
    expect(service.name).toBe('My Service')
    expect(service.characteristics).toEqual([characteristic])
})
