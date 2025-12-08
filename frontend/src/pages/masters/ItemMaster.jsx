import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, Edit, Trash2, Save, X, Package, AlertCircle, History, FileText } from 'lucide-react';
import { toast } from 'sonner';

const ItemMaster = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [auditDialogOpen, setAuditDialogOpen] = useState(false);
  const [selectedItemAudit, setSelectedItemAudit] = useState([]);

  const [formData, setFormData] = useState({
    // Basic Info
    item_code: '',
    item_name: '',
    item_type: 'FABRIC',
    category_id: '',
    sub_category: '',
    brand_id: '',
    description: '',
    
    // Stock Settings
    stock_uom: '',
    conversion_uom: '',
    conversion_factor: '1',
    min_stock_level: '',
    reorder_qty: '',
    opening_stock: '',
    opening_rate: '',
    
    // Costing & Control
    costing_method: 'FIFO',
    is_batch_controlled: false,
    is_serial_controlled: false,
    has_expiry_tracking: false,
    shelf_life_days: '',
    
    // Tax
    hsn_code: '',
    tax_group: '',
    gst_rate: '',
    
    // Fabric Specific
    gsm: '',
    width: '',
    shade: '',
    composition: '',
    
    // Trim Specific
    trim_size: '',
    trim_color: '',
    trim_material: '',
    
    // General
    barcode: '',
    remarks: '',
    status: 'Active',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, catsRes] = await Promise.all([
        mastersAPI.getItems(),
        mastersAPI.getItemCategories()
      ]);
      setItems(itemsRes.data);
      setCategories(catsRes.data);
      // Mock brands
      setBrands([]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.item_code.trim()) {
      toast.error('Item Code is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.item_name.trim()) {
      toast.error('Item Name is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.item_type) {
      toast.error('Item Type is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.category_id) {
      toast.error('Category is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.stock_uom) {
      toast.error('Stock UOM is required');
      setActiveTab('stock');
      return;
    }

    // Check unique item code
    if (!editMode) {
      const exists = items.find(i => i.item_code.toLowerCase() === formData.item_code.toLowerCase());
      if (exists) {
        toast.error('Item Code already exists. Please use a unique code.');
        setActiveTab('basic');
        return;
      }
    }

    // Numeric validations
    if (formData.min_stock_level && parseFloat(formData.min_stock_level) < 0) {
      toast.error('Min Stock Level must be positive');
      return;
    }
    if (formData.opening_stock && parseFloat(formData.opening_stock) < 0) {
      toast.error('Opening Stock must be positive');
      return;
    }
    if (formData.conversion_factor && parseFloat(formData.conversion_factor) <= 0) {
      toast.error('Conversion Factor must be greater than 0');
      return;
    }

    try {
      const payload = {
        ...formData,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
        reorder_qty: parseFloat(formData.reorder_qty) || 0,
        opening_stock: parseFloat(formData.opening_stock) || 0,
        opening_rate: parseFloat(formData.opening_rate) || 0,
        conversion_factor: parseFloat(formData.conversion_factor) || 1,
        gsm: parseFloat(formData.gsm) || null,
        width: parseFloat(formData.width) || null,
        shelf_life_days: parseInt(formData.shelf_life_days) || null,
        created_at: editMode ? undefined : new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      if (editMode) {
        await mastersAPI.updateItem(currentId, payload);
        toast.success('Item updated successfully');
      } else {
        await mastersAPI.createItem(payload);
        toast.success('Item created successfully');
      }
      
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save item');
    }
  };

  const handleEdit = (item) => {
    navigate(`/masters/items/edit/${item.id}`);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await mastersAPI.deleteItem(id);
        toast.success('Item deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Failed to delete item');
      }
    }
  };

  const viewAuditTrail = (item) => {
    // Mock audit trail data
    const mockAudit = [
      { action: 'Created', user: 'Admin User', timestamp: new Date().toISOString(), changes: 'Item created' },
      { action: 'Updated', user: 'Admin User', timestamp: new Date().toISOString(), changes: 'Min stock changed from 10 to 20' }
    ];
    setSelectedItemAudit(mockAudit);
    setAuditDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      item_code: '', item_name: '', item_type: 'FABRIC', category_id: '', sub_category: '',
      brand_id: '', description: '', stock_uom: '', conversion_uom: '', conversion_factor: '1',
      min_stock_level: '', reorder_qty: '', opening_stock: '', opening_rate: '',
      costing_method: 'FIFO', is_batch_controlled: false, is_serial_controlled: false,
      has_expiry_tracking: false, shelf_life_days: '', hsn_code: '', tax_group: '', gst_rate: '',
      gsm: '', width: '', shade: '', composition: '', trim_size: '', trim_color: '',
      trim_material: '', barcode: '', remarks: '', status: 'Active', is_active: true
    });
    setEditMode(false);
    setCurrentId(null);
    setActiveTab('basic');
  };

  const handleBulkImportTemplate = () => {
    // Create CSV template with headers
    const headers = [
      'item_code',
      'item_name',
      'item_type',
      'category_id',
      'uom',
      'purchase_uom',
      'conversion_factor',
      'description',
      'brand',
      'color',
      'size',
      'min_stock',
      'reorder_level',
      'hsn',
      'barcode',
      'is_active',
      'type_specific_attributes_json'
    ];
    
    const sampleRow = [
      'AUTO',
      'Sample Item Name',
      'RM',
      'category_id_here',
      'pcs',
      'box',
      '12',
      'Sample description',
      'Brand Name',
      'Red',
      'Medium',
      '100',
      '50',
      '6302',
      '',
      'true',
      '{"gsm": 180, "width": 60}'
    ];
    
    const csvContent = [
      headers.join(','),
      sampleRow.join(','),
      // Add empty row for user input
      Array(headers.length).fill('').join(',')
    ].join('\n');
    
    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'item_master_bulk_import_template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Bulk import template downloaded successfully');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.item_code.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || item.item_type === filterType;
    
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'active' && item.is_active !== false) ||
      (filterStatus === 'inactive' && item.is_active === false);
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const isFabric = formData.item_type === 'FABRIC';
  const isTrim = formData.item_type === 'TRIM';

  return (
    <div className="space-y-6 w-full max-w-full" data-testid="item-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Master</h1>
          <p className="text-neutral-600 mt-1">Comprehensive garment inventory item management</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={handleBulkImportTemplate}
            data-testid="bulk-import-btn"
          >
            <FileText className="h-4 w-4" />
            Download Bulk Import Template
          </Button>
          <Dialog open={dialogOpen} onOpenChange={(open) => { 
            if (!open) {
              setDialogOpen(false);
              resetForm();
            } else {
              // Navigate to form page instead of opening dialog
              navigate('/masters/items/new');
            }
          }}>
            <DialogTrigger asChild>
              <Button data-testid="create-item-btn" className="gap-2" onClick={() => navigate('/masters/items/new')}>
                <Plus className="h-4 w-4" />
                Create Item
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input
            placeholder="Search items by name or code..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-items-input"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="FABRIC">Fabric</SelectItem>
            <SelectItem value="RM">Raw Material (Trims)</SelectItem>
            <SelectItem value="FG">Finished Goods</SelectItem>
            <SelectItem value="PACKING">Packing</SelectItem>
            <SelectItem value="CONSUMABLE">Consumable</SelectItem>
            <SelectItem value="GENERAL">General</SelectItem>
            <SelectItem value="ACCESSORY">Accessory</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold w-12">Image</TableHead>
              <TableHead className="font-semibold w-32">Item Code</TableHead>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="font-semibold w-28">Type</TableHead>
              <TableHead className="font-semibold w-32">Category</TableHead>
              <TableHead className="font-semibold w-20">UOM</TableHead>
              <TableHead className="font-semibold w-24">Min Stock</TableHead>
              <TableHead className="font-semibold w-28">Controls</TableHead>
              <TableHead className="font-semibold w-20">Status</TableHead>
              <TableHead className="font-semibold text-right w-28">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12 text-neutral-500">Loading items...</TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No items found</p>
                    <p className="text-sm text-neutral-500">Click &quot;Create Item&quot; to add your first item</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="p-2">
                    {item.item_image || item.item_image_preview ? (
                      <img 
                        src={item.item_image_preview || item.item_image || '/placeholder-item.png'} 
                        alt={item.item_name}
                        className="h-10 w-10 object-cover rounded border border-neutral-200"
                      />
                    ) : (
                      <div className="h-10 w-10 bg-neutral-100 rounded border border-neutral-200 flex items-center justify-center">
                        <Package className="h-5 w-5 text-neutral-400" />
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="font-mono text-sm p-2">{item.item_code}</TableCell>
                  <TableCell className="font-medium p-2">{item.item_name}</TableCell>
                  <TableCell className="p-2">
                    <Badge variant="outline" className="text-xs">{item.item_type || 'GENERAL'}</Badge>
                  </TableCell>
                  <TableCell className="p-2">{item.category}</TableCell>
                  <TableCell className="p-2">{item.stock_uom || item.uom}</TableCell>
                  <TableCell className="p-2">{item.min_stock_level || item.reorder_level || '-'}</TableCell>
                  <TableCell className="p-2">
                    <div className="flex gap-1">
                      {item.is_batch_controlled && <Badge variant="secondary" className="text-xs">Batch</Badge>}
                      {item.is_serial_controlled && <Badge variant="secondary" className="text-xs">Serial</Badge>}
                      {item.has_expiry_tracking && <Badge variant="secondary" className="text-xs">Expiry</Badge>}
                    </div>
                  </TableCell>
                  <TableCell className="p-2"><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right p-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => viewAuditTrail(item)} data-testid={`audit-item-${item.id}`}>
                        <History className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} data-testid={`edit-item-${item.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} data-testid={`delete-item-${item.id}`}>
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

      {/* Audit Trail Dialog */}
      <Dialog open={auditDialogOpen} onOpenChange={setAuditDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Audit Trail
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {selectedItemAudit.length > 0 ? (
              selectedItemAudit.map((audit, index) => (
                <Card key={index}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{audit.action}</Badge>
                          <span className="text-sm font-medium">{audit.user}</span>
                        </div>
                        <p className="text-sm text-neutral-600">{audit.changes}</p>
                        <p className="text-xs text-neutral-500">{new Date(audit.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-neutral-500">No audit trail available</div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ItemMaster;