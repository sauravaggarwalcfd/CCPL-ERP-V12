import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { mastersAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, MapPin, Settings, User, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const WarehouseForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    warehouse_code: '', warehouse_name: '', warehouse_type: 'STORE',
    location: '', address: '', city: '', state: '', pincode: '',
    capacity: '', responsible_person: '', contact_number: '', email: '',
    enable_qc: false, is_transit_warehouse: false, is_wip_warehouse: false,
    status: 'Active'
  });

  useEffect(() => {
    if (id) fetchWarehouse(id);
    else generateWarehouseCode();
  }, [id]);

  const generateWarehouseCode = () => {
    const code = `WH-${Date.now().toString().slice(-3)}`;
    setFormData(prev => ({ ...prev, warehouse_code: code }));
  };

  const fetchWarehouse = async (whId) => {
    try {
      const response = await mastersAPI.getWarehouse(whId);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load warehouse');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.warehouse_code.trim() || !formData.warehouse_name.trim()) {
      toast.error('Warehouse Code and Name are required');
      return;
    }

    try {
      if (id) {
        toast.success('Warehouse updated successfully');
      } else {
        await mastersAPI.createWarehouse(formData);
        toast.success('Warehouse created successfully');
      }
      navigate('/masters/warehouses');
    } catch (error) {
      toast.error('Failed to save warehouse');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'location', label: 'Location Details', icon: MapPin },
    { id: 'controls', label: 'Warehouse Controls', icon: Settings },
    { id: 'responsible', label: 'Responsible Person', icon: User }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/warehouses')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Warehouse Master</h1>
              <p className="text-base text-emerald-100">Garment warehouse with QC controls</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/warehouses')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="warehouse-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Warehouse
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
          <form id="warehouse-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_code" className="text-base font-medium">Warehouse Code *</Label>
                    <Input id="warehouse_code" value={formData.warehouse_code} disabled className="h-11 text-base bg-blue-50 font-mono font-semibold" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_name" className="text-base font-medium">Warehouse Name *</Label>
                    <Input id="warehouse_name" value={formData.warehouse_name} onChange={(e) => setFormData({ ...formData, warehouse_name: e.target.value })} placeholder="Main Warehouse" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="warehouse_type" className="text-base font-medium">Warehouse Type *</Label>
                    <Select value={formData.warehouse_type} onValueChange={(value) => setFormData({ ...formData, warehouse_type: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STORE">Store / Storage</SelectItem>
                        <SelectItem value="CUTTING">Cutting Department</SelectItem>
                        <SelectItem value="STITCHING">Stitching Department</SelectItem>
                        <SelectItem value="SCRAP">Scrap / Waste</SelectItem>
                        <SelectItem value="PRODUCTION">Production</SelectItem>
                        <SelectItem value="RETURNS">Returns</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="capacity" className="text-base font-medium">Capacity (sq. ft)</Label>
                    <Input id="capacity" type="number" value={formData.capacity} onChange={(e) => setFormData({ ...formData, capacity: e.target.value })} placeholder="10000" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-base font-medium">Location</Label>
                    <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} placeholder="Building/Floor/Area" className="h-11 text-base" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="location" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><MapPin className="h-6 w-6 text-green-600" />Location Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="address" className="text-base font-medium">Address</Label>
                  <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="Full address" rows={2} className="text-base" />
                </div>

                <div className="grid grid-cols-3 gap-6">
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
                </div>
              </CardContent>
            </Card>

            <Card id="controls" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><Settings className="h-6 w-6 text-purple-600" />Warehouse Controls</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="flex items-center justify-between p-6 border-2 border-neutral-200 rounded-lg bg-white">
                    <div className="space-y-1">
                      <Label htmlFor="enable_qc" className="text-base font-medium cursor-pointer">Enable QC</Label>
                      <p className="text-xs text-neutral-500">Quality Check required</p>
                    </div>
                    <Switch id="enable_qc" checked={formData.enable_qc} onCheckedChange={(checked) => setFormData({ ...formData, enable_qc: checked })} className="data-[state=checked]:bg-green-600" />
                  </div>

                  <div className="flex items-center justify-between p-6 border-2 border-neutral-200 rounded-lg bg-white">
                    <div className="space-y-1">
                      <Label htmlFor="is_transit_warehouse" className="text-base font-medium cursor-pointer">Is Transit</Label>
                      <p className="text-xs text-neutral-500">Temporary storage</p>
                    </div>
                    <Switch id="is_transit_warehouse" checked={formData.is_transit_warehouse} onCheckedChange={(checked) => setFormData({ ...formData, is_transit_warehouse: checked })} className="data-[state=checked]:bg-blue-600" />
                  </div>

                  <div className="flex items-center justify-between p-6 border-2 border-neutral-200 rounded-lg bg-white">
                    <div className="space-y-1">
                      <Label htmlFor="is_wip_warehouse" className="text-base font-medium cursor-pointer">Is WIP</Label>
                      <p className="text-xs text-neutral-500">Work-in-Progress</p>
                    </div>
                    <Switch id="is_wip_warehouse" checked={formData.is_wip_warehouse} onCheckedChange={(checked) => setFormData({ ...formData, is_wip_warehouse: checked })} className="data-[state=checked]:bg-amber-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="responsible" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-orange-50 to-orange-100 border-b border-orange-200">
                <CardTitle className="flex items-center gap-2 text-xl text-orange-900"><User className="h-6 w-6 text-orange-600" />Responsible Person</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="responsible_person" className="text-base font-medium">Name</Label>
                    <Input id="responsible_person" value={formData.responsible_person} onChange={(e) => setFormData({ ...formData, responsible_person: e.target.value })} placeholder="Manager/Supervisor Name" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contact_number" className="text-base font-medium">Contact Number</Label>
                    <Input id="contact_number" value={formData.contact_number} onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })} placeholder="+91 1234567890" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="manager@company.com" className="h-11 text-base" />
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

export default WarehouseForm;