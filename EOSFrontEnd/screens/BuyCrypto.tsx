// import OnramperWidget from "@onramper/widget";
import React, { useContext, useEffect, useState } from "react";
import {WebView} from "react-native-webview"
import Constants, { UserInterfaceIdiom } from 'expo-constants';
import { AuthenticatedUserContext } from "../navigation/AuthenticatedUserProvider";
import { User } from "../interfaces/User";

export default function BuyCrypto() {

  const {user} =  useContext(AuthenticatedUserContext);
  const [uri, setUri] = useState('');

  useEffect(() => {
    setUri(buildURI(user))
  }, [])

  return (
    <WebView 
      source={{ uri: uri }}
    ></WebView>
  );
}

function buildURI(user: User) {
  const apiKey: string = Constants.manifest?.extra?.apiKeyMoonpayTest;
  const color: string = Constants.manifest?.extra?.color;
  const onlyGateways = Constants.manifest?.extra?.onlyGateways;
  const onlyCryptos = Constants.manifest?.extra?.onlyCryptos;
  const onlyFiat = Constants.manifest?.extra?.onlyFiat;
  console.log(Constants.manifest.extra)

  var uri: string = "https://widget.onramper.com?apiKey="+ apiKey;
  if (color) 
    uri = uri.concat("&color=" + color);
  if (onlyGateways.length != 0) 
    uri = uri.concat("&onlyGateways=" + onlyGateways);
  if (onlyCryptos.length != 0) 
    uri = uri.concat("&onlyCryptos=" + onlyCryptos);
  if (onlyFiat.length != 0) 
    uri = uri.concat("&onlyFiat=" + onlyFiat);
  if(user.walletAccountName)
    uri = uri.concat("&wallets=EOS:" + user.walletAccountName);
  
  console.log(uri);
  return uri;
}