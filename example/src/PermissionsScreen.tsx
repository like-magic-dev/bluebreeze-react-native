import { useEffect, useState } from 'react';
import { StyleSheet, Button, SafeAreaView, Text, } from 'react-native';
import {
    authorizationStatus,
    authorizationStatusEmitter,
    authorizationRequest,
} from 'react-native-bluebreeze';
import { StackActions, useNavigation } from '@react-navigation/native';

export default function PermissionsScreen() {
    const navigation = useNavigation();
    
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

    // Navigate to device list

    useEffect(() => {
        if (authorization == 'authorized') {
            navigation.dispatch(
                StackActions.replace('DeviceList')
            )
        }
    }, [authorization]);

    // Rendering

    return (
        <SafeAreaView style={styles.container}>
            { (authorization != 'authorized') ? (
                <Button
                    title='Request Permission'
                    onPress={() => authorizationRequest()}
                />
            ) : (
                <Text>{ authorization }</Text>
            ) }
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
});
