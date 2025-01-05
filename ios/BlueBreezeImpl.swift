//
//  BlueBreeze.swift
//  react-native-bluebreeze
//
//  Created by Alessandro Mulloni on 03.01.25.
//

import Foundation
import Combine
import BlueBreeze

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
  
  @objc public func devices() -> [NSDictionary] {
    return manager.devices.value.values.map { $0.export }
  }
  
  @objc public func devicesObserve(onChanged: @escaping ([NSDictionary]) -> Void) {
    return manager.devices
      .receive(on: DispatchQueue.main)
      .sink { onChanged($0.values.map { $0.export }) }
      .store(in: &disposeBag)
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
      "name": name
    ]
  }
}
