import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardAPI } from '@/services/api';
import { DataCard } from '@/components/StatusBadge';
import { Package, AlertTriangle, ShoppingCart, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_items: 0,
    total_suppliers: 0,
    low_stock_alerts: 0,
    pending_pos: 0,
    pending_approvals: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { title: 'Create Purchase Indent', path: '/purchase/indents' },
    { title: 'Create Purchase Order', path: '/purchase/orders' },
    { title: 'New GRN', path: '/inventory/grn' },
    { title: 'Issue Material', path: '/inventory/issue' }
  ];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-heading font-semibold tracking-tight text-neutral-900" data-testid="dashboard-title">
          Dashboard
        </h1>
        <p className="text-neutral-600 mt-1">Welcome back! Here's an overview of your inventory system.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DataCard
          title="Total Items"
          value={loading ? '-' : stats.total_items}
          icon={Package}
        />
        <DataCard
          title="Low Stock Alerts"
          value={loading ? '-' : stats.low_stock_alerts}
          icon={AlertTriangle}
          className={stats.low_stock_alerts > 0 ? 'border-red-200' : ''}
        />
        <DataCard
          title="Pending POs"
          value={loading ? '-' : stats.pending_pos}
          icon={ShoppingCart}
        />
        <DataCard
          title="Pending Approvals"
          value={loading ? '-' : stats.pending_approvals}
          icon={CheckCircle}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {quickActions.map((action) => (
              <Button
                key={action.path}
                variant="outline"
                className="w-full justify-start"
                onClick={() => navigate(action.path)}
                data-testid={`quick-action-${action.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {action.title}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-xl font-heading">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center text-neutral-500 py-8">
              <p>No recent activity to display</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/masters/items')}>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" />
              Item Master
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">Manage items, categories, and inventory details</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/purchase/orders')}>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Purchase Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">Create and manage purchase orders</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow duration-200 cursor-pointer" onClick={() => navigate('/inventory/stock-inward')}>
          <CardHeader>
            <CardTitle className="text-lg font-heading flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-primary" />
              Stock Management
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-neutral-600">Handle stock inward, transfers, and adjustments</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
