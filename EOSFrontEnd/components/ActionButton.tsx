import React from 'react'
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native'
import { TouchableOpacity } from 'react-native';

interface Props {
    title: string,
    icon?: string,
    onPress: any,
    styleContainer?: any,
    styleText?: any,
}

export default function ActionButton({title, icon, onPress, styleContainer, styleText}: Props) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.buttonContainer, styleContainer]}>
            <Text style={[styles.buttonText, styleText]}>{title}</Text>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    buttonContainer: {
        backgroundColor: '#04B388',
        elevation: 8,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        borderRadius: 15,
        paddingVertical: 10,
        paddingHorizontal: 12,
    },
    buttonText: {
        fontSize: 18,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
    }
})