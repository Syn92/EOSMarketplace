import { LatLng } from "react-native-maps";
import { FilterCat } from "../constants/Utils";
import { CustomFeature } from "../utils/Cadastre";
import { ServiceStatus } from "./Services";

export interface IService {
    title: string;
    description: string;
    material: string;
    priceEOS: number;
    serviceType: 'Offering' | 'Looking For';
    category: FilterCat;
    cadastre: CustomFeature;
    markerPos: LatLng;
    owner: string;
    ownerName: string;
    thumbnail: string;
    cadastreId?: string;
    _id: string;
    otherUser?: string
    images: string[];
    status: ServiceStatus
}
