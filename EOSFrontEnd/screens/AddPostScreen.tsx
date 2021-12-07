import * as React from 'react';
import { Image, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Button } from 'react-native-elements/dist/buttons/Button';
import ActionButton from '../components/ActionButton';
import ActionButtonSecondary from '../components/ActionButtonSecondary';
import { useEffect, useState } from 'react';
import { Picker } from '@react-native-community/picker';
import { Icon } from 'react-native-elements';
import {Dimensions} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import StepIndicator from '../components/stepIndicator';
import { RootTabScreenProps } from '../types';
import axios from 'axios';
import { AuthenticatedUserContext } from '../navigation/AuthenticatedUserProvider';
import { TouchableWithoutFeedback } from 'react-native-gesture-handler';
import Map from '../components/Map';
import { CustomFeature, CustomFeatureColl, getAddress, getCenter } from '../utils/Cadastre';
import { LatLng } from 'react-native-maps';
import ServerConstants from '../constants/Server';
import { AutocompleteDropdown, AutocompleteDropdownProps } from 'react-native-autocomplete-dropdown';
import { ServiceStatus } from '../interfaces/Services';
import { filterCat, servTypeBuy, servTypeSell } from '../constants/Utils';

export interface Service {
  title: string;
  description: string;
  material: string;
  images: (string | undefined)[];
  priceEOS: number;
  serviceType: string;
  category: string;
  cadastreId: string;
  markerPos: LatLng;
  thumbnail: string | undefined;
  owner: string;
  status: ServiceStatus
}
const { height } = Dimensions.get('window');



export default function AddPostScreen({ navigation }: RootTabScreenProps<'AddPost'>) {
  const [step, setStep] = useState(1)
  const [selectedServType, setSelectedServType] = useState<string>();
  const [selectedCat, setSelectedCat] = useState<string>('');
  const [price, setPrice] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [cadastre, setCadastre] = useState<CustomFeature>();
  const [cadastresAC, setCadastresAC] = useState<CustomFeature[]>([]);
  let acDropdownController: {clear: Function, close: Function, open: Function, setInputText: Function, toggle: Function};
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [errorMessage1, setErrorMessage1] = useState('');
  const [material, setMaterial] = useState<string>();
  const [submited, setSubmited] = useState<boolean>(false);

  const [image, setImage] = useState<(string| undefined)[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const { user, setUser } =  React.useContext(AuthenticatedUserContext);

  function addPostRequest(){

    if(selectedServType && description && material && image && cadastre && user){
      let body: Service = {
        title: title,
        serviceType: selectedServType,
        category: selectedCat,
        priceEOS: Number(price),
        description: description,
        material: material,
        images: image,
        cadastreId: cadastre.properties.ID_UEV,
        markerPos: getCenter(cadastre),
        thumbnail: image[0],
        owner: user.uid,
        status: ServiceStatus.OPEN
      }
      if(!submited){
        setSubmited(true);
        axios.post(ServerConstants.local + 'post', body).then(() => setModalVisible(true)).catch((err) => {console.log('post service: ', err); setSubmited(false)})
      }
    } else {
      console.log("input missing")
    }
  }

  useEffect(() => {
    (async () => {
      if (Platform.OS !== 'web') {
        const { status } = (await ImagePicker.requestMediaLibraryPermissionsAsync() && await ImagePicker.requestCameraPermissionsAsync());
        if (status !== 'granted') {
          alert('Sorry, we need camera roll permissions to make this work!');
        }
      }
    })();
  }, []);

  function onChangeAddress(enteredAddress: string) {
    if(enteredAddress == '') {
      setCadastresAC([]);
      return;
    }
    axios.get(ServerConstants.local + "address", {params: {address: enteredAddress}})
      .then(function (response) {
        // handle success
        const acResults = response.data as CustomFeature[];
        setCadastresAC(acResults);
      }).catch(function (error) {
        // handle error
        setCadastresAC([]);
        console.log('address get: ', error);
    });
  }

  const removeImage = (i: number) => {
    setImage((prevImages) => {
      {return prevImages.filter((image, index) => index != i)}
    })
  }

  const pickImage = async () => {
    let result: any = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      quality: 1,
      base64: true,
    });

    // console.log(result);

    if (!result.cancelled) {
      await setImage([...image,result.base64]);
    }
  };
  if(step == 1)
    return (
    <View style={styles.container}>
      <StepIndicator title="Add a post" step={step} stepMax={4}></StepIndicator>
      <View style={styles.innerContainer}>
        <Text style={styles.subTitle}>You are ...</Text>
        <View style={styles.buttonContainer}>
          <ActionButtonSecondary  title="Offering" styleContainer={selectedServType == servTypeSell ? {backgroundColor: '#04B388'} : {backgroundColor: 'white'}} styleText={selectedServType == servTypeSell ? {color: 'white'} : {color: '#04B388'}} onPress={() => {setSelectedServType(servTypeSell)}}></ActionButtonSecondary>
          <ActionButtonSecondary styleContainer={[{marginTop: 30}, selectedServType == servTypeBuy ? {backgroundColor: '#04B388'} : {backgroundColor: 'white'}]} styleText={selectedServType == servTypeBuy ? {color: 'white'} : {color: '#04B388'}} title="Looking For" onPress={() => {setSelectedServType(servTypeBuy)}}></ActionButtonSecondary>
        </View>
        <ActionButton title="Next" styleContainer={[{justifySelf: 'flex-end', marginHorizontal: 50, marginBottom: 10, marginTop: 50}]} onPress={() => {if(selectedServType){setStep(2)};}}></ActionButton>
      </View>
    </View>
    );
  else if(step == 2)
    return (
    <View style={styles.container}>
      <StepIndicator title="Add a post" step={step} stepMax={4}></StepIndicator>
      <View style={styles.innerContainer}>
      <View style={styles.header}>
            <Button style={styles.headerButton} onPress={() => setStep(1)} icon={<Icon name="arrow-left" size={40} color="black"/>}/>
            <Text style={styles.subTitle}>{selectedServType}...</Text>
            </View>
        <View style={styles.buttonContainer}>
              <View style={styles.inputView}>
                <Text style={styles.inputLabel}>Title</Text>
                <TextInput
                  style={{color: 'black'}}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={title}
                  onChangeText={(text: string) => setTitle(text)}
                />
              </View>
          <Text style={styles.inputLabel}>Categorie</Text>
              <Picker mode="dropdown" style={styles.buttonStyle} selectedValue={selectedCat} onValueChange={(itemValue: any, itemIndex: any) => {if(itemValue != "0")setSelectedCat(itemValue.toString())}}>
                {filterCat.map((cat: string, i: number) => {
                  if(i == 0)
                    return (<Picker.Item key={i} label="Select a category..." value="0"/>)
                  return (<Picker.Item key={i} label={cat} value={cat}/>)
                })}
              </Picker>
        </View>
        {errorMessage1 ? <Text style={styles.errorText}>{errorMessage1}</Text> : <Text></Text>}
            <View style={{justifyContent: 'flex-end', marginHorizontal: 50, marginVertical: 10}}>
              <ActionButton title="Next" onPress={() => {if(title && selectedCat){setStep(3); setErrorMessage1('')}else{setErrorMessage1('Please complete all fields above')}}}></ActionButton>
            </View>
      </View>
    </View>
    );
    else if (step == 3)
        return(
          <ScrollView contentContainerStyle={styles.container}>
          <StepIndicator title="Add a post" step={step} stepMax={4}></StepIndicator>
          <View style={styles.innerContainer}>
            <View style={styles.header}>
            <Button style={styles.headerButton} onPress={() => setStep(2)} icon={<Icon name="arrow-left" size={40} color="black"/>}/>
            <Text style={styles.subTitle}>Details</Text>
            </View>
            <View style={styles.buttonContainer}>
              <ActionButtonSecondary title="Add photo" onPress={pickImage}></ActionButtonSecondary>
              <View style={styles.inputView}>
                <Text style={styles.inputLabel}>Price</Text>
                <TextInput
                  style={{color: 'black'}}
                  autoCapitalize='none'
                  keyboardType="numeric"
                  autoCorrect={false}
                  value={price}
                  onChangeText={text => {if(text == '' || text.match(/^(0|[1-9][0-9]{0,6})(\.[0-9]{0,6})?$/i)) setPrice(text)}}
                />
              </View>
              <View style={styles.inputView}>
                <Text style={styles.inputLabel}>Description</Text>
                <TextInput
                  style={{color: 'black'}}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={description}
                  onChangeText={(text: string) => setDescription(text)}
                />
              </View>
             <View style={styles.inputView}>
                <Text style={styles.inputLabel}>Material required</Text>
                <TextInput
                  style={{color: 'black'}}
                  autoCapitalize='none'
                  autoCorrect={false}
                  value={material}
                  onChangeText={(text: string) => setMaterial(text)}
                />
              </View>
            </View>
              <ScrollView horizontal={true} style={{marginHorizontal: 15, marginTop: 10}}>
            {/* <View style={styles.photoContainer}> */}
              {
                image.map((uri, i)=>{
                  return (<TouchableOpacity style={i == image.length-1 ? {}:{marginRight: 5}} onPress={() => removeImage(i)} key={i}>
                  <Image source={{uri: 'data:image/png;base64,' + uri, width: 80, height: 80}} key={i} />
                </TouchableOpacity>)
                })
              }
            {/* </View> */}
              </ScrollView>
            {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : <Text></Text>}
            <View style={{justifyContent: 'flex-end', marginHorizontal: 50, marginVertical: 10}}>
              <ActionButton title="Next" onPress={() => {if(material && description && price){setStep(4); setErrorMessage('')}else{setErrorMessage('Please complete all fields above')}}}></ActionButton>
            </View>
          </View>
        </ScrollView>
        );
      else
        return (
          <ScrollView contentContainerStyle={styles.container}>
            <StepIndicator title="Add a post" step={step} stepMax={4}></StepIndicator>
            <View style={styles.innerContainer}>
              <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => {
                  navigation.goBack()
                }}
              >
                <View style={styles.centeredView}>
                  <View style={styles.modalView}>
                    <Text style={styles.modalText}>Post succesfully submited</Text>
                      <ActionButton title="Ok" onPress={() => {setModalVisible(!modalVisible); navigation.goBack()}}></ActionButton>
                  </View>
                </View>
              </Modal>
              <View style={styles.header}>
                <Button style={styles.headerButton} onPress={() => setStep(3)} icon={<Icon name="arrow-left" size={40} color="black"/>}/>
                <Text style={styles.subTitle}>Location</Text>
              </View>
              <View style={styles.mapContainer}>
                <AutocompleteDropdown controller={(controller: any) => { acDropdownController = controller}}
                onChangeText={onChangeAddress} useFilter={false} debounce={600} clearOnFocus={false}
                dataSet={cadastresAC.map(x => ({id: x.properties.ID_UEV, title: getAddress(x)}))}
                onSelectItem={(item: any) => item && setCadastre(cadastresAC.find(x => x.properties.ID_UEV == item.id))}
                textInputProps={{
                  placeholder: "Enter an address",
                  autoCorrect: false,
                  autoCapitalize: "none",
                }}/>
                <View style={{height: 400}}>
                  <Map pressable={true} selectedCadastre={cadastre}
                  onPressed={(item) => {
                    acDropdownController.clear()
                    setCadastre(item);
                    setCadastresAC([])
                    setTimeout(() => {
                      acDropdownController.setInputText(getAddress(item));
                    }, 100);
                  }}/>
                </View>
              </View>
              <View style={{justifyContent: 'flex-end', marginHorizontal: 50, marginVertical: 10}}>
                <ActionButton title="Confirm" onPress={addPostRequest}></ActionButton>
              </View>
            </View>
          </ScrollView>
        )
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    flexDirection: 'column'
  },
  header: {
    flexDirection: 'row',
    borderRadius: 15,
    alignItems: 'center',
    // justifyContent: 'space-between'
  },
  headerButton: {
    alignSelf: 'flex-start',
    // width: 50,
    // justifyContent: 'flex-start',
  },
  subTitle: {
    marginTop: 10,
    fontSize: 20,
    color: '#16254b',
    alignSelf: 'center',
    marginHorizontal: '20%'
  },
  innerContainer: {
    display: 'flex',
    backgroundColor: 'white',
    flexDirection: 'column',
    width: '75%',
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    alignContent: 'center',
    elevation: 5,
  },
  title: {
    marginTop: 30,
    fontSize: 20,
    fontWeight: 'bold',
  },
  separator: {
    marginVertical: 20,
    height: 1,
    width: '80%',
  },
  buttonContainer: {
    width: '50%',
    alignSelf: 'center',
    paddingTop: 20,
    display: 'flex',
    flexDirection: 'column'
  },
  mapContainer: {
    width: '90%',
    alignSelf: 'center',
    marginBottom: 10,
    display: 'flex',
    flexDirection: 'column',
  },
  buttonStyle: {
    backgroundColor: '#fff',
    elevation: 8,
    borderRadius: 15,
    paddingVertical: 10,
    paddingHorizontal: 12,
    color: '#04B388',
    alignContent: 'center',
    justifyContent: 'center'
  },
  inputView: {
    // width: "100%",
    marginVertical: 10,
    borderBottomWidth: 2,
    borderColor: '#152347',
  },
  inputLabel: {
    fontSize: 16,
    color: '#04b388',
  },
  text: {
    fontSize: 20,
    color: 'black',
    paddingVertical: 15,
    alignSelf: 'center'
  },
  errorText: {
    color: 'red',
    textAlign: 'center'
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: 'transparent',
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  button: {
    borderRadius: 20,
    padding: 10,
    elevation: 2
  },
  buttonOpen: {
    backgroundColor: "#F194FF",
  },
  buttonClose: {
    backgroundColor: "#2196F3",
  },
  textStyle: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center"
  },
  map: {
    height: '50%'
  }

});
