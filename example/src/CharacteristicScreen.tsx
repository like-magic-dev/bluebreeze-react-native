import { useEffect, useState } from 'react';
import { Button, Modal, StyleSheet, Text, TextInput, View } from 'react-native';
import type { BBCharacteristic } from '../../src/NativeBlueBreeze';

function CharacteristicWriteScreen({ characteristic, onDone }: { characteristic: BBCharacteristic, onDone: () => void }) {
    const [writeValue, setWriteValue] = useState<number[]>([]);
    const [writeValueError, setWriteValueError] = useState(false);

    const canWriteWithResponse = characteristic.properties.indexOf("writeWithResponse") >= 0;

    return (
        <View style={[styles.flex, styles.writeModal]}>
            <View style={[styles.dialog, styles.vstack]}>
                <Text>Enter value (HEX)</Text>
                <TextInput
                    style={styles.textInput}
                    placeholder='Value'
                    onChangeText={(text) => {
                        const filteredText = text.replace(/[^0-9a-fA-F]/g, '');
                        if (filteredText != text) {
                            setWriteValueError(true);
                            return;
                        }

                        const tokens = filteredText.split(/(.{2})/).filter(x => (x.length == 2));
                        setWriteValue(tokens.map((v) => parseInt(v, 16)));
                        setWriteValueError(false);
                    }}
                />
                { (!writeValueError) ? (
                    <Text>{writeValue.map((v) => v.toString(16).padStart(2, '0').toUpperCase()).join(' ')}</Text>
                ) : (
                    <Text style={styles.error}>INVALID HEX</Text>
                ) }
                <View style={[styles.hstack]}>
                    <Button title={"Cancel"} onPress={() => onDone()} />
                    <View style={styles.flex} />
                    <Button 
                        disabled={writeValueError}
                        title={"Write"} 
                        onPress={() => {
                            characteristic.write(writeValue, canWriteWithResponse);
                            onDone();
                        }} 
                        />
                </View>
            </View>
        </View>
    );
}

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

    // Computed properties

    const canRead = characteristic.properties.indexOf("read") >= 0;
    const canWriteWithoutResponse = characteristic.properties.indexOf("writeWithoutResponse") >= 0;
    const canWriteWithResponse = characteristic.properties.indexOf("writeWithResponse") >= 0;
    const canWrite = canWriteWithoutResponse || canWriteWithResponse;
    const canNotify = characteristic.properties.indexOf("notify") >= 0;

    // Rendering

    const [writeVisible, setWriteVisible] = useState(false);

    return (
        <View style={[styles.item, styles.vstack]}>
            <Text style={styles.title}>{characteristic.name ?? characteristic.id}</Text>
            <Text style={styles.subtitle}>{data.map((v) => v.toString(16).padStart(2, '0')).join(' ')}</Text>
            <Modal
                animationType="slide"
                transparent={true}
                visible={writeVisible}
                onRequestClose={() => {
                    setWriteVisible(false);
                }}>
                <CharacteristicWriteScreen
                    characteristic={characteristic}
                    onDone={() => {
                        setWriteVisible(false);
                    }}
                />
            </Modal>
            <View style={[styles.flex, styles.hstack]}>
                <View style={styles.flex} />
                {(canRead) && (
                    <Button title={"Read"} onPress={() => characteristic.read()} />
                )}
                {(canWrite) && (
                    <Button
                        title={"Write"}
                        onPress={() => setWriteVisible(true)} />
                )}
                {(canNotify) && (
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
    writeModal: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    dialog: {
        backgroundColor: 'lightgray',
        padding: 10,
    },
    textInput: {
        height: 40,
        backgroundColor: 'white',
        borderRadius: 5,
        paddingHorizontal: 10,
        minWidth: 200,
    },
    error: {
        color: 'red',
    }
});
