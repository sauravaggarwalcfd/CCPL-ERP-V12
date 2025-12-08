import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, Building2, Globe, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const BrandForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    brand_code: '', brand_name: '', brand_category: 'PREMIUM', country_of_origin: '',
    target_market: 'DOMESTIC', website: '', contact_person: '', email: '', phone: '',
    license_number: '', quality_standard: '', remarks: '', status: 'Active'
  });

  useEffect(() => {
    if (id) fetchBrand(id);
  }, [id]);

  const fetchBrand = async (brandId) => {
    try {
      const response = await axios.get(`${API}/masters/brands/${brandId}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load brand');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.brand_code.trim() || !formData.brand_name.trim()) {
      toast.error('Brand Code and Name are required');
      return;
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      toast.error('Invalid email format');
      return;
    }

    try {
      if (id) {
        toast.success('Brand updated successfully');
      } else {
        await axios.post(`${API}/masters/brands`, formData);
        toast.success('Brand created successfully');
      }
      navigate('/masters/brands');
    } catch (error) {
      toast.error('Failed to save brand');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'contact', label: 'Contact Details', icon: Building2 },
    { id: 'licensing', label: 'Licensing', icon: Globe }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/brands')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Brand Master</h1>
              <p className="text-base text-emerald-100">Brand and licensing management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/brands')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="brand-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Brand
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
          <form id="brand-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="brand_code" className="text-base font-medium">Brand Code *</Label>
                    <Input id="brand_code" value={formData.brand_code} onChange={(e) => setFormData({ ...formData, brand_code: e.target.value })} placeholder="BRN-001" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_name" className="text-base font-medium">Brand Name *</Label>
                    <Input id="brand_name" value={formData.brand_name} onChange={(e) => setFormData({ ...formData, brand_name: e.target.value })} placeholder="Zara" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="brand_category" className="text-base font-medium">Brand Category</Label>
                    <Select value={formData.brand_category} onValueChange={(value) => setFormData({ ...formData, brand_category: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="LUXURY">Luxury</SelectItem>
                        <SelectItem value="PREMIUM">Premium</SelectItem>
                        <SelectItem value="MID_RANGE">Mid Range</SelectItem>
                        <SelectItem value="ECONOMY">Economy</SelectItem>
                        <SelectItem value="BUDGET">Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="country_of_origin" className="text-base font-medium">Country of Origin</Label>
                    <Input id="country_of_origin" value={formData.country_of_origin} onChange={(e) => setFormData({ ...formData, country_of_origin: e.target.value })} placeholder="Spain" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="target_market" className="text-base font-medium">Target Market</Label>
                    <Select value={formData.target_market} onValueChange={(value) => setFormData({ ...formData, target_market: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="DOMESTIC">Domestic</SelectItem>
                        <SelectItem value="INTERNATIONAL">International</SelectItem>
                        <SelectItem value="BOTH">Both</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="contact" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-green-50 to-green-100 border-b border-green-200">
                <CardTitle className="flex items-center gap-2 text-xl text-green-900"><Building2 className="h-6 w-6 text-green-600" />Contact Details</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_person" className="text-base font-medium">Contact Person</Label>
                    <Input id="contact_person" value={formData.contact_person} onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })} placeholder="John Doe" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-base font-medium">Email</Label>
                    <Input id="email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="contact@brand.com" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-base font-medium">Phone</Label>
                    <Input id="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1234567890" className="h-11 text-base" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-base font-medium">Website</Label>
                  <Input id="website" type="url" value={formData.website} onChange={(e) => setFormData({ ...formData, website: e.target.value })} placeholder="https://example.com" className="h-11 text-base" />
                </div>
              </CardContent>
            </Card>

            <Card id="licensing" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><Globe className="h-6 w-6 text-purple-600" />Licensing & Quality</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="license_number" className="text-base font-medium">License Number</Label>
                    <Input id="license_number" value={formData.license_number} onChange={(e) => setFormData({ ...formData, license_number: e.target.value })} placeholder="LIC-123456" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="quality_standard" className="text-base font-medium">Quality Standard</Label>
                    <Input id="quality_standard" value={formData.quality_standard} onChange={(e) => setFormData({ ...formData, quality_standard: e.target.value })} placeholder="ISO 9001" className="h-11 text-base" />
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

export default BrandForm;