import React, { useEffect, useState } from 'react';
import { mastersAPI } from '@/services/inventoryApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Search, Plus, Edit, Trash2, Save, X, Package } from 'lucide-react';
import { toast } from 'sonner';

const ItemMasterPage = () => {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');

  const [formData, setFormData] = useState({
    // Basic Info
    item_code: '',
    item_name: '',
    category_id: '',
    group: '',
    item_type: 'FINISHED_GOODS',
    description: '',
    
    // Purchase Info
    purchase_uom: '',
    default_supplier: '',
    purchase_price: '',
    lead_time_days: '',
    
    // Inventory Settings
    inventory_uom: '',
    uom_conversion: '1',
    maintain_batch: false,
    maintain_serial: false,
    has_expiry: false,
    shelf_life_days: '',
    barcode: '',
    
    // Tax
    is_taxable: true,
    hsn_code: '',
    gst_rate: '',
    tax_category: 'STANDARD',
    
    // Accounts
    stock_account: '',
    cogs_account: '',
    income_account: '',
    expense_account: '',
    
    // Sales
    is_sales_item: true,
    sales_price: '',
    sales_uom: '',
    min_order_qty: '',
    
    // Production
    is_production_item: false,
    has_bom: false,
    bom_link: '',
    production_time_hours: '',
    wip_warehouse: '',
    
    // Quality
    inspection_required: false,
    inspection_type: 'NONE',
    quality_tolerance: '',
    
    // Inventory Control
    reorder_level: '',
    min_stock: '',
    max_stock: '',
    safety_stock: '',
    default_warehouse: '',
    
    // System
    status: 'Active',
    is_active: true,
    remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      setItems([]);
      setCategories([]);
      setUOMs([]);
      setWarehouses([]);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.item_code.trim()) {
      toast.error('Item Code is required');
      return;
    }
    if (!formData.item_name.trim()) {
      toast.error('Item Name is required');
      return;
    }
    if (!formData.category_id) {
      toast.error('Category is required');
      return;
    }
    if (!formData.inventory_uom) {
      toast.error('Inventory UOM is required');
      return;
    }

    // Numeric validations
    if (formData.reorder_level && parseFloat(formData.reorder_level) < 0) {
      toast.error('Reorder level must be positive');
      return;
    }

    try {
      if (editMode) {
        // await mastersAPI.updateItem(currentId, formData);
        toast.success('Item updated successfully');
      } else {
        // await mastersAPI.createItem(formData);
        toast.success('Item created successfully');
      }
      setDialogOpen(false);
      fetchData();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save item');
    }
  };

  const resetForm = () => {
    setFormData({
      item_code: '', item_name: '', category_id: '', group: '', item_type: 'FINISHED_GOODS',
      description: '', purchase_uom: '', default_supplier: '', purchase_price: '',
      lead_time_days: '', inventory_uom: '', uom_conversion: '1', maintain_batch: false,
      maintain_serial: false, has_expiry: false, shelf_life_days: '', barcode: '',
      is_taxable: true, hsn_code: '', gst_rate: '', tax_category: 'STANDARD',
      stock_account: '', cogs_account: '', income_account: '', expense_account: '',
      is_sales_item: true, sales_price: '', sales_uom: '', min_order_qty: '',
      is_production_item: false, has_bom: false, bom_link: '', production_time_hours: '',
      wip_warehouse: '', inspection_required: false, inspection_type: 'NONE',
      quality_tolerance: '', reorder_level: '', min_stock: '', max_stock: '',
      safety_stock: '', default_warehouse: '', status: 'Active', is_active: true, remarks: ''
    });
    setEditMode(false);
    setCurrentId(null);
    setActiveTab('basic');
  };

  const filteredItems = items.filter(item =>
    item.item_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.item_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="item-master-page">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Item Master</h1>
          <p className="text-neutral-600 mt-1">Comprehensive item management with full ERP specifications</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-item-btn" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">
                {editMode ? 'Edit' : 'Create'} Item Master
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 lg:grid-cols-9 gap-1">
                  <TabsTrigger value="basic">Basic</TabsTrigger>
                  <TabsTrigger value="purchase">Purchase</TabsTrigger>
                  <TabsTrigger value="inventory">Inventory</TabsTrigger>
                  <TabsTrigger value="tax">Tax</TabsTrigger>
                  <TabsTrigger value="accounts">Accounts</TabsTrigger>
                  <TabsTrigger value="sales">Sales</TabsTrigger>
                  <TabsTrigger value="production">Production</TabsTrigger>
                  <TabsTrigger value="quality">Quality</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
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
                        data-testid="item-code-input"
                      />
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

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category_id">Category *</Label>
                      <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                        <SelectTrigger data-testid="category-select">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cat1">Raw Materials</SelectItem>
                          <SelectItem value="cat2">Finished Goods</SelectItem>
                          <SelectItem value="cat3">Consumables</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="group">Group</Label>
                      <Input
                        id="group"
                        value={formData.group}
                        onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                        placeholder="Item group"
                        data-testid="group-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="item_type">Item Type</Label>
                      <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
                        <SelectTrigger data-testid="item-type-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="RAW_MATERIAL">Raw Material</SelectItem>
                          <SelectItem value="SEMI_FINISHED">Semi-Finished</SelectItem>
                          <SelectItem value="FINISHED_GOODS">Finished Goods</SelectItem>
                          <SelectItem value="CONSUMABLE">Consumable</SelectItem>
                          <SelectItem value="SERVICE">Service</SelectItem>
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

                {/* Purchase Info Tab */}
                <TabsContent value="purchase" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="purchase_uom">Purchase UOM</Label>
                      <Select value={formData.purchase_uom} onValueChange={(value) => setFormData({ ...formData, purchase_uom: value })}>
                        <SelectTrigger data-testid="purchase-uom-select">
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">Pieces</SelectItem>
                          <SelectItem value="KG">Kilogram</SelectItem>
                          <SelectItem value="MTR">Meter</SelectItem>
                          <SelectItem value="BOX">Box</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="purchase_price">Purchase Price</Label>
                      <Input
                        id="purchase_price"
                        type="number"
                        step="0.01"
                        value={formData.purchase_price}
                        onChange={(e) => setFormData({ ...formData, purchase_price: e.target.value })}
                        placeholder="0.00"
                        data-testid="purchase-price-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="default_supplier">Default Supplier</Label>
                      <Select value={formData.default_supplier} onValueChange={(value) => setFormData({ ...formData, default_supplier: value })}>
                        <SelectTrigger data-testid="supplier-select">
                          <SelectValue placeholder="Select supplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sup1">Supplier A</SelectItem>
                          <SelectItem value="sup2">Supplier B</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                      <Input
                        id="lead_time_days"
                        type="number"
                        value={formData.lead_time_days}
                        onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                        placeholder="0"
                        data-testid="lead-time-input"
                      />
                    </div>
                  </div>
                </TabsContent>

                {/* Inventory Settings Tab */}
                <TabsContent value="inventory" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="inventory_uom">Inventory UOM *</Label>
                      <Select value={formData.inventory_uom} onValueChange={(value) => setFormData({ ...formData, inventory_uom: value })}>
                        <SelectTrigger data-testid="inventory-uom-select">
                          <SelectValue placeholder="Select UOM" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PCS">Pieces</SelectItem>
                          <SelectItem value="KG">Kilogram</SelectItem>
                          <SelectItem value="MTR">Meter</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="uom_conversion">UOM Conversion Factor</Label>
                      <Input
                        id="uom_conversion"
                        type="number"
                        step="0.001"
                        value={formData.uom_conversion}
                        onChange={(e) => setFormData({ ...formData, uom_conversion: e.target.value })}
                        data-testid="conversion-input"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="reorder_level">Reorder Level</Label>
                      <Input
                        id="reorder_level"
                        type="number"
                        value={formData.reorder_level}
                        onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                        placeholder="0"
                        data-testid="reorder-level-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="min_stock">Min Stock</Label>
                      <Input
                        id="min_stock"
                        type="number"
                        value={formData.min_stock}
                        onChange={(e) => setFormData({ ...formData, min_stock: e.target.value })}
                        placeholder="0"
                        data-testid="min-stock-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_stock">Max Stock</Label>
                      <Input
                        id="max_stock"
                        type="number"
                        value={formData.max_stock}
                        onChange={(e) => setFormData({ ...formData, max_stock: e.target.value })}
                        placeholder="0"
                        data-testid="max-stock-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="safety_stock">Safety Stock</Label>
                      <Input
                        id="safety_stock"
                        type="number"
                        value={formData.safety_stock}
                        onChange={(e) => setFormData({ ...formData, safety_stock: e.target.value })}
                        placeholder="0"
                        data-testid="safety-stock-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-3 border-t pt-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maintain_batch"
                        checked={formData.maintain_batch}
                        onCheckedChange={(checked) => setFormData({ ...formData, maintain_batch: checked })}
                        data-testid="batch-checkbox"
                      />
                      <Label htmlFor="maintain_batch" className="cursor-pointer">Maintain Batch Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="maintain_serial"
                        checked={formData.maintain_serial}
                        onCheckedChange={(checked) => setFormData({ ...formData, maintain_serial: checked })}
                        data-testid="serial-checkbox"
                      />
                      <Label htmlFor="maintain_serial" className="cursor-pointer">Maintain Serial Numbers</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="has_expiry"
                        checked={formData.has_expiry}
                        onCheckedChange={(checked) => setFormData({ ...formData, has_expiry: checked })}
                        data-testid="expiry-checkbox"
                      />
                      <Label htmlFor="has_expiry" className="cursor-pointer">Has Expiry Date</Label>
                    </div>
                  </div>

                  {formData.has_expiry && (
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

                  <div className="space-y-2">
                    <Label htmlFor="default_warehouse">Default Warehouse</Label>
                    <Select value={formData.default_warehouse} onValueChange={(value) => setFormData({ ...formData, default_warehouse: value })}>
                      <SelectTrigger data-testid="warehouse-select">
                        <SelectValue placeholder="Select warehouse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wh1">Main Warehouse</SelectItem>
                        <SelectItem value="wh2">Secondary Warehouse</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>

                {/* Tax Tab */}
                <TabsContent value="tax" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_taxable"
                      checked={formData.is_taxable}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_taxable: checked })}
                      data-testid="taxable-checkbox"
                    />
                    <Label htmlFor="is_taxable" className="cursor-pointer">Is Taxable</Label>
                  </div>

                  {formData.is_taxable && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="hsn_code">HSN Code</Label>
                          <Input
                            id="hsn_code"
                            value={formData.hsn_code}
                            onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })}
                            placeholder="Enter HSN code"
                            data-testid="hsn-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="gst_rate">GST Rate (%)</Label>
                          <Select value={formData.gst_rate} onValueChange={(value) => setFormData({ ...formData, gst_rate: value })}>
                            <SelectTrigger data-testid="gst-rate-select">
                              <SelectValue placeholder="Select GST rate" />
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
                        <Label htmlFor="tax_category">Tax Category</Label>
                        <Select value={formData.tax_category} onValueChange={(value) => setFormData({ ...formData, tax_category: value })}>
                          <SelectTrigger data-testid="tax-category-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="STANDARD">Standard</SelectItem>
                            <SelectItem value="EXEMPT">Exempt</SelectItem>
                            <SelectItem value="ZERO_RATED">Zero Rated</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="stock_account">Stock Account</Label>
                      <Select value={formData.stock_account} onValueChange={(value) => setFormData({ ...formData, stock_account: value })}>
                        <SelectTrigger data-testid="stock-account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="acc1">Stock - Raw Materials</SelectItem>
                          <SelectItem value="acc2">Stock - Finished Goods</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cogs_account">COGS Account</Label>
                      <Select value={formData.cogs_account} onValueChange={(value) => setFormData({ ...formData, cogs_account: value })}>
                        <SelectTrigger data-testid="cogs-account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cogs1">Cost of Goods Sold</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="income_account">Income Account</Label>
                      <Select value={formData.income_account} onValueChange={(value) => setFormData({ ...formData, income_account: value })}>
                        <SelectTrigger data-testid="income-account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="inc1">Sales Revenue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expense_account">Expense Account</Label>
                      <Select value={formData.expense_account} onValueChange={(value) => setFormData({ ...formData, expense_account: value })}>
                        <SelectTrigger data-testid="expense-account-select">
                          <SelectValue placeholder="Select account" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="exp1">Purchase Expense</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Sales Tab */}
                <TabsContent value="sales" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_sales_item"
                      checked={formData.is_sales_item}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_sales_item: checked })}
                      data-testid="sales-item-checkbox"
                    />
                    <Label htmlFor="is_sales_item" className="cursor-pointer">Is Sales Item</Label>
                  </div>

                  {formData.is_sales_item && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="sales_price">Sales Price</Label>
                          <Input
                            id="sales_price"
                            type="number"
                            step="0.01"
                            value={formData.sales_price}
                            onChange={(e) => setFormData({ ...formData, sales_price: e.target.value })}
                            placeholder="0.00"
                            data-testid="sales-price-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="sales_uom">Sales UOM</Label>
                          <Select value={formData.sales_uom} onValueChange={(value) => setFormData({ ...formData, sales_uom: value })}>
                            <SelectTrigger data-testid="sales-uom-select">
                              <SelectValue placeholder="Select UOM" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PCS">Pieces</SelectItem>
                              <SelectItem value="BOX">Box</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="min_order_qty">Minimum Order Quantity</Label>
                        <Input
                          id="min_order_qty"
                          type="number"
                          value={formData.min_order_qty}
                          onChange={(e) => setFormData({ ...formData, min_order_qty: e.target.value })}
                          placeholder="1"
                          data-testid="min-order-qty-input"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Production Tab */}
                <TabsContent value="production" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="is_production_item"
                      checked={formData.is_production_item}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_production_item: checked })}
                      data-testid="production-item-checkbox"
                    />
                    <Label htmlFor="is_production_item" className="cursor-pointer">Is Production Item</Label>
                  </div>

                  {formData.is_production_item && (
                    <>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="has_bom"
                          checked={formData.has_bom}
                          onCheckedChange={(checked) => setFormData({ ...formData, has_bom: checked })}
                          data-testid="bom-checkbox"
                        />
                        <Label htmlFor="has_bom" className="cursor-pointer">Has Bill of Materials (BOM)</Label>
                      </div>

                      {formData.has_bom && (
                        <div className="space-y-2">
                          <Label htmlFor="bom_link">BOM Link</Label>
                          <Input
                            id="bom_link"
                            value={formData.bom_link}
                            onChange={(e) => setFormData({ ...formData, bom_link: e.target.value })}
                            placeholder="BOM reference or link"
                            data-testid="bom-link-input"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="production_time_hours">Production Time (Hours)</Label>
                          <Input
                            id="production_time_hours"
                            type="number"
                            step="0.5"
                            value={formData.production_time_hours}
                            onChange={(e) => setFormData({ ...formData, production_time_hours: e.target.value })}
                            placeholder="0"
                            data-testid="production-time-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="wip_warehouse">WIP Warehouse</Label>
                          <Select value={formData.wip_warehouse} onValueChange={(value) => setFormData({ ...formData, wip_warehouse: value })}>
                            <SelectTrigger data-testid="wip-warehouse-select">
                              <SelectValue placeholder="Select warehouse" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="wip1">WIP - Production Floor</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* Quality Tab */}
                <TabsContent value="quality" className="space-y-4 mt-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="inspection_required"
                      checked={formData.inspection_required}
                      onCheckedChange={(checked) => setFormData({ ...formData, inspection_required: checked })}
                      data-testid="inspection-checkbox"
                    />
                    <Label htmlFor="inspection_required" className="cursor-pointer">Inspection Required</Label>
                  </div>

                  {formData.inspection_required && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="inspection_type">Inspection Type</Label>
                        <Select value={formData.inspection_type} onValueChange={(value) => setFormData({ ...formData, inspection_type: value })}>
                          <SelectTrigger data-testid="inspection-type-select">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="INCOMING">Incoming Inspection</SelectItem>
                            <SelectItem value="IN_PROCESS">In-Process Inspection</SelectItem>
                            <SelectItem value="FINAL">Final Inspection</SelectItem>
                            <SelectItem value="ALL">All Stages</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="quality_tolerance">Quality Tolerance (%)</Label>
                        <Input
                          id="quality_tolerance"
                          type="number"
                          step="0.1"
                          value={formData.quality_tolerance}
                          onChange={(e) => setFormData({ ...formData, quality_tolerance: e.target.value })}
                          placeholder="0"
                          data-testid="quality-tolerance-input"
                        />
                      </div>
                    </>
                  )}
                </TabsContent>

                {/* System Tab */}
                <TabsContent value="system" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                        <SelectTrigger data-testid="status-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Active">Active</SelectItem>
                          <SelectItem value="Inactive">Inactive</SelectItem>
                          <SelectItem value="Discontinued">Discontinued</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-center space-x-2 pt-8">
                      <Checkbox
                        id="is_active"
                        checked={formData.is_active}
                        onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                        data-testid="active-checkbox"
                      />
                      <Label htmlFor="is_active" className="cursor-pointer">Is Active</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Additional notes or comments"
                      rows={4}
                      data-testid="remarks-input"
                    />
                  </div>
                </TabsContent>
              </Tabs>

              {/* Form Actions */}
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

      {/* Search */}
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

      {/* Items Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Item Code</TableHead>
              <TableHead className="font-semibold">Item Name</TableHead>
              <TableHead className="font-semibold">Category</TableHead>
              <TableHead className="font-semibold">Type</TableHead>
              <TableHead className="font-semibold">UOM</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-neutral-500">
                  Loading items...
                </TableCell>
              </TableRow>
            ) : filteredItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
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
                  <TableCell>{item.category}</TableCell>
                  <TableCell>{item.item_type}</TableCell>
                  <TableCell>{item.inventory_uom}</TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium ${
                      item.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-item-${item.id}`}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-item-${item.id}`}>
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

export default ItemMasterPage;