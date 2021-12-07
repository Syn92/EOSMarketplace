import { SigningRequest } from 'eosio-signing-request';
import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';
import { Linking } from 'react-native';
// import fetch from "node-fetch";
import axios, { CancelTokenSource } from 'axios';
import ServerConstants from '../constants/Server';
import { Contract , ContractRequest} from '../interfaces/Contracts';
import ContractScreen from '../screens/ContractScreen';

const CHAIN_ENDPOINT = "https://jungle3.cryptolions.io:443"
const EOS_MARKETPLACE_PK =  "5JHK9gTN4XTK1vgJBAShEpnfLdVUkQy7L2rZVd31okHNcdB9Nz4"
const signatureProvider = new JsSignatureProvider([EOS_MARKETPLACE_PK])

const rpc = new JsonRpc(CHAIN_ENDPOINT,{fetch})
export class ContractAPI{

    static contractAPI:ContractAPI
    private opts:any
    private api:Api
    private rpc:JsonRpc
    private constructor(){
        this.rpc = new JsonRpc('https://jungle3.cryptolions.io:443', { fetch });

        this.api = new Api({ rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder() });
        this.opts = {

          // Customizable ABI Provider used to retrieve contract data
          abiProvider: {
            getAbi: async (account:any) => (await this.api.getAbi(account))
          }
        }
    }

    public static getInstance(){
      if(!this.contractAPI){
        this.contractAPI =  new ContractAPI()
      }
      return this.contractAPI
    }

    private async signingRequest(actions:any,value:string){
        let ip = await Linking.getInitialURL()
        let res = await SigningRequest.create({ actions,chainId:"2a02a0053e5a8cf73a56ba0fda11e4d92e0238a4a2aa74fccf46d5a910746840" }, this.opts )
        console.log(ip)
        res.setCallback(`${ip}/--/three?value=${value}`,false)
        return Linking.openURL(res.encode())
    }
     async completeDeal(dealId:string,walletAccountName:string,value:string,action:string){
      const actions = [{
        account: 'eosmarktplce',
        name: action,
        authorization: [{
          actor:walletAccountName,
          permission: 'active',
        }],
        data: action == 'delivered' ? {
            party: walletAccountName,
            memo: dealId,
            deal_id:dealId
        } : {
          party: walletAccountName,
          deal_id:dealId
      },
      }]
      return this.signingRequest(actions, value).catch((err) => {console.log(err)})
     }

    async createDeal(deal:ContractRequest){
        return axios.post(ServerConstants.local+"contract",deal)
    }
    async acceptDeal(dealId:string,walletAccountName:string,value:string){
      console.log(dealId)
        const actions = [{
             account: 'eosmarktplce',
             name: 'accept',
             authorization: [{
               actor:walletAccountName,
               permission: 'active',
             }],
             data: {
                 party:walletAccountName,
                 deal_id:dealId
             },
           }]
        return this.signingRequest(actions,value)
    }

    async cancelDeal(dealId:string,walletAccountName:string,value:string){
      console.log(dealId)
        const actions = [{
             account: 'eosmarktplce',
             name: 'cancel',
             authorization: [{
               actor:walletAccountName,
               permission: 'active',
             }],
             data: {
                 party:walletAccountName,
                 deal_id:dealId
             },
           }]
        return this.signingRequest(actions,value)
    }

    async deposit(dealId:string,walletAccountName:string,price:number){
      const actions = [{
        account: 'eosio.token',
        name: 'transfer',
        authorization: [{
          actor: walletAccountName,
          permission: 'active',
        }],
        data: {
          from: walletAccountName,
          to: "eosmarktplce",
          quantity: price.toFixed(4).toString()+" EOS",
          memo: dealId
        },
      }]
      return this.signingRequest(actions,'deposited')

    }

}
