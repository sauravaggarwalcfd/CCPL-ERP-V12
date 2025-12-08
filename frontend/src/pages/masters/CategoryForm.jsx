import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, FolderTree, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [categories, setCategories] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parent_category: '',
    level: 0,
    inventory_type: 'RAW',
    default_uom: '',
    default_hsn: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchCategories();
    if (id) fetchCategory(id);
  }, [id]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.code.trim() || !formData.name.trim()) {
      toast.error('Code and Name are required');
      return;
    }

    try {
      const level = formData.parent_category && formData.parent_category !== 'none'
        ? (categories.find(c => c.id === formData.parent_category)?.level || 0) + 1
        : 0;

      const payload = { ...formData, level };

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
    { id: 'basic', label: 'Basic Information', icon: FileText },
    { id: 'hierarchy', label: 'Category Hierarchy', icon: FolderTree }
  ];

  const getCategoryPath = (categoryId) => {
    if (!categoryId || categoryId === 'none') return '';
    const path = [];
    let current = categories.find(c => c.id === categoryId);
    while (current) {
      path.unshift(current.name);
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
              <p className="text-base text-emerald-100">Multi-level category hierarchy management</p>
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
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="code" className="text-base font-medium">Category Code *</Label>
                    <Input id="code" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} placeholder="e.g., FAB-KNT-COT" required className="h-11 text-base" />
                    <p className="text-xs text-neutral-500">Use hierarchical codes (FAB-KNT-COT)</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-base font-medium">Category Name *</Label>
                    <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g., Cotton" required className="h-11 text-base" />
                  </div>
                </div>

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
                    <Input id="default_uom" value={formData.default_uom} onChange={(e) => setFormData({ ...formData, default_uom: e.target.value })} placeholder="e.g., MTR, KG" className="h-11 text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="hierarchy" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><FolderTree className="h-6 w-6 text-green-600" />Category Hierarchy</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                {(formData.parent_category && formData.parent_category !== 'none') && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-blue-900 mb-1">Category Path Preview:</p>
                        <p className="text-lg text-blue-700 font-medium">
                          {getCategoryPath(formData.parent_category)} › <span className="text-blue-900">{formData.name || 'New Category'}</span>
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-blue-600">Level</p>
                        <p className="text-3xl font-bold text-blue-900">
                          {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="parent_category" className="text-base font-medium">Parent Category</Label>
                  <Select value={formData.parent_category || 'none'} onValueChange={(value) => setFormData({ ...formData, parent_category: value === 'none' ? '' : value })}>
                    <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select parent" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">🏠 No Parent (Root Category)</SelectItem>
                      {categories.filter(c => c.id !== id).map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {'  '.repeat(cat.level)}{'└─'.repeat(Math.min(cat.level, 1))}{cat.name} <span className="text-xs text-neutral-500">(Level {cat.level})</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-neutral-500">
                    {formData.parent_category && formData.parent_category !== 'none' ? (
                      <span className="text-blue-600 font-medium">Will create as Level {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1} category</span>
                    ) : (
                      'Will create as Level 0 (Root) category'
                    )}
                  </p>
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