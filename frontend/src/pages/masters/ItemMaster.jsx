import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from '@/components/StatusBadge';
import { Plus, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';

const ItemMaster = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    item_code: '',
    item_name: '',
    category_id: '',
    uom: '',
    hsn: '',
    preferred_supplier_id: '',
    reorder_level: 0,
    min_stock: 0,
    max_stock: 0,
    stock_account: '',
    expense_account: '',
    barcode: '',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes, suppRes] = await Promise.all([
        mastersAPI.getItems(),
        mastersAPI.getItemCategories(),
        mastersAPI.getSuppliers()
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
      setSuppliers(suppRes.data);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await mastersAPI.createItem({
        ...formData,
        reorder_level: parseFloat(formData.reorder_level) || 0,
        min_stock: parseFloat(formData.min_stock) || 0,
        max_stock: parseFloat(formData.max_stock) || 0
      });
      toast.success('Item created successfully');
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create item');
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: '',
      item_name: '',
      category_id: '',
      uom: '',
      hsn: '',
      preferred_supplier_id: '',
      reorder_level: 0,
      min_stock: 0,
      max_stock: 0,
      stock_account: '',
      expense_account: '',
      barcode: '',
      remarks: '',
      status: 'Active'
    });
  };

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="item-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Master</h1>
          <p className="text-neutral-600 mt-1">Manage inventory items and their details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-btn">
              <Plus className="h-4 w-4 mr-2" />
              Create Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Item</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="item_code">Item Code *</Label>
                  <Input id="item_code" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} required data-testid="item-code-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="item_name">Item Name *</Label>
                  <Input id="item_name" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} required data-testid="item-name-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category *</Label>
                  <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })} required>
                    <SelectTrigger data-testid="category-select">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="uom">UOM *</Label>
                  <Input id="uom" value={formData.uom} onChange={(e) => setFormData({ ...formData, uom: e.target.value })} required data-testid="uom-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="hsn">HSN Code</Label>
                  <Input id="hsn" value={formData.hsn} onChange={(e) => setFormData({ ...formData, hsn: e.target.value })} data-testid="hsn-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferred_supplier_id">Preferred Supplier</Label>
                  <Select value={formData.preferred_supplier_id} onValueChange={(value) => setFormData({ ...formData, preferred_supplier_id: value })}>
                    <SelectTrigger data-testid="supplier-select">
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reorder_level">Reorder Level</Label>
                  <Input id="reorder_level" type="number" value={formData.reorder_level} onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })} data-testid="reorder-level-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="min_stock">Min Stock</Label>
                  <Input id="min_stock" type="number" value={formData.min_stock} onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })} data-testid="min-stock-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max_stock">Max Stock</Label>
                  <Input id="max_stock" type="number" value={formData.max_stock} onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })} data-testid="max-stock-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="remarks">Remarks</Label>
                <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} rows={3} data-testid="remarks-input" />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
                <Button type="submit" data-testid="submit-item-btn">Create Item</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search items..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="search-items-input" />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Item Code</TableHead>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="font-semibold">UOM</TableHead>
              <TableHead className="font-semibold">Reorder Level</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-500">Loading...</TableCell></TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-neutral-500">No items found</TableCell></TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>{item.uom}</TableCell>
                  <TableCell>{item.reorder_level}</TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-item-${item.id}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-item-${item.id}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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

export default ItemMaster;
