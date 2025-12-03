import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, Save, X, Search } from 'lucide-react';
import { toast } from 'sonner';

const ItemCategories = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
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
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await mastersAPI.getItemCategories();
      // Mock hierarchical data
      const hierarchicalData = [
        { id: '1', code: 'FAB', name: 'Fabric', parent_category: null, level: 0, status: 'Active' },
        { id: '2', code: 'FAB-KNT', name: 'Knits', parent_category: '1', level: 1, status: 'Active' },
        { id: '3', code: 'FAB-KNT-COT', name: 'Cotton', parent_category: '2', level: 2, status: 'Active' },
        { id: '4', code: 'FAB-KNT-POL', name: 'Polyester', parent_category: '2', level: 2, status: 'Active' },
        { id: '5', code: 'FAB-WVN', name: 'Woven', parent_category: '1', level: 1, status: 'Active' },
        { id: '6', code: 'FAB-WVN-COT', name: 'Cotton', parent_category: '5', level: 2, status: 'Active' },
        { id: '7', code: 'TRM', name: 'Trim', parent_category: null, level: 0, status: 'Active' },
        { id: '8', code: 'TRM-BTN', name: 'Button', parent_category: '7', level: 1, status: 'Active' },
        { id: '9', code: 'TRM-BTN-POL', name: 'Polyester', parent_category: '8', level: 2, status: 'Active' },
        { id: '10', code: 'TRM-BTN-MET', name: 'Metal', parent_category: '8', level: 2, status: 'Active' },
        { id: '11', code: 'TRM-ZIP', name: 'Zipper', parent_category: '7', level: 1, status: 'Active' },
        { id: '12', code: 'ACC', name: 'Accessory', parent_category: null, level: 0, status: 'Active' },
        { id: '13', code: 'ACC-LBL', name: 'Label', parent_category: '12', level: 1, status: 'Active' },
        { id: '14', code: 'ACC-TAG', name: 'Tag', parent_category: '12', level: 1, status: 'Active' }
      ];
      setCategories(hierarchicalData);
      setExpandedCategories(new Set(['1', '7', '12']));
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.code.trim()) {
      toast.error('Category code is required');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      const level = formData.parent_category 
        ? (categories.find(c => c.id === formData.parent_category)?.level || 0) + 1 
        : 0;

      const payload = { ...formData, level };

      if (editMode) {
        toast.success('Category updated successfully');
      } else {
        await mastersAPI.createItemCategory(payload);
        toast.success('Category created successfully');
      }
      
      setDialogOpen(false);
      fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setFormData({
      code: category.code,
      name: category.name,
      parent_category: category.parent_category || '',
      level: category.level,
      inventory_type: category.inventory_type || 'RAW',
      default_uom: category.default_uom || '',
      default_hsn: category.default_hsn || '',
      status: category.status
    });
    setCurrentId(category.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const getCategoryPath = (categoryId) => {
    const path = [];
    let current = categories.find(c => c.id === categoryId);
    while (current) {
      path.unshift(current.name);
      current = categories.find(c => c.id === current.parent_category);
    }
    return path.join(' › ');
  };

  const getChildCount = (categoryId) => {
    return categories.filter(c => c.parent_category === categoryId).length;
  };

  const handleDelete = async (id) => {
    const hasChildren = categories.some(c => c.parent_category === id);
    if (hasChildren) {
      toast.error('Cannot delete category with sub-categories. Delete children first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await mastersAPI.deleteItemCategory(id);
        toast.success('Category deleted successfully');
        fetchCategories();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      parent_category: '',
      level: 0,
      inventory_type: 'RAW',
      default_uom: '',
      default_hsn: '',
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
  };

  const toggleExpand = (categoryId) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const renderCategoryRow = (category, depth = 0) => {
    const children = categories.filter(c => c.parent_category === category.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const childCount = getChildCount(category.id);

    return (
      <React.Fragment key={category.id}>
        <TableRow className="hover:bg-neutral-50 transition-colors">
          <TableCell>
            <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 24}px` }}>
              {hasChildren ? (
                <button
                  onClick={() => toggleExpand(category.id)}
                  className="p-1 hover:bg-neutral-200 rounded transition-colors"
                  data-testid={`expand-${category.id}`}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-neutral-600" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-neutral-600" />
                  )}
                </button>
              ) : (
                <span className="w-6" />
              )}
              <span className="font-mono text-sm">{category.code}</span>
            </div>
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              {depth > 0 && (
                <span className="text-neutral-400">
                  {'└─ '.repeat(Math.min(depth, 1))}
                </span>
              )}
              <span className="font-medium">{category.name}</span>
              {category.level === 0 && (
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">Root</span>
              )}
              {hasChildren && (
                <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded">
                  {childCount} {childCount === 1 ? 'child' : 'children'}
                </span>
              )}
            </div>
          </TableCell>
          <TableCell className="text-center">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
              category.level === 0 ? 'bg-blue-100 text-blue-800' : 
              category.level === 1 ? 'bg-green-100 text-green-800' : 
              'bg-purple-100 text-purple-800'
            }`}>
              Level {category.level}
            </span>
          </TableCell>
          <TableCell>{category.default_uom || '-'}</TableCell>
          <TableCell>
            <StatusBadge status={category.status} />
          </TableCell>
          <TableCell className="text-right">
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" size="icon" onClick={() => handleEdit(category)} data-testid={`edit-category-${category.id}`}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)} data-testid={`delete-category-${category.id}`}>
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
        {hasChildren && isExpanded && children.map(child => renderCategoryRow(child, depth + 1))}
      </React.Fragment>
    );
  };

  const rootCategories = categories.filter(c => c.parent_category === null || c.parent_category === '');

  return (
    <div className="space-y-6" data-testid="item-categories-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Category Master</h1>
          <p className="text-neutral-600 mt-1">Manage multi-level item categories (Fabric › Knits › Cotton)</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-category-btn" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                {editMode ? 'Edit' : 'Create'} Category
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              {formData.parent_category && formData.parent_category !== 'none' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-blue-900">Category Path Preview:</p>
                      <p className="text-sm text-blue-700 mt-1 font-medium">
                        {getCategoryPath(formData.parent_category)} › <span className="text-blue-900">{formData.name || 'New Category'}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-blue-600">Level</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Category Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="e.g., FAB-KNT-COT"
                    required
                    data-testid="category-code-input"
                  />
                  <p className="text-xs text-neutral-500">Use hierarchical codes (FAB-KNT-COT)</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Cotton"
                    required
                    data-testid="category-name-input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parent_category">Parent Category</Label>
                <Select value={formData.parent_category || 'none'} onValueChange={(value) => setFormData({ ...formData, parent_category: value === 'none' ? '' : value })}>
                  <SelectTrigger data-testid="parent-category-select">
                    <SelectValue placeholder="Select parent (leave empty for root)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">🏠 No Parent (Root Category)</SelectItem>
                    {categories.filter(c => c.id !== currentId).map(cat => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {'  '.repeat(cat.level)}{'└─ '.repeat(Math.min(cat.level, 1))}{cat.name} <span className="text-xs text-neutral-500">(Level {cat.level})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  {formData.parent_category && formData.parent_category !== 'none' ? (
                    <span className="text-blue-600 font-medium">
                      Will create as Level {(categories.find(c => c.id === formData.parent_category)?.level || 0) + 1} category
                    </span>
                  ) : (
                    'Will create as Level 0 (Root) category'
                  )}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inventory_type">Type</Label>
                  <Select value={formData.inventory_type} onValueChange={(value) => setFormData({ ...formData, inventory_type: value })}>
                    <SelectTrigger data-testid="inventory-type-select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="RAW">Raw Material</SelectItem>
                      <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                      <SelectItem value="FG">Finished Goods</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="default_uom">Default UOM</Label>
                  <Input
                    id="default_uom"
                    value={formData.default_uom}
                    onChange={(e) => setFormData({ ...formData, default_uom: e.target.value })}
                    placeholder="e.g., MTR, KG"
                    data-testid="default-uom-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" data-testid="submit-category-btn" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update' : 'Create'} Category
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search categories..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-category-input"
          />
        </div>
        <Button variant="outline" onClick={() => setExpandedCategories(new Set(categories.map(c => c.id)))} size="sm">
          Expand All
        </Button>
        <Button variant="outline" onClick={() => setExpandedCategories(new Set())} size="sm">
          Collapse All
        </Button>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold text-center">Level</TableHead>
              <TableHead className="font-semibold">Default UOM</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">Loading...</TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <FolderTree className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No categories found</p>
                    <p className="text-sm text-neutral-500">Click "Create Category" to add one</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rootCategories.map(category => renderCategoryRow(category, 0))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemCategories;
