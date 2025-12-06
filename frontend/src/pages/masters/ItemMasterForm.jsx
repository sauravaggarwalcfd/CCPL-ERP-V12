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
    item_code: '', item_name: '', item_type: 'FABRIC', category_id: '', sub_category: '',
    brand_id: '', description: '', barcode: '', stock_uom: '', conversion_uom: '',
    conversion_factor: '1', min_stock_level: '', reorder_qty: '', opening_stock: '',
    opening_rate: '', costing_method: 'FIFO', is_batch_controlled: false,
    is_serial_controlled: false, has_expiry_tracking: false, shelf_life_days: '',
    hsn_code: '', tax_group: '', gst_rate: '', gsm: '', width: '', shade: '',
    composition: '', trim_size: '', trim_color: '', trim_material: '',
    remarks: '', status: 'Active', is_active: true
  });

  useEffect(() => {
    fetchMasterData();
    if (id) fetchItem(id);
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
        item_code: item.item_code, item_name: item.item_name, item_type: item.item_type || 'FABRIC',
        category_id: item.category_id, sub_category: item.sub_category || '', brand_id: item.brand_id || '',
        description: item.description || '', barcode: item.barcode || '',
        stock_uom: item.stock_uom || item.uom, conversion_uom: item.conversion_uom || '',
        conversion_factor: item.conversion_factor?.toString() || '1',
        min_stock_level: item.min_stock_level?.toString() || item.min_stock?.toString() || '',
        reorder_qty: item.reorder_qty?.toString() || item.reorder_level?.toString() || '',
        opening_stock: item.opening_stock?.toString() || '', opening_rate: item.opening_rate?.toString() || '',
        costing_method: item.costing_method || 'FIFO', is_batch_controlled: item.is_batch_controlled || false,
        is_serial_controlled: item.is_serial_controlled || false, has_expiry_tracking: item.has_expiry_tracking || false,
        shelf_life_days: item.shelf_life_days?.toString() || '', hsn_code: item.hsn_code || item.hsn || '',
        tax_group: item.tax_group || '', gst_rate: item.gst_rate?.toString() || '', gsm: item.gsm?.toString() || '',
        width: item.width?.toString() || '', shade: item.shade || '', composition: item.composition || '',
        trim_size: item.trim_size || '', trim_color: item.trim_color || '', trim_material: item.trim_material || '',
        remarks: item.remarks || '', status: item.status, is_active: item.is_active !== false
      });
    } catch (error) {
      toast.error('Failed to load item');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.item_code.trim() || !formData.item_name.trim() || !formData.stock_uom) {
      toast.error('Item Code, Name, and Stock UOM are required');
      return;
    }

    try {
      const payload = {
        ...formData, uom: formData.stock_uom,
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
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/items')} data-testid="back-btn">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-heading font-semibold">{id ? 'Edit' : 'Create'} Item Master</h1>
              <p className="text-sm text-neutral-600">Complete item registration form</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/masters/items')} data-testid="cancel-form-btn">
              <X className="h-4 w-4 mr-2" />Cancel
            </Button>
            <Button type="submit" form="item-form" data-testid="save-form-btn" className="gap-2">
              <Save className="h-4 w-4" />{id ? 'Update' : 'Save'} Item
            </Button>
          </div>
        </div>
      </div>

      <div className="flex">
        <div className="w-64 bg-white border-r border-neutral-200 min-h-screen sticky top-16 self-start">
          <nav className="p-4 space-y-1">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-colors text-left ${activeSection === section.id ? 'bg-primary text-white' : 'text-neutral-700 hover:bg-neutral-100'}`} data-testid={`tab-${section.id}`}>
                <section.icon className="h-4 w-4" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="flex-1 p-8 max-w-6xl">
          <form id="item-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-20">
              <CardHeader className="bg-neutral-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg"><FileText className="h-5 w-5 text-primary" />Product Classification</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="item_code">Item Code *</Label>
                    <Input id="item_code" value={formData.item_code} onChange={(e) => setFormData({ ...formData, item_code: e.target.value })} placeholder="AUTO" required disabled={!!id} className={id ? 'bg-neutral-100' : ''} data-testid="item-code-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_name">Item Name *</Label>
                    <Input id="item_name" value={formData.item_name} onChange={(e) => setFormData({ ...formData, item_name: e.target.value })} placeholder="Enter item name" required data-testid="item-name-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="item_type">Item Type *</Label>
                    <Select value={formData.item_type} onValueChange={(value) => setFormData({ ...formData, item_type: value })}>
                      <SelectTrigger data-testid="item-type-select"><SelectValue /></SelectTrigger>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category_id">Category *</Label>
                    <Select value={formData.category_id} onValueChange={(value) => setFormData({ ...formData, category_id: value })}>
                      <SelectTrigger data-testid="category-select"><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sub_category">Sub-Category</Label>
                    <Input id="sub_category" value={formData.sub_category} onChange={(e) => setFormData({ ...formData, sub_category: e.target.value })} placeholder="e.g., Cotton, Silk" data-testid="sub-category-input" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="details" className="scroll-mt-20">
              <CardHeader className="bg-neutral-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg"><Package className="h-5 w-5 text-primary" />Product Details</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="description">Item Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Detailed item description" rows={3} data-testid="description-input" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <Input id="barcode" value={formData.barcode} onChange={(e) => setFormData({ ...formData, barcode: e.target.value })} placeholder="Scan or enter barcode" data-testid="barcode-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_id">Brand</Label>
                    <Select value={formData.brand_id} onValueChange={(value) => setFormData({ ...formData, brand_id: value })}>
                      <SelectTrigger data-testid="brand-select"><SelectValue placeholder="Select brand" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="brand1">Brand A</SelectItem>
                        <SelectItem value="brand2">Brand B</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="stock" className="scroll-mt-20">
              <CardHeader className="bg-neutral-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg"><TrendingUp className="h-5 w-5 text-primary" />Stock & Inventory Settings</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_uom">Stock UOM *</Label>
                    <Select value={formData.stock_uom} onValueChange={(value) => setFormData({ ...formData, stock_uom: value })}>
                      <SelectTrigger data-testid="stock-uom-select"><SelectValue placeholder="Select UOM" /></SelectTrigger>
                      <SelectContent>{uoms.map(uom => <SelectItem key={uom.id} value={uom.uom_name}>{uom.uom_name} ({uom.symbol})</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversion_uom">Conversion UOM</Label>
                    <Select value={formData.conversion_uom} onValueChange={(value) => setFormData({ ...formData, conversion_uom: value })}>
                      <SelectTrigger data-testid="conversion-uom-select"><SelectValue placeholder="Optional" /></SelectTrigger>
                      <SelectContent>{uoms.map(uom => <SelectItem key={uom.id} value={uom.uom_name}>{uom.uom_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conversion_factor">Conversion Factor</Label>
                    <Input id="conversion_factor" type="number" step="0.001" value={formData.conversion_factor} onChange={(e) => setFormData({ ...formData, conversion_factor: e.target.value })} data-testid="conversion-factor-input" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_stock_level">Min Stock Level</Label>
                    <Input id="min_stock_level" type="number" value={formData.min_stock_level} onChange={(e) => setFormData({ ...formData, min_stock_level: e.target.value })} placeholder="0" data-testid="min-stock-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reorder_qty">Reorder Qty</Label>
                    <Input id="reorder_qty" type="number" value={formData.reorder_qty} onChange={(e) => setFormData({ ...formData, reorder_qty: e.target.value })} placeholder="0" data-testid="reorder-qty-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opening_stock">Opening Stock</Label>
                    <Input id="opening_stock" type="number" value={formData.opening_stock} onChange={(e) => setFormData({ ...formData, opening_stock: e.target.value })} placeholder="0" data-testid="opening-stock-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="opening_rate">Opening Rate</Label>
                    <Input id="opening_rate" type="number" step="0.01" value={formData.opening_rate} onChange={(e) => setFormData({ ...formData, opening_rate: e.target.value })} placeholder="0.00" data-testid="opening-rate-input" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="costing_method">Costing Method</Label>
                    <Select value={formData.costing_method} onValueChange={(value) => setFormData({ ...formData, costing_method: value })}>
                      <SelectTrigger data-testid="costing-method-select"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FIFO">FIFO (First In First Out)</SelectItem>
                        <SelectItem value="AVERAGE">Weighted Average</SelectItem>
                        <SelectItem value="LIFO">LIFO (Last In First Out)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-3 border-t pt-4">
                  <Label className="text-sm font-semibold">Inventory Controls</Label>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_batch_controlled" checked={formData.is_batch_controlled} onCheckedChange={(checked) => setFormData({ ...formData, is_batch_controlled: checked })} data-testid="batch-checkbox" />
                    <Label htmlFor="is_batch_controlled" className="cursor-pointer font-normal">Batch Number Controlled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="is_serial_controlled" checked={formData.is_serial_controlled} onCheckedChange={(checked) => setFormData({ ...formData, is_serial_controlled: checked })} data-testid="serial-checkbox" />
                    <Label htmlFor="is_serial_controlled" className="cursor-pointer font-normal">Serial Number Controlled</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="has_expiry_tracking" checked={formData.has_expiry_tracking} onCheckedChange={(checked) => setFormData({ ...formData, has_expiry_tracking: checked })} data-testid="expiry-checkbox" />
                    <Label htmlFor="has_expiry_tracking" className="cursor-pointer font-normal">Expiry Date Tracking</Label>
                  </div>
                  {formData.has_expiry_tracking && (
                    <div className="space-y-2 ml-6">
                      <Label htmlFor="shelf_life_days">Shelf Life (Days)</Label>
                      <Input id="shelf_life_days" type="number" value={formData.shelf_life_days} onChange={(e) => setFormData({ ...formData, shelf_life_days: e.target.value })} placeholder="365" className="max-w-xs" data-testid="shelf-life-input" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card id="specifications" className="scroll-mt-20">
              <CardHeader className="bg-neutral-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg"><Settings className="h-5 w-5 text-primary" />Product Specification</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {isFabric && (
                  <div className="space-y-4">
                    <Badge variant="outline" className="bg-blue-50 text-blue-900">Fabric Specifications</Badge>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="gsm">GSM</Label>
                        <Input id="gsm" type="number" value={formData.gsm} onChange={(e) => setFormData({ ...formData, gsm: e.target.value })} placeholder="120" data-testid="gsm-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="width">Width (inches)</Label>
                        <Input id="width" type="number" step="0.1" value={formData.width} onChange={(e) => setFormData({ ...formData, width: e.target.value })} placeholder="44" data-testid="width-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="shade">Shade</Label>
                        <Input id="shade" value={formData.shade} onChange={(e) => setFormData({ ...formData, shade: e.target.value })} placeholder="Navy Blue" data-testid="shade-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="composition">Composition</Label>
                        <Input id="composition" value={formData.composition} onChange={(e) => setFormData({ ...formData, composition: e.target.value })} placeholder="100% Cotton" data-testid="composition-input" />
                      </div>
                    </div>
                  </div>
                )}

                {isTrim && (
                  <div className="space-y-4">
                    <Badge variant="outline" className="bg-green-50 text-green-900">Trim Specifications</Badge>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="trim_size">Size</Label>
                        <Input id="trim_size" value={formData.trim_size} onChange={(e) => setFormData({ ...formData, trim_size: e.target.value })} placeholder="15mm" data-testid="trim-size-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trim_color">Color</Label>
                        <Input id="trim_color" value={formData.trim_color} onChange={(e) => setFormData({ ...formData, trim_color: e.target.value })} placeholder="Black" data-testid="trim-color-input" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="trim_material">Material</Label>
                        <Input id="trim_material" value={formData.trim_material} onChange={(e) => setFormData({ ...formData, trim_material: e.target.value })} placeholder="Plastic, Metal" data-testid="trim-material-input" />
                      </div>
                    </div>
                  </div>
                )}

                {!isFabric && !isTrim && (
                  <div className="text-center py-8 text-neutral-500">
                    <p>No specific specifications required for {formData.item_type || 'this item type'}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card id="tax" className="scroll-mt-20">
              <CardHeader className="bg-neutral-50 border-b">
                <CardTitle className="flex items-center gap-2 text-lg"><DollarSign className="h-5 w-5 text-primary" />Tax Code & Accounts</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hsn_code">HSN Code</Label>
                    <Input id="hsn_code" value={formData.hsn_code} onChange={(e) => setFormData({ ...formData, hsn_code: e.target.value })} placeholder="6302" data-testid="hsn-input" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax_group">Tax Group</Label>
                    <Select value={formData.tax_group} onValueChange={(value) => setFormData({ ...formData, tax_group: value })}>
                      <SelectTrigger data-testid="tax-group-select"><SelectValue placeholder="Select" /></SelectTrigger>
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
                      <SelectTrigger data-testid="gst-rate-select"><SelectValue placeholder="Select" /></SelectTrigger>
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
                  <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Additional notes" rows={3} data-testid="remarks-input" />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ItemMasterForm;
