'use client';

import { useState, useEffect } from 'react';
import { Product, ProductOption, ProductVariant } from '@/lib/types/database';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Plus, Trash2, ChevronDown, Sparkles, DollarSign, Infinity as InfinityIcon, Info } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useMockDashboard } from '@/lib/contexts/MockDashboardContext';

interface MockProductFormModalProps {
    storeId: string;
    storeSlug: string;
    product?: Product | null;
    onClose: () => void;
    onSaved: () => void;
}

interface LocalVariant {
    id?: string;
    option_values: { [key: string]: string };
    price: string;
    quantity: string;
    sku: string;
}

interface LocalOption {
    name: string;
    values: string[];
    rawValuesInput: string;
}

export default function MockProductFormModal({
    storeId,
    storeSlug,
    product,
    onClose,
    onSaved,
}: MockProductFormModalProps) {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [currentPrice, setCurrentPrice] = useState('');
    const [originalPrice, setOriginalPrice] = useState('');
    const [category, setCategory] = useState('');
    const [quantity, setQuantity] = useState('');
    const [unlimitedStock, setUnlimitedStock] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [thumbnailUrl, setThumbnailUrl] = useState(''); // Not really used in mock but kept for types
    const [imagePreview, setImagePreview] = useState('');
    const [options, setOptions] = useState<LocalOption[]>([]);
    const [variants, setVariants] = useState<LocalVariant[]>([]);
    const [loading, setLoading] = useState(false);
    const [variantsOpen, setVariantsOpen] = useState(true);
    const { toast } = useToast();
    const { t } = useLanguage();
    const { addProduct, updateProduct } = useMockDashboard();

    useEffect(() => {
        if (product) {
            setName(product.name);
            setDescription(product.description || '');
            setCurrentPrice(product.current_price.toString());
            setOriginalPrice(product.original_price?.toString() || '');
            setCategory(product.category || '');
            setQuantity((product.quantity ?? 0).toString());
            setUnlimitedStock(product.unlimited_stock || false);
            setImageUrl(product.image_url || '');
            setImagePreview(product.image_url || '');
            const productOptions = Array.isArray(product.options) ? product.options : [];
            setOptions(productOptions.map((opt: any) => {
                const stringValues = Array.isArray(opt.values)
                    ? opt.values.map((v: any) => String(v))
                    : [];
                return {
                    name: String(opt.name || ''),
                    values: stringValues,
                    rawValuesInput: stringValues.join(', ')
                };
            }));

            // Load variants from product object directly since we passed them in the context
            if (product.variants && product.variants.length > 0) {
                setVariants(product.variants.map((v: any) => {
                    const stringOptionValues: { [key: string]: string } = {};
                    if (v.option_values) {
                        Object.entries(v.option_values).forEach(([key, value]) => {
                            stringOptionValues[String(key)] = String(value);
                        });
                    }
                    return {
                        id: v.id,
                        option_values: stringOptionValues,
                        price: (v.price ?? 0).toString(),
                        quantity: (v.quantity ?? 0).toString(),
                        sku: v.sku || '',
                    };
                }));
            }
        }
    }, [product]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const result = reader.result as string;
                setImagePreview(result);
                setImageUrl(result); // Directly use base64 for mock
            };
            reader.readAsDataURL(file);
        }
    };

    const addOption = () => {
        if (options.length >= 3) {
            toast({
                title: 'Maximum options reached',
                description: 'You can only add up to 3 options per product',
                variant: 'destructive',
            });
            return;
        }
        setOptions([...options, { name: '', values: [], rawValuesInput: '' }]);
    };

    const removeOption = (index: number) => {
        setOptions(options.filter((_, i) => i !== index));
        setVariants([]);
    };

    const updateOptionName = (index: number, name: string) => {
        const newOptions = [...options];
        newOptions[index].name = name;
        setOptions(newOptions);
    };

    const updateOptionValues = (index: number, valuesString: string) => {
        const newOptions = [...options];
        newOptions[index].rawValuesInput = valuesString;
        newOptions[index].values = valuesString
            .split(/[,،]/)
            .map((v) => v.trim())
            .filter((v) => v.length > 0);
        setOptions(newOptions);
    };

    const generateVariants = () => {
        try {
            const validOptions = options.filter((opt) => opt.name && opt.values.length > 0);

            if (validOptions.length === 0) {
                toast({
                    title: 'No options defined',
                    description: 'Please add at least one option with values first',
                    variant: 'destructive',
                });
                return;
            }

            const cartesian = (...arrays: string[][]): string[][] => {
                return arrays.reduce<string[][]>(
                    (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
                    [[]]
                );
            };

            const optionArrays = validOptions.map((opt) => opt.values.map(v => String(v).trim()));
            const combinations = cartesian(...optionArrays);

            const newVariants: LocalVariant[] = combinations.map((combo) => {
                const optionValues: { [key: string]: string } = {};
                validOptions.forEach((opt, i) => {
                    optionValues[String(opt.name)] = String(combo[i] || '');
                });

                const existing = variants.find(
                    (v) => JSON.stringify(v.option_values) === JSON.stringify(optionValues)
                );

                if (existing) {
                    return { ...existing };
                }

                return {
                    option_values: optionValues,
                    price: currentPrice || '0',
                    quantity: '0',
                    sku: '',
                };
            });

            setVariants(newVariants);
            toast({
                title: 'Variants generated!',
                description: `${newVariants.length} variants created`,
            });
        } catch (error: any) {
            console.error('Error generating variants:', error);
        }
    };

    const applyPriceToAll = () => {
        if (!currentPrice) return;
        setVariants(variants.map((v) => ({ ...v, price: currentPrice })));
        toast({ title: 'Price applied to all variants' });
    };

    const applyQuantityToAll = (qty: string) => {
        setVariants(variants.map((v) => ({ ...v, quantity: qty })));
        toast({ title: 'Quantity applied to all variants' });
    };

    const updateVariant = (index: number, field: keyof LocalVariant, value: string) => {
        const newVariants = [...variants];
        (newVariants[index] as any)[field] = value;
        setVariants(newVariants);
    };

    const removeVariant = (index: number) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const getVariantLabel = (variant: LocalVariant) => {
        return Object.values(variant.option_values || {}).map(v => String(v)).join(' / ');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const validOptions = options.filter(
                (opt) => opt.name && opt.values.length > 0
            );

            const productData = {
                name,
                description: description || undefined,
                current_price: parseFloat(currentPrice),
                original_price: originalPrice ? parseFloat(originalPrice) : undefined,
                category: category || undefined,
                quantity: parseInt(quantity) || 0,
                unlimited_stock: unlimitedStock,
                image_url: imageUrl || undefined,
                thumbnail_url: imageUrl || undefined, // Mock uses same URL
                options: validOptions,
                variants: variants.map(v => ({
                    product_id: product?.id || '', // Will be set in context if new
                    option_values: v.option_values,
                    price: parseFloat(v.price) || 0,
                    quantity: parseInt(v.quantity) || 0,
                    sku: v.sku || undefined,
                    id: v.id || crypto.randomUUID()
                }))
            };

            if (product) {
                updateProduct({ ...productData, id: product.id });
            } else {
                addProduct(productData);
            }

            onSaved();
        } catch (error: any) {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    const hasVariants = variants.length > 0;

    return (
        <Dialog open onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">
                        {product ? t('products.edit_product') : t('products.add_new')} (Demo)
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label>{t('products.image_label')}</Label>
                        <div className="flex items-center gap-4">
                            {imagePreview && (
                                <div className="relative w-32 h-32 rounded-2xl overflow-hidden bg-gray-100">
                                    <Image
                                        src={imagePreview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            )}
                            <label className="cursor-pointer">
                                <div className="border-2 border-dashed rounded-2xl p-6 hover:bg-gray-50 transition">
                                    <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm text-gray-600">Click to select (Local only)</p>
                                </div>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>

                    {/* Basic Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2 col-span-2">
                            <Label>{t('products.name_label')} *</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t('products.name_placeholder')}
                                className="rounded-2xl"
                            />
                        </div>

                        <div className="space-y-2 col-span-2">
                            <Label>{t('products.description_label')}</Label>
                            <Textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('products.description_placeholder')}
                                rows={3}
                                className="rounded-2xl resize-none"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{hasVariants ? t('products.price_label') : t('products.price_label') + ' *'}</Label>
                            <Input
                                type="number"
                                step="1"
                                value={currentPrice}
                                onChange={(e) => setCurrentPrice(e.target.value)}
                                placeholder="29.99"
                                required
                                className="rounded-2xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('products.original_price_label')}</Label>
                            <Input
                                type="number"
                                step="1"
                                value={originalPrice}
                                onChange={(e) => setOriginalPrice(e.target.value)}
                                placeholder="39.99"
                                className="rounded-2xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{t('products.category_label')}</Label>
                            <Input
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                placeholder={t('products.category_placeholder')}
                                className="rounded-2xl"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>{hasVariants ? t('products.stock_label') : t('products.stock_label')}</Label>
                            {!unlimitedStock && (
                                <Input
                                    type="number"
                                    value={quantity}
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="10"
                                    required={!hasVariants && !unlimitedStock}
                                    className="rounded-2xl"
                                />
                            )}
                            <div className="flex items-center space-x-2 pt-2">
                                <Switch
                                    id="unlimited-stock"
                                    checked={unlimitedStock}
                                    onCheckedChange={setUnlimitedStock}
                                />
                                <Label htmlFor="unlimited-stock" className="cursor-pointer">
                                    {t('products.unlimited_stock')}
                                </Label>
                            </div>
                        </div>
                    </div>

                    {/* Options Section */}
                    <div className="space-y-4 pt-4 border-t">
                        <div className="flex items-center justify-between">
                            <Label className="text-base">{t('products.options_label')}</Label>
                            <Button
                                type="button"
                                onClick={addOption}
                                disabled={options.length >= 3}
                                variant="outline"
                                className="rounded-2xl"
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                {t('products.add_option')}
                            </Button>
                        </div>

                        {options.map((option, index) => (
                            <div key={index} className="space-y-3 p-4 bg-gray-50 rounded-2xl relative">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-700">{t('products.option_name')} {index + 1}</span>
                                    {options.length > 1 && (
                                        <Button
                                            onClick={() => removeOption(index)}
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-full h-8 w-8 p-0"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                                <Input
                                    value={option.name}
                                    onChange={(e) => updateOptionName(index, e.target.value)}
                                    placeholder={t('products.option_name_placeholder')}
                                    className="rounded-2xl bg-white"
                                />
                                <Input
                                    value={option.rawValuesInput}
                                    onChange={(e) => updateOptionValues(index, e.target.value)}
                                    placeholder={t('products.option_values_placeholder')}
                                    className="rounded-2xl bg-white"
                                />
                                <div className="flex items-start gap-2 p-3 bg-blue-50 text-blue-700 rounded-xl text-xs">
                                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{t('products.option_values_hint')}</span>
                                </div>
                            </div>
                        ))}

                        {options.length > 0 && options.some((o) => o.name && o.values.length > 0) && (
                            <Button
                                type="button"
                                onClick={generateVariants}
                                className="w-full rounded-2xl bg-[#008069] hover:bg-[#017561]"
                            >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {t('products.manage_variants')}
                            </Button>
                        )}
                    </div>

                    {/* Variants Section */}
                    {variants.length > 0 && (
                        <Collapsible open={variantsOpen} onOpenChange={setVariantsOpen}>
                            <div className="border rounded-2xl overflow-hidden">
                                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-[#008069] text-white hover:bg-[#017561] transition">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{t('products.variants_label')} ({variants.length})</span>
                                    </div>
                                    <ChevronDown className={`w-5 h-5 transition-transform ${variantsOpen ? 'rotate-180' : ''}`} />
                                </CollapsibleTrigger>

                                <CollapsibleContent>
                                    <div className="p-3 bg-gray-100 border-b flex gap-2 flex-wrap">
                                        <Button
                                            type="button"
                                            onClick={applyPriceToAll}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                        >
                                            <DollarSign className="w-3 h-3 mr-1" />
                                            {t('common.currency')} {currentPrice || '0'}
                                        </Button>
                                        <Button
                                            type="button"
                                            onClick={() => applyQuantityToAll('10')}
                                            variant="outline"
                                            size="sm"
                                            className="rounded-xl"
                                        >
                                            Set Qty 10 for all
                                        </Button>
                                    </div>

                                    {unlimitedStock && (
                                        <div className="p-3 bg-blue-50 border-b text-sm text-blue-700">
                                            Product is set to "Always in stock". All variants will also be unlimited.
                                        </div>
                                    )}

                                    <div className="flex items-center gap-3 p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                        <div className="flex-1">{t('products.variants_label')}</div>
                                        <div className="w-24">{t('products.price_label')}</div>
                                        <div className="w-16 text-center">{t('products.stock_label')}</div>
                                        <div className="w-8"></div>
                                    </div>

                                    <div className="max-h-[300px] overflow-y-auto">
                                        {variants.map((variant, index) => (
                                            <div
                                                key={index}
                                                className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="inline-block bg-[#dcf8c6] px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm font-medium">
                                                            {getVariantLabel(variant)}
                                                        </div>
                                                    </div>

                                                    <Input
                                                        type="number"
                                                        step="1"
                                                        value={String(variant.price ?? '')}
                                                        onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                                        placeholder="Price"
                                                        className="w-24 h-8 text-sm rounded-xl"
                                                    />

                                                    {!unlimitedStock ? (
                                                        <Input
                                                            type="number"
                                                            value={String(variant.quantity ?? '')}
                                                            onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                                            placeholder="Qty"
                                                            className="w-16 h-8 text-sm rounded-xl"
                                                        />
                                                    ) : (
                                                        <div className="w-16 h-8 flex items-center justify-center text-gray-400">
                                                            <InfinityIcon className="w-5 h-5" />
                                                        </div>
                                                    )}

                                                    <Button
                                                        type="button"
                                                        onClick={() => removeVariant(index)}
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-8 w-8 p-0 rounded-full"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-500" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CollapsibleContent>
                            </div>
                        </Collapsible>
                    )}

                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            onClick={onClose}
                            variant="outline"
                            className="flex-1 rounded-3xl h-12"
                        >
                            {t('common.back')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 rounded-3xl h-12 bg-[#008069] hover:bg-[#017561]"
                        >
                            {loading ? t('common.saving') : product ? t('products.edit_product') : t('products.add_new')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
