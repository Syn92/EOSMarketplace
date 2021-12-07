import axios from 'axios';
import React, { useState, createContext, useEffect, useRef} from 'react';
import ServerConstants from '../constants/Server';
import { User } from '../interfaces/User';
import Firebase from '../config/firebase';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

const defaultContext: { user: User | null, setUser: React.Dispatch<React.SetStateAction<User | null>> | null,
   isNewUser: boolean, setIsNewUser: React.Dispatch<React.SetStateAction<boolean>> | null,
  urlData: any, setUrlData: React.Dispatch<React.SetStateAction<Object>> | null } = {
    user: null,
    setUser: null,
    isNewUser: false,
    setIsNewUser: null,
    urlData: null,
    setUrlData: null
  }

export const AuthenticatedUserContext = createContext(defaultContext);

export function AuthenticatedUserProvider({ children }:{ children: any }) {
  const [user, setUser] = useState<User | null>(null);
  const [isNewUser, setIsNewUser] = useState<boolean>(false);
  const [urlData, setUrlData] = useState<any>()
  const oldUser = useRef<User | null>(null);


  async function registerForPushNotificationsAsync() {
    if (Constants.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;
      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }
      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      axios.patch(ServerConstants.local + 'token', {userId: user.uid, token: token}).catch(err => console.log('pushnotif: ', err))
    } else {
      // console.log('Must use physical device for Push Notifications');
    }

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  }

  useEffect(() => {
    if(oldUser.current?.uid == user?.uid) return; // same user

    if(oldUser.current) { // delete token of user logged out
      axios.delete(ServerConstants.local + 'token', {data: {userId: oldUser.current.uid}}).catch(err => console.log('deletetoken: ', err));
    }
    if(user) { // set token of user logged in
      registerForPushNotificationsAsync().catch(err => console.log(err))
    }

    oldUser.current = user
  }, [user])

  return (
    <AuthenticatedUserContext.Provider value={{ user, setUser, isNewUser, setIsNewUser, urlData, setUrlData }}>
      {children}
    </AuthenticatedUserContext.Provider>
  )
}