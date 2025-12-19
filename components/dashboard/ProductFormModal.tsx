'use client';

import { useState, useEffect } from 'react';
import { Product, ProductOption } from '@/lib/types/database';
import { supabase } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { X, Upload, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';

interface ProductFormModalProps {
  storeId: string;
  product?: Product | null;
  onClose: () => void;
  onSaved: () => void;
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
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

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
    }
  }, [product]);

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

      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id);

        if (error) throw error;

        toast({
          title: 'Product updated',
          description: 'Your product has been updated successfully',
        });
      } else {
        const { error } = await supabase
          .from('products')
          .insert(productData);

        if (error) throw error;

        toast({
          title: 'Product created',
          description: 'Your product has been added to your store',
        });
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

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {product ? 'Edit Product' : 'Add New Product'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              <Label>Current Price *</Label>
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
              <Label>Quantity *</Label>
              <Input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="10"
                required
                className="rounded-2xl"
              />
            </div>
          </div>

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
              <div key={index} className="p-4 border rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Option {index + 1}</Label>
                  <Button
                    type="button"
                    onClick={() => removeOption(index)}
                    variant="ghost"
                    size="sm"
                    className="rounded-full"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
                <Input
                  value={option.name}
                  onChange={(e) => updateOptionName(index, e.target.value)}
                  placeholder="Option name (e.g., Size, Color)"
                  className="rounded-2xl"
                />
                <Input
                  value={option.values.join(', ')}
                  onChange={(e) => updateOptionValues(index, e.target.value)}
                  placeholder="Values separated by commas (e.g., S, M, L, XL)"
                  className="rounded-2xl"
                />
              </div>
            ))}
          </div>

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
