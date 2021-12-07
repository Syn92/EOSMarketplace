import { RootStackScreenProps } from "../types";
import { View, Text, StyleSheet, Image, ImageBackground, TouchableOpacity, ScrollView } from "react-native";
import * as React from 'react';
import { Icon } from "react-native-elements";
import { AuthenticatedUserContext } from "../navigation/AuthenticatedUserProvider";
import { useContext, useState } from "react";
import { Contract } from "../interfaces/Contracts";
import Carousel, { Pagination } from "react-native-snap-carousel";
import ImageView from "react-native-image-viewing";

export default function CompletedContractScreen({route, navigation }: RootStackScreenProps<'Completed'>) {
    const { user } =  useContext(AuthenticatedUserContext);
    const [ contract, setContract ] = useState<Contract>(route.params)
    const [ activeIndex, setActiveIndex ] = useState(0)
    const [showImageModal, setShowImageModal] = useState(false)

    const _renderItem = ({item, index}, images) => {
        return (
            <TouchableOpacity onPress={() => {setShowImageModal(true)}}>
              <Image key={index} source={{uri: item, width: 250, height: 250}}/>
              <ImageView
                  images={images.map((e) => {return {uri: e}})}
                  imageIndex={activeIndex}
                  visible={showImageModal}
                  onRequestClose={() => setShowImageModal(false)}
              />
          </TouchableOpacity>
        );
    }

    return(
    <ImageBackground style={{ flex: 1, height: '100%' }} source={require('../assets/images/bg.png')}>
        <ScrollView style={{display: 'flex', flex: 1}}>
            <TouchableOpacity style={styles.backButton} onPress={() => {navigation.goBack()}}>
                <Icon name="keyboard-arrow-left" size={60} color="#04B388"/>
            </TouchableOpacity>
            <View style={styles.container}>
                <View style={styles.cardContainer}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.containerTitle}>Completed Contract</Text>
                    </View>
                    <View style={styles.contentCard}>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="tag" type="FontAwesome" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Title: </Text>
                            <Text style={{fontSize: 16}}>{contract.serviceDetail.title}</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="person" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Seller: </Text>
                            <Text style={{fontSize: 16}}>{contract.seller.name}</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="person" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Buyer: </Text>
                            <Text style={{fontSize: 16}}>{contract.buyer.name}</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="money" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Original Price: </Text>
                            <Text style={{fontSize: 16}}>{contract.serviceDetail.priceEOS} EOS</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="money" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Final Price: </Text>
                            <Text style={{fontSize: 16}}>{contract.finalPriceEOS} EOS</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="event" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Creation Date: </Text>
                            <Text style={{fontSize: 16}}>{(new Date(contract.creationDate)).toDateString()}</Text>
                        </View>
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="category" color="#04B388"></Icon>
                            <Text style={styles.card_h2}>Category: </Text>
                            <Text style={{fontSize: 16}}>{contract.serviceDetail.category}</Text>
                        </View>
                        {/* Description */}
                        <View style={styles.contentRow}>
                            <Icon style={styles.iconCard} name="description" color="#04B388"></Icon>
                            <Text style={{...styles.card_h2, marginRight: '10%'}}>Description</Text>
                        </View>
                        <Text style={styles.description}>{contract.serviceDetail.description}</Text>
                        {/* Material */}
                        <View style={{...styles.contentRow, marginTop: '5%'}}>
                            <Icon style={styles.iconCard} name="construction" color="#04B388"></Icon>
                            <Text style={{...styles.card_h2, marginRight: '10%'}}>Material</Text>
                        </View>
                        <Text style={styles.description}>{contract.serviceDetail.material}</Text>
                    </View>
                </View>
                {
                    contract.serviceDetail.images ?
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.containerTitle}>Sevice Images</Text>
                        </View>
                        <View style={styles.carousel}>
                            <Carousel
                            layout={"default"}
                            data={contract.serviceDetail.images}
                            sliderWidth={300}
                            itemWidth={250}
                            renderItem={(obj) => _renderItem(obj, contract.serviceDetail.images)}
                            onSnapToItem = { index => setActiveIndex(index) }
                            layoutCardOffset={18}/>
                                <Pagination
                                    dotsLength={contract.serviceDetail.images.length}
                                    activeDotIndex={activeIndex}
                                    containerStyle={{paddingVertical: 0, marginTop: '5%'}}
                                    dotStyle={{
                                        backgroundColor: '#04B388'
                                    }}
                                />
                        </View>
                    </View>: null
                }
                {
                    contract.images ?
                    <View style={styles.cardContainer}>
                        <View style={styles.cardHeader}>
                            <Text style={styles.containerTitle}>Contract Images</Text>
                        </View>
                        <View style={styles.carousel}>
                            <Carousel
                            layout={"default"}
                            data={contract.images}
                            sliderWidth={300}
                            itemWidth={250}
                            renderItem={(obj) => _renderItem(obj, contract.images)}
                            onSnapToItem = { index => setActiveIndex(index) }
                            layoutCardOffset={18}/>
                                <Pagination
                                    dotsLength={contract.images.length}
                                    activeDotIndex={activeIndex}
                                    containerStyle={{paddingVertical: 0, marginTop: '5%'}}
                                    dotStyle={{
                                        backgroundColor: '#04B388'
                                    }}
                                />
                        </View>
                    </View>: null
                }
            </View>
        </ScrollView>
    </ImageBackground> 
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        paddingBottom: '5%'
    },
    cardHeader: {
        display: 'flex',
        flexDirection: 'row',
    },
    containerTitle: {
        fontSize: 25,
        fontWeight: 'bold',
        borderBottomWidth: 1,
        marginBottom: '2%',
        paddingHorizontal: '2%'
    },
    cardContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: '90%',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '5%',
        marginBottom: '2%',
        padding: 10,
        borderRadius: 8,
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
    card_h2: {
        fontWeight: 'bold', 
        fontSize: 18
    },
    contentCard: {
        alignItems: 'flex-start',
        width: '95%',
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 7,
        paddingBottom: 15,
        borderRadius: 8,
    },
    contentRow: {
        display:'flex',
        flexDirection: 'row',
        width: '80%',
        alignItems: 'center',
        marginVertical: '1.5%',

        // backgroundColor: 'lightgreen'
    },
    description: {
        fontSize: 16,
        width: '90%',
        alignSelf: 'center',
        marginTop: '3%',
        paddingVertical: '1%',
        paddingHorizontal: '2%',
        borderWidth: 1,
        borderStyle: 'dashed',
        borderRadius: 5,
        flexWrap: 'wrap',
    },
    backButton: {
        display: 'flex',
        alignSelf: 'flex-start',
        marginTop: '6%',
    },
    iconCard: {
        marginLeft: '10%'
    },
    carousel: {
        alignItems: 'center',
        width: '95%',
        display: 'flex',
        marginTop: '3%',
        paddingBottom: '3%',
        flexDirection: 'column',
    }
})


