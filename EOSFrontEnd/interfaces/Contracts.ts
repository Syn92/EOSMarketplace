import { IService } from "./Service";
import { ServiceStatus } from "./Services";
import { User } from "./User";

export interface ContractRequest {
    _id: string | null,
    roomId: string,
    serviceId: string,
    buyer: string,
    seller: string,
    finalPriceEOS: string,
    accepted: boolean,
    deposit: boolean,
    buyerWalletAccount?: string,
    sellerWalletAccount?:string,
}

export interface Contract {
    _id: string,
    serviceId: string,
    buyer: User,
    seller: User,
    finalPriceEOS: string,
    accepted: boolean,
    serviceDetail: IService,
    deposit?: boolean,
    serviceReceived?: false,
    serviceDelivered?: false,
    images?: string[],
    creationDate?: Date,
    dealId: string,
}

export interface RequestStatus {
    roomId: string;
    status: ServiceStatus;
    serviceId: string | null;
    otherUser: string | null;
}