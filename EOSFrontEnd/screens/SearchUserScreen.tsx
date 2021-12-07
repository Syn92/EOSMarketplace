import axios from 'axios';
import * as React from 'react';
import { useState } from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import { SearchBar } from 'react-native-elements';
import { ScrollView } from 'react-native-gesture-handler';
import UserCard from '../components/UserCard';
import ServerConstants from '../constants/Server';
import { User } from '../interfaces/User';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { RootTabScreenProps } from '../types';

export default function SearchUserScreen({ navigation }: RootTabScreenProps<'SearchUser'>) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const { user } =  React.useContext(AuthenticatedUserContext);

  React.useEffect(() => {
    axios.get(ServerConstants.local + 'user')
    .then(function (response) {
      const resUsers = response.data as User[]
      setUsers(resUsers.filter(x => x.uid != user?.uid));
    }).catch(function (error) {
      console.log(error);
    });
  }, [user])

  function isUserVisible(userVisible: User): boolean {
    if(userVisible.name)
      return userVisible.name.toLowerCase().indexOf(search.toLowerCase()) > -1
    else
      return userVisible.email.toLowerCase().indexOf(search.toLowerCase()) > -1
  }

  return (
    <ImageBackground style={styles.container} source={require('../assets/images/bg.png')}>
      <View style={styles.searchContainer}>
        {/* @ts-ignore onChangeText wrong type https://github.com/react-native-elements/react-native-elements/issues/3089 */}
        <SearchBar value={search} containerStyle={styles.search} onChangeText={setSearch} round={true} lightTheme={true} />
      </View>
      <ScrollView style={styles.usersContainer}>
        {users.filter(x => isUserVisible(x))
          .map((x, key) => { return <UserCard key={key} user={x}/>})}
      </ScrollView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    maxHeight: '100%'
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
  usersContainer: {
      height: '100%',
      flexDirection: 'column',
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
      elevation: 5,
      backgroundColor: 'white',
  }
});
