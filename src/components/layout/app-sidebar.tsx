'use client';

import * as React from 'react';
import {
  AudioWaveform,
  BookOpen,
  Bot,
  Command,
  Frame,
  GalleryVerticalEnd,
  Map,
  PieChart,
  Settings2,
  SquareTerminal,
} from 'lucide-react';

import { NavMain } from '@/components/layout/nav-main';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { routes } from '@/shared/constants/routes';
import { NavUser } from './nav-user';

// This is sample data.
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

const data = {
  user: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Main',
      url: '/',
      icon: SquareTerminal,
      isActive: true,
      items: [
        {
          title: 'Dashboard',
          url: routes.dashboard,
        },
        {
          title: 'Games',
          url: routes.games,
        },
        {
          title: 'Profile',
          url: routes.profile,
        },
      ],
    },
    {
      title: 'Admin',
      url: '/admin',
      icon: Bot,
      items: [
        {
          title: 'User Management',
          url: routes.adminUsers,
        },
        {
          title: 'Vocabulary',
          url: routes.adminVocabulary,
        },
      ],
    },
    {
      title: 'Settings',
      url: '#',
      icon: Settings2,
      items: [
        {
          title: 'Theme',
          url: routes.theme,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>Logo</SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter className="mb-2">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
