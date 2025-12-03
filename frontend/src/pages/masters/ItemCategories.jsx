import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, Save, X } from 'lucide-react';
import { toast } from 'sonner';

const ItemCategories = () => {
  const [categories, setCategories] = useState([]);
  const [expandedCategories, setExpandedCategories] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    parent_category: '',
    level: 0,
    inventory_type: 'RAW',
    default_uom: '',
    default_hsn: '',
    stock_account: '',
    expense_account: '',
    income_account: '',
    allow_purchase: true,
    allow_issue: true,
    status: 'Active'
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await mastersAPI.getItemCategories();
      setCategories(response.data);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mastersAPI.createItemCategory(formData);
      toast.success('Category created successfully');
      setDialogOpen(false);
      fetchCategories();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create category');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      parent_category: '',
      inventory_type: 'RAW',
      default_uom: '',
      default_hsn: '',
      stock_account: '',
      expense_account: '',
      income_account: '',
      allow_purchase: true,
      allow_issue: true,
      status: 'Active'
    });
  };

  return (
    <div className="space-y-6" data-testid="item-categories-page">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Category Master</h1>
          <p className="text-neutral-600 mt-1">Manage item categories and classifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-category-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Item Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Category Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    required
                    data-testid="category-code-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Category Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    data-testid="category-name-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="inventory_type">Inventory Type *</Label>
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
                    placeholder="e.g., Pcs, Kg"
                    data-testid="default-uom-input"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="default_hsn">Default HSN</Label>
                  <Input
                    id="default_hsn"
                    value={formData.default_hsn}
                    onChange={(e) => setFormData({ ...formData, default_hsn: e.target.value })}
                    data-testid="default-hsn-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock_account">Stock Account</Label>
                  <Input
                    id="stock_account"
                    value={formData.stock_account}
                    onChange={(e) => setFormData({ ...formData, stock_account: e.target.value })}
                    data-testid="stock-account-input"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="submit-category-btn">Create Category</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
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
                <TableCell colSpan={6} className="text-center py-8 text-neutral-500">No categories found</TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{category.code}</TableCell>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>{category.inventory_type}</TableCell>
                  <TableCell>{category.default_uom || '-'}</TableCell>
                  <TableCell><StatusBadge status={category.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-category-${category.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-category-${category.id}`}>
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ItemCategories;
