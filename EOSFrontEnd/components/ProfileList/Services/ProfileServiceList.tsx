import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { Contract } from '../../../interfaces/Contracts'
import { RequestData, ServiceData, ServiceInfo } from '../../../interfaces/Services'
import { getAddress } from '../../../utils/Cadastre'
import { ProfileServiceCard } from './ProfileServiceCard'
import { ProfileContractCard } from './ProfileContractCard'

interface Props {
    data: ServiceData | Array<Object>,
    onUpdate?: () => Promise<void>
}
function instanceOfServiceData(object: any): object is ServiceData {
    return 'open' in object &&
           'inProgress' in object &&
           'completed' in object
}

export function ProfileServiceList(props: Props) {

    const [ index, setIndex ] = useState(0);

    function displayServiceCards(data: Array<Object>) {
        return data.map((elem: any) => {
            const serviceInfo: ServiceInfo = {
                _id: elem._id,
                category: elem.category,
                title: elem.title,
                owner: elem.ownerName,
                price: elem.priceEOS,
                position: getAddress(elem.cadastre)
            }
            return (<ProfileServiceCard serviceInfo={serviceInfo} key={serviceInfo.title} />)
        })
    }

    function displayContractCards(data: Array<Contract>) {
        return data.map((elem: Contract) => (<ProfileContractCard contract={elem} key={elem._id} />))
    }
    
    function privateProfileView() {

        let data;
        switch (index) {
            default:
            case 0:
                data = (props.data as ServiceData).open
                break;

            case 1:
                data = (props.data as ServiceData).inProgress
                break;
            
            case 2:
                data = (props.data as ServiceData).completed
                break;
        }
        return (
            <View style={styles.container}>
                <ButtonGroup
                    onPress={setIndex}
                    selectedButtonStyle={{backgroundColor: '#04b388'}}
                    selectedIndex={index}
                    buttons={['Open', 'In Progress', 'Completed']}
                    containerStyle={styles.buttonGroup}/>
                {index == 0 ? displayServiceCards(data) : displayContractCards(data)}
                {/* {displayServiceCards(data)} */}
            </View>
        )
    }

    function publicProfileView() {
        const data = props.data as Array<Object>
        return (
            <View style={styles.container}>                        
                { displayServiceCards(data) }
            </View>
        )
    }

    return instanceOfServiceData(props.data) ? privateProfileView() : publicProfileView()
}

const styles = StyleSheet.create({
    container: {
        width: '88%',
        marginBottom: 10, 
        alignSelf: 'center',
        padding: 5,
        
        borderRadius: 15,
        backgroundColor: 'white',
    },
    buttonGroup: {
        borderRadius: 20
    },
})