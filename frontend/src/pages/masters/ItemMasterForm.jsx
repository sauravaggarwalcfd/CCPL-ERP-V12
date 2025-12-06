import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Save, X, FileText, Package, Settings, DollarSign, TrendingUp, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const ItemMasterForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [uoms, setUOMs] = useState([]);
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    // Basic Info
    item_code: '',
    item_name: '',
    item_type: 'FABRIC',
    category_id: '',
    sub_category: '',
    brand_id: '',
    description: '',
    barcode: '',
    
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
    remarks: '',
    status: 'Active',
    is_active: true
  });

  useEffect(() => {
    fetchMasterData();
    if (id) {
      fetchItem(id);
    }
  }, [id]);

  const fetchMasterData = async () => {
    try {
      const [catsRes, uomsRes] = await Promise.all([
        mastersAPI.getItemCategories(),
        mastersAPI.getUOMs()
      ]);
      setCategories(catsRes.data || []);
      setUOMs(uomsRes.data || []);
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  const fetchItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await mastersAPI.getItem(itemId);
      const item = response.data;
      setFormData({
        item_code: item.item_code,
        item_name: item.item_name,
        item_type: item.item_type || 'FABRIC',
        category_id: item.category_id,
        sub_category: item.sub_category || '',
        brand_id: item.brand_id || '',
        description: item.description || '',
        barcode: item.barcode || '',
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
        remarks: item.remarks || '',
        status: item.status,
        is_active: item.is_active !== false
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
    if (!formData.item_code.trim()) {
      toast.error('Item Code is required');
      scrollToSection('basic');
      return;
    }
    if (!formData.item_name.trim()) {
      toast.error('Item Name is required');
      scrollToSection('basic');
      return;
    }
    if (!formData.stock_uom) {
      toast.error('Stock UOM is required');
      scrollToSection('stock');
      return;
    }

    try {
      const payload = {
        ...formData,
        uom: formData.stock_uom,
        min_stock_level: parseFloat(formData.min_stock_level) || 0,
        reorder_level: parseFloat(formData.reorder_qty) || 0,
        min_stock: parseFloat(formData.min_stock_level) || 0,
        reorder_qty: parseFloat(formData.reorder_qty) || 0,
        opening_stock: parseFloat(formData.opening_stock) || 0,
        opening_rate: parseFloat(formData.opening_rate) || 0,
        conversion_factor: parseFloat(formData.conversion_factor) || 1,
        gsm: parseFloat(formData.gsm) || null,
        width: parseFloat(formData.width) || null,
        shelf_life_days: parseInt(formData.shelf_life_days) || null
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

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Product Classification', icon: FileText },
    { id: 'details', label: 'Product Details', icon: Package },
    { id: 'stock', label: 'Stock & Inventory', icon: TrendingUp },
    { id: 'specifications', label: 'Product Specification', icon: Settings },
    { id: 'tax', label: 'Tax Code', icon: DollarSign }
  ];

  const isFabric = formData.item_type === 'FABRIC';
  const isTrim = formData.item_type === 'TRIM';

  return (
    <div className=\"min-h-screen bg-neutral-50\">\n      {/* Header */}\n      <div className=\"bg-white border-b border-neutral-200 sticky top-0 z-10\">\n        <div className=\"px-8 py-4 flex items-center justify-between\">\n          <div className=\"flex items-center gap-4\">\n            <Button variant=\"ghost\" size=\"icon\" onClick={() => navigate('/masters/items')} data-testid=\"back-btn\">\n              <ArrowLeft className=\"h-5 w-5\" />\n            </Button>\n            <div>\n              <h1 className=\"text-2xl font-heading font-semibold\">{id ? 'Edit' : 'Create'} Item Master</h1>\n              <p className=\"text-sm text-neutral-600\">Complete item registration form</p>\n            </div>\n          </div>\n          <div className=\"flex gap-2\">\n            <Button type=\"button\" variant=\"outline\" onClick={() => navigate('/masters/items')} data-testid=\"cancel-form-btn\">\n              <X className=\"h-4 w-4 mr-2\" />\n              Cancel\n            </Button>\n            <Button type=\"submit\" form=\"item-form\" data-testid=\"save-form-btn\" className=\"gap-2\">\n              <Save className=\"h-4 w-4\" />\n              {id ? 'Update' : 'Save'} Item\n            </Button>\n          </div>\n        </div>\n      </div>\n\n      <div className=\"flex\">\n        {/* Left Sidebar - Vertical Tabs */}\n        <div className=\"w-64 bg-white border-r border-neutral-200 min-h-screen sticky top-16\">\n          <nav className=\"p-4 space-y-1\">\n            {sections.map((section) => (\n              <button\n                key={section.id}\n                onClick={() => scrollToSection(section.id)}\n                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors text-left ${\n                  activeSection === section.id\n                    ? 'bg-primary text-white'\n                    : 'text-neutral-700 hover:bg-neutral-100'\n                }`}\n                data-testid={`tab-${section.id}`}\n              >\n                <section.icon className=\"h-4 w-4\" />\n                {section.label}\n              </button>\n            ))}\n          </nav>\n        </div>\n\n        {/* Main Content - Form Sections */}\n        <div className=\"flex-1 p-8 max-w-6xl\">\n          <form id=\"item-form\" onSubmit={handleSubmit} className=\"space-y-8\">\n            {/* Product Classification */}\n            <Card id=\"basic\" className=\"scroll-mt-20\">\n              <CardHeader className=\"bg-neutral-50\">\n                <CardTitle className=\"flex items-center gap-2 text-lg\">\n                  <FileText className=\"h-5 w-5 text-primary\" />\n                  Product Classification\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"p-6 space-y-4\">\n                <div className=\"grid grid-cols-3 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"item_code\">Item Code *</Label>\n                    <Input\n                      id=\"item_code\"\n                      value={formData.item_code}\n                      onChange={(e) => setFormData({ ...formData, item_code: e.target.value })}\n                      placeholder=\"AUTO\"\n                      required\n                      disabled={!!id}\n                      className={id ? 'bg-neutral-100' : ''}\n                      data-testid=\"item-code-input\"\n                    />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"item_name\">Item Name *</Label>\n                    <Input\n                      id=\"item_name\"\n                      value={formData.item_name}\n                      onChange={(e) => setFormData({ ...formData, item_name: e.target.value })}\n                      placeholder=\"Enter item name\"\n                      required\n                      data-testid=\"item-name-input\"\n                    />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"item_type\">Item Type *</Label>\n                    <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>\n                      <SelectTrigger data-testid=\"item-type-select\">\n                        <SelectValue />\n                      </SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"FABRIC\">Fabric</SelectItem>\n                        <SelectItem value=\"TRIM\">Trim</SelectItem>\n                        <SelectItem value=\"ACCESSORY\">Accessory</SelectItem>\n                        <SelectItem value=\"PACKING\">Packing</SelectItem>\n                        <SelectItem value=\"GENERAL\">General</SelectItem>\n                        <SelectItem value=\"ASSET\">Asset</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                </div>\n\n                <div className=\"grid grid-cols-3 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"category_id\">Category *</Label>\n                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>\n                      <SelectTrigger data-testid=\"category-select\">\n                        <SelectValue placeholder=\"Select category\" />\n                      </SelectTrigger>\n                      <SelectContent>\n                        {categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}\n                      </SelectContent>\n                    </Select>\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"sub_category\">Sub-Category</Label>\n                    <Input\n                      id=\"sub_category\"\n                      value={formData.sub_category}\n                      onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })}\n                      placeholder=\"e.g., Cotton, Silk\"\n                      data-testid=\"sub-category-input\"\n                    />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"brand_id\">Brand</Label>\n                    <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>\n                      <SelectTrigger data-testid=\"brand-select\">\n                        <SelectValue placeholder=\"Select brand\" />\n                      </SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"brand1\">Brand A</SelectItem>\n                        <SelectItem value=\"brand2\">Brand B</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                </div>\n              </CardContent>\n            </Card>\n\n            {/* Product Details */}\n            <Card id=\"details\" className=\"scroll-mt-20\">\n              <CardHeader className=\"bg-neutral-50\">\n                <CardTitle className=\"flex items-center gap-2 text-lg\">\n                  <Package className=\"h-5 w-5 text-primary\" />\n                  Product Details\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"p-6 space-y-4\">\n                <div className=\"space-y-2\">\n                  <Label htmlFor=\"description\">Item Description</Label>\n                  <Textarea\n                    id=\"description\"\n                    value={formData.description}\n                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}\n                    placeholder=\"Detailed item description\"\n                    rows={3}\n                    data-testid=\"description-input\"\n                  />\n                </div>\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"barcode\">Barcode</Label>\n                    <Input\n                      id=\"barcode\"\n                      value={formData.barcode}\n                      onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}\n                      placeholder=\"Scan or enter barcode\"\n                      data-testid=\"barcode-input\"\n                    />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"status\">Status</Label>\n                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>\n                      <SelectTrigger data-testid=\"status-select\">\n                        <SelectValue />\n                      </SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"Active\">Active</SelectItem>\n                        <SelectItem value=\"Inactive\">Inactive</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                </div>\n              </CardContent>\n            </Card>\n\n            {/* Stock & Inventory */}\n            <Card id=\"stock\" className=\"scroll-mt-20\">\n              <CardHeader className=\"bg-neutral-50\">\n                <CardTitle className=\"flex items-center gap-2 text-lg\">\n                  <TrendingUp className=\"h-5 w-5 text-primary\" />\n                  Stock & Inventory Settings\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"p-6 space-y-4\">\n                <div className=\"grid grid-cols-3 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"stock_uom\">Stock UOM *</Label>\n                    <Select value={formData.stock_uom} onValueChange={(value) => setFormData({ ...formData, stock_uom: value })}>\n                      <SelectTrigger data-testid=\"stock-uom-select\">\n                        <SelectValue placeholder=\"Select UOM\" />\n                      </SelectTrigger>\n                      <SelectContent>\n                        {uoms.map(uom => <SelectItem key={uom.id} value={uom.uom_name}>{uom.uom_name} ({uom.symbol})</SelectItem>)}\n                      </SelectContent>\n                    </Select>\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"conversion_uom\">Conversion UOM</Label>\n                    <Select value={formData.conversion_uom} onValueChange={(value) => setFormData({ ...formData, conversion_uom: value })}>\n                      <SelectTrigger data-testid=\"conversion-uom-select\">\n                        <SelectValue placeholder=\"Optional\" />\n                      </SelectTrigger>\n                      <SelectContent>\n                        {uoms.map(uom => <SelectItem key={uom.id} value={uom.uom_name}>{uom.uom_name}</SelectItem>)}\n                      </SelectContent>\n                    </Select>\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"conversion_factor\">Conversion Factor</Label>\n                    <Input id=\"conversion_factor\" type=\"number\" step=\"0.001\" value={formData.conversion_factor} onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })} data-testid=\"conversion-factor-input\" />\n                  </div>\n                </div>\n\n                <div className=\"grid grid-cols-4 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"min_stock_level\">Min Stock Level</Label>\n                    <Input id=\"min_stock_level\" type=\"number\" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} placeholder=\"0\" data-testid=\"min-stock-input\" />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"reorder_qty\">Reorder Qty</Label>\n                    <Input id=\"reorder_qty\" type=\"number\" value={formData.reorder_qty} onChange={(e) => setFormData({ ...formData, reorder_qty: e.target.value })} placeholder=\"0\" data-testid=\"reorder-qty-input\" />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"opening_stock\">Opening Stock</Label>\n                    <Input id=\"opening_stock\" type=\"number\" value={formData.opening_stock} onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })} placeholder=\"0\" data-testid=\"opening-stock-input\" />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"opening_rate\">Opening Rate</Label>\n                    <Input id=\"opening_rate\" type=\"number\" step=\"0.01\" value={formData.opening_rate} onChange={(e) => setFormData({ ...formData, opening_rate: e.target.value })} placeholder=\"0.00\" data-testid=\"opening-rate-input\" />\n                  </div>\n                </div>\n\n                <div className=\"grid grid-cols-2 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"costing_method\">Costing Method</Label>\n                    <Select value={formData.costing_method} onValueChange={(value) => setFormData({ ...formData, costing_method: value })}>\n                      <SelectTrigger data-testid=\"costing-method-select\"><SelectValue /></SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"FIFO\">FIFO (First In First Out)</SelectItem>\n                        <SelectItem value=\"AVERAGE\">Weighted Average</SelectItem>\n                        <SelectItem value=\"LIFO\">LIFO (Last In First Out)</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                </div>\n\n                <div className=\"space-y-3\">\n                  <Label className=\"text-sm font-semibold\">Inventory Controls</Label>\n                  <div className=\"flex items-center space-x-2\">\n                    <Checkbox id=\"is_batch_controlled\" checked={formData.is_batch_controlled} onCheckedChange={(checked) => setFormData({ ...formData, is_batch_controlled: checked })} data-testid=\"batch-checkbox\" />\n                    <Label htmlFor=\"is_batch_controlled\" className=\"cursor-pointer font-normal\">Batch Number Controlled</Label>\n                  </div>\n                  <div className=\"flex items-center space-x-2\">\n                    <Checkbox id=\"is_serial_controlled\" checked={formData.is_serial_controlled} onCheckedChange={(checked) => setFormData({ ...formData, is_serial_controlled: checked })} data-testid=\"serial-checkbox\" />\n                    <Label htmlFor=\"is_serial_controlled\" className=\"cursor-pointer font-normal\">Serial Number Controlled</Label>\n                  </div>\n                  <div className=\"flex items-center space-x-2\">\n                    <Checkbox id=\"has_expiry_tracking\" checked={formData.has_expiry_tracking} onCheckedChange={(checked) => setFormData({ ...formData, has_expiry_tracking: checked })} data-testid=\"expiry-checkbox\" />\n                    <Label htmlFor=\"has_expiry_tracking\" className=\"cursor-pointer font-normal\">Expiry Date Tracking</Label>\n                  </div>\n                </div>\n\n                {formData.has_expiry_tracking && (\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"shelf_life_days\">Shelf Life (Days)</Label>\n                    <Input id=\"shelf_life_days\" type=\"number\" value={formData.shelf_life_days} onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })} placeholder=\"365\" data-testid=\"shelf-life-input\" />\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n\n            {/* Product Specification */}\n            <Card id=\"specifications\" className=\"scroll-mt-20\">\n              <CardHeader className=\"bg-neutral-50\">\n                <CardTitle className=\"flex items-center gap-2 text-lg\">\n                  <Settings className=\"h-5 w-5 text-primary\" />\n                  Product Specification\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"p-6 space-y-4\">\n                {isFabric && (\n                  <div className=\"space-y-4\">\n                    <div className=\"flex items-center gap-2 mb-2\">\n                      <Badge variant=\"outline\" className=\"bg-blue-50\">Fabric Specifications</Badge>\n                    </div>\n                    <div className=\"grid grid-cols-4 gap-4\">\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"gsm\">GSM</Label>\n                        <Input id=\"gsm\" type=\"number\" value={formData.gsm} onChange={(e) => setFormData({ ...formData, gsm: e.target.value })} placeholder=\"120\" data-testid=\"gsm-input\" />\n                      </div>\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"width\">Width (inches)</Label>\n                        <Input id=\"width\" type=\"number\" step=\"0.1\" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder=\"44\" data-testid=\"width-input\" />\n                      </div>\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"shade\">Shade</Label>\n                        <Input id=\"shade\" value={formData.shade} onChange={(e) => setFormData({ ...formData, shade: e.target.value })} placeholder=\"Navy Blue\" data-testid=\"shade-input\" />\n                      </div>\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"composition\">Composition</Label>\n                        <Input id=\"composition\" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} placeholder=\"100% Cotton\" data-testid=\"composition-input\" />\n                      </div>\n                    </div>\n                  </div>\n                )}\n\n                {isTrim && (\n                  <div className=\"space-y-4\">\n                    <div className=\"flex items-center gap-2 mb-2\">\n                      <Badge variant=\"outline\" className=\"bg-green-50\">Trim Specifications</Badge>\n                    </div>\n                    <div className=\"grid grid-cols-3 gap-4\">\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"trim_size\">Size</Label>\n                        <Input id=\"trim_size\" value={formData.trim_size} onChange={(e) => setFormData({ ...formData, trim_size: e.target.value })} placeholder=\"15mm\" data-testid=\"trim-size-input\" />\n                      </div>\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"trim_color\">Color</Label>\n                        <Input id=\"trim_color\" value={formData.trim_color} onChange={(e) => setFormData({ ...formData, trim_color: e.target.value })} placeholder=\"Black\" data-testid=\"trim-color-input\" />\n                      </div>\n                      <div className=\"space-y-2\">\n                        <Label htmlFor=\"trim_material\">Material</Label>\n                        <Input id=\"trim_material\" value={formData.trim_material} onChange={(e) => setFormData({ ...formData, trim_material: e.target.value })} placeholder=\"Plastic, Metal\" data-testid=\"trim-material-input\" />\n                      </div>\n                    </div>\n                  </div>\n                )}\n\n                {!isFabric && !isTrim && (\n                  <div className=\"text-center py-8 text-neutral-500\">\n                    <p>No specific specifications required for {formData.item_type || 'this item type'}</p>\n                  </div>\n                )}\n              </CardContent>\n            </Card>\n\n            {/* Tax Code */}\n            <Card id=\"tax\" className=\"scroll-mt-20\">\n              <CardHeader className=\"bg-neutral-50\">\n                <CardTitle className=\"flex items-center gap-2 text-lg\">\n                  <DollarSign className=\"h-5 w-5 text-primary\" />\n                  Tax Code & Accounts\n                </CardTitle>\n              </CardHeader>\n              <CardContent className=\"p-6 space-y-4\">\n                <div className=\"grid grid-cols-3 gap-4\">\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"hsn_code\">HSN Code</Label>\n                    <Input id=\"hsn_code\" value={formData.hsn_code} onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })} placeholder=\"6302\" data-testid=\"hsn-input\" />\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"tax_group\">Tax Group</Label>\n                    <Select value={formData.tax_group} onValueChange={(value) => setFormData({ ...formData, tax_group: value })}>\n                      <SelectTrigger data-testid=\"tax-group-select\"><SelectValue placeholder=\"Select\" /></SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"STANDARD\">Standard</SelectItem>\n                        <SelectItem value=\"EXEMPT\">Exempt</SelectItem>\n                        <SelectItem value=\"ZERO_RATED\">Zero Rated</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                  <div className=\"space-y-2\">\n                    <Label htmlFor=\"gst_rate\">GST Rate (%)</Label>\n                    <Select value={formData.gst_rate} onValueChange={(value) => setFormData({ ...formData, gst_rate: value })}>\n                      <SelectTrigger data-testid=\"gst-rate-select\"><SelectValue placeholder=\"Select\" /></SelectTrigger>\n                      <SelectContent>\n                        <SelectItem value=\"0\">0%</SelectItem>\n                        <SelectItem value=\"5\">5%</SelectItem>\n                        <SelectItem value=\"12\">12%</SelectItem>\n                        <SelectItem value=\"18\">18%</SelectItem>\n                        <SelectItem value=\"28\">28%</SelectItem>\n                      </SelectContent>\n                    </Select>\n                  </div>\n                </div>\n\n                <div className=\"space-y-2\">\n                  <Label htmlFor=\"remarks\">Remarks</Label>\n                  <Textarea id=\"remarks\" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder=\"Additional notes\" rows={3} data-testid=\"remarks-input\" />\n                </div>\n              </CardContent>\n            </Card>\n          </form>\n        </div>\n      </div>\n    </div>\n  );\n};\n\nexport default ItemMasterForm;
