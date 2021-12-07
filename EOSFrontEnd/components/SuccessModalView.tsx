import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Icon } from 'react-native-elements';

interface Props {
    message: string,
    children?: React.ReactNode
}

export default function SuccessModalView(props: Props) {
    return (
        <View style={styles.container}>
            <View style={styles.static}>
                <Icon reverse
                    containerStyle={styles.icon}
                    size={45}
                    name='done' 
                    type='material' 
                    color='#04B388' />
                <Text style={styles.message}>{props.message}</Text>
            </View>
            <View style={styles.children}>
                {props.children ? props.children: null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-around',
        alignItems: 'center',
        backgroundColor: 'white',
        maxHeight: '70%', 
        borderRadius: 10,
        width: '80%',
        aspectRatio: 1,
    },
    icon: {
        margin: '10%'
    },
    message: {
        fontSize: 20,
        fontWeight: 'bold'
    },
    static: {
        alignItems: 'center'
    },
    children: {
        justifyContent: 'flex-end',
        alignItems: 'center',
    }
})