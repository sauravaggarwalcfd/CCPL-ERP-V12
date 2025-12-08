import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, FileText, FolderTree, Info, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    category_id: '',
    item_category_name: '',
    item_category_code: '',
    item_group_name: '',
    item_group_code: '',
    item_sub_group_name: '',
    item_sub_group_code: '',
    parent_category: '',
    level: 0,
    inventory_type: 'RAW',
    default_uom: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchCategories();
    if (id) {
      fetchCategory(id);
    } else {
      generateCategoryID();
    }
  }, [id]);

  const generateCategoryID = async () => {
    try {
      const response = await mastersAPI.getItemCategories();
      const count = (response.data || []).length + 1;
      const catId = `CAT-${String(count).padStart(4, '0')}`;
      setFormData(prev => ({ ...prev, category_id: catId }));
    } catch (error) {
      const catId = `CAT-0001`;
      setFormData(prev => ({ ...prev, category_id: catId }));
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await mastersAPI.getItemCategories();
      setCategories(response.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const fetchCategory = async (catId) => {
    try {
      const response = await mastersAPI.getItemCategory(catId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load category');
    }
  };

  const checkDuplicateName = (name, parentId) => {
    return categories.some(cat => 
      cat.item_category_name?.toLowerCase() === name.toLowerCase() && 
      cat.parent_category === parentId &&
      cat.id !== id
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.item_category_name.trim()) {
      toast.error('Item Category Name is required');
      return;
    }
    if (!formData.item_category_code.trim()) {
      toast.error('Item Category Code is required');
      return;
    }
    if (!formData.item_group_name.trim()) {
      toast.error('Item Group Name is required');
      return;
    }
    if (!formData.item_group_code.trim()) {
      toast.error('Item Group Code is required');
      return;
    }
    if (!formData.item_sub_group_name.trim()) {
      toast.error('Item Sub Group Name is required');
      return;
    }
    if (!formData.item_sub_group_code.trim()) {
      toast.error('Item Sub Group Code is required');
      return;
    }

    // Check duplicate
    const parentId = formData.parent_category === 'none' ? '' : formData.parent_category;
    if (checkDuplicateName(formData.item_category_name, parentId)) {
      toast.error('Category name already exists under this parent. Please use a unique name.');
      return;
    }

    try {
      const level = formData.parent_category && formData.parent_category !== 'none'
        ? (categories.find(c => c.id === formData.parent_category)?.level || 0) + 1
        : 0;

      const payload = { 
        ...formData, 
        level,
        parent_category: formData.parent_category === 'none' ? '' : formData.parent_category,
        // Also store in old format for compatibility
        code: formData.item_category_code,
        name: formData.item_category_name
      };

      if (id) {
        await mastersAPI.updateItemCategory(id, payload);
        toast.success('Category updated successfully');
      } else {
        await mastersAPI.createItemCategory(payload);
        toast.success('Category created successfully');
      }
      navigate('/masters/item-categories');
    } catch (error) {
      toast.error('Failed to save category');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Category Details', icon: FileText },
    { id: 'hierarchy', label: 'Hierarchy Structure', icon: FolderTree }
  ];

  const getCategoryPath = (categoryId) => {
    if (!categoryId || categoryId === 'none') return '';
    const path = [];
    let current = categories.find(c => c.id === categoryId);
    while (current) {
      path.unshift(current.item_category_name || current.name);
      current = categories.find(c => c.id === current.parent_category);
    }
    return path.join(' › ');
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/item-categories')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Item Category</h1>
              <p className="text-base text-emerald-100">Hierarchical category with group and sub-group structure</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/item-categories')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="category-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Category
            </Button>
          </div>
        </div>

        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${activeSection === section.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50/50'}`}>
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-full px-8 py-6 mt-4">
        <div className="max-w-full mx-auto">
          <form id="category-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Category Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-6">
                {/* Auto-generated Category ID */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-blue-900 mb-3 block">Auto-Generated ID</Label>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Category ID</Label>
                    <Input value={formData.category_id} disabled className="h-11 text-base bg-white font-mono font-semibold" />
                    <p className="text-xs text-blue-600">Auto-generated in CAT-0001 format</p>
                  </div>
                </div>

                {/* Category Name & Code */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_category_name" className="text-base font-medium">Item Category Name *</Label>
                    <Input id="item_category_name" value={formData.item_category_name} onChange={(e) => setFormData({ ...formData, item_category_name: e.target.value })} placeholder="e.g., Trims" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_category_code" className="text-base font-medium">Item Category Code *</Label>
                    <Input id="item_category_code" value={formData.item_category_code} onChange={(e) => setFormData({ ...formData, item_category_code: e.target.value })} placeholder="e.g., TRM" required className="h-11 text-base font-mono" />
                  </div>
                </div>

                {/* Group Name & Code */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_group_name" className="text-base font-medium">Item Group Name *</Label>
                    <Input id="item_group_name" value={formData.item_group_name} onChange={(e) => setFormData({ ...formData, item_group_name: e.target.value })} placeholder="e.g., Labels" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_group_code" className="text-base font-medium">Item Group Code *</Label>
                    <Input id="item_group_code" value={formData.item_group_code} onChange={(e) => setFormData({ ...formData, item_group_code: e.target.value })} placeholder="e.g., LBL" required className="h-11 text-base font-mono" />
                  </div>
                </div>

                {/* Sub Group Name & Code */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="item_sub_group_name" className="text-base font-medium">Item Sub Group Name *</Label>
                    <Input id="item_sub_group_name" value={formData.item_sub_group_name} onChange={(e) => setFormData({ ...formData, item_sub_group_name: e.target.value })} placeholder="e.g., Main Label" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_sub_group_code" className="text-base font-medium">Item Sub Group Code *</Label>
                    <Input id="item_sub_group_code" value={formData.item_sub_group_code} onChange={(e) => setFormData({ ...formData, item_sub_group_code: e.target.value })} placeholder="e.g., MLBL" required className="h-11 text-base font-mono" />
                  </div>
                </div>

                {/* Additional Fields */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="inventory_type" className="text-base font-medium">Inventory Type</Label>
                    <Select value={formData.inventory_type} onValueChange={(value) => setFormData({ ...formData, inventory_type: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RAW">Raw Material</SelectItem>
                        <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                        <SelectItem value="FG">Finished Goods</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_uom" className="text-base font-medium">Default UOM</Label>
                    <Input id="default_uom" value={formData.default_uom} onChange={(e) => setFormData({ ...formData, default_uom: e.target.value })} placeholder="e.g., Pieces, Meters" className="h-11 text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="hierarchy" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><FolderTree className="h-6 w-6 text-green-600" />Hierarchy Structure</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                {/* Path Preview */}
                {(formData.parent_category && formData.parent_category !== 'none') && (
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-blue-900 mb-2 flex items-center gap-2">
                          <Info className="h-4 w-4" />
                          Category Path Preview:
                        </p>
                        <p className="text-xl text-blue-700 font-semibold">
                          {getCategoryPath(formData.parent_category)} › <span className="text-blue-900">{formData.item_category_name || 'New Category'}</span>
                        </p>
                        <p className="text-sm text-blue-600 mt-2">
                          Full Structure: {getCategoryPath(formData.parent_category)} › {formData.item_category_name || 'Category'} › {formData.item_group_name || 'Group'} › {formData.item_sub_group_name || 'Sub Group'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600 mb-1">Hierarchy Level</p>
                        <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center">
                          <span className="text-4xl font-bold text-white">
                            {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Parent Selection */}
                <div className="space-y-2">
                  <Label htmlFor="parent_category" className="text-base font-medium">Parent Category</Label>
                  <Select value={formData.parent_category || 'none'} onValueChange={(value) => setFormData({ ...formData, parent_category: value === 'none' ? '' : value })}>
                    <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">
                        <div className="flex items-center gap-2">
                          <span className="text-xl">🏠</span>
                          <span>No Parent (Root Category)</span>
                        </div>
                      </SelectItem>
                      {categories.filter(c => c.id !== id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          <div className="flex items-center gap-2">
                            {'  '.repeat(cat.level)}
                            <span className="text-neutral-400">{'└─'.repeat(Math.min(cat.level, 1))}</span>
                            <span>{cat.item_category_name || cat.name}</span>
                            <Badge variant="outline" className="text-xs ml-2">Level {cat.level}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    {formData.parent_category && formData.parent_category !== 'none' ? (
                      <span className="text-green-600 font-medium flex items-center gap-1">
                        <Info className="h-3 w-3" />
                        Will create as Level {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1} category under {categories.find(c => c.id === formData.parent_category)?.item_category_name || categories.find(c => c.id === formData.parent_category)?.name}
                      </span>
                    ) : (
                      <span className="text-blue-600 font-medium">Will create as Level 0 (Root Category)</span>
                    )}
                  </p>
                </div>

                {/* Example Structure */}
                <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-purple-900 mb-4 block flex items-center gap-2">
                    <Info className="h-5 w-5" />
                    Example Hierarchy Structure
                  </Label>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-purple-900">
                      <span className="font-mono bg-purple-200 px-2 py-1 rounded">Level 0:</span>
                      <span className="font-medium">Trims (Category)</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-800 ml-6">
                      <span className="text-purple-400">└─</span>
                      <span className="font-mono bg-purple-200 px-2 py-1 rounded">Level 1:</span>
                      <span className="font-medium">Labels (Group)</span>
                    </div>
                    <div className="flex items-center gap-2 text-purple-700 ml-12">
                      <span className="text-purple-400">└─</span>
                      <span className="font-mono bg-purple-200 px-2 py-1 rounded">Level 2:</span>
                      <span className="font-medium">Main Label (Sub Group)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;