import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import DeviceScreen from './DeviceScreen'
import HomeScreen from './HomeScreen'

export default function App() {
    const Stack = createNativeStackNavigator()

    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ title: 'BLE Permissions' }}
                />
                <Stack.Screen
                    name="Device"
                    component={DeviceScreen}
                />
            </Stack.Navigator>
        </NavigationContainer>
    )
}
