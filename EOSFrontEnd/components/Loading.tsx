import React from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

interface Props {
    isSmall?: boolean,
    color?: string,
    backgroundColor?: string
}

export default function Loading({isSmall=false, color='#D66C44', backgroundColor='#000000b9'}: Props) {
    return (
        <View style={styles.container}>
            <View style={{...styles.loading, backgroundColor: backgroundColor}}>
                <ActivityIndicator size={isSmall ? 'small' : 'large'} color={color} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        right: 0,
        top: 0,
        left: 0,
        bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 100
    },
    loading: {
        padding: 20,
        borderRadius: 10,   
    }
});