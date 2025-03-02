//
//  BlueBreeze.swift
//  react-native-bluebreeze
//
//  Created by Alessandro Mulloni on 03.01.25.
//

import BlueBreeze
import Combine
import Foundation

struct BlueBreezeError : Error {
    let description: String
}

@objc public class BlueBreezeImpl: NSObject {
    var disposeBag: Set<AnyCancellable> = []
    let manager = BBManager()

    // MARK: - State

    @objc public func state() -> String {
        return manager.state.value.toJs
    }

    @objc public func stateObserve(onChanged: @escaping (String) -> Void) {
        manager.state
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.toJs) }
            .store(in: &disposeBag)
    }

    // MARK: - Authorization

    @objc public func authorizationStatus() -> String {
        return manager.authorizationStatus.value.toJs
    }

    @objc public func authorizationStatusObserve(onChanged: @escaping (String) -> Void) {
        manager.authorizationStatus
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.toJs) }
            .store(in: &disposeBag)
    }
    
    @objc public func authorizationRequest() {
        manager.authorizationRequest()
    }
    
    @objc public func authorizationOpenSettings() {
        manager.authorizationOpenSettings()
    }

    // MARK: - Scanning

    @objc public func scanEnabled() -> Bool {
        return manager.scanEnabled.value
    }
    
    @objc public func scanResultsObserve(onChanged: @escaping ([String: Any]) -> Void) {
        return manager.scanResults
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.toJs) }
            .store(in: &disposeBag)
    }

    @objc public func scanEnabledObserve(onChanged: @escaping (Bool) -> Void) {
        return manager.scanEnabled
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0) }
            .store(in: &disposeBag)
    }

    @objc public func scanStart() {
        manager.scanStart()
    }

    @objc public func scanStop() {
        manager.scanStop()
    }

    // MARK: - Devices

    @objc public func devices() -> [[String: Any]] {
        return manager.devices.value.values.map { $0.toJs }
    }

    @objc public func devicesObserve(onChanged: @escaping ([[String: Any]]) -> Void) {
        return manager.devices
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.values.map { $0.toJs }) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device services
    
    @objc public func deviceServices(id: String) -> [[String: Any]] {
        guard let uuid = UUID(uuidString: id) else {
            return []
        }
        
        guard let device = manager.devices.value[uuid] else {
            return []
        }
        
        return device.services.value.toJs
    }
    
    @objc public func deviceServicesObserve(id: String, onChanged: @escaping ([[String: Any]]) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        return device.services
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.toJs) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device connection status
    
    @objc public func deviceConnectionStatus(id: String) -> String {
        guard let uuid = UUID(uuidString: id) else {
            return ""
        }
        
        guard let device = manager.devices.value[uuid] else {
            return ""
        }
        
        return device.connectionStatus.value.toJs
    }
    
    @objc public func deviceConnectionStatusObserve(id: String, onChanged: @escaping (String) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        return device.connectionStatus
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.toJs) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device MTU
    
    @objc public func deviceMTU(id: String) -> Int {
        guard let uuid = UUID(uuidString: id) else {
            return 0
        }
        
        guard let device = manager.devices.value[uuid] else {
            return 0
        }
        
        return device.mtu.value
    }
    
    @objc public func deviceMTUObserve(id: String, onChanged: @escaping (Int) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        return device.mtu
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0) }
            .store(in: &disposeBag)
    }

    // MARK: - Device operations
    
    @objc public func deviceConnect(id: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        try await device.connect()
    }

    @objc public func deviceDisconnect(id: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        try await device.disconnect()
    }

    @objc public func deviceDiscoverServices(id: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        try await device.discoverServices()
    }
    
    @objc public func deviceRequestMTU(id: String, mtu: Int) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        try await device.requestMTU(mtu)
    }
    
    // MARK: - Device characteristic data
    
    @objc public func deviceCharacteristicData(id: String, serviceId: String, characteristicId: String) -> Array<UInt8> {
        guard let uuid = UUID(uuidString: id)else {
            return []
        }
        
        guard let device = manager.devices.value[uuid]else {
            return []
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            return []
        }

        return characteristic.data.value.export
    }
    
    @objc public func deviceCharacteristicDataObserve(id: String, serviceId: String, characteristicId: String, onChanged: @escaping (Array<UInt8>) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            return
        }
        
        return characteristic.data
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.export) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device notify enabled
    
    @objc public func deviceCharacteristicNotifyEnabled(id: String, serviceId: String, characteristicId: String) -> Bool {
        guard let uuid = UUID(uuidString: id)else {
            return false
        }
        
        guard let device = manager.devices.value[uuid]else {
            return false
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            return false
        }

        return characteristic.isNotifying.value
    }
    
    @objc public func deviceCharacteristicNotifyEnabledObserve(id: String, serviceId: String, characteristicId: String, onChanged: @escaping (Bool) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            return
        }
        
        return characteristic.isNotifying
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0) }
            .store(in: &disposeBag)
    }

    // MARK: - Device operations
    
    @objc public func deviceCharacteristicRead(id: String, serviceId: String, characteristicId: String) async throws -> Array<UInt8> {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            throw BlueBreezeError(description: "Characteristic not found")
        }
        
        /*let data =*/ try await characteristic.read()
        return []
    }
    
    @objc public func deviceCharacteristicWrite(id: String, serviceId: String, characteristicId: String, data: Array<UInt8>, withResponse: Bool) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            throw BlueBreezeError(description: "Characteristic not found")
        }
        
        try await characteristic.write(Data(data), withResponse: withResponse)
    }
    
    @objc public func deviceCharacteristicSubscribe(id: String, serviceId: String, characteristicId: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }
        
        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            throw BlueBreezeError(description: "Characteristic not found")
        }
        
        try await characteristic.subscribe()
    }
    
    @objc public func deviceCharacteristicUnsubscribe(id: String, serviceId: String, characteristicId: String) async throws {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }
        
        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }
        
        guard let characteristic = device.getCharacteristic(serviceId: serviceId, characteristicId: characteristicId) else {
            throw BlueBreezeError(description: "Characteristic not found")
        }
        
        try await characteristic.unsubscribe()
    }
}

// MARK: - Helpers

extension BBDevice {
    func getCharacteristic(serviceId: String, characteristicId: String) -> BBCharacteristic? {
        let service = services.value.first { $0.key == BBUUID(string: serviceId)}
        let characteristic = service?.value.first { $0.id == BBUUID(string: characteristicId) }
        return characteristic
    }
}

// MARK: - Exporters

extension BBAuthorization {
    var toJs: String {
        switch self {
        case .unknown: return "unknown"
        case .authorized: return "authorized"
        case .denied: return "denied"
        }
    }
}

extension BBState {
    var toJs: String {
        switch self {
        case .unknown: return "unknown"
        case .poweredOff: return "poweredOff"
        case .poweredOn: return "poweredOn"
        case .unauthorized: return "unauthorized"
        case .unsupported: return "unsupported"
        case .resetting: return "resetting"
        }
    }
}

extension BBCharacteristicProperty {
    var toJs: String {
        switch self {
        case .read: return "read"
        case .writeWithoutResponse: return "writeWithoutResponse"
        case .writeWithResponse: return "writeWithResponse"
        case .notify: return "notify"
        }
    }
}

extension BBScanResult {
    var toJs: [String: Any] {
        [
            "id": device.id.uuidString,
            "name": device.name as Any,
            "rssi": rssi,
            "connectable": connectable,
            "advertisedServices": advertisedServices.map(\.uuidString),
            "manufacturerId": manufacturerId as Any,
            "manufacturerName": manufacturerName as Any,
            "manufacturerData": manufacturerData?.export as Any,
        ]
    }
}

extension BBDevice {
    var toJs: [String: Any] {
        [
            "id": id.uuidString,
            "name": name as Any,
        ]
    }
}

extension BBDeviceConnectionStatus {
    var toJs: String {
        switch self {
        case .connected: return "connected"
        case .disconnected: return "disconnected"
        }
    }
}

extension BBCharacteristic {
    var toJs: [String: Any] {
        [
            "id": id.uuidString,
            "name": BBConstants.knownCharacteristics[id] as Any,
            "properties": properties.map { $0.toJs }
        ]
    }
}

extension [BBCharacteristic] {
    var toJs: [[String: Any]] {
        map { $0.toJs }
    }
}

extension [BBUUID: [BBCharacteristic]] {
    var toJs: [[String: Any]] {
        map {
            [
                "id": $0.key.uuidString,
                "name": BBConstants.knownServices[$0.key] as Any,
                "characteristics": $0.value.toJs
            ]
        }
    }
}

extension Data {
    var export: Array<UInt8> {
        map { $0 }
    }
}
