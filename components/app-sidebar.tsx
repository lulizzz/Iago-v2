'use client';

import type { User } from 'next-auth';
import { useRouter } from 'next/navigation';

import { PlusIcon } from '@/components/icons';
import { BookIcon } from 'lucide-react';
import { SidebarHistory } from '@/components/sidebar-history';
import { SidebarUserNav } from '@/components/sidebar-user-nav';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

export function AppSidebar({ user }: { user: User | undefined }) {
  const router = useRouter();
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar className="group-data-[side=left]:border-r-0">
      <SidebarHeader>
        <SidebarMenu>
          <div className="flex flex-row justify-between items-center">
            <Link
              href="/"
              onClick={() => {
                setOpenMobile(false);
              }}
              className="flex flex-row gap-3 items-center flex-1 group-data-[collapsible=icon]:justify-center"
            >
              <span className="text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer group-data-[collapsible=icon]:hidden">
                Chatbot
              </span>
              <span className="hidden group-data-[collapsible=icon]:block text-lg font-semibold px-2 hover:bg-muted rounded-md cursor-pointer">
                C
              </span>
            </Link>
            
            <div className="flex flex-row gap-1 items-center group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
                    asChild
                  >
                    <Link
                      href="/lessons"
                      onClick={() => {
                        setOpenMobile(false);
                      }}
                    >
                      <BookIcon className="h-4 w-4" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Aulas</TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    type="button"
                    className="p-2 h-fit group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8"
                    onClick={() => {
                      setOpenMobile(false);
                      router.push('/');
                      router.refresh();
                    }}
                  >
                    <PlusIcon />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">New Chat</TooltipContent>
              </Tooltip>
            </div>
          </div>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarHistory user={user} />
      </SidebarContent>
      <SidebarFooter>{user && <SidebarUserNav user={user} />}</SidebarFooter>
    </Sidebar>
  );
}
