import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardCheck,
  Warehouse,
  FileText,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [expandedSections, setExpandedSections] = React.useState(['masters', 'purchase', 'quality', 'inventory', 'reports']);

  const toggleSection = (section) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const isActive = (path) => location.pathname === path;
  const isSectionActive = (paths) => paths.some(path => location.pathname.startsWith(path));

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuSections = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      path: '/dashboard',
      single: true,
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Masters',
      icon: Package,
      key: 'masters',
      color: 'from-emerald-500 to-emerald-600',
      items: [
        { title: 'Item Category', path: '/masters/item-categories' },
        { title: 'Fabric Category', path: '/masters/fabric-categories' },
        { title: 'Item Master', path: '/masters/items' },
        { title: 'Color Master', path: '/masters/colors' },
        { title: 'Size Master', path: '/masters/sizes' },
        { title: 'Brand Master', path: '/masters/brands' },
        { title: 'UOM Master', path: '/masters/uoms' },
        { title: 'Supplier Master', path: '/masters/suppliers' },
        { title: 'Warehouse Master', path: '/masters/warehouses' },
        { title: 'BIN / Location Master', path: '/masters/bin-locations' },
        { title: 'Tax / HSN Master', path: '/masters/tax-hsn' }
      ]
    },
    {
      title: 'Purchase',
      icon: ShoppingCart,
      key: 'purchase',
      color: 'from-violet-500 to-violet-600',
      items: [
        { title: 'Purchase Indent', path: '/purchase/indents' },
        { title: 'Purchase Order', path: '/purchase/orders' },
        { title: 'PO Approval Panel', path: '/purchase/approvals' }
      ]
    },
    {
      title: 'Quality',
      icon: ClipboardCheck,
      key: 'quality',
      color: 'from-rose-500 to-rose-600',
      items: [
        { title: 'Quality Check', path: '/quality/checks' }
      ]
    },
    {
      title: 'Inventory Transactions',
      icon: Warehouse,
      key: 'inventory',
      color: 'from-amber-500 to-amber-600',
      items: [
        { title: 'Opening Stock', path: '/inventory/opening-stock' },
        { title: 'Goods Receipt (GRN)', path: '/inventory/grn' },
        { title: 'Stock Inward', path: '/inventory/stock-inward' },
        { title: 'Stock Issue', path: '/inventory/stock-issue' },
        { title: 'Stock Transfer', path: '/inventory/stock-transfer' },
        { title: 'Stock Adjustment', path: '/inventory/adjustment' },
        { title: 'Stock Audit', path: '/inventory/audit' },
        { title: 'Issue to Department', path: '/inventory/issue' },
        { title: 'Return from Department', path: '/inventory/return' }
      ]
    },
    {
      title: 'Reports',
      icon: FileText,
      key: 'reports',
      color: 'from-cyan-500 to-cyan-600',
      items: [
        { title: 'Stock Ledger', path: '/reports/stock-ledger' },
        { title: 'Item Balance Report', path: '/reports/item-balance' },
        { title: 'BIN Stock Report', path: '/reports/bin-stock' },
        { title: 'Dead Stock Report', path: '/reports/dead-stock' },
        { title: 'Issue & Return Register', path: '/reports/issue-return' },
        { title: 'Pending PO Report', path: '/reports/pending-po' }
      ]
    },
    {
      title: 'Settings',
      icon: Settings,
      key: 'settings',
      color: 'from-slate-500 to-slate-600',
      items: [
        { title: 'Number Series', path: '/settings/number-series' },
        { title: 'Approval Flow Setup', path: '/settings/approval-flows' },
        { title: 'Role & Permissions', path: '/settings/roles' },
        { title: 'GL Account Mapping', path: '/settings/account-mapping' }
      ]
    }
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 bg-neutral-50 border-r border-neutral-200 transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <h1 className="text-xl font-heading font-bold text-white">ERP Inventory</h1>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-blue-600"
              onClick={() => setIsOpen(false)}
              data-testid="sidebar-close-btn"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-3 py-4">
            <nav className="space-y-1">
              {menuSections.map((section) => {
                if (section.single) {
                  return (
                    <Link
                      key={section.path}
                      to={section.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                        isActive(section.path)
                          ? `bg-gradient-to-r ${section.color} text-white shadow-sm`
                          : 'text-neutral-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      data-testid={`nav-${section.title.toLowerCase()}`}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.title}
                    </Link>
                  );
                }

                const isExpanded = expandedSections.includes(section.key);
                const sectionActive = isSectionActive(section.items.map(i => i.path));

                return (
                  <div key={section.key} className="space-y-1">
                    <button
                      onClick={() => toggleSection(section.key)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-semibold transition-colors ${
                        sectionActive 
                          ? `text-white bg-gradient-to-r ${section.color} shadow-sm` 
                          : 'text-neutral-700 hover:bg-blue-50 hover:text-blue-700'
                      }`}
                      data-testid={`nav-section-${section.key}`}
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
                            data-testid={`nav-${item.path.replace(/\//g, '-')}`}
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

          {/* User Section */}
          <div className="p-4 border-t border-neutral-200">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-neutral-900 truncate">{user?.name}</p>
                <p className="text-xs text-neutral-600 truncate">{user?.role}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start"
              onClick={handleLogout}
              data-testid="logout-btn"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
