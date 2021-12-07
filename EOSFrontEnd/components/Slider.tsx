import Slider from 'react-native-slide-to-unlock';
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, Image, View } from 'react-native'
import { Icon } from 'react-native-elements'
interface Prop {
    callback?: any,
    isConfirm?: boolean
}

export function SliderComponent(props: Prop) {
    return ( 
      props.isConfirm ? 
      <View style={styles.endedContainer}>
        <Text style={styles.endedText}>Confirmed...</Text>
      </View> 
        :
      <Slider
        childrenContainer={{ color: 'white'}}
        onEndReached={props.callback}
        containerStyle={{
          margin: 8,
          backgroundColor: '#182851',
          borderRadius: 25,
          overflow: 'hidden',
          alignItems: 'center',
          justifyContent: 'center',
          width: '95%'
          }}
        sliderElement={
          <Icon
            style={{
              margin: 4,
              borderRadius: 25,
              backgroundColor: 'white',
              color:  "white",
            }}
            name="circle"
            color="white"
            size={40}
            type='MaterialCommunityIcons'
          />
        }>
        <Text style={{color: 'white', marginLeft: '15%'}}>{'Slide to complete transaction'}</Text>
        </Slider>
    )
}

const styles = StyleSheet.create({
  endedContainer: {
    width: '95%',
    display: 'flex',
    borderRadius: 50,
    borderColor: '#182851',
    borderWidth: 5,
    // borderRightWidth: 7,
    // borderLeftWidth: 7,
    height: 48,
    justifyContent: 'center',
    margin: 8,
  },
  endedText: {
    textAlign: 'center',
    fontSize: 18,
    color: 'gray',
    fontStyle: 'italic'
  }
})