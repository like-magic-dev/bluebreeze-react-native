import { useNavigation } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { StyleSheet, Button, FlatList, SafeAreaView, View, Text, TouchableOpacity } from 'react-native';
import { devices } from 'react-native-bluebreeze';
import type { BBCharacteristic, BBService } from '../../src/NativeBlueBreeze';

export default function CharacteristicScreen({ characteristic }: { characteristic: BBCharacteristic }) {
    // Data value

    const [data, setData] = useState(characteristic.data());

    useEffect(() => {
        const subscription = characteristic.dataEmitter((data) => {
            setData(data);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Notify status

    const [notifyEnabled, setNotifyEnabled] = useState(characteristic.notifyEnabled());

    useEffect(() => {
        const subscription = characteristic.notifyEnabledEmitter((value) => {
            setNotifyEnabled(value);
        });

        return () => {
            subscription.remove();
        };
    }, []);

    // Rendering

    return (
        <View style={[styles.item, styles.vstack]}>
            <Text style={styles.title}>{characteristic.name ?? characteristic.id}</Text>
            <Text style={styles.subtitle}>{data.map((v) => v.toString(16).padStart(2, '0')).join(' ')}</Text>
            <View style={[styles.flex, styles.hstack]}>
                <View style={styles.flex} />
                {(characteristic.properties.indexOf("read") >= 0) && (
                    <Button title={"Read"} onPress={() => characteristic.read()} />
                )}
                {(characteristic.properties.indexOf("writeWithoutResponse") >= 0) && (
                    <Button title={"Write"} onPress={() => characteristic.read()} />
                )}
                {(characteristic.properties.indexOf("writeWithResponse") >= 0) && (
                    <Button title={"Write"} onPress={() => characteristic.read()} />
                )}
                {(characteristic.properties.indexOf("notify") >= 0) && (
                    (notifyEnabled) ? (
                        <Button title={"Unsubscribe"} onPress={() => characteristic.unsubscribe()} />
                    ) : (
                        <Button title={"Subscribe"} onPress={() => characteristic.subscribe()} />
                    )
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    hstack: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    vstack: {
        flexDirection: 'column',
    },
    item: {
        margin: 10,
        paddingBottom: 5,
        borderBottomWidth: 1,
        borderBottomColor: '#ccc',
    },
    subtitle: {
        fontSize: 14,
    },
    title: {
        fontSize: 15,
        fontWeight: 'bold',
    },
});
