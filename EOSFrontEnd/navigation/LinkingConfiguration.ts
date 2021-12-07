/**
 * Learn more about deep linking with React Navigation
 * https://reactnavigation.org/docs/deep-linking
 * https://reactnavigation.org/docs/configuring-links
 */

import { LinkingOptions } from '@react-navigation/native';
import * as Linking from 'expo-linking';

import { RootStackParamList } from '../types';
import AddPostScreen from '../screens/AddPostScreen';

const linking: any = {
  prefixes:[Linking.makeUrl('/')] ,
  config: {
    screens: {
      TabOne: {
        screens: {
          Root: 'one',
          AddPost: 'addpost',
          // PostDetails: 'postdetails',
          // PublicProfile: 'publicprofile',
        }
      },
      TabTwo: {
        screens: {
          Root: 'two',
          NotFound: 'notfound',
          // PostDetails: 'postdetails',
          Modal: 'modal',
        }
      },
      TabThree: {
        screens: {
          ChatRooms: 'three',
          Chat: 'chat',
        }
      },
      TabFour: {
        screens: {
          Root: 'four',
          BuyCrypto: 'buycrypto',
          // PublicProfile: 'publicprofile',
          // PostDetails: 'postdetails',          
        }
      }
    }
  }
};

export default linking;
