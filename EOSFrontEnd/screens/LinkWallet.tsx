import React from 'react';
import { useState } from 'react';
import { Button, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { ScrollView } from 'react-native-gesture-handler';
import HorizontalSeparator from '../components/HorizontalSeparator';
import * as anchor from "../components/Anchor"
import Firebase from '../config/firebase';
import axios from 'axios';
import ServerConstants from '../constants/Server';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import Loading from '../components/Loading';

const auth = Firebase.auth();

export function LinkWallet({ navigation }: { navigation: any }) {

  const [eosUsername, setEosUsername] = useState('');
  const { user, setUser } = React.useContext(AuthenticatedUserContext);
  const [isLoading, setLoadingStatus] = useState(false);
  const [isNotValid, setIsNotValid] = useState(false);


  async function addLinkAccountName() {
    if(eosUsername.length == 0) {
      setIsNotValid(true);
      return
    }
    setIsNotValid(false);
    try {
      setLoadingStatus(true);
      let res = await axios.patch(ServerConstants.local + 'auth', {
        uid: user?.uid,
        patch: { walletAccountName: eosUsername }
      })
      console.log(res);
      if (res.status == 200) {
        await auth.updateCurrentUser(auth.currentUser);
        setLoadingStatus(false);
      } else {
        setLoadingStatus(false);
        throw new Error(`Error adding wallet (status ${res.status}): ${res.statusText}`)
      }

    } catch (e) {
      setLoadingStatus(false);
      console.error('Add Wallet error: ', e)
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1 }}>
        <ImageBackground source={require('../assets/images/bg.png')} style={styles.container}>
          {isLoading ? Loading({}) : null}
          <HorizontalSeparator text='EOS Wallet' fontSize={20} lineColor='#04b388' />

          {/* Wallet username input */}
          <View style={styles.inputView}>
            <Text style={styles.inputLabel}>Link Existing Wallet Account</Text>
            <TextInput
              style={{ color: 'white'}}
              autoCapitalize='none'
              autoCorrect={false}
              maxLength={12}
              placeholder="Enter account name..."
              placeholderTextColor='#ffffff50'
              value={eosUsername}
              onChangeText={text => setEosUsername(text)}
            />
          </View>
          <TouchableOpacity onPress={() => navigation.navigate('CreateWalletTutorial')} style={styles.helpLink}>
            <Text style={styles.helpLinkText}>
              No wallet? See how to create one here
            </Text>
          </TouchableOpacity>

          {isNotValid ? <Text style={styles.errorText}>Enter a valid wallet account name.</Text> : null}

          <TouchableOpacity style={styles.button} onPress={addLinkAccountName}>
            <Text style={styles.buttonText}>Add Wallet Account</Text>
          </TouchableOpacity>
        </ImageBackground>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // paddingTop: Platform.OS == 'ios' ?  60 : 80,
    paddingTop: '35%',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  helpContainer: {
    marginTop: 15,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  inputView: {
    width: "70%",
    marginBottom: 20,
    borderBottomWidth: 2,
    borderColor: 'white',
  },
  inputLabel: {
    fontSize: 16,
    color: '#04b388',
  },
  text: {
    fontSize: 20,
    color: '#fff',
    paddingVertical: 15,
    alignSelf: 'center'
  },
  errorText: {
    color: 'darkred',
    fontWeight: 'bold',
    marginBottom: 20
  },
  helpLink: {
    paddingTop: 0
  },
  helpLinkText: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  iconView: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#04b388',
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderRadius: 50
  },
  iconText: {
    color: 'white',
    marginLeft: 10,
  },
  button: {
    height: 50,
    backgroundColor: '#04b388',
    width: "50%",
    borderRadius: 25,
    marginVertical: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50
  },
  buttonText: {
    color: 'white',
  },
});