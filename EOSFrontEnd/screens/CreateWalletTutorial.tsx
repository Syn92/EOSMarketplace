import React from 'react';
import AppLink from 'react-native-app-link';
import { Image, ImageBackground, StyleSheet, Text, View,Linking } from 'react-native';
import { isIOS } from 'react-native-elements/dist/helpers';
import { ScrollView, TouchableOpacity } from 'react-native-gesture-handler';
import * as anchor from '../components/Anchor'
export function CreateWalletTutorial() {
    function openAnchor(){
        AppLink.maybeOpenURL("anchor://app",{appName:"Anchor Wallet",appStoreId:1487410877,appStoreLocale:"ca",playStoreId:"com.greymass.anchor"})
    }

    return (
        <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
            <View style={{ flex: 1 }}>
                <ImageBackground source={require('../assets/images/bg.png')} style={styles.container}>
                    {/* <StatusBar style='light' /> */}

                    {/* <HorizontalSeparator text='EOS Wallet' fontSize={20} lineColor='#04b388' /> */}
                    {/* EOS Logo */}
                    <Image style={styles.image} source={require('../assets/images/anchorWalletLogo.png')} />
                    <View>
                        <TouchableOpacity onPress={openAnchor}>
                            <Text style={styles.iconTextLink}>1. Install the Greymass Anchor Wallet app</Text>
                        </TouchableOpacity>
                        <Text style={styles.iconText}>2. Tap on "Add account"</Text>
                        <Text style={styles.iconText}>3. Tap the "Create account" option</Text>
                        <Text style={styles.iconText}>4. Select "EOS Account" at 2,49 $CAD</Text>
                        <Text style={styles.iconText}>5. Choose your account name, then tap "Continue"</Text>
                        <Text style={styles.iconText}>6. Tap on "Create account"</Text>
                        <TouchableOpacity onPress={anchor.transact}>
                            <Text style={styles.iconText}>7. Confirm the 2,49 $CAD fee</Text>
                        </TouchableOpacity>

                        <Text style={styles.iconTextLastLine}>That's it! Your wallet is created!</Text>
                    </View>


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
        color: '#04b388',
        marginLeft: 10,
        fontSize: 13,
        paddingVertical: 15
    },
    iconTextLink: {
        color: '#04b388',
        marginLeft: 10,
        fontSize: 13,
        paddingVertical: 15,
        textDecorationLine: "underline",
    },
    iconTextLastLine: {
        color: '#04b388',
        marginLeft: 10,
        fontSize: 19,
        paddingVertical: 15
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
    image: {
        width: 150,
        height: 150,
        marginBottom: 25,
    },
});