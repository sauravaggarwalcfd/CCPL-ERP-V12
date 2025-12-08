import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, Building2, CreditCard, TruckIcon, Star, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const SupplierForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    supplier_code: '', vendor_code: '', name: '', supplier_group: 'DOMESTIC',
    gst: '', pan: '', contact_person: '', phone: '', email: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
    payment_terms: 'NET_30', credit_days: '30', currency: 'INR',
    bank_name: '', bank_account: '', bank_ifsc: '', bank_branch: '',
    transporter_name: '', transport_mode: 'ROAD', supplier_rating: '3',
    lead_time_days: '', remarks: '', status: 'Active'
  });

  useEffect(() => {
    if (id) fetchSupplier(id);
    else generateSupplierCode();
  }, [id]);

  const generateSupplierCode = () => {
    const code = `SUP-${Date.now().toString().slice(-4)}`;
    setFormData(prev => ({ ...prev, supplier_code: code }));
  };

  const fetchSupplier = async (supplierId) => {
    try {
      const response = await mastersAPI.getSupplier(supplierId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load supplier');
    }
  };

  const validateGST = (gst) => {
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstPattern.test(gst);
  };

  const validatePAN = (pan) => {
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier_code.trim() || !formData.name.trim()) {
      toast.error('Supplier Code and Name are required');
      return;
    }

    if (formData.gst && !validateGST(formData.gst)) {
      toast.error('Invalid GST format. Format: 29XXXXX1234X1ZX (15 characters)');
      return;
    }

    if (formData.pan && !validatePAN(formData.pan)) {
      toast.error('Invalid PAN format. Format: ABCDE1234F (10 characters)');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      const payload = {
        ...formData,
        credit_days: parseInt(formData.credit_days) || 0,
        lead_time_days: parseInt(formData.lead_time_days) || 0,
        supplier_rating: parseInt(formData.supplier_rating) || 3
      };

      if (id) {
        toast.success('Supplier updated successfully');
      } else {
        await mastersAPI.createSupplier(payload);
        toast.success('Supplier created successfully');
      }
      navigate('/masters/suppliers');
    } catch (error) {
      toast.error('Failed to save supplier');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'payment', label: 'Payment & Terms', icon: CreditCard },
    { id: 'banking', label: 'Banking & Transport', icon: TruckIcon },
    { id: 'rating', label: 'Rating & Lead Time', icon: Star }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/suppliers')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Supplier Master</h1>
              <p className="text-base text-emerald-100">Supplier details with GST validation</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/suppliers')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="supplier-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Supplier
            </Button>
          </div>
        </div>

        <div className="px-8 bg-white">
          <nav className="flex gap-3 overflow-x-auto">
            {sections.map((section) => (
              <button key={section.id} onClick={() => scrollToSection(section.id)} className={`flex items-center gap-2 px-6 py-4 text-base font-medium whitespace-nowrap border-b-3 transition-colors ${activeSection === section.id ? 'border-emerald-600 text-emerald-700 bg-emerald-50' : 'border-transparent text-neutral-600 hover:text-emerald-700 hover:bg-emerald-50/50'}`}>
                <section.icon className="h-5 w-5" />
                {section.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="max-w-full px-8 py-6 mt-4">
        <div className="max-w-full mx-auto">
          <form id="supplier-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_code" className="text-base font-medium">Supplier Code *</Label>
                    <Input id="supplier_code" value={formData.supplier_code} disabled className="h-11 text-base bg-blue-50 font-mono font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vendor_code" className="text-base font-medium">Vendor Code</Label>
                    <Input id="vendor_code" value={formData.vendor_code} onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })} placeholder="VEND-001" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier_group" className="text-base font-medium">Supplier Group</Label>
                    <Select value={formData.supplier_group} onValueChange={(value) => setFormData({ ...formData, supplier_group: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                        <SelectItem value="INTERNATIONAL">International</SelectItem>
                        <SelectItem value="LOCAL">Local</SelectItem>
                        <SelectItem value="MANUFACTURER">Manufacturer</SelectItem>
                        <SelectItem value="TRADER">Trader</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-base font-medium">Supplier Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Company Name" required className="h-11 text-base" />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="gst" className="text-base font-medium">GST Number</Label>
                    <Input id="gst" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })} placeholder="29XXXXX1234X1ZX (15 chars)" maxLength={15} className="h-11 text-base font-mono" />
                    <p className="text-xs text-neutral-500">Format: 29XXXXX1234X1ZX</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pan" className="text-base font-medium">PAN Number</Label>
                    <Input id="pan" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })} placeholder="ABCDE1234F (10 chars)" maxLength={10} className="h-11 text-base font-mono" />
                    <p className="text-xs text-neutral-500">Format: ABCDE1234F</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person" className="text-base font-medium">Contact Person</Label>
                    <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="John Doe" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 1234567890" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@supplier.com" className="h-11 text-base" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-medium">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" rows={2} className="text-base" />
                </div>

                <div className="grid grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-base font-medium">City</Label>
                    <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state" className="text-base font-medium">State</Label>
                    <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pincode" className="text-base font-medium">Pincode</Label>
                    <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-base font-medium">Country</Label>
                    <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} className="h-11 text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="payment" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><CreditCard className="h-6 w-6 text-green-600" />Payment & Terms</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="payment_terms" className="text-base font-medium">Payment Terms</Label>
                    <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ADVANCE">100% Advance</SelectItem>
                        <SelectItem value="COD">Cash on Delivery</SelectItem>
                        <SelectItem value="NET_7">Net 7 Days</SelectItem>
                        <SelectItem value="NET_15">Net 15 Days</SelectItem>
                        <SelectItem value="NET_30">Net 30 Days</SelectItem>
                        <SelectItem value="NET_45">Net 45 Days</SelectItem>
                        <SelectItem value="NET_60">Net 60 Days</SelectItem>
                        <SelectItem value="NET_90">Net 90 Days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="credit_days" className="text-base font-medium">Credit Days</Label>
                    <Input id="credit_days" type="number" value={formData.credit_days} onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })} placeholder="30" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currency" className="text-base font-medium">Currency</Label>
                    <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INR">₹ INR</SelectItem>
                        <SelectItem value="USD">$ USD</SelectItem>
                        <SelectItem value="EUR">€ EUR</SelectItem>
                        <SelectItem value="GBP">£ GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="banking" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><TruckIcon className="h-6 w-6 text-purple-600" />Banking & Transport</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-blue-900 mb-4 block">Bank Details</Label>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="bank_name" className="text-base font-medium">Bank Name</Label>
                      <Input id="bank_name" value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} placeholder="HDFC Bank" className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_branch" className="text-base font-medium">Branch</Label>
                      <Input id="bank_branch" value={formData.bank_branch} onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })} placeholder="Mumbai Main" className="h-11 text-base" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="bank_account" className="text-base font-medium">Account Number</Label>
                      <Input id="bank_account" value={formData.bank_account} onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })} placeholder="1234567890" className="h-11 text-base font-mono" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bank_ifsc" className="text-base font-medium">IFSC Code</Label>
                      <Input id="bank_ifsc" value={formData.bank_ifsc} onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })} placeholder="HDFC0001234" maxLength={11} className="h-11 text-base font-mono" />
                    </div>
                  </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <Label className="text-base font-semibold text-green-900 mb-4 block">Transport Details</Label>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="transporter_name" className="text-base font-medium">Transporter Name</Label>
                      <Input id="transporter_name" value={formData.transporter_name} onChange={(e) => setFormData({ ...formData, transporter_name: e.target.value })} placeholder="Transport Company" className="h-11 text-base" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="transport_mode" className="text-base font-medium">Transport Mode</Label>
                      <Select value={formData.transport_mode} onValueChange={(value) => setFormData({ ...formData, transport_mode: value })}>
                        <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ROAD">Road</SelectItem>
                          <SelectItem value="RAIL">Rail</SelectItem>
                          <SelectItem value="AIR">Air</SelectItem>
                          <SelectItem value="SEA">Sea</SelectItem>
                          <SelectItem value="COURIER">Courier</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="rating" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-xl text-orange-900"><Star className="h-6 w-6 text-orange-600" />Rating & Lead Time</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="supplier_rating" className="text-base font-medium">Supplier Rating</Label>
                    <Select value={formData.supplier_rating} onValueChange={(value) => setFormData({ ...formData, supplier_rating: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">⭐ 1 - Poor</SelectItem>
                        <SelectItem value="2">⭐⭐ 2 - Below Average</SelectItem>
                        <SelectItem value="3">⭐⭐⭐ 3 - Average</SelectItem>
                        <SelectItem value="4">⭐⭐⭐⭐ 4 - Good</SelectItem>
                        <SelectItem value="5">⭐⭐⭐⭐⭐ 5 - Excellent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lead_time_days" className="text-base font-medium">Lead Time (Days)</Label>
                    <Input id="lead_time_days" type="number" value={formData.lead_time_days} onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })} placeholder="7" className="h-11 text-base" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks" className="text-base font-medium">Remarks</Label>
                  <Textarea id="remarks" value={formData.remarks} onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} placeholder="Additional notes" rows={3} className="text-base" />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SupplierForm;