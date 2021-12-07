import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';  
import fetch from "node-fetch";
import { ContractRequest } from '../models/Annonce';
const CHAIN_ENDPOINT = "https://jungle3.cryptolions.io:443"
const EOS_MARKETPLACE_PK =  "5JgEogcvAUUtMXmapaKwFweWYPBWZMh4SxjxGyRuiaJBiuJV9hQ"
const signatureProvider = new JsSignatureProvider([EOS_MARKETPLACE_PK])

const rpc = new JsonRpc(CHAIN_ENDPOINT,{fetch})
export class ContractAPI{

    static api: Api;

    static instantiate(){
        this.api = new Api({ rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        console.log("Contract API instantiated!")
    }
    static async createDeal(contractRequest:ContractRequest):Promise<string>{
      return new Promise<string>((resolve,reject)=>{
        ContractAPI.api.transact({
          actions: [{
              account: 'eosmarktplce',
              name: 'newdeal',
              authorization: [{
                actor: 'eosmarktplce',
                permission: 'active',
              }],
              data: {
                  creator:'eosmarktplce',
                  description:'Deal created through node server 21132',
                  tkcontract:'eosio.token',
                  quantity:Number(contractRequest.finalPriceEOS).toFixed(4).toString()+' EOS',
                  buyer:contractRequest.buyerWalletAccount,
                  seller:contractRequest.sellerWalletAccount,
                  arbiter:'eosmarktplce',
                  days:5
              },
            }]
          }, {
            blocksBehind: 3,
            expireSeconds: 30
  
        }).then((res)=>{
          resolve(res.processed.action_traces[0].inline_traces[res.processed.action_traces[0].inline_traces.length-1].act.data.deal_id)
        })
      })
    }

}
