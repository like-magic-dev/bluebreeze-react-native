package com.bluebreeze

import android.content.Context
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableNativeArray
import com.facebook.react.module.annotations.ReactModule
import dev.likemagic.bluebreeze.BBAuthorization
import dev.likemagic.bluebreeze.BBManager
import dev.likemagic.bluebreeze.BBState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

@ReactModule(name = BlueBreezeModule.NAME)
class BlueBreezeModule(reactContext: ReactApplicationContext) : NativeBlueBreezeSpec(reactContext) {
    val manager = BBManager(reactContext)
    val jobs: MutableList<Job> = mutableListOf()

    val context: Context
        get() = currentActivity ?: reactApplicationContext

//    NSMutableArray<NSString*>* trackedDeviceServices;
//    NSMutableArray<NSString*>* trackedDeviceConnectionStatus;
//    NSMutableArray<NSString*>* trackedDeviceMTU;
//    NSMutableArray<NSString*>* trackedDeviceCharacteristicData;
//    NSMutableArray<NSString*>* trackedDeviceCharacteristicNotifyEnabled;

    init {
        jobs.launch {
            manager.state.collect {
                emitStateEmitter(it.name)
            }
        }

        jobs.launch {
            manager.authorizationStatus.collect {
                emitAuthorizationStatusEmitter(it.export)
            }
        }

        jobs.launch {
            manager.scanEnabled.collect {
                emitScanningEnabledEmitter(it)
            }
        }

//        [impl devicesObserveOnChanged:^(NSArray<id<NSObject>> *devices) {
//            for (id device in devices) {
//            NSString* deviceId = device[@"id"];
//
//            if ([self->trackedDeviceServices indexOfObject:deviceId] == NSNotFound) {
//            [self->trackedDeviceServices addObject:deviceId];
//            [self->impl deviceServicesObserveWithId:deviceId onChanged:^(NSArray<id<NSObject>> * _Nonnull value) {
//            [self emitDeviceServicesEmitter:@{
//                @"id": deviceId,
//                @"value": value
//            }];
//
//            for (id service in value) {
//            NSString* serviceId = service[@"id"];
//            for (id characteristic in service[@"characteristics"]) {
//            NSString* characteristicId = characteristic[@"id"];
//            NSString* trackingKey = [NSString stringWithFormat:@"%@:%@:%@", deviceId, serviceId, characteristicId];
//
//            if ([self->trackedDeviceCharacteristicData indexOfObject:trackingKey] == NSNotFound) {
//            [self->trackedDeviceConnectionStatus addObject:trackingKey];
//            [self->impl deviceCharacteristicDataObserveWithId:deviceId serviceId:serviceId characteristicId:characteristicId onChanged:^(NSArray<NSNumber *> * _Nonnull value) {
//            [self emitDeviceCharacteristicDataEmitter:@{
//                @"id": deviceId,
//                @"serviceId": serviceId,
//                @"characteristicId": characteristicId,
//                @"value": value
//            }];
//        }];
//        }
//
//            if ([self->trackedDeviceCharacteristicNotifyEnabled indexOfObject:trackingKey] == NSNotFound) {
//            [self->trackedDeviceCharacteristicNotifyEnabled addObject:trackingKey];
//            [self->impl deviceCharacteristicNotifyEnabledObserveWithId:deviceId serviceId:serviceId characteristicId:characteristicId onChanged:^(BOOL value) {
//            [self emitDeviceCharacteristicNotifyEnabledEmitter:@{
//                @"id": deviceId,
//                @"serviceId": serviceId,
//                @"characteristicId": characteristicId,
//                @"value": [NSNumber numberWithBool:value]
//            }];
//        }];
//        }
//        }
//        }
//        }];
//        }
//
//            if ([self->trackedDeviceConnectionStatus indexOfObject:deviceId] == NSNotFound) {
//            [self->trackedDeviceConnectionStatus addObject:deviceId];
//            [self->impl deviceConnectionStatusObserveWithId:deviceId onChanged:^(NSString * _Nonnull value) {
//            [self emitDeviceConnectionStatusEmitter:@{
//                @"id": deviceId,
//                @"value": value
//            }];
//        }];
//        }
//
//            if ([self->trackedDeviceMTU indexOfObject:deviceId] == NSNotFound) {
//            [self->trackedDeviceMTU addObject:deviceId];
//            [self->impl deviceMTUObserveWithId:deviceId onChanged:^(NSInteger value) {
//            [self emitDeviceMTUEmitter:@{
//                @"id": deviceId,
//                @"value": [NSNumber numberWithInt:value]
//            }];
//        }];
//        }
//        }
//
//            if (self->_eventEmitterCallback != nil) {
//            [self emitDevicesEmitter:devices];
//        }
//        }];
    }

    override fun invalidate() {
        super.invalidate()

        jobs.forEach { it.cancel() }
        jobs.clear()
    }

    override fun getName(): String {
        return NAME
    }

    override fun state(): String = manager.state.value.name

    override fun authorizationStatus(): String = manager.authorizationStatus.value.export

    override fun authorizationRequest() = manager.authorizationRequest(context)

    override fun scanningEnabled(): Boolean = manager.scanEnabled.value

    override fun scanningStart() = manager.scanStart(context)

    override fun scanningStop() = manager.scanStop(context)

    override fun devices(): WritableArray {
        return WritableNativeArray()
    }

    override fun deviceServices(id: String?): WritableArray {
        return WritableNativeArray()
    }

    override fun deviceConnectionStatus(id: String?): String {
        return ""
    }

    override fun deviceMTU(id: String?): Double {
        return 0.0
    }

    override fun deviceConnect(id: String?, promise: Promise?) {
    }

    override fun deviceDisconnect(id: String?, promise: Promise?) {
    }

    override fun deviceDiscoverServices(id: String?, promise: Promise?) {
    }

    override fun deviceRequestMTU(id: String?, mtu: Double, promise: Promise?) {
    }

    override fun deviceCharacteristicData(
        id: String?,
        serviceId: String?,
        characteristicId: String?
    ): WritableArray {
        return WritableNativeArray()
    }

    override fun deviceCharacteristicNotifyEnabled(
        id: String?,
        serviceId: String?,
        characteristicId: String?
    ): Boolean {
        return false
    }

    override fun deviceCharacteristicRead(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
    }

    override fun deviceCharacteristicWrite(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        data: ReadableArray?,
        withResponse: Boolean,
        promise: Promise?
    ) {
    }

    override fun deviceCharacteristicSubscribe(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
    }

    override fun deviceCharacteristicUnsubscribe(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
    }

    companion object {
        const val NAME = "BlueBreeze"
    }
}

/// Export native values

val BBAuthorization.export: String
    get() = when(this) {
        BBAuthorization.unknown -> "unknown"
        BBAuthorization.showRationale -> "showRationale"
        BBAuthorization.authorized -> "authorized"
        BBAuthorization.denied -> "denied"
    }

val BBState.export: String
    get() = when(this) {
        BBState.unknown -> "unknown"
        BBState.poweredOff -> "poweredOff"
        BBState.poweredOn -> "poweredOn"
        BBState.unauthorized -> "unauthorized"
    }

//extension BBCharacteristicProperty {
//    var export: String {
//        switch self {
//            case .read: return "read"
//            case .writeWithoutResponse: return "writeWithoutResponse"
//            case .writeWithResponse: return "writeWithResponse"
//            case .notify: return "notify"
//        }
//    }
//}
//
//extension BBDevice {
//    var export: Dictionary<String, Any> {
//        var result: Dictionary<String, Any> = [
//            "id": id.uuidString,
//        "rssi": rssi,
//        "isConnectable": isConnectable,
//        "advertisedServices": advertisedServices.map(\.uuidString),
//        ]
//
//        if let name {
//            result["name"] = name
//        }
//
//        if let manufacturerId {
//            result["manufacturerId"] = manufacturerId
//        }
//
//        if let manufacturerName {
//            result["manufacturerName"] = manufacturerName
//        }
//
//        if let manufacturerData {
//            result["manufacturerData"] = manufacturerData.export
//        }
//
//        return result;
//    }
//
//    func getCharacteristic(serviceId: String, characteristicId: String) -> BBCharacteristic? {
//        let service = services.value.first { $0.key == BBUUID(string: serviceId)}
//        let characteristic = service?.value.first { $0.id == BBUUID(string: characteristicId) }
//        return characteristic
//    }
//}
//
//extension BBDeviceConnectionStatus {
//    var export: String {
//        switch self {
//            case .connected: return "connected"
//            case .disconnected: return "disconnected"
//        }
//    }
//}
//
//extension BBCharacteristic {
//    var export: Dictionary<String, Any> {
//        var result: Dictionary<String, Any> = [
//            "id": id.uuidString,
//        "properties": properties.map { $0.export }
//        ]
//
//        if let name = BBConstants.knownCharacteristics[id] {
//            result["name"] = name
//        }
//
//        return result
//    }
//}
//
//extension [BBUUID: [BBCharacteristic]] {
//    var export: [Dictionary<String, Any>] {
//        return map { element in
//            var result: Dictionary<String, Any> = [
//                "id": element.key.uuidString,
//            "characteristics": element.value.map { $0.export }
//            ]
//
//            if let name = BBConstants.knownServices[element.key] {
//                result["name"] = name
//            }
//
//            return result
//        }
//    }
//}
//
//extension Data {
//    var export: Array<UInt8> {
//        return map { $0 }
//    }
//}

/// Functions to store jobs

fun Job.storeIn(list: MutableList<Job>) = list.add(this)

fun MutableList<Job>.launch(block: suspend CoroutineScope.() -> Unit) =
    CoroutineScope(Dispatchers.IO)
        .launch(block = block)
        .storeIn(this)
