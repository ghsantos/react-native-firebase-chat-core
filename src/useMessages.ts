import { useEffect, useState } from 'react'
import { Auth } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  Firestore,
  Timestamp,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore'

import { MessageType, Room } from './types'
import { useFirebaseUser } from './useFirebaseUser'

/** Returns a stream of messages from Firebase for a given room */
export const useMessages = (room: Room, auth: Auth, db: Firestore) => {
  const [messages, setMessages] = useState<MessageType.Any[]>([])
  const { firebaseUser } = useFirebaseUser(auth)

  useEffect(() => {
    const messagesQuery = query(
      collection(db, `rooms/${room.id}/messages`),
      orderBy('createdAt', 'desc')
    )

    return onSnapshot(messagesQuery, (queryResult) => {
      const newMessages: MessageType.Any[] = []

      queryResult?.forEach((document) => {
        // Ignore `authorId`, `createdAt` and `updatedAt` types here, not provided by the Firebase library
        // type-coverage:ignore-next-line
        const { authorId, createdAt, updatedAt, ...rest } = document.data()

        // type-coverage:ignore-next-line
        const author = room?.users?.find((u) => u.id === authorId) ?? {
          id: authorId as string,
        }

        newMessages.push({
          ...rest,
          author,
          // type-coverage:ignore-next-line
          createdAt: createdAt?.toMillis() ?? undefined,
          id: document.id,
          // type-coverage:ignore-next-line
          updatedAt: updatedAt?.toMillis() ?? undefined,
        } as MessageType.Any)
      })

      setMessages(newMessages)
    })
  }, [room.id, room.users, db])

  /** Sends a message to the Firestore. Accepts any partial message. */
  const sendMessage = async (message: MessageType.PartialAny) => {
    if (!firebaseUser) return

    const messagesCollection = collection(db, `rooms/${room.id}/messages`)

    await addDoc(messagesCollection, {
      ...message,
      authorId: firebaseUser.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    })
  }

  /** Updates a message in the Firestore. Accepts any message.
   * Message will probably be taken from the `useMessages` stream. */
  const updateMessage = async (message: MessageType.Any) => {
    if (!firebaseUser || message.author.id !== firebaseUser.uid) return

    const messageToSend: Partial<MessageType.Any> = {
      ...message,
    }

    delete messageToSend.author
    delete messageToSend.createdAt
    delete messageToSend.id

    const docRef = doc(db, `rooms/${room.id}/messages`, message.id)

    await updateDoc(docRef, {
      ...messageToSend,
      authorId: message.author.id,
      updatedAt: Timestamp.now(),
    })
  }

  return { messages, sendMessage, updateMessage }
}
