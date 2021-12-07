import { Namespace, Server, Socket } from "socket.io";
import { RequestStatus, ContractRequest } from "../models/Annonce";
import { IChatRoomReceived, IMessageReceived, IMessageSent } from "../models/Chat";
import { Database } from "./database";
import { Notifications } from "./notifications";

export class Sockets {

    private static io: Server;
    private static users: Map<string, Socket>;
    private static chatSocket: Namespace;

    public static connect(io: Server) {
        Sockets.users = new Map<string, Socket>();
        Sockets.io = io;
        Sockets.chatSocket = Sockets.io.of("/chat");
        Sockets.setUp();
    }

    public static newMessage(message: IMessageReceived) {
        Database.addChatMessage(message).then((newId) => {
            const newMessage: IMessageSent = {...message, _id: newId};
            Sockets.chatSocket.to(message.roomId).emit("newMessage", newMessage); // send to all
            Notifications.sendMessageNotif(newMessage);
        }).catch(err => {
            console.log(err);
        })
    }

    public static async newRoom(req: IChatRoomReceived) {
        Database.addChatRoom(req.room).then(async (newId) => {
            const buyerSocket = Sockets.users.get(req.room.buyerId);
            const sellerSocket = Sockets.users.get(req.room.sellerId);
            if(buyerSocket) {
                const newRooms = await Database.getChatRooms(req.room.buyerId, newId)
                Sockets.chatSocket.to(buyerSocket.id).emit("newRoom", newRooms[0]);
                buyerSocket.join(newId)
            }
            if(sellerSocket) {
                const newRooms = await Database.getChatRooms(req.room.sellerId, newId)
                Sockets.chatSocket.to(sellerSocket.id).emit("newRoom", newRooms[0]);
                sellerSocket.join(newId)
            }
            const message: IMessageReceived = {
                roomId: newId,
                userId: req.userId,
                text: req.text,
                createdAt: new Date().toISOString(),
                offerValue: null,
                image: null,
            }
            Sockets.newMessage(message);
        }).catch(err => { console.log(err); })
    }

    public static newRequestStatus(req: RequestStatus) {
        Sockets.chatSocket.to(req.roomId).emit('newRequestStatus', req)
    }

    public static newContractRequest(req: ContractRequest) {
        Sockets.chatSocket.to(req.roomId).emit('newContractRequest', req)
    }

    private static setUp(): void {
        Sockets.chatSocket.on('connection', (socket: Socket) => {
            socket.on('joinRoom', (roomId: string) => {
                socket.join(roomId);
            });

            socket.on("newMessage", Sockets.newMessage);

            socket.on('messagesSeen', (userId: string, roomId: string) => {
                Database.setMessagesSeen(userId, roomId).then(_ => {
                    socket.to(roomId).emit('messagesSeen', userId, roomId) // don't send to sender
                }).catch(err => {
                    console.log(err);
                })
            })

            socket.on('watchRooms', (userId: string, roomIds: string[]) => {
                Sockets.users.set(userId, socket);
                roomIds.forEach(roomId => socket.join(roomId))
            })

            socket.on('newRoom', Sockets.newRoom)

            socket.on('disconnect', () => {
                Sockets.users.forEach((userSocket, userId) => {
                    if(socket.id == userSocket.id) {
                        Sockets.users.delete(userId);
                    }
                })
            })
        });
    }

}