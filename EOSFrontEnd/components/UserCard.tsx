import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import { createRating, User } from '../interfaces/User';

interface IProp {
  user: User;
}

export default function UserCard(props: IProp) {
  const navigation = useNavigation()
  const [ rating, setRating ] = useState<JSX.Element[]>([]);
  const [ description, setDescription ] = useState('');

  useEffect(() => {
    setRating(createRating(props.user.rating, 15))
    setDescription(props.user.description
      ? props.user.description
      : 'Joined on ' + props.user.joinedDate)
  }, [props.user])

  return (
    <TouchableOpacity style={styles.mainContainer} onPress={() => navigation.navigate('PublicProfile', {uid: props.user.uid})}>
        <View>
            <Image style={styles.image} source={props.user.avatar ? {uri: props.user.avatar} : require('../assets/images/avatar.webp')}/>
        </View>
        <View style={styles.descriptionContainer}>
            <View style={styles.titleContainer}>
                <Text style={[styles.text, styles.title]} numberOfLines={1}>{props.user.name ? props.user.name : props.user.email}</Text>
                <View style={{display: 'flex', flexDirection: 'row', alignItems: 'center'}}>
                  { rating.map((e) => {return (e)}) }
                </View>
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.text, styles.message]} numberOfLines={1}>{description}</Text>
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
    }
})