//import { Binary } from "bson";

export interface Service {
    title: string;
    description: string;
    material: string;
    images: string[];
    priceEOS: number;
    serviceType: string;
    category: string;
    position: string;
    owner: string;
    thumbnail: string;
    ownerName?: string;
    cadastreId: string;
    markerPos: {latitude: number; longitude: number;};
}

export interface User {
    uid: string;
}

export interface ServiceRequest {
    serviceID: string,
    reqDescription: string,
    requestUserUID: string,
    serviceOwner: string
}

export interface ContractRequest {
    _id: string | null,
    roomId: string,
    serviceId: string,
    dealId?:string,
    finalPriceEOS: string,
    buyer: string,
    seller: string,
    accepted: boolean,
    deposit: boolean,
    buyerWalletAccount?: string,
    sellerWalletAccount?:string,
}

export interface RequestStatus {
    contractId: string,
    roomId: string,
    accepted: boolean
}

/*
'serviceType': selectedServType,
      'category': selectedCat,
      'price': price,
      'description': description,
      'material': material,
      'images': image,
      'positon': position, */