import { StatusBar } from 'expo-status-bar';
import { enableMapSet } from 'immer';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import useCachedResources from './hooks/useCachedResources';
import Navigation from './navigation';
import { AuthenticatedUserProvider } from './navigation/AuthenticatedUserProvider';
import { ChatSocketProvider } from './navigation/ChatSocketProvider';

export default function App({...extras}) {
  const isLoadingComplete = useCachedResources();
  enableMapSet();

  if (!isLoadingComplete) {
    return null;
  } else {
    return (
      <AuthenticatedUserProvider>
        <ChatSocketProvider>
          <SafeAreaProvider>
            <Navigation />
            <StatusBar />
          </SafeAreaProvider>
        </ChatSocketProvider>
      </AuthenticatedUserProvider>
    );
  }
}
