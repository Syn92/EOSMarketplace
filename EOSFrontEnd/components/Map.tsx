import React, { LegacyRef, useEffect, useState } from 'react';
import { View, StyleSheet, Platform, Image } from 'react-native';
import MapView, { Camera, Geojson, LatLng, Marker, Region, UrlTile } from 'react-native-maps';
import Geocoder from 'react-native-geocoding';
import axios, { CancelTokenSource } from 'axios';
import { CustomFeature, CustomFeatureColl, getCenter } from '../utils/Cadastre';
import ServerConstants from '../constants/Server';
import { IService } from '../interfaces/Service';
import { FilterCat, filterCat } from '../constants/Utils';

interface IMarker {
    key: string;
    coordinate: LatLng;
    category: FilterCat | 'default';
    // title: string;
    // description: string;
    // type: EMarkerType // todo: change marker icon depending on type
}

interface IProps {
    pressable: boolean;
    onPressed?: ((cadastre: CustomFeature) => any);
    onMarkerPressed?: ((id: string) => any)
    selectedCadastre?: CustomFeature;
    services?: IService[];
}

Geocoder.init("AIzaSyCcPFzHoC-XT8h-3MZt8CfIz5J-w9BeMHA");

const initialRegion: Region = {
    latitude: 45.5017,
    longitude: -73.5673,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
};

export default function Map(props: IProps) {
    const [markers, setMarkers] = useState<IMarker[]>([]);

    const [geoJson, setGeoJson] = useState<CustomFeatureColl>(
        {
            type: "FeatureCollection",
            features: []
        }
    );

    const [selectedGeoJson, setSelectedGeoJson] = useState<CustomFeatureColl>(
        {
            type: "FeatureCollection",
            features: []
        }
    );

    let map: MapView | null;

    let cancelTokenSource: CancelTokenSource | null;

    const markerIcons = {
        'none': require('../assets/images/markers/none.png'),
        'Education': require('../assets/images/markers/Education.png'),
        'House work': require('../assets/images/markers/House.png'),
        'Health care': require('../assets/images/markers/Health.png'),
        'Wellness & personnal grooming': require('../assets/images/markers/Wellness.png'),
        'Sport and fitness': require('../assets/images/markers/Sport.png'),
        'Hospitality': require('../assets/images/markers/Hospitality.png'),
        'Transport': require('../assets/images/markers/Transport.png'),
        'Utilities': require('../assets/images/markers/Utilities.png'),
        'Rentals': require('../assets/images/markers/Rentals.png'),
        'Event Services': require('../assets/images/markers/Event.png'),
        'Other': require('../assets/images/markers/Other.png')
    }

    useEffect( () => {
        if(props.selectedCadastre) {
            if(selectedGeoJson.features.length > 0 && selectedGeoJson.features[0].properties.ID_UEV == props.selectedCadastre.properties.ID_UEV) {
                return; // change already coming from map itself
            }
            setSelectedGeoJson({type: selectedGeoJson.type, features: [props.selectedCadastre]})
            const marker: IMarker = {
                key: 'pressedMarker',
                coordinate: getCenter(props.selectedCadastre),
                category: 'default'
            }
            setSelectedMarker(marker)
            const cam: Partial<Camera> = {
                center: marker.coordinate,
                zoom: 17,
            }
            map?.animateCamera(cam)
        } else {
            setSelectedMarker(null);
            setSelectedGeoJson({type: selectedGeoJson.type, features: []});
        }
    }, [props.selectedCadastre]);

    useEffect( () => {
        if(props.services) {
            setMarkers(props.services.map((x) => { return {
                key: x._id,
                // key: x.cadastre.properties.ID_UEV,
                coordinate: x.markerPos,
                category: x.category || 'default'
            }}))
        } else {
            setMarkers([])
        }
    }, [props.services]);

    // if pressable, react to the onPress event by adding a marker
    // and calling onPressed with the corresponding address
    function mapPressed(eventTemp: unknown) {
        if(!props.pressable) return;

        // Geocoder.from(marker.coordinate).then(json => {
        //     const address = json.results[0].formatted_address;
        //     if(props.onPressed) props.onPressed(address);
        // }).catch(error => console.warn(error));
        // const features = geoJson.features.filter(x => {
        //     const polygon = (x.geometry as GeoJSON.Polygon)?.coordinates[0] as GeolibInputCoordinates[];
        //     return isPointInPolygon(marker.coordinate, polygon);
        // });
        // console.log(features.flatMap(x => x.properties))
        const event = eventTemp as {feature: CustomFeature, coordinates: LatLng[]}
        if(event && event.feature) {
            setSelectedGeoJson({type: selectedGeoJson.type, features: [event.feature]});
            const marker: IMarker = {
                key: 'pressedMarker',
                coordinate: getCenter(event.feature),
                category: 'default'
            }
            setSelectedMarker(marker);
            if(props.onPressed) props.onPressed(event.feature);
            // console.log('vertices: ', (feature.geometry as GeoJSON.Polygon).coordinates[0].length);
        } else {
            setSelectedMarker(null);
            setSelectedGeoJson({type: selectedGeoJson.type, features: []});
        }
    }

    // refresh the geojson when region is done changing
    async function regionChanged(region: Region) {
        const minZoom = 0.0035;
        if(region.latitudeDelta > minZoom && region.longitudeDelta > minZoom) {
            setGeoJson({type: geoJson.type, features: []});
            return;
        }
        const params = {
            latitude: region.latitude,
            longitude: region.longitude
        }
        cancelTokenSource?.cancel();
        cancelTokenSource = axios.CancelToken.source();
        axios.get(ServerConstants.local + 'cadastre', { params, cancelToken: cancelTokenSource.token })
            .then(function (response) {
                // handle success
                const features = response.data as CustomFeature[];
                setGeoJson({type: geoJson.type, features: features});
            }).catch(function (error) {
                // handle error
                setGeoJson({type: geoJson.type, features: []});
                if(!axios.isCancel(error)) {
                    console.log('cadastre: ', error);
                }
            }).then(function () {
                // always executed
                cancelTokenSource = null
            });
    }

    // add a single marker. do not use if adding more than one at once
    function setSelectedMarker(marker: IMarker | null) {
        const markerKey = "selectedMarker";
        const existingIndex = markers.findIndex(x => x.key == markerKey);
        if(marker) {
            marker.key = markerKey;
            if(existingIndex > -1) {
                markers[existingIndex] = marker;
            } else {
                markers.push(marker);
            }
        } else if(existingIndex > -1) {
            markers.splice(existingIndex, 1);
        }
        setMarkers(markers);
    }

    const testMarkerCoord: LatLng = {
        latitude: 45.5048,
        longitude: -73.6132,
    };
    return (
        <View style={styles.container}>
            <MapView style={styles.map} initialRegion={initialRegion} ref={(ref) => { map = ref; }}
                mapType={Platform.OS == "android" ? "none" : "standard"} onRegionChangeComplete={regionChanged}
                pitchEnabled={false} toolbarEnabled={false}>
                <Geojson geojson={selectedGeoJson} strokeColor="black" fillColor="green" strokeWidth={3} zIndex={3}/>
                <Geojson geojson={geoJson} strokeColor="blue" fillColor="rgba(0, 255, 255, 0.2)" strokeWidth={1} zIndex={2}
                tappable={true} onPress={mapPressed}/>
                <UrlTile urlTemplate='https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=coNid1mFaYULtCLCa2kv'
                shouldReplaceMapContent={true}
                tileSize={512}
                zIndex={1}/>
                {markers.length > 0 ? renderMarkers(markers) : null}
            </MapView>
        </View>
    );
    function renderMarkers(markers: IMarker[]): JSX.Element[] {
        return markers.map((marker, key) => {
            return (
                <Marker key={key} tracksViewChanges={false} zIndex={5}
                coordinate={marker.coordinate}
                image={marker.category == 'default' ? null : markerIcons[marker.category]}
                onPress={(element) => {if(props.onMarkerPressed) props.onMarkerPressed(marker.key)} } />
            )
        });
    }
};

// customize how the markers are rendered here (icon, etc.)

const styles = StyleSheet.create({
    container: {
        // height: '80%',
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
    },
    map: {
        width: '100%',
        height: '100%',
    },
});
