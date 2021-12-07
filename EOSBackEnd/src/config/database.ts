import { Db, MongoClient } from "mongodb";
import * as MongoDB from "mongodb";
import { ContractRequest, RequestStatus, Service, ServiceStatus, User } from "../models/Annonce";
import { IChatRoom, IChatRoomSent, IMessageReceived, IMessageSent } from "../models/Chat";

import { Storage, StorageOptions, UploadResponse } from '@google-cloud/storage'
import * as fs from 'fs-extra'
import { randomBytes } from 'crypto';

import { INotifsInfo } from "../models/Notifs";
import { Sockets } from "./sockets";

const projectId = 'eos-marketplace'
const bucketURL = 'https://storage.googleapis.com/eos-nation-images/'

// Define bucket.
export class Database {
    private static client: MongoClient;
    private static db: Db;
    private static readonly URI: string = "mongodb+srv://userTest:EOSpassword@eoscluster.h8i7s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
    private static storage: any;

    static async connect() {
        
        const { MongoClient } = require('mongodb');
        this.client = new MongoClient(this.URI, { useNewUrlParser: true, useUnifiedTopology: true });
        await this.client.connect()
        console.log("Database connected");
        this.db = this.client.db("EOSCluster");

        this.db.collection('Config').findOne( {type: 'service_account'} ).then((res: any) => {
          var options: StorageOptions = {credentials: res, projectId: projectId};        
          this.storage = new Storage(options)
        })

    }

    //#region Images
    // create the image locally temporarily then upload it to the image storage
    static uploadImage(data: string): Promise<string> {
        return new Promise((resolve) => {
            let name = randomBytes(20).toString('hex') + '.png';
            if (!fs.existsSync('/tmp/'))
                fs.mkdirSync('/tmp/', { recursive: true });
            fs.writeFile('/tmp/' + name, data, { encoding: 'base64' }).then(() => {
                this.storage.bucket('eos-nation-images').upload('/tmp/' + name).then((res: UploadResponse) => {
                    resolve(bucketURL + res[0].name);
                });
            });
        });
    }

    // empty temp local images directory before adding new files
    static async clearFiles(): Promise<void> {
        try {
            await fs.emptyDir('/tmp');
        } catch (err) {
            console.error(err);
        }
    }

    // upload images and return all results
    static async uploadImages(array: string[]) {
        const asyncResults = [];
        for (const item of array) {
            const asyncResult = await this.uploadImage(item);
            asyncResults.push(asyncResult);
        }
        return asyncResults;
    }

    static updateServiceImage(service: Service, images: string[], thumbnail: string): Service {
        service.images = images;
        service.thumbnail = thumbnail;
        return service;
    }

    //#endregion

    //#region Services
    static addService(service: Service) {
        return new Promise(async (resolve) => {
            let imageNames: string[] = await this.uploadImages(service.images);
            this.clearFiles();

            this.db.collection("Services").insertOne(this.updateServiceImage(service, imageNames, imageNames[0]), (err, res) => {
                if (err) throw err;
                resolve("The service has been created.");
            });
        });
    }

    // get open, in progress and completed services for a user
    static async getPrivateProfileServices(query: any): Promise<any> {
        const uid = query.uid;
        return new Promise(async (resolve) => {
            const open = await this.getOpenServices(query);
            const contracts = await this.getContractByUID(query);
            const inProgress = contracts.filter((i: any) => (i.buyer.uid == uid || i.seller.uid == uid) && i.accepted);

            this.db.collection('CompletedContracts').aggregate([
                {
                    $match: {
                        $or: [{ 'buyer.uid': uid }, { 'seller.uid': uid }]
                    }
                },
                {
                    $lookup: {
                        from: 'Services',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'serviceDetail'
                    }
                },
                { $unwind: '$serviceDetail' },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'serviceDetail.owner',
                        foreignField: 'uid',
                        as: 'serviceDetail.ownerName'
                    }
                },
                { $unwind: '$serviceDetail.ownerName' },
                { $set: { "serviceDetail.ownerName": "$serviceDetail.ownerName.name" } },
                {
                    $lookup: {
                        from: 'Cadastre',
                        localField: 'serviceDetail.cadastreId',
                        foreignField: 'properties.ID_UEV',
                        as: 'serviceDetail.cadastre'
                    }
                },
                {
                    $unwind: {
                        path: "$serviceDetail.cadastre",
                        preserveNullAndEmptyArrays: true
                    }
                },
            ]).toArray((err, res) => {
                if (err) throw err;
                resolve({ open: open, inProgress: inProgress, completed: res });
            });
        });
    }

    // return all services with status open (visible to all users)
    static getOpenServices(query: any): Promise<any> {
        return new Promise((resolve) => {
            const option: MongoDB.FindOptions = { projection: { 'images': 0 } };

            const owner = query.uid;
            let matchCond: { owner?: string, status: string; } = { status: ServiceStatus.OPEN };

            if (owner) matchCond['owner'] = owner;

            this.db.collection('Services').aggregate([
                { $match: matchCond },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'owner',
                        foreignField: 'uid',
                        as: 'ownerName'
                    }
                },
                { $unwind: '$ownerName' },
                { $set: { "ownerName": "$ownerName.name" } },
                {
                    $lookup: {
                        from: 'Cadastre',
                        localField: 'cadastreId',
                        foreignField: 'properties.ID_UEV',
                        as: 'cadastre'
                    }
                }, {
                    $unwind: {
                        path: "$cadastre",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ], option).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        });
    }

    // get informations of a specific service
    static getService(query: any): Promise<any> {
        return new Promise((resolve) => {
            let collection: MongoDB.Collection = this.db.collection('Services');
            collection.aggregate([
                { $match: { '_id': new MongoDB.ObjectId(query.id) } },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'owner',
                        foreignField: 'uid',
                        as: 'ownerName'
                    }
                },
                { $unwind: '$ownerName' },
                { $set: { "ownerName": "$ownerName.name" } },
                {
                    $lookup: {
                        from: 'Cadastre',
                        localField: 'cadastreId',
                        foreignField: 'properties.ID_UEV',
                        as: 'cadastre'
                    }
                },
                {
                    $unwind: {
                        path: "$cadastre",
                        preserveNullAndEmptyArrays: true
                    }
                }
            ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res[0]);
            });
        });
    }

    //#endregion

    //#region Requests & Contracts
    static createContract(body: ContractRequest): Promise<any> {
        return new Promise(async (resolve) => {
            if (body._id) { // the contract already exists, update it
                this.db.collection('Contracts').updateOne(
                    { _id: new MongoDB.ObjectId(body._id) },
                    {
                        $set: {
                            dealId: body.dealId,
                            finalPriceEOS: body.finalPriceEOS
                        }
                    },
                    (err, res) => {
                        if (err) throw err;
                        resolve({ success: true, data: { contractId: body._id, dealId: body.dealId } });
                    }
                );
            } else { // insert a new contract
                const { _id, roomId, ...request } = body;
                this.db.collection('Contracts').insertOne(
                    {
                        ...request,
                        serviceId: new MongoDB.ObjectId(body.serviceId),
                        creationDate: new Date(),
                        serviceDelivered: false,
                        serviceReceived: false,
                    }, (err, res) => {
                        if (err) throw err;
                        this.db.collection('ChatRooms').updateOne( // set the contract on the corresponding chat room
                            { _id: new MongoDB.ObjectId(body.roomId) },
                            { $set: { contractId: res!.insertedId.toString() } },
                            (err2, res2) => {
                                if (err2) throw err2;
                                Sockets.newContractRequest({ ...body, _id: res!.insertedId.toString() });
                                resolve({ success: true, data: { contractId: res!.insertedId, dealId: body.dealId } });
                            }
                        );
                    });
            }
        });
    }

    // gets all contracts associated to a user (buying or selling)
    static getContractByUID(query: any): Promise<any> {
        return new Promise((resolve) => {
            let uid: string = query.uid;
            this.db.collection('Contracts').aggregate([
                {
                    $match: {
                        $or: [{ buyer: uid }, { seller: uid }]
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'buyer',
                        foreignField: 'uid',
                        as: 'buyer'
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'seller',
                        foreignField: 'uid',
                        as: 'seller'
                    }
                },
                {
                    $lookup: {
                        from: 'Services',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'serviceDetail'
                    }
                },
                { $unwind: '$serviceDetail' },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'serviceDetail.owner',
                        foreignField: 'uid',
                        as: 'serviceDetail.ownerName'
                    }
                },
                { $unwind: '$serviceDetail.ownerName' },
                { $set: { "serviceDetail.ownerName": "$serviceDetail.ownerName.name" } },
                {
                    $lookup: {
                        from: 'Cadastre',
                        localField: 'serviceDetail.cadastreId',
                        foreignField: 'properties.ID_UEV',
                        as: 'serviceDetail.cadastre'
                    }
                },
                {
                    $unwind: {
                        path: "$serviceDetail.cadastre",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $unwind: '$buyer' },
                { $unwind: '$seller' },
            ]).toArray((err, res) => {
                if (err) throw err;

                resolve(res);
            });
        });
    }

    // get all contract requests for a user
    static getContractRequests(query: any): Promise<any> {
        return this.getContractByUID(query).then((res) => {
            return {
                buying: res.filter((i: any) => i.buyer.uid == query.uid && !i.accepted),
                selling: res.filter((i: any) => i.seller.uid == query.uid && !i.accepted),
            }
        });
    }

    static getContract(query: any): Promise<any> {
        return new Promise((resolve) => {
            this.db.collection('Contracts').aggregate([
                {
                    $match: {
                        "_id": new MongoDB.ObjectId(query.id)
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'buyer',
                        foreignField: 'uid',
                        as: 'buyer'
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'seller',
                        foreignField: 'uid',
                        as: 'seller'
                    }
                },
                {
                    $lookup: {
                        from: 'Services',
                        localField: 'serviceId',
                        foreignField: '_id',
                        as: 'serviceDetail'
                    }
                },
                { $unwind: '$serviceDetail' },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'serviceDetail.owner',
                        foreignField: 'uid',
                        as: 'serviceDetail.ownerName'
                    }
                },
                { $unwind: '$serviceDetail.ownerName' },
                { $set: { "serviceDetail.ownerName": "$serviceDetail.ownerName.name" } },
                {
                    $lookup: {
                        from: 'Cadastre',
                        localField: 'serviceDetail.cadastreId',
                        foreignField: 'properties.ID_UEV',
                        as: 'serviceDetail.cadastre'
                    }
                },
                {
                    $unwind: {
                        path: "$serviceDetail.cadastre",
                        preserveNullAndEmptyArrays: true
                    }
                },
                { $unwind: '$buyer' },
                { $unwind: '$seller' },
            ]).toArray((err, res: any) => {
                if (err) throw err;
                resolve(res[0]);
            });
        });
    }

    // change contract status to completed
    static completeContract(body: any): Promise<any> {
        return new Promise((resolve) => {
            let contractId = body.contractId;

            this.db.collection('Contracts').aggregate([ // get contract completed
                {
                    $match: {
                        "_id": new MongoDB.ObjectId(contractId)
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'buyer',
                        foreignField: 'uid',
                        as: 'buyer'
                    }
                },
                {
                    $lookup: {
                        from: 'Users',
                        localField: 'seller',
                        foreignField: 'uid',
                        as: 'seller'
                    }
                },
                { $unwind: '$buyer' },
                { $unwind: '$seller' },
            ]).toArray((err, res: any) => {
                if (err) throw err;
                if (res.length == 0) throw new Error();

                resolve(res);
                // delete the contract
                this.db.collection('Contracts').deleteOne({ _id: new MongoDB.ObjectId(contractId) }, (err, delete1Res) => {
                    if (err) throw err;
                });

                // update the service status
                this.db.collection('Services').updateOne(
                    { _id: res[0].serviceId },
                    { $set: { status: ServiceStatus.COMPLETED } },
                    (err2, _) => {
                        if (err2) throw err2;
                    }
                );

                // add the contract to the completed contracts
                this.db.collection('CompletedContracts').insertMany(res, (err2, insertRes) => {
                    if (err2) throw err2;

                    // update the chat room using this new contract object
                    this.db.collection('ChatRooms').findOneAndUpdate({ contractId: contractId }, { $set: { contractId: null } }, (err3, res2) => {
                        if (err3) throw err3;
                        const status: RequestStatus = {
                            roomId: res2?.value?._id.toString(),
                            status: ServiceStatus.COMPLETED,
                            serviceId: res[0].serviceId,
                            otherUser: null
                        };
                        // send sockets to notify of the status change
                        Sockets.newRequestStatus(status);
                        resolve(insertRes);
                    });
                });
            });
        });
    }

    // delete contract request when it has been cancelled
    static deleteContractRequest(query: any): Promise<any> {
        return new Promise((resolve) => {
            let requestID: string = query.id;
            this.db.collection('Contracts').deleteOne({ _id: new MongoDB.ObjectId(requestID) }, (err, res) => {
                if (err) throw err;
                // remove it from the chat room too
                this.db.collection('ChatRooms').findOneAndUpdate({ contractId: requestID }, { $set: { contractId: null } }, (err2, res2) => {
                    if (err2) throw err;
                    const status: RequestStatus = {
                        roomId: res2?.value?._id.toString(),
                        status: ServiceStatus.OPEN,
                        serviceId: null,
                        otherUser: null,
                    };
                    Sockets.newRequestStatus(status);
                    resolve(res);
                });
            });
        });
    }

    // update contract status to accepted
    static acceptContractRequest(body: any): Promise<any> {
        return new Promise((resolve) => {
            const [serviceId, contractId, otherUser] = [body.serviceId, body.contractId, body.otherUser];

            // update contract to accepted
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(contractId) },
                { $set: { accepted: true } },
                (err, res) => {
                    if (err) throw err;
                    // update service to inProgress
                    this.db.collection('Services').updateOne(
                        { _id: new MongoDB.ObjectId(serviceId) },
                        {
                            $set: {
                                status: ServiceStatus.IN_PROGRESS,
                                otherUser: otherUser
                            }
                        },
                        (err2, res2) => {
                            if (err2) throw err2;
                            // update status in the chat room
                            this.db.collection('ChatRooms').findOne({ contractId: contractId }).then(room => {
                                const roomId = (room as IChatRoomSent)._id.toString();
                                this.db.collection('ChatRooms').updateMany({ '_id': { $ne: new MongoDB.ObjectId(roomId) }, 'serviceId': serviceId }, { $set: { 'contractId': null } });
                                const statusReq: RequestStatus = {
                                    roomId: roomId,
                                    status: ServiceStatus.IN_PROGRESS,
                                    serviceId: serviceId,
                                    otherUser: otherUser
                                };
                                // notify users of the status change
                                Sockets.newRequestStatus(statusReq);
                                resolve({ updateContract: res, updateService: res2 });
                            });
                        }
                    );
                });
        }
        );
    }

    // change contract status to deposit
    static depositContract(body: any): Promise<any> {
        return new Promise((resolve) => {
            const contractId = body.contractId;
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(contractId) },
                { $set: { deposit: true } },
                (err, res) => {
                    if (err) throw err;
                    resolve(res);
                });
        });
    }

    // change contract status to delivered
    static serviceDeliveredContract(body: any): Promise<any> {
        return new Promise((resolve) => {
            const contractId = body.contractId;
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(contractId) },
                { $set: { serviceDelivered: true } },
                (err, res) => {
                    if (err) throw err;
                    resolve(res);
                });
        });
    }

    // change contract status to received
    static serviceReceivedContract(body: any): Promise<any> {
        return new Promise((resolve) => {
            const contractId = body.contractId;
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(contractId) },
                { $set: { serviceReceived: true } },
                (err, res) => {
                    if (err) throw err;
                    resolve(res);
                });
        });
    }

    // add an image to a contract
    static async UploadImageContract(body: any): Promise<any> {
        return new Promise(async (resolve) => {
            const contractId = body.contractId;
            let imageName: string = await this.uploadImage(body.image);
            this.db.collection('Contracts').updateOne(
                { _id: new MongoDB.ObjectId(contractId) },
                { $set: { accepted: true }, $push: { images: imageName } },
                (err, res) => {
                    if (err) throw err;
                    this.clearFiles();
                    resolve(res);
                });
        });
    }

    //#endregion

    //#region Users

    // add a rating to a user, changing his overall rating
    static addRating(body: any): Promise<any> {
        const req = { uid: body.uid, rating: body.rating };

        return new Promise((resolve) => {
            this.db.collection('Users').findOne({ uid: req.uid }, (err, res) => {
                if (err) throw err;

                if (!res) {
                    resolve({ success: false, msg: 'no user matching' });
                    return;
                }

                let newRatings;
                if (res.rating === undefined)
                    newRatings = { rating: req.rating, nbRatings: 1 };
                else {
                    newRatings = {
                        rating: ((res.rating * res.nbRatings) + req.rating) / (res.nbRatings + 1),
                        nbRatings: res.nbRatings + 1
                    };
                }

                this.db.collection('Users').updateOne(
                    { uid: req.uid },
                    { $set: newRatings },
                    (err2, res2) => {
                        if (err2) throw err2;

                        resolve(res2);
                    }
                );
            });
        });
    }

    static addUser(user: User): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Users").insertOne(user, (err, res) => {
                if (err) throw err;
                console.log(res?.insertedId.toString() + "was added to the collection Users.");
                resolve("The user has been created.");
            });
        });
    }

    static checkUser(query: any): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection("Users").findOne({ uid: query.uid }, (err: any, res: any) => {
                if (err) throw err;
                resolve(res);
            });
        });
    }

    static updateUserImage(query: any): Promise<Object> {
        return new Promise(async (resolve) => {
            let avatarUrl = await this.uploadImage(query.avatar);
            this.db.collection('Users').updateOne(
                { uid: query.uid },
                { $set: { 'avatar': avatarUrl } },
                (err: any, res: any) => {
                    if (err) {
                        throw err;
                    } else {
                        console.log('res');
                        resolve({ succeded: true, result: res });
                    }
                    this.clearFiles();
                }
            );
        });
    }

    static getUsers(): Promise<User[]> {
        return new Promise((resolve) => {
            this.db.collection('Users').find()
                .toArray((err: any, res: any) => {
                    if (err) throw err;
                    resolve(res);
                });
        });
    }

    static modifyUser(body: any): Promise<Object> {
        return new Promise((resolve) => {
            this.db.collection('Users').updateOne(
                { uid: body.uid },
                { $set: body.patch },
                (err: any, res: any) => {
                    if (res.acknowledged && res.matchedCount > 0) {
                        resolve({ succeded: true, result: res });
                    } else {
                        resolve({ succeded: false, result: err });
                    }
                }
            );
        });
    }

    //#endregion

    //#region Map
    // get autocomplete results based on a term queried
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
        });
    }

    // get all cadastre near a position (latitude, longitude)
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
        });
    }

    //#endregion

    //#region Chat

    // get all chat rooms for a user, or a specific room if roomId is specified
    static getChatRooms(userId: string, roomId?: string): Promise<Object[]> {
        return new Promise((resolve) => {
            const matchCondition = roomId ? { '_id': new MongoDB.ObjectId(roomId) } : {
                '$or': [
                    { 'buyerId': userId }, { 'sellerId': userId }
                ]
            };

            this.db.collection('ChatRooms').aggregate([
                {
                    '$match': matchCondition
                }, {
                    '$project': {
                        'serviceObjId': { '$toObjectId': '$serviceId' },
                        'contractObjId': { '$toObjectId': '$contractId' },
                        'textId': { '$toString': '$_id' },
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
                }, {
                    '$lookup': {
                        'from': 'Users',
                        'localField': 'userId',
                        'foreignField': 'uid',
                        'as': 'users'
                    }
                }, {
                    '$lookup': {
                        'from': 'ChatMessages',
                        'let': { 'testId': '$textId' },
                        'pipeline': [{
                            '$match': { '$expr': { '$eq': ['$roomId', '$$testId'] } }
                        }, {
                            '$sort': { 'createdAt': 1 }
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
                        'contract': { '$first': '$contracts' },
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
        });
    }

    // get all chat messages for a room, sorted by time created
    static getChatMessages(roomId: string): Promise<IMessageSent> {
        return new Promise((resolve) => {
            this.db.collection('ChatMessages').find({ roomId }).sort({ 'createdAt': 1 })
                .toArray((err: any, res: any) => {
                    if (err) throw err;
                    resolve(res);
                });
        });
    }

    static addChatMessage(message: IMessageReceived): Promise<string> {
        return new Promise(async (resolve) => {
            message.createdAt = new Date(message.createdAt);
            if (message.image) {
                let imageNames: string[] = await this.uploadImages([message.image]);
                this.clearFiles();
                message.image = imageNames[0];
            }

            this.db.collection('ChatMessages').insertOne(message, (err, res) => {
                if (err) throw err;
                resolve(res!.insertedId.toString());
            });
        });
    }

    static addChatRoom(room: IChatRoom): Promise<string> {
        return new Promise((resolve) => {
            this.db.collection('ChatRooms').insertOne(room, (err, res) => {
                if (err) throw err;
                resolve(res!.insertedId.toString());
            });
        });
    }

    static setMessagesSeen(userId: string, roomId: string): Promise<void> {
        return new Promise((resolve) => {
            this.db.collection('ChatMessages').updateMany({ 'userId': { $ne: userId }, 'roomId': roomId }, { $set: { seen: true } }, (err, res) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    //#endregion

    //#region Push Notifications

    // set the token used to send a push notification to a device
    static setRegistrationToken(userId: string, token: string): Promise<void> {
        return new Promise((resolve) => {
            this.db.collection('Users').updateOne({ 'uid': userId }, { $set: { 'registrationToken': token } }, (err, res) => {
                if (err) throw err;
                resolve();
            });
        });
    }

    // get information needed to send a push notification
    static getNotifsInfo(message: IMessageSent): Promise<INotifsInfo | null> {
        return new Promise((resolve) => {
            this.db.collection('ChatRooms').aggregate([
                {
                    '$match': { '_id': new MongoDB.ObjectId(message.roomId) }
                }, {
                    '$project': {
                        'receiverId': {
                            '$cond': [
                                { '$eq': ['$buyerId', message.userId] }, '$sellerId', '$buyerId'
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
                        'senderName': { '$first': '$sender.name' },
                        'receiverToken': { '$first': '$receiver.registrationToken' }
                    }
                }
            ]).toArray((err: any, res: any) => {
                if (err) throw err;
                resolve(res.length > 0 ? res[0] : null);
            });
        });
    }
    //#endregion

}
