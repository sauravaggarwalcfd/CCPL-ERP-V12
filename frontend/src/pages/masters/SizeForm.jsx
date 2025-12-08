import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, Ruler, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const SizeForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    size_code: '', size_name: '', category: 'APPAREL', age_group: 'ADULT', gender: 'UNISEX',
    size_order: '', measurements: { chest: '', waist: '', hip: '', shoulder: '', length: '', sleeve: '' },
    international_equivalent: '', remarks: '', status: 'Active'
  });

  useEffect(() => {
    if (id) fetchSize(id);
  }, [id]);

  const fetchSize = async (sizeId) => {
    try {
      const response = await axios.get(`${API}/masters/sizes/${sizeId}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load size');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.size_code.trim() || !formData.size_name.trim()) {
      toast.error('Size Code and Name are required');
      return;
    }

    try {
      if (id) {
        toast.success('Size updated successfully');
      } else {
        await axios.post(`${API}/masters/sizes`, formData);
        toast.success('Size created successfully');
      }
      navigate('/masters/sizes');
    } catch (error) {
      toast.error('Failed to save size');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'measurements', label: 'Measurements', icon: Ruler }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/sizes')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Size Master</h1>
              <p className="text-base text-emerald-100">Garment size and measurements</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/sizes')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="size-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Size
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
          <form id="size-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="size_code" className="text-base font-medium">Size Code *</Label>
                    <Input id="size_code" value={formData.size_code} onChange={(e) => setFormData({ ...formData, size_code: e.target.value })} placeholder="SZ-M" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size_name" className="text-base font-medium">Size Name *</Label>
                    <Input id="size_name" value={formData.size_name} onChange={(e) => setFormData({ ...formData, size_name: e.target.value })} placeholder="Medium" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="size_order" className="text-base font-medium">Display Order</Label>
                    <Input id="size_order" type="number" value={formData.size_order} onChange={(e) => setFormData({ ...formData, size_order: e.target.value })} placeholder="3" className="h-11 text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-base font-medium">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="APPAREL">Apparel</SelectItem>
                        <SelectItem value="FOOTWEAR">Footwear</SelectItem>
                        <SelectItem value="ACCESSORIES">Accessories</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="age_group" className="text-base font-medium">Age Group</Label>
                    <Select value={formData.age_group} onValueChange={(value) => setFormData({ ...formData, age_group: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="INFANT">Infant</SelectItem>
                        <SelectItem value="TODDLER">Toddler</SelectItem>
                        <SelectItem value="KIDS">Kids</SelectItem>
                        <SelectItem value="TEEN">Teen</SelectItem>
                        <SelectItem value="ADULT">Adult</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender" className="text-base font-medium">Gender</Label>
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="MALE">Male</SelectItem>
                        <SelectItem value="FEMALE">Female</SelectItem>
                        <SelectItem value="UNISEX">Unisex</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="international_equivalent" className="text-base font-medium">International Equivalent</Label>
                  <Input id="international_equivalent" value={formData.international_equivalent} onChange={(e) => setFormData({ ...formData, international_equivalent: e.target.value })} placeholder="US: M, EU: 50" className="h-11 text-base" />
                </div>
              </CardContent>
            </Card>

            <Card id="measurements" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><Ruler className="h-6 w-6 text-green-600" />Measurements (in inches)</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="chest" className="text-base font-medium">Chest</Label>
                    <Input id="chest" type="number" step="0.5" value={formData.measurements.chest} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, chest: e.target.value } })} placeholder="38" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="waist" className="text-base font-medium">Waist</Label>
                    <Input id="waist" type="number" step="0.5" value={formData.measurements.waist} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, waist: e.target.value } })} placeholder="32" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hip" className="text-base font-medium">Hip</Label>
                    <Input id="hip" type="number" step="0.5" value={formData.measurements.hip} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, hip: e.target.value } })} placeholder="40" className="h-11 text-base" />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="shoulder" className="text-base font-medium">Shoulder</Label>
                    <Input id="shoulder" type="number" step="0.5" value={formData.measurements.shoulder} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, shoulder: e.target.value } })} placeholder="16" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="length" className="text-base font-medium">Length</Label>
                    <Input id="length" type="number" step="0.5" value={formData.measurements.length} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, length: e.target.value } })} placeholder="28" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sleeve" className="text-base font-medium">Sleeve</Label>
                    <Input id="sleeve" type="number" step="0.5" value={formData.measurements.sleeve} onChange={(e) => setFormData({ ...formData, measurements: { ...formData.measurements, sleeve: e.target.value } })} placeholder="24" className="h-11 text-base" />
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

export default SizeForm;