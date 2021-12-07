import { IService } from "./Service";
import { User } from "./User";
import { IMessage as ITempMessage } from 'react-native-gifted-chat';
import { Contract, ContractRequest } from "./Contracts";
import { ServiceStatus } from "./Services";

export type IGiftedMessage = ITempMessage & {offerValue: number | null, lastOffer: boolean | null, denied: boolean | null, accepted: boolean | null, expired: boolean | null}

export interface ISentRoom {
    room: {
        sellerId: string;
        buyerId: string;
        serviceId: string;
    }
    userId: string;
    text: string;
}

export interface IRoom {
    _id: string;
    user: User;
    service: IService;
    contract: ContractRequest | null;
}

export interface IMessage extends ISentMessage {
    _id: string;
}

export interface ISentMessage {
    roomId: string;
    userId: string;
    text: string;
    createdAt: string;
    seen: boolean;
    offerValue: number | null;
    image: string | null;
}

export function getCardTitle(room: IRoom) : string {
    return room.user.name + ' - ' + room.service.title;
}

export function toGiftedMessage(message: IMessage, user: User, room?: IRoom | null): IGiftedMessage {
    return {
        _id: message._id,
        text: message.text,
        createdAt: new Date(message.createdAt),
        user: {_id: user.uid, name: user.name},
        sent: true,
        received: message.seen,
        offerValue: message.offerValue,
        image: message.image,
        accepted: room?.contract && room.contract.accepted,
        denied: room && !room.contract && room.service.status == ServiceStatus.OPEN,
        lastOffer: false,
        expired: room?.service?.otherUser &&
            ((room.service.owner != user.uid && room.service.otherUser != user.uid)
            || (room.service.owner == user.uid && room.service.otherUser != room.user.uid))
    }
}

export function toIMessage(message: IGiftedMessage, room: IRoom): IMessage {
    return {...toISentMessage(message, room), _id: message._id.toString()}
}

export function toISentMessage(message: IGiftedMessage, room: IRoom): ISentMessage {
    return {
        text: message.text,
        createdAt: message.createdAt.toString(),
        userId: message.user._id.toString(),
        roomId: room._id,
        seen: false,
        offerValue: message.offerValue,
        image: message.image,
    }
}

export function getContractMessage(room: IRoom, user: User, value: number): ISentMessage {
    return {
        text: '',
        createdAt: new Date().toISOString(),
        userId: user.uid,
        roomId: room._id,
        seen: false,
        offerValue: value,
        image: null
    }
}

export function getImageMessage(room: IRoom, user: User, image: string): ISentMessage {
    return {
        text: '',
        createdAt: new Date().toISOString(),
        userId: user.uid,
        roomId: room._id,
        seen: false,
        offerValue: null,
        image: image
    }
}