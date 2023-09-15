import { useEffect, useState } from 'react'
import { Auth } from 'firebase/auth'
import { doc, Firestore, onSnapshot } from 'firebase/firestore'

import { Room } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { ROOMS_COLLECTION_NAME, processRoomDocument } from './utils'

/** Returns a stream of changes in a room from Firebase */
export const useRoom = (initialRoom: Room, auth: Auth, db: Firestore) => {
  const [room, setRoom] = useState(initialRoom ?? {})
  const { firebaseUser } = useFirebaseUser(auth)

  useEffect(() => {
    if (!firebaseUser) {
      return
    }

    const docRef = doc(db, ROOMS_COLLECTION_NAME, initialRoom?.id)

    return onSnapshot(docRef, async (document) => {
      const newRoom = await processRoomDocument(
        { doc: document, firebaseUser },
        db
      )

      setRoom(newRoom)
    })
  }, [firebaseUser, initialRoom?.id, db])

  return { room }
}
