import { useEffect, useState } from 'react';
import { View, StyleSheet, Button, FlatList, Text } from 'react-native';
import {
    authorizationStatus,
    authorizationStatusEmitter,
    authorizationRequest,
    scanningEnabled,
    scanningEnabledEmitter,
    scanningStart,
    scanningStop,
    devices,
    devicesEmitter,
} from 'react-native-bluebreeze';

export default function App() {
    // Authorization status

    const [authorization, setAuthorization] = useState(authorizationStatus());

    useEffect(() => {
        const subscription = authorizationStatusEmitter((status) => {
            setAuthorization(status);
        });

        return () => {
            subscription.remove();
        };
    }, []);

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

    // Rendering

    return (
        <View style={styles.container}>
            <Text>{ authorization }</Text>
            { (authorization != 'authorized') && (
                <Button
                    title='Request Permission'
                    onPress={() => authorizationRequest()}
                />
            )}
            { (authorization == 'authorized') && (
                (scanning) ? (
                    <>
                        <Button
                            title='Stop scanning'
                            onPress={() => scanningStop()}
                            />
                        <FlatList
                            data={scannedDevices}
                            renderItem={({ item }) => (
                                <Button
                                    title={`Connect to ${item.name}`}
                                    onPress={() => item.connect()}
                                    />
                            )}
                            keyExtractor={item => item.id}
                            />
                    </>
                ) : (
                    <Button
                        title='Start scanning'
                        onPress={() => scanningStart()}
                        />
                )
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
