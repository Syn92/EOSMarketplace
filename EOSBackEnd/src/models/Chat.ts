export interface IMessageReceived {
    roomId: string;
    userId: string;
    text: string;
    createdAt: string | Date;
    offerValue: number | null;
    image: string | null;
}

export interface IMessageSent extends IMessageReceived {
    _id: string;
}

export interface IChatRoom {
    sellerId: string;
    buyerId: string;
    serviceId: string;
    contractId: string | null;
}

export interface IChatRoomReceived {
    room: IChatRoom
    userId: string;
    text: string;
}

export interface IChatRoomSent extends IChatRoom {
    _id: string;
}