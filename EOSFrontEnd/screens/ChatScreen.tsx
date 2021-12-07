import { useFocusEffect } from '@react-navigation/native';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { Platform, ImageBackground, StyleSheet, Text, View, Image, Button, Modal, TouchableOpacity, TextInput, KeyboardAvoidingView } from 'react-native';
import { Icon, Overlay } from 'react-native-elements';
import { Actions, Bubble, Composer, GiftedChat, Send, MessageImage } from 'react-native-gifted-chat';
import { useImmer } from 'use-immer';
import { getContractMessage, getImageMessage, IGiftedMessage, IMessage, IRoom, toGiftedMessage, toISentMessage } from '../interfaces/Chat';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { ChatContext, ChatSocketContext } from '../navigation/ChatSocketProvider';
import { RootStackScreenProps } from '../types';
import uuid from 'react-native-uuid';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import ServerConstants from '../constants/Server';
import { ContractAPI } from '../services/Contract';
import { ContractRequest, RequestStatus } from '../interfaces/Contracts';
import ActionButton from '../components/ActionButton';
import ImageView from "react-native-image-viewing";
import { ServiceStatus } from '../interfaces/Services';

export default function ChatScreen({ navigation, route }: RootStackScreenProps<'Chat'>) {
  const [isSeller, setIsSeller] = React.useState<boolean>()
  const [showSendContract, setShowSendContract] = React.useState<boolean>(
    route.params.service.status == ServiceStatus.OPEN || (route.params.contract && !route.params.contract?.accepted)) //or deposited?
  const [giftedMessages, setGiftedMessages] = useImmer<IGiftedMessage[]>([]); //[new, ..., old]
  const [showContractDialog, setShowContractDialog] = useState<boolean>(false);
  const [lastOfferId, setLastOfferId] = useState<string | null>(null);
  const [contractValue, setContractValue] = useState<string>(route.params.service.priceEOS.toString());
  const [room, setRoom] = useImmer<IRoom>(route.params);
  const [errorOverlay, setErrorOverlay] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);

  const { user, urlData,setUrlData } =  React.useContext(AuthenticatedUserContext);
  const { messages, setRoomWatchedId }= React.useContext(ChatContext);
  const { socket } =  React.useContext(ChatSocketContext);
  const contractAPI = ContractAPI.getInstance()

  React.useEffect(()=> {
    setIsSeller(room.service.serviceType == 'Offering' ?
    (user.uid == room.service.owner)
    : (user.uid != room.service.owner))
  }, [])

  useEffect(() => {
    if(!urlData)
      return;
    let value = urlData.queryParams.value
    if(value == contractValue){
      const contractMessage = getContractMessage(route.params, user, value)
      const contractGiftedMessage = {...contractMessage, _id: uuid.v4().toString()}
      setGiftedMessages(previousMessages => GiftedChat.append(previousMessages, [{...toGiftedMessage(contractGiftedMessage, user), sent: false}]))
      socket.emit('newMessage', contractMessage)
      setLastOfferId(contractGiftedMessage._id)
      setUrlData(null)
    }
    }
    , [urlData])

  const messagesSeenListener = (userId: string, roomId: string) => {
    if(roomId == room._id) {
      setGiftedMessages(old => {old.forEach(x => { if(!x.received && x.user._id != userId) x.received = true})});
    }
  }

  const newMessageListener = (message: IMessage) => {
    if(message.roomId != room._id) return;

    if (message.userId == user.uid) { // from me, update it
      setGiftedMessages(old => {
        const sentIndex = old.findIndex(x => x.sent)
        const notSentIndex = sentIndex >= 1 ? sentIndex - 1 : 0
        old[notSentIndex].sent = true
        old[notSentIndex]._id = message._id
        old[notSentIndex].image = message.image
      });
    } else { // not from me, add it as seen
      appendMessages([{...message, seen: true, }])
    }
    if(message.offerValue) {
      setLastOfferId(message._id);
    }
  }

  const newRequestStatusListener = (status: RequestStatus) => {
    if(status.roomId == room._id) {
      if(status.status == ServiceStatus.OPEN) {
        setRoom(old => { old.contract = null })
        setGiftedMessages(old => { old.find(x => x.lastOffer).denied = true; })
        setShowSendContract(true)
      } else {
        setRoom(old => { old.contract.accepted = true })
        setGiftedMessages(old => { old.find(x => x.lastOffer).accepted = true; })
        setShowSendContract(false)
      }
    } else {
      if(status.serviceId == room.service._id && status.status != ServiceStatus.OPEN) {
        setRoom(old => { old.contract = null })
        setGiftedMessages(old => { old.find(x => x.lastOffer).expired = true; })
        setShowSendContract(false)
      }
    }
  }

  const newContractRequestListener = (request: ContractRequest) => {
    setRoom(old => {if(request.roomId == old._id) old.contract = request})
  }

  useFocusEffect(
    useCallback(() => {
      setRoomWatchedId(room._id);
      return () => {
        setRoomWatchedId(null)
      }
    }, [room._id])
  )

  useEffect(() => {
    setMessages(messages.get(room._id) || [])
    socket.on('messagesSeen', messagesSeenListener)
    socket.on('newMessage', newMessageListener)
    socket.on('newRequestStatus', newRequestStatusListener)
    socket.on('newContractRequest', newContractRequestListener)

    return function cleanup() {
      socket.off('messagesSeen', messagesSeenListener)
      socket.off('newMessage', newMessageListener)
      socket.off('newRequestStatus', newRequestStatusListener)
      socket.off('newContractRequest', newContractRequestListener)
      setGiftedMessages([])
    }
  }, [room._id])

  useEffect(() => {
    setGiftedMessages(old => {
      old.forEach(x => {if(x.offerValue != null) x.lastOffer = x._id == lastOfferId})
    })
  }, [lastOfferId])

  function sendMessage(sentMessages: IGiftedMessage[]) {
    setGiftedMessages(previousMessages => GiftedChat.append(previousMessages, sentMessages))
    for(const message of sentMessages.map(x => toISentMessage(x, room))) {
      socket.emit('newMessage', message)
    }
  }

  // only for adding a new received message
  function appendMessages(newMessages: IMessage[]) {
    setGiftedMessages(previousMessages =>
      GiftedChat.append(previousMessages,
        newMessages.map(message => {
          return {...toGiftedMessage(message, message.userId == user?.uid ? user : room.user, room),
            lastOffer: true, accepted: false, denied: false, expired: false}
        }).reverse())
    )
  }

  function setMessages(newMessages: IMessage[]) {
    setGiftedMessages(newMessages.map(message => toGiftedMessage(message, message.userId == user?.uid ? user : room.user, room)).reverse())
    setLastOfferId(newMessages.slice().reverse().find(x => x.offerValue)?._id)
  }

  function renderInputToolbar(props) {
    return (
      <View style={styles.inputToolbar}>
        <Composer {...props} textInputStyle={styles.textInput}/>
        <Send {...props} containerStyle={styles.send}>
          <Icon name="send" color="#0084ff"/>
        </Send>
        {isSeller && showSendContract && <Actions
          containerStyle={styles.actionButton}
          icon={() => <Icon name="description" color="grey"/>}
          onPressActionButton={() => setShowContractDialog(true)}/>}
        <Actions containerStyle={styles.actionButton}
          icon={() => <Icon name="image" color="grey"/>}
          onPressActionButton={() => sendImageMessage()}/>
    </View>
    )
  }

  function renderMessageImage(props: MessageImage<IGiftedMessage>['props']) {
    return (
      <View>
        <TouchableOpacity onPress={() => setShowImageModal(true)}>
          <Image source={{ uri: props.currentMessage.image }} style={{height: 100, width: 175, margin: 10}}/>
          <ImageView
              images={[{uri: props.currentMessage.image}]}
              imageIndex={0}
              visible={showImageModal}
              onRequestClose={() => setShowImageModal(false)}
          />
        </TouchableOpacity>
      </View>
    )
  }

  function getContractStatus(message: IGiftedMessage, isSender: boolean, messageStyle: any) {
    if(message._id != lastOfferId) {
      return (<Text style={[messageStyle]}>A newer offer has been made.</Text>)
    }
    const threeDays = 3 * 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
    if(new Date(message.createdAt).getTime() + threeDays <= new Date().getTime()) {
      return (<Text style={[messageStyle]}>The offer has expired.</Text>)
    }
    if(message.denied) {
      return (<Text style={[messageStyle]}>The offer has been denied.</Text>)
    }
    if(message.accepted) {
      return (<Text style={[messageStyle]}>The offer has been accepted!</Text>)
    }
    if(message.expired) {
      return (<Text style={[messageStyle]}>The service was offered to someone else.</Text>)
    }
    if(isSender) {
      return (<Text style={[messageStyle]}>Awaiting answer...</Text>)
    } else {
      return (<Button onPress={openOfferDetails} title="See Offer Details"></Button>)
    }
  }

  function renderCustomView(props: Bubble<IGiftedMessage>['props']) {
    if(props.currentMessage.offerValue) {
      const isSender = user.uid == room.service.owner
      const messageStyle = isSender ? styles.rightContractText : styles.leftContractText
      const thumbnail = room.service.thumbnail || 'https://cdn1.iconfinder.com/data/icons/business-company-1/500/image-512.png'

      return (
        <View style={[(isSender ? props.containerStyle.right : props.containerStyle.left) , styles.contractMessage]}>
          <Text style={[messageStyle, styles.titleContract]}>Offer {isSender ? 'Sent' : 'Received'}</Text>
          <TouchableOpacity onPress={openOfferDetails}  style={styles.contractContainer}>
            <Text style={[styles.contractText]}>{room.service.title}</Text>
            <Image style={styles.contractImage} source={{uri: thumbnail, width: 50, height: 50}}/>
            <Text style={[styles.contractText]}>{props.currentMessage.offerValue + " EOS"}</Text>
          </TouchableOpacity>
          {getContractStatus(props.currentMessage, isSender, messageStyle )}
        </View>
        )
    }

    return null
  }

  function openOfferDetails() {
    if(room.contract)
      navigation.navigate('Contract',{'id': room.contract._id, 'roomId': room._id})
    else {
      setErrorOverlay(true)
    }
  }

  function sendContract(value: number) {
    const contract: ContractRequest = {
      _id: room.contract?._id,
      roomId: room._id,
      serviceId: room.service._id,
      finalPriceEOS: contractValue,
      buyer: isSeller ? route.params.user.uid : user.uid,
      seller: isSeller ? user.uid : route.params.user.uid,
      accepted: false,
      deposit: false,
      sellerWalletAccount: user.walletAccountName,
      buyerWalletAccount:room.user.walletAccountName
    }

    axios.post(ServerConstants.local + 'post/request', contract).then(async (res:any) => {
      await contractAPI.acceptDeal(res.data.dealId,user.walletAccountName,value.toString())
      setShowContractDialog(false)
    }).catch(err => console.log('send contracts', err))
  }

  function sendImageMessage() {
    ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      base64: true,
    }).then((res: any) => {
      if (!res.cancelled) {
        const message = getImageMessage(room, user,  res.base64);
        const contractGiftedMessage = {...message, _id: uuid.v4().toString(), image: `data:image/jpeg;base64,${res.base64}`}
        setGiftedMessages(previousMessages => GiftedChat.append(previousMessages, [{...toGiftedMessage(contractGiftedMessage, user, room), sent: false}]))
        socket.emit('newMessage', message);
      }
    }).catch(err => console.log(err))
  }

  function sendContractDialog() {
    const cleanTitle = room.service.title.length > 15 ? room.service.title.substring(0, 15) : room.service.title
    return (
      <Modal
        statusBarTranslucent={true}
        animationType='fade'
        transparent={true}
        visible={showContractDialog}
        onRequestClose={() => setShowContractDialog(false)}>
        <View style={styles.centeredView}>
          <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.modal}>
            <Text style={styles.modalTitle}>Confirm Offer Request?</Text>
            <Text style={styles.modalDesc}>You are about to offer '{cleanTitle}' for </Text>
            <View style={styles.modalInputContainer}>
              <TextInput
                style={styles.modalInput}
                value={contractValue.toString()}
                keyboardType="numeric"
                onChangeText={(text: string) => { if(text == '' || text.match(/^(0|[1-9][0-9]{0,6})(\.[0-9]{0,6})?$/i)) setContractValue(text)}}/>
              <Text style={styles.modalDesc}>EOS</Text>
            </View>
            {!(+contractValue > 0) && <Text style={[styles.modalDesc, styles.modalError]}>* The value should be a number higher than 0.</Text> }
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity style={styles.modalButton} onPress={() => setShowContractDialog(false)}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalButton} onPress={() => { sendContract(+contractValue) }}>
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    )
  }

  return (
    <ImageBackground style={styles.container} source={require('../assets/images/bg.png')}>
      {/* <Text style={styles.title} numberOfLines={1}>{room.user.name + " - " + room.service.title}</Text> */}
      <View style={styles.chatContainer}>
        <GiftedChat messages={giftedMessages}
        isKeyboardInternallyHandled={Platform.OS === "ios" ? false : true}
        shouldUpdateMessage={(props, nextProps) => props.currentMessage !== nextProps.currentMessage}
        user={{_id: user.uid, name: user.name}} onSend={sendMessage}
        renderMessageImage={renderMessageImage}
        renderInputToolbar={renderInputToolbar}
        renderCustomView={renderCustomView}/>
        <KeyboardAvoidingView  behavior={Platform.OS === "ios" ? "padding" : "height"}  keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}/>
        </View>
        {sendContractDialog()}
      <Overlay overlayStyle={{height: '30%', display: 'flex', justifyContent: 'space-between', borderRadius: 10}} isVisible={errorOverlay} onBackdropPress={() => {setErrorOverlay(false)}}>
        <Icon name="error-outline" size={70} color="red"></Icon>
        <Text style={{fontSize: 30, textAlign: 'center'}}>Sorry !</Text>
        <Text style={{fontSize: 18, textAlign: 'center', width: '70%', color: 'gray'}}>Contract doesn't exist anymore</Text>
        <ActionButton styleContainer={{margin: '3%'}} title="OK" onPress={() => {setErrorOverlay(false)}}></ActionButton>
      </Overlay>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  chatContainer: {
    // height: '100%',
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 25,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexGrow: 1,
    flexShrink: 1,
    // flex:1,
  },
  title: {
    margin: 20,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white',
  },
  inputToolbar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    // height: 45,
    backgroundColor: 'white',
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    // paddingVertical: 8,
    paddingHorizontal: 10,
  },
  textInput: {
    justifyContent:'center',
    backgroundColor: 'white',
    marginBottom: 3,
    marginTop: 3,
    lineHeight: 22,
  },
  send: {
    justifyContent: 'center',
    marginBottom: 0,
    maxHeight: '100%',
  },
  actionButton: {
    marginBottom: 0,
    justifyContent: 'center'
  },
  contractMessage: {
    flexDirection: 'column',
    padding: 10,
  },
  titleContract: {
    fontWeight: 'bold',
    fontSize: 16,
    textAlign: 'center'
  },
  contractText: {
    color: 'black',
    fontSize: 14,
  },
  rightContractText: {
    color: 'white',
    textAlign: 'center'
  },
  leftContractText: {
    color: 'black',
    textAlign: 'center'
  },
  contractContainer: {
    alignSelf: 'center',
    backgroundColor: 'white',
    padding: 5,
    borderRadius: 10,
    // width: 150,
    marginVertical: 5,
  },
  contractImage: {
    width: 150,
    height: 70,
    marginVertical: 5,
  },
  centeredView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.57)',
  },
  modal: {
    alignItems: 'center',
    backgroundColor: 'white',
    maxHeight: '70%',
    borderRadius: 10,
    width: '80%',
    flexDirection: 'column',
    // padding: 15,
  },
  modalTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginVertical: 15,
  },
  modalDesc: {
    color: 'black',
    fontSize: 12,
  },
  modalButtonContainer: {
    marginVertical: 15,
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalButton: {
    marginHorizontal: 5,
    paddingVertical: 10,
    alignItems: 'center',
    width: '30%',
    borderRadius: 10,
    backgroundColor: '#04B388',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  modalInputContainer: {
    flexDirection: 'row',
    width: '50%',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  modalInput: {
    marginRight: 10,
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    borderColor: 'lightgrey',
    width: '100%',
  },
  modalError: {
    color: 'red'
  }
});
