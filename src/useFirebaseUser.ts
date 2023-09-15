import { useEffect, useState } from 'react'
import { Auth, onAuthStateChanged, User } from 'firebase/auth'

export const useFirebaseUser = (auth: Auth) => {
  const [firebaseUser, setFirebaseUser] = useState<User | undefined>()

  useEffect(() => {
    const unlisten = onAuthStateChanged(auth, (user) => {
      user ? setFirebaseUser(user) : setFirebaseUser(undefined)
    })
    return () => {
      unlisten()
    }
  }, [auth])

  return { firebaseUser }
}
