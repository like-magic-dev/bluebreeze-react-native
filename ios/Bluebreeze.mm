#import "BlueBreeze.h"
#import "react_native_bluebreeze-Swift.h"

@implementation BlueBreeze {
    BlueBreezeImpl* impl;
    NSMutableArray<NSString*>* trackedDeviceServices;
    NSMutableArray<NSString*>* trackedDeviceConnectionStatus;
    NSMutableArray<NSString*>* trackedDeviceMTU;
    NSMutableArray<NSString*>* trackedDeviceCharacteristicData;
    NSMutableArray<NSString*>* trackedDeviceCharacteristicNotifyEnabled;
}

- (instancetype) init {
    self = [super init];
    if (self) {
        impl = [[BlueBreezeImpl alloc] initWithStateObserve:^(NSString * _Nonnull status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitStateEmitter:status];
            }
        } authorizationObserve:^(NSString * _Nonnull status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitAuthorizationStatusEmitter:status];
            }
        } scanEnabledObserve:^(BOOL status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitScanEnabledEmitter:status];
            }
        } scanResultsObserve:^(NSDictionary<NSString *,id> * _Nonnull scanResult) {
            if (self->_eventEmitterCallback != nil) {
                [self emitScanResultEmitter:scanResult];
            }
        } devicesObserve:^(NSArray<id<NSObject>> *devices) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDevicesEmitter:devices];
            }
        } deviceConnectionStatusObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull value) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDeviceConnectionStatusEmitter:@{
                    @"id": deviceId,
                    @"value": value
                }];
            }
        } deviceServicesObserve:^(NSString * _Nonnull deviceId, NSArray<NSDictionary<NSString *,id> *> * _Nonnull value) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDeviceServicesEmitter:@{
                    @"id": deviceId,
                    @"value": value
                }];
            }
        } deviceMTUObserve:^(NSString * _Nonnull deviceId, NSInteger value) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDeviceMTUEmitter:@{
                    @"id": deviceId,
                    @"value": [NSNumber numberWithInt:value]
                }];
            }
        } deviceCharacteristicDataObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull serviceId, NSString * _Nonnull characteristicId, NSArray<NSNumber *> * _Nonnull value) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDeviceCharacteristicDataEmitter:@{
                    @"id": deviceId,
                    @"serviceId": serviceId,
                    @"characteristicId": characteristicId,
                    @"value": value
                }];
            }
        } deviceCharacteristicNotifyEnabledObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull serviceId, NSString * _Nonnull characteristicId, BOOL value) {
            if (self->_eventEmitterCallback != nil) {
                [self emitDeviceCharacteristicNotifyEnabledEmitter:@{
                    @"id": deviceId,
                    @"serviceId": serviceId,
                    @"characteristicId": characteristicId,
                    @"value": [NSNumber numberWithBool:value]
                }];
            }
        }];
        
        trackedDeviceServices = [NSMutableArray new];
        trackedDeviceConnectionStatus = [NSMutableArray new];
        trackedDeviceMTU = [NSMutableArray new];
        
        trackedDeviceCharacteristicData = [NSMutableArray new];
        trackedDeviceCharacteristicNotifyEnabled = [NSMutableArray new];
        
        [impl initialize];
    }
    return self;
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBlueBreezeSpecJSI>(params);
}

// MARK: - State

- (NSString *)state {
    return [impl state];
}

// MARK: - Authorization

- (NSString *)authorizationStatus {
    return [impl authorizationStatus];
}

- (void)authorizationRequest {
    [impl authorizationRequest];
}

- (void)authorizationOpenSettings {
    [impl authorizationOpenSettings];
}

// MARK: - Scan

- (NSNumber *)scanEnabled {
    return [NSNumber numberWithBool:[impl scanEnabled]];
}

- (void)scanStart:(NSArray *)ids {
    [impl scanStart:ids];
}

- (void)scanStop {
    [impl scanStop];
}

// MARK: - Devices

- (NSArray<id<NSObject>> *)devices {
    return [impl devices];
}

// MARK: - Device services

- (NSArray<id<NSObject>> *)deviceServices:(NSString *)id {
    return [impl deviceServicesWithId:id];
}

// MARK: - Device connection status

- (NSString*)deviceConnectionStatus:(NSString *)id {
    return [impl deviceConnectionStatusWithId:id];
}

// MARK: - Device MTU

- (NSNumber *)deviceMTU:(NSString *)id {
    return [NSNumber numberWithInt:[impl deviceMTUWithId:id]];
}

// MARK: - Device operations

- (void)deviceConnect:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceConnectWithId:id completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

- (void)deviceDisconnect:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceDisconnectWithId:id completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

- (void)deviceDiscoverServices:(NSString *)id resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceDiscoverServicesWithId:id completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

- (void)deviceRequestMTU:(NSString *)id mtu:(double)mtu resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceRequestMTUWithId:id mtu:mtu completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

// MARK: - Device characteristic data

- (NSArray<NSNumber *> *)deviceCharacteristicData:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId {
    return [impl deviceCharacteristicDataWithId:id
                                      serviceId:serviceId
                               characteristicId:characteristicId
    ];
}

// MARK: - Device characteristic notify enabled

- (NSNumber *)deviceCharacteristicNotifyEnabled:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId {
    return [NSNumber numberWithBool:[impl deviceCharacteristicNotifyEnabledWithId:id
                                                                        serviceId:serviceId
                                                                 characteristicId:characteristicId
                                    ]];
}

// MARK: - Device characteristic operations

- (void)deviceCharacteristicRead:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceCharacteristicReadWithId:id
                               serviceId:serviceId
                        characteristicId:characteristicId
                       completionHandler:^(NSArray<NSNumber *> * _Nullable value, NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(value);
        }
    }];
}

- (void)deviceCharacteristicWrite:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId data:(NSArray *)data withResponse:(BOOL)withResponse resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceCharacteristicWriteWithId:id
                                serviceId:serviceId
                         characteristicId:characteristicId
                                     data:data
                             withResponse:withResponse
                        completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

- (void)deviceCharacteristicSubscribe:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceCharacteristicSubscribeWithId:id
                                    serviceId:serviceId
                             characteristicId:characteristicId
                            completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

- (void)deviceCharacteristicUnsubscribe:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId resolve:(RCTPromiseResolveBlock)resolve reject:(RCTPromiseRejectBlock)reject {
    [impl deviceCharacteristicUnsubscribeWithId:id
                                      serviceId:serviceId
                               characteristicId:characteristicId
                              completionHandler:^(NSError * _Nullable error) {
        if (error != nil) {
            reject([@([error code]) stringValue], [error description], error);
        } else {
            resolve(nil);
        }
    }];
}

@end

