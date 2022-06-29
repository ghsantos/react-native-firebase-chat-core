import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import * as React from 'react'

export const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] = React.useState<
    FirebaseAuthTypes.User | undefined
  >()


  React.useEffect(() => {

    const subscriber = auth().onAuthStateChanged((user) => {
      if(user){
        setFirebaseUser(user);
      }
    })

    return subscriber;
  })

  return { firebaseUser }
}
