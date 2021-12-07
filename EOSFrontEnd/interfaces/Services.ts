import { Contract } from "./Contracts";
import { IService } from "./Service";

export interface ServiceInfo {
    _id: string
    category: string,
    title: string,
    owner: string,
    price: number,
    position: string
}

export interface RequestInfo {
    thumbnail: string,
    title: string,
    isUnique: boolean,
    requestUser?: string,
    serviceOwner? : string
}

export interface ServiceData {
    open: Array<Object>,
    inProgress: Array<Contract>,
    completed: Array<Contract>,
}

export interface Request {
    _id: string,
    serviceID: string,
    buyer: string,
    seller: string,
    serviceDetail: IService,
}

export interface newDeal{
    buyer:string,
    seller:string,
    amount:number,
    description:string,
}
export interface Deal extends newDeal{
    dealId:string,
}

export interface RequestData {
    buying: Array<Contract>,
    selling: Array<Contract>,
}

export enum ServiceStatus {
    OPEN = 'open',
    IN_PROGRESS = 'inProgress',
    COMPLETED = 'completed'
}

export enum ServiceIndex {
    open = 0,
    inProgress = 1,
    completed = 2
}

export enum RequestIndex {
    selling = 0,
    buying = 1,
}
