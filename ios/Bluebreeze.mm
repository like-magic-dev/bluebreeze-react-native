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
        impl = [BlueBreezeImpl new];
    }
    return self;
}

// MARK: - Initialization and deinitialization

typedef void (^EmitterCallback)();

- (void)wrapEventEmitter:(EmitterCallback)callback {
    if (self->_eventEmitterCallback != nil) {
        callback();
    }
}

- (void)initialize {
    [impl subscribeWithStateObserve:^(NSString * _Nonnull status) {
        [self wrapEventEmitter:^{
            [self emitStateEmitter:status];
        }];
    } authorizationObserve:^(NSString * _Nonnull status) {
        [self wrapEventEmitter:^{
            [self emitAuthorizationStatusEmitter:status];
        }];
    } scanEnabledObserve:^(BOOL status) {
        [self wrapEventEmitter:^{
            [self emitScanEnabledEmitter:status];
        }];
    } scanResultsObserve:^(NSDictionary<NSString *,id> * _Nonnull scanResult) {
        [self wrapEventEmitter:^{
            [self emitScanResultEmitter:scanResult];
        }];
    } devicesObserve:^(NSArray<id<NSObject>> *devices) {
        [self wrapEventEmitter:^{
            [self emitDevicesEmitter:devices];
        }];
    } deviceConnectionStatusObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull value) {
        [self wrapEventEmitter:^{
            [self emitDeviceConnectionStatusEmitter:@{
                @"id": deviceId,
                @"value": value
            }];
        }];
    } deviceServicesObserve:^(NSString * _Nonnull deviceId, NSArray<NSDictionary<NSString *,id> *> * _Nonnull value) {
        [self wrapEventEmitter:^{
            [self emitDeviceServicesEmitter:@{
                @"id": deviceId,
                @"value": value
            }];
        }];
    } deviceMTUObserve:^(NSString * _Nonnull deviceId, NSInteger value) {
        [self wrapEventEmitter:^{
            [self emitDeviceMTUEmitter:@{
                @"id": deviceId,
                @"value": [NSNumber numberWithInt:value]
            }];
        }];
    } deviceCharacteristicDataObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull serviceId, NSString * _Nonnull characteristicId, NSArray<NSNumber *> * _Nonnull value) {
        [self wrapEventEmitter:^{
            [self emitDeviceCharacteristicDataEmitter:@{
                @"id": deviceId,
                @"serviceId": serviceId,
                @"characteristicId": characteristicId,
                @"value": value
            }];
        }];
    } deviceCharacteristicNotifyEnabledObserve:^(NSString * _Nonnull deviceId, NSString * _Nonnull serviceId, NSString * _Nonnull characteristicId, BOOL value) {
        [self wrapEventEmitter:^{
            [self emitDeviceCharacteristicNotifyEnabledEmitter:@{
                @"id": deviceId,
                @"serviceId": serviceId,
                @"characteristicId": characteristicId,
                @"value": [NSNumber numberWithBool:value]
            }];
        }];
    }];
    
}

- (void)invalidate {
    [impl unsubscribe];
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBlueBreezeSpecJSI>(params);
}

- (void)setEventEmitterCallback:(EventEmitterCallbackWrapper *)eventEmitterCallbackWrapper {
    [super setEventEmitterCallback:eventEmitterCallbackWrapper];
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

