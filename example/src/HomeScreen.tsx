import { useEffect, useState } from 'react'
import { Button, SafeAreaView, StyleSheet, Text, } from 'react-native'
import BlueBreeze from 'react-native-bluebreeze'
import ScanScreen from './ScanScreen'

export default function HomeScreen() {
    // BLE state

    const [state, setState] = useState(BlueBreeze.state.value)

    useEffect(() => {
        const subscription = BlueBreeze.state.onValue((value) => {
            setState(value)
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Authorization status

    const [authorization, setAuthorization] = useState(BlueBreeze.authorizationStatus.value)

    useEffect(() => {
        const subscription = BlueBreeze.authorizationStatus.onValue((value) => {
            setAuthorization(value)
        })

        return () => {
            subscription.remove()
        }
    }, [])

    // Rendering

    if (state != 'poweredOn') {
        return (
            <SafeAreaView style={styles.container}>
                <Text>Bluetooth offline</Text>
            </SafeAreaView>
        )
    } else if (authorization != 'authorized') {
        return (
            <SafeAreaView style={styles.container}>
                {(authorization == 'unknown') ? (
                    <Button
                        title='Show authorization popup'
                        onPress={() => BlueBreeze.authorizationRequest()}
                    />
                ) : (
                    <Button
                        title='Please grant authorization in the settings'
                        onPress={() => BlueBreeze.authorizationOpenSettings()}
                    />
                )}
            </SafeAreaView>
        )
    } else {
        return <ScanScreen />
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
})
