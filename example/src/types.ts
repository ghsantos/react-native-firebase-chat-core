// import { Room } from '@flyerhq/react-native-firebase-chat-core'

import { Room } from "./lib/types"

export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainStackParamList = {
  Chat: { room: Room }
  Rooms: undefined
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  UsersStack: undefined
}

export type UsersStackParamList = {
  Users: undefined
}
