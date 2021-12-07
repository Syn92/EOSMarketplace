import * as React from 'react';
import { useState } from 'react';
import { ImageBackground, StyleSheet, View, Text } from 'react-native';
import { colors, Divider, SearchBar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import ChatRoomCard from '../components/Chat/ChatRoomCard';
import HorizontalSeparator from '../components/HorizontalSeparator';
import { getCardTitle, IRoom } from '../interfaces/Chat';
import { ServiceStatus } from '../interfaces/Services';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { ChatContext } from '../navigation/ChatSocketProvider';
import { RootTabScreenProps } from '../types';

export default function ChatRoomsScreen({ navigation }: RootTabScreenProps<'ChatRooms'>) {

  const [search, setSearch] = useState('');

  function onChannelPress(room: IRoom) {
    navigation.navigate('Chat', room)
  }
  const { rooms } =  React.useContext(ChatContext);
  const { user } =  React.useContext(AuthenticatedUserContext);

  function renderRooms(status?: ServiceStatus) {
    const shownRooms = rooms.filter(room => {
      const expired = room.service.otherUser && ( // there is another user. 2 cases.
        (room.service.owner == user.uid && room.service.otherUser != room.user.uid) // i'm the owner, expired if room user is not the otherUser
        || (room.service.owner != user.uid && room.service.otherUser != user.uid)) // i'm not the owner, expired if i'm not the otherUser either
      const rightCategory = expired ? !status : room.service.status == status
      return rightCategory && getCardTitle(room).toLowerCase().indexOf(search.toLowerCase()) > -1
    })
    return (shownRooms.length > 0
      ? shownRooms.map((room, key) => { return <ChatRoomCard key={key} room={room} onPress={onChannelPress}/>})
      : <Text style={styles.infoText}>(empty)</Text>
    )
  }

  return (
    <ImageBackground style={styles.container} source={require('../assets/images/bg.png')}>
      <View style={styles.searchContainer}>
        {/* @ts-ignore onChangeText wrong type https://github.com/react-native-elements/react-native-elements/issues/3089 */}
        <SearchBar value={search} containerStyle={styles.search} onChangeText={setSearch} round={true} lightTheme={true} />
      </View>
      <ScrollView style={styles.mainContainer}>
        <HorizontalSeparator text='open' fontSize={12} textColor={colors.grey2} lineColor={colors.grey2}/>
        {renderRooms(ServiceStatus.OPEN)}
        <HorizontalSeparator text='in progress' fontSize={12} textColor={colors.grey2} lineColor={colors.grey2}/>
        {renderRooms(ServiceStatus.IN_PROGRESS)}
        <HorizontalSeparator text='completed' fontSize={12} textColor={colors.grey2} lineColor={colors.grey2}/>
        {renderRooms(ServiceStatus.COMPLETED)}
        <HorizontalSeparator text='expired' fontSize={12} textColor={colors.grey2} lineColor={colors.grey2}/>
        {renderRooms()}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    flexDirection: 'column'
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 40,
    backgroundColor: 'transparent',
  },
  search: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
  },
  infoText: {
    textAlign: 'center',
    color: colors.grey2,
  },
  mainContainer: {
    flexGrow: 1,
    flexDirection: 'column',
    elevation: 5,
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignContent: 'center',
  },
});
