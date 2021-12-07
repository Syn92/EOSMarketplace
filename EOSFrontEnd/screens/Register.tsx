import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { useState } from 'react';
import { Button, ImageBackground, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Icon } from 'react-native-elements/dist/icons/Icon';
import { ScrollView } from 'react-native-gesture-handler';
import Loading from '../components/Loading';
import Firebase from '../config/firebase';
import { transact } from '../components/Anchor';
const auth = Firebase.auth();

export function Register({ navigation }: { navigation: any }) {

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [signupError, setSignupError] = useState('');
  const [isLoading, setLoadingStatus] = useState(false);
  const [registerIsEmpty, setIsEmpty] = useState(false);
  const [isNotSamePassword, setIsNotSamePassword] = useState(false)

  async function handleSignup() {
    setSignupError('');
    setIsEmpty(false);
    setIsNotSamePassword(false);
    try {
      if (email == '' || password == '' || passwordConfirmation == '') {
        setIsEmpty(true);
      } else if (password !== passwordConfirmation) {
        setIsNotSamePassword(true);
      } else {
        setLoadingStatus(true);
        // if (password == passwordConfirmation)
        await auth.createUserWithEmailAndPassword(email, password);
        setLoadingStatus(false);
      }
    } catch (error: any) {
      setLoadingStatus(false);
      setSignupError(error.message);
    }
  };

  auth.onAuthStateChanged(function (user: any) {
    if (user) {
      user.updateProfile({ displayName: "NEW USER NAME" });
    }
  });

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
      <View style={{ flex: 1 }}>
        <ImageBackground source={require('../assets/images/bg.png')} style={styles.container}>
          {isLoading ? Loading({}) : null}
          <StatusBar style='light' />


          {/* Email input */}
          <View style={styles.inputView}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={{ color: 'white' }}
              autoCapitalize='none'
              keyboardType='email-address'
              textContentType='emailAddress'
              value={email}
              onChangeText={text => setEmail(text)}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputView}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={{ color: 'white' }}
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry={true}
              textContentType='password'
              value={password}
              onChangeText={text => setPassword(text)}
            />
          </View>

          <View style={styles.inputView}>
            <Text style={styles.inputLabel}>Confirm Password</Text>
            <TextInput
              style={{ color: 'white' }}
              autoCapitalize='none'
              autoCorrect={false}
              secureTextEntry={true}
              textContentType='password'
              value={passwordConfirmation}
              onChangeText={text => setPasswordConfirmation(text)}
            />
          </View>


          {signupError ? <Text style={styles.errorText}>{signupError}</Text> : null}
          {registerIsEmpty ? <Text style={styles.errorText}>The email and/or password field is empty</Text> : null}
          {isNotSamePassword ? <Text style={styles.errorText}>The password is not the same</Text> : null}

          <TouchableOpacity style={styles.button} onPress={handleSignup}>
            <Text style={styles.buttonText}>Create Account</Text>
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