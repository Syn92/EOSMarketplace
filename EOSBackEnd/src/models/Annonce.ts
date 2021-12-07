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

export enum ServiceStatus {
    OPEN = 'open',
    IN_PROGRESS = 'inProgress',
    COMPLETED = 'completed'
}

export interface RequestStatus {
    roomId: string,
    status: ServiceStatus,
    serviceId: string | null,
    otherUser: string | null,
}
