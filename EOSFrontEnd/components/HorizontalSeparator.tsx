import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

interface Props {
    text: string,
    textColor?: string,
    lineColor?: string
    fontSize: number,
}

export default function HorizontalSeparator({text, fontSize, textColor = 'white', lineColor = 'white'}: Props) {
    return (
        <View style={{flexDirection: 'row', marginVertical: '5%'}}>
            <View style={{...styles.line, ...styles.leftLine, backgroundColor: lineColor}}></View>
            <Text style={{...styles.text, fontSize: fontSize, color: textColor}}>{text}</Text>
            <View style={{...styles.line, ...styles.rightLine, backgroundColor: lineColor}}></View>
        </View>
    )
}

const styles = StyleSheet.create({
    text: {
        color: 'white',
        letterSpacing: 1.1,
    },
    line: {
        backgroundColor: 'white',
        height: 2,
        flex:1,
        alignSelf: 'center',
    },
    leftLine: {
        marginLeft: 25,
        marginRight: 20
    },
    rightLine: {
        marginLeft: 20,
        marginRight: 25
    }
})