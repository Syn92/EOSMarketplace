import { Db, MongoClient } from "mongodb";
import * as MongoDB from "mongodb"
import { ContractRequest, RequestStatus, Service, User } from "../models/Annonce";
import { IChatRoom, IChatRoomSent, IMessageReceived, IMessageSent } from "../models/Chat";

import { Storage, UploadResponse } from '@google-cloud/storage'
import * as fs from 'fs-extra'
import { randomBytes } from 'crypto';

import { INotifsInfo } from "../models/Notifs";
import { Sockets } from "./sockets";

const projectId = 'eos-marketplace'
const keyFilename = './src/config/eos-marketplace-8fe746010057.json'
const storage = new Storage({projectId, keyFilename})
const bucketURL = 'https://storage.googleapis.com/eos-nation-images/'

// Define bucket.
var myBucket = storage.bucket('eos-nation-images');
export class Database {

    private static client: MongoClient;
    private static db: Db;
    private static readonly URI: string = "mongodb+srv://userTest:EOSpassword@eoscluster.h8i7s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";

    static connect() {
        const { MongoClient } = require('mongodb');
        this.client = new MongoClient(this.URI, { useNewUrlParser: true, useUnifiedTopology: true });
        this.client.connect(() => {
            console.log("Database connected");
            this.db = this.client.db("EOSCluster");
        });
    }

    static async loop(array: string[]) {
      const asyncResults = [];
      for (const item of array) {
        const asyncResult = await this.uploadImage(item);
        asyncResults.push(asyncResult);
      }
      return asyncResults;
    }

    static updateServiceImage(service: Service, images: string[], thumbnail: string): Service{
      service.images = images;
      service.thumbnail = thumbnail;
      return service;
    }

    static addService(service: Service) {
        return new Promise(async (resolve) => {
          let imageNames: string[] = await this.loop(service.images);
          console.log(imageNames);
          this.clearFiles()

          this.db.collection("Services").insertOne(this.updateServiceImage(service, imageNames, imageNames[0]), (err, res) => {
              if (err) throw err;
              resolve("The service has been created.");
          })
        })
    }

    static createContract(body: ContractRequest): Promise<any> {
      return new Promise(async (resolve) => {
        if(body._id) {
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(body._id) },
                { $set: { 
                  dealId: body.dealId,
                  finalPriceEOS: body.finalPriceEOS 
                }},
                (err, res) => {
                    if(err) throw err;
                    resolve({success: true, data: {contractId:body._id,dealId:body.dealId}})
                }
            );
        } else {
            const {_id, roomId, ...request } = body
            this.db.collection('Contracts').insertOne(
                {
                  ...request,
                  serviceId: new MongoDB.ObjectId(body.serviceId),
                  creationDate: new Date(),
                  serviceDelivered: false,
                  serviceReceived: false,
                }, (err, res) => {
                if (err) throw err
                this.db.collection('ChatRooms').updateOne(
                    {_id: new MongoDB.ObjectId(body.roomId)},
                    {$set: {contractId: res!.insertedId.toString()}},
                    (err2, res2) => {
                        if(err2) throw err2;
                        Sockets.newContractRequest({...body, _id: res!.insertedId.toString()})
                        resolve({success: true, data: {contractId:res!.insertedId,dealId:body.dealId}})
                    }
                )
              })
            }
      })
    }

    static getContractByUID(query: any): Promise<any> {
      return new Promise((resolve) => {
        let uid: string = query.uid;
        this.db.collection('Contracts').aggregate([
          { $match: {
            $or: [{ buyer: uid }, { seller: uid }]
          }},
          { $lookup: {
            from: 'Users',
            localField: 'buyer',
            foreignField: 'uid',
            as: 'buyer'
          }},
          { $lookup: {
            from: 'Users',
            localField: 'seller',
            foreignField: 'uid',
            as: 'seller'
          }},
          { $lookup: {
            from: 'Services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'serviceDetail'
          }},
          { $unwind: '$serviceDetail' },
          { $lookup: {
            from: 'Users',
            localField: 'serviceDetail.owner',
            foreignField: 'uid',
            as: 'serviceDetail.ownerName'
          }},
          { $unwind: '$serviceDetail.ownerName'},
          { $set: { "serviceDetail.ownerName": "$serviceDetail.ownerName.name" } },
          { $lookup: {
            from: 'Cadastre',
            localField: 'serviceDetail.cadastreId',
            foreignField: 'properties.ID_UEV',
            as: 'serviceDetail.cadastre'
          }},
          { $unwind: {
            path: "$serviceDetail.cadastre",
            preserveNullAndEmptyArrays: true
          }},
          { $unwind: '$buyer' },
          { $unwind: '$seller' },
        ]).toArray((err, res) => {
          if (err) throw err

          resolve(res);
        })
      })
    }

    static getContractRequests(query: any): Promise<any> {

      return this.getContractByUID(query).then((res) => {
        let contracts = {
          buying: res.filter((i: any) => i.buyer.uid == query.uid && !i.accepted),
          selling: res.filter((i: any) => i.seller.uid == query.uid && !i.accepted),
        }

        return contracts
      })
    }

    static getAcceptedContracts(query: any): Promise<any> {
      return this.getContractByUID(query).then((res) => {
        let contracts = res.filter((i: any) => (i.buyer.uid == query.uid || i.seller.uid == query.uid) && i.accepted)

        return contracts
      })
    }

    static getContract(query: any): Promise<any> {
      return new Promise((resolve) => {
        this.db.collection('Contracts').aggregate([
          { $match: {
            "_id": new MongoDB.ObjectId(query.id)
          }},
          { $lookup: {
            from: 'Users',
            localField: 'buyer',
            foreignField: 'uid',
            as: 'buyer'
          }},
          { $lookup: {
            from: 'Users',
            localField: 'seller',
            foreignField: 'uid',
            as: 'seller'
          }},
          { $lookup: {
            from: 'Services',
            localField: 'serviceId',
            foreignField: '_id',
            as: 'serviceDetail'
          }},
          { $unwind: '$serviceDetail' },
          { $lookup: {
            from: 'Users',
            localField: 'serviceDetail.owner',
            foreignField: 'uid',
            as: 'serviceDetail.ownerName'
          }},
          { $unwind: '$serviceDetail.ownerName'},
          { $set: { "serviceDetail.ownerName": "$serviceDetail.ownerName.name" } },
          { $lookup: {
            from: 'Cadastre',
            localField: 'serviceDetail.cadastreId',
            foreignField: 'properties.ID_UEV',
            as: 'serviceDetail.cadastre'
          }},
          { $unwind: {
            path: "$serviceDetail.cadastre",
            preserveNullAndEmptyArrays: true
          }},
          { $unwind: '$buyer' },
          { $unwind: '$seller' },
        ]).toArray((err, res: any) => {
          if (err) throw err
          resolve(res[0]);
        })
    })
    }

    static deleteContractRequest(query: any): Promise<any> {
      return new Promise((resolve) => {
        let requestID: string = query.id;
        this.db.collection('Contracts').deleteOne({ _id: new MongoDB.ObjectId(requestID)}, (err, res)=> {
          if (err) throw err;
          this.db.collection('ChatRooms').findOneAndUpdate({contractId: requestID}, {$set: {contractId: null}}, (err2, res2) => {
            if(err2) throw err;
            const status: RequestStatus = {
                contractId: requestID,
                roomId: res2?.value?._id.toString(),
                accepted: false,
            }
            Sockets.newRequestStatus(status)
            resolve(res);
          })
        })
      });
    }

    static acceptContractRequest(body: any): Promise<any> {
      return new Promise((resolve) => {

        const [serviceId, contractId] = [body.serviceId, body.contractId]

        //todo: delete annonce aussi?
        // delete other contracts for same service
        // this.db.collection('Contracts').deleteMany(
        //   {
        //     serviceId: new MongoDB.ObjectId(serviceId),
        //     _id: { $ne: new MongoDB.ObjectId(contractId)}
        //   },
        //   (err, res) => {
        //     if (err) throw err

        //     // update contract to accepted
        //     this.db.collection('Contracts').updateOne(
        //       { _id: new MongoDB.ObjectId(contractId) },
        //       { $set: {accepted: true }},
        //       (err, res2) => {
        //         if (err) throw err

        //         // update service to inProgress
        //         this.db.collection('Services').updateOne(
        //           {_id: new MongoDB.ObjectId(serviceId) },
        //           { $set: {
        //             status: 'inProgress',
        //             // acceptedBy: acceptedBy
        //           }},
        //           (err, res3) => {
        //             if (err) throw err
        //             resolve({ deleteRequest: res, updateContract: res2, updateService: res3 })
        //           }
        //         )
        //       }
        //     )
        // })
        // update contract to accepted
            this.db.collection('Contracts').updateOne(
              { _id: new MongoDB.ObjectId(contractId) },
              { $set: {accepted: true }},
              (err, res) => {
                if (err) throw err
                // update service to inProgress
                this.db.collection('Services').updateOne(
                  {_id: new MongoDB.ObjectId(serviceId) },
                  { $set: {
                    status: 'inProgress',
                    // acceptedBy: acceptedBy
                  }},
                  (err, res2) => {
                    if (err) throw err
                    this.db.collection('ChatRooms').findOne({contractId: contractId}).then(room => {
                        const statusReq: RequestStatus = {
                            contractId: contractId,
                            roomId: (room as IChatRoomSent)._id.toString(),
                            accepted: true,
                        }
                        Sockets.newRequestStatus(statusReq);
                        resolve({ updateContract: res, updateService: res2 })
                    })
                  }
                )
              })
              }
            )
    }

    static depositContract(body: any): Promise<any> {
      return new Promise((resolve) => {

        const contractId = body.contractId;

        //todo: delete annonce aussi?
        // delete other contracts for same service
        // update contract to accepted
        this.db.collection('Contracts').updateOne(
          { _id: new MongoDB.ObjectId(contractId) },
          { $set: {deposit: true }},
          (err, res) => {
            if (err) throw err
            resolve(res);
          })
          }
        )
    }

    static serviceDeliveredContract(body: any): Promise<any> {
      return new Promise((resolve) => {

        const contractId = body.contractId;

        //todo: delete annonce aussi?
        // delete other contracts for same service
        // update contract to accepted
        this.db.collection('Contracts').updateOne(
          { _id: new MongoDB.ObjectId(contractId) },
          { $set: {serviceDelivered: true }},
          (err, res) => {
            if (err) throw err
            resolve(res);
          })
          }
        )
    }

    static serviceReceivedContract(body: any): Promise<any> {
      return new Promise((resolve) => {

        const contractId = body.contractId;

        //todo: delete annonce aussi?
        // delete other contracts for same service
        // update contract to accepted
        this.db.collection('Contracts').updateOne(
          { _id: new MongoDB.ObjectId(contractId) },
          { $set: {serviceReceived: true }},
          (err, res) => {
            if (err) throw err
            resolve(res);
          })
          }
        )
    }

    static async UploadImageContract(body: any): Promise<any> {
      return new Promise(async (resolve) => {
        const contractId = body.contractId;
        let imageName: string = await this.uploadImage(body.image);
        this.db.collection('Contracts').updateOne(
          { _id: new MongoDB.ObjectId(contractId) },
          { $set: {accepted: true}, $push: {images: imageName }},
          (err, res) => {
            if (err) throw err
            this.clearFiles();
            resolve(res)
          })
      })
    }



    static uploadImage(data: string): Promise<string> {
      return new Promise((resolve) => {
          let name = randomBytes(20).toString('hex') + '.png';
          if (!fs.existsSync('src/asset/'))
            fs.mkdirSync('src/asset/', {recursive: true})
          fs.writeFile('src/asset/'+ name,data,{encoding: 'base64'}).then(() => {
            storage.bucket('eos-nation-images').upload('../EOSBackEnd/src/asset/'+name).then((res: UploadResponse) =>{
              resolve(bucketURL + res[0].name);
            })
          });
      })
    }

    static async clearFiles(): Promise<void> { // empty id directory before adding new files
      try {
        await fs.emptyDir('src/asset')
        console.log('success!')
      } catch (err) {
        console.error(err)
      }
    }

    static addRating(body: any): Promise<any> {

      const req = { uid: body.uid, rating: body.rating}

      return new Promise((resolve) => {
        this.db.collection('Users').findOne({ uid: req.uid }, (err, res) => {
          if (err) throw err

          if (!res) {
            resolve({success: false, msg: 'no user matching'})
            return;
          }

          let newRatings;
          if (res.rating === undefined)
            newRatings = { rating: req.rating, nbRatings: 1 }
          else {
            newRatings = {
              rating: ((res.rating * res.nbRatings) + req.rating ) / (res.nbRatings + 1),
              nbRatings: res.nbRatings + 1
            }
          }

          this.db.collection('Users').updateOne(
            { uid: req.uid },
            { $set: newRatings},
            (err, res) => {
              if (err) throw err

              resolve(res)
            }
          )
        })
      })
    }

    static getOpenServices(query: any): Promise<any> {
      return new Promise((resolve) => {
        const option: MongoDB.FindOptions = {projection: {'images':0}}

        const owner = query.uid
        let matchCond: {owner?: string, status: string} = { status: 'open'}

        if (owner) matchCond['owner'] = owner

        this.db.collection('Services').aggregate([
            { $match: matchCond },
            { $lookup: {
                from: 'Users',
                localField: 'owner',
                foreignField: 'uid',
                as: 'ownerName'
            }},
            { $unwind: '$ownerName'},
            { $set: { "ownerName": "$ownerName.name" } },
            { $lookup: {
                  from: 'Cadastre',
                  localField: 'cadastreId',
                  foreignField: 'properties.ID_UEV',
                  as: 'cadastre'
            }},{ $unwind: {
                path: "$cadastre",
                preserveNullAndEmptyArrays: true
            }}
          ], option).toArray((err: any, res: any) => {
              if (err) throw err;
              resolve(res);
          });
      })
    }

    static getService(query: any): Promise<any> {
      return new Promise((resolve) => {
          console.log(query)
          let collection: MongoDB.Collection = this.db.collection('Services');
          collection.aggregate([
            { $match: {'_id': new MongoDB.ObjectId(query.id)} },
            { $lookup: {
                from: 'Users',
                localField: 'owner',
                foreignField: 'uid',
                as: 'ownerName'
            }},
            { $unwind: '$ownerName'},
            { $set: { "ownerName": "$ownerName.name" } },
            { $lookup: {
              from: 'Cadastre',
              localField: 'cadastreId',
              foreignField: 'properties.ID_UEV',
              as: 'cadastre'
            }},
            { $unwind: {
              path: "$cadastre",
              preserveNullAndEmptyArrays: true
            }}
            ]).toArray((err: any, res: any) => {
              if(err) throw err;
              resolve(res[0]);
          })
      })
    }

    static addUser(user: User): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Users").insertOne(user, (err, res) => {
                if (err) throw err;
                console.log(res?.insertedId.toString() + "was added to the collection Users.");
                resolve("The user has been created.");
            });
        })
    }

    static checkUser(query: any): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Users").findOne({ uid: query.uid }, (err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        })
    }

    static updateUserImage(query: any): Promise<Object> {
      return new Promise(async (resolve) => {
        let avatarUrl = await this.uploadImage(query.avatar);
        this.db.collection('Users').updateOne(
          { uid: query.uid },
          { $set: {'avatar': avatarUrl} },
          (err: any, res: any) => {
            if (err){
              throw err
            } else {
              console.log('res')
              resolve({succeded: true,  result: res})
          }
          this.clearFiles();
          }
        )
      })
    }

    static getUsers(): Promise<User[]> {
        return new Promise((resolve) => {
            this.db.collection('Users').find()
            .toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        })
    }

    static getAddressAutocomplete(query: string): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Cadastre").aggregate([
                {
                  '$search': {
                    'index': 'address',
                    'compound': {
                      'should': [
                        {
                          'autocomplete': {
                            'query': query,
                            'path': 'properties.CIVIQUE_DEBUT'
                          }
                        }, {
                          'autocomplete': {
                            'query': query,
                            'path': 'properties.NOM_RUE'
                          }
                        }
                      ]
                    }
                  }
                }, {
                    '$limit': 5
                }, {
                    '$project': {
                        '_id': 0,
                        'type': 1,
                        'properties.ID_UEV': 1,
                        'properties.CIVIQUE_DEBUT': 1,
                        'properties.NOM_RUE': 1,
                        'properties.MUNICIPALITE': 1,
                        'geometry': 1
                    }
                }
              ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        })
    }

    static getCadastreNear(pos: [number, number]): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Cadastre").aggregate([
                {
                  '$geoNear': {
                    'near': {
                      'type': 'Point',
                      'coordinates': pos
                    },
                    'distanceField': 'distance',
                    'maxDistance': 200,
                    'spherical': true
                  }
                }, {
                  '$group': {
                    '_id': {
                      'geometry': '$geometry'
                    },
                    'type': {
                      '$first': '$type'
                    },
                    'properties': {
                      '$first': '$properties'
                    },
                    'geometry': {
                      '$first': '$geometry'
                    }
                  }
                }, {
                  '$project': {
                    '_id': 0,
                    'type': 1,
                    'properties.ID_UEV': 1,
                    'properties.CIVIQUE_DEBUT': 1,
                    'properties.NOM_RUE': 1,
                    'properties.MUNICIPALITE': 1,
                    'geometry': 1
                  }
                }
            ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        })
    }

    static modifyUser(body: any): Promise<Object> {
        return new Promise((resolve) => {
            this.db.collection('Users').updateOne(
                { uid: body.uid },
                { $set: body.patch },
                (err: any, res: any) => {
                    if (res.acknowledged && res.matchedCount > 0){
                        resolve({succeded: true,  result: res})
                    } else {
                        resolve({succeded: false, result: err})
                    }
                }
            )
        })
    }

    static getChatRooms(userId: string, roomId?: string): Promise<Object[]> {
        return new Promise((resolve) => {
            const matchCondition = roomId ? {'_id': new MongoDB.ObjectId(roomId)} : {
                '$or': [
                  { 'buyerId': userId }, { 'sellerId': userId }
                ]
              }

            this.db.collection('ChatRooms').aggregate([
                {
                  '$match': matchCondition
                }, {
                  '$project': {
                    'serviceObjId': { '$toObjectId': '$serviceId' },
                    'contractObjId': { '$toObjectId': '$contractId' },
                    'textId' : { '$toString': '$_id' },
                    'userId': {
                      '$cond': [
                        { '$eq': ['$buyerId', userId] }, '$sellerId', '$buyerId'
                      ]
                    }
                  }
                }, {
                  '$lookup': {
                    'from': 'Services',
                    'localField': 'serviceObjId',
                    'foreignField': '_id',
                    'as': 'services'
                  }
                },
                {
                  '$lookup': {
                    'from': 'Contracts',
                    'localField': 'contractObjId',
                    'foreignField': '_id',
                    'as': 'contracts'
                  }
                },{
                  '$lookup': {
                    'from': 'Users',
                    'localField': 'userId',
                    'foreignField': 'uid',
                    'as': 'users'
                  }
                }, {
                  '$lookup': {
                    'from': 'ChatMessages',
                    'let': {'testId' : '$textId'},
                    'pipeline': [{
                      '$match': { '$expr': { '$eq': ['$roomId', '$$testId'] } }
                      }, {
                      '$sort': {  'createdAt': 1 }
                      }, {
                      '$limit': 1
                      },
                    ],
                    'as': 'message'
                  }
                }, {
                  '$project': {
                    'service': { '$first': '$services' },
                    'user': { '$first': '$users' },
                    'lastMessage': { '$first': '$message' },
                    'contract': { '$first': '$contracts'},
                  }
                },
                {
                  '$project': {
                    'service.images': 0,
                  }
                }
              ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        })
    }


    static getChatMessages(roomId: string): Promise<IMessageSent> {
        return new Promise((resolve) => {
            this.db.collection('ChatMessages').find({ roomId }).sort({'createdAt': 1})
                .toArray((err: any, res: any) => {
                    if (err) throw err;
                    resolve(res);
                });
        })
    }

    static addChatMessage(message: IMessageReceived): Promise<string> {
        return new Promise(async (resolve) => {
            message.createdAt = new Date(message.createdAt)
            if(message.image) {
                let imageNames: string[] = await this.loop([message.image]);
                this.clearFiles()
                message.image = imageNames[0]
            }

            this.db.collection('ChatMessages').insertOne(message, (err, res) => {
                if (err) throw err;
                resolve(res!.insertedId.toString())
            });
        })
    }

    static addChatRoom(room: IChatRoom): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection('ChatRooms').insertOne(room, (err, res) => {
                if (err) throw err;
                resolve(res!.insertedId.toString())
            });
        })
    }

    static setMessagesSeen(userId: string, roomId: string): Promise<void> {
        return new Promise((resolve) => {
            this.db.collection('ChatMessages').updateMany({'userId': {$ne: userId}, 'roomId': roomId}, {$set: {seen: true}}, (err, res) => {
                if (err) throw err;
                resolve()
            });
        })
    }

    static setRegistrationToken(userId: string, token: string): Promise<void> {
        return new Promise((resolve) => {
            console.log('setting token ', token, ' on user ', userId)
            this.db.collection('Users').updateOne({'uid': userId}, {$set: {'registrationToken': token}}, (err, res) => {
                if (err) throw err;
                resolve()
            });
        })
    }

    static getNotifsInfo(message: IMessageSent): Promise<INotifsInfo | null> {
        return new Promise((resolve) => {
            this.db.collection('ChatRooms').aggregate([
                {'$match': {'_id': new MongoDB.ObjectId(message.roomId)}
                }, {
                    '$project': {
                        'receiverId': {
                            '$cond': [
                                {'$eq': ['$buyerId', message.userId]}, '$sellerId', '$buyerId'
                            ]
                        },
                        'senderId': message.userId
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'receiverId',
                        'foreignField': 'uid',
                        'as': 'receiver'
                    }
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'senderId',
                        'foreignField': 'uid',
                        'as': 'sender'
                    }
                }, {
                    '$project': {
                        '_id': 0,
                        'senderName': {'$first': '$sender.name'},
                        'receiverToken': {'$first': '$receiver.registrationToken'}
                    }
                }
            ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res.length > 0 ? res[0] : null);
            })
        })
    }

}
