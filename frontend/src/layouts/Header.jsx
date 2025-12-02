import React from 'react';
import { Menu, Bell, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const Header = ({ setSidebarOpen }) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200 h-16" data-testid="header">
      <div className="flex items-center justify-between h-full px-6">
        {/* Left: Mobile Menu Button */}
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
            data-testid="mobile-menu-btn"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Search Bar */}
          <div className="hidden md:flex items-center relative">
            <Search className="absolute left-3 h-4 w-4 text-neutral-500" />
            <Input
              placeholder="Search items, orders..."
              className="pl-10 w-80"
              data-testid="global-search-input"
            />
          </div>
        </div>

        {/* Right: Notifications */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" data-testid="notifications-btn">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
