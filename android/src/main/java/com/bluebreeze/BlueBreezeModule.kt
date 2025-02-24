package com.bluebreeze

import android.content.Context
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import dev.likemagic.bluebreeze.BBAuthorization
import dev.likemagic.bluebreeze.BBCharacteristic
import dev.likemagic.bluebreeze.BBCharacteristicProperty
import dev.likemagic.bluebreeze.BBDevice
import dev.likemagic.bluebreeze.BBDeviceConnectionStatus
import dev.likemagic.bluebreeze.BBManager
import dev.likemagic.bluebreeze.BBScanResult
import dev.likemagic.bluebreeze.BBService
import dev.likemagic.bluebreeze.BBState
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.flow.FlowCollector
import kotlinx.coroutines.flow.SharedFlow
import kotlinx.coroutines.launch

@ReactModule(name = BlueBreezeModule.NAME)
class BlueBreezeModule(reactContext: ReactApplicationContext) : NativeBlueBreezeSpec(reactContext) {
    val manager = BBManager(reactContext)
    val jobs: MutableList<Job> = mutableListOf()

    val context: Context
        get() = currentActivity ?: reactApplicationContext

    private val trackedDeviceServices = mutableSetOf<String>()
    private val trackedDeviceConnectionStatus = mutableSetOf<String>()
    private val trackedDeviceMTU = mutableSetOf<String>()
    private val trackedDeviceCharacteristicData = mutableSetOf<String>()
    private val trackedDeviceCharacteristicNotifyEnabled = mutableSetOf<String>()

    init {
        // State

        manager.state.collectAsync {
            emitStateEmitter(it.name)
        }.storeIn(jobs)

        // Authorization

        manager.authorizationStatus.collectAsync {
            emitAuthorizationStatusEmitter(it.toJs)
        }.storeIn(jobs)

        // Scanning

        manager.scanEnabled.collectAsync {
            emitScanEnabledEmitter(it)
        }.storeIn(jobs)

        manager.scanResults.collectAsync {
            emitScanResultEmitter(it.toJs)
        }.storeIn(jobs)

        // Devices

        manager.devices.collectAsync { devices ->
            emitDevicesEmitter(
                devices.map { it.value.toJs }.writableArray
            )

            for ((deviceId, device) in devices) {
                // Device services
                if (trackedDeviceServices.contains(deviceId).not()) {
                    trackedDeviceServices.add(deviceId)
                    device.services.collectAsync { services ->
                        emitDeviceServicesEmitter(
                            writableMapOf(
                                "id" to deviceId,
                                "value" to services
                            )
                        )

                        services.forEach { service ->
                            val serviceId = service.uuid
                            service.characteristics.forEach { characteristic ->
                                val characteristicId = characteristic.uuid
                                val trackingKey = "${deviceId}:${serviceId}:${characteristicId}"

                                // Device characteristic data
                                if (trackedDeviceCharacteristicData.contains(trackingKey).not()) {
                                    trackedDeviceCharacteristicData.add(trackingKey)
                                    characteristic.data.collectAsync { value ->
                                        emitDeviceCharacteristicDataEmitter(
                                            writableMapOf(
                                                "id" to deviceId,
                                                "serviceId" to serviceId,
                                                "characteristicId" to characteristicId,
                                                "value" to value
                                            )
                                        )
                                    }
                                }

                                // Device characteristic notify enabled
                                if (trackedDeviceCharacteristicNotifyEnabled.contains(trackingKey)
                                        .not()
                                ) {
                                    trackedDeviceCharacteristicNotifyEnabled.add(trackingKey)
                                    characteristic.isNotifying.collectAsync { value ->
                                        emitDeviceCharacteristicNotifyEnabledEmitter(
                                            writableMapOf(
                                                "id" to deviceId,
                                                "serviceId" to serviceId,
                                                "characteristicId" to characteristicId,
                                                "value" to value
                                            )
                                        )
                                    }
                                }
                            }
                        }
                    }
                }

                // Device connection status
                if (trackedDeviceConnectionStatus.contains(deviceId).not()) {
                    trackedDeviceConnectionStatus.add(deviceId)
                    device.connectionStatus.collectAsync { value ->
                        emitDeviceConnectionStatusEmitter(
                            writableMapOf(
                                "id" to deviceId,
                                "value" to value,
                            )
                        )
                    }
                }

                // Device MTU
                if (trackedDeviceMTU.contains(deviceId).not()) {
                    trackedDeviceMTU.add(deviceId)
                    device.mtu.collectAsync { value ->
                        emitDeviceMTUEmitter(
                            writableMapOf(
                                "id" to deviceId,
                                "value" to value,
                            )
                        )
                    }
                }
            }
        }
    }

    override fun invalidate() {
        super.invalidate()

        jobs.forEach { it.cancel() }
        jobs.clear()
    }

    // State

    override fun state(): String = manager.state.value.name

    // Authorization

    override fun authorizationStatus(): String = manager.authorizationStatus.value.toJs

    override fun authorizationRequest() = manager.authorizationRequest(context)

    override fun authorizationOpenSettings() = manager.authorizationOpenSettings(context)

    // Scanning

    override fun scanEnabled(): Boolean = manager.scanEnabled.value

    override fun scanStart() = manager.scanStart(context)

    override fun scanStop() = manager.scanStop(context)

    // Devices

    override fun devices(): WritableArray =
        manager.devices.value.map { it.value.toJs }.writableArray

    // Device services

    override fun deviceServices(id: String?): WritableArray {
        val device = manager.devices.value[id] ?: return emptyWritableArray()
        return device.services.value.map { it.toJs }.writableArray
    }

    // Device connection status

    override fun deviceConnectionStatus(id: String?): String =
        manager.devices.value[id]?.connectionStatus?.value?.toJs ?: ""

    // Device MTU

    override fun deviceMTU(id: String?): Double =
        manager.devices.value[id]?.mtu?.value?.toDouble() ?: 0.0

    // Device operations

    override fun deviceConnect(id: String?, promise: Promise?) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        async {
            device.connect()
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    override fun deviceDisconnect(id: String?, promise: Promise?) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        async {
            device.disconnect()
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    override fun deviceDiscoverServices(id: String?, promise: Promise?) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        async {
            device.discoverServices()
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    override fun deviceRequestMTU(id: String?, mtu: Double, promise: Promise?) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        async {
            val result = device.requestMTU(mtu.toInt())
            promise?.resolve(result)
        }.storeIn(jobs)
    }

    // Device characteristic data

    override fun deviceCharacteristicData(
        id: String?,
        serviceId: String?,
        characteristicId: String?
    ): WritableArray {
        val device = manager.devices.value[id] ?: return emptyWritableArray()
        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: return emptyWritableArray()
        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: return emptyWritableArray()
        return characteristic.data.value.toJs
    }

    // Device characteristic notify enabled

    override fun deviceCharacteristicNotifyEnabled(
        id: String?,
        serviceId: String?,
        characteristicId: String?
    ): Boolean {
        val device = manager.devices.value[id] ?: return false
        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: return false
        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: return false
        return characteristic.isNotifying.value
    }

    // Device characteristic operations

    override fun deviceCharacteristicRead(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: run {
            promise?.reject(Throwable("Service not found"))
            return
        }

        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: run {
            promise?.reject(Throwable("Characteristic not found"))
            return
        }

        async {
            val result = characteristic.read()
            promise?.resolve(result.toJs)
        }.storeIn(jobs)
    }

    override fun deviceCharacteristicWrite(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        data: ReadableArray?,
        withResponse: Boolean,
        promise: Promise?
    ) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: run {
            promise?.reject(Throwable("Service not found"))
            return
        }

        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: run {
            promise?.reject(Throwable("Characteristic not found"))
            return
        }

        val writeValue = ByteArray(data?.size() ?: 0)
        data?.toArrayList()?.forEachIndexed { index, v ->
            writeValue[index] = (v as Int).toByte()
        }

        async {
            characteristic.write(
                data = writeValue,
                withResponse = withResponse,
            )
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    override fun deviceCharacteristicSubscribe(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: run {
            promise?.reject(Throwable("Service not found"))
            return
        }

        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: run {
            promise?.reject(Throwable("Characteristic not found"))
            return
        }

        async {
            characteristic.subscribe()
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    override fun deviceCharacteristicUnsubscribe(
        id: String?,
        serviceId: String?,
        characteristicId: String?,
        promise: Promise?
    ) {
        val device = manager.devices.value[id] ?: run {
            promise?.reject(Throwable("Device not found"))
            return
        }

        val service = device.services.value.firstOrNull {
            it.uuid.toString() == serviceId
        } ?: run {
            promise?.reject(Throwable("Service not found"))
            return
        }

        val characteristic = service.characteristics.firstOrNull {
            it.uuid.toString() == characteristicId
        } ?: run {
            promise?.reject(Throwable("Characteristic not found"))
            return
        }

        async {
            characteristic.unsubscribe()
            promise?.resolve(null)
        }.storeIn(jobs)
    }

    // Module name

    override fun getName(): String {
        return NAME
    }

    companion object {
        const val NAME = "BlueBreeze"
    }
}

/// Export native values

val BBAuthorization.toJs: String
    get() = when (this) {
        BBAuthorization.unknown -> "unknown"
        BBAuthorization.showRationale -> "showRationale"
        BBAuthorization.authorized -> "authorized"
        BBAuthorization.denied -> "denied"
    }

val BBState.toJs: String
    get() = when (this) {
        BBState.unknown -> "unknown"
        BBState.poweredOff -> "poweredOff"
        BBState.poweredOn -> "poweredOn"
        BBState.unauthorized -> "unauthorized"
    }

val BBCharacteristicProperty.toJs: String
    get() = when (this) {
        BBCharacteristicProperty.read -> "read"
        BBCharacteristicProperty.writeWithoutResponse -> "writeWithoutResponse"
        BBCharacteristicProperty.writeWithResponse -> "writeWithResponse"
        BBCharacteristicProperty.notify -> "notify"
    }

val BBScanResult.toJs: WritableMap
    get() = writableMapOf(
        "deviceId" to device.address,
        "rssi" to rssi,
        "isConnectable" to connectable,
        "advertisedServices" to advertisedServices.map { it.toString() },
        "manufacturerId" to manufacturerId,
        "manufacturerName" to manufacturerName,
        "manufacturerData" to manufacturerData,
    )

val BBDevice.toJs: WritableMap
    get() = writableMapOf(
        "id" to address,
        "name" to name,
    )

val BBDeviceConnectionStatus.toJs: String
    get() = when (this) {
        BBDeviceConnectionStatus.connected -> "connected"
        BBDeviceConnectionStatus.disconnected -> "disconnected"
    }

val BBCharacteristic.toJs: WritableMap
    get() = writableMapOf(
        "id" to uuid.toString(),
        "properties" to properties.map { it.toJs },
        "name" to name,
    )

val BBService.toJs: WritableMap
    get() = writableMapOf(
        "id" to uuid.toString(),
        "characteristics" to characteristics.map { it.toJs },
        "name" to name,
    )

val ByteArray.toJs: WritableArray
    get() {
        val result = Arguments.createArray()
        forEach { result.pushInt(it.toInt()) }
        return result
    }

/// Functions to collect data asynchronously

fun Job.storeIn(list: MutableList<Job>) = list.add(this)

fun async(
    block: suspend CoroutineScope.() -> Unit,
): Job = CoroutineScope(Dispatchers.IO).launch(block = block)

fun <T> SharedFlow<T>.collectAsync(
    collector: FlowCollector<T>,
): Job {
    return CoroutineScope(Dispatchers.IO)
        .launch {
            collect(collector)
        }
}

/// Functions to handle React Native types

val List<*>.writableArray: WritableArray
    get() {
        val result = Arguments.createArray()
        forEach { value ->
            when (value) {
                null -> writableArray.pushNull()
                is Boolean -> writableArray.pushBoolean(value)
                is Double -> writableArray.pushDouble(value)
                is Int -> writableArray.pushInt(value)
                is String -> writableArray.pushString(value)
                is Map<*, *> -> writableArray.pushMap(value.writableMap)
                is List<*> -> writableArray.pushArray(value.writableArray)
                is WritableArray -> writableArray.pushArray(value)
                is WritableMap -> writableArray.pushMap(value)
                else -> throw Throwable("Unsupported type ${value.javaClass}")
            }
        }

        return result
    }

val Map<*, *>.writableMap: WritableMap
    get() {
        val result = Arguments.createMap()
        entries.forEach { (key, value) ->
            if (key is String) {
                when (value) {
                    null -> writableMap.putNull(key)
                    is Boolean -> writableMap.putBoolean(key, value)
                    is Double -> writableMap.putDouble(key, value)
                    is Int -> writableMap.putInt(key, value)
                    is String -> writableMap.putString(key, value)
                    is Map<*, *> -> writableMap.putMap(key, value.writableMap)
                    is List<*> -> writableMap.putArray(key, value.writableArray)
                    is WritableArray -> writableMap.putArray(key, value)
                    is WritableMap -> writableMap.putMap(key, value)
                    else -> throw Throwable("Unsupported type ${value.javaClass}")
                }
            }
        }
        return result
    }

fun <T> writableArrayOf(vararg pairs: T): WritableArray = listOf(*pairs).writableArray

fun emptyWritableArray(): WritableArray = writableArrayOf<Void>()

fun <K, V> writableMapOf(vararg pairs: Pair<K, V>): WritableMap = mapOf(*pairs).writableMap
