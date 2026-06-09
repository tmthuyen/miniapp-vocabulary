'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { LogOut, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { routes } from '@/shared/constants/routes';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React from 'react';
import { Sidebar, SidebarProvider } from '../ui/sidebar';
import { Drawer } from '../ui/drawer';

export const menuItems = [
  {
    labelGroup: 'Main',
    items: [
      { label: 'Dashboard', href: routes.dashboard },
      { label: 'Games', href: routes.games },
      { label: 'Profile', href: routes.profile },
    ],
  },
  {
    labelGroup: 'Admin',
    items: [
      { label: 'Admin Users', href: routes.adminUsers },
      { label: 'Admin Vocabulary', href: routes.adminVocabulary },
    ],
  },
  {
    labelGroup: 'Settings',
    items: [{ label: 'Theme', href: routes.theme }],
  },
];

const Menu = ({ items = menuItems }: { items?: typeof menuItems }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      {!isMobile && (
        <SidebarProvider>
          <Sidebar>
            {items.map((group) => (
              <div key={group.labelGroup} className="mb-6">
                <h2 className="text-muted-foreground mb-2 text-sm font-semibold">
                  {group.labelGroup}
                </h2>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-primary hover:bg-primary/10 block rounded-md px-3 py-2 text-sm font-medium"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </Sidebar>
        </SidebarProvider>
      )}

      {isMobile && 'drawer'}
    </>
  );
};

export default Menu;

export function Navbar1() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/auth/login');
    router.refresh();
  };

  return <>Hihih</>;
}
