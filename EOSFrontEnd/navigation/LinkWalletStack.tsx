import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { LinkWallet } from '../screens/LinkWallet';
import { CreateWalletTutorial } from '../screens/CreateWalletTutorial';

const LinkStack = createNativeStackNavigator();

export default function LinkWalletStack() {
  return (
    <LinkStack.Navigator>
      <LinkStack.Screen name="LinkWallet" component={LinkWallet} options={{         
        headerTransparent: true,
        headerShadowVisible: false,
        headerTintColor: '#04b388',
        title: 'Link Your Wallet'
      }} />
      <LinkStack.Screen name='CreateWalletTutorial' component={CreateWalletTutorial}  options={{
        headerTransparent: true,
        headerShadowVisible: false,
        headerTintColor: '#04b388',
        title: 'Create Your Wallet'
      }}/>
    </LinkStack.Navigator>
  )
}

const loginOptions = {
  title: 'EOS Marketplace',
  headerStyle: {
    color: '#04b388'
  }
}