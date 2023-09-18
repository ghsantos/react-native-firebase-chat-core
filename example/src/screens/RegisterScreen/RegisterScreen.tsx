import { createUserInFirestore } from '@flyerhq/react-native-firebase-chat-core'
import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import faker from 'faker'
import React, { useRef, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, TextInput } from 'react-native'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'

import { AuthStackParamList, RootStackParamList } from 'src/types'
import app, { db as firestoneDB } from '../../../firebaseConfig'
const auth = getAuth(app)

interface Props {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList, 'Auth'>,
    NativeStackNavigationProp<AuthStackParamList>
  >
}

function RegisterScreen({ navigation }: Props) {
  const firstName = faker.name.firstName()
  const lastName = faker.name.lastName()
  const passwordInput = useRef<TextInput>(null)
  const [email, setEmail] = useState(
    `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${faker.internet.domainName()}`
  )
  const [password, setPassword] = useState('Qawsed1-')
  const [registering, setRegistering] = useState(false)

  const register = async () => {
    try {
      setRegistering(true)
      const credential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      )
      await createUserInFirestore(firestoneDB, {
        firstName,
        id: credential.user.uid,
        imageUrl: `https://i.pravatar.cc/300?u=${email}`,
        lastName,
      })
      setRegistering(false)
      // navigation.navigate('Main')
      Alert.alert('user created', '', [{ text: 'OK' }])
    } catch (e) {
      setRegistering(false)
      Alert.alert('Error', (e as Error).message, [{ text: 'OK' }])
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='interactive'
      keyboardShouldPersistTaps='handled'
      style={styles.container}
    >
      <TextInput
        autoCapitalize='none'
        autoComplete='email'
        autoCorrect={false}
        autoFocus
        clearButtonMode='while-editing'
        editable={!registering}
        enablesReturnKeyAutomatically
        key='registerEmail'
        keyboardType='email-address'
        onChangeText={setEmail}
        onSubmitEditing={passwordInput.current?.focus}
        placeholder='Email'
        returnKeyType='next'
        style={styles.input}
        textContentType='emailAddress'
        value={email}
      />
      <TextInput
        ref={passwordInput}
        autoCapitalize='none'
        autoComplete='password'
        autoCorrect={false}
        clearButtonMode='while-editing'
        editable={!registering}
        enablesReturnKeyAutomatically
        key='registerPassword'
        onChangeText={setPassword}
        onSubmitEditing={register}
        placeholder='Password'
        returnKeyType='send'
        secureTextEntry
        style={styles.input}
        textContentType='password'
        value={password}
      />
      <Button disabled={registering} title='Register' onPress={register} />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    color: 'black',
  },
})

export default RegisterScreen
