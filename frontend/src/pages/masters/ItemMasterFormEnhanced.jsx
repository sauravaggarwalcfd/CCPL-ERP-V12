import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Save, X, FileText, TrendingUp, ArrowLeft, Package, Settings, AlertCircle, CheckCircle2, Plus, Upload } from 'lucide-react';
import { toast } from 'sonner';

const ItemMasterFormEnhanced = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [leafCategories, setLeafCategories] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');
  const [codePreview, setCodePreview] = useState('');
  const [selectedCategoryDetails, setSelectedCategoryDetails] = useState(null);

  const [formData, setFormData] = useState({
    // Core Fields
    item_id: '',
    item_code: 'AUTO',
    item_name: '',
    item_type: '',  // Auto-inherited, READ-ONLY
    category_id: '',
    category_name: '',
    description: '',
    
    // Image & Document
    item_image: '',
    item_document: '',
    
    // UOM
    uom: '',
    purchase_uom: '',
    conversion_factor: '1',
    
    // Optional Fields
    brand: '',
    color: '',
    size: '',
    
    // Type-Specific Attributes (JSON)
    type_specific_attributes: {},
    
    // Stock & Inventory
    min_stock: '',
    reorder_level: '',
    opening_stock: '',
    opening_rate: '',
    
    // Other
    hsn: '',
    barcode: '',
    remarks: '',
    status: 'Active',
    is_active: true
  });

  useEffect(() => {
    fetchMasterData();
    if (id) {
      fetchItem(id);
    } else {
      // Check for copied item data
      const copiedData = sessionStorage.getItem('copiedItemData');
      if (copiedData) {
        try {
          const parsedData = JSON.parse(copiedData);
          setFormData(parsedData);
          toast.info('Item data loaded from copy');
          sessionStorage.removeItem('copiedItemData'); // Clear after loading
          
          // Trigger category change if category exists
          if (parsedData.category_id) {
            setTimeout(() => {
              handleCategoryChange(parsedData.category_id);
            }, 500);
          }
        } catch (error) {
          console.error('Failed to load copied data:', error);
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [catsRes, uomsRes] = await Promise.all([
        mastersAPI.getLeafCategories(),
        mastersAPI.getUOMs()
      ]);
      
      const allCategories = catsRes.data || [];
      setCategories(allCategories);
      
      // Filter leaf categories
      const leafOnly = allCategories.filter(cat => cat.is_leaf === true);
      setLeafCategories(leafOnly);
      
      setUOMs(uomsRes.data || []);
    } catch (error) {
      console.error('Failed to load master data:', error);
      toast.error('Failed to load master data');
    }
  };

  const getCategoryPath = (categoryId) => {
    const path = [];
    let current = categories.find(c => c.id === categoryId);
    while (current) {
      path.unshift(current.name);
      current = categories.find(c => c.id === current.parent_category);
    }
    return path.join(' → ');
  };

  const handleCategoryChange = async (categoryId) => {
    const selectedCat = categories.find(c => c.id === categoryId);
    
    // Warn if not a leaf category
    if (selectedCat && !selectedCat.is_leaf) {
      toast.warning('⚠️ Parent category selected! Please choose a leaf (lowest-level) category for better organization.', {
        duration: 4000
      });
    }

    // Get category details
    if (selectedCat) {
      const path = getCategoryPath(categoryId);
      setSelectedCategoryDetails({
        name: selectedCat.name,
        path: path,
        item_type: selectedCat.item_type || 'GENERAL',
        short_code: selectedCat.category_short_code || selectedCat.code
      });

      // Preview next code
      try {
        const response = await mastersAPI.previewNextItemCode(categoryId);
        setCodePreview(response.data.preview_code);
        
        setFormData(prev => ({
          ...prev,
          category_id: categoryId,
          category_name: selectedCat.name,
          item_type: selectedCat.item_type || 'GENERAL',
          item_code: response.data.preview_code
        }));

        toast.success(`Item Code Preview: ${response.data.preview_code}`, { duration: 3000 });
      } catch (error) {
        console.error('Failed to preview code:', error);
      }
    }
  };

  const fetchItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await mastersAPI.getItem(itemId);
      const item = response.data;
      
      setFormData({
        item_id: item.id,
        item_code: item.item_code,
        item_name: item.item_name,
        item_type: item.item_type || '',
        category_id: item.category_id,
        category_name: item.category_name || '',
        description: item.description || '',
        uom: item.uom || '',
        purchase_uom: item.purchase_uom || '',
        conversion_factor: item.conversion_factor?.toString() || '1',
        brand: item.brand || '',
        color: item.color || '',
        size: item.size || '',
        type_specific_attributes: item.type_specific_attributes || {},
        min_stock: item.min_stock?.toString() || '',
        reorder_level: item.reorder_level?.toString() || '',
        opening_stock: item.opening_stock?.toString() || '',
        opening_rate: item.opening_rate?.toString() || '',
        hsn: item.hsn || '',
        barcode: item.barcode || '',
        remarks: item.remarks || '',
        status: item.status || 'Active',
        is_active: item.is_active !== false
      });

      // Set category details for display
      const cat = categories.find(c => c.id === item.category_id);
      if (cat) {
        const path = getCategoryPath(item.category_id);
        setSelectedCategoryDetails({
          name: cat.name,
          path: path,
          item_type: cat.item_type || 'GENERAL',
          short_code: cat.category_short_code || cat.code
        });
      }
    } catch (error) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleAttributeChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      type_specific_attributes: {
        ...prev.type_specific_attributes,
        [key]: value
      }
    }));
  };

  const handleCopyItem = () => {
    // Copy current item data and navigate to create new item
    const copiedData = {
      ...formData,
      item_id: '',
      item_code: 'AUTO',
      item_name: `${formData.item_name} (Copy)`,
      barcode: '', // Clear barcode for new item
      opening_stock: '',
      opening_rate: ''
    };
    
    // Store copied data in sessionStorage
    sessionStorage.setItem('copiedItemData', JSON.stringify(copiedData));
    
    toast.success('Item data copied! Creating new item...');
    
    // Navigate to create page
    setTimeout(() => {
      navigate('/masters/items/new');
      window.location.reload(); // Reload to load copied data
    }, 500);
  };

  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, store file name. In production, upload to server
      setFormData({ ...formData, [field]: file.name });
      toast.success(`${field === 'item_image' ? 'Image' : 'Document'} selected: ${file.name}`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.item_name.trim()) {
      toast.error('Item Name is required');
      scrollToSection('basic');
      return;
    }
    if (!formData.category_id) {
      toast.error('Category is required');
      scrollToSection('basic');
      return;
    }
    if (!formData.uom) {
      toast.error('UOM is required');
      scrollToSection('basic');
      return;
    }

    // Validate unique name within category
    try {
      const validationRes = await mastersAPI.validateItemName(
        formData.item_name,
        formData.category_id,
        id
      );
      
      if (!validationRes.data.is_unique) {
        toast.error('Item name already exists in this category. Please use a unique name.');
        scrollToSection('basic');
        return;
      }
    } catch (error) {
      console.error('Name validation failed:', error);
    }

    try {
      const payload = {
        item_code: formData.item_code,
        item_name: formData.item_name,
        item_type: formData.item_type,
        category_id: formData.category_id,
        category_name: formData.category_name,
        description: formData.description,
        uom: formData.uom,
        purchase_uom: formData.purchase_uom || formData.uom,
        conversion_factor: parseFloat(formData.conversion_factor) || 1.0,
        brand: formData.brand,
        color: formData.color,
        size: formData.size,
        type_specific_attributes: formData.type_specific_attributes,
        min_stock: parseFloat(formData.min_stock) || 0,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        opening_stock: parseFloat(formData.opening_stock) || 0,
        opening_rate: parseFloat(formData.opening_rate) || 0,
        hsn: formData.hsn,
        barcode: formData.barcode,
        remarks: formData.remarks,
        status: formData.status,
        is_active: formData.is_active
      };

      if (id) {
        await mastersAPI.updateItem(id, payload);
        toast.success('Item updated successfully');
      } else {
        await mastersAPI.createItem(payload);
        toast.success('Item created successfully');
      }
      navigate('/masters/items');
    } catch (error) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.detail || 'Failed to save item');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'attributes', label: 'Type Attributes', icon: Package },
    { id: 'stock', label: 'Stock & Inventory', icon: TrendingUp },
    { id: 'other', label: 'Additional Info', icon: Settings }
  ];

  // Get item type name for display
  const getItemTypeName = (type, categoryName = '') => {
    const typeMap = {
      'FAB': 'Fabric',
      'FABRIC': 'Fabric',
      'RM': categoryName ? `Raw Material (${categoryName})` : 'Raw Material',
      'FG': 'Finished Goods',
      'PACKING': 'Packing Material',
      'PKG': 'Packing Material',
      'CONSUMABLE': 'Consumable',
      'CNS': 'Consumable',
      'GENERAL': 'General Store',
      'GEN': 'General Store',
      'ACCESSORY': 'Accessory',
      'ACC': 'Accessory'
    };
    return typeMap[type] || type;
  };

  // Render type-specific attribute fields
  const renderTypeSpecificFields = () => {
    const itemType = formData.item_type;
    const categoryName = formData.category_name || '';
    const attrs = formData.type_specific_attributes || {};

    // Check if category is Fabric-related (within RM)
    const isFabricCategory = categoryName.toLowerCase().includes('fabric') || 
                             categoryName.toLowerCase().includes('knit') ||
                             categoryName.toLowerCase().includes('woven') ||
                             categoryName.toLowerCase().includes('fleece');
    
    // Check if category is Trim-related (within RM)
    const isTrimCategory = categoryName.toLowerCase().includes('trim') ||
                           categoryName.toLowerCase().includes('label') ||
                           categoryName.toLowerCase().includes('button') ||
                           categoryName.toLowerCase().includes('zip') ||
                           categoryName.toLowerCase().includes('tape') ||
                           categoryName.toLowerCase().includes('elastic');

    // RM + Fabric Category = Show Fabric Fields
    if (itemType === 'RM' && isFabricCategory) {
      return (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="text-blue-900 text-lg">Fabric Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>GSM (Grams per Square Meter)</Label>
                <Input
                  type="number"
                  value={attrs.gsm || ''}
                  onChange={(e) => handleAttributeChange('gsm', e.target.value)}
                  placeholder="120"
                />
              </div>
              <div className="space-y-2">
                <Label>Fabric Type</Label>
                <Select 
                  value={attrs.fabric_type || ''} 
                  onValueChange={(val) => handleAttributeChange('fabric_type', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="knit">Knit</SelectItem>
                    <SelectItem value="woven">Woven</SelectItem>
                    <SelectItem value="rib">Rib</SelectItem>
                    <SelectItem value="fleece">Fleece</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Composition</Label>
                <Input
                  value={attrs.composition || ''}
                  onChange={(e) => handleAttributeChange('composition', e.target.value)}
                  placeholder="100% Cotton"
                />
              </div>
              <div className="space-y-2">
                <Label>Width (inches)</Label>
                <Input
                  type="number"
                  value={attrs.width || ''}
                  onChange={(e) => handleAttributeChange('width', e.target.value)}
                  placeholder="44"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shrinkage %</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={attrs.shrinkage || ''}
                  onChange={(e) => handleAttributeChange('shrinkage', e.target.value)}
                  placeholder="2.5"
                />
              </div>
              <div className="space-y-2">
                <Label>Color Fastness</Label>
                <Input
                  value={attrs.color_fastness || ''}
                  onChange={(e) => handleAttributeChange('color_fastness', e.target.value)}
                  placeholder="Grade 4-5"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // RM + Trim Category = Show Trim Fields
    if (itemType === 'RM' && isTrimCategory) {
      return (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-900 text-lg">Trim Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Trim Type</Label>
                <Select 
                  value={attrs.trim_type || ''} 
                  onValueChange={(val) => handleAttributeChange('trim_type', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="label">Label</SelectItem>
                    <SelectItem value="button">Button</SelectItem>
                    <SelectItem value="zipper">Zipper</SelectItem>
                    <SelectItem value="tape">Tape</SelectItem>
                    <SelectItem value="thread">Thread</SelectItem>
                    <SelectItem value="elastic">Elastic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Label Size (optional)</Label>
                <Input
                  value={attrs.label_size || ''}
                  onChange={(e) => handleAttributeChange('label_size', e.target.value)}
                  placeholder="2x3 inch"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Attachment Type</Label>
                <Input
                  value={attrs.attachment_type || ''}
                  onChange={(e) => handleAttributeChange('attachment_type', e.target.value)}
                  placeholder="Sew-on, Heat-transfer, etc."
                />
              </div>
              <div className="space-y-2">
                <Label>Color</Label>
                <Input
                  value={attrs.trim_color || ''}
                  onChange={(e) => handleAttributeChange('trim_color', e.target.value)}
                  placeholder="Black, White, Multi"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // PACKING Material
    if (itemType === 'PACKING' || itemType === 'PKG') {
      return (
        <Card className="border-purple-200 bg-purple-50">
          <CardHeader>
            <CardTitle className="text-purple-900 text-lg">Packing Material Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Microns</Label>
                <Input
                  type="number"
                  value={attrs.microns || ''}
                  onChange={(e) => handleAttributeChange('microns', e.target.value)}
                  placeholder="50"
                />
              </div>
              <div className="space-y-2">
                <Label>Dimensions (L x W x H)</Label>
                <Input
                  value={attrs.dimensions || ''}
                  onChange={(e) => handleAttributeChange('dimensions', e.target.value)}
                  placeholder="12 x 8 x 4 inch"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Material</Label>
                <Select 
                  value={attrs.material || ''} 
                  onValueChange={(val) => handleAttributeChange('material', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select material" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LD">LD (Low Density)</SelectItem>
                    <SelectItem value="HD">HD (High Density)</SelectItem>
                    <SelectItem value="Kraft">Kraft Paper</SelectItem>
                    <SelectItem value="Corrugated">Corrugated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Print</Label>
                <Select 
                  value={attrs.print || ''} 
                  onValueChange={(val) => handleAttributeChange('print', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Printed?" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Yes">Yes</SelectItem>
                    <SelectItem value="No">No</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    // CONSUMABLE
    if (itemType === 'CONSUMABLE' || itemType === 'CNS') {
      return (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-900 text-lg">Consumable Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Usage</Label>
                <Select 
                  value={attrs.usage || ''} 
                  onValueChange={(val) => handleAttributeChange('usage', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select usage" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="machine">Machine Maintenance</SelectItem>
                    <SelectItem value="finishing">Finishing Process</SelectItem>
                    <SelectItem value="cleaning">Cleaning</SelectItem>
                    <SelectItem value="packaging">Packaging</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Lifespan (optional)</Label>
                <Input
                  value={attrs.lifespan || ''}
                  onChange={(e) => handleAttributeChange('lifespan', e.target.value)}
                  placeholder="6 months, 1000 cycles, etc."
                />
              </div>
            </div>
          </CardContent>
        </Card>
      );
    }

    if (itemType === 'FG') {  // Finished Goods
      return (
        <Card className="border-indigo-200 bg-indigo-50">
          <CardHeader>
            <CardTitle className="text-indigo-900 text-lg">Finished Goods Specifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Style Code</Label>
                <Input
                  value={attrs.style_code || ''}
                  onChange={(e) => handleAttributeChange('style_code', e.target.value)}
                  placeholder="ST-2024-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Fit</Label>
                <Select 
                  value={attrs.fit || ''} 
                  onValueChange={(val) => handleAttributeChange('fit', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select fit" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">Regular</SelectItem>
                    <SelectItem value="slim">Slim</SelectItem>
                    <SelectItem value="oversize">Oversize</SelectItem>
                    <SelectItem value="relaxed">Relaxed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Color Group</Label>
                <Input
                  value={attrs.color_group || ''}
                  onChange={(e) => handleAttributeChange('color_group', e.target.value)}
                  placeholder="Navy, Pastels, Brights"
                />
              </div>
              <div className="space-y-2">
                <Label>Season</Label>
                <Select 
                  value={attrs.season || ''} 
                  onValueChange={(val) => handleAttributeChange('season', val)}
                >
                  <SelectTrigger><SelectValue placeholder="Select season" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SS">SS (Spring/Summer)</SelectItem>
                    <SelectItem value="AW">AW (Autumn/Winter)</SelectItem>
                    <SelectItem value="All">All Season</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Size Matrix</Label>
              <Input
                value={attrs.size_matrix || ''}
                onChange={(e) => handleAttributeChange('size_matrix', e.target.value)}
                placeholder="S, M, L, XL, 2XL, 3XL"
              />
            </div>
          </CardContent>
        </Card>
      );
    }

    // Default: No specific attributes OR RM without Fabric/Trim category
    if (itemType === 'RM' && !isFabricCategory && !isTrimCategory) {
      return (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            RM (Raw Material) selected but category is neither Fabric nor Trims. Please select appropriate fields manually or choose a Fabric/Trim category.
          </AlertDescription>
        </Alert>
      );
    }

    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No specific attributes required for {getItemTypeName(itemType)} type items.
        </AlertDescription>
      </Alert>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading item...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-blue-800/30">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/masters/items')} 
              className="text-white hover:bg-blue-700"
            >
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">
                {id ? 'Edit' : 'Create'} Item Master
              </h1>
              <p className="text-base text-blue-100">Complete item registration with type-specific attributes</p>
            </div>
          </div>
          <div className="flex gap-3">
            {id && (
              <Button 
                type="button" 
                variant="outline" 
                size="lg"
                onClick={handleCopyItem}
                className="bg-white hover:bg-neutral-100 text-blue-700 border-white"
              >
                <Package className="h-5 w-5 mr-2" />
                Copy Item
              </Button>
            )}
            <Button 
              type="button" 
              variant="outline" 
              size="lg" 
              onClick={() => navigate('/masters/items')} 
              className="bg-white hover:bg-neutral-100 text-blue-700 border-white"
            >
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button 
              type="submit" 
              form="item-form" 
              size="lg" 
              className="gap-2 bg-white text-blue-700 hover:bg-neutral-100"
            >
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Item
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => {
              const Icon = section.icon;
              return (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(section.id)}
                  className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${
                    activeSection === section.id
                      ? 'border-blue-600 text-blue-700 bg-blue-50'
                      : 'border-transparent text-neutral-600 hover:text-blue-700 hover:bg-blue-50/50'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {section.label}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Form Content */}
      <form id="item-form" onSubmit={handleSubmit} className="max-w-6xl mx-auto px-8 py-8 space-y-8">
        {/* Basic Info Section */}
        <section id="basic" className="scroll-mt-32">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="text-2xl text-blue-900">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Item Code & Name */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Item Code *</Label>
                  {id ? (
                    <Input
                      value={formData.item_code}
                      disabled
                      className="bg-neutral-100 font-mono"
                    />
                  ) : (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">Auto-Generated</Badge>
                        {codePreview && (
                          <Badge className="bg-blue-600 text-xs font-mono">{codePreview}</Badge>
                        )}
                      </div>
                      <Input
                        value={formData.item_code}
                        disabled
                        placeholder="Select category to generate code"
                        className="bg-neutral-100 font-mono"
                      />
                    </div>
                  )}
                  <p className="text-xs text-neutral-500">Format: TYPE-SHORTCODE-0001</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Item Name *</Label>
                  <Input
                    value={formData.item_name}
                    onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                    placeholder="Enter unique item name"
                    required
                  />
                </div>
              </div>

              {/* Image & Document Upload */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Item Image</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'item_image')}
                      className="flex-1"
                    />
                    {formData.item_image && (
                      <Badge variant="outline" className="text-xs">
                        {formData.item_image}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Item Document</Label>
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'item_document')}
                      className="flex-1"
                    />
                    {formData.item_document && (
                      <Badge variant="outline" className="text-xs">
                        {formData.item_document}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Category & Item Type */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Item Category *</Label>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700 h-auto p-0 text-xs"
                      onClick={() => window.open('/masters/item-categories', '_blank')}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Create New Category
                    </Button>
                  </div>
                  <Select 
                    value={formData.category_id} 
                    onValueChange={handleCategoryChange}
                    disabled={!!id}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem 
                          key={cat.id} 
                          value={cat.id}
                          className={!cat.is_leaf ? 'text-neutral-500 italic' : ''}
                        >
                          {cat.name} {!cat.is_leaf && '(Parent)'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedCategoryDetails && (
                    <div className="flex items-center gap-2 text-xs text-neutral-600 bg-neutral-50 px-2 py-1.5 rounded border border-neutral-200">
                      <span className="font-medium">Path:</span>
                      <span className="text-neutral-700">{selectedCategoryDetails.path}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Item Type</Label>
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-neutral-200 bg-neutral-50">
                    <Badge variant="outline" className="text-xs">
                      {formData.item_type ? getItemTypeName(formData.item_type, formData.category_name) : 'Select category first'}
                    </Badge>
                    <span className="text-xs text-neutral-500 ml-auto">Auto-inherited</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed item description"
                  rows={2}
                />
              </div>

              {/* UOM Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Stock UOM *</Label>
                  <Select 
                    value={formData.uom} 
                    onValueChange={(val) => setFormData({ ...formData, uom: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="meter">Meter (m)</SelectItem>
                      <SelectItem value="roll">Roll</SelectItem>
                      <SelectItem value="set">Set</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                      <SelectItem value="packet">Packet</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Purchase UOM</Label>
                  <Select 
                    value={formData.purchase_uom} 
                    onValueChange={(val) => setFormData({ ...formData, purchase_uom: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Same as Stock UOM" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pcs">Pieces (pcs)</SelectItem>
                      <SelectItem value="kg">Kilogram (kg)</SelectItem>
                      <SelectItem value="meter">Meter (m)</SelectItem>
                      <SelectItem value="roll">Roll</SelectItem>
                      <SelectItem value="box">Box</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Conversion Factor</Label>
                  <Input
                    type="number"
                    step="0.001"
                    value={formData.conversion_factor}
                    onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                  />
                  <p className="text-xs text-neutral-500">1 Purchase UOM = ? Stock UOM</p>
                </div>
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm">Brand</Label>
                  <Input
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Color</Label>
                  <Input
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm">Size / Dimension</Label>
                  <Input
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    placeholder="Optional"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Type-Specific Attributes Section */}
        <section id="attributes" className="scroll-mt-32">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-neutral-800">Type-Specific Attributes</h2>
            {formData.item_type ? (
              renderTypeSpecificFields()
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Select an item category first to see type-specific attribute fields.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </section>

        {/* Stock & Inventory Section */}
        <section id="stock" className="scroll-mt-32">
          <Card>
            <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b">
              <CardTitle className="text-2xl text-green-900">Stock & Inventory</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Minimum Stock Level</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.min_stock}
                    onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Reorder Quantity</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.reorder_level}
                    onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Opening Stock</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.opening_stock}
                    onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Opening Rate</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.opening_rate}
                    onChange={(e) => setFormData({ ...formData, opening_rate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Additional Info Section */}
        <section id="other" className="scroll-mt-32">
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b">
              <CardTitle className="text-2xl text-purple-900">Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">HSN Code</Label>
                  <Input
                    value={formData.hsn}
                    onChange={(e) => setFormData({ ...formData, hsn: e.target.value })}
                    placeholder="6302"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-sm font-semibold">Barcode</Label>
                  <Input
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="Scan or enter barcode"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Remarks</Label>
                <Textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  />
                  <Label className="text-sm">Active</Label>
                </div>
                <Badge variant={formData.is_active ? 'default' : 'secondary'}>
                  {formData.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </section>
      </form>
    </div>
  );
};

export default ItemMasterFormEnhanced;
