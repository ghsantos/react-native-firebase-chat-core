import { useState, useEffect } from 'react'
import { Auth, User as FirebaseUser } from 'firebase/auth'
import {
  Firestore,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  onSnapshot,
  query,
  where,
} from 'firebase/firestore'

import { Room, User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { ROOMS_COLLECTION_NAME, fetchUser, processRoomsQuery } from './utils'

/** Returns a stream of rooms from Firebase. Only rooms where current
 * logged in user exist are returned. `orderByUpdatedAt` is used in case
 * you want to have last modified rooms on top, there are a couple
 * of things you will need to do though:
 * 1) Make sure `updatedAt` exists on all rooms
 * 2) Write a Cloud Function which will update `updatedAt` of the room
 * when the room changes or new messages come in
 * 3) Create an Index (Firestore Database -> Indexes tab) where collection ID
 * is `rooms`, field indexed are `userIds` (type Arrays) and `updatedAt`
 * (type Descending), query scope is `Collection` */
export const useRooms = (
  auth: Auth,
  db: Firestore,
  orderByUpdatedAt?: boolean
) => {
  const [rooms, setRooms] = useState<Room[]>([])
  const { firebaseUser } = useFirebaseUser(auth)

  useEffect(() => {
    if (!firebaseUser) {
      setRooms([])
      return
    }

    const roomsQuery = query(
      collection(db, ROOMS_COLLECTION_NAME),
      where('userIds', 'array-contains', firebaseUser.uid)
    )

    return onSnapshot(roomsQuery, async (queryResult) => {
      const newRooms = await processRoomsQuery(
        { firebaseUser, query: queryResult },
        db
      )

      setRooms(newRooms)
    })
  }, [firebaseUser, orderByUpdatedAt, db])

  /** Creates a chat group room with `users`. Creator is automatically
   * added to the group. `name` is required and will be used as
   * a group name. Add an optional `imageUrl` that will be a group avatar
   * and `metadata` for any additional custom data. */
  const createGroupRoom = async ({
    imageUrl,
    metadata,
    name,
    users,
  }: {
    imageUrl?: string
    metadata?: Record<string, any>
    name: string
    users: User[]
  }) => {
    if (!firebaseUser) return

    const currentUser = await fetchUser(firebaseUser.uid, db)

    let roomUsers = [currentUser].concat(users)
    roomUsers = roomUsers?.map((object) => {
      if (object.id === firebaseUser.uid) {
        object.role = 'admin'
      }
      return object
    })

    const roomsCollection = collection(db, ROOMS_COLLECTION_NAME)

    const room = await addDoc(roomsCollection, {
      createdAt: Timestamp.now(),
      imageUrl,
      metadata,
      name,
      type: 'group',
      updatedAt: Timestamp.now(),
      userIds: roomUsers.map((u) => u.id),
      unseen: roomUsers.reduce((prev, curr) => ({ ...prev, [curr.id]: 0 }), {}),
      userRoles: roomUsers.reduce(
        (prev, curr) => ({ ...prev, [curr.id]: curr.role ?? 'user' }),
        {}
      ),
    })

    return {
      id: room.id,
      imageUrl,
      metadata,
      name,
      type: 'group',
      users: roomUsers,
    } as Room
  }

  /** Creates a direct chat for 2 people. Add `metadata` for any additional custom data. */
  const createRoom = async (
    otherUser: User,
    metadata?: Record<string, any>,
    currentFirebaseUser?: FirebaseUser
  ) => {
    if (!firebaseUser && !currentFirebaseUser) return
    if (!firebaseUser && currentFirebaseUser) {
      const roomsQuery = query(
        collection(db, ROOMS_COLLECTION_NAME),
        where('userIds', 'array-contains', currentFirebaseUser?.uid)
      )

      const queryResult = await getDocs(roomsQuery)

      const allRooms = await processRoomsQuery(
        firebaseUser
          ? { firebaseUser, query: queryResult }
          : { firebaseUser: currentFirebaseUser, query: queryResult },
        db
      )

      const existingRoom = allRooms.find((room) => {
        if (room.type === 'group') return false

        const userIds = room.users.map((u) => u.id)
        return (
          userIds.includes(currentFirebaseUser.uid) &&
          userIds.includes(otherUser.id)
        )
      })

      if (existingRoom) {
        return existingRoom
      }

      const currentUser = await fetchUser(currentFirebaseUser.uid, db)

      const users = [currentUser].concat(otherUser)

      const roomsCollection = collection(db, ROOMS_COLLECTION_NAME)

      const room = await addDoc(roomsCollection, {
        createdAt: Timestamp.now(),
        type: 'direct',
        updatedAt: Timestamp.now(),
        userIds: users.map((u) => u.id),
        unseen: users.reduce((prev, curr) => ({ ...prev, [curr.id]: 0 }), {}),
        metadata,
      })

      return {
        id: room.id,
        metadata,
        type: 'direct',
        users,
      } as Room
    } else if (firebaseUser && !currentFirebaseUser) {
      const roomsQuery = query(
        collection(db, ROOMS_COLLECTION_NAME),
        where('userIds', 'array-contains', firebaseUser?.uid)
      )

      const queryResult = await getDocs(roomsQuery)

      const allRooms = await processRoomsQuery(
        { firebaseUser, query: queryResult },
        db
      )

      const existingRoom = allRooms.find((room) => {
        if (room.type === 'group') return false

        const userIds = room.users.map((u) => u.id)
        return (
          userIds.includes(firebaseUser.uid) && userIds.includes(otherUser.id)
        )
      })

      if (existingRoom) {
        return existingRoom
      }

      const currentUser = await fetchUser(firebaseUser.uid, db)

      const users = [currentUser].concat(otherUser)

      const roomsCollection = collection(db, ROOMS_COLLECTION_NAME)

      const room = await addDoc(roomsCollection, {
        createdAt: Timestamp.now(),
        type: 'direct',
        updatedAt: Timestamp.now(),
        userIds: users.map((u) => u.id),
        unseen: users.reduce((prev, curr) => ({ ...prev, [curr.id]: 0 }), {}),
      })

      return {
        id: room.id,
        metadata,
        type: 'direct',
        users,
      } as Room
    } else if (firebaseUser && currentFirebaseUser) {
      const roomsQuery = query(
        collection(db, ROOMS_COLLECTION_NAME),
        where('userIds', 'array-contains', firebaseUser?.uid)
      )

      const queryResult = await getDocs(roomsQuery)

      const allRooms = await processRoomsQuery(
        { firebaseUser, query: queryResult },
        db
      )

      const existingRoom = allRooms.find((room) => {
        if (room.type === 'group') return false

        const userIds = room.users.map((u) => u.id)
        return (
          userIds.includes(firebaseUser.uid) && userIds.includes(otherUser.id)
        )
      })

      if (existingRoom) {
        return existingRoom
      }

      const currentUser = await fetchUser(firebaseUser.uid, db)

      const users = [currentUser].concat(otherUser)

      const roomsCollection = collection(db, ROOMS_COLLECTION_NAME)

      const room = await addDoc(roomsCollection, {
        createdAt: Timestamp.now(),
        type: 'direct',
        updatedAt: Timestamp.now(),
        userIds: users.map((u) => u.id),
        unseen: users.reduce((prev, curr) => ({ ...prev, [curr.id]: 0 }), {}),
      })

      return {
        id: room.id,
        metadata,
        type: 'direct',
        users,
      } as Room
    }
  }

  const createBroadCastRoom = async (
    otherUser: User,
    metadata?: Record<string, any>,
    currentFirebaseUser?: FirebaseUser
  ) => {
    if (!firebaseUser || !currentFirebaseUser) return

    const roomsQuery = query(
      collection(db, ROOMS_COLLECTION_NAME),
      where(
        'userIds',
        'array-contains',
        firebaseUser.uid ?? currentFirebaseUser?.uid
      )
    )

    const queryResult = await getDocs(roomsQuery)

    const allRooms = await processRoomsQuery(
      firebaseUser
        ? { firebaseUser, query: queryResult }
        : { firebaseUser: currentFirebaseUser, query: queryResult },
      db
    )

    const existingRoom = allRooms.find((room) => {
      if (room.type === 'group' || room.type === 'direct') return false

      const userIds = room.users.map((u) => u.id)
      return (
        userIds.includes(firebaseUser.uid ?? currentFirebaseUser.uid) &&
        userIds.includes(otherUser.id)
      )
    })

    if (existingRoom) {
      return existingRoom
    }

    const currentUser = await fetchUser(
      firebaseUser.uid ?? currentFirebaseUser.uid,
      db
    )

    const users = [currentUser].concat(otherUser)

    const roomsCollection = collection(db, ROOMS_COLLECTION_NAME)

    const room = await addDoc(roomsCollection, {
      createdAt: Timestamp.now(),
      type: 'broadcast',
      updatedAt: Timestamp.now(),
      userIds: users.map((u) => u.id),
      unseen: users.reduce((prev, curr) => ({ ...prev, [curr.id]: 0 }), {}),
    })

    return {
      id: room.id,
      metadata,
      type: 'broadcast',
      users,
    } as Room
  }

  return { createGroupRoom, createRoom, rooms, createBroadCastRoom }
}
