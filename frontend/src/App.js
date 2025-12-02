import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Toaster } from 'sonner';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';

// Masters
import ItemCategories from '@/pages/masters/ItemCategories';
import ItemMaster from '@/pages/masters/ItemMaster';
import UOMMaster from '@/pages/masters/UOMMaster';
import SupplierMaster from '@/pages/masters/SupplierMaster';
import WarehouseMaster from '@/pages/masters/WarehouseMaster';
import BINLocationMaster from '@/pages/masters/BINLocationMaster';
import TaxHSNMaster from '@/pages/masters/TaxHSNMaster';

// Purchase
import PurchaseIndents from '@/pages/purchase/PurchaseIndents';
import PurchaseOrders from '@/pages/purchase/PurchaseOrders';
import POApprovalPanel from '@/pages/purchase/POApprovalPanel';

// Quality
import QualityChecks from '@/pages/quality/QualityChecks';

// Inventory
import GRN from '@/pages/inventory/GRN';
import StockInward from '@/pages/inventory/StockInward';
import StockTransfer from '@/pages/inventory/StockTransfer';
import IssueToDepartment from '@/pages/inventory/IssueToDepartment';
import ReturnFromDepartment from '@/pages/inventory/ReturnFromDepartment';
import StockAdjustment from '@/pages/inventory/StockAdjustment';

// Reports
import StockLedger from '@/pages/reports/StockLedger';
import ItemBalanceReport from '@/pages/reports/ItemBalanceReport';
import IssueReturnRegister from '@/pages/reports/IssueReturnRegister';
import PendingPOReport from '@/pages/reports/PendingPOReport';

// Settings
import ApprovalFlows from '@/pages/settings/ApprovalFlows';
import NumberSeries from '@/pages/settings/NumberSeries';
import RolesPermissions from '@/pages/settings/RolesPermissions';
import AccountMapping from '@/pages/settings/AccountMapping';

import '@/App.css';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="App">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <MainLayout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />

              {/* Masters */}
              <Route path="masters/item-categories" element={<ItemCategories />} />
              <Route path="masters/items" element={<ItemMaster />} />
              <Route path="masters/uoms" element={<UOMMaster />} />
              <Route path="masters/suppliers" element={<SupplierMaster />} />
              <Route path="masters/warehouses" element={<WarehouseMaster />} />
              <Route path="masters/bin-locations" element={<BINLocationMaster />} />
              <Route path="masters/tax-hsn" element={<TaxHSNMaster />} />

              {/* Purchase */}
              <Route path="purchase/indents" element={<PurchaseIndents />} />
              <Route path="purchase/orders" element={<PurchaseOrders />} />
              <Route path="purchase/approvals" element={<POApprovalPanel />} />

              {/* Quality */}
              <Route path="quality/checks" element={<QualityChecks />} />

              {/* Inventory */}
              <Route path="inventory/grn" element={<GRN />} />
              <Route path="inventory/stock-inward" element={<StockInward />} />
              <Route path="inventory/stock-transfer" element={<StockTransfer />} />
              <Route path="inventory/issue" element={<IssueToDepartment />} />
              <Route path="inventory/return" element={<ReturnFromDepartment />} />
              <Route path="inventory/adjustment" element={<StockAdjustment />} />

              {/* Reports */}
              <Route path="reports/stock-ledger" element={<StockLedger />} />
              <Route path="reports/item-balance" element={<ItemBalanceReport />} />
              <Route path="reports/issue-return" element={<IssueReturnRegister />} />
              <Route path="reports/pending-po" element={<PendingPOReport />} />

              {/* Settings */}
              <Route path="settings/approval-flows" element={<ApprovalFlows />} />
              <Route path="settings/number-series" element={<NumberSeries />} />
              <Route path="settings/roles" element={<RolesPermissions />} />
              <Route path="settings/account-mapping" element={<AccountMapping />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
          <Toaster position="top-right" richColors />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
