import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View, Image } from 'react-native';
import { Icon } from 'react-native-elements'

interface Prop {
    owner: string;
    price: number;
    position: string;
    thumbnail: string;
    title: string;
}

export function PostCard(props: Prop) {

    return (
        <View style={styles.mainContainer}>
            <View style={styles.mainRow}>
                <View style={styles.imageContainer}>
                    <Image style={styles.image} source={{uri: props.thumbnail, width: 50, height: 50}}/>
                    <Text style={styles.imageTitle}>{props.title}</Text>
                </View>
                <View style={styles.card}>
                    <View style={styles.row}>
                        <Icon name="storefront" color="#04B388"></Icon>
                        <Text style={styles.text}>{props.owner}</Text>
                    </View>
                    <View style={styles.row}>
                        <Icon name="money" color="#04B388"></Icon>
                        <Text style={styles.text}>{props.price} EOS</Text>
                    </View>
                    <View style={styles.row}>
                        <Icon name="place" color="#04B388"></Icon>
                        <Text style={styles.text}>{props.position}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}


const styles = StyleSheet.create({
    mainContainer: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
    },
    mainRow: {
        display: 'flex',
        alignContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    card: {
        width: '75%',
        display: 'flex',
        flexDirection: 'column',
        marginVertical: 10,
        padding: 5,
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
    container: {
        flex: 1,
        marginBottom: 5,
        overflow: 'hidden',
    },
    image: {
        borderRadius: 25,
        marginHorizontal: 15,
    },
    imageContainer: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        maxWidth: '22%',
    },
    imageTitle: {
        textDecorationLine: 'underline',
        color: '#182851',
        fontSize: 16,
        textTransform: 'capitalize',
        textAlign: 'center'
    },
    row: {
        width: '90%',
        display: 'flex',
        flexDirection: 'row'
    },
    content: {
        flex: 1,
        marginRight: 10,
        marginBottom: 10,
        overflow: 'hidden',
    },
    text: {
        marginLeft: 10,
    }
})