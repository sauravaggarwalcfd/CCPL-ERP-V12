import React, { useState, useEffect } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Save, X, Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, Search, Info, Move, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

const ItemCategoryMaster = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [itemTypeFilter, setItemTypeFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    category_id: '',
    category_name: '',
    category_short_code: '',
    item_type: 'RM',
    parent_category: '',
    description: '',
    is_active: true
  });

  const [itemTypes, setItemTypes] = useState(['RM', 'FG', 'PACKING', 'ACCESSORY', 'CONSUMABLE', 'GENERAL', 'SERVICE']);
  const [showAddItemType, setShowAddItemType] = useState(false);
  const [newItemType, setNewItemType] = useState('');
  const [showItemTypeWarning, setShowItemTypeWarning] = useState(false);
  const [pendingItemTypeChange, setPendingItemTypeChange] = useState(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await mastersAPI.getItemCategories();
      const data = response.data || [];
      setCategories(data);
      // Expand root categories by default
      const rootIds = data.filter(c => !c.parent_category).map(c => c.id);
      setExpandedCategories(new Set(rootIds));
    } catch (error) {
      toast.error('Failed to load categories');
    }
  };

  const generateCategoryID = () => {
    const count = categories.length + 1;
    return `CAT-${String(count).padStart(4, '0')}`;
  };

  const handleNew = () => {
    setFormData({
      category_id: generateCategoryID(),
      category_name: '',
      category_short_code: '',
      item_type: 'RM',
      parent_category: '',
      description: '',
      is_active: true
    });
    setSelectedCategory(null);
    setEditMode(false);
  };

  const handleEdit = (category) => {
    // Get inherited item type from parent if not root
    const parentCat = category.parent_category ? categories.find(c => c.id === category.parent_category) : null;
    const inheritedType = parentCat ? (parentCat.item_type || 'RM') : (category.item_type || 'RM');

    setFormData({
      category_id: category.category_id || category.id,
      category_name: category.category_name || category.name,
      category_short_code: category.category_short_code || category.code?.substring(0, 4) || '',
      item_type: inheritedType,
      parent_category: category.parent_category || '',
      description: category.description || '',
      is_active: category.is_active !== false
    });
    setSelectedCategory(category);
    setEditMode(true);
  };

  const handleAddChild = (parentCategory) => {
    // Inherit item type from parent
    const inheritedType = parentCategory.item_type || 'RM';
    
    setFormData({
      category_id: generateCategoryID(),
      category_name: '',
      category_short_code: '',
      item_type: inheritedType,
      parent_category: parentCategory.id,
      description: '',
      is_active: true
    });
    setSelectedCategory(null);
    setEditMode(false);
    toast.info(`Adding child category under ${parentCategory.category_name || parentCategory.name}. Item Type: ${inheritedType} (inherited)`);
  };

  const checkDuplicateName = (name, parentId) => {
    return categories.some(cat => 
      (cat.category_name || cat.name)?.toLowerCase() === name.toLowerCase() && 
      (cat.parent_category || '') === (parentId || '') &&
      cat.id !== selectedCategory?.id
    );
  };

  const checkDuplicateShortCode = (shortCode) => {
    return categories.some(cat => 
      (cat.category_short_code || cat.code)?.toUpperCase() === shortCode.toUpperCase() &&
      cat.id !== selectedCategory?.id
    );
  };

  const getDescendants = (categoryId) => {
    const descendants = [];
    const findChildren = (parentId) => {
      const children = categories.filter(c => c.parent_category === parentId);
      children.forEach(child => {
        descendants.push(child);
        findChildren(child.id);
      });
    };
    findChildren(categoryId);
    return descendants;
  };

  const updateDescendantsItemType = async (categoryId, newItemType) => {
    const descendants = getDescendants(categoryId);
    const descendantIds = descendants.map(d => d.id);
    
    console.log(`Bulk updating ${descendants.length} descendants with Item Type: ${newItemType}`);
    
    try {
      // Use bulk update endpoint (safer - only updates item_type fields)
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/masters/item-categories/bulk-update-item-type`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          category_ids: descendantIds,
          item_type: newItemType
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ Bulk update successful: ${data.updated_count} categories updated`);
        return data.updated_count;
      } else {
        throw new Error('Bulk update failed');
      }
    } catch (error) {
      console.error('Bulk update error:', error);
      // Fallback to individual updates
      toast.warning('Using fallback update method...');
      
      for (const descendant of descendants) {
        try {
          await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/masters/item-categories/${descendant.id}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
              item_type: newItemType,
              inventory_type: newItemType
            })
          });
        } catch (err) {
          console.error(`Failed to update ${descendant.id}:`, err);
        }
      }
    }
  };

  const handleSave = async () => {
    // Validations
    if (!formData.category_name.trim()) {
      toast.error('Category Name is required');
      return;
    }
    if (!formData.category_short_code.trim()) {
      toast.error('Category Short Code is required');
      return;
    }
    if (formData.category_short_code.length < 2 || formData.category_short_code.length > 4) {
      toast.error('Short Code must be 2-4 characters');
      return;
    }
    
    // Check duplicate short code
    if (checkDuplicateShortCode(formData.category_short_code)) {
      toast.error('Category Short Code already exists. Please use a unique code.');
      return;
    }

    // Check duplicate under same parent
    const parentId = formData.parent_category === 'none' ? '' : formData.parent_category;
    if (checkDuplicateName(formData.category_name, parentId)) {
      toast.error('Category name already exists under this parent. Please use a unique name.');
      return;
    }

    // Check if editing root category and item type changed
    if (editMode && selectedCategory && !selectedCategory.parent_category) {
      const oldItemType = selectedCategory.item_type || selectedCategory.inventory_type;
      if (oldItemType !== formData.item_type) {
        const descendants = getDescendants(selectedCategory.id);
        if (descendants.length > 0) {
          setPendingItemTypeChange({
            newType: formData.item_type,
            oldType: oldItemType,
            affectedCount: descendants.length
          });
          setShowItemTypeWarning(true);
          return; // Wait for user confirmation
        }
      }
    }

    await performSave();
  };

  const performSave = async () => {
    try {
      // Additional validation for short code
      if (!formData.category_short_code.trim()) {
        toast.error('Category Short Code is required');
        return;
      }
      
      // Check duplicate short code
      if (checkDuplicateShortCode(formData.category_short_code)) {
        toast.error('Category Short Code already exists. Please use a unique code.');
        return;
      }

      const level = formData.parent_category && formData.parent_category !== 'none'
        ? (categories.find(c => c.id === formData.parent_category)?.level || 0) + 1
        : 0;

      const payload = {
        id: formData.category_id || formData.id,  // Use existing ID or generate new one
        code: formData.category_short_code.toUpperCase(),
        name: formData.category_name.toUpperCase(),
        parent_category: formData.parent_category === 'none' ? null : formData.parent_category,
        item_type: formData.item_type,
        category_short_code: formData.category_short_code.toUpperCase(),
        inventory_type: formData.item_type,
        default_uom: 'PCS',
        is_active: formData.is_active,
        status: formData.is_active ? 'Active' : 'Inactive',
        level
      };

      console.log('Saving category with payload:', payload);

      if (editMode && selectedCategory) {
        await mastersAPI.updateItemCategory(selectedCategory.id, payload);
        
        // Update all descendants if item type changed
        if (pendingItemTypeChange) {
          toast.info(`Updating ${pendingItemTypeChange.affectedCount} child categories...`, { duration: 3000 });
          await updateDescendantsItemType(selectedCategory.id, formData.item_type);
          setPendingItemTypeChange(null);
          toast.success(`Updated ${pendingItemTypeChange.affectedCount} child categories to Item Type: ${formData.item_type}`);
        }
        
        toast.success(`Category updated successfully with Item Type: ${formData.item_type}`);
      } else {
        await mastersAPI.createItemCategory(payload);
        toast.success(`Category created successfully with Item Type: ${formData.item_type}`);
      }
      
      // Refresh categories and maintain expanded state
      const currentExpanded = new Set(expandedCategories);
      await fetchCategories();
      // Restore expanded state after refresh
      setTimeout(() => {
        setExpandedCategories(currentExpanded);
      }, 100);
      
      handleNew();
    } catch (error) {
      console.error('Save error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.detail || 'Failed to save category');
    }
  };

  const handleDelete = async (category) => {
    const hasChildren = categories.some(c => c.parent_category === category.id);
    if (hasChildren) {
      toast.error('Cannot delete category with sub-categories. Delete children first.');
      return;
    }

    if (window.confirm(`Delete category "${category.category_name || category.name}"?`)) {
      try {
        await mastersAPI.deleteItemCategory(category.id);
        toast.success('Category deleted successfully');
        fetchCategories();
        handleNew();
      } catch (error) {
        toast.error('Failed to delete category');
      }
    }
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

  const renderCategoryTree = (parentId = null, depth = 0) => {
    const children = categories.filter(c => (c.parent_category || null) === parentId);
    
    return children.map(category => {
      const hasChildren = categories.some(c => c.parent_category === category.id);
      const isExpanded = expandedCategories.has(category.id);
      const isSelected = selectedCategory?.id === category.id;
      const catName = category.category_name || category.name;

      return (
        <div key={category.id}>
          <div
            className={`flex items-center gap-2 px-3 py-2 rounded-md cursor-pointer transition-colors hover:bg-emerald-50 ${
              isSelected ? 'bg-emerald-100 border-l-4 border-emerald-600' : ''
            }`}
            style={{ paddingLeft: `${depth * 20 + 12}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => toggleExpand(category.id)}
                className="p-1 hover:bg-emerald-200 rounded"
              >
                {isExpanded ? (
                  <ChevronDown className="h-4 w-4 text-emerald-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-emerald-600" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}
            <div className="flex-1" onClick={() => handleEdit(category)}>
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{catName}</span>
                {category.level === 0 && (
                  <Badge variant="outline" className="text-xs bg-blue-50">Root</Badge>
                )}
              </div>
              <div className="text-xs text-neutral-500">{category.category_id || category.code}</div>
            </div>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); handleAddChild(category); }}
                title="Add Child"
              >
                <Plus className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={(e) => { e.stopPropagation(); handleDelete(category); }}
                title="Delete"
              >
                <Trash2 className="h-3 w-3 text-red-600" />
              </Button>
            </div>
          </div>
          {hasChildren && isExpanded && renderCategoryTree(category.id, depth + 1)}
        </div>
      );
    });
  };

  const filteredCategories = categories.filter(cat => {
    const catName = (cat.category_name || cat.name || '').toLowerCase();
    const matchesSearch = catName.includes(searchTerm.toLowerCase());
    
    const matchesType = itemTypeFilter === 'All' || cat.item_type === itemTypeFilter;
    
    const catStatus = cat.is_active !== false ? 'Active' : 'Inactive';
    const matchesStatus = statusFilter === 'All' || catStatus === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Left Panel - Tree View */}
      <div className="w-1/3 bg-white border-r border-neutral-200 flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 border-b border-emerald-800">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-heading font-semibold text-white">Category Tree</h2>
              <p className="text-sm text-emerald-100 mt-1">{categories.length} categories</p>
            </div>
            <Button onClick={handleNew} size="sm" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Plus className="h-4 w-4" />
              New
            </Button>
          </div>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-emerald-200" />
              <Input
                placeholder="Search categories..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/10 border-emerald-500 text-white placeholder:text-emerald-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Select value={itemTypeFilter} onValueChange={setItemTypeFilter}>
                <SelectTrigger className="h-9 text-sm bg-white/10 border-emerald-500 text-white">
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Types</SelectItem>
                  {itemTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 text-sm bg-white/10 border-emerald-500 text-white">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Status</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <ScrollArea className="flex-1 p-4">
          {filteredCategories.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <FolderTree className="h-12 w-12 mx-auto mb-2 text-neutral-300" />
              <p>No categories found</p>
              <Button onClick={handleNew} size="sm" className="mt-3">Create First Category</Button>
            </div>
          ) : (
            <div className="space-y-1">
              {renderCategoryTree()}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-neutral-200 bg-neutral-50">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedCategories(new Set(categories.map(c => c.id)))}
              className="flex-1"
            >
              Expand All
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExpandedCategories(new Set())}
              className="flex-1"
            >
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 p-6 border-b border-emerald-800">
          <h2 className="text-2xl font-heading font-semibold text-white">
            {editMode ? 'Edit Category' : 'Create New Category'}
          </h2>
          <p className="text-sm text-emerald-100 mt-1">
            {editMode ? `Editing: ${formData.category_name}` : 'Add a new category to the hierarchy'}
          </p>
        </div>

        <ScrollArea className="flex-1 p-8">
          <Card>
            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b">
              <CardTitle className="flex items-center gap-2 text-lg text-blue-900">
                <FolderTree className="h-5 w-5 text-blue-600" />
                Category Information
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              {/* Auto-generated Category ID */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <Label className="text-base font-medium text-blue-900 mb-2 block">Category ID (Auto-generated)</Label>
                <Input
                  value={formData.category_id}
                  disabled
                  className="h-11 text-base bg-white font-mono font-bold text-blue-900"
                />
                <p className="text-xs text-blue-600 mt-1">Format: CAT-0001</p>
              </div>

              {/* Category Name */}
              <div className="space-y-2">
                <Label htmlFor="category_name" className="text-base font-medium">
                  Category Name *
                </Label>
                <Input
                  id="category_name"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value.toUpperCase() })}
                  placeholder="e.g., TRIMS, LABELS, MAIN LABEL"
                  required
                  className="h-11 text-base font-bold uppercase"
                />
                <p className="text-xs text-neutral-500">Will be saved in uppercase</p>
              </div>

              {/* Category Short Code */}
              <div className="space-y-2">
                <Label htmlFor="category_short_code" className="text-base font-medium">
                  Category Short Code *
                </Label>
                <Input
                  id="category_short_code"
                  value={formData.category_short_code}
                  onChange={(e) => setFormData({ ...formData, category_short_code: e.target.value.toUpperCase() })}
                  placeholder="e.g., LABL, BTN, TRM (4 chars max)"
                  required
                  maxLength={4}
                  className="h-11 text-base font-mono font-semibold"
                />
                <p className="text-xs text-blue-600">Used for auto-generating item codes (e.g., LABL-0001, BTN-0045)</p>
              </div>

              {/* Item Type - Conditional */}
              <div className="space-y-2">
                <Label htmlFor="item_type" className="text-base font-medium">
                  Item Type {(!formData.parent_category || formData.parent_category === 'none') ? '*' : '(Inherited)'}
                </Label>
                {(!formData.parent_category || formData.parent_category === 'none') ? (
                  <>
                    <div className="flex gap-2">
                      <Select value={formData.item_type} onValueChange={(value) => {
                        if (value === '_add_new') {
                          setShowAddItemType(true);
                        } else {
                          setFormData({ ...formData, item_type: value });
                        }
                      }}>
                        <SelectTrigger className="h-11 text-base flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {itemTypes.map(type => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                          <SelectItem value="_add_new" className="text-blue-600 font-medium">+ Add New Type...</SelectItem>
                        </SelectContent>
                      </Select>
                      {showAddItemType && (
                        <div className="flex gap-2">
                          <Input
                            placeholder="New type"
                            value={newItemType}
                            onChange={(e) => setNewItemType(e.target.value.toUpperCase())}
                            className="h-11 w-40"
                            maxLength={12}
                          />
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => {
                              if (newItemType.trim() && !itemTypes.includes(newItemType.trim())) {
                                setItemTypes([...itemTypes, newItemType.trim()]);
                                setFormData({ ...formData, item_type: newItemType.trim() });
                                setNewItemType('');
                                setShowAddItemType(false);
                                toast.success(`Item type "${newItemType}" added`);
                              }
                            }}
                          >
                            Add
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setShowAddItemType(false);
                              setNewItemType('');
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-green-600">Editable for root categories only</p>
                  </>
                ) : (
                  <>
                    <Input
                      value={formData.item_type}
                      disabled
                      className="h-11 text-base bg-amber-50 border-amber-300 font-semibold"
                    />
                    <p className="text-xs text-amber-600">Inherited from parent category (read-only)</p>
                  </>
                )}
              </div>

              {/* Parent Category */}
              <div className="space-y-2">
                <Label htmlFor="parent_category" className="text-base font-medium">
                  Parent Category (Optional)
                </Label>
                <Select
                  value={formData.parent_category || 'none'}
                  onValueChange={(value) => {
                    const parentId = value === 'none' ? '' : value;
                    const parentCat = parentId ? categories.find(c => c.id === parentId) : null;
                    const inheritedType = parentCat ? (parentCat.item_type || 'RM') : formData.item_type;
                    
                    setFormData({ 
                      ...formData, 
                      parent_category: parentId,
                      item_type: inheritedType
                    });
                    
                    if (parentCat) {
                      toast.info(`Item Type inherited: ${inheritedType}`, { duration: 2000 });
                    }
                  }}
                >
                  <SelectTrigger className="h-11 text-base">
                    <SelectValue placeholder="Select parent category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      <div className="flex items-center gap-2">
                        <span>🏠</span>
                        <span>No Parent (Root Level)</span>
                      </div>
                    </SelectItem>
                    {categories
                      .filter(c => c.id !== selectedCategory?.id)
                      .map(cat => {
                        const catName = cat.category_name || cat.name;
                        const level = cat.level || 0;
                        return (
                          <SelectItem key={cat.id} value={cat.id}>
                            <div className="flex items-center gap-2">
                              {'  '.repeat(level)}
                              <span className="text-neutral-400">{'└─'.repeat(Math.min(level, 1))}</span>
                              <span>{catName}</span>
                              <Badge variant="outline" className="text-xs ml-1">L{level}</Badge>
                            </div>
                          </SelectItem>
                        );
                      })}
                  </SelectContent>
                </Select>
                <p className="text-xs text-neutral-500">
                  {formData.parent_category && formData.parent_category !== 'none' ? (
                    <span className="text-green-600 font-medium flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Will create as child. Item Type: {formData.item_type} (inherited from parent)
                    </span>
                  ) : (
                    <span className="text-blue-600 font-medium">Will create as root category. Item Type: {formData.item_type} (editable)</span>
                  )}
                </p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description" className="text-base font-medium">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Optional category description"
                  rows={3}
                  className="text-base"
                />
              </div>

              {/* Is Active Toggle */}
              <div className="flex items-center justify-between p-5 border-2 border-neutral-200 rounded-lg bg-neutral-50">
                <div className="space-y-1">
                  <Label htmlFor="is_active" className="text-base font-medium cursor-pointer">
                    Is Active
                  </Label>
                  <p className="text-xs text-neutral-500">Enable this category for use</p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {/* Example Structure */}
              <div className="bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200 rounded-lg p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FolderTree className="h-5 w-5 text-purple-600" />
                  <Label className="text-base font-semibold text-purple-900">
                    Example: Hierarchical Structure
                  </Label>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-purple-900">
                    <Badge className="bg-purple-200 text-purple-900">Level 0</Badge>
                    <span className="font-medium">Trims</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-800 ml-6">
                    <span className="text-purple-400">└─</span>
                    <Badge className="bg-purple-200 text-purple-800">Level 1</Badge>
                    <span className="font-medium">Labels</span>
                  </div>
                  <div className="flex items-center gap-2 text-purple-700 ml-12">
                    <span className="text-purple-400">└─</span>
                    <Badge className="bg-purple-200 text-purple-700">Level 2</Badge>
                    <span className="font-medium">Main Label</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </ScrollArea>

        {/* Form Actions */}
        <div className="p-6 border-t border-neutral-200 bg-white flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={handleNew}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Clear Form
          </Button>
          <Button
            onClick={handleSave}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {editMode ? 'Update' : 'Save'} Category
          </Button>
        </div>
      </div>

      {/* Item Type Change Warning Dialog */}
      <AlertDialog open={showItemTypeWarning} onOpenChange={setShowItemTypeWarning}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-amber-900 flex items-center gap-2">
              <Info className="h-6 w-6 text-amber-600" />
              Warning: Item Type Change
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3 pt-3">
              <p className="text-base text-neutral-700">
                You are changing the Item Type of a root category that has child categories.
              </p>
              <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Current Type:</span>
                    <span className="font-bold text-red-700">{pendingItemTypeChange?.oldType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">New Type:</span>
                    <span className="font-bold text-green-700">{pendingItemTypeChange?.newType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Affected Child Categories:</span>
                    <span className="font-bold text-blue-700">{pendingItemTypeChange?.affectedCount}</span>
                  </div>
                </div>
              </div>
              <p className="text-base font-semibold text-amber-900">
                All {pendingItemTypeChange?.affectedCount} child categories will be updated to Item Type: {pendingItemTypeChange?.newType}
              </p>
              <p className="text-sm text-neutral-600">
                This will ensure consistency across the hierarchy. Do you want to continue?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setShowItemTypeWarning(false);
              setPendingItemTypeChange(null);
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setShowItemTypeWarning(false);
              performSave();
            }} className="bg-amber-600 hover:bg-amber-700">
              Yes, Update All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ItemCategoryMaster;