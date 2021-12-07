import * as React from 'react';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Image, Pressable, ImageBackground } from 'react-native';
import { Icon } from 'react-native-elements';

import Map from '../components/Map';
import Firebase from '../config/firebase';
import ServerConstants from '../constants/Server';
import { RootTabScreenProps } from '../types';
import { CustomFeature } from '../utils/Cadastre';
import { IService } from '../interfaces/Service';
import { TouchableOpacity } from 'react-native-gesture-handler';

const auth = Firebase.auth()

export default function TabOneScreen({ navigation }: RootTabScreenProps<'TabOne'>) {

  const [selectedMarker, setSelectedMarker] = useState<string>();
  const [selectedService, setSelectedService] = useState<IService>();
  const [data, setData] = useState([]);

  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try{
      const resp = await fetch(ServerConstants.local + 'post/open');
      const data = await resp.json();
      setData(data);
      setLoading(false);
    } catch (e) {
      setLoading(false)
      console.error('Fetch annonces tab one: ', e)
    }
  };

  const getService = (serviceId: string) => {
    if(serviceId != selectedMarker){
      setSelectedMarker(serviceId)
      setSelectedService(data.filter((e: IService ) => e._id == serviceId)[0])
    } else {
      setSelectedMarker('');
    }
  }

  async function handleLogout() {
    try {
      await auth.signOut()
    } catch (error: any) {
      console.log('logout')
      console.log(error)
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <ImageBackground style={{ flex: 1 }} source={require('../assets/images/bg.png')}>
    <View style={styles.container}>
      {/* <Button title="Logout" onPress={handleLogout} /> */}
      <View style={styles.mapContainer}>
        <Map pressable={false} services={data} onMarkerPressed={(id) =>{getService(id)}}/>
      </View>
      {selectedMarker ?
      <View style={styles.postContainer}>
        <TouchableOpacity onPress={() => {navigation.navigate('PostDetails',selectedService._id)}}>
           <Icon name="keyboard-arrow-up" size={40} color="#04B388"/>
           </TouchableOpacity>
        <View style={styles.postRowContainer}>
          <View style={styles.imageContainer}>
            <Image style={styles.image} source={{uri: selectedService.thumbnail ? selectedService.thumbnail : 'https://cdn1.iconfinder.com/data/icons/business-company-1/500/image-512.png', width: 70, height: 70}}/>
            <Text style={styles.imageTitle}>{selectedService.title}</Text>
          </View>
          <View style={styles.postDetailsContainer}>
            <Text style={styles.postDetailsText}><Text style={{fontWeight: 'bold'}}>Type: </Text> {selectedService.serviceType}</Text>
            <Text style={styles.postDetailsText}><Text style={{fontWeight: 'bold'}}>Category: </Text> {selectedService.category}</Text>
            <Text style={styles.postDetailsText}><Text style={{fontWeight: 'bold'}}>Material: </Text> {selectedService.material}</Text>
          </View>
        </View>
      </View> : <View></View>}
      <View style={styles.separator} />
    </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 30,
    height: 1,
    width: '80%',
  },
  mapContainer: {
    marginTop: 70,
    height: '95%',
    width: '95%',
  },
  postContainer: {
    height: '35%',
    width: '95%',
    display: 'flex',
    flexDirection: 'column',
    marginVertical: 5,
    // padding: 5,
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
  postRowContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  image: {
    borderRadius: 35,
    marginHorizontal: '10%',
  },
  imageContainer: {
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
  },
  imageTitle: {
      textDecorationLine: 'underline',
      color: '#04B388',
      fontSize: 16,
      textTransform: 'capitalize'
  },
  postDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  postDetailsText: {
    fontSize: 17,
  }
});
