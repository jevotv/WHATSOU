'use client';

import * as React from 'react';
import { X, Filter, ChevronDown, Check } from 'lucide-react';
import * as Slider from '@radix-ui/react-slider';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/contexts/LanguageContext';

interface ProductFiltersProps {
    isOpen: boolean;
    onClose: () => void;
    maxPrice: number;
    minPrice: number;
    priceRange: [number, number];
    onPriceChange: (value: [number, number]) => void;
    attributes: { name: string; values: string[] }[];
    selectedAttributes: { [key: string]: string[] }; // { "Color": ["Red", "Blue"], "Size": ["L"] }
    onAttributeChange: (name: string, value: string) => void;
    onClearFilters: () => void;
}

export default function ProductFilters({
    isOpen,
    onClose,
    maxPrice,
    minPrice,
    priceRange,
    onPriceChange,
    attributes,
    selectedAttributes,
    onAttributeChange,
    onClearFilters,
}: ProductFiltersProps) {
    const { t, direction } = useLanguage();
    const [expandedSections, setExpandedSections] = React.useState<string[]>(
        attributes.map((a) => a.name)
    );

    const toggleSection = (name: string) => {
        setExpandedSections((prev) =>
            prev.includes(name)
                ? prev.filter((n) => n !== name)
                : [...prev, name]
        );
    };

    // Prevent body scroll when open
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer */}
            <div className={cn(
                "fixed inset-y-0 z-50 w-full sm:w-[400px] bg-white shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
                direction === 'rtl' ? "left-0" : "right-0",
                // Animation handled by mounting/unmounting or could use a transition class if kept mounted
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <Filter className="w-5 h-5 text-[#111813]" />
                        <h2 className="text-xl font-bold text-[#111813]">{t('storefront.filters')}</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-8">

                    {/* Price Range */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-[#111813]">{t('storefront.price_range')}</h3>
                        <div className="px-2">
                            <Slider.Root
                                className="relative flex items-center select-none touch-none w-full h-5"
                                value={priceRange}
                                max={maxPrice}
                                min={minPrice}
                                step={1}
                                minStepsBetweenThumbs={1}
                                onValueChange={(val) => onPriceChange(val as [number, number])}
                            >
                                <Slider.Track className="bg-gray-200 relative grow rounded-full h-[3px]">
                                    <Slider.Range className="absolute bg-[#111813] rounded-full h-full" />
                                </Slider.Track>
                                <Slider.Thumb
                                    className="block w-5 h-5 bg-white border-2 border-[#111813] shadow-md rounded-full hover:scale-110 focus:outline-none transition-transform"
                                    aria-label="Min Price"
                                />
                                <Slider.Thumb
                                    className="block w-5 h-5 bg-white border-2 border-[#111813] shadow-md rounded-full hover:scale-110 focus:outline-none transition-transform"
                                    aria-label="Max Price"
                                />
                            </Slider.Root>
                        </div>
                        <div className="flex items-center justify-between text-sm font-medium text-gray-600">
                            <span>{priceRange[0]} {t('common.currency')}</span>
                            <span>{priceRange[1]} {t('common.currency')}</span>
                        </div>
                    </div>

                    <div className="border-t border-gray-100" />

                    {/* Attributes */}
                    {attributes.map((attr) => (
                        <div key={attr.name} className="space-y-3">
                            <button
                                onClick={() => toggleSection(attr.name)}
                                className="flex items-center justify-between w-full group"
                            >
                                <h3 className="font-bold text-[#111813] group-hover:text-[#19e65e] transition-colors">
                                    {attr.name}
                                </h3>
                                <ChevronDown
                                    className={cn(
                                        "w-5 h-5 text-gray-400 transition-transform duration-200",
                                        expandedSections.includes(attr.name) && "rotate-180"
                                    )}
                                />
                            </button>

                            {expandedSections.includes(attr.name) && (
                                <div className="grid grid-cols-2 gap-2 animate-in slide-in-from-top-2 duration-200">
                                    {attr.values.map((value) => {
                                        const isSelected = selectedAttributes[attr.name]?.includes(value);
                                        return (
                                            <button
                                                key={value}
                                                onClick={() => onAttributeChange(attr.name, value)}
                                                className={cn(
                                                    "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all border",
                                                    isSelected
                                                        ? "bg-[#111813] text-white border-[#111813] shadow-sm"
                                                        : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-4 h-4 rounded border flex items-center justify-center transition-colors",
                                                    isSelected ? "border-white bg-[#111813]" : "border-gray-300 bg-white"
                                                )}>
                                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                                </div>
                                                <span className="truncate">{value}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                            <div className="border-t border-gray-100 my-4" />
                        </div>
                    ))}

                </div>

                {/* Footer */}
                <div className="border-t border-gray-100 p-6 bg-white space-y-3">
                    <Button
                        onClick={onClose}
                        className="w-full bg-[#111813] hover:bg-black text-white h-12 rounded-xl text-base font-bold shadow-md hover:shadow-lg transition-all"
                    >
                        {t('filters.show_results')}
                    </Button>
                    <Button
                        variant="ghost"
                        onClick={onClearFilters}
                        className="w-full h-10 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl"
                    >
                        {t('filters.clear_all')}
                    </Button>
                </div>
            </div>
        </>
    );
}
