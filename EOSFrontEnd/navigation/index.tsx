/**
 * If you are not familiar with React Navigation, refer to the "Fundamentals" guide:
 * https://reactnavigation.org/docs/getting-started
 *
 */
import { MaterialIcons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import axios from 'axios';
import * as React from 'react';
import * as Linking from 'expo-linking'
import { ActivityIndicator, ColorSchemeName, View } from 'react-native';

import Firebase from '../config/firebase';
import ServerConstants from '../constants/Server';
import { User } from '../interfaces/User';
import ModalScreen from '../screens/ModalScreen';
import NotFoundScreen from '../screens/NotFoundScreen';
import { PrivateProfile } from '../screens/PrivateProfile';
import TabOneScreen from '../screens/TabOneScreen';
import TabTwoScreen from '../screens/TabTwoScreen';
import GetFormatedDate from '../services/DateFormater';
import { RootTabParamList, RootTabScreenProps } from '../types';
import { AuthenticatedUserContext } from './AuthenticatedUserProvider';
import AuthStack from './AuthStack';
import LinkWalletStack from './LinkWalletStack';
import AddPostScreen from '../screens/AddPostScreen';
import ChatScreen from '../screens/ChatScreen';
import ChatRoomsScreen from '../screens/ChatRoomsScreen';
import { PublicProfile } from '../screens/PublicProfile';
import PostDetailsScreen from '../screens/PostDetailsScreen';
import BuyCrypto from '../screens/BuyCrypto';
import { ChatContext, ChatSocketContext } from './ChatSocketProvider';
import { IRoom } from '../interfaces/Chat';
import ContractScreen from '../screens/ContractScreen';
import linking from './LinkingConfiguration';
import SearchUserScreen from '../screens/SearchUserScreen';
import CompletedContractScreen from '../screens/CompletedContractScreen';

const auth = Firebase.auth();

async function checkUser(user: any) {

  try {
    const res = await axios.get<any>(ServerConstants.local + 'auth', { params: { uid: user.uid }, timeout: 7000 });
    // if user exists, return user

    if (res.data){
      delete res.data._id;
      return [res.data, false];
    }

    // add user to mongodb
    const newUsr: User = {
      uid: user.uid,
      email: user.email,
      name: user.displayName,
      joinedDate: GetFormatedDate(new Date())
    };
    await axios.post(ServerConstants.local + 'auth', newUsr);

    return [newUsr, true];
  } catch (err) {
    if(err.code === 'ECONNABORTED')
      alert("Error connecting to the server.");
    else
      console.log('checkuser', err);
  }
}

export default function Navigation() {
  const { user, setUser, isNewUser, setIsNewUser, urlData, setUrlData } =  React.useContext(AuthenticatedUserContext);
  const [isLoading, setIsLoading] = React.useState(true);

  function handleDeeplink(event: any) {
    console.log(event)
    setUrlData(Linking.parse(event.url))
  }

  React.useEffect(() => {

    async function getInitialURL() {
      const initialURL = await Linking.getInitialURL()
      if (initialURL){ console.log(initialURL); setUrlData(Linking.parse(initialURL))}
    }

    Linking.addEventListener('url', handleDeeplink)
    if (!urlData){
      getInitialURL()
    }

    // onAuthStateChanged returns an unsubscriber
    const unsubscribeAuth = auth.onIdTokenChanged(async (authenticatedUser: any) => {
      try {
        if (authenticatedUser) {
          var response = await checkUser(authenticatedUser);
          authenticatedUser = response[0];
          if (setIsNewUser) await setIsNewUser(response[1]);
        }

        // setUser to either null or return value of checkUser
        if (setUser) await setUser(authenticatedUser);
        else throw new Error('setUser undefined');

        setIsLoading(false);
      } catch (error) {
        console.log('onAuthChanged', error);
      }
    });

    // unsubscribe auth listener on unmount
    return () => {
      Linking.removeEventListener('url', handleDeeplink)
      return unsubscribeAuth
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size='large' color='black' />
      </View>
    )
  }

  if (isNewUser) {
    return (
      <NavigationContainer>
        <LinkWalletStack/>
      </NavigationContainer>
    )
  }

  return user ?
    (<NavigationContainer linking={linking}>
      <BottomTabNavigator/>
    </NavigationContainer>) :
    (<NavigationContainer>
      <AuthStack/>
    </NavigationContainer>)
}

const TabOneStack = createNativeStackNavigator();
function TabOneStackScreen() {
  return (
    <TabOneStack.Navigator>
      <TabOneStack.Screen name="Root" component={TabTwoScreen} options={{ headerShown: false }} />
      <TabOneStack.Screen name="AddPost" component={AddPostScreen} />
      <TabOneStack.Screen name="PostDetails" component={PostDetailsScreen} options={{headerShown: false}}/>
      <TabOneStack.Screen name="PublicProfile" component={PublicProfile} options={{headerShown: false}}/>
    </TabOneStack.Navigator>
  )
}

const TabTwoStack = createNativeStackNavigator();
function TabTwoStackScreen() {
  return (
    <TabTwoStack.Navigator>
      <TabTwoStack.Screen name="Root" component={TabOneScreen} options={{ headerShown: false }} />
      <TabTwoStack.Screen name="NotFound" component={NotFoundScreen} options={{ title: 'Oops!' }} />
      <TabTwoStack.Screen name="PostDetails" component={PostDetailsScreen} options={{headerShown: false}}/>
      <TabTwoStack.Group screenOptions={{ presentation: 'modal' }}>
        <TabTwoStack.Screen name="Modal" component={ModalScreen} />
      </TabTwoStack.Group>
    </TabTwoStack.Navigator>
  )
}

const TabThreeStack = createNativeStackNavigator();
function TabThreeStackScreen() {
  return (
    <TabThreeStack.Navigator>
      <TabThreeStack.Screen name="ChatRooms" component={ChatRoomsScreen} options={{ headerShown: false }} />
      <TabThreeStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: (route.params as IRoom).user.name + " - " + (route.params as IRoom).service.title })} />
      <TabThreeStack.Screen name="Contract" component={ContractScreen} options={{ headerShown: false }}/>
    </TabThreeStack.Navigator>
  )
}

const TabFourStack = createNativeStackNavigator();
function TabFourStackScreen() {
  return (
    <TabFourStack.Navigator>
      <TabFourStack.Screen name="Root" component={PrivateProfile} options={{ headerShown: false }} />
      <TabFourStack.Screen name="BuyCrypto" component={BuyCrypto} options={{ headerShown: false }} />
      <TabFourStack.Screen name="PublicProfile" component={PublicProfile} options={{ headerShown: false }} />
      <TabFourStack.Screen name="PostDetails" component={PostDetailsScreen} />
      <TabFourStack.Screen name="SearchUser" component={SearchUserScreen} />
      <TabFourStack.Screen name="Contract" component={ContractScreen} options={{ headerShown: false }}/>
      <TabFourStack.Screen name="Chat" component={ChatScreen} options={({ route }) => ({ title: (route.params as IRoom).user.name + " - " + (route.params as IRoom).service.title })} />
      <TabFourStack.Screen name="Completed" component={CompletedContractScreen} options={{ headerShown: false }} />
    </TabFourStack.Navigator>
  )
}

/**
 * A bottom tab navigator displays tab buttons on the bottom of the display to switch screens.
 * https://reactnavigation.org/docs/bottom-tab-navigator
 */
const BottomTab = createBottomTabNavigator<RootTabParamList>();

function BottomTabNavigator() {
  const { notifsCount } =  React.useContext(ChatContext);

  return (
    <BottomTab.Navigator
      initialRouteName="TabOne"
      screenOptions={{
        headerShown: false,
      }}>
      <BottomTab.Screen
        name="TabOne"
        component={TabOneStackScreen}
        options={({ navigation }: RootTabScreenProps<'TabOne'>) => ({
          title: 'Home',
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          tabBarActiveTintColor: '#04B388',
          tabBarInactiveTintColor: '#182851',
        })}
      />
      <BottomTab.Screen
        name="TabTwo"
        component={TabTwoStackScreen}
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <TabBarIcon name="explore" color={color} />,
          tabBarActiveTintColor: '#04B388',
          tabBarInactiveTintColor: '#182851',
        }}
      />
      <BottomTab.Screen
        name="TabThree"
        component={TabThreeStackScreen}
        options={{
          title: 'Message',
          tabBarIcon: ({ color }) => <TabBarIcon name="chat-bubble" color={color} />,
          tabBarActiveTintColor: '#04B388',
          tabBarInactiveTintColor: '#182851',
          tabBarBadge: notifsCount > 0 ? notifsCount : null
        }}
      />
      <BottomTab.Screen
        name="TabFour"
        component={TabFourStackScreen}
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <TabBarIcon name="person" color={color} />,
          tabBarActiveTintColor: '#04B388',
          tabBarInactiveTintColor: '#182851',
        }}
      />
    </BottomTab.Navigator>
  );
}

/**
 * You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
 */
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialIcons>['name'];
  color: string;
}) {
  return <MaterialIcons size={30} style={{ marginBottom: -3 }} {...props} />;
}
