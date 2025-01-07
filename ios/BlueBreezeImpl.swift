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

    @objc public func devices() -> [Dictionary<String, Any>] {
        return manager.devices.value.values.map { $0.export }
    }

    @objc public func devicesObserve(onChanged: @escaping ([Dictionary<String, Any>]) -> Void) {
        return manager.devices
            .receive(on: DispatchQueue.main)
            .sink { onChanged($0.values.map { $0.export }) }
            .store(in: &disposeBag)
    }
    
    // MARK: - Device services
    
    @objc public func deviceServices(id: String) -> [Dictionary<String, Any>] {
        guard let uuid = UUID(uuidString: id) else {
            return []
        }
        
        guard let device = manager.devices.value[uuid] else {
            return []
        }
        
        return device.services.value.export
    }
    
    @objc public func deviceServicesObserve(id: String, onChanged: @escaping ([Dictionary<String, Any>]) -> Void) {
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
    var export: Dictionary<String, Any> {
        var result: Dictionary<String, Any> = [
            "id": id.uuidString,
            "rssi": rssi,
            "isConnectable": isConnectable,
            "advertisedServices": advertisedServices.map(\.uuidString),
        ]
        
        if let name {
            result["name"] = name
        }
        
        if let manufacturerId {
            result["manufacturerId"] = manufacturerId
        }
        
        if let manufacturerName {
            result["manufacturerName"] = manufacturerName
        }
        
        if let manufacturerData {
            result["manufacturerData"] = manufacturerData.export
        }
        
        return result;
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
    var export: Dictionary<String, Any> {
        var result: Dictionary<String, Any> = [
            "id": id.uuidString
        ]
        
        if let name = BBConstants.knownCharacteristics[id] {
            result["name"] = name
        }

        return result
    }
}

extension [BBUUID: [BBCharacteristic]] {
    var export: [Dictionary<String, Any>] {
        return map { element in
            var result: Dictionary<String, Any> = [
                "id": element.key.uuidString,
                "characteristics": element.value.map { $0.export }
            ]
            
            if let name = BBConstants.knownServices[element.key] {
                result["name"] = name
            }
            
            return result
        }
    }
}

extension Data {
    var export: Array<UInt8> {
        return map { $0 }
    }
}
