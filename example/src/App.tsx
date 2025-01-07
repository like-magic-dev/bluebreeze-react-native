import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import DeviceListScreen from './DeviceListScreen';
import PermissionsScreen from './PermissionsScreen';
import DeviceScreen from './DeviceScreen';

export default function App() {
    const Stack = createNativeStackNavigator();

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={PermissionsScreen}
                    options={{ title: 'BLE Permissions' }}
                />
                <Stack.Screen 
                    name="DeviceList" 
                    component={DeviceListScreen} 
                    options={{ title: 'BLE Scanning' }}
                    />
                <Stack.Screen 
                    name="Device" 
                    component={DeviceScreen} 
                    />
            </Stack.Navigator>
        </NavigationContainer>
    );
}
