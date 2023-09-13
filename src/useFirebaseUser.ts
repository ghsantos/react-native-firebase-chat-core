import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import * as React from 'react'

export const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] = React.useState<
    FirebaseAuthTypes.User | undefined
  >()

  React.useEffect(() => {
    const unlisten = auth().onAuthStateChanged((user) => {
      user ? setFirebaseUser(user) : setFirebaseUser(undefined)
    })
    return () => {
      unlisten();
    }
    // const unlisten = auth().onAuthStateChanged(
    //     authUser => {
    //       authUser
    //         ? setFirebaseUser(authUser);
    //         : setFirebaseUser(undefined);
    //     },
    //  );
    //  return () => {
    //      unlisten();
    //  }
    // return auth().onAuthStateChanged((user) => {
    //   setFirebaseUser(user ?? undefined)
    // })
  })

  return { firebaseUser }
}
