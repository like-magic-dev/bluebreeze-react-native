# BlueBreeze React Native

[![npm version](https://img.shields.io/npm/v/react-native-bluebreeze.svg)](https://www.npmjs.com/package/react-native-bluebreeze)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)](package.json)

BlueBreeze is a modern Bluetooth LE library for React Native, wrapping the native
[BlueBreeze iOS](https://github.com/like-magic-dev/bluebreeze-ios) and
[BlueBreeze Android](https://github.com/like-magic-dev/bluebreeze-android) SDKs behind a single
JS/TypeScript API. All the platform-specific work -- connection state machines, GATT callback
correlation, per-device request queuing -- happens natively; from JS you just observe state and
`await` operations.

- **Reactive state** -- adapter power, authorization, discovered devices, connection status,
  services, and characteristic data are all exposed as observables
  ([`react-native-value-emitter`](https://github.com/like-magic-dev/react-native-value-emitter))
  you subscribe to with `.onValue(...)` and read synchronously via `.value`.
- **Promise-based operations** -- connect, discover services, read, write, and
  subscribe/unsubscribe are all `async` calls with a built-in timeout on both platforms; no
  native callbacks to correlate yourself.
- **Automatic per-device request queuing** -- handled natively on both platforms, so you can fire
  off several operations on the same device without worrying about overlapping BLE requests.
- **Runtime permission handling built in** -- `authorizationStatus`/`authorizationRequest`/
  `authorizationOpenSettings` cover Android's runtime permissions and iOS's Bluetooth usage
  authorization behind one API.
- **Bluetooth SIG assigned numbers built in** -- known company IDs, service UUIDs, and
  characteristic UUIDs are resolved automatically by the underlying native SDKs.
- **New Architecture** -- implemented as a TurboModule.

## Installation

```sh
npm install react-native-bluebreeze
```

iOS additionally requires a pod install:

```sh
cd ios && pod install
```

## Requirements

- React Native with the New Architecture enabled (this library is a TurboModule)
- Android API 24+ (minSdk)
- iOS 15.1+
- Declare the Bluetooth permissions each platform needs:

**Android** (`android/app/src/main/AndroidManifest.xml`):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_ADMIN" android:maxSdkVersion="30" />
<uses-permission android:name="android.permission.BLUETOOTH_SCAN" android:usesPermissionFlags="neverForLocation" />
<uses-permission android:name="android.permission.BLUETOOTH_CONNECT" />

<uses-feature android:name="android.hardware.bluetooth_le" android:required="true" />
```

**iOS** (`ios/Info.plist`):
```xml
<key>NSBluetoothAlwaysUsageDescription</key>
<string>This app uses Bluetooth to connect to nearby devices.</string>
```

## Quick start

```tsx
import BlueBreeze from 'react-native-bluebreeze'

// Request authorization if needed, then start scanning once the adapter is on
if (BlueBreeze.authorizationStatus.value !== 'authorized') {
    BlueBreeze.authorizationRequest()
}

BlueBreeze.state.onValue((state) => {
    if (state === 'poweredOn') {
        BlueBreeze.scanStart()
    }
})

// Observe scan results
BlueBreeze.scanResults.onValue((result) => {
    console.log(result.name ?? 'Unknown device', result.rssi)
})

// Connect, discover, and talk to a device
async function connectToFirstDevice() {
    const device = BlueBreeze.devices.value.values().next().value
    if (device == undefined) return

    await device.connect()
    await device.discoverServices()

    for (const service of device.services.value) {
        for (const characteristic of service.characteristics) {
            if (characteristic.properties.includes('read')) {
                const data = await characteristic.read()
                console.log(characteristic.id, data)
            }
        }
    }

    await device.disconnect()
}
```

See [`example`](example) for a full app built on top of BlueBreeze.

## Documentation

The public API is documented with TSDoc directly in the source under
[`src`](src) -- hover any exported member in your editor to see it, or browse it there directly.

## License

BlueBreeze is available under the MIT license. See [LICENSE](LICENSE) for details.
