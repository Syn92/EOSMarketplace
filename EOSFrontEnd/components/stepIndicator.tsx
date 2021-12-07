import React from 'react'
import { GestureResponderEvent, StyleSheet, Text, View } from 'react-native'
import { Button } from 'react-native-elements/dist/buttons/Button';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface Props {
    title: string,
    step: number,
    stepMax: number,
}

export default function StepIndicator({title, step, stepMax}: Props) {
    let stepTab: any = []
    for (let i = 1; i <= stepMax; i++) {    
        stepTab.push(
        <View style={[i == step ? styles.activeStepIndicator : styles.stepIndicator, {width: 90/stepMax + '%'} ]} key={i}>
        </View>)
    }

    return ( 
    <View style={styles.container}>
    <Text style={styles.titleIndicator}> {title} </Text>
    <View style={styles.stepIndicContainer}>

            { stepTab }
    </View>
    </View>
    )
}

const styles = StyleSheet.create({
    stepIndicContainer: {
        paddingVertical: 20,
        marginLeft: 10,
        width: '75%',
        height: 6,
        display: 'flex',
        flexDirection: 'row',
        alignItems:'center',
        justifyContent: 'space-between'
    },
    stepIndicator: {
        backgroundColor: '#04B388',
        height: 3,
        marginHorizontal: 1,
    },
    activeStepIndicator: {
        backgroundColor: '#04B388',
        height: 6,
        marginHorizontal: 1,

    },
    titleIndicator: {
        fontSize: 25,
        color: '#16254b',
        textAlign: 'center'
    },
    container: {
        marginVertical: 10
    }
})