import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Button, FlatList, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { devices } from 'react-native-bluebreeze';
import type { BBCharacteristic, BBService } from '../../src/NativeBlueBreeze';
import CharacteristicScreen from './CharacteristicScreen';

export default function DeviceScreen({ route }) {
    const navigation = useNavigation();

    // Get the device
    const { deviceId } = route.params;
    const device = devices().find((device) => (device.id == deviceId));
    if (device == undefined) {
        return <View />
    }

    // Connection status

    const [status, setStatus] = useState(device.connectionStatus());

    useEffect(() => {
        const subscription = device.connectionStatusEmitter((status) => {
            setStatus(status);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Services

    const [services, setServices] = useState(device.services());

    useEffect(() => {
        const subscription = device.servicesEmitter((services) => {
            setServices(services);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Header

    useEffect(() => {
        navigation.setOptions({
            headerTitle: device?.name,
        });
    }, []);

    useEffect(() => {
        navigation.setOptions({
            headerRight: () => (
                (status == "connected") ? (
                    <Button
                        onPress={async () => {
                            await device.disconnect();
                        }}
                        title='Disconnect'
                    />
                ) : (
                    <Button
                        onPress={async () => {
                            await device.connect();
                            await device.discoverServices();
                            await device.requestMTU(512);
                        }}
                        title='Connect'
                    />
                )
            ),
        });
    }, [status]);

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
    );

    return (
        <SafeAreaView style={styles.container}>
            <FlatList
                data={services}
                renderItem={({ item }) => Service(item)}
                keyExtractor={item => item.id}
            />
        </SafeAreaView>
    );
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
});
