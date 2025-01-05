#import "BlueBreeze.h"
#import "react_native_bluebreeze-Swift.h"

@implementation BlueBreeze {
  BlueBreezeImpl* impl;
}

- (instancetype) init {
  self = [super init];
  if (self) {
    impl = [BlueBreezeImpl new];
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

@end
