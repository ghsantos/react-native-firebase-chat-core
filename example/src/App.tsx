import React from 'react'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import {
  ChatScreen,
  LoginScreen,
  RegisterScreen,
  RoomsScreen,
  UsersScreen,
} from './screens'
import {
  AuthStackParamList,
  MainStackParamList,
  RootStackParamList,
  UsersStackParamList,
} from './types'
import { ActionSheetProvider } from '@expo/react-native-action-sheet'

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const MainStack = createNativeStackNavigator<MainStackParamList>()
const RootStack = createNativeStackNavigator<RootStackParamList>()
const UsersStack = createNativeStackNavigator<UsersStackParamList>()

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator>
      <AuthStack.Screen name='Login' component={LoginScreen} />
      <AuthStack.Screen name='Register' component={RegisterScreen} />
    </AuthStack.Navigator>
  )
}

const MainStackNavigator = () => {
  return (
    <MainStack.Navigator initialRouteName='Rooms'>
      <MainStack.Screen name='Chat' component={ChatScreen} />
      <MainStack.Screen name='Rooms' component={RoomsScreen} />
    </MainStack.Navigator>
  )
}

const UsersStackNavigator = () => {
  return (
    <UsersStack.Navigator>
      <UsersStack.Screen name='Users' component={UsersScreen} />
    </UsersStack.Navigator>
  )
}

function App() {
  return (
    <NavigationContainer>
      <ActionSheetProvider>
        <RootStack.Navigator
          initialRouteName='Main'
          screenOptions={{ headerShown: false }}
        >
          <RootStack.Screen
            name='Auth'
            component={AuthStackNavigator}
            options={{ presentation: 'modal' }}
          />
          <RootStack.Screen name='Main' component={MainStackNavigator} />
          <RootStack.Screen
            name='UsersStack'
            component={UsersStackNavigator}
            options={{ presentation: 'modal' }}
          />
        </RootStack.Navigator>
      </ActionSheetProvider>
    </NavigationContainer>
  )
}

export default App
