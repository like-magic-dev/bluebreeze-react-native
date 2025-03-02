import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { Button, FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import BlueBreeze from 'react-native-bluebreeze'
import type { BBScanResult } from '../../src/implementation/bluebreeze_scan_result'

export default function ScanScreen() {
    const navigation = useNavigation()

    // Scanning status

    const [scanning, setScanning] = useState(BlueBreeze.scanEnabled.value)

    useEffect(() => {
        const subscription = BlueBreeze.scanEnabled.onValue((value) => {
            setScanning(value)
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Devices

    const [scanResults, setScanResults] = useState<BBScanResult[]>([])

    useEffect(() => {
        const subscription = BlueBreeze.scanResults.onValue((value) => {
            setScanResults((results) => [
                ...results.filter((r) => r.device.id != value.device.id),
                value,
            ].sort((a, b) => (a.device.id < b.device.id) ? -1 : 1))
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Header

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                (scanning) ? (
                    <Button onPress={() => BlueBreeze.scanStop()} title='Stop' />
                ) : (
                    <Button onPress={() => BlueBreeze.scanStart()} title='Start' />
                )
            ),
        })
    }, [scanning])

    // Rendering

    const Item = (scanResult: BBScanResult) => (
        <TouchableOpacity
            onPress={() => navigation.navigate(
                'Device',
                { deviceId: scanResult.device.id }
            )}
        >
            <View style={styles.listItem}>
                <View style={styles.hstack}>
                    <View style={[styles.vstack, styles.container]}>
                        <Text style={styles.deviceName}>{scanResult.name ?? '-'}</Text>
                        <Text style={styles.deviceManufacturer}>{scanResult.manufacturerName ?? '-'}</Text>
                    </View>
                    <Text style={styles.rssi}>{scanResult.rssi}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={scanResults}
                renderItem={({ item }) => (<Item {...item} />)}
                keyExtractor={item => item.device.id}
            />
        </SafeAreaView>
    )
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
        margin: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    deviceName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    deviceManufacturer: {
        fontSize: 14,
    },
    rssi: {
        fontSize: 18,
    }
})
