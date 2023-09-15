import { useEffect, useState } from 'react'
import { Auth } from 'firebase/auth'
import { collection, Firestore, onSnapshot } from 'firebase/firestore'

import { User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { USERS_COLLECTION_NAME } from './utils'

export const useUsers = (auth: Auth, db: Firestore) => {
  const [users, setUsers] = useState<User[]>([])
  const { firebaseUser } = useFirebaseUser(auth)

  useEffect(() => {
    if (!firebaseUser) {
      setUsers([])
      return
    }

    const usersCollection = collection(db, USERS_COLLECTION_NAME)

    return onSnapshot(usersCollection, (query) => {
      const newUsers: User[] = []

      query?.forEach((doc) => {
        if (firebaseUser.uid === doc.id) return

        const data = doc.data()!

        const user: User = {
          // Ignore types here, not provided by the Firebase library
          // type-coverage:ignore-next-line
          createdAt: data.createdAt?.toMillis() ?? undefined,
          // type-coverage:ignore-next-line
          firstName: data.firstName ?? undefined,
          id: doc.id,
          // type-coverage:ignore-next-line
          imageUrl: data.imageUrl ?? undefined,
          // type-coverage:ignore-next-line
          lastName: data.lastName ?? undefined,
          // type-coverage:ignore-next-line
          lastSeen: data.lastSeen?.toMillis() ?? undefined,
          // type-coverage:ignore-next-line
          metadata: data.metadata ?? undefined,
          // type-coverage:ignore-next-line
          updatedAt: data.updatedAt?.toMillis() ?? undefined,
        }

        newUsers.push(user)
      })

      setUsers(newUsers)
    })
  }, [firebaseUser, db])

  return { users }
}
