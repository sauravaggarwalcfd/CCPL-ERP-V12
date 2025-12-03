import React, { useEffect, useState } from 'react';
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.supplier_code.trim()) {
      toast.error('Supplier Code is required');
      return;
    }
    if (!formData.name.trim()) {
      toast.error('Supplier Name is required');
      return;
    }

    try {
      if (editMode) {
        toast.success('Supplier updated successfully');
      } else {
        await mastersAPI.createSupplier(formData);
        toast.success('Supplier created successfully');
      }
      setDialogOpen(false);
      fetchSuppliers();
      resetForm();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to save supplier');
    }
  };

  const resetForm = () => {
    setFormData({
      supplier_code: '',
      name: '',
      gst: '',
      pan: '',
      contact_person: '',
      phone: '',
      email: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      payment_terms: 'NET_30',
      bank_details: '',
      status: 'Active'
    });
    setEditMode(false);
    setCurrentId(null);
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
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl font-heading">{editMode ? 'Edit' : 'Create'} Supplier</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="supplier_code">Supplier Code *</Label>
                  <Input id="supplier_code" value={formData.supplier_code} onChange={(e) => setFormData({ ...formData, supplier_code: e.target.value })} placeholder="SUP-001" required data-testid="supplier-code-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Supplier Name *</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Company Name" required data-testid="supplier-name-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gst">GST Number</Label>
                  <Input id="gst" value={formData.gst} onChange={(e) => setFormData({ ...formData, gst: e.target.value })} placeholder="29XXXXX1234X1ZX" data-testid="gst-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pan">PAN Number</Label>
                  <Input id="pan" value={formData.pan} onChange={(e) => setFormData({ ...formData, pan: e.target.value })} placeholder="ABCDE1234F" data-testid="pan-input" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_person">Contact Person</Label>
                  <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="John Doe" data-testid="contact-person-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 1234567890" data-testid="phone-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@supplier.com" data-testid="email-input" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Street address" rows={2} data-testid="address-input" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="City" data-testid="city-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" value={formData.state} onChange={(e) => setFormData({ ...formData, state: e.target.value })} placeholder="State" data-testid="state-input" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input id="pincode" value={formData.pincode} onChange={(e) => setFormData({ ...formData, pincode: e.target.value })} placeholder="123456" data-testid="pincode-input" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select value={formData.payment_terms} onValueChange={(value) => setFormData({ ...formData, payment_terms: value })}>
                    <SelectTrigger data-testid="payment-terms-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IMMEDIATE">Immediate</SelectItem>
                      <SelectItem value="NET_15">Net 15 Days</SelectItem>
                      <SelectItem value="NET_30">Net 30 Days</SelectItem>
                      <SelectItem value="NET_45">Net 45 Days</SelectItem>
                      <SelectItem value="NET_60">Net 60 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger data-testid="status-select"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bank_details">Bank Details</Label>
                <Textarea id="bank_details" value={formData.bank_details} onChange={(e) => setFormData({ ...formData, bank_details: e.target.value })} placeholder="Bank name, account number, IFSC" rows={2} data-testid="bank-details-input" />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}><X className="h-4 w-4 mr-2" />Cancel</Button>
                <Button type="submit" data-testid="save-supplier-btn" className="gap-2"><Save className="h-4 w-4" />{editMode ? 'Update' : 'Save'} Supplier</Button>
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
              <TableHead className="font-semibold">Code</TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Contact Person</TableHead>
              <TableHead className="font-semibold">Phone</TableHead>
              <TableHead className="font-semibold">GST</TableHead>
              <TableHead className="font-semibold">Payment Terms</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-12 text-neutral-500">Loading...</TableCell></TableRow>
            ) : filteredSuppliers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12">
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
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.contact_person || '-'}</TableCell>
                  <TableCell>{supplier.phone || '-'}</TableCell>
                  <TableCell className="font-mono text-xs">{supplier.gst || '-'}</TableCell>
                  <TableCell>{supplier.payment_terms?.replace('_', ' ') || '-'}</TableCell>
                  <TableCell><StatusBadge status={supplier.status} /></TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" data-testid={`edit-supplier-${supplier.id}`}><Edit className="h-4 w-4" /></Button>
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