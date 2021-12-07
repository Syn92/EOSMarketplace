import * as React from 'react';
import { StyleSheet, Text, Image, View, Share, TouchableOpacity, ScrollView, Modal, KeyboardAvoidingView, TextInput } from 'react-native';
import { RootTabScreenProps } from '../types';
import { servTypeSell } from '../constants/Utils';
import { Icon } from 'react-native-elements';
import axios from 'axios';
import ServerConstants from '../constants/Server';
import Loading from '../components/Loading';
import Carousel, { Pagination } from 'react-native-snap-carousel';
import { getAddress } from '../utils/Cadastre';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import SuccessModalView from '../components/SuccessModalView';
import { transact } from '../components/Anchor';
import { ChatContext, ChatSocketContext } from '../navigation/ChatSocketProvider';
import { ISentRoom } from '../interfaces/Chat';
import { IService } from '../interfaces/Service';
import ImageView from "react-native-image-viewing";
import SnackBar from 'react-native-snackbar-component'

export default function PostDetailsScreen({route, navigation }: RootTabScreenProps<'PostDetails'>) {
    const id: any = route.params;

    const { rooms } =  React.useContext(ChatContext);
    const { socket } =  React.useContext(ChatSocketContext);
    const { user } =  React.useContext(AuthenticatedUserContext);
    const [service, setService] = React.useState<IService>();
    const [loading, setLoading] = React.useState(true);
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [modalVisible, setModalVisible] = React.useState(false);
    const [offerDetails, setOfferDetails] = React.useState('');
    const [offerSent, setOfferSent] = React.useState(false)
    const [errorMsg, setErrorMsg] = React.useState('');
    const [snackBarVisible, setSnackBarVisible] = React.useState(false);
    const [snackBarText, setSnackBarText] = React.useState('');
    const [showImageModal, setShowImageModal] = React.useState(false)

    const fetchData = async () => {
      try {
        axios.get(ServerConstants.local + 'post/?id='+id).then((response) => {
            setService(response.data as IService);
            setOfferSent(rooms.some(x => x.service._id == (response.data as IService)._id))
            setLoading(false);
        })
      } catch (e) {
        setLoading(false)
        console.error('Fetch Post Details: ', e)
      }
    }

    const _renderItem = ({item, index}) => {
        return (
          <TouchableOpacity onPress={() => {setShowImageModal(true)}}>
              <Image key={index} source={{uri: item, width: 250, height: 250}}/>
              <ImageView
                  images={service.images.map((e) => {return {uri: e}})}
                  imageIndex={activeIndex}
                  visible={showImageModal}
                  onRequestClose={() => setShowImageModal(false)}
              />
          </TouchableOpacity>
        );
    }

    const onShare = async () => {
      try {
        const result = await Share.share({
          message:
            'EOS Marketplace | this service might interest you ! | ' + service.title ,
            title: 'EOS Marketplace'
        }, {dialogTitle: 'Share EOS marketplace services'});
        if (result.action === Share.sharedAction) {
          setSnackBarText('Service shared')
          setSnackBarVisible(true)
          setTimeout(() => {setSnackBarVisible(false)}, 5000)
        } else if (result.action === Share.dismissedAction) { //IOS
          setSnackBarText('Service sharing cancelled')
          setSnackBarVisible(true)
          setTimeout(() => {setSnackBarVisible(false)}, 20000)
        }
      } catch (error) {
        alert(error.message);
      }
    };

    async function sendServiceRequest() {
      try {

        if (offerDetails.length == 0){
          setErrorMsg('Enter a description')
          return;
        }

        const param: ISentRoom = {
          room: {
            serviceId: service._id,
            buyerId: service.serviceType == 'Offering' ? user.uid : service.owner,
            sellerId: service.serviceType == 'Offering' ? service.owner : user.uid
          },
          userId: user.uid,
          text: offerDetails,
        }
        setLoading(true)
        socket.emit('newRoom', param)
        // await axios.post(ServerConstants.local + 'post/request', param)
        setLoading(false)
        setOfferSent(true)

      } catch (e) {
        if (e.response.status == 400)
          setErrorMsg(e.response.data)
        else {
          setErrorMsg('Server Error')
          console.log(e)
        }

        setLoading(false)
      }
    }

    function closeModal() {
      setErrorMsg('')
      setModalVisible(false);
      // navigation.navigate('TabThree')
    }

    function modalView() {
      return (
        <KeyboardAvoidingView behavior='padding' style={styles.modal}>
          <View style={styles.modalContentContainer}>
              <Text style={styles.modalTitle}>Send a Message</Text>
              <Text style={styles.modalDesc}>Enter a description of your needs:</Text>
              {errorMsg.length !=0 ? <Text style={styles.modalError}>{errorMsg}</Text>: null}
              <TextInput
                value={offerDetails}
                style={styles.textBox}
                numberOfLines={10}
                multiline={true}
                onChangeText={(text: string) => {
                  setOfferDetails(text)
                }}/>
              <Text style={styles.modalInfo}> The advertiser will send you an offer if your request has been accepted </Text>

          </View>

          {loading ? <Loading/> : null}

          <View style={styles.modalButtonContainer}>
            <TouchableOpacity style={styles.modalButton} onPress={closeModal}>
              <Text style={styles.buttonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalButton} onPress={sendServiceRequest}>
              <Text style={styles.buttonText}>Request</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )
    }

    React.useEffect(() => {
        fetchData();
    }, [])

        return (
          service ?
          <ScrollView contentContainerStyle={{flexGrow: 1}}>
          <View style={styles.container}>
            <Modal
              statusBarTranslucent={true}
              animationType='fade'
              transparent={true}
              visible={modalVisible}
              onRequestClose={closeModal}>
                <View style={styles.centeredView}>
                    {!offerSent ? modalView() :
                      <SuccessModalView message='Message sent!'>
                        <TouchableOpacity style={styles.interestedButton} onPress={closeModal}>
                          <Text style={styles.buttonText}>Done</Text>
                        </TouchableOpacity>
                      </SuccessModalView>}
                </View>
            </Modal>
              <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                  <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                    <Icon name="keyboard-arrow-left" size={40} color="#04B388"/>
                  </TouchableOpacity>
                  <Text style={styles.imageTitle}>{service.title}</Text>
                  <TouchableOpacity style={styles.shareButton} onPress={onShare}>
                    <Icon name="share" size={35} color="#04B388"/>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.contentCard} onPress={() => {
                  navigation.navigate('PublicProfile', {uid: service.owner})
                }}>
                    <Icon style={styles.iconCard} name="storefront" color="#04B388"></Icon>
                    <Text>{service.serviceType == servTypeSell ? 'Offered by ' : 'Searched by '}
                      <Text style={styles.owner}>{service.ownerName}</Text>
                    </Text>
                </TouchableOpacity>

                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} name="category" color="#04B388"></Icon>
                    <Text style={styles.textCard}>{service.category}</Text>
                </View>

                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} name="place" color="#04B388"></Icon>
                    <Text style={styles.textCard}>{getAddress(service.cadastre)}</Text>
                </View>

                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} name="pan-tool" color="#04B388"></Icon>
                    <Text style={styles.textCard}>{service.material}</Text>
                </View>

                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} name="attach-money" color="#04B388"></Icon>
                    <Text style={styles.textCard}>{service.priceEOS} EOS</Text>
                </View>

                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} name="description" color="#04B388"></Icon>
                    <Text style={styles.textCard}>{service.description}</Text>
                </View>

                <Carousel
                  layout={"default"}
                  data={service.images}
                  sliderWidth={300}
                  itemWidth={250}
                  renderItem={_renderItem}
                  onSnapToItem = {setActiveIndex}
                  layoutCardOffset={18}/>
                  <Pagination
                    dotsLength={service.images.length}
                    activeDotIndex={activeIndex}
                    containerStyle={{ backgroundColor: 'white' }}
                    dotStyle={{
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        marginHorizontal: 8,
                        backgroundColor: '#04B388'
                    }}
                    inactiveDotStyle={{
                        // Define styles for inactive dots here
                    }}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                  />
                  { service.owner != user.uid ? <TouchableOpacity style={styles.interestedButton} onPress={() => setModalVisible(true)}>
                    <Text style={{...styles.buttonText, textDecorationLine: 'underline'}}>Contact advertiser</Text>
                  </TouchableOpacity> : null}
              </View>
          <SnackBar visible={snackBarVisible} textMessage={snackBarText} position="bottom"/>
          </View>
          </ScrollView> : <Loading/>
    )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'row',
  },
  backButton: {
    display: 'flex',
    flexBasis: '10%',
    alignSelf: 'flex-start',
  },
  shareButton: {
    display: 'flex',
    flexBasis: '10%',
    alignSelf: 'flex-end',
  },
  imageTitle: {
    textDecorationLine: 'underline',
    color: '#04B388',
    fontSize: 18,
    textTransform: 'capitalize',
    flexBasis: '80%',
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  cardContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '80%',
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 40,
    padding: 10,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
  },
  centeredView: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    // marginTop: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.57)',
  },
  image: {
    borderRadius: 25,
    marginHorizontal: 5,
  },
  contentCard: {
    alignItems: 'center',
    width: '75%',
    display: 'flex',
    flexDirection: 'row',
    marginVertical: 7,
    paddingVertical: 15,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
    width: 0,
    height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    backgroundColor: 'white',
  },
  iconCard: {marginHorizontal: 5},
  textCard: {width: '85%'},
  interestedButton: {
    paddingVertical: '4%',
    paddingHorizontal: '6%',
    marginTop: '5%',
    borderRadius: 10,
    marginBottom: '5%',
    backgroundColor: '#04B388',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    letterSpacing: 0.5
  },
  modal: {
    alignItems: 'center',
    backgroundColor: 'white',
    maxHeight: '70%',
    borderRadius: 10,
    width: '80%'
  },
  modalContentContainer: {
    marginTop: '4%',
    width: '85%',
  },
  modalButtonContainer: {
    marginVertical: '4%',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  modalTitle: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 20,
    marginBottom: '2%',
  },
  modalDesc: {
    color: 'black',
    fontSize: 12,
  },
  modalError: {
    color: 'red',
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: '5%',
  },
  modalInfo: {
    color: 'black',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: '2%',
  },
  modalButton: {
    marginHorizontal: '2%',
    paddingVertical: '4%',
    alignItems: 'center',
    width: '30%',
    borderRadius: 10,
    backgroundColor: '#04B388',
  },
  // TODO: respondive o,o
  textBox: {
    textAlignVertical: 'top',
    borderWidth: 1,
    borderRadius: 5,
    padding: 5,
    borderColor: 'lightgrey',
    width: '100%',
    maxHeight: 240,
  },
  owner: {
    textDecorationLine: 'underline',
    color: '#04B388'
  }
});
