import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  Package, 
  ArrowLeftRight, 
  FileText, 
  Settings,
  ChevronDown,
  ChevronRight,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

const InventoryLayout = () => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState(['masters', 'transactions', 'reports', 'settings']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  const menuSections = [
    {
      title: 'Masters',
      icon: Package,
      key: 'masters',
      items: [
        { title: 'Item Category', path: '/inventory/masters/item-category' },
        { title: 'Item Master', path: '/inventory/masters/item-master' },
        { title: 'UOM Master', path: '/inventory/masters/uom' },
        { title: 'Warehouse Master', path: '/inventory/masters/warehouse' },
        { title: 'BIN Master', path: '/inventory/masters/bin' },
        { title: 'Brand Master', path: '/inventory/masters/brand' },
        { title: 'Attributes Master', path: '/inventory/masters/attributes' }
      ]
    },
    {
      title: 'Transactions',
      icon: ArrowLeftRight,
      key: 'transactions',
      items: [
        { title: 'Opening Stock', path: '/inventory/transactions/opening-stock' },
        { title: 'Goods Receipt', path: '/inventory/transactions/goods-receipt' },
        { title: 'Stock Issue', path: '/inventory/transactions/stock-issue' },
        { title: 'Stock Transfer', path: '/inventory/transactions/transfer' },
        { title: 'Stock Adjustment', path: '/inventory/transactions/adjustment' },
        { title: 'Stock Audit', path: '/inventory/transactions/audit' }
      ]
    },
    {
      title: 'Reports',
      icon: FileText,
      key: 'reports',
      items: [
        { title: 'Stock Ledger', path: '/inventory/reports/stock-ledger' },
        { title: 'Item Balance Report', path: '/inventory/reports/item-balance' },
        { title: 'BIN Stock Report', path: '/inventory/reports/bin-stock' },
        { title: 'Dead Stock Report', path: '/inventory/reports/dead-stock' }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      key: 'settings',
      items: [
        { title: 'Number Series', path: '/inventory/settings/numbering' },
        { title: 'Roles & Permissions', path: '/inventory/settings/roles' },
        { title: 'GL Mapping', path: '/inventory/settings/gl-mapping' },
        { title: 'Approval Workflow', path: '/inventory/settings/approval' }
      ]
    }
  ];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="inventory-sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-neutral-50 border-r border-neutral-200 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="inventory-sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200">
            <div>
              <h1 className="text-xl font-heading font-bold text-primary">Inventory Module</h1>
              <p className="text-xs text-neutral-600 mt-1">ERP System</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="inventory-sidebar-close-btn"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {menuSections.map((section) => {
                const isExpanded = expandedSections.includes(section.key);
                const sectionActive = isSectionActive(section.items.map(i => i.path));

                return (
                  <div key={section.key} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        sectionActive ? 'text-primary bg-primary/5' : 'text-neutral-700 hover:bg-neutral-100'
                      }`}
                      data-testid={`inventory-nav-section-${section.key}`}
                    >
                      <div className="flex items-center gap-3">
                        <section.icon className="h-4 w-4" />
                        {section.title}
                      </div>
                      {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </button>

                    {isExpanded && (
                      <div className="ml-7 space-y-1">
                        {section.items.map((item) => (
                          <Link
                            key={item.path}
                            to={item.path}
                            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                              isActive(item.path)
                                ? 'bg-primary text-white font-medium'
                                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                            }`}
                            data-testid={`inventory-nav-${item.path.replace(/\//g, '-')}`}
                          >
                            {item.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>

          {/* Footer */}
          <div className="p-4 border-t border-neutral-200">
            <Link to="/dashboard">
              <Button variant="outline" size="sm" className="w-full">
                Back to Main Menu
              </Button>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-neutral-200 h-16">
          <div className="flex items-center h-full px-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              data-testid="inventory-mobile-menu-btn"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h2 className="ml-4 text-lg font-heading font-semibold">Inventory</h2>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto bg-neutral-50 p-6 md:p-8" data-testid="inventory-main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InventoryLayout;