import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { purchaseAPI, mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, FileText, Package, Users, Calculator, ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const PurchaseIndentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [activeSection, setActiveSection] = useState('header');

  const [formData, setFormData] = useState({
    indent_number: '',
    department: '',
    priority: 'Normal',
    purpose: '',
    budget_head: '',
    justification: '',
    items: [
      {
        item_code: '',
        description: '',
        uom: 'Pieces',
        required_quantity: '',
        required_date: '',
        estimated_rate: '',
        estimated_amount: 0,
        cgst_percent: 9,
        sgst_percent: 9,
        tax_amount: 0,
        total_amount: 0,
        specification: ''
      }
    ]
  });

  useEffect(() => {
    fetchMasterData();
    if (id) fetchIndent(id);
    else generateIndentNumber();
  }, [id]);

  const generateIndentNumber = () => {
    const num = `IND-${Date.now().toString().slice(-6)}`;
    setFormData(prev => ({ ...prev, indent_number: num }));
  };

  const fetchMasterData = async () => {
    try {
      const [itemsRes, suppRes] = await Promise.all([
        mastersAPI.getItems(),
        mastersAPI.getSuppliers()
      ]);
      setItems(itemsRes.data || []);
      setSuppliers(suppRes.data || []);
    } catch (error) {
      toast.error('Failed to load master data');
    }
  };

  const fetchIndent = async (indentId) => {
    try {
      setLoading(true);
      const response = await purchaseAPI.getIndent(indentId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load indent');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, {
        item_code: '', description: '', uom: 'Pieces', required_quantity: '',
        required_date: '', estimated_rate: '', estimated_amount: 0,
        cgst_percent: 9, sgst_percent: 9, tax_amount: 0, total_amount: 0, specification: ''
      }]
    });
  };

  const handleRemoveItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;

    if (field === 'required_quantity' || field === 'estimated_rate' || field === 'cgst_percent' || field === 'sgst_percent') {
      const qty = parseFloat(newItems[index].required_quantity) || 0;
      const rate = parseFloat(newItems[index].estimated_rate) || 0;
      const baseAmount = qty * rate;
      const cgst = parseFloat(newItems[index].cgst_percent) || 0;
      const sgst = parseFloat(newItems[index].sgst_percent) || 0;
      const taxAmount = baseAmount * ((cgst + sgst) / 100);

      newItems[index].estimated_amount = baseAmount;
      newItems[index].tax_amount = taxAmount;
      newItems[index].total_amount = baseAmount + taxAmount;
    }

    setFormData({ ...formData, items: newItems });
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.estimated_amount || 0), 0);
    const tax = formData.items.reduce((sum, item) => sum + (item.tax_amount || 0), 0);
    const total = formData.items.reduce((sum, item) => sum + (item.total_amount || 0), 0);
    return { subtotal, tax, total };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.department || !formData.purpose) {
      toast.error('Department and Purpose are required');
      return;
    }
    if (formData.items.length === 0 || !formData.items[0].item_code) {
      toast.error('Please add at least one item');
      return;
    }

    try {
      const payload = { ...formData, requested_by: 'Current User' };
      if (id) {
        toast.success('Indent updated successfully');
      } else {
        await purchaseAPI.createIndent(payload);
        toast.success('Indent created successfully');
      }
      navigate('/purchase/indents');
    } catch (error) {
      toast.error('Failed to save indent');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'header', label: 'Header Info', icon: FileText },
    { id: 'items', label: 'Item Details', icon: Package },
    { id: 'summary', label: 'Summary', icon: Calculator }
  ];

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-violet-600 to-violet-700 border-b border-violet-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-violet-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/purchase/indents')} className="text-white hover:bg-violet-700" data-testid="back-btn">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Purchase Indent</h1>
              <p className="text-base text-violet-100">Purchase requisition and approval request</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/purchase/indents')} className="bg-white hover:bg-neutral-100 text-violet-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="indent-form" size="lg" className="gap-2 bg-white text-violet-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Indent
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
          <form id="indent-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="header" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Header Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Indent Number</Label>
                    <Input value={formData.indent_number} disabled className="h-11 text-base bg-neutral-100 font-mono" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-base font-medium">Department *</Label>
                    <Input id="department" value={formData.department} onChange={(e) => setFormData({ ...formData, department: e.target.value })} placeholder="e.g., Production" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-base font-medium">Priority</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Urgent">🔴 Urgent</SelectItem>
                        <SelectItem value="High">🟠 High</SelectItem>
                        <SelectItem value="Normal">🔵 Normal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="budget_head" className="text-base font-medium">Budget Head</Label>
                    <Input id="budget_head" value={formData.budget_head} onChange={(e) => setFormData({ ...formData, budget_head: e.target.value })} placeholder="e.g., Raw Materials" className="h-11 text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="purpose" className="text-base font-medium">Purpose *</Label>
                    <Textarea id="purpose" value={formData.purpose} onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} placeholder="Reason for requisition" required rows={2} className="text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="justification" className="text-base font-medium">Justification</Label>
                    <Textarea id="justification" value={formData.justification} onChange={(e) => setFormData({ ...formData, justification: e.target.value })} placeholder="Additional justification" rows={2} className="text-base" />
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
                  <div key={index} className="bg-neutral-50 border border-neutral-200 rounded-lg p-6 relative">
                    {formData.items.length > 1 && (
                      <Button type="button" variant="destructive" size="sm" onClick={() => handleRemoveItem(index)} className="absolute top-4 right-4">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Item Code *</Label>
                        <Select value={item.item_code} onValueChange={(value) => handleItemChange(index, 'item_code', value)}>
                          <SelectTrigger className="h-11 text-base"><SelectValue placeholder="Select item" /></SelectTrigger>
                          <SelectContent>
                            {items.map(it => <SelectItem key={it.id} value={it.item_code}>{it.item_code} - {it.item_name}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="col-span-2 space-y-2">
                        <Label className="text-base font-medium">Description *</Label>
                        <Input value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} placeholder="Item description" className="h-11 text-base" />
                      </div>
                    </div>

                    <div className="grid grid-cols-6 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label className="text-base font-medium">UOM</Label>
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
                        <Input type="number" value={item.required_quantity} onChange={(e) => handleItemChange(index, 'required_quantity', e.target.value)} placeholder="0" className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Rate (₹) *</Label>
                        <Input type="number" step="0.01" value={item.estimated_rate} onChange={(e) => handleItemChange(index, 'estimated_rate', e.target.value)} placeholder="0.00" className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Amount (₹)</Label>
                        <Input type="number" value={(item.estimated_amount || 0).toFixed(2)} disabled className="h-11 text-base bg-neutral-100 font-semibold" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Required Date</Label>
                        <Input type="date" value={item.required_date} onChange={(e) => handleItemChange(index, 'required_date', e.target.value)} className="h-11 text-base" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-base font-medium">Specification</Label>
                        <Input value={item.specification} onChange={(e) => handleItemChange(index, 'specification', e.target.value)} placeholder="Specs" className="h-11 text-base" />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded p-4">
                      <Label className="text-sm font-semibold text-amber-900 mb-3 block">GST Details</Label>
                      <div className="grid grid-cols-5 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">CGST %</Label>
                          <Input type="number" step="0.01" value={item.cgst_percent} onChange={(e) => handleItemChange(index, 'cgst_percent', e.target.value)} className="h-10 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">SGST %</Label>
                          <Input type="number" step="0.01" value={item.sgst_percent} onChange={(e) => handleItemChange(index, 'sgst_percent', e.target.value)} className="h-10 text-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Tax Amount (₹)</Label>
                          <Input type="number" value={(item.tax_amount || 0).toFixed(2)} disabled className="h-10 text-sm bg-amber-100 font-semibold" />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label className="text-sm font-semibold">Total with GST (₹)</Label>
                          <Input type="number" value={(item.total_amount || 0).toFixed(2)} disabled className="h-10 text-base bg-green-100 font-bold text-green-900" />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card id="summary" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><Calculator className="h-6 w-6 text-purple-600" />Summary</CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border-l-4 border-blue-500">
                  <div className="grid grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Total Items</div>
                      <div className="text-2xl font-bold text-blue-900">{formData.items.length}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Subtotal</div>
                      <div className="text-2xl font-semibold">₹{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Total GST</div>
                      <div className="text-2xl font-semibold text-amber-600">₹{totals.tax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                    <div>
                      <div className="text-sm text-neutral-600 mb-1">Grand Total</div>
                      <div className="text-3xl font-bold text-green-600">₹{totals.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PurchaseIndentForm;