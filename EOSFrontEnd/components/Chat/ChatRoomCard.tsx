import React, { useContext, useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { getCardTitle, IMessage, IRoom } from '../../interfaces/Chat';
import { AuthenticatedUserContext } from '../../navigation/AuthenticatedUserProvider';
import { ChatContext, ChatSocketContext } from '../../navigation/ChatSocketProvider';

interface IProp {
  room: IRoom;
  onPress: (room: IRoom) => any;
}

export default function ChatRoomCard(props: IProp) {
    const { messages, roomWatchedId } =  useContext(ChatContext);
    const { socket } =  useContext(ChatSocketContext);
    const { user } =  React.useContext(AuthenticatedUserContext);

    const [lastMessage, setLastMessage] = useState<IMessage | undefined>(undefined);

    const messagesSeenListener =  (userId: string, roomId: string) => {
        if (roomId == props.room._id) {
            setLastMessage(last => {
                if(last && !last.seen && last.userId != userId) {
                    return {...last, seen: true}
                } else {
                    return last
                }
            })
        }
    }

    const newMessageListener =  (message: IMessage) => {
        if (message.roomId == props.room._id) {
            if(roomWatchedId == props.room._id) {
                setLastMessage({...message, seen: true})
            } else {
                setLastMessage(message)
            }
        }
    }

    useEffect(() => {
        socket.on('messagesSeen', messagesSeenListener)
        socket.on('newMessage', newMessageListener)

        if(messages.has(props.room._id) && messages.get(props.room._id).length > 0) {
            setLastMessage(messages.get(props.room._id)[messages.get(props.room._id).length - 1]);
        }

        return () => {
            socket.off('messagesSeen', messagesSeenListener)
            socket.off('newMessage', newMessageListener)
        }
    }, [props.room._id])

    useEffect(() => {
        if(roomWatchedId == props.room._id) {
            setLastMessage(old => {return {...old, seen: true}});
        }
    }, [roomWatchedId])

    function getLastText() {
        if(!lastMessage)
            return '(No Messages)';

        if(lastMessage.offerValue)
            return '(Offer ' + (lastMessage.userId === user.uid ? 'Sent)' : 'Received)')


        if(lastMessage.image)
            return '(Image ' + (lastMessage.userId === user.uid ? 'Sent)' : 'Received)')

        return lastMessage.text
    }

  return (
    <TouchableOpacity style={styles.mainContainer} onPress={() => props.onPress(props.room)}>
        <View>
            <Image style={styles.image} source={props.room.user.avatar ? {uri: props.room.user.avatar} : require('../../assets/images/avatar.webp')}/>
        </View>
        <View style={styles.descriptionContainer}>
            <View style={styles.titleContainer}>
                <Text style={[styles.text, styles.title]} numberOfLines={1}>{getCardTitle(props.room)}</Text>
                <Text style={styles.text}>{lastMessage ? new Date(lastMessage.createdAt).toDateString() : ''}</Text>
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.text, styles.message, (lastMessage && lastMessage.userId != user.uid && !lastMessage.seen) ? styles.receivedUnseen : null ]} numberOfLines={1}>{getLastText()}</Text>
                {lastMessage && (<Text style={[styles.text, styles.tick]}>✓</Text>) }
                {(lastMessage && lastMessage.seen) && (<Text style={[styles.text, styles.tick]}>✓</Text>)}
            </View>
        </View>
    </TouchableOpacity>
  )
}


const styles = StyleSheet.create({
    mainContainer: {
        marginHorizontal: 20,
        marginVertical: 15,
        flexDirection: 'row',
    },
    descriptionContainer: {
        flexDirection: 'column',
        paddingTop: 2,
        paddingLeft: 10,
        flexShrink: 1,
    },
    titleContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
        width: '100%'
    },
    image: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    text: {
        flexGrow: 0,
        flexShrink: 0,
        color: 'black',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        flexGrow: 1,
        flexShrink: 1,
        marginRight: 10,
    },
    tick: {
        fontSize: 10,
        textAlignVertical: 'center',
    },
    textContainer: {
        // borderColor: 'black',
        // borderWidth: 1,
        flexDirection: 'row'
    },
    message: {
        marginRight: 10,
    },
    receivedUnseen: {
        fontWeight: 'bold'
    }
})