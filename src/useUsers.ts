import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { USERS_COLLECTION_NAME } from '.'
import { User } from './types'
import { useFirebaseUser } from './useFirebaseUser'

/** Returns a stream of all users from Firebase */
export const useUsers = () => {
  const [users, setUsers] = React.useState<User[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    return firestore()
      .collection(USERS_COLLECTION_NAME)
      .onSnapshot((query) => {
        const newUsers: User[] = []

        query?.forEach((doc) => {
          if (firebaseUser?.uid === doc.id) return

          const data = doc.data()!

          const user: User = {
            // Ignore types here, not provided by the Firebase library
            // type-coverage:ignore-next-line
            createdAt: data.createdAt?.toDate() ?? undefined,
            // type-coverage:ignore-next-line
            firstName: data.firstName ?? undefined,
            id: doc.id,
            // type-coverage:ignore-next-line
            imageUrl: data.imageUrl ?? undefined,
            // type-coverage:ignore-next-line
            lastName: data.lastName ?? undefined,
            // type-coverage:ignore-next-line
            lastSeen: !!data.lastSeen ? data.lastSeen?.toDate() : undefined,
            // type-coverage:ignore-next-line
            metadata: data.metadata ?? undefined,
            // type-coverage:ignore-next-line
            role: data.role ?? undefined,
            // type-coverage:ignore-next-line
            updatedAt: data.updatedAt?.toDate() ?? undefined,
          }

          newUsers.push(user)
        })

        setUsers(newUsers)
      })
  }, [firebaseUser])

  return { users }
}
