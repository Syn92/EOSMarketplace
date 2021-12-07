import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';           // development only
import {ChainId, ChainName, SigningRequest} from 'eosio-signing-request';
import 'text-encoding-polyfill';
import { Linking } from 'react-native'; 

export async function transact() {

  
  const actions = [{
    account: 'eosio.token',
    name: 'transfer',
    authorization: [{
      actor: '............1',
      permission: '............2'
    }],
    data: {
      from: "............1",
      to: "eosmrktplce1",
      quantity: "1.0000 EOS",
      memo: "Don't panic" }
}]
console.log("got hre")

    SigningRequest.create({ actions,chainId:"2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840" }, opts ).then((request)=>{
      request.setCallback("exp://10.0.0.221:19000",false)
      console.log(request.getChainId())
      Linking.openURL(request.encode())

  });

}
  
