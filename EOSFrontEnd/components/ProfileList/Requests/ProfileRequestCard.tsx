import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, Image, View, TouchableOpacity } from 'react-native'
import { RequestInfo, RequestIndex } from '../../../interfaces/Services';
import { Contract } from '../../../interfaces/Contracts';
import { ChatContext } from '../../../navigation/ChatSocketProvider';
import { IRoom } from '../../../interfaces/Chat';

interface Prop {
    requestInfo: RequestInfo,
    request: Contract,
    onUpdate: () => Promise<void>
}

export function ProfileRequestCard(props: Prop) {

    const navigation = useNavigation()
    const { rooms } =  React.useContext(ChatContext);
    const [ cardType, setCardType ] = useState<RequestIndex>();

    useEffect(() => {
        setCardType(props.requestInfo.requestUser ? RequestIndex.selling : RequestIndex.buying)
    }, [])


    function onPressHandle() {
        const room = rooms.find((room: IRoom) => room.contract?._id == props.request._id)

        if (room)
            navigation.navigate('Chat', room)
    }

    return (
        <TouchableOpacity style={styles.card} onPress={onPressHandle}>
            <View style={styles.imageContainer}>
                <Image style={styles.image} source={{uri: props.requestInfo.thumbnail, width: 50, height: 50}}/>
            </View>
            <View style={styles.contentContainer}>
                <View style={styles.row}>
                    <Text style={styles.textTitle}>Service Name:</Text>
                    <Text style={styles.textContent}>{props.requestInfo.title}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.textTitle}>{cardType == RequestIndex.selling ? 'Requested by: ' : 'Requested to: ' }</Text>
                    <Text style={styles.textContent}>{cardType == RequestIndex.selling ? props.requestInfo.requestUser: props.requestInfo.serviceOwner}</Text>
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        marginVertical: 10,
        width: '88%',
        padding: 5,
        alignContent: 'center',
        alignSelf: 'center',
        borderRadius: 15,
        backgroundColor: 'white',

        // shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    },
    centeredView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 22,
    },
    imageContainer: {
        paddingVertical: '3%',
        justifyContent: 'center',
    },
    image: {
        borderRadius: 25,
        marginHorizontal: 15,
    },
    contentContainer: {
        flex: 1,
        paddingVertical: '3%',
        justifyContent: 'space-between',
    },
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center'
    },
    textTitle: {
        fontWeight: 'bold',
    },
    textContent: {
        marginLeft: '2%',
        fontSize: 12
    },
})

const modalStyles = StyleSheet.create({
    modalView: {
        margin: 20,
        width: '95%',
        // minHeight: '40%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: '2%',

        //shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 11,
        },
        shadowOpacity: 0.55,
        shadowRadius: 14.78,

        elevation: 22,
    },
    confirmationModalView: {
        margin: 20,
        width: '70%',
        // height: '30%',
        backgroundColor: 'white',
        borderRadius: 15,
        padding: '2%',
        alignItems: 'center',
        justifyContent: 'center',

        //shadow
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 11,
        },
        shadowOpacity: 0.55,
        shadowRadius: 14.78,
        elevation: 22,

    },
    contentContainer: {
        marginTop: '3%',
        paddingHorizontal: '2%',
        paddingVertical: '3%',
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.3)',
        borderRadius: 5
    },
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'center'
    },
    titleContainer: {
        flexDirection: 'row',
    },
    titleContentContainer: {
        marginVertical: '3%',
        marginLeft: '3%',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
    },
    contentTitle: {
        alignSelf: 'flex-start',
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: '2%',
        borderBottomWidth: 1,
    },
    user: {
        fontSize: 17
    },
    image: {
        marginHorizontal: 15,
    },
    button: {
        backgroundColor: '#04b388',
        borderRadius: 10,
        elevation: 2,
        paddingVertical: '3%',
        marginHorizontal: '3%',
        marginTop: '5%',
        marginBottom: '3%',
        width: '25%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        color: 'white',
        fontWeight: 'bold',
    }
})