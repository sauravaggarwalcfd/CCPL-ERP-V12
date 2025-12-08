import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/StatusBadge';
import { Search, Plus, Edit, Trash2, Save, X, Building2, Star } from 'lucide-react';
import { toast } from 'sonner';

const SupplierMaster = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [formData, setFormData] = useState({
    supplier_code: '',
    vendor_code: '',
    name: '',
    supplier_group: 'DOMESTIC',
    gst: '',
    pan: '',
    contact_person: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    country: 'India',
    payment_terms: 'NET_30',
    credit_days: '30',
    currency: 'INR',
    bank_name: '',
    bank_account: '',
    bank_ifsc: '',
    bank_branch: '',
    transporter_name: '',
    transport_mode: 'ROAD',
    supplier_rating: '3',
    lead_time_days: '',
    remarks: '',
    status: 'Active'
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      setLoading(true);
      const response = await mastersAPI.getSuppliers();
      setSuppliers(response.data || []);
    } catch (error) {
      toast.error('Failed to load suppliers');
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const validateGST = (gst) => {
    // GST format: 29XXXXX1234X1ZX (15 characters)
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstPattern.test(gst);
  };

  const validatePAN = (pan) => {
    // PAN format: ABCDE1234F (10 characters)
    const panPattern = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panPattern.test(pan);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validations
    if (!formData.supplier_code.trim()) {
      toast.error('Supplier Code is required');
      setActiveTab('basic');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Supplier Name is required');
      setActiveTab('basic');
      return;
    }

    // Check duplicate vendor name
    if (!editMode) {
      const exists = suppliers.find(s => s.name.toLowerCase() === formData.name.toLowerCase());
      if (exists) {
        toast.error('Supplier name already exists. Please use a unique name.');
        setActiveTab('basic');
        return;
      }
    }

    // GST validation
    if (formData.gst && !validateGST(formData.gst)) {
      toast.error('Invalid GST format. Format: 29XXXXX1234X1ZX (15 characters)');
      setActiveTab('basic');
      return;
    }

    // PAN validation
    if (formData.pan && !validatePAN(formData.pan)) {
      toast.error('Invalid PAN format. Format: ABCDE1234F (10 characters)');
      setActiveTab('basic');
      return;
    }

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      setActiveTab('basic');
      return;
    }

    // Credit days validation
    if (formData.credit_days && parseInt(formData.credit_days) < 0) {
      toast.error('Credit days must be positive');
      setActiveTab('payment');
      return;
    }

    try {
      const payload = {
        ...formData,
        credit_days: parseInt(formData.credit_days) || 0,
        lead_time_days: parseInt(formData.lead_time_days) || 0,
        supplier_rating: parseInt(formData.supplier_rating) || 3
      };

      if (editMode) {
        toast.success('Supplier updated successfully');
      } else {
        await mastersAPI.createSupplier(payload);
        toast.success('Supplier created successfully');
      }
      setDialogOpen(false);
      fetchSuppliers();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save supplier');
    }
  };

  const handleEdit = (supplier) => {
    setFormData({
      supplier_code: supplier.supplier_code,
      vendor_code: supplier.vendor_code || '',
      name: supplier.name,
      supplier_group: supplier.supplier_group || 'DOMESTIC',
      gst: supplier.gst || '',
      pan: supplier.pan || '',
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      city: supplier.city || '',
      state: supplier.state || '',
      pincode: supplier.pincode || '',
      country: supplier.country || 'India',
      payment_terms: supplier.payment_terms || 'NET_30',
      credit_days: supplier.credit_days?.toString() || '30',
      currency: supplier.currency || 'INR',
      bank_name: supplier.bank_name || '',
      bank_account: supplier.bank_account || '',
      bank_ifsc: supplier.bank_ifsc || '',
      bank_branch: supplier.bank_branch || '',
      transporter_name: supplier.transporter_name || '',
      transport_mode: supplier.transport_mode || 'ROAD',
      supplier_rating: supplier.supplier_rating?.toString() || '3',
      lead_time_days: supplier.lead_time_days?.toString() || '',
      remarks: supplier.remarks || '',
      status: supplier.status
    });
    setCurrentId(supplier.id);
    setEditMode(true);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      supplier_code: '', vendor_code: '', name: '', supplier_group: 'DOMESTIC',
      gst: '', pan: '', contact_person: '', phone: '', email: '', address: '',
      city: '', state: '', pincode: '', country: 'India', payment_terms: 'NET_30',
      credit_days: '30', currency: 'INR', bank_name: '', bank_account: '',
      bank_ifsc: '', bank_branch: '', transporter_name: '', transport_mode: 'ROAD',
      supplier_rating: '3', lead_time_days: '', remarks: '', status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
    setActiveTab('basic');
  };

  const filteredSuppliers = suppliers.filter(sup =>
    sup.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sup.supplier_code?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6" data-testid="supplier-master-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900">Supplier Master</h1>
          <p className="text-neutral-600 mt-1">Manage supplier information and details</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button data-testid="create-supplier-btn" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Supplier
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">{editMode ? 'Edit' : 'Create'} Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid grid-cols-4 gap-1">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="payment">Payment & Terms</TabsTrigger>
                  <TabsTrigger value="banking">Banking & Transport</TabsTrigger>
                  <TabsTrigger value="other">Rating & Lead Time</TabsTrigger>
                </TabsList>

                {/* Basic Info Tab */}
                <TabsContent value="basic" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier_code">Supplier Code *</Label>
                      <Input
                        id="supplier_code"
                        value={formData.supplier_code}
                        onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })}
                        placeholder="SUP-001"
                        required
                        disabled={editMode}
                        className={editMode ? 'bg-neutral-100' : ''}
                        data-testid="supplier-code-input"
                      />
                      {editMode && <p className="text-xs text-neutral-500">Code cannot be changed</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor_code">Vendor Code</Label>
                      <Input
                        id="vendor_code"
                        value={formData.vendor_code}
                        onChange={(e) => setFormData({ ...formData, vendor_code: e.target.value })}
                        placeholder="VEND-001"
                        data-testid="vendor-code-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="supplier_group">Supplier Group</Label>
                      <Select value={formData.supplier_group} onValueChange={(value) => setFormData({ ...formData, supplier_group: value })}>
                        <SelectTrigger data-testid="supplier-group-select">
                          <SelectValue />
                        </SelectTrigger>
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
                    <Label htmlFor="name">Supplier Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Company Name"
                      required
                      data-testid="supplier-name-input"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="gst">GST Number</Label>
                      <Input
                        id="gst"
                        value={formData.gst}
                        onChange={(e) => setFormData({ ...formData, gst: e.target.value.toUpperCase() })}
                        placeholder="29XXXXX1234X1ZX (15 chars)"
                        maxLength={15}
                        data-testid="gst-input"
                      />
                      <p className="text-xs text-neutral-500">Format: 29XXXXX1234X1ZX</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pan">PAN Number</Label>
                      <Input
                        id="pan"
                        value={formData.pan}
                        onChange={(e) => setFormData({ ...formData, pan: e.target.value.toUpperCase() })}
                        placeholder="ABCDE1234F (10 chars)"
                        maxLength={10}
                        data-testid="pan-input"
                      />
                      <p className="text-xs text-neutral-500">Format: ABCDE1234F</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="contact_person">Contact Person</Label>
                      <Input
                        id="contact_person"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        placeholder="John Doe"
                        data-testid="contact-person-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+91 1234567890"
                        data-testid="phone-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="contact@supplier.com"
                        data-testid="email-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Street address"
                      rows={2}
                      data-testid="address-input"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} data-testid="city-input" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} data-testid="state-input" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} data-testid="pincode-input" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <Input id="country" value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} data-testid="country-input" />
                    </div>
                  </div>
                </TabsContent>

                {/* Payment & Terms Tab */}
                <TabsContent value="payment" className="space-y-4 mt-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="payment_terms">Payment Terms</Label>
                      <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                        <SelectTrigger data-testid="payment-terms-select">
                          <SelectValue />
                        </SelectTrigger>
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
                      <Label htmlFor="credit_days">Credit Days</Label>
                      <Input
                        id="credit_days"
                        type="number"
                        value={formData.credit_days}
                        onChange={(e) => setFormData({ ...formData, credit_days: e.target.value })}
                        placeholder="30"
                        data-testid="credit-days-input"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
                        <SelectTrigger data-testid="currency-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="INR">INR (₹)</SelectItem>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </TabsContent>

                {/* Banking & Transport Tab */}
                <TabsContent value="banking" className="space-y-4 mt-4">
                  <Card className="border-blue-200 bg-blue-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Bank Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_name">Bank Name</Label>
                          <Input
                            id="bank_name"
                            value={formData.bank_name}
                            onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })}
                            placeholder="HDFC Bank"
                            data-testid="bank-name-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_branch">Branch</Label>
                          <Input
                            id="bank_branch"
                            value={formData.bank_branch}
                            onChange={(e) => setFormData({ ...formData, bank_branch: e.target.value })}
                            placeholder="Mumbai Main"
                            data-testid="bank-branch-input"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="bank_account">Account Number</Label>
                          <Input
                            id="bank_account"
                            value={formData.bank_account}
                            onChange={(e) => setFormData({ ...formData, bank_account: e.target.value })}
                            placeholder="1234567890"
                            data-testid="bank-account-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bank_ifsc">IFSC Code</Label>
                          <Input
                            id="bank_ifsc"
                            value={formData.bank_ifsc}
                            onChange={(e) => setFormData({ ...formData, bank_ifsc: e.target.value.toUpperCase() })}
                            placeholder="HDFC0001234"
                            maxLength={11}
                            data-testid="bank-ifsc-input"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50/50">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Transport Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="transporter_name">Transporter Name</Label>
                          <Input
                            id="transporter_name"
                            value={formData.transporter_name}
                            onChange={(e) => setFormData({ ...formData, transporter_name: e.target.value })}
                            placeholder="Transport Company"
                            data-testid="transporter-input"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="transport_mode">Transport Mode</Label>
                          <Select value={formData.transport_mode} onValueChange={(value) => setFormData({ ...formData, transport_mode: value })}>
                            <SelectTrigger data-testid="transport-mode-select">
                              <SelectValue />
                            </SelectTrigger>
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
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Rating & Lead Time Tab */}
                <TabsContent value="other" className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="supplier_rating">Supplier Rating</Label>
                      <Select value={formData.supplier_rating} onValueChange={(value) => setFormData({ ...formData, supplier_rating: value })}>
                        <SelectTrigger data-testid="rating-select">
                          <SelectValue />
                        </SelectTrigger>
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
                      <Label htmlFor="lead_time_days">Lead Time (Days)</Label>
                      <Input
                        id="lead_time_days"
                        type="number"
                        value={formData.lead_time_days}
                        onChange={(e) => setFormData({ ...formData, lead_time_days: e.target.value })}
                        placeholder="7"
                        data-testid="lead-time-input"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="remarks">Remarks</Label>
                    <Textarea
                      id="remarks"
                      value={formData.remarks}
                      onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                      placeholder="Additional notes about the supplier"
                      rows={4}
                      data-testid="remarks-input"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger data-testid="status-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Blacklisted">Blacklisted</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }} data-testid="cancel-btn">
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" data-testid="save-supplier-btn" className="gap-2">
                  <Save className="h-4 w-4" />
                  {editMode ? 'Update' : 'Save'} Supplier
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
          <Input placeholder="Search suppliers..." className="pl-10" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} data-testid="search-supplier-input" />
        </div>
      </div>

      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-50">
              <TableHead className="font-semibold">Supplier Code</TableHead>
              <TableHead className="font-semibold">Vendor Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Group</TableHead>
              <TableHead className="font-semibold">Contact</TableHead>
              <TableHead className="font-semibold">GST</TableHead>
              <TableHead className="font-semibold">Credit Days</TableHead>
              <TableHead className="font-semibold">Lead Time</TableHead>
              <TableHead className="font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={11} className="text-center py-12 text-neutral-500">Loading...</TableCell></TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-12 w-12 text-neutral-300" />
                    <p className="text-neutral-600 font-medium">No suppliers found</p>
                    <p className="text-sm text-neutral-500">Click "Create Supplier" to add one</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id} className="hover:bg-neutral-50 transition-colors">
                  <TableCell className="font-mono text-sm">{supplier.supplier_code}</TableCell>
                  <TableCell className="font-mono text-xs text-neutral-600">{supplier.vendor_code || '-'}</TableCell>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">{supplier.supplier_group || 'DOMESTIC'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs">
                      <div>{supplier.contact_person || '-'}</div>
                      <div className="text-neutral-500">{supplier.phone || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{supplier.gst || '-'}</TableCell>
                  <TableCell className="text-center">{supplier.credit_days || '-'} days</TableCell>
                  <TableCell className="text-center">{supplier.lead_time_days || '-'} days</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                      <span className="text-sm font-medium">{supplier.supplier_rating || 3}/5</span>
                    </div>
                  </TableCell>
                  <TableCell><StatusBadge status={supplier.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)} data-testid={`edit-supplier-${supplier.id}`}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" data-testid={`delete-supplier-${supplier.id}`}><Trash2 className="h-4 w-4 text-red-600" /></Button>
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

export default SupplierMaster;