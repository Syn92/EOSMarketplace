import { useNavigation } from '@react-navigation/native';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { Icon } from 'react-native-elements'
import { ServiceInfo } from '../../../interfaces/Services';

interface Prop {
    serviceInfo: ServiceInfo
}

function getIcon(category: string) {

    //TODO: choose icon by category, (waiting on category list from vincent)
    return 'category';
}

export function ProfileServiceCard(props: Prop) {

    const navigation = useNavigation()

    return (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('PostDetails', props.serviceInfo._id)}>
            <View style={styles.iconContainer}>
                <Icon name={getIcon(props.serviceInfo.category)} 
                    type='material'
                    color='#04b388'
                    size={37} />
                <Text style={styles.imageTitle}>{props.serviceInfo.title}</Text>
            </View>
            <View style={styles.container}>
                <View style={styles.row}>
                    <Icon name="storefront" color="#04B388"></Icon>
                    <Text style={styles.text}>{props.serviceInfo.owner}</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="attach-money" color="#04B388"></Icon>
                    <Text style={styles.text}>{props.serviceInfo.price} EOS</Text>
                </View>
                <View style={styles.row}>
                    <Icon name="place" color="#04B388"></Icon>
                    <Text style={styles.text}>{props.serviceInfo.position}</Text>
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