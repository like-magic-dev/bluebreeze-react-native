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
    var disposeBagDevices: [UUID: Set<AnyCancellable>] = [:]
    var disposeBagServices: [UUID: [BBUUID: [BBUUID: Set<AnyCancellable>]]] = [:]

    let manager = BBManager()
    
    var stateObserve: ((String) -> Void)?
    var authorizationObserve: ((String) -> Void)?
    var scanResultsObserve: (([String: Any]) -> Void)?
    var scanEnabledObserve: ((Bool) -> Void)?
    var devicesObserve: (([[String: Any]]) -> Void)?
    var deviceConnectionStatusObserve: ((String, String) -> Void)?
    var deviceServicesObserve: ((String, [[String: Any]]) -> Void)?
    var deviceMTUObserve: ((String, Int) -> Void)?
    var deviceCharacteristicDataObserve: ((String, String, String, Array<UInt8>) -> Void)?
    var deviceCharacteristicNotifyEnabledObserve: ((String, String, String, Bool) -> Void)?
    var deviceCharacteristicNotificationsObserve: ((String, String, String, Array<UInt8>) -> Void)?

    @objc public func subscribe(
        stateObserve: (@escaping (String) -> Void),
        authorizationObserve: (@escaping (String) -> Void),
        scanEnabledObserve: (@escaping (Bool) -> Void),
        scanResultsObserve: (@escaping ([String: Any]) -> Void),
        devicesObserve: (@escaping ([[String: Any]]) -> Void),
        deviceConnectionStatusObserve: (@escaping (String, String) -> Void),
        deviceServicesObserve: (@escaping (String, [[String: Any]]) -> Void),
        deviceMTUObserve: (@escaping (String, Int) -> Void),
        deviceCharacteristicDataObserve: (@escaping (String, String, String, Array<UInt8>) -> Void),
        deviceCharacteristicNotifyEnabledObserve: (@escaping (String, String, String, Bool) -> Void),
        deviceCharacteristicNotificationsObserve: (@escaping (String, String, String, Array<UInt8>) -> Void)
    ) {
        self.stateObserve = stateObserve
        self.authorizationObserve = authorizationObserve
        self.scanEnabledObserve = scanEnabledObserve
        self.scanResultsObserve = scanResultsObserve
        self.devicesObserve = devicesObserve
        self.deviceConnectionStatusObserve = deviceConnectionStatusObserve
        self.deviceServicesObserve = deviceServicesObserve
        self.deviceMTUObserve = deviceMTUObserve
        self.deviceCharacteristicDataObserve = deviceCharacteristicDataObserve
        self.deviceCharacteristicNotifyEnabledObserve = deviceCharacteristicNotifyEnabledObserve
        self.deviceCharacteristicNotificationsObserve = deviceCharacteristicNotificationsObserve

        manager.state
            .receive(on: DispatchQueue.main)
            .sink { self.stateObserve?($0.toJs) }
            .store(in: &disposeBag)
        
        manager.authorizationStatus
            .receive(on: DispatchQueue.main)
            .sink { self.authorizationObserve?($0.toJs) }
            .store(in: &disposeBag)
        
        manager.scanEnabled
            .receive(on: DispatchQueue.main)
            .sink { self.scanEnabledObserve?($0) }
            .store(in: &disposeBag)
        
        manager.scanResults
            .receive(on: DispatchQueue.main)
            .sink { self.scanResultsObserve?($0.toJs) }
            .store(in: &disposeBag)
        
        manager.devices
            .receive(on: DispatchQueue.main)
            .sink {
                $0.forEach { (id, device) in
                    self.subscribeDevice(device)
                }
                self.devicesObserve?($0.values.map { $0.toJs })
            }
            .store(in: &disposeBag)
    }
    
    private func subscribeDevice(_ device: BBDevice) {
        guard disposeBagDevices[device.id] == nil else {
            return
        }

        disposeBagDevices[device.id] = []

        device.connectionStatus
            .receive(on: DispatchQueue.main)
            .sink { self.deviceConnectionStatusObserve?(device.id.toJs, $0.toJs) }
            .store(in: &disposeBagDevices[device.id]!)

        device.services
            .receive(on: DispatchQueue.main)
            .sink {
                self.subscribeServices(device, $0)
                self.deviceServicesObserve?(device.id.toJs, $0.toJs)
            }
            .store(in: &disposeBagDevices[device.id]!)

        device.mtu
            .receive(on: DispatchQueue.main)
            .sink { self.deviceMTUObserve?(device.id.toJs, $0) }
            .store(in: &disposeBagDevices[device.id]!)
    }

    private func subscribeServices(_ device: BBDevice, _ services: [BBService]) {
        // Clean up device data by removing missing services
        disposeBagServices[device.id] =
            disposeBagServices[device.id]?.filter({ key, value in
                services.contains(where: { $0.uuid == key })
            }) ?? [:]

        // Init all existing services
        services.forEach { service in
            let serviceId = service.uuid

            // Clean up service data by removing missing characteristics
            disposeBagServices[device.id]![serviceId] =
                disposeBagServices[device.id]![serviceId]?.filter({ key, _ in
                    service.characteristics.first(where: { $0.uuid == key }) != nil
                }) ?? [:]

            // Init all existing characteristics
            service.characteristics.forEach { characteristic in
                guard disposeBagServices[device.id]![serviceId]![characteristic.uuid] == nil else {
                    return
                }

                disposeBagServices[device.id]![serviceId]![characteristic.uuid] = []

                characteristic.data
                    .receive(on: DispatchQueue.main)
                    .sink {
                        self.deviceCharacteristicDataObserve?(
                            device.id.toJs,
                            serviceId.toJs,
                            characteristic.uuid.toJs,
                            $0?.toJs ?? []
                        )
                    }
                    .store(in: &disposeBagServices[device.id]![serviceId]![characteristic.uuid]!)

                characteristic.isNotifying
                    .receive(on: DispatchQueue.main)
                    .sink {
                        self.deviceCharacteristicNotifyEnabledObserve?(
                            device.id.toJs,
                            serviceId.toJs,
                            characteristic.uuid.toJs,
                            $0
                        )
                    }
                    .store(in: &disposeBagServices[device.id]![serviceId]![characteristic.uuid]!)

                characteristic.notifications
                    .receive(on: DispatchQueue.main)
                    .sink {
                        self.deviceCharacteristicNotificationsObserve?(
                            device.id.toJs,
                            serviceId.toJs,
                            characteristic.uuid.toJs,
                            $0.toJs
                        )
                    }
                    .store(in: &disposeBagServices[device.id]![serviceId]![characteristic.uuid]!)
            }
        }
    }
    
    @objc public func unsubscribe() {
        disposeBagServices = [:]
        disposeBagDevices = [:]
        disposeBag = []

        self.stateObserve = nil
        self.authorizationObserve = nil
        self.scanEnabledObserve = nil
        self.scanResultsObserve = nil
        self.devicesObserve = nil
        self.deviceConnectionStatusObserve = nil
        self.deviceServicesObserve = nil
        self.deviceMTUObserve = nil
        self.deviceCharacteristicDataObserve = nil
        self.deviceCharacteristicNotifyEnabledObserve = nil
    }

    // MARK: - State

    @objc public func state() -> String {
        return manager.state.value.toJs
    }

    // MARK: - Authorization

    @objc public func authorizationStatus() -> String {
        return manager.authorizationStatus.value.toJs
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

    @objc public func scanStart(_ ids: [String]?) {
        let serviceUuids = ids?.map { BBUUID(string: $0) }
        manager.scanStart(serviceUuids: serviceUuids)
    }

    @objc public func scanStop() {
        manager.scanStop()
    }

    // MARK: - Devices

    @objc public func devices() -> [[String: Any]] {
        return manager.devices.value.values.map { $0.toJs }
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
    
    @objc public func deviceRequestMTU(id: String, mtu: Int) async throws -> Int {
        guard let uuid = UUID(uuidString: id) else {
            throw BlueBreezeError(description: "Invalid UUID")
        }

        guard let device = manager.devices.value[uuid] else {
            throw BlueBreezeError(description: "Device not found")
        }

        // CoreBluetooth has no API to request a specific MTU value. negotiateMTU() only reads
        // back whatever value it auto-negotiated on connect, so `mtu` is ignored on iOS.
        try await device.negotiateMTU()

        return device.mtu.value
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

        return characteristic.data.value?.toJs ?? []
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
        
        let data = try await characteristic.read()
        return data?.toJs ?? []
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
        let service = services.value.first { $0.uuid == BBUUID(string: serviceId) }
        let characteristic = service?.characteristics.first { $0.uuid == BBUUID(string: characteristicId) }
        return characteristic
    }
}

// MARK: - Exporters

extension UUID {
    var toJs: String {
        return uuidString
    }
}

extension BBUUID {
    var toJs: String {
        return uuidString
    }
}

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
            "manufacturerData": manufacturerData?.toJs as Any,
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
            "id": uuid.uuidString,
            "name": BBAssignedNumbers.characteristicUUIDs[uuid] as Any,
            "properties": properties.map { $0.toJs }
        ]
    }
}

extension [BBCharacteristic] {
    var toJs: [[String: Any]] {
        map { $0.toJs }
    }
}

extension [BBService] {
    var toJs: [[String: Any]] {
        map {
            [
                "id": $0.uuid.uuidString,
                "name": BBAssignedNumbers.serviceUUIDs[$0.uuid] as Any,
                "characteristics": $0.characteristics.toJs
            ]
        }
    }
}

extension Data {
    var toJs: Array<UInt8> {
        map { $0 }
    }
}
