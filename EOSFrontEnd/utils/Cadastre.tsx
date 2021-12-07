import { getCenterOfBounds } from "geolib";
import { LatLng } from "react-native-maps";

export type CustomFeatureColl = GeoJSON.FeatureCollection<GeoJSON.Geometry, IFeatureProperties>
export type CustomFeature = GeoJSON.Feature<GeoJSON.Polygon, IFeatureProperties>

export interface IFeatureProperties {
    ID_UEV: string,
    CIVIQUE_DEBUT: string,
    NOM_RUE: string,
    MUNICIPALITE: string,
}

export function getAddress(feature: CustomFeature): string {
    if(!feature?.properties?.CIVIQUE_DEBUT || !feature?.properties?.NOM_RUE) return '';

    return feature.properties.CIVIQUE_DEBUT + " " + feature.properties.NOM_RUE;
}

export function getCenter(feature: CustomFeature): LatLng {
    return getCenterOfBounds(feature.geometry.coordinates[0].map(x => ({ latitude: x[1], longitude: x[0] })));
}