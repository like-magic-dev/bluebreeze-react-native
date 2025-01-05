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
  
  @objc public func authorizationStatus() -> String {
    return manager.authorizationStatus.value.name
  }
  
  @objc public func authorizationStatusObserve(onChanged: @escaping (String) -> Void) {
    manager.authorizationStatus
      .receive(on: DispatchQueue.main)
      .sink { onChanged($0.name) }
      .store(in: &disposeBag)
  }
  
  @objc public func authorizationRequest() {
    manager.authorizationRequest()
  }
  
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
}

extension BBAuthorization {
  var name: String {
    switch self {
    case .unknown: return "unknown"
    case .authorized: return "authorized"
    case .denied: return "denied"
    }
  }
}
