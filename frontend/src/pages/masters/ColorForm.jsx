import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, X, FileText, Palette, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ColorForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeSection, setActiveSection] = useState('basic');

  const [formData, setFormData] = useState({
    color_code: '', color_name: '', color_family: 'NEUTRAL', hex_code: '#000000',
    pantone_code: '', rgb_value: '', season: 'ALL', is_standard: true,
    dyeing_cost_factor: '1.0', remarks: '', status: 'Active'
  });

  useEffect(() => {
    if (id) fetchColor(id);
  }, [id]);

  const fetchColor = async (colorId) => {
    try {
      const response = await axios.get(`${API}/masters/colors/${colorId}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Failed to load color');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.color_code.trim() || !formData.color_name.trim()) {
      toast.error('Color Code and Name are required');
      return;
    }

    try {
      if (id) {
        toast.success('Color updated successfully');
      } else {
        await axios.post(`${API}/masters/colors`, formData);
        toast.success('Color created successfully');
      }
      navigate('/masters/colors');
    } catch (error) {
      toast.error('Failed to save color');
    }
  };

  const scrollToSection = (section) => {
    setActiveSection(section);
    document.getElementById(section)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const sections = [
    { id: 'basic', label: 'Basic Info', icon: FileText },
    { id: 'specifications', label: 'Color Specifications', icon: Palette }
  ];

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 border-b border-emerald-800 sticky top-0 z-50 shadow-md">
        <div className="px-8 py-5 flex items-center justify-between border-b border-emerald-800/30">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/masters/colors')} className="text-white hover:bg-emerald-700">
              <ArrowLeft className="h-6 w-6" />
            </Button>
            <div>
              <h1 className="text-3xl font-heading font-semibold text-white">{id ? 'Edit' : 'Create'} Color Master</h1>
              <p className="text-base text-emerald-100">Garment color management</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" onClick={() => navigate('/masters/colors')} className="bg-white hover:bg-neutral-100 text-emerald-700 border-white">
              <X className="h-5 w-5 mr-2" />Cancel
            </Button>
            <Button type="submit" form="color-form" size="lg" className="gap-2 bg-white text-emerald-700 hover:bg-neutral-100">
              <Save className="h-5 w-5" />{id ? 'Update' : 'Save'} Color
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
          <form id="color-form" onSubmit={handleSubmit} className="space-y-6">
            <Card id="basic" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                <CardTitle className="flex items-center gap-2 text-xl text-blue-900"><FileText className="h-6 w-6 text-blue-600" />Basic Information</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="color_code" className="text-base font-medium">Color Code *</Label>
                    <Input id="color_code" value={formData.color_code} onChange={(e) => setFormData({ ...formData, color_code: e.target.value })} placeholder="CLR-001" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color_name" className="text-base font-medium">Color Name *</Label>
                    <Input id="color_name" value={formData.color_name} onChange={(e) => setFormData({ ...formData, color_name: e.target.value })} placeholder="Navy Blue" required className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="color_family" className="text-base font-medium">Color Family</Label>
                    <Select value={formData.color_family} onValueChange={(value) => setFormData({ ...formData, color_family: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="RED">Red</SelectItem>
                        <SelectItem value="BLUE">Blue</SelectItem>
                        <SelectItem value="GREEN">Green</SelectItem>
                        <SelectItem value="YELLOW">Yellow</SelectItem>
                        <SelectItem value="ORANGE">Orange</SelectItem>
                        <SelectItem value="PURPLE">Purple</SelectItem>
                        <SelectItem value="PINK">Pink</SelectItem>
                        <SelectItem value="BROWN">Brown</SelectItem>
                        <SelectItem value="NEUTRAL">Neutral (Black/White/Grey)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="season" className="text-base font-medium">Season</Label>
                    <Select value={formData.season} onValueChange={(value) => setFormData({ ...formData, season: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All Season</SelectItem>
                        <SelectItem value="SPRING">Spring</SelectItem>
                        <SelectItem value="SUMMER">Summer</SelectItem>
                        <SelectItem value="FALL">Fall</SelectItem>
                        <SelectItem value="WINTER">Winter</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dyeing_cost_factor" className="text-base font-medium">Dyeing Cost Factor</Label>
                    <Input id="dyeing_cost_factor" type="number" step="0.1" value={formData.dyeing_cost_factor} onChange={(e) => setFormData({ ...formData, dyeing_cost_factor: e.target.value })} placeholder="1.0" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-base font-medium">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger className="h-11 text-base"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card id="specifications" className="scroll-mt-48">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 border-b border-purple-200">
                <CardTitle className="flex items-center gap-2 text-xl text-purple-900"><Palette className="h-6 w-6 text-purple-600" />Color Specifications</CardTitle>
              </CardHeader>
              <CardContent className="p-8 space-y-5">
                <div className="grid grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="hex_code" className="text-base font-medium">Hex Code</Label>
                    <div className="flex gap-3">
                      <Input id="hex_code" type="color" value={formData.hex_code} onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })} className="w-20 h-11 p-1 cursor-pointer" />
                      <Input value={formData.hex_code} onChange={(e) => setFormData({ ...formData, hex_code: e.target.value })} placeholder="#000000" className="flex-1 h-11 text-base font-mono" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pantone_code" className="text-base font-medium">Pantone Code</Label>
                    <Input id="pantone_code" value={formData.pantone_code} onChange={(e) => setFormData({ ...formData, pantone_code: e.target.value })} placeholder="19-4052 TPX" className="h-11 text-base" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="rgb_value" className="text-base font-medium">RGB Value</Label>
                    <Input id="rgb_value" value={formData.rgb_value} onChange={(e) => setFormData({ ...formData, rgb_value: e.target.value })} placeholder="0,0,128" className="h-11 text-base" />
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

export default ColorForm;