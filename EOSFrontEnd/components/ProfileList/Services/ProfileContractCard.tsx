import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { IRoom } from '../../../interfaces/Chat';
import { Contract } from '../../../interfaces/Contracts';
import { ServiceStatus } from '../../../interfaces/Services';
import { ChatContext } from '../../../navigation/ChatSocketProvider';
import { getAddress } from '../../../utils/Cadastre';

interface Prop {
    contract: Contract
}

function getIcon(category: string) {

    //TODO: choose icon by category, (waiting on category list from vincent)
    return 'category';
}

export function ProfileContractCard(props: Prop) {

    const { rooms } =  React.useContext(ChatContext);
    const navigation = useNavigation()

    function handleClick() {
        const room = rooms.find((room: IRoom) => room.contract?._id === props.contract._id)
        
        if (props.contract.serviceDetail.status == ServiceStatus.IN_PROGRESS) {
            if (room?._id)
                navigation.navigate('Contract',{'id': room.contract._id, 'roomId': room._id})
        } else if (props.contract.serviceDetail.status == ServiceStatus.COMPLETED) {
            navigation.navigate('Completed', props.contract)
        }
    }

    return (
        <TouchableOpacity style={styles.card} onPress={handleClick}>
            <View style={styles.iconContainer}>
                <Icon name={getIcon(props.contract.serviceDetail.category)} 
                    type='material'
                    color='#04b388'
                    size={37} />
                <Text style={styles.imageTitle}>{props.contract.serviceDetail.title}</Text>
            </View>
            <View style={styles.container}>
                <View style={styles.row}>
                    <Icon name="storefront" color="#04B388"></Icon>
                    <Text style={styles.text}>{props.contract.serviceDetail.ownerName}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="attach-money" color="#04B388"></Icon>
                    <Text style={styles.text}>{props.contract.serviceDetail.priceEOS} EOS</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="place" color="#04B388"></Icon>
                    <Text style={styles.text}>{getAddress(props.contract.serviceDetail.cadastre)}</Text>
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

        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,

        elevation: 4,
    },
    container: {
        flex: 1,
        marginBottom: 5,
        overflow: 'hidden',
    },
    iconContainer: {
        flexDirection: 'column',
        justifyContent: 'center',
        alignContent: 'center',
        width: '25%',
        marginHorizontal: '2%'
    },
    imageTitle: {
        // fontStyle: 'italic',
        fontWeight: 'bold',
        color: '#000',
        fontSize: 16,
        textTransform: 'capitalize',
        alignSelf: 'center'
    },
    text: {
        marginLeft: 10,
    },
    row: {
        display: 'flex',
        flexDirection: 'row'
    },
})