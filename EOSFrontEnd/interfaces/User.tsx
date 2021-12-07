import React from 'react';
import { Icon } from 'react-native-elements';

export interface User {
    uid: string,
    email: string,
    name: string,
    phone?: string,
    description?: string,
    joinedDate: string,
    walletAccountName?: string,
    avatar?: string,
    rating?: number
}

export function createRating(rating: number, size: number = 37): JSX.Element[] {
    let ratingDisplayable: number = Math.round(rating*2)/2
    let fullStars: number = Math.floor(ratingDisplayable);
    let halfStars: number = (ratingDisplayable - fullStars) == 0.5 ? 1 : 0;
    let emptyStars: number = 5 - fullStars - halfStars;
    let stars = [];
    for (let i = 0; i < fullStars; i++) {
        stars.push(<Icon name='star' type='material' color='#04b388' size={size}  key={'fullStars' + i}></Icon>)
    }
    for (let i = 0; i < halfStars; i++) {
        stars.push(<Icon name='star-half' type='material' color='#04b388' size={size}  key={'halfStars' + i}  ></Icon>)
    }
    for (let i = 0; i < emptyStars; i++) {
        stars.push(<Icon name='star-outline' type='material' color='#04b388' size={size} key={'emptyStars' + i} ></Icon>)
    }
    return stars
}