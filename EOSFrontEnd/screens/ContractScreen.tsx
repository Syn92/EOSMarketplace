import { RootTabScreenProps } from "../types";
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, Image, ScrollView, Modal } from "react-native";
import * as React from 'react';
import { Icon } from "react-native-elements";
import {Contract } from '../interfaces/Contracts';
import ServerConstants from "../constants/Server";
import axios from "axios";
import Loading from "../components/Loading";
import { AuthenticatedUserContext } from "../navigation/AuthenticatedUserProvider";
import { SliderComponent } from "../components/Slider";
import ActionButton from "../components/ActionButton";
import CountDown from 'react-native-countdown-component'
import ActionButtonSecondary from "../components/ActionButtonSecondary";
import * as ImagePicker from 'expo-image-picker';
import Carousel, { Pagination } from "react-native-snap-carousel";
import {ContractAPI} from "../services/Contract";
import { Rating, AirbnbRating } from 'react-native-ratings';
import { ChatSocketContext } from "../navigation/ChatSocketProvider";
import ImageView from "react-native-image-viewing";


export default function ContractScreen({route, navigation }: RootTabScreenProps<'Contract'>) {
    let contractAPI:ContractAPI = ContractAPI.getInstance()
    const [roomId, setRoomId] = React.useState(route.params.roomId)
    const [contractId, setcontractId] = React.useState(route.params.id)
    const [contract, setContract] = React.useState<Contract>();
    const [rating, setRating] = React.useState(0);
    const { user, urlData,setUrlData } =  React.useContext(AuthenticatedUserContext);
    const [time, setTime] = React.useState<number>()
    const [activeIndex, setActiveIndex] = React.useState(0);
    const [ modalVisible, setModalVisible ] = React.useState(false);
    const [isError, setIsError] = React.useState(false)
    const { socket } =  React.useContext(ChatSocketContext);
    const [showImageModal, setShowImageModal] = React.useState(false)


    React.useEffect(() => {
        displayErrorModal(false)
        if(!urlData){
            console.log("returning")
            return
        }
        let value = urlData.queryParams.value
        if(value == 'accepted'){
            const otherUser = contract.serviceDetail.owner == contract.buyer.uid ? contract.seller.uid : contract.buyer.uid
            axios.patch(ServerConstants.local + 'post/accept', {serviceId: contract.serviceId, contractId: contract._id, otherUser: otherUser}).then( (res:any) => {
                socket.emit('contractUpdated', roomId)
            }).catch(err => console.log(err))
            setUrlData(null)
        } else if(value == 'deposited'){
            displayErrorModal(false)
            axios.patch(ServerConstants.local + 'post/deposit', {contractId: contract._id}).then((res:any) => {
                socket.emit('contractUpdated', roomId)
            }).catch(err => console.log(err))
            setUrlData(null)
        } else if (value == 'received'){
            displayErrorModal(false)
            axios.patch(ServerConstants.local + 'post/received', {contractId: contract._id}).then((res:any) => {
                socket.emit('contractUpdated', roomId)
                setModalVisible(true);
            }).catch(err => console.log(err))
            setUrlData(null)
        } else if (value == 'delivered'){
            displayErrorModal(false)
            axios.patch(ServerConstants.local + 'post/delivered', {contractId: contract._id}).then((res:any) => {
                socket.emit('contractUpdated', roomId)
                setModalVisible(true);
            }).catch(err => console.log(err))
            setUrlData(null)
        }
        else if (value == 'canceled'){
            displayErrorModal(false)
            axios.delete(ServerConstants.local + 'post', { params: { id: contract._id } }).then((res:any) => {
                socket.emit('contractDeleted', roomId)
                console.log(res);
                navigation.goBack();
            }).catch(err => console.log(err))
            setUrlData(null)
        }
    }, [urlData])


    const fetchContract = async () => {
        try {
            axios.get(ServerConstants.local + 'post/contract?id='+ contractId).then((response: any) => {
                setContract(response.data as Contract);
                let creationTime: number = new Date(response.data.creationDate).getTime() + 259200*1000 //3days in mseconds
                setTime((creationTime - (new Date().getTime()))/1000)

            })
          } catch (e) {
            console.error('Fetch Contract Details: ', e)
          }
    }



    React.useEffect(() => {
        fetchContract()
        setupSocket()
        return () => cleanUpSocket()
    }, [])

    function setupSocket() {
        console.log('setup')
        socket.on('contractUpdated', contractUpdateListner)
        socket.on('contractDeleted', contractDeletedListner)
    }

    function cleanUpSocket() {
        socket.off('contractUpdated', contractUpdateListner)
        socket.off('contractDeleted', contractDeletedListner)
    }

    function contractUpdateListner(empty: any[]) {
        console.log('here')
        fetchContract();
    }

    function contractDeletedListner(empty: any[]) {
        navigation.goBack();
    }

    function acceptContract() {
        contractAPI.acceptDeal(contract.dealId, user?.walletAccountName, 'accepted').then(() => {
            displayErrorModal(true);
        })
    }

    function refuseContract() {
        contractAPI.cancelDeal(contract.dealId, user?.walletAccountName, 'canceled').then(() => {
            displayErrorModal(true);
        })
    }

    function deposit() {
        contractAPI.deposit(contract.dealId, user?.walletAccountName, Number(contract.finalPriceEOS)).then(() => {
            displayErrorModal(true);
        })
    }

    function serviceReceived() {
        contractAPI.completeDeal(contract.dealId, user?.walletAccountName, 'received', 'goodsrcvd').then(() => {
            displayErrorModal(true);
        })
    }

    function serviceDelivered() {
        contractAPI.completeDeal(contract.dealId, user?.walletAccountName, 'delivered', 'delivered').then(() => {
            displayErrorModal(true);
        })
    }

    function displayErrorModal(value: boolean) {
            setIsError(value)
            setModalVisible(value)
    }

    const addPhoto = async () => {
        let result: any = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.All,
          quality: 1,
          base64: true,
        });
        if(!result.cancelled){
            axios.post(ServerConstants.local + 'post/contract/image', {contractId: contract._id, image:result.base64}).then(async () => {
                await fetchContract();
                socket.emit('contractUpdated', roomId)
            }).catch((e) => {
                console.log('add photo: ', e)
            })
        }

    }

    function renderBuyerSection(): any {
        return(
            contract.accepted ?
                (!contract.deposit ?
                    <View style={styles.lowerSection}>
                        <ActionButton title="Deposit" onPress={deposit}></ActionButton>
                    </View> :
                <View style={styles.lowerSection}>
                    {contract.serviceDelivered ? <SliderComponent isConfirm={contract.serviceReceived} callback={serviceReceived} ></SliderComponent> : <Text style={{textAlign: 'center'}}>Awaiting for the service to be delivered by the seller... </Text>}
                </View>) :
                <View style={styles.contractButtonContainer}>
                    <ActionButtonSecondary styleContainer={{width: '45%', borderRadius: 20}} title="Refuse" onPress={refuseContract}></ActionButtonSecondary>
                    <ActionButton styleContainer={{width: '45%',borderRadius: 20}} title="Accept" onPress={acceptContract}></ActionButton>
                </View>
        )
    }

    function renderSellerSection(): any {
        return(
            <View style={styles.lowerSection}>
                {contract.accepted ?
                (contract.deposit ?
                <View>
                    <SliderComponent  isConfirm={contract.serviceDelivered} callback={serviceDelivered} ></SliderComponent>
                    {contract.serviceDelivered ? null : <ActionButton title="Add photo" onPress={addPhoto}></ActionButton>}

                </View>
                :  <Text style={{textAlign: 'center'}}>Awaiting buyer's deposit... </Text>) :  <Text style={{textAlign: 'center'}}>Awaiting buyer's acceptance... </Text> }
            </View>
        )
    }

    function endRoutine(): any {
        console.log(rating)
        let body = {
            uid: user?.uid == contract.buyer.uid ? contract.seller.uid : contract.buyer.uid,
            rating: rating,
        }
        try {
            axios.post(ServerConstants.local + 'auth/rating', body).then(async () => {
                if(contract.serviceDelivered && contract.serviceReceived){
                    await axios.post(ServerConstants.local + 'post/completed', {contractId: contract._id}).then(() => {
                        socket.emit('contractDeleted', roomId)
                    })
                }
                    setModalVisible(false);
                }
            ).catch((err) => {console.log(err)})
        } catch (error) {
            console.log(error)
        }
    }

    const _renderItem = ({item, index}) => {
        return (
          <TouchableOpacity onPress={() => {setShowImageModal(true)}}>
              <Image key={index} source={{uri: item, width: 250, height: 250}}/>
              <ImageView
                  images={contract.images.map((e) => {return {uri: e}})}
                  imageIndex={activeIndex}
                  visible={showImageModal}
                  onRequestClose={() => setShowImageModal(false)}
              />
          </TouchableOpacity>
        );
    }

    function renderEndModal(): any {
      return (
        <View style={styles.endModalContainer}>
            <Text style={{fontSize: 18, marginTop: '10%', textAlign: 'center', width: '70%'}}>Thank you for using EOS marketplace</Text>
            <View style={{display: 'flex', alignItems: 'center', marginBottom: -25}}>
                <Text style={{fontSize: 25}}>Please Rate: </Text>
                <Text style={{fontSize: 18, fontWeight:'bold',}}>{user?.uid == contract.buyer.uid ? contract.seller.name : contract.buyer.name}</Text>
            </View>

            <Rating
                type="custom"
                ratingTextColor="#04B388"
                showRating={true}
                fractions={1}
                startingValue={2.5}
                onFinishRating={(e: number) => {setRating(e)}}
            />
            <ActionButton styleContainer={{width: '50%', marginBottom: '5%'}} title="Thank you" onPress={endRoutine}></ActionButton>
        </View>
      );
    }

    function renderErrorModal(): any {
        return (
            <View style={styles.endModalContainer}>
                <Icon style={{marginTop: '10%',}} name="error-outline" size={100} color="red"></Icon>
                <Text style={{fontSize: 22, textAlign: 'center', width: '80%'}}>Your action has failed. Please try again.</Text>
                <ActionButton styleContainer={{width: '50%', marginBottom: '5%'}} title="OK" onPress={() => {setModalVisible(false); setIsError(false)}}></ActionButton>
            </View>
        );
    }


    return(
            contract && time?
            <ImageBackground style={{ flex: 1, height: '100%' }} source={require('../assets/images/bg.png')}>
            <ScrollView style={{display: 'flex', flex: 1}}>
            <Modal
                        statusBarTranslucent={true}
                        animationType='fade'
                        transparent={true}
                        visible={modalVisible}
                        onRequestClose={() => {
                            setModalVisible(false)
                            setIsError(false);
                        }}>
                        <View style={styles.centeredView}>
                            { isError ? renderErrorModal() : renderEndModal()}
                        </View>
                    </Modal>
                <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                    <Icon name="keyboard-arrow-left" size={60} color="#04B388"/>
                  </TouchableOpacity>
        <View style={styles.container}>
            <View style={styles.cardContainer}>
                <View style={styles.cardHeader}>
                    <Text style={{fontSize: 25}}>Contract</Text>
                </View>
                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} size={35} name="tag" type="FontAwesome" color="#04B388"></Icon>
                    <View style={{display:'flex', flexDirection: 'column', width: '80%'}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>Title</Text>
                        <Text style={{fontSize: 16}}>{contract.serviceDetail.title}</Text>
                    </View>
                </View>
                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} size={35} name="person" color="#04B388"></Icon>
                    <View style={{display:'flex', flexDirection: 'column'}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>Offered By</Text>
                        <Text style={{fontSize: 16}}>{contract.seller.name}</Text>
                    </View>
                </View>
                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} size={35} name="money" color="#04B388"></Icon>
                    <View style={{display:'flex', flexDirection: 'column'}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>Price</Text>
                        <Text style={{fontSize: 16}}>{contract.finalPriceEOS}</Text>
                    </View>
                </View>
                <View style={styles.contentCard}>
                    <Icon style={styles.iconCard} size={35} name="person" color="#04B388"></Icon>
                    <View style={{display:'flex', flexDirection: 'column', width: '80%'}}>
                        <Text style={{fontWeight: 'bold', fontSize: 18}}>Description</Text>
                        <Text style={{fontSize: 16}}>{contract.serviceDetail.description}</Text>
                    </View>
                </View>
                { user?.uid == contract.buyer.uid ? renderBuyerSection() : renderSellerSection() }
            </View>
            { (contract.accepted && contract.deposit) ?
             contract.images ? <View style={{display: 'flex', flexBasis: '100%', alignContent:'center'}}>
                <Carousel
                  layout={"default"}
                  data={contract.images}
                  sliderWidth={300}
                  itemWidth={250}
                  renderItem={_renderItem}
                  onSnapToItem = { index => setActiveIndex(index) }
                  layoutCardOffset={18}/>
                  <Pagination
                    dotsLength={contract.images.length}
                    activeDotIndex={activeIndex}
                    containerStyle={{}}
                    dotStyle={{
                        marginBottom: 15,
                        width: 10,
                        height: 10,
                        borderRadius: 5,
                        elevation: 10,
                        marginHorizontal: 8,
                        backgroundColor: 'white'
                    }}
                    inactiveDotStyle={{
                        // Define styles for inactive dots here
                    }}
                    inactiveDotOpacity={0.4}
                    inactiveDotScale={0.6}
                  />

            </View> : null :
            <View>
                <Text style={{color: 'white', textAlign: 'center', marginTop: '5%'}}>Contract expires in: {}</Text>
                {time == 0 ? null : <CountDown until={time} timeLabelStyle={{color: 'white'}} digitStyle={{backgroundColor: 'white'}} size={18}/>}
            </View>}
            {!contract.serviceDelivered ? <ActionButton title="Cancel" onPress={refuseContract} styleContainer={{backgroundColor: 'red', width:'30%', marginVertical: '5%'}}></ActionButton> : null}
        </View>
            </ScrollView>
            </ImageBackground>


            : <Loading/>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
      },
      cardHeader: {
        display: 'flex',
        flexDirection: 'row',
      },
      cardContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '80%',
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 30,
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
      backButton: {
        display: 'flex',
        // flexBasis: '10%',
        alignSelf: 'flex-start',
        marginTop: '6%',
      },
      iconCard: {
          marginHorizontal: 10
      },
      contractButtonContainer: {
          width: '80%',
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          marginTop: '10%',
          marginBottom: '5%',
      },
      lowerSection: {
          width: '90%',
          marginTop: '10%',
          marginBottom: '5%',
      },
      centeredView: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 22,
        backgroundColor: 'rgba(0, 0, 0, 0.57)',
    },
    modalView: {
        margin: 20,
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 15,
        paddingVertical: 25,
        paddingHorizontal: 25,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    endModalContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: 'white',
        borderRadius: 20,
        width: '80%',
        height: '45%',
    },
})
