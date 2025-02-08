package com.bluebreeze

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.WritableArray
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = BlueBreezeModule.NAME)
class BlueBreezeModule(reactContext: ReactApplicationContext) :
  NativeBlueBreezeSpec(reactContext) {

  override fun getName(): String {
    return NAME
  }

  override fun state(): String {
    TODO("Not yet implemented")
  }

  override fun authorizationStatus(): String {
    TODO("Not yet implemented")
  }

  override fun authorizationRequest() {
    TODO("Not yet implemented")
  }

  override fun scanningEnabled(): Boolean {
    TODO("Not yet implemented")
  }

  override fun scanningStart() {
    TODO("Not yet implemented")
  }

  override fun scanningStop() {
    TODO("Not yet implemented")
  }

  override fun devices(): WritableArray {
    TODO("Not yet implemented")
  }

  override fun deviceServices(id: String?): WritableArray {
    TODO("Not yet implemented")
  }

  override fun deviceConnectionStatus(id: String?): String {
    TODO("Not yet implemented")
  }

  override fun deviceMTU(id: String?): Double {
    TODO("Not yet implemented")
  }

  override fun deviceConnect(id: String?, promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun deviceDisconnect(id: String?, promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun deviceDiscoverServices(id: String?, promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun deviceRequestMTU(id: String?, mtu: Double, promise: Promise?) {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicData(
    id: String?,
    serviceId: String?,
    characteristicId: String?
  ): WritableArray {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicNotifyEnabled(
    id: String?,
    serviceId: String?,
    characteristicId: String?
  ): Boolean {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicRead(
    id: String?,
    serviceId: String?,
    characteristicId: String?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicWrite(
    id: String?,
    serviceId: String?,
    characteristicId: String?,
    data: ReadableArray?,
    withResponse: Boolean,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicSubscribe(
    id: String?,
    serviceId: String?,
    characteristicId: String?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  override fun deviceCharacteristicUnsubscribe(
    id: String?,
    serviceId: String?,
    characteristicId: String?,
    promise: Promise?
  ) {
    TODO("Not yet implemented")
  }

  companion object {
    const val NAME = "BlueBreeze"
  }
}
