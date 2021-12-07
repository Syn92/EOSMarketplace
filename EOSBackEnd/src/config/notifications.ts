import Expo, { ExpoPushMessage } from "expo-server-sdk";
import { IMessageSent } from "../models/Chat";
import { Database } from "./database";

export class Notifications {
    private static expo = new Expo();

    public static sendMessageNotif(message: IMessageSent) {
        Database.getNotifsInfo(message).then(infos => {
            if (!infos || !infos.receiverToken) return;
            if (!Expo.isExpoPushToken(infos.receiverToken)) {
                console.error(`Push token ${infos.receiverToken} is not a valid Expo push token`);
                return;
            }

            let messageBody;

            if(message.text) {
                messageBody = message.text;
            } else if(message.offerValue) {
                messageBody = '(Offer Received)'
            } else if(message.image) {
                messageBody = '(Image Received)'
            }

            const messageNotif: ExpoPushMessage = {
                to: infos.receiverToken,
                title: 'New Message' + (infos.senderName ? (' From ' + infos.senderName) : ''),
                body: messageBody
            }

            Notifications.expo.sendPushNotificationsAsync([messageNotif]).then(tickets => {
                // let receipts = await expo.getPushNotificationReceiptsAsync(tickets.map(x => x.id));
            })
        })
    }
}