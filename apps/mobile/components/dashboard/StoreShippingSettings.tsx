'use client';

import { useState, useEffect, useMemo } from 'react';
import { ShippingConfig, City, District } from '@/types/shipping';
import { supabase } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Truck, Plus, Trash2, Search, Check, MapPin, AlertCircle } from 'lucide-react';
import { useLanguage } from '@whatsou/shared';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card } from '@/components/ui/card';

interface StoreShippingSettingsProps {
    shippingConfig: ShippingConfig;
    freeShippingThreshold: number | null;
    onConfigChange: (config: ShippingConfig) => void;
    onThresholdChange: (threshold: number | null) => void;
}

export function StoreShippingSettings({
    shippingConfig,
    freeShippingThreshold,
    onConfigChange,
    onThresholdChange
}: StoreShippingSettingsProps) {
    const { t, direction } = useLanguage();
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    // Local state for "add rate" form
    const [selectedCityId, setSelectedCityId] = useState<number | null>(null);
    const [selectedDistrictId, setSelectedDistrictId] = useState<number | null>(null);
    const [ratePrice, setRatePrice] = useState<string>('');
    const [isAddOpen, setIsAddOpen] = useState(false);

    // Bulk Add State
    const [bulkPrice, setBulkPrice] = useState<string>('');
    const [isBulkOpen, setIsBulkOpen] = useState(false);

    // Multi-select State
    const [selectedRates, setSelectedRates] = useState<Set<string>>(new Set());
    const [updatePrice, setUpdatePrice] = useState<string>('');
    const [isUpdateOpen, setIsUpdateOpen] = useState(false);

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        try {
            const [citiesRes, districtsRes] = await Promise.all([
                supabase.from('cities').select('*').order('name_ar'),
                supabase.from('districts').select('*').order('name_ar')
            ]);

            if (citiesRes.data) setCities(citiesRes.data);
            if (districtsRes.data) setDistricts(districtsRes.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
        } finally {
            setLoadingLocations(false);
        }
    };

    const handleTypeChange = (type: string) => {
        let newConfig: ShippingConfig;

        switch (type) {
            case 'none':
                newConfig = { type: 'none' };
                break;
            case 'nationwide':
                newConfig = { type: 'nationwide', price: 0 };
                break;
            case 'by_city':
                newConfig = { type: 'by_city', rates: {} };
                break;
            case 'by_district':
                newConfig = { type: 'by_district', rates: {} };
                break;
            default:
                return;
        }
        onConfigChange(newConfig);
    };

    const handleNationwidePriceChange = (price: string) => {
        onConfigChange({
            type: 'nationwide',
            price: parseFloat(price) || 0
        });
    };

    const handleAddRate = () => {
        const price = parseFloat(ratePrice);
        if (isNaN(price)) return;

        if (shippingConfig.type === 'by_city' && selectedCityId) {
            onConfigChange({
                ...shippingConfig,
                rates: {
                    ...shippingConfig.rates,
                    [selectedCityId]: price
                }
            });
        } else if (shippingConfig.type === 'by_district' && selectedDistrictId) {
            onConfigChange({
                ...shippingConfig,
                rates: {
                    ...shippingConfig.rates,
                    [selectedDistrictId]: price
                }
            });
        }

        // Reset form
        setSelectedCityId(null);
        setSelectedDistrictId(null);
        setRatePrice('');
        setIsAddOpen(false);
    };

    const handleRemoveRate = (id: string) => {
        if (shippingConfig.type === 'by_city' || shippingConfig.type === 'by_district') {
            const newRates = { ...shippingConfig.rates };
            delete newRates[id];
            onConfigChange({
                ...shippingConfig,
                rates: newRates
            });
        }
    };

    const handleBulkAdd = () => {
        const price = parseFloat(bulkPrice);
        if (isNaN(price)) return;

        if (shippingConfig.type !== 'by_city' && shippingConfig.type !== 'by_district') return;

        const newRates = { ...shippingConfig.rates };

        if (shippingConfig.type === 'by_city') {
            cities.forEach(city => {
                newRates[city.id] = price;
            });
        } else if (shippingConfig.type === 'by_district' && selectedCityId) {
            // Add all districts in selected city
            const cityDistricts = districts.filter(d => d.city_id === selectedCityId);
            cityDistricts.forEach(d => {
                newRates[d.id] = price;
            });
        }

        onConfigChange({
            ...shippingConfig,
            rates: newRates
        });

        setIsBulkOpen(false);
        setBulkPrice('');
    };

    const handleClearAll = () => {
        if (shippingConfig.type !== 'by_city' && shippingConfig.type !== 'by_district') return;

        onConfigChange({
            ...shippingConfig,
            rates: {}
        });
        setSelectedRates(new Set());
    };

    const handleToggleSelect = (id: string) => {
        const newSelected = new Set(selectedRates);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedRates(newSelected);
    };

    const handleSelectAll = () => {
        if (shippingConfig.type !== 'by_city' && shippingConfig.type !== 'by_district') return;

        if (selectedRates.size === Object.keys(shippingConfig.rates).length) {
            setSelectedRates(new Set());
        } else {
            setSelectedRates(new Set(Object.keys(shippingConfig.rates)));
        }
    };

    const handleUpdateSelected = () => {
        if (shippingConfig.type !== 'by_city' && shippingConfig.type !== 'by_district') return;

        const price = parseFloat(updatePrice);
        if (isNaN(price)) return;

        const newRates = { ...shippingConfig.rates };
        selectedRates.forEach(id => {
            newRates[id] = price;
        });

        onConfigChange({
            ...shippingConfig,
            rates: newRates
        });

        setIsUpdateOpen(false);
        setUpdatePrice('');
        setSelectedRates(new Set());
    };

    const getCityName = (id: string) => {
        const city = cities.find(c => c.id === parseInt(id));
        return direction === 'rtl' ? city?.name_ar : city?.name_en;
    };

    const getDistrictName = (id: string) => {
        const district = districts.find(d => d.id === parseInt(id));
        const city = cities.find(c => c.id === district?.city_id);
        const districtName = direction === 'rtl' ? district?.name_ar : district?.name_en;
        const cityName = direction === 'rtl' ? city?.name_ar : city?.name_en;
        return `${cityName} - ${districtName}`;
    };

    const filteredDistricts = useMemo(() => {
        if (!selectedCityId) return [];
        return districts.filter(d => d.city_id === selectedCityId);
    }, [selectedCityId, districts]);

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#008069]" />
                {direction === 'rtl' ? 'إعدادات الشحن' : 'Shipping Settings'}
            </h3>

            <div className="space-y-6">
                {/* Shipping Type Selector */}
                <RadioGroup
                    value={shippingConfig.type}
                    onValueChange={handleTypeChange}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <div
                        onClick={() => handleTypeChange('none')}
                        className={cn(
                            "flex items-start space-x-3 space-x-reverse rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                            shippingConfig.type === 'none' && "border-[#008069] bg-green-50/50"
                        )}>
                        <RadioGroupItem value="none" id="type-none" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="type-none" className="font-bold cursor-pointer block">
                                {direction === 'rtl' ? 'لا يوجد شحن' : 'No Shipping'}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                {direction === 'rtl'
                                    ? 'تعطيل خيارات الشحن (استلام من المتجر فقط)'
                                    : 'Disable shipping options (Pickup only)'}
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => handleTypeChange('nationwide')}
                        className={cn(
                            "flex items-start space-x-3 space-x-reverse rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                            shippingConfig.type === 'nationwide' && "border-[#008069] bg-green-50/50"
                        )}>
                        <RadioGroupItem value="nationwide" id="type-nationwide" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="type-nationwide" className="font-bold cursor-pointer block">
                                {direction === 'rtl' ? 'سعر موحد' : 'Flat Rate'}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                {direction === 'rtl'
                                    ? 'سعر شحن ثابت لجميع المناطق'
                                    : 'Fixed shipping price for all locations'}
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => handleTypeChange('by_city')}
                        className={cn(
                            "flex items-start space-x-3 space-x-reverse rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                            shippingConfig.type === 'by_city' && "border-[#008069] bg-green-50/50"
                        )}>
                        <RadioGroupItem value="by_city" id="type-city" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="type-city" className="font-bold cursor-pointer block">
                                {direction === 'rtl' ? 'حسب المحافظة' : 'By Governorate'}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                {direction === 'rtl'
                                    ? 'تحديد سعر شحن مختلف لكل محافظة'
                                    : 'Set different shipping prices per governorate'}
                            </p>
                        </div>
                    </div>

                    <div
                        onClick={() => handleTypeChange('by_district')}
                        className={cn(
                            "flex items-start space-x-3 space-x-reverse rounded-lg border p-4 cursor-pointer hover:bg-gray-50 transition-colors",
                            shippingConfig.type === 'by_district' && "border-[#008069] bg-green-50/50"
                        )}>
                        <RadioGroupItem value="by_district" id="type-district" className="mt-1" />
                        <div className="flex-1">
                            <Label htmlFor="type-district" className="font-bold cursor-pointer block">
                                {direction === 'rtl' ? 'حسب المنطقة' : 'By District'}
                            </Label>
                            <p className="text-sm text-gray-500 mt-1">
                                {direction === 'rtl'
                                    ? 'تحديد سعر شحن مفصل لكل منطقة/حي'
                                    : 'Set detailed shipping prices per district/area'}
                            </p>
                        </div>
                    </div>
                </RadioGroup>

                {/* Dynamic Content */}
                {shippingConfig.type === 'nationwide' && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-100 animate-in fade-in slide-in-from-top-2">
                        <Label className="text-sm font-bold text-gray-700 block mb-2">
                            {direction === 'rtl' ? 'سعر الشحن' : 'Shipping Price'}
                        </Label>
                        <div className="relative max-w-xs">
                            <Input
                                type="number"
                                min="0"
                                value={shippingConfig.price || ''}
                                onChange={(e) => handleNationwidePriceChange(e.target.value)}
                                className="pl-16 rtl:pl-4 rtl:pr-16 text-left rtl:text-right"
                                placeholder="0.00"
                            />
                            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center px-4 pointer-events-none text-gray-500 bg-gray-100 border-r rtl:border-r-0 rtl:border-l border-gray-200 rounded-l rtl:rounded-l-none rtl:rounded-r-md">
                                EGP
                            </div>
                        </div>
                    </div>
                )}

                {(shippingConfig.type === 'by_city' || shippingConfig.type === 'by_district') && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <Label className="text-sm font-bold text-gray-700">
                                {direction === 'rtl' ? 'أسعار المناطق' : 'Zone Rates'}
                            </Label>
                            <div className="flex flex-wrap items-center gap-2">
                                <Popover open={isAddOpen} onOpenChange={setIsAddOpen}>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" className="bg-[#008069] hover:bg-green-600">
                                            <Plus className="w-4 h-4 mr-1 rtl:mr-0 rtl:ml-1" />
                                            {direction === 'rtl' ? 'إضافة منطقة' : 'Add Zone'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4" align={direction === 'rtl' ? 'start' : 'end'}>
                                        <div className="space-y-4">
                                            <h4 className="font-medium leading-none">
                                                {direction === 'rtl' ? 'إضافة سعر جديد' : 'Add New Rate'}
                                            </h4>
                                            <div className="space-y-2">
                                                <Label>{direction === 'rtl' ? 'المحافظة' : 'Governorate'}</Label>
                                                <Select
                                                    value={selectedCityId?.toString()}
                                                    onValueChange={(val) => {
                                                        setSelectedCityId(parseInt(val));
                                                        setSelectedDistrictId(null);
                                                    }}
                                                >
                                                    <SelectTrigger>
                                                        <SelectValue placeholder={direction === 'rtl' ? 'اختر محافظة' : 'Select Governorate'} />
                                                    </SelectTrigger>
                                                    <SelectContent className='max-h-60'>
                                                        {cities.map((city) => (
                                                            <SelectItem key={city.id} value={city.id.toString()}>
                                                                {direction === 'rtl' ? city.name_ar : city.name_en}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>

                                            {shippingConfig.type === 'by_district' && (
                                                <div className="space-y-2">
                                                    <Label>{direction === 'rtl' ? 'المنطقة' : 'District'}</Label>
                                                    <Select
                                                        value={selectedDistrictId?.toString()}
                                                        onValueChange={(val) => setSelectedDistrictId(parseInt(val))}
                                                        disabled={!selectedCityId}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={direction === 'rtl' ? 'اختر منطقة' : 'Select District'} />
                                                        </SelectTrigger>
                                                        <SelectContent className='max-h-60'>
                                                            {filteredDistricts.map((district) => (
                                                                <SelectItem key={district.id} value={district.id.toString()}>
                                                                    {direction === 'rtl' ? district.name_ar : district.name_en}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label>{direction === 'rtl' ? 'السعر' : 'Price'}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={ratePrice}
                                                    onChange={(e) => setRatePrice(e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </div>

                                            <Button onClick={handleAddRate} className="w-full bg-[#008069] hover:bg-green-600">
                                                {direction === 'rtl' ? 'إضافة' : 'Add'}
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>
                                <Popover open={isBulkOpen} onOpenChange={setIsBulkOpen}>
                                    <PopoverTrigger asChild>
                                        <Button size="sm" variant="outline">
                                            {direction === 'rtl' ? 'إضافة الكل' : 'Add All'}
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-80 p-4">
                                        <div className="space-y-4">
                                            <h4 className="font-medium leading-none">
                                                {direction === 'rtl' ? 'تطبيق سعر موحد' : 'Apply Bulk Price'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {shippingConfig.type === 'by_city'
                                                    ? (direction === 'rtl' ? 'سيتم إضافة جميع المحافظات بهذا السعر' : 'All governorates will be added with this price')
                                                    : (direction === 'rtl' ? 'يجب اختيار محافظة أولاً لإضافة كل مناطقها' : 'Select a governorate first to add all its districts')
                                                }
                                            </p>

                                            {shippingConfig.type === 'by_district' && (
                                                <div className="space-y-2">
                                                    <Label>{direction === 'rtl' ? 'المحافظة' : 'Governorate'}</Label>
                                                    <Select
                                                        value={selectedCityId?.toString()}
                                                        onValueChange={(val) => {
                                                            setSelectedCityId(parseInt(val));
                                                        }}
                                                    >
                                                        <SelectTrigger>
                                                            <SelectValue placeholder={direction === 'rtl' ? 'اختر محافظة' : 'Select Governorate'} />
                                                        </SelectTrigger>
                                                        <SelectContent className='max-h-60'>
                                                            {cities.map((city) => (
                                                                <SelectItem key={city.id} value={city.id.toString()}>
                                                                    {direction === 'rtl' ? city.name_ar : city.name_en}
                                                                </SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            )}

                                            <div className="space-y-2">
                                                <Label>{direction === 'rtl' ? 'السعر' : 'Price'}</Label>
                                                <Input
                                                    type="number"
                                                    min="0"
                                                    value={bulkPrice}
                                                    onChange={(e) => setBulkPrice(e.target.value)}
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <Button onClick={handleBulkAdd} className="w-full bg-[#008069] hover:bg-green-600">
                                                {direction === 'rtl' ? 'تطبيق' : 'Apply'}
                                            </Button>
                                        </div>
                                    </PopoverContent>
                                </Popover>

                                {(shippingConfig.type === 'by_city' || shippingConfig.type === 'by_district') && Object.keys(shippingConfig.rates).length > 0 && (
                                    <div className="flex flex-wrap gap-2">
                                        <Button size="sm" variant="ghost" onClick={handleSelectAll} className="text-gray-600">
                                            {selectedRates.size === Object.keys(shippingConfig.rates).length
                                                ? (direction === 'rtl' ? 'إلغاء تحديد الكل' : 'Deselect All')
                                                : (direction === 'rtl' ? 'تحديد الكل' : 'Select All')}
                                        </Button>

                                        {selectedRates.size > 0 && (
                                            <Popover open={isUpdateOpen} onOpenChange={setIsUpdateOpen}>
                                                <PopoverTrigger asChild>
                                                    <Button size="sm" variant="outline" className="border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100">
                                                        {direction === 'rtl' ? `تحديث (${selectedRates.size})` : `Update (${selectedRates.size})`}
                                                    </Button>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-80 p-4">
                                                    <div className="space-y-4">
                                                        <h4 className="font-medium leading-none">
                                                            {direction === 'rtl' ? 'تحديث السعر للمحدد' : 'Update Price for Selected'}
                                                        </h4>
                                                        <div className="space-y-2">
                                                            <Label>{direction === 'rtl' ? 'السعر' : 'Price'}</Label>
                                                            <Input
                                                                type="number"
                                                                min="0"
                                                                value={updatePrice}
                                                                onChange={(e) => setUpdatePrice(e.target.value)}
                                                                placeholder="0.00"
                                                            />
                                                        </div>
                                                        <Button onClick={handleUpdateSelected} className="w-full bg-blue-600 hover:bg-blue-700">
                                                            {direction === 'rtl' ? 'تحديث' : 'Update'}
                                                        </Button>
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )}

                                        <Button size="sm" variant="ghost" onClick={handleClearAll} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                                            {direction === 'rtl' ? 'حذف الكل' : 'Clear All'}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Rates List */}
                        <div className="border rounded-lg divide-y bg-gray-50 max-h-60 overflow-y-auto">
                            {(shippingConfig.type === 'by_city' || shippingConfig.type === 'by_district') && Object.entries(shippingConfig.rates).length === 0 ? (
                                <div className="p-8 text-center text-gray-500">
                                    <MapPin className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                    <p>{direction === 'rtl' ? 'لم يتم إضافة مناطق بعد' : 'No zones added yet'}</p>
                                </div>
                            ) : (
                                (shippingConfig.type === 'by_city' || shippingConfig.type === 'by_district') && Object.entries(shippingConfig.rates).map(([id, price]) => (
                                    <div
                                        key={id}
                                        className={cn(
                                            "flex items-center justify-between p-3 cursor-pointer transition-colors",
                                            selectedRates.has(id) ? "bg-blue-50 border-blue-200" : "hover:bg-gray-100"
                                        )}
                                        onClick={() => handleToggleSelect(id)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "p-2 rounded-full border",
                                                selectedRates.has(id) ? "bg-blue-100 border-blue-200" : "bg-white"
                                            )}>
                                                {selectedRates.has(id) ? (
                                                    <Check className="w-4 h-4 text-blue-600" />
                                                ) : (
                                                    <MapPin className="w-4 h-4 text-[#008069]" />
                                                )}
                                            </div>
                                            <span className="font-medium text-gray-700">
                                                {shippingConfig.type === 'by_city' ? getCityName(id) : getDistrictName(id)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <Badge variant={selectedRates.has(id) ? "default" : "secondary"} className={selectedRates.has(id) ? "bg-blue-600 hover:bg-blue-700" : "bg-white"}>
                                                {price} EGP
                                            </Badge>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemoveRate(id);
                                                }}
                                                className="text-red-500 hover:bg-red-50 p-1.5 rounded-full transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )
                }

                {/* Free Shipping Threshold */}
                {
                    shippingConfig.type !== 'none' && (
                        <div className="pt-6 border-t border-gray-100">
                            <div className="flex items-start justify-between">
                                <div>
                                    <Label className="text-base font-bold text-gray-900 block">
                                        {direction === 'rtl' ? 'شحن مجاني للطلبات الكبيرة' : 'Free Shipping for Large Orders'}
                                    </Label>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {direction === 'rtl'
                                            ? 'سيتم تطبيق شحن مجاني تلقائياً عندما يتجاوز الطلب هذا المبلغ'
                                            : 'Free shipping will be automatically applied when order total exceeds this amount'}
                                    </p>
                                </div>
                                <Switch
                                    checked={freeShippingThreshold !== null}
                                    onCheckedChange={(checked) => onThresholdChange(checked ? 0 : null)}
                                />
                            </div>

                            {freeShippingThreshold !== null && (
                                <div className="mt-4 max-w-xs animate-in fade-in slide-in-from-top-1">
                                    <Label className="text-sm font-bold text-gray-700 block mb-2">
                                        {direction === 'rtl' ? 'الحد الأدنى للطلب' : 'Minimum Order Amount'}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            type="number"
                                            min="0"
                                            value={freeShippingThreshold}
                                            onChange={(e) => onThresholdChange(parseFloat(e.target.value) || 0)}
                                            className="pl-16 rtl:pl-4 rtl:pr-16 text-left rtl:text-right"
                                        />
                                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 flex items-center px-4 pointer-events-none text-gray-500 bg-gray-100 border-r rtl:border-r-0 rtl:border-l border-gray-200 rounded-l rtl:rounded-l-none rtl:rounded-r-md">
                                            EGP
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )
                }
            </div >

            {/* Live Preview Card */}
            <div className="mt-8 border-t pt-6 animate-in fade-in slide-in-from-top-4">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    {direction === 'rtl' ? 'معاينة للعميل' : 'Customer Preview'}
                </h4>
                <div className="bg-gray-50 border rounded-xl p-4 max-w-sm mx-auto shadow-sm">
                    <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{direction === 'rtl' ? 'المنتجات' : 'Subtotal'}</span>
                            <span className="font-medium">250.00 EGP</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">{direction === 'rtl' ? 'الشحن' : 'Shipping'}</span>
                            <span className="font-medium text-[#008069]">
                                {shippingConfig.type === 'none' ? (direction === 'rtl' ? 'غير متاح' : 'N/A') :
                                    shippingConfig.type === 'nationwide' ? `${shippingConfig.price} EGP` :
                                        (direction === 'rtl' ? 'يختلف حسب العنوان' : 'Depends on address')}
                            </span>
                        </div>
                        {freeShippingThreshold && (
                            <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-100 flex items-center gap-2">
                                <Check className="w-3 h-3" />
                                {direction === 'rtl'
                                    ? `شحن مجاني للطلبات فوق ${freeShippingThreshold} ج.م`
                                    : `Free shipping on orders over ${freeShippingThreshold} EGP`}
                            </div>
                        )}
                        <div className="pt-2 border-t flex justify-between font-bold">
                            <span>{direction === 'rtl' ? 'الإجمالي' : 'Total'}</span>
                            <span>...</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
