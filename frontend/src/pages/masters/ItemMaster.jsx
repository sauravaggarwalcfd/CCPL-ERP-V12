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
import { Search, Plus, Edit, Trash2, Save, X, Package, AlertCircle, History } from 'lucide-react';
import { toast } from 'sonner';

const ItemMaster = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
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
    setFormData({
      item_code: item.item_code,
      item_name: item.item_name,
      item_type: item.item_type || 'FABRIC',
      category_id: item.category_id,
      sub_category: item.sub_category || '',
      brand_id: item.brand_id || '',
      description: item.description || '',
      stock_uom: item.stock_uom || item.uom,
      conversion_uom: item.conversion_uom || '',
      conversion_factor: item.conversion_factor?.toString() || '1',
      min_stock_level: item.min_stock_level?.toString() || item.min_stock?.toString() || '',
      reorder_qty: item.reorder_qty?.toString() || item.reorder_level?.toString() || '',
      opening_stock: item.opening_stock?.toString() || '',
      opening_rate: item.opening_rate?.toString() || '',
      costing_method: item.costing_method || 'FIFO',
      is_batch_controlled: item.is_batch_controlled || false,
      is_serial_controlled: item.is_serial_controlled || false,
      has_expiry_tracking: item.has_expiry_tracking || false,
      shelf_life_days: item.shelf_life_days?.toString() || '',
      hsn_code: item.hsn_code || item.hsn || '',
      tax_group: item.tax_group || '',
      gst_rate: item.gst_rate?.toString() || '',
      gsm: item.gsm?.toString() || '',
      width: item.width?.toString() || '',
      shade: item.shade || '',
      composition: item.composition || '',
      trim_size: item.trim_size || '',
      trim_color: item.trim_color || '',
      trim_material: item.trim_material || '',
      barcode: item.barcode || '',
      remarks: item.remarks || '',
      status: item.status,
      is_active: item.is_active !== false
    });
    setCurrentId(item.id);
    setEditMode(true);
    setDialogOpen(true);
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

  const filteredItems = items.filter(item =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isFabric = formData.item_type === 'FABRIC';
  const isTrim = formData.item_type === 'TRIM';

  return (
    <div className="space-y-6" data-testid="item-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Master</h1>
          <p className="text-neutral-600 mt-1">Comprehensive garment inventory item management</p>
        </div>
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
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">{editMode ? 'Edit' : 'Create'} Item Master</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 gap-1">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="stock">Stock & Costing</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="tax">Tax & Accounts</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item_code">Item Code *</Label>
                      <Input
                        id="item_code"
                        value={formData.item_code}
                        onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}
                        placeholder="AUTO"
                        required
                        disabled={editMode}
                        className={editMode ? 'bg-neutral-100' : ''}
                        data-testid="item-code-input"
                      />
                      {editMode && <p className="text-xs text-neutral-500">Item code cannot be changed</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="item_name">Item Name *</Label>
                      <Input
                        id="item_name"
                        value={formData.item_name}
                        onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}
                        placeholder="Enter item name"
                        required
                        data-testid="item-name-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item_type">Item Type *</Label>
                      <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
                        <SelectTrigger data-testid="item-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="FABRIC">Fabric</SelectItem>
                          <SelectItem value="TRIM">Trim</SelectItem>
                          <SelectItem value="ACCESSORY">Accessory</SelectItem>
                          <SelectItem value="PACKING">Packing</SelectItem>
                          <SelectItem value="GENERAL">General</SelectItem>
                          <SelectItem value="ASSET">Asset</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger data-testid="category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="sub_category">Sub-Category</Label>
                      <Input
                        id="sub_category"
                        value={formData.sub_category}
                        onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}
                        placeholder="e.g., Cotton, Silk"
                        data-testid="sub-category-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand_id">Brand</Label>
                      <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                        <SelectTrigger data-testid="brand-select">
                          <SelectValue placeholder="Select brand" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brand1">Brand A</SelectItem>
                          <SelectItem value="brand2">Brand B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="barcode">Barcode</Label>
                      <Input
                        id="barcode"
                        value={formData.barcode}
                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                        placeholder="Scan or enter barcode"
                        data-testid="barcode-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Item description"
                      rows={3}
                      data-testid="description-input"
                    />
                  </div>
                </TabsContent>

                {/* Stock & Costing Tab */}
                <TabsContent value="stock" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_uom">Stock UOM *</Label>
                      <Select value={formData.stock_uom} onValueChange={(value) => setFormData({ ...formData, stock_uom: value })}>
                        <SelectTrigger data-testid="stock-uom-select">
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">Pieces</SelectItem>
                          <SelectItem value="MTR">Meter</SelectItem>
                          <SelectItem value="KG">Kilogram</SelectItem>
                          <SelectItem value="YD">Yard</SelectItem>
                          <SelectItem value="BOX">Box</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conversion_uom">Conversion UOM</Label>
                      <Select value={formData.conversion_uom} onValueChange={(value) => setFormData({ ...formData, conversion_uom: value })}>
                        <SelectTrigger data-testid="conversion-uom-select">
                          <SelectValue placeholder="Optional" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">Pieces</SelectItem>
                          <SelectItem value="MTR">Meter</SelectItem>
                          <SelectItem value="KG">Kilogram</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="conversion_factor">Conversion Factor</Label>
                      <Input
                        id="conversion_factor"
                        type="number"
                        step="0.001"
                        value={formData.conversion_factor}
                        onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })}
                        data-testid="conversion-factor-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="min_stock_level">Min Stock Level</Label>
                      <Input
                        id="min_stock_level"
                        type="number"
                        value={formData.min_stock_level}
                        onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })}
                        placeholder="0"
                        data-testid="min-stock-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reorder_qty">Reorder Quantity</Label>
                      <Input
                        id="reorder_qty"
                        type="number"
                        value={formData.reorder_qty}
                        onChange={(e) => setFormData({ ...formData, reorder_qty: e.target.value })}
                        placeholder="0"
                        data-testid="reorder-qty-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opening_stock">Opening Stock</Label>
                      <Input
                        id="opening_stock"
                        type="number"
                        value={formData.opening_stock}
                        onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })}
                        placeholder="0"
                        data-testid="opening-stock-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="opening_rate">Opening Rate</Label>
                      <Input
                        id="opening_rate"
                        type="number"
                        step="0.01"
                        value={formData.opening_rate}
                        onChange={(e) => setFormData({ ...formData, opening_rate: e.target.value })}
                        placeholder="0.00"
                        data-testid="opening-rate-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="costing_method">Costing Method</Label>
                    <Select value={formData.costing_method} onValueChange={(value) => setFormData({ ...formData, costing_method: value })}>
                      <SelectTrigger data-testid="costing-method-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                        <SelectItem value="AVERAGE">Weighted Average</SelectItem>
                        <SelectItem value="LIFO">LIFO (Last In First Out)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <Label className="text-base font-semibold">Inventory Controls</Label>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_batch_controlled"
                        checked={formData.is_batch_controlled}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_batch_controlled: checked })}
                        data-testid="batch-checkbox"
                      />
                      <Label htmlFor="is_batch_controlled" className="cursor-pointer">Batch Number Controlled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="is_serial_controlled"
                        checked={formData.is_serial_controlled}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_serial_controlled: checked })}
                        data-testid="serial-checkbox"
                      />
                      <Label htmlFor="is_serial_controlled" className="cursor-pointer">Serial Number Controlled</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_expiry_tracking"
                        checked={formData.has_expiry_tracking}
                        onCheckedChange={(checked) => setFormData({ ...formData, has_expiry_tracking: checked })}
                        data-testid="expiry-checkbox"
                      />
                      <Label htmlFor="has_expiry_tracking" className="cursor-pointer">Expiry Date Tracking</Label>
                    </div>
                  </div>

                  {formData.has_expiry_tracking && (
                    <div className="space-y-2">
                      <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
                      <Input
                        id="shelf_life_days"
                        type="number"
                        value={formData.shelf_life_days}
                        onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })}
                        placeholder="365"
                        data-testid="shelf-life-input"
                      />
                    </div>
                  )}
                </TabsContent>

                {/* Specifications Tab */}
                <TabsContent value="specifications" className="space-y-4 mt-4">
                  {isFabric && (
                    <>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-blue-900 mb-3">Fabric Specifications</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="gsm">GSM (Grams per Square Meter)</Label>
                            <Input
                              id="gsm"
                              type="number"
                              value={formData.gsm}
                              onChange={(e) => setFormData({ ...formData, gsm: e.target.value })}
                              placeholder="120"
                              data-testid="gsm-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="width">Width (inches)</Label>
                            <Input
                              id="width"
                              type="number"
                              step="0.1"
                              value={formData.width}
                              onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                              placeholder="44"
                              data-testid="width-input"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-2">
                            <Label htmlFor="shade">Shade</Label>
                            <Input
                              id="shade"
                              value={formData.shade}
                              onChange={(e) => setFormData({ ...formData, shade: e.target.value })}
                              placeholder="Navy Blue"
                              data-testid="shade-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="composition">Composition</Label>
                            <Input
                              id="composition"
                              value={formData.composition}
                              onChange={(e) => setFormData({ ...formData, composition: e.target.value })}
                              placeholder="100% Cotton"
                              data-testid="composition-input"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {isTrim && (
                    <>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                        <h3 className="text-sm font-semibold text-green-900 mb-3">Trim Specifications</h3>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="trim_size">Size</Label>
                            <Input
                              id="trim_size"
                              value={formData.trim_size}
                              onChange={(e) => setFormData({ ...formData, trim_size: e.target.value })}
                              placeholder="S, M, L or dimensions"
                              data-testid="trim-size-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trim_color">Color</Label>
                            <Input
                              id="trim_color"
                              value={formData.trim_color}
                              onChange={(e) => setFormData({ ...formData, trim_color: e.target.value })}
                              placeholder="Black, White"
                              data-testid="trim-color-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="trim_material">Material</Label>
                            <Input
                              id="trim_material"
                              value={formData.trim_material}
                              onChange={(e) => setFormData({ ...formData, trim_material: e.target.value })}
                              placeholder="Plastic, Metal"
                              data-testid="trim-material-input"
                            />
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {!isFabric && !isTrim && (
                    <div className="text-center py-8 text-neutral-500">
                      <p>No specific specifications required for {formData.item_type || 'this item type'}</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tax & Accounts Tab */}
                <TabsContent value="tax" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hsn_code">HSN Code</Label>
                      <Input
                        id="hsn_code"
                        value={formData.hsn_code}
                        onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                        placeholder="6302"
                        data-testid="hsn-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tax_group">Tax Group</Label>
                      <Select value={formData.tax_group} onValueChange={(value) => setFormData({ ...formData, tax_group: value })}>
                        <SelectTrigger data-testid="tax-group-select">
                          <SelectValue placeholder="Select tax group" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="STANDARD">Standard</SelectItem>
                          <SelectItem value="EXEMPT">Exempt</SelectItem>
                          <SelectItem value="ZERO_RATED">Zero Rated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="gst_rate">GST Rate (%)</Label>
                      <Select value={formData.gst_rate} onValueChange={(value) => setFormData({ ...formData, gst_rate: value })}>
                        <SelectTrigger data-testid="gst-rate-select">
                          <SelectValue placeholder="Select rate" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="5">5%</SelectItem>
                          <SelectItem value="12">12%</SelectItem>
                          <SelectItem value="18">18%</SelectItem>
                          <SelectItem value="28">28%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Additional notes"
                      rows={3}
                      data-testid="remarks-input"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} data-testid="cancel-btn">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" data-testid="save-btn" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update' : 'Save'} Item
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
            placeholder="Search items by name or code..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="search-items-input"
          />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Item Code</TableHead>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">UOM</TableHead>
              <TableHead className="font-semibold">Min Stock</TableHead>
              <TableHead className="font-semibold">Controls</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12 text-neutral-500">Loading items...</TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No items found</p>
                    <p className="text-sm text-neutral-500">Click "Create Item" to add your first item</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredItems.map((item) => (
                <TableRow key={item.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{item.item_code}</TableCell>
                  <TableCell className="font-medium">{item.item_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{item.item_type || 'GENERAL'}</Badge>
                  </TableCell>
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.stock_uom || item.uom}</TableCell>
                  <TableCell>{item.min_stock_level || item.reorder_level || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {item.is_batch_controlled && <Badge variant="secondary" className="text-xs">Batch</Badge>}
                      {item.is_serial_controlled && <Badge variant="secondary" className="text-xs">Serial</Badge>}
                      {item.has_expiry_tracking && <Badge variant="secondary" className="text-xs">Expiry</Badge>}
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={item.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
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