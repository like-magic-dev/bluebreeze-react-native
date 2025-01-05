import { useEffect, useState } from 'react';
import { View, StyleSheet, Button } from 'react-native';
import {
    authorizationStatus,
    authorizationStatusEmitter,
    authorizationRequest,
    scanningEnabled,
    scanningEnabledEmitter,
    scanningStart,
    scanningStop,
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

    // Rendering

    return (
        <View style={styles.container}>
            { (authorization != 'authorized') && (
                <Button
                    title='Request Permission'
                    onPress={() => authorizationRequest()}
                />
            )}
            { (authorization == 'authorized') && (
                (scanning) ? (
                    <Button
                        title='Stop scanning'
                        onPress={() => scanningStop()}
                        />
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
