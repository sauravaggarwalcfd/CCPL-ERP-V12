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
import { Save, X, FileText, TrendingUp, ArrowLeft, Upload, FileIcon } from 'lucide-react';
import { toast } from 'sonner';

const ItemMasterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [colors, setColors] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    // Auto-generated fields
    uid_code: '',
    item_code: '',
    next_code_preview: '',
    
    // Basic Info
    item_image: '',
    item_document: '',
    item_name: '',
    item_description: '',
    item_category: '',
    category_path: '',
    item_group_1: '',
    item_sub_group_2: '',
    item_sub_group_3: '',
    uom: '',
    spec_dimensions: '',
    colour: '',
    
    // Toggles
    qc_required: false,
    batch_required: false,
    has_size_variants: false,
    
    // Stock & Inventory
    opening_stock: '',
    opening_rate: '',
    maintain_stock: true,
    minimum_stock_level: '',
    reorder_qty: '',
    costing_method: 'FIFO',
    
    status: 'Active'
  });

  useEffect(() => {
    fetchMasterData();
    if (id) {
      fetchItem(id);
    } else {
      // Generate auto codes for new items
      generateAutoCodes();
    }
  }, [id]);

  const generateAutoCodes = () => {
    const uid = `UID-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const itemCode = `ITM-${String(Date.now()).slice(-6)}`;
    setFormData(prev => ({ ...prev, uid_code: uid, item_code: itemCode }));
  };

  const fetchMasterData = async () => {
    try {
      const [catsRes, uomsRes, colorsRes] = await Promise.all([
        mastersAPI.getItemCategories(),
        mastersAPI.getUOMs(),
        mastersAPI.getColors()
      ]);
      setCategories(catsRes.data || []);
      setUOMs(uomsRes.data || []);
      setColors(colorsRes.data || []);
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  // Category helper functions
  const isLeafCategory = (categoryId) => {
    return !categories.some(c => c.parent_category === categoryId);
  };

  const getCategoryPath = (categoryId) => {
    const path = [];
    let current = categories.find(c => c.id === categoryId);
    while (current) {
      path.unshift(current.category_name || current.name);
      current = categories.find(c => c.id === current.parent_category);
    }
    return path.join(' > ');
  };

  const getActiveLeafCategories = () => {
    return categories.filter(cat => {
      const isActive = cat.is_active !== false && cat.status === 'Active';
      const isLeaf = isLeafCategory(cat.id);
      return isActive && isLeaf;
    });
  };

  const getNextItemCode = async (categoryId) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      const shortCode = category?.category_short_code || category?.code?.substring(0, 4) || 'ITEM';
      
      // Get all items with this category to find next number
      const response = await mastersAPI.getItems();
      const items = response.data || [];
      const categoryItems = items.filter(item => item.category_id === categoryId || item.item_category === categoryId);
      
      let maxNumber = 0;
      categoryItems.forEach(item => {
        const code = item.item_code || '';
        const match = code.match(/-(\d{4})$/);
        if (match) {
          const num = parseInt(match[1]);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const nextNumber = maxNumber + 1;
      const nextCode = `${shortCode}-${String(nextNumber).padStart(4, '0')}`;
      return nextCode;
    } catch (error) {
      return 'XXXX-0001';
    }
  };

  const handleCategoryChange = async (categoryId) => {
    if (!isLeafCategory(categoryId)) {
      toast.error('Please select the lowest-level category. Parent categories cannot be selected.');
      return;
    }

    const path = getCategoryPath(categoryId);
    const nextCode = await getNextItemCode(categoryId);
    
    setFormData({
      ...formData,
      item_category: categoryId,
      category_path: path,
      item_code: nextCode,
      next_code_preview: nextCode
    });
    toast.success(`Category selected: ${path}`, { duration: 2000 });
  };

  const fetchItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await mastersAPI.getItem(itemId);
      const item = response.data;
      setFormData({
        uid_code: item.uid_code || '',
        item_code: item.item_code,
        item_image: item.item_image || '',
        item_document: item.item_document || '',
        item_name: item.item_name,
        item_description: item.description || '',
        item_category: item.category_id || '',
        item_group_1: item.item_group_1 || '',
        item_sub_group_2: item.item_sub_group_2 || '',
        item_sub_group_3: item.item_sub_group_3 || '',
        uom: item.uom || item.stock_uom || '',
        spec_dimensions: item.spec_dimensions || '',
        colour: item.colour || item.shade || '',
        qc_required: item.qc_required || item.inspection_required || false,
        batch_required: item.batch_required || item.is_batch_controlled || false,
        has_size_variants: item.has_size_variants || false,
        opening_stock: item.opening_stock?.toString() || '',
        opening_rate: item.opening_rate?.toString() || '',
        maintain_stock: item.maintain_stock !== false,
        minimum_stock_level: item.minimum_stock_level?.toString() || item.min_stock_level?.toString() || '',
        reorder_qty: item.reorder_qty?.toString() || item.reorder_level?.toString() || '',
        costing_method: item.costing_method || 'FIFO',
        status: item.status
      });
    } catch (error) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
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
    if (!formData.item_category) {
      toast.error('Item Category is required');
      scrollToSection('basic');
      return;
    }
    if (!formData.uom) {
      toast.error('UOM is required');
      scrollToSection('basic');
      return;
    }

    try {
      const payload = {
        ...formData,
        category_id: formData.item_category,
        stock_uom: formData.uom,
        description: formData.item_description,
        shade: formData.colour,
        inspection_required: formData.qc_required,
        is_batch_controlled: formData.batch_required,
        min_stock_level: parseFloat(formData.minimum_stock_level) || 0,
        min_stock: parseFloat(formData.minimum_stock_level) || 0,
        reorder_level: parseFloat(formData.reorder_qty) || 0,
        opening_stock: parseFloat(formData.opening_stock) || 0,
        opening_rate: parseFloat(formData.opening_rate) || 0
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
      toast.error(error.response?.data?.detail || 'Failed to save item');
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      // For now, store file name. In production, upload to server
      setFormData({ ...formData, [field]: file.name });
      toast.success(`${field === 'item_image' ? 'Image' : 'Document'} selected: ${file.name}`);
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'stock', label: 'Stock & Inventory', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 border-b border-blue-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-blue-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/items')} className="text-white hover:bg-blue-700" data-testid="back-btn">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Item Master</h1>
              <p className="text-base text-blue-100">Complete item registration form</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/items')} className="bg-white hover:bg-neutral-100 text-blue-700 border-white" data-testid="cancel-form-btn">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="item-form" size="lg" className="gap-2 bg-white text-blue-700 hover:bg-neutral-100" data-testid="save-form-btn">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Item
            </Button>
          </div>
        </div>

        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${
                  activeSection === section.id
                    ? 'border-blue-600 text-blue-700 bg-blue-50'
                    : 'border-transparent text-neutral-600 hover:text-blue-700 hover:bg-blue-50/50'
                }`}
                data-testid={`tab-${section.id}`}
              >
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-full px-8 py-6 mt-4">
        <div className="max-w-full mx-auto">
          <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info Tab */}
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900">
                  <FileText className="h-6 w-6 text-blue-600" />Basic Info
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Image & Document Upload */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <Label className="text-base font-medium">Item Image</Label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer" onClick={() => document.getElementById('item-image-upload')?.click()}>
                      {formData.item_image ? (
                        <div className="space-y-2">
                          <FileIcon className="h-8 w-8 mx-auto text-blue-600" />
                          <p className="text-sm font-medium text-blue-700">{formData.item_image}</p>
                          <p className="text-xs text-neutral-500">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-neutral-400" />
                          <p className="text-sm text-neutral-600">Click to upload image</p>
                          <p className="text-xs text-neutral-500">PNG, JPG up to 5MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="item-image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'item_image')}
                      data-testid="image-upload"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-base font-medium">Item Document</Label>
                    <div className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors cursor-pointer" onClick={() => document.getElementById('item-doc-upload')?.click()}>
                      {formData.item_document ? (
                        <div className="space-y-2">
                          <FileIcon className="h-8 w-8 mx-auto text-green-600" />
                          <p className="text-sm font-medium text-green-700">{formData.item_document}</p>
                          <p className="text-xs text-neutral-500">Click to change</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="h-8 w-8 mx-auto text-neutral-400" />
                          <p className="text-sm text-neutral-600">Click to upload document</p>
                          <p className="text-xs text-neutral-500">PDF, DOC up to 10MB</p>
                        </div>
                      )}
                    </div>
                    <input
                      id="item-doc-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'item_document')}
                      data-testid="document-upload"
                    />
                  </div>
                </div>

                {/* Auto-generated Codes */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-blue-900 mb-4 block">Auto-Generated Codes</Label>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="uid_code" className="text-base font-medium">UID Code (Auto)</Label>
                      <Input
                        id="uid_code"
                        value={formData.uid_code}
                        disabled
                        className="h-11 text-base bg-white font-mono"
                        data-testid="uid-code-input"
                      />
                      <p className="text-xs text-blue-600">Auto-generated unique identifier</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item_code" className="text-base font-medium">Item Code (Sequential)</Label>
                      <Input
                        id="item_code"
                        value={formData.item_code}
                        disabled
                        className="h-11 text-base bg-white font-mono"
                        data-testid="item-code-input"
                      />
                      <p className="text-xs text-blue-600">Auto-generated sequential code</p>
                    </div>
                  </div>
                </div>

                {/* Item Name & Description */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_name" className="text-base font-medium">Item Name *</Label>
                    <Input
                      id="item_name"
                      value={formData.item_name}
                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                      placeholder="Enter item name"
                      required
                      className="h-11 text-base"
                      data-testid="item-name-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_description" className="text-base font-medium">Item Description</Label>
                    <Textarea
                      id="item_description"
                      value={formData.item_description}
                      onChange={(e) => setFormData({ ...formData, item_description: e.target.value })}
                      placeholder="Detailed description"
                      rows={2}
                      className="text-base"
                      data-testid="description-input"
                    />
                  </div>
                </div>

                {/* Category Hierarchy */}
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_category" className="text-base font-medium">Item Category *</Label>
                    <Select value={formData.item_category} onValueChange={handleCategoryChange}>
                      <SelectTrigger className="h-11 text-base" data-testid="category-select">
                        <SelectValue placeholder="Select leaf category only" />
                      </SelectTrigger>
                      <SelectContent>
                        {getActiveLeafCategories().map(cat => {
                          const catName = cat.category_name || cat.name;
                          const path = getCategoryPath(cat.id);
                          const level = cat.level || 0;
                          return (
                            <SelectItem key={cat.id} value={cat.id}>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  {'  '.repeat(level)}
                                  <span>{catName}</span>
                                  <Badge variant="outline" className="text-xs">Leaf</Badge>
                                </div>
                                <div className="text-xs text-neutral-500 mt-0.5">{path}</div>
                              </div>
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-neutral-500">Only leaf categories (no children) can be selected</p>
                    {formData.category_path && (
                      <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded">
                        <p className="text-xs text-green-700 font-medium mb-1">Selected Category Path:</p>
                        <p className="text-sm font-semibold text-green-900">{formData.category_path}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_group_1" className="text-base font-medium">Item Group 1</Label>
                    <Select value={formData.item_group_1} onValueChange={(value) => setFormData({ ...formData, item_group_1: value })}>
                      <SelectTrigger className="h-11 text-base" data-testid="group-1-select">
                        <SelectValue placeholder="Select group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="group1">Group A</SelectItem>
                        <SelectItem value="group2">Group B</SelectItem>
                        <SelectItem value="group3">Group C</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_sub_group_2" className="text-base font-medium">Item Sub Group 2</Label>
                    <Select value={formData.item_sub_group_2} onValueChange={(value) => setFormData({ ...formData, item_sub_group_2: value })}>
                      <SelectTrigger className="h-11 text-base" data-testid="sub-group-2-select">
                        <SelectValue placeholder="Select sub group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subgroup1">Sub Group 1</SelectItem>
                        <SelectItem value="subgroup2">Sub Group 2</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_sub_group_3" className="text-base font-medium">Item Sub Group 3</Label>
                    <Select value={formData.item_sub_group_3} onValueChange={(value) => setFormData({ ...formData, item_sub_group_3: value })}>
                      <SelectTrigger className="h-11 text-base" data-testid="sub-group-3-select">
                        <SelectValue placeholder="Select sub group" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="subgroup3a">Sub Group 3A</SelectItem>
                        <SelectItem value="subgroup3b">Sub Group 3B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* UOM, Spec, Colour */}
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="uom" className="text-base font-medium">UOM *</Label>
                    <Select value={formData.uom} onValueChange={(value) => setFormData({ ...formData, uom: value })}>
                      <SelectTrigger className="h-11 text-base" data-testid="uom-select">
                        <SelectValue placeholder="Select UOM" />
                      </SelectTrigger>
                      <SelectContent>
                        {uoms.map(uom => <SelectItem key={uom.id} value={uom.uom_name}>{uom.uom_name} ({uom.symbol})</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spec_dimensions" className="text-base font-medium">Spec / Dimensions</Label>
                    <Input
                      id="spec_dimensions"
                      value={formData.spec_dimensions}
                      onChange={(e) => setFormData({ ...formData, spec_dimensions: e.target.value })}
                      placeholder="e.g., 100x50 cm"
                      className="h-11 text-base"
                      data-testid="spec-input"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="colour" className="text-base font-medium">Colour</Label>
                    <Select value={formData.colour} onValueChange={(value) => setFormData({ ...formData, colour: value })}>
                      <SelectTrigger className="h-11 text-base" data-testid="colour-select">
                        <SelectValue placeholder="Select colour" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color.id} value={color.color_name}>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 rounded border" style={{ backgroundColor: color.hex_code }} />
                              {color.color_name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Toggles */}
                <div className="border-t pt-6 space-y-4">
                  <Label className="text-base font-semibold">Item Controls</Label>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="qc_required" className="text-base font-medium cursor-pointer">QC Required</Label>
                        <p className="text-xs text-neutral-500">Quality Control inspection</p>
                      </div>
                      <Switch
                        id="qc_required"
                        checked={formData.qc_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, qc_required: checked })}
                        data-testid="qc-toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="batch_required" className="text-base font-medium cursor-pointer">Batch Required</Label>
                        <p className="text-xs text-neutral-500">Track by batch numbers</p>
                      </div>
                      <Switch
                        id="batch_required"
                        checked={formData.batch_required}
                        onCheckedChange={(checked) => setFormData({ ...formData, batch_required: checked })}
                        data-testid="batch-toggle"
                      />
                    </div>

                    <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg">
                      <div className="space-y-1">
                        <Label htmlFor="has_size_variants" className="text-base font-medium cursor-pointer">Size Variants</Label>
                        <p className="text-xs text-neutral-500">Multiple size options</p>
                      </div>
                      <Switch
                        id="has_size_variants"
                        checked={formData.has_size_variants}
                        onCheckedChange={(checked) => setFormData({ ...formData, has_size_variants: checked })}
                        data-testid="size-variants-toggle"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stock & Inventory Tab */}
            <Card id="stock" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900">
                  <TrendingUp className="h-6 w-6 text-purple-600" />Stock & Inventory
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Maintain Stock Toggle */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <Label htmlFor="maintain_stock" className="text-lg font-semibold cursor-pointer text-purple-900">Maintain Stock</Label>
                      <p className="text-sm text-purple-700">Enable inventory tracking for this item</p>
                    </div>
                    <Switch
                      id="maintain_stock"
                      checked={formData.maintain_stock}
                      onCheckedChange={(checked) => setFormData({ ...formData, maintain_stock: checked })}
                      className="data-[state=checked]:bg-purple-600"
                      data-testid="maintain-stock-toggle"
                    />
                  </div>
                </div>

                {/* Stock Fields - Conditional */}
                {formData.maintain_stock ? (
                  <>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="opening_stock" className="text-base font-medium">Opening Stock</Label>
                        <Input
                          id="opening_stock"
                          type="number"
                          step="0.01"
                          value={formData.opening_stock}
                          onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })}
                          placeholder="0.00"
                          className="h-11 text-base"
                          data-testid="opening-stock-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="opening_rate" className="text-base font-medium">Opening Rate</Label>
                        <Input
                          id="opening_rate"
                          type="number"
                          step="0.01"
                          value={formData.opening_rate}
                          onChange={(e) => setFormData({ ...formData, opening_rate: e.target.value })}
                          placeholder="0.00"
                          className="h-11 text-base"
                          data-testid="opening-rate-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="minimum_stock_level" className="text-base font-medium">Minimum Stock Level</Label>
                        <Input
                          id="minimum_stock_level"
                          type="number"
                          step="0.01"
                          value={formData.minimum_stock_level}
                          onChange={(e) => setFormData({ ...formData, minimum_stock_level: e.target.value })}
                          placeholder="0"
                          className="h-11 text-base"
                          data-testid="min-stock-input"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reorder_qty" className="text-base font-medium">Reorder Qty</Label>
                        <Input
                          id="reorder_qty"
                          type="number"
                          step="0.01"
                          value={formData.reorder_qty}
                          onChange={(e) => setFormData({ ...formData, reorder_qty: e.target.value })}
                          placeholder="0"
                          className="h-11 text-base"
                          data-testid="reorder-qty-input"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="costing_method" className="text-base font-medium">Costing Method</Label>
                        <Select value={formData.costing_method} onValueChange={(value) => setFormData({ ...formData, costing_method: value })}>
                          <SelectTrigger className="h-11 text-base" data-testid="costing-method-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                            <SelectItem value="AVERAGE">Weighted Average</SelectItem>
                            <SelectItem value="LIFO">LIFO (Last In First Out)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="bg-neutral-100 border border-neutral-300 rounded-lg p-12 text-center">
                    <p className="text-base text-neutral-600 font-medium">Stock tracking is disabled for this item</p>
                    <p className="text-sm text-neutral-500 mt-2">Enable &quot;Maintain Stock&quot; to track inventory</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterForm;
