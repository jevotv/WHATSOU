// Shipping configuration types

export type ShippingType = 'none' | 'nationwide' | 'by_city' | 'by_district';

export interface ShippingConfigNone {
    type: 'none';
}

export interface ShippingConfigNationwide {
    type: 'nationwide';
    price: number;
}

export interface ShippingConfigByCity {
    type: 'by_city';
    rates: Record<string, number>; // city_id: price
}

export interface ShippingConfigByDistrict {
    type: 'by_district';
    rates: Record<string, number>; // district_id: price
}

export type ShippingConfig =
    | ShippingConfigNone
    | ShippingConfigNationwide
    | ShippingConfigByCity
    | ShippingConfigByDistrict;

// City and District types
export interface City {
    id: number;
    name_ar: string;
    name_en: string;
}

export interface District {
    id: number;
    city_id: number;
    name_ar: string;
    name_en: string;
}

// Helper function to calculate shipping price
export function calculateShippingPrice(
    config: ShippingConfig,
    cartTotal: number,
    freeShippingThreshold: number | null,
    selectedCityId?: number,
    selectedDistrictId?: number
): { price: number; isFree: boolean } {
    // Check free shipping threshold first
    if (freeShippingThreshold && cartTotal >= freeShippingThreshold) {
        return { price: 0, isFree: true };
    }

    switch (config.type) {
        case 'none':
            return { price: 0, isFree: false };

        case 'nationwide':
            return { price: config.price, isFree: false };

        case 'by_city':
            if (selectedCityId && config.rates[selectedCityId.toString()]) {
                return { price: config.rates[selectedCityId.toString()], isFree: false };
            }
            return { price: 0, isFree: false };

        case 'by_district':
            if (selectedDistrictId && config.rates[selectedDistrictId.toString()]) {
                return { price: config.rates[selectedDistrictId.toString()], isFree: false };
            }
            return { price: 0, isFree: false };

        default:
            return { price: 0, isFree: false };
    }
}

// Helper function to check if a location is covered
export function isLocationCovered(
    config: ShippingConfig,
    cityId?: number,
    districtId?: number
): boolean {
    switch (config.type) {
        case 'none':
            return false;

        case 'nationwide':
            return true;

        case 'by_city':
            return cityId ? config.rates.hasOwnProperty(cityId.toString()) : false;

        case 'by_district':
            return districtId ? config.rates.hasOwnProperty(districtId.toString()) : false;

        default:
            return false;
    }
}

// Helper to get covered city IDs from config
export function getCoveredCityIds(config: ShippingConfig): number[] {
    if (config.type === 'by_city') {
        return Object.keys(config.rates).map(Number);
    }
    return [];
}

// Helper to get covered district IDs from config
export function getCoveredDistrictIds(config: ShippingConfig): number[] {
    if (config.type === 'by_district') {
        return Object.keys(config.rates).map(Number);
    }
    return [];
}
