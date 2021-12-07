import React, { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { ButtonGroup } from 'react-native-elements'
import { Contract } from '../../../interfaces/Contracts'
import { RequestData, RequestIndex, RequestInfo} from '../../../interfaces/Services'
import { ProfileRequestCard } from './ProfileRequestCard'

interface Props {
    data: RequestData,
    onUpdate?: () => Promise<void>
}

export function ProfileRequestList(props: Props) {

    const [ index, setIndex ] = useState(0);

    function displayRequestCards(data: Array<Contract>) {
        return data.map((elem: Contract) => {
            let res;
            if (index == RequestIndex.selling)
                res = data.findIndex((e: Contract) => (e.serviceId == elem.serviceId) && e._id != elem._id)            

            let requestInfo: RequestInfo = {
                thumbnail: elem.serviceDetail.thumbnail,
                title: elem.serviceDetail.title,
                ...(index == 0 && {isUnique: res == -1}),
                ...(index == RequestIndex.selling && { requestUser: elem.buyer.name }),
                ...(index == RequestIndex.buying && { serviceOwner: elem.seller.name })

            }
            return (
                <ProfileRequestCard key={elem._id} requestInfo={requestInfo} request={elem} onUpdate={props.onUpdate}/>
            )
        })
    }

    const data = props.data as RequestData

    return (
        <View style={styles.container}>
            <ButtonGroup
                onPress={setIndex}
                selectedButtonStyle={{backgroundColor: '#04b388'}}
                selectedIndex={index}
                buttons={['Selling', 'Buying']}
                containerStyle={styles.buttonGroup}/>
            {
                index == 0 ? displayRequestCards(data.selling) : displayRequestCards(data.buying)
            }
        </View>
    )    
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