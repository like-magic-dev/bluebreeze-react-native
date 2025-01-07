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
        
        trackedDeviceConnectionStatus = [NSMutableArray new];
        trackedDeviceServices = [NSMutableArray new];
        trackedDeviceMTU = [NSMutableArray new];
        
        trackedDeviceCharacteristicData = [NSMutableArray new];
        trackedDeviceCharacteristicNotifyEnabled = [NSMutableArray new];

        [impl authorizationStatusObserveOnChanged:^(NSString * _Nonnull status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitAuthorizationStatusEmitter:status];
            }
        }];
        [impl stateObserveOnChanged:^(NSString * _Nonnull status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitStateEmitter:status];
            }
        }];
        [impl scanningEnabledObserveOnChanged:^(BOOL status) {
            if (self->_eventEmitterCallback != nil) {
                [self emitScanningEnabledEmitter:status];
            }
        }];
        [impl devicesObserveOnChanged:^(NSArray<id<NSObject>> *devices) {
            for (id device in devices) {
                NSString* deviceId = device[@"id"];

                if ([self->trackedDeviceServices indexOfObject:deviceId] == NSNotFound) {
                    [self->trackedDeviceServices addObject:deviceId];
                    [self->impl deviceServicesObserveWithId:deviceId onChanged:^(NSArray<id<NSObject>> * _Nonnull value) {
                        [self emitDeviceServicesEmitter:@{
                            @"id": deviceId,
                            @"value": value
                        }];
                        
                        for (id service in value) {
                            NSString* serviceId = service[@"id"];
                            for (id characteristic in service[@"characteristics"]) {
                                NSString* characteristicId = characteristic[@"id"];
                                NSString* trackingKey = [NSString stringWithFormat:@"%@:%@:%@", deviceId, serviceId, characteristicId];
                                
                                if ([self->trackedDeviceCharacteristicData indexOfObject:trackingKey] == NSNotFound) {
                                    [self->trackedDeviceConnectionStatus addObject:trackingKey];
                                    [self->impl deviceCharacteristicDataObserveWithId:deviceId serviceId:serviceId characteristicId:characteristicId onChanged:^(NSArray<NSNumber *> * _Nonnull value) {
                                        [self emitDeviceCharacteristicDataEmitter:@{
                                            @"id": deviceId,
                                            @"serviceId": serviceId,
                                            @"characteristicId": characteristicId,
                                            @"value": value
                                        }];
                                    }];
                                }
                                
                                if ([self->trackedDeviceCharacteristicNotifyEnabled indexOfObject:trackingKey] == NSNotFound) {
                                    [self->trackedDeviceCharacteristicNotifyEnabled addObject:trackingKey];
                                    [self->impl deviceCharacteristicNotifyEnabledObserveWithId:deviceId serviceId:serviceId characteristicId:characteristicId onChanged:^(BOOL value) {
                                        [self emitDeviceCharacteristicNotifyEnabledEmitter:@{
                                            @"id": deviceId,
                                            @"serviceId": serviceId,
                                            @"characteristicId": characteristicId,
                                            @"value": [NSNumber numberWithBool:value]
                                        }];
                                    }];
                                }
                            }
                        }
                    }];
                }
                
                if ([self->trackedDeviceConnectionStatus indexOfObject:deviceId] == NSNotFound) {
                    [self->trackedDeviceConnectionStatus addObject:deviceId];
                    [self->impl deviceConnectionStatusObserveWithId:deviceId onChanged:^(NSString * _Nonnull value) {
                        [self emitDeviceConnectionStatusEmitter:@{
                            @"id": deviceId,
                            @"value": value
                        }];
                    }];
                }

                if ([self->trackedDeviceMTU indexOfObject:deviceId] == NSNotFound) {
                    [self->trackedDeviceMTU addObject:deviceId];
                    [self->impl deviceMTUObserveWithId:deviceId onChanged:^(NSInteger value) {
                        [self emitDeviceMTUEmitter:@{
                            @"id": deviceId,
                            @"value": [NSNumber numberWithInt:value]
                        }];
                    }];
                }
            }
            
            if (self->_eventEmitterCallback != nil) {
                [self emitDevicesEmitter:devices];
            }
        }];
    }
    return self;
}

RCT_EXPORT_MODULE()

- (std::shared_ptr<facebook::react::TurboModule>)getTurboModule:
(const facebook::react::ObjCTurboModule::InitParams &)params
{
    return std::make_shared<facebook::react::NativeBlueBreezeSpecJSI>(params);
}

- (NSString *)authorizationStatus {
    return [impl authorizationStatus];
}

- (void)authorizationRequest {
    [impl authorizationRequest];
}

- (NSString *)state {
    return [impl state];
}

- (NSNumber *)scanningEnabled {
    return [NSNumber numberWithBool:[impl scanningEnabled]];
}

- (void)scanningStart {
    [impl scanningStart];
}

- (void)scanningStop {
    [impl scanningStop];
}

- (NSArray<id<NSObject>> *)devices {
    return [impl devices];
}

- (NSArray<id<NSObject>> *)deviceServices:(NSString *)id {
    return [impl deviceServicesWithId:id];
}

- (NSString*)deviceConnectionStatus:(NSString *)id {
    return [impl deviceConnectionStatusWithId:id];
}

- (NSNumber *)deviceMTU:(NSString *)id {
    return [NSNumber numberWithInt:[impl deviceMTUWithId:id]];
}

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

- (NSArray<NSNumber *> *)deviceCharacteristicData:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId {
    return [impl deviceCharacteristicDataWithId:id
                                      serviceId:serviceId
                               characteristicId:characteristicId
    ];
}

- (NSNumber *)deviceCharacteristicNotifyEnabled:(NSString *)id serviceId:(NSString *)serviceId characteristicId:(NSString *)characteristicId {
    return [NSNumber numberWithBool:[impl deviceCharacteristicNotifyEnabledWithId:id
                                                                        serviceId:serviceId
                                                                 characteristicId:characteristicId
    ]];
}


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

