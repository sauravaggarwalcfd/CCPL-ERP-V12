import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseAPI, mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, FileText, Package, Users, Calculator, DollarSign, ArrowLeft, Plus, Trash2, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';

const PurchaseOrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [approvedIndents, setApprovedIndents] = useState([]);
  const [activeSection, setActiveSection] = useState('supplier');
  const [showItemPicker, setShowItemPicker] = useState(false);
  const [showIndentPicker, setShowIndentPicker] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState(null);
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [imageSize, setImageSize] = useState('medium');

  const [formData, setFormData] = useState({
    po_number: '',
    indent_id: null,
    indent_number: '',
    supplier_id: '',
    supplier_name: '',
    supplier_contact: '',
    supplier_address: '',
    supplier_gstin: '',
    payment_terms: 'Net 30',
    delivery_date: '',
    delivery_address: '',
    billing_address: '',
    place_of_supply: 'Maharashtra',
    currency: 'INR',
    freight_charges: 0,
    other_charges: 0,
    remarks: '',
    terms_and_conditions: '',
    items: [
      {
        item_id: '', item_code: '', description: '', uom: 'Pieces',
        ordered_quantity: '', rate: '', amount: 0,
        cgst_percent: 9, sgst_percent: 9, igst_percent: 0,
        tax_amount: 0, total_amount: 0, discount_percent: 0,
        discount_amount: 0, specification: '', image_url: null, indent_rate: null
      }
    ]
  });

  useEffect(() => {
    fetchMasterData();
    if (id) fetchOrder(id);
    else generatePONumber();
  }, [id]);

  const generatePONumber = () => {
    const num = `PO-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({ ...prev, po_number: num }));
  };

  const fetchMasterData = async () => {
    try {
      const [itemsRes, suppRes, indentsRes] = await Promise.all([
        mastersAPI.getItems(),
        mastersAPI.getSuppliers(),
        purchaseAPI.getIndents()
      ]);
      setItems(itemsRes.data || []);
      setSuppliers(suppRes.data || []);
      setApprovedIndents((indentsRes.data || []).filter(i => i.status === 'Approved'));
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  const fetchOrder = async (orderId) => {
    try {
      setLoading(true);
      const response = await purchaseAPI.getPO(orderId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const getImageSizes = () => {
    const sizes = {
      small: { form: 'w-16 h-16', picker: 'w-12 h-12' },
      medium: { form: 'w-20 h-20', picker: 'w-16 h-16' },
      large: { form: 'w-24 h-24', picker: 'w-20 h-20' }
    };
    return sizes[imageSize];
  };

  const handleSupplierChange = (supplierId) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    if (supplier) {
      setFormData({
        ...formData,
        supplier_id: supplier.id,
        supplier_name: supplier.name,
        supplier_contact: supplier.phone || '',
        supplier_address: supplier.address || '',
        supplier_gstin: supplier.gst || '',
        payment_terms: supplier.payment_terms || 'Net 30',
        billing_address: supplier.address || ''
      });
      toast.success(`Supplier details auto-filled for ${supplier.name}`);
    }
  };

  const handleCreateFromIndent = (indent) => {
    setFormData({
      ...formData,
      indent_id: indent.id,
      indent_number: indent.indent_number || indent.indent_no,
      items: (indent.items || []).map(item => ({
        item_id: item.item_id,
        item_code: item.item_code,
        description: item.description,
        uom: item.uom,
        ordered_quantity: item.required_quantity,
        rate: item.estimated_rate,
        amount: item.estimated_amount || 0,
        cgst_percent: item.cgst_percent || 9,
        sgst_percent: item.sgst_percent || 9,
        igst_percent: item.igst_percent || 0,
        tax_amount: item.tax_amount || 0,
        total_amount: item.total_amount || 0,
        discount_percent: 0,
        discount_amount: 0,
        specification: item.specification || '',
        image_url: item.image_url || null,
        indent_rate: item.estimated_rate
      }))
    });
    setShowIndentPicker(false);
    toast.success(`PO created from Indent ${indent.indent_number || indent.indent_no}`);
  };

  const handleOpenItemPicker = (index) => {
    setCurrentItemIndex(index);
    setShowItemPicker(true);
    setItemSearchTerm('');
  };

  const handleSelectItem = (selectedItem) => {
    if (currentItemIndex !== null) {
      const newItems = [...formData.items];
      newItems[currentItemIndex] = {
        ...newItems[currentItemIndex],
        item_id: selectedItem.id,
        item_code: selectedItem.item_code,
        description: selectedItem.item_name,
        image_url: selectedItem.image_url || null
      };
      setFormData({ ...formData, items: newItems });
      setShowItemPicker(false);
      setCurrentItemIndex(null);
    }
  };

  const filteredItems = items.filter(item =>
    item.item_code?.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
    item.item_name?.toLowerCase().includes(itemSearchTerm.toLowerCase())
  );

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_id: '', item_code: '', description: '', uom: 'Pieces',
        ordered_quantity: '', rate: '', amount: 0,
        cgst_percent: 9, sgst_percent: 9, igst_percent: 0,
        tax_amount: 0, total_amount: 0, discount_percent: 0,
        discount_amount: 0, specification: '', image_url: null, indent_rate: null
      }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'ordered_quantity' || field === 'rate' ||
        field === 'cgst_percent' || field === 'sgst_percent' || field === 'igst_percent' ||
        field === 'discount_percent') {
      const qty = parseFloat(newItems[index].ordered_quantity) || 0;
      const rate = parseFloat(newItems[index].rate) || 0;
      const baseAmount = qty * rate;
      const discountPercent = parseFloat(newItems[index].discount_percent) || 0;
      const discountAmount = baseAmount * (discountPercent / 100);
      const taxableAmount = baseAmount - discountAmount;
      const cgst = parseFloat(newItems[index].cgst_percent) || 0;
      const sgst = parseFloat(newItems[index].sgst_percent) || 0;
      const igst = parseFloat(newItems[index].igst_percent) || 0;
      const taxAmount = taxableAmount * ((cgst + sgst + igst) / 100);

      newItems[index].amount = baseAmount;
      newItems[index].discount_amount = discountAmount;
      newItems[index].tax_amount = taxAmount;
      newItems[index].total_amount = taxableAmount + taxAmount;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const discount = formData.items.reduce((sum, item) => sum + (item.discount_amount || 0), 0);
    const tax = formData.items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const itemsTotal = formData.items.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    const freight = parseFloat(formData.freight_charges) || 0;
    const other = parseFloat(formData.other_charges) || 0;
    const grandTotal = itemsTotal + freight + other;
    return { subtotal, discount, tax, itemsTotal, freight, other, grandTotal };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier_id || !formData.delivery_date || !formData.delivery_address) {
      toast.error('Supplier, Delivery Date, and Delivery Address are required');
      scrollToSection('supplier');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].item_code) {
      toast.error('Please add at least one item');
      scrollToSection('items');
      return;
    }

    try {
      const totals = calculateTotals();
      const payload = {
        ...formData,
        created_by: 'Current User',
        subtotal: totals.subtotal,
        discount_total: totals.discount,
        tax_total: totals.tax,
        grand_total: totals.grandTotal
      };

      if (id) {
        toast.success('Purchase Order updated successfully');
      } else {
        await purchaseAPI.createPO(payload);
        toast.success('Purchase Order created successfully');
      }
      navigate('/purchase/orders');
    } catch (error) {
      toast.error('Failed to save purchase order');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'supplier', label: 'Supplier Info', icon: Users },
    { id: 'items', label: 'Item Details', icon: Package },
    { id: 'charges', label: 'Additional Charges', icon: DollarSign },
    { id: 'summary', label: 'Summary', icon: Calculator }
  ];

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 border-b border-violet-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-violet-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/orders')} className="text-white hover:bg-violet-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Purchase Order</h1>
              <p className="text-base text-violet-100">Purchase order with supplier and delivery details</p>
              {formData.indent_number && (
                <p className="text-sm text-violet-200 mt-1">From Indent: {formData.indent_number}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 rounded-md p-1">
              <span className="text-xs text-white px-2">Image:</span>
              <Button size="sm" variant={imageSize === 'small' ? 'default' : 'outline'} onClick={() => setImageSize('small')} className="h-7 px-2 text-xs bg-white text-violet-700">S</Button>
              <Button size="sm" variant={imageSize === 'medium' ? 'default' : 'outline'} onClick={() => setImageSize('medium')} className="h-7 px-2 text-xs bg-white text-violet-700">M</Button>
              <Button size="sm" variant={imageSize === 'large' ? 'default' : 'outline'} onClick={() => setImageSize('large')} className="h-7 px-2 text-xs bg-white text-violet-700">L</Button>
            </div>
            {!id && (
              <Button variant="outline" onClick={() => setShowIndentPicker(true)} className="gap-2 bg-white/10 text-white border-white/30 hover:bg-white/20">
                <FileText className="h-4 w-4" />From Indent
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/purchase/orders')} className="bg-white hover:bg-neutral-100 text-violet-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="po-form" size="lg" className="gap-2 bg-white text-violet-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Create'} PO
            </Button>
          </div>
        </div>

        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${activeSection === section.id ? 'border-violet-600 text-violet-700 bg-violet-50' : 'border-transparent text-neutral-600 hover:text-violet-700 hover:bg-violet-50/50'}`} data-testid={`tab-${section.id}`}>
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-full px-8 py-6 mt-4">
        <div className="max-w-full mx-auto">
          <form id="po-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="supplier" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><Users className="h-6 w-6 text-blue-600" />Supplier & Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-blue-900 mb-4 block">PO Number & Supplier</Label>
                  <div className="grid grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="text-base font-medium">PO Number</Label>
                      <Input value={formData.po_number} disabled className="h-11 text-base bg-white font-mono font-semibold" />
                    </div>
                    <div className="col-span-3 space-y-2">
                      <Label htmlFor="supplier" className="text-base font-medium">Supplier *</Label>
                      <Select value={formData.supplier_id} onValueChange={handleSupplierChange}>
                        <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select supplier (auto-fills details)" /></SelectTrigger>
                        <SelectContent>
                          {suppliers.map(sup => <SelectItem key={sup.id} value={sup.id}>{sup.name} - {sup.supplier_code}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Contact</Label>
                    <Input value={formData.supplier_contact} disabled className="h-11 text-base bg-neutral-100" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base font-medium">GSTIN</Label>
                    <Input value={formData.supplier_gstin} disabled className="h-11 text-base bg-neutral-100 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms" className="text-base font-medium">Payment Terms</Label>
                    <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Net 15">Net 15</SelectItem>
                        <SelectItem value="Net 30">Net 30</SelectItem>
                        <SelectItem value="Net 45">Net 45</SelectItem>
                        <SelectItem value="Net 60">Net 60</SelectItem>
                        <SelectItem value="Advance">100% Advance</SelectItem>
                        <SelectItem value="50% Advance">50% Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="delivery_date" className="text-base font-medium">Delivery Date *</Label>
                    <Input id="delivery_date" type="date" value={formData.delivery_date} onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })} required className="h-11 text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="delivery_address" className="text-base font-medium">Delivery Address *</Label>
                    <Textarea id="delivery_address" value={formData.delivery_address} onChange={(e) => setFormData({ ...formData, delivery_address: e.target.value })} placeholder="Delivery location" required rows={2} className="text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing_address" className="text-base font-medium">Billing Address</Label>
                    <Textarea id="billing_address" value={formData.billing_address} onChange={(e) => setFormData({ ...formData, billing_address: e.target.value })} placeholder="Billing location" rows={2} className="text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="place_of_supply" className="text-base font-medium">Place of Supply</Label>
                    <Input id="place_of_supply" value={formData.place_of_supply} onChange={(e) => setFormData({ ...formData, place_of_supply: e.target.value })} placeholder="Maharashtra" className="h-11 text-base" />
                    <Label htmlFor="currency" className="text-base font-medium mt-3">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="items" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl text-green-900"><Package className="h-6 w-6 text-green-600" />Item Details</CardTitle>
                  <Button type="button" onClick={handleAddItem} variant="outline" className="gap-2">
                    <Plus className="h-4 w-4" />Add Item
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-white border-2 border-neutral-200 rounded-lg p-6 relative hover:border-green-300 transition-colors">
                    {formData.items.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} className="absolute top-4 right-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="flex gap-6 mb-5">
                      <div className="flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.description} className={`${getImageSizes().form} object-cover rounded-lg border-2 border-neutral-300`} onError={(e) => { e.target.src = 'https://via.placeholder.com/80?text=No'; }} />
                        ) : (
                          <div className={`${getImageSizes().form} bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-lg border-2 border-dashed border-neutral-300 flex items-center justify-center text-neutral-400`}>
                            <div className="text-center">
                              <Upload className="h-6 w-6 mx-auto mb-1" />
                              <span className="text-xs">No Image</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="space-y-2">
                            <Label className="text-base font-medium">Item Code *</Label>
                            <div className="flex gap-2">
                              <Input value={item.item_code} onChange={(e) => handleItemChange(index, 'item_code', e.target.value)} placeholder="FAB-001" className="h-11 text-base" />
                              <Button type="button" variant="outline" size="icon" onClick={() => handleOpenItemPicker(index)} title="Pick from Masters" className="h-11 w-11">
                                <Search className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="col-span-2 space-y-2">
                            <Label className="text-base font-medium">Description *</Label>
                            <Input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Item description" className="h-11 text-base" />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">UOM *</Label>
                        <Select value={item.uom} onValueChange={(value) => handleItemChange(index, 'uom', value)}>
                          <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Pieces">Pieces</SelectItem>
                            <SelectItem value="Meters">Meters</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                            <SelectItem value="Boxes">Boxes</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Quantity *</Label>
                        <Input type="number" value={item.ordered_quantity} onChange={(e) => handleItemChange(index, 'ordered_quantity', e.target.value)} placeholder="0" className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">
                          Rate (₹) *
                          {item.indent_rate && <span className="text-xs text-blue-600 block">Indent: ₹{item.indent_rate}</span>}
                        </Label>
                        <Input type="number" step="0.01" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', e.target.value)} placeholder="0.00" className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Amount (₹)</Label>
                        <Input type="number" value={(item.amount || 0).toFixed(2)} disabled className="h-11 text-base bg-neutral-100 font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Discount %</Label>
                        <Input type="number" step="0.01" value={item.discount_percent} onChange={(e) => handleItemChange(index, 'discount_percent', e.target.value)} placeholder="0" className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Specification</Label>
                        <Input value={item.specification} onChange={(e) => handleItemChange(index, 'specification', e.target.value)} placeholder="Specs" className="h-11 text-base" />
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-2 border-amber-200 rounded-lg p-5">
                      <Label className="text-sm font-semibold text-amber-900 mb-3 block">Tax & Discount Calculation</Label>
                      <div className="grid grid-cols-7 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Disc Amt</Label>
                          <Input type="number" value={(item.discount_amount || 0).toFixed(2)} disabled className="h-10 text-sm bg-red-100 font-semibold text-red-900" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">CGST %</Label>
                          <Input type="number" step="0.01" value={item.cgst_percent} onChange={(e) => handleItemChange(index, 'cgst_percent', e.target.value)} className="h-10 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">SGST %</Label>
                          <Input type="number" step="0.01" value={item.sgst_percent} onChange={(e) => handleItemChange(index, 'sgst_percent', e.target.value)} className="h-10 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">IGST %</Label>
                          <Input type="number" step="0.01" value={item.igst_percent} onChange={(e) => handleItemChange(index, 'igst_percent', e.target.value)} placeholder="0" className="h-10 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Tax (₹)</Label>
                          <Input type="number" value={(item.tax_amount || 0).toFixed(2)} disabled className="h-10 text-sm bg-amber-100 font-semibold" />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-sm font-semibold">Final Total (₹)</Label>
                          <Input type="number" value={(item.total_amount || 0).toFixed(2)} disabled className="h-10 text-base bg-green-100 font-bold text-green-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="charges" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-xl text-orange-900"><DollarSign className="h-6 w-6 text-orange-600" />Additional Charges</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="freight" className="text-base font-medium">Freight Charges (₹)</Label>
                    <Input id="freight" type="number" step="0.01" value={formData.freight_charges} onChange={(e) => setFormData({ ...formData, freight_charges: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="other" className="text-base font-medium">Other Charges (₹)</Label>
                    <Input id="other" type="number" step="0.01" value={formData.other_charges} onChange={(e) => setFormData({ ...formData, other_charges: parseFloat(e.target.value) || 0 })} placeholder="0.00" className="h-11 text-base" />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="remarks" className="text-base font-medium">Remarks</Label>
                    <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Optional notes" rows={2} className="text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="summary" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><Calculator className="h-6 w-6 text-purple-600" />Purchase Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 rounded-lg border-l-4 border-blue-500 shadow-sm">
                  <div className="grid grid-cols-2 gap-8 mb-6">
                    <div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <span className="text-base font-medium">Subtotal:</span>
                          <span className="text-lg font-semibold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <span className="text-base font-medium text-red-700">Discount:</span>
                          <span className="text-lg font-semibold text-red-700">-₹{totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <span className="text-base font-medium text-amber-700">Total GST:</span>
                          <span className="text-lg font-semibold text-amber-700">₹{totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <span className="text-base font-medium">Freight:</span>
                          <span className="text-lg font-semibold">₹{totals.freight.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-white rounded">
                          <span className="text-base font-medium">Other Charges:</span>
                          <span className="text-lg font-semibold">₹{totals.other.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center p-6 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg border-2 border-green-400">
                    <span className="text-2xl font-bold text-green-900">GRAND TOTAL:</span>
                    <span className="text-4xl font-bold text-green-600">₹{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>

      <Dialog open={showIndentPicker} onOpenChange={setShowIndentPicker}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Approved Indent</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            {approvedIndents.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <div className="text-4xl mb-2">📝</div>
                <p>No approved indents available</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {approvedIndents.map((indent) => (
                  <div key={indent.id} onClick={() => handleCreateFromIndent(indent)} className="p-5 border-2 rounded-lg hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-lg text-blue-900">{indent.indent_number || indent.indent_no}</div>
                        <div className="text-sm text-neutral-600 mt-1">
                          {indent.department} • {indent.items?.length || 0} items • ₹{(indent.estimated_total || 0).toLocaleString('en-IN')}
                        </div>
                        <div className="text-xs text-neutral-500 mt-1">{indent.purpose}</div>
                      </div>
                      <Button size="sm">Create PO</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowIndentPicker(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showItemPicker} onOpenChange={setShowItemPicker}>
        <DialogContent className="max-w-5xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-xl">Select Item from Master</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400" />
                <Input placeholder="Search items..." value={itemSearchTerm} onChange={(e) => setItemSearchTerm(e.target.value)} className="pl-10 h-11" />
              </div>
            </div>
            <div className="max-h-[500px] overflow-y-auto border rounded-lg">
              {filteredItems.length === 0 ? (
                <div className="text-center py-12 text-neutral-500">
                  <div className="text-4xl mb-2">🔍</div>
                  <p>No items found</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3">
                  {filteredItems.map((item) => (
                    <div key={item.id} onClick={() => handleSelectItem(item)} className="flex items-center gap-4 p-4 border-2 rounded-lg hover:bg-blue-50 hover:border-blue-400 cursor-pointer transition">
                      <div className="flex-shrink-0">
                        {item.image_url ? (
                          <img src={item.image_url} alt={item.item_name} className={`${getImageSizes().picker} object-cover rounded border`} onError={(e) => { e.target.src = 'https://via.placeholder.com/64?text=No'; }} />
                        ) : (
                          <div className={`${getImageSizes().picker} bg-neutral-100 rounded border flex items-center justify-center text-neutral-400 text-xs`}>📦</div>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-neutral-900">{item.item_code}</div>
                        <div className="text-sm text-neutral-700">{item.item_name}</div>
                        <Badge variant="outline" className="text-xs mt-1">{item.item_type || 'GENERAL'}</Badge>
                      </div>
                      <Button size="sm" variant="outline">Select</Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => setShowItemPicker(false)}>Cancel</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PurchaseOrderForm;