'use client';

import { useState, useEffect, useRef } from 'react';
import { Product, ProductOption, ProductVariant, ProductImage } from '@/lib/types/database';
import { supabase } from '@/lib/supabase/client';
import { api } from '@/lib/api/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, Plus, Trash2, ChevronDown, Sparkles, DollarSign, Infinity as InfinityIcon, Info, Camera as CameraIcon, X, GripVertical, AlertCircle, RefreshCw, ImageIcon } from 'lucide-react';
import Image from 'next/image';
import { Switch } from '@/components/ui/switch';
import { processProductImage } from '@/lib/utils/imageProcessor';
import { slugify } from '@/lib/utils/slug';
import { useLanguage } from '@whatsou/shared';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

interface ProductFormModalProps {
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
  imageIndex?: number | null; // Index of product image (0-based)
}

interface LocalOption {
  name: string;
  values: string[];
  rawValuesInput: string;
}

interface ImageItem {
  id: string; // generated uuid for key
  url: string;
  thumbnailUrl: string;
  altText: string;
  file?: File; // validation/upload
  status: 'pending' | 'uploading' | 'completed' | 'error';
  progress: number;
}

export default function ProductFormModal({
  storeId,
  storeSlug,
  product,
  onClose,
  onSaved,
}: ProductFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [unlimitedStock, setUnlimitedStock] = useState(false);
  const [options, setOptions] = useState<LocalOption[]>([]);
  const [variants, setVariants] = useState<LocalVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const [showZeroStockDialog, setShowZeroStockDialog] = useState(false);

  // Image State
  const [images, setImages] = useState<ImageItem[]>([]);
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(null);

  const { toast } = useToast();
  const { t, language } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load existing product data
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setCurrentPrice(product.current_price.toString());
      setOriginalPrice(product.original_price?.toString() || '');
      setCategory(product.category || '');
      setQuantity((product.quantity ?? 0).toString());
      setUnlimitedStock(product.unlimited_stock || false);

      // Load Images
      // Ideally fetched from product_images table via backend relation
      // But assuming product object might have them populated or we use the single legacy one if not.
      // The `loadStoreAndProducts` in dashboard page should select product_images.
      // If not present (e.g. first load), we fallback to image_url.

      let initialImages: ImageItem[] = [];
      if (product.images && product.images.length > 0) {
        initialImages = product.images
          .sort((a, b) => a.display_order - b.display_order)
          .map(img => ({
            id: img.id,
            url: img.image_url,
            thumbnailUrl: img.thumbnail_url || img.image_url,
            altText: img.alt_text || '',
            status: 'completed',
            progress: 100
          }));
      } else if (product.image_url) {
        // Fallback for legacy
        initialImages = [{
          id: 'legacy-main',
          url: product.image_url,
          thumbnailUrl: product.thumbnail_url || product.image_url,
          altText: '',
          status: 'completed',
          progress: 100
        }];
      }
      setImages(initialImages);

      const productOptions = Array.isArray(product.options) ? product.options : [];
      setOptions(productOptions.map((opt: ProductOption) => {
        const stringValues = Array.isArray(opt.values)
          ? opt.values.map(v => String(v))
          : [];
        return {
          name: String(opt.name || ''),
          values: stringValues,
          rawValuesInput: stringValues.join(', ')
        };
      }));

      if (product.variants && product.variants.length > 0) {
        setVariants(product.variants.map((v: ProductVariant) => {
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
            imageIndex: v.image_index ?? null,
          };
        }));
      } else {
        loadVariants(product.id);
      }
    }
  }, [product]);

  const loadVariants = async (productId: string) => {
    // Fallback only - ideally we shouldn't hit this in the app
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (data) {
      setVariants(data.map((v: ProductVariant) => {
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
          imageIndex: v.image_index ?? null,
        };
      }));
    }
  };

  // --- Image Handling ---

  const handleNativeCamera = async () => {
    try {
      if (images.length >= 5) {
        toast({ title: 'Limit Reached', description: 'Maximum 5 images allowed.', variant: 'destructive' });
        return;
      }

      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: CameraSource.Prompt,
      });

      if (image.dataUrl) {
        const res: Response = await fetch(image.dataUrl);
        const blob: Blob = await res.blob();
        const file = new File([blob], 'camera_photo.jpg', { type: blob.type });
        handleAddFiles([file]);
      }
    } catch (error: any) {
      if (error.message !== 'User cancelled photos app') {
        toast({ title: 'Error', description: 'Could not access camera', variant: 'destructive' });
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleAddFiles(Array.from(e.target.files));
    }
  };

  const handleAddFiles = async (files: File[]) => {
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      toast({ title: 'Limit Reached', description: 'Maximum 5 images allowed.', variant: 'destructive' });
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);

    // Create optimistic items
    const newItems: ImageItem[] = filesToUpload.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      url: URL.createObjectURL(file), // Temporary preview
      thumbnailUrl: URL.createObjectURL(file),
      altText: '',
      file,
      status: 'pending',
      progress: 0
    }));

    setImages(prev => [...prev, ...newItems]);

    // Start uploads
    newItems.forEach(item => uploadImageItem(item));
  };

  const uploadImageItem = async (item: ImageItem) => {
    if (!item.file) return;

    setImages(prev => prev.map(img => img.id === item.id ? { ...img, status: 'uploading' } : img));

    try {
      // Process
      const { thumbnail, full, basePath } = await processProductImage(item.file, {
        productName: name || 'product',
      });

      if (!storeSlug) throw new Error("Store information missing");

      const formData = new FormData();
      formData.append('thumbnail', thumbnail);
      formData.append('full', full);
      formData.append('storeSlug', storeSlug);
      formData.append('productPath', basePath);

      // Upload
      const response = await fetch('/api/upload', { method: 'POST', body: formData });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Upload failed');

      setImages(prev => prev.map(img => img.id === item.id ? {
        ...img,
        url: data.fullUrl,
        thumbnailUrl: data.thumbnailUrl,
        status: 'completed',
        progress: 100
      } : img));

    } catch (error) {
      console.error("Upload error", error);
      setImages(prev => prev.map(img => img.id === item.id ? { ...img, status: 'error' } : img));
      toast({ title: 'Upload Failed', description: 'Failed to upload image.', variant: 'destructive' });
    }
  };

  const retryUpload = (id: string) => {
    const item = images.find(i => i.id === id);
    if (item && item.status === 'error') {
      uploadImageItem(item);
    }
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
  };

  const updateAltText = (id: string, text: string) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, altText: text } : img));
  };

  // Drag and Drop Handlers
  const handleDragStart = (index: number) => {
    setDraggedImageIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedImageIndex === null || draggedImageIndex === index) return;

    const newImages = [...images];
    const draggedItem = newImages[draggedImageIndex];
    newImages.splice(draggedImageIndex, 1);
    newImages.splice(index, 0, draggedItem);

    setImages(newImages);
    setDraggedImageIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  // --- Other Logic ---

  const addOption = () => {
    if (options.length >= 3) {
      toast({ title: 'Maximum options reached', description: 'You can only add up to 3 options', variant: 'destructive' });
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
    newOptions[index].values = valuesString.split(/[,،]/).map(v => v.trim()).filter(v => v.length > 0);
    setOptions(newOptions);
  };

  const generateVariants = () => {
    try {
      const validOptions = options.filter(opt => opt.name && opt.values.length > 0);
      if (validOptions.length === 0) {
        toast({ title: 'No options', description: 'Please add options first', variant: 'destructive' });
        return;
      }

      const cartesian = (...arrays: string[][]): string[][] => {
        return arrays.reduce<string[][]>((acc, curr) => acc.flatMap(a => curr.map(b => [...a, b])), [[]]);
      };

      const optionArrays = validOptions.map(opt => opt.values.map(v => String(v).trim()));
      const combinations = cartesian(...optionArrays);

      const newVariants: LocalVariant[] = combinations.map(combo => {
        const optionValues: { [key: string]: string } = {};
        validOptions.forEach((opt, i) => { optionValues[String(opt.name)] = String(combo[i] || ''); });

        const existing = variants.find(v => JSON.stringify(v.option_values) === JSON.stringify(optionValues));
        if (existing) return { ...existing, id: existing.id || undefined, price: String(existing.price), quantity: String(existing.quantity), sku: String(existing.sku), imageIndex: existing.imageIndex } as LocalVariant;

        return {
          option_values: optionValues,
          price: currentPrice || '0',
          quantity: '0',
          sku: '',
          imageIndex: null,
        };
      });

      setVariants(newVariants);
      toast({ title: 'Variants generated!', description: `${newVariants.length} variants created` });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to generate variants', variant: 'destructive' });
    }
  };

  const applyPriceToAll = () => { setVariants(variants.map(v => ({ ...v, price: currentPrice }))); };
  const applyQuantityToAll = (qty: string) => { setVariants(variants.map(v => ({ ...v, quantity: qty }))); };

  const updateVariant = (index: number, field: keyof LocalVariant, value: string) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => { setVariants(variants.filter((_, i) => i !== index)); };
  const getVariantLabel = (variant: LocalVariant) => Object.values(variant.option_values || {}).map(v => String(v)).join(' / ');

  const updateVariantImageIndex = (index: number, imageIndex: number | null) => {
    const newVariants = [...variants];
    newVariants[index].imageIndex = imageIndex;
    setVariants(newVariants);
  };

  const executeSave = async () => {
    setLoading(true);

    try {
      const validOptions = options.filter(opt => opt.name && opt.values.length > 0);
      const productData = {
        store_id: storeId,
        name,
        description: description || null,
        current_price: parseFloat(currentPrice),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category: category || null,
        quantity: parseInt(quantity) || 0,
        unlimited_stock: unlimitedStock,
        // Backend handles pulling first image for legacy fields
        images: images.map(img => ({ url: img.url, thumbnailUrl: img.thumbnailUrl, altText: img.altText })),
        options: validOptions,
        variants: variants.map(v => ({
          option_values: v.option_values,
          price: parseFloat(v.price) || 0,
          quantity: parseInt(v.quantity) || 0,
          sku: v.sku || null,
          image_index: v.imageIndex ?? null,
        }))
      };

      let result: { success?: boolean; error?: string };
      if (product) {
        result = await api.put<{ success: boolean; error?: string }>(
          `/api/dashboard/products/${product.id}`,
          productData
        );
      } else {
        result = await api.post<{ success: boolean; error?: string }>(
          '/api/dashboard/products',
          productData
        );
      }

      if (result.error) throw new Error(result.error);

      toast({
        title: product ? t('products.edit_product') : t('products.add_new'),
        description: product ? t('dashboard.product_updated_desc') : t('dashboard.product_added_desc'),
      });
      setShowZeroStockDialog(false); // Close dialog if open
      onSaved();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (Capacitor.isNativePlatform()) await Haptics.impact({ style: ImpactStyle.Light });

    // Validate images
    if (images.length === 0) {
      toast({ title: 'Image Required', description: 'Please add at least one image', variant: 'destructive' });
      return;
    }
    if (images.some(i => i.status === 'uploading' || i.status === 'pending')) {
      toast({ title: 'Upload in Progress', description: 'Please wait for images to finish uploading', variant: 'destructive' });
      return;
    }
    if (images.some(i => i.status === 'error')) {
      toast({ title: 'Upload Failed', description: 'Please remove or retry failed images', variant: 'destructive' });
      return;
    }

    const hasVariants = variants.length > 0;
    const allVariantsZeroStock = !unlimitedStock && hasVariants && variants.every(v => (parseInt(v.quantity) || 0) === 0);

    if (allVariantsZeroStock) {
      setShowZeroStockDialog(true);
      return;
    }

    await executeSave();
  };

  const hasVariants = variants.length > 0;
  const allVariantsZeroStock = !unlimitedStock && hasVariants && variants.every(v => (parseInt(v.quantity) || 0) === 0);


  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {product ? t('products.edit_product') : t('products.add_new')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* --- Images Section --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label>{t('products.images_label')} ({images.length}/5)</Label>
              {images.length < 5 && (
                <Button type="button" variant="outline" size="sm" onClick={() => Capacitor.isNativePlatform() ? handleNativeCamera() : fileInputRef.current?.click()}>
                  <Plus className="w-4 h-4 mr-1" /> {t('products.add_image')}
                </Button>
              )}
            </div>

            {/* Hidden Input */}
            <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileSelect} className="hidden" />

            {/* Drag & Drop List */}
            <div className="grid gap-3">
              {images.length === 0 && (
                <div
                  className="border-2 border-dashed rounded-2xl p-8 hover:bg-gray-50 transition flex flex-col items-center justify-center text-gray-400 cursor-pointer"
                  onClick={() => Capacitor.isNativePlatform() ? handleNativeCamera() : fileInputRef.current?.click()}
                >
                  <CameraIcon className="w-8 h-8 mb-2" />
                  <p>{t('products.add_first_image')}</p>
                </div>
              )}
              {images.map((img, index) => (
                <div
                  key={img.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className={`
                            relative flex items-center gap-3 p-2 bg-white rounded-xl border border-gray-100 shadow-sm group
                            ${draggedImageIndex === index ? 'opacity-50 border-blue-400' : ''}
                        `}
                >
                  {/* Drag Handle */}
                  <div className="cursor-grab text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                    <Image src={img.thumbnailUrl || img.url} alt="Thumbnail" fill className={`object-cover ${img.status === 'uploading' ? 'opacity-50' : ''}`} />
                    {img.status === 'uploading' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    )}
                    {img.status === 'error' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-500/10">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <Input
                      placeholder={t('products.alt_text_placeholder') || "Alt text (SEO)"}
                      value={img.altText}
                      onChange={(e) => updateAltText(img.id, e.target.value)}
                      className="h-8 text-sm"
                    />
                    {img.status === 'error' && <p className="text-xs text-red-500 mt-1">Upload failed</p>}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {img.status === 'error' && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => retryUpload(img.id)} className="h-8 w-8 p-0 text-blue-500">
                        <RefreshCw className="w-4 h-4" />
                      </Button>
                    )}
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(img.id)} className="h-8 w-8 p-0 text-red-500 hover:bg-red-50">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
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

                  {allVariantsZeroStock && (
                    <div className="p-3 bg-amber-50 border-b text-sm text-amber-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span className="font-bold">
                        {language === 'ar' ? 'تنبيه: يجب إضافة كمية للأنواع المتاحة' : 'Warning: You must add quantity for available variants'}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 p-3 bg-gray-50 border-b text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="flex-1">{t('products.variants_label')}</div>
                    <div className="w-16 text-center">{t('products.variant_image') || 'صورة'}</div>
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
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                          <div className="flex-1 min-w-0 flex items-center justify-between sm:justify-start gap-2">
                            <div className="inline-block bg-[#dcf8c6] px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm font-medium">
                              {getVariantLabel(variant)}
                            </div>

                            {/* Mobile Delete Button (visible only on small screens) */}
                            <Button
                              type="button"
                              onClick={() => removeVariant(index)}
                              variant="ghost"
                              size="sm"
                              className="sm:hidden h-8 w-8 p-0 rounded-full text-red-500"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                            {/* Image Selector */}
                            <Select
                              value={variant.imageIndex !== null && variant.imageIndex !== undefined ? variant.imageIndex.toString() : "default"}
                              onValueChange={(val) => updateVariantImageIndex(index, val === "default" ? null : parseInt(val))}
                            >
                              <SelectTrigger className="w-16 h-10 sm:h-8 text-xs rounded-xl shrink-0">
                                <SelectValue>
                                  {variant.imageIndex !== null && variant.imageIndex !== undefined && images[variant.imageIndex]?.status === 'completed' ? (
                                    <img
                                      src={images[variant.imageIndex]?.thumbnailUrl}
                                      alt=""
                                      className="w-5 h-5 rounded object-cover"
                                    />
                                  ) : (
                                    <ImageIcon className="w-4 h-4 text-gray-400" />
                                  )}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="default">
                                  <span className="text-gray-500">{t('products.default_image') || 'افتراضي'}</span>
                                </SelectItem>
                                {images.filter(img => img.status === 'completed').map((img, imgIdx) => (
                                  <SelectItem key={imgIdx} value={imgIdx.toString()}>
                                    <div className="flex items-center gap-2">
                                      <img src={img.thumbnailUrl} alt="" className="w-6 h-6 rounded object-cover" />
                                      <span>{imgIdx + 1}</span>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                            <Input
                              type="number"
                              step="1"
                              value={String(variant.price ?? '')}
                              onChange={(e) => updateVariant(index, 'price', e.target.value)}
                              placeholder="Price"
                              className="flex-1 min-w-[3rem] h-10 sm:h-8 text-sm rounded-xl"
                            />

                            {!unlimitedStock ? (
                              <Input
                                type="number"
                                value={String(variant.quantity ?? '')}
                                onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                                placeholder="Qty"
                                className="w-20 sm:w-16 h-10 sm:h-8 text-sm rounded-xl shrink-0"
                              />
                            ) : (
                              <div className="w-20 sm:w-16 h-10 sm:h-8 flex items-center justify-center text-gray-400 bg-gray-50 rounded-xl shrink-0">
                                <InfinityIcon className="w-5 h-5" />
                              </div>
                            )}

                            {/* Desktop Delete Button */}
                            <Button
                              type="button"
                              onClick={() => removeVariant(index)}
                              variant="ghost"
                              size="sm"
                              className="hidden sm:flex h-8 w-8 p-0 rounded-full shrink-0"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CollapsibleContent>
              </div>
            </Collapsible>
          )}

          {/* Submit Buttons */}
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

      <AlertDialog open={showZeroStockDialog} onOpenChange={setShowZeroStockDialog}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-amber-600">
              <AlertCircle className="w-5 h-5" />
              {language === 'ar' ? 'تنبيه: الكميات صفر' : 'Warning: Zero Quantities'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'ar'
                ? 'لم يتم تحديد كمية لأي من الأنواع. سيتم حفظ المنتج ولكن لن يظهر للعملاء حتى تتوفر كمية.'
                : 'No quantities specified for variants. The product will be saved but will not be visible to customers until stock is added.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel asChild>
              <Button variant="outline" className="rounded-xl" onClick={() => setShowZeroStockDialog(false)}>
                {language === 'ar' ? 'تعديل' : 'Edit'}
              </Button>
            </AlertDialogCancel>
            <AlertDialogAction asChild>
              <Button onClick={(e) => { e.preventDefault(); executeSave(); }} className="rounded-xl bg-[#008069] hover:bg-[#017561]">
                {language === 'ar' ? 'حفظ كمسودة' : 'Save as Draft'}
              </Button>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
