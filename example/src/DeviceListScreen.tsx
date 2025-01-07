import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Button, FlatList, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import {
    scanningEnabled,
    scanningEnabledEmitter,
    scanningStart,
    scanningStop,
    devices,
    devicesEmitter,
} from 'react-native-bluebreeze';
import type { BBDevice } from '../../src/NativeBlueBreeze';

export default function DeviceListScreen() {
    const navigation = useNavigation();

    // Scanning status

    const [scanning, setScanning] = useState(scanningEnabled());

    useEffect(() => {
        const subscription = scanningEnabledEmitter((status) => {
            setScanning(status);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Devices

    const [scannedDevices, setScannedDevices] = useState(devices());

    useEffect(() => {
        const subscription = devicesEmitter((devices) => {
            setScannedDevices(devices);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Header

    useEffect(() => {
        navigation.setOptions({
          headerRight: () => (
            (scanning) ? (
                <Button onPress={() => scanningStop()} title='Stop' />
            ) : (
                <Button onPress={() => scanningStart()} title='Start' />
            )
          ),
        });
    }, [scanning]);

    // Rendering

    const Item = (device: BBDevice) => (
        <TouchableOpacity 
            onPress={() => navigation.navigate(
                'Device', 
                { deviceId: device.id }
            )}
            >
            <View style={styles.listItem}>
                <View style={styles.hstack}>
                    <View style={[styles.vstack, styles.container]}>
                        <Text style={styles.deviceName}>{device.name ?? '-'}</Text>
                        <Text style={styles.deviceManufacturer}>{device.manufacturerName ?? '-'}</Text>
                    </View>
                    <Text style={styles.deviceName}>{device.rssi}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );
      
    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={scannedDevices}
                renderItem={({ item }) => ( <Item {...item} /> )}
                keyExtractor={item => item.id}
                />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    hstack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vstack: {
        flexDirection: 'column',
    },
    listItem: {
      padding: 10,
      borderBottomWidth: 1,
    },
    deviceName: {
      fontSize: 20,
    },
    deviceManufacturer: {
      fontSize: 14,
    },
});
