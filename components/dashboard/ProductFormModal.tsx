'use client';

import { useState, useEffect } from 'react';
import { Product, ProductOption, ProductVariant } from '@/lib/types/database';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Upload, Plus, Trash2, ChevronDown, Sparkles, DollarSign } from 'lucide-react';
import Image from 'next/image';

interface ProductFormModalProps {
  storeId: string;
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

export default function ProductFormModal({
  storeId,
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
  const [imageUrl, setImageUrl] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [options, setOptions] = useState<ProductOption[]>([]);
  const [variants, setVariants] = useState<LocalVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [variantsOpen, setVariantsOpen] = useState(true);
  const { toast } = useToast();

  // Load existing product data
  useEffect(() => {
    if (product) {
      setName(product.name);
      setDescription(product.description || '');
      setCurrentPrice(product.current_price.toString());
      setOriginalPrice(product.original_price?.toString() || '');
      setCategory(product.category || '');
      setQuantity(product.quantity.toString());
      setImageUrl(product.image_url || '');
      setImagePreview(product.image_url || '');
      setOptions(product.options || []);
      loadVariants(product.id);
    }
  }, [product]);

  const loadVariants = async (productId: string) => {
    const { data } = await supabase
      .from('product_variants')
      .select('*')
      .eq('product_id', productId);

    if (data) {
      setVariants(data.map((v: ProductVariant) => ({
        id: v.id,
        option_values: v.option_values,
        price: v.price.toString(),
        quantity: v.quantity.toString(),
        sku: v.sku || '',
      })));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return imageUrl;

    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `products/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('products')
        .upload(filePath, imageFile);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('products')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      toast({
        title: 'Image upload failed',
        description: error.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  // Option management
  const addOption = () => {
    if (options.length >= 3) {
      toast({
        title: 'Maximum options reached',
        description: 'You can only add up to 3 options per product',
        variant: 'destructive',
      });
      return;
    }
    setOptions([...options, { name: '', values: [] }]);
  };

  const removeOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
    setVariants([]); // Clear variants when options change
  };

  const updateOptionName = (index: number, name: string) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const updateOptionValues = (index: number, valuesString: string) => {
    const newOptions = [...options];
    newOptions[index].values = valuesString
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    setOptions(newOptions);
  };

  // Cartesian product algorithm for generating variants
  const generateVariants = () => {
    const validOptions = options.filter((opt) => opt.name && opt.values.length > 0);

    if (validOptions.length === 0) {
      toast({
        title: 'No options defined',
        description: 'Please add at least one option with values first',
        variant: 'destructive',
      });
      return;
    }

    // Cartesian product
    const cartesian = (...arrays: string[][]): string[][] => {
      return arrays.reduce<string[][]>(
        (acc, curr) => acc.flatMap((a) => curr.map((b) => [...a, b])),
        [[]]
      );
    };

    const optionArrays = validOptions.map((opt) => opt.values);
    const combinations = cartesian(...optionArrays);

    const newVariants: LocalVariant[] = combinations.map((combo) => {
      const optionValues: { [key: string]: string } = {};
      validOptions.forEach((opt, i) => {
        optionValues[opt.name] = combo[i];
      });

      // Check if variant already exists
      const existing = variants.find(
        (v) => JSON.stringify(v.option_values) === JSON.stringify(optionValues)
      );

      return existing || {
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
  };

  // Bulk edit functions
  const applyPriceToAll = () => {
    if (!currentPrice) return;
    setVariants(variants.map((v) => ({ ...v, price: currentPrice })));
    toast({ title: 'Price applied to all variants' });
  };

  const applyQuantityToAll = (qty: string) => {
    setVariants(variants.map((v) => ({ ...v, quantity: qty })));
    toast({ title: 'Quantity applied to all variants' });
  };

  // Variant management
  const updateVariant = (index: number, field: keyof LocalVariant, value: string) => {
    const newVariants = [...variants];
    (newVariants[index] as any)[field] = value;
    setVariants(newVariants);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  // Get variant display label
  const getVariantLabel = (variant: LocalVariant) => {
    return Object.values(variant.option_values).join(' / ');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrl = await uploadImage();

      const validOptions = options.filter(
        (opt) => opt.name && opt.values.length > 0
      );

      const productData = {
        store_id: storeId,
        name,
        description: description || null,
        current_price: parseFloat(currentPrice),
        original_price: originalPrice ? parseFloat(originalPrice) : null,
        category: category || null,
        quantity: parseInt(quantity) || 0,
        image_url: uploadedImageUrl || null,
        options: validOptions,
      };

      let productId = product?.id;

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('products')
          .insert(productData)
          .select()
          .single();

        if (error) throw error;
        productId = data.id;
      }

      // Save variants if there are any
      if (variants.length > 0 && productId) {
        // Delete existing variants
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', productId);

        // Insert new variants
        const variantsToInsert = variants.map((v) => ({
          product_id: productId,
          option_values: v.option_values,
          price: parseFloat(v.price) || 0,
          quantity: parseInt(v.quantity) || 0,
          sku: v.sku || null,
        }));

        const { error: variantError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert);

        if (variantError) throw variantError;
      }

      toast({
        title: product ? 'Product updated' : 'Product created',
        description: product
          ? 'Your product has been updated successfully'
          : 'Your product has been added to your store',
      });

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
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Product Image</Label>
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
                  <p className="text-sm text-gray-600">Upload Image</p>
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
              <Label>Product Name *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Awesome Product"
                required
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2 col-span-2">
              <Label>Description</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={3}
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>{hasVariants ? 'Base Price (Starting from)' : 'Price *'}</Label>
              <Input
                type="number"
                step="0.01"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                placeholder="29.99"
                required
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Original Price</Label>
              <Input
                type="number"
                step="0.01"
                value={originalPrice}
                onChange={(e) => setOriginalPrice(e.target.value)}
                placeholder="39.99"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Electronics"
                className="rounded-2xl"
              />
            </div>

            <div className="space-y-2">
              <Label>{hasVariants ? 'Default Quantity' : 'Quantity *'}</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                required={!hasVariants}
                className="rounded-2xl"
              />
            </div>
          </div>

          {/* Options Section */}
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <Label className="text-base">Product Options (Max 3)</Label>
              <Button
                type="button"
                onClick={addOption}
                disabled={options.length >= 3}
                variant="outline"
                className="rounded-2xl"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Option
              </Button>
            </div>

            {options.map((option, index) => (
              <div key={index} className="p-4 border rounded-2xl space-y-3 bg-gray-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Option {index + 1}</Label>
                  <Button
                    type="button"
                    onClick={() => removeOption(index)}
                    variant="ghost"
                    size="sm"
                    className="rounded-full h-8 w-8 p-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <Input
                  value={option.name}
                  onChange={(e) => updateOptionName(index, e.target.value)}
                  placeholder="Option name (e.g., Size, Color)"
                  className="rounded-2xl bg-white"
                />
                <Input
                  value={option.values.join(', ')}
                  onChange={(e) => updateOptionValues(index, e.target.value)}
                  placeholder="Values separated by commas (e.g., S, M, L, XL)"
                  className="rounded-2xl bg-white"
                />
              </div>
            ))}

            {options.length > 0 && options.some((o) => o.name && o.values.length > 0) && (
              <Button
                type="button"
                onClick={generateVariants}
                className="w-full rounded-2xl bg-[#008069] hover:bg-[#017561]"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Variants
              </Button>
            )}
          </div>

          {/* Variants Section */}
          {variants.length > 0 && (
            <Collapsible open={variantsOpen} onOpenChange={setVariantsOpen}>
              <div className="border rounded-2xl overflow-hidden">
                <CollapsibleTrigger className="w-full p-4 flex items-center justify-between bg-[#008069] text-white hover:bg-[#017561] transition">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Variants ({variants.length})</span>
                  </div>
                  <ChevronDown className={`w-5 h-5 transition-transform ${variantsOpen ? 'rotate-180' : ''}`} />
                </CollapsibleTrigger>

                <CollapsibleContent>
                  {/* Bulk Actions */}
                  <div className="p-3 bg-gray-100 border-b flex gap-2 flex-wrap">
                    <Button
                      type="button"
                      onClick={applyPriceToAll}
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      Apply ${currentPrice || '0'} to all
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

                  {/* Variant List - WhatsApp Style Cards */}
                  <div className="max-h-[300px] overflow-y-auto">
                    {variants.map((variant, index) => (
                      <div
                        key={index}
                        className="p-3 border-b last:border-b-0 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-center gap-3">
                          {/* Variant Label - Chat Bubble Style */}
                          <div className="flex-1 min-w-0">
                            <div className="inline-block bg-[#dcf8c6] px-3 py-1.5 rounded-2xl rounded-bl-sm text-sm font-medium">
                              {getVariantLabel(variant)}
                            </div>
                          </div>

                          {/* Price Input */}
                          <Input
                            type="number"
                            step="0.01"
                            value={variant.price}
                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                            placeholder="Price"
                            className="w-24 h-8 text-sm rounded-xl"
                          />

                          {/* Quantity Input */}
                          <Input
                            type="number"
                            value={variant.quantity}
                            onChange={(e) => updateVariant(index, 'quantity', e.target.value)}
                            placeholder="Qty"
                            className="w-16 h-8 text-sm rounded-xl"
                          />

                          {/* Delete Button */}
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

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 rounded-3xl h-12"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-3xl h-12 bg-[#008069] hover:bg-[#017561]"
            >
              {loading ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
