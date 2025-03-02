import { useNavigation } from '@react-navigation/native'
import { useEffect, useState } from 'react'
import { Button, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native'
import BlueBreeze from 'react-native-bluebreeze'
import type { BBService } from '../../src/implementation/bluebreeze_service'
import CharacteristicScreen from './CharacteristicScreen'

export default function DeviceScreen({ route }) {
    const navigation = useNavigation()

    // Get the device
    const { deviceId } = route.params
    const device = BlueBreeze.devices.value?.get(deviceId)
    if (device == undefined) {
        return <View />
    }

    // Connection status

    const [status, setStatus] = useState(device.connectionStatus.value)

    useEffect(() => {
        const subscription = device.connectionStatus.onValue((value) => {
            setStatus(value)
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Services

    const [services, setServices] = useState(device.services.value)

    useEffect(() => {
        const subscription = device.services.onValue((value) => {
            setServices(value)
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Header

    useEffect(() => {
        navigation.setOptions({
            headerTitle: device?.name,
        })
    }, [])

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                (status == "connected") ? (
                    <Button
                        onPress={async () => {
                            await device.disconnect()
                        }}
                        title='Disconnect'
                    />
                ) : (
                    <Button
                        onPress={async () => {
                            await device.connect()
                            await device.discoverServices()
                            await device.requestMTU(512)
                        }}
                        title='Connect'
                    />
                )
            ),
        })
    }, [status])

    // Rendering

    const Service = (service: BBService) => (
        <View style={styles.listItem}>
            <Text style={styles.service}>{service.name ?? service.id}</Text>
            <FlatList
                data={service.characteristics}
                renderItem={({ item }) => (<CharacteristicScreen characteristic={item} />)}
                keyExtractor={item => item.id}
            />
        </View>
    )

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={services}
                renderItem={({ item }) => Service(item)}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    listItem: {
    },
    service: {
        backgroundColor: '#000',
        color: '#fff',
        padding: 5,
        fontSize: 14,
        fontWeight: 'bold',
    },
})
