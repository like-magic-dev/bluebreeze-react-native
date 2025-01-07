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

    // MARK: - Authorization

    @objc public func authorizationStatus() -> String {
        return manager.authorizationStatus.value.export
    }

    @objc public func authorizationStatusObserve(onChanged: @escaping (String) -> Void) {
        manager.authorizationStatus
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.export) }
            .store(in: &disposeBag)
    }

    @objc public func authorizationRequest() {
        manager.authorizationRequest()
    }

    // MARK: - State

    @objc public func state() -> String {
        return manager.state.value.export
    }

    @objc public func stateObserve(onChanged: @escaping (String) -> Void) {
        manager.state
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.export) }
            .store(in: &disposeBag)
    }

    // MARK: - Scanning

    @objc public func scanningEnabled() -> Bool {
        return manager.isScanning.value
    }

    @objc public func scanningEnabledObserve(onChanged: @escaping (Bool) -> Void) {
        return manager.isScanning
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0) }
            .store(in: &disposeBag)
    }

    @objc public func scanningStart() {
        manager.scanningStart()
    }

    @objc public func scanningStop() {
        manager.scanningStop()
    }

    // MARK: - Devices

    @objc public func devices() -> [NSDictionary] {
        return manager.devices.value.values.map { $0.export }
    }

    @objc public func devicesObserve(onChanged: @escaping ([NSDictionary]) -> Void) {
        return manager.devices
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.values.map { $0.export }) }
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
        
        return device.connectionStatus.value.export
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
            .sink { onChanged($0.export) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device services
    
    @objc public func deviceServices(id: String) -> [NSDictionary] {
        guard let uuid = UUID(uuidString: id) else {
            return []
        }
        
        guard let device = manager.devices.value[uuid] else {
            return []
        }
        
        return device.services.value.export
    }
    
    @objc public func deviceServicesObserve(id: String, onChanged: @escaping ([NSDictionary]) -> Void) {
        guard let uuid = UUID(uuidString: id) else {
            return
        }
        
        guard let device = manager.devices.value[uuid] else {
            return
        }
        
        return device.services
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.export) }
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
}

extension BBAuthorization {
    var export: String {
        switch self {
        case .unknown: return "unknown"
        case .authorized: return "authorized"
        case .denied: return "denied"
        }
    }
}

extension BBState {
    var export: String {
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

extension BBDevice {
    var export: NSDictionary {
        return [
            "id": id.uuidString,
            "name": name,
            "rssi": rssi
        ]
    }
}

extension BBDeviceConnectionStatus {
    var export: String {
        switch self {
        case .connected: return "connected"
        case .disconnected: return "disconnected"
        }
    }
}

extension BBCharacteristic {
    var export: NSDictionary {
        return [
            "id": id.uuidString,
            "name": BBConstants.knownCharacteristics[id] ?? id.uuidString
        ]
    }
}

extension [BBUUID: [BBCharacteristic]] {
    var export: [NSDictionary] {
        return map { element in
            [
                "id": element.key.uuidString,
                "name": BBConstants.knownServices[element.key] ?? element.key.uuidString,
                "characteristics": element.value.map { $0.export }
            ]
        }
    }
}
