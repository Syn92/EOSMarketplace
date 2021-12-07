export const filterCat = [
    'None',
    'Education',
    'House work',
    'Health care',
    'Wellness & personnal grooming',
    'Sport and fitness',
    'Hospitality',
    'Transport',
    'Utilities',
    'Rentals',
    'Event Services',
    'Other'
  ] as const

export type FilterCat = typeof filterCat[number]

export const servTypeSell = "Offering"
export const servTypeBuy = "Looking For"