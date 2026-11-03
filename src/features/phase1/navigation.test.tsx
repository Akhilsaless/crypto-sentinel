import { afterEach, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { navigationGroups } from '@/data/navigation';
afterEach(cleanup);
it('retains all old routes and adds unique workspace destinations',()=>{
 const urls=navigationGroups.flatMap(g=>g.items.map(i=>i.url));
 expect(urls).toHaveLength(18);expect(new Set(urls).size).toBe(18);
 for(const path of ['/dashboard','/agent','/opportunities/buys','/opportunities/avoid','/opportunities/exits','/strategy','/exchanges','/execution','/logs','/portfolio','/health','/opportunities','/alerts','/journal','/chart-review','/learn','/paper-lab','/market-scanner']) expect(urls).toContain(path);
});
it('sidebar navigates without marking explorer active on detailed pages',()=>{render(<MemoryRouter initialEntries={['/opportunities/buys']}><SidebarProvider><AppSidebar/></SidebarProvider><Routes><Route path='/journal' element={<h1>Journal destination</h1>}/></Routes></MemoryRouter>);expect(screen.getByRole('link',{name:'Top Buys'})).toHaveAttribute('aria-current','page');expect(screen.getByRole('link',{name:'Signal Explorer'})).not.toHaveAttribute('aria-current');fireEvent.click(screen.getByRole('link',{name:'Journal'}));expect(screen.getByRole('heading')).toHaveTextContent('Journal destination');});
it('mobile navigation uses this projects existing routes',()=>{render(<MemoryRouter initialEntries={['/dashboard']}><MobileBottomNav/><Routes><Route path='/portfolio' element={<h1>Portfolio destination</h1>}/></Routes></MemoryRouter>);expect(screen.getByRole('link',{name:'Agent'})).toHaveAttribute('href','/agent');expect(screen.getByRole('link',{name:'Top Buys'})).toHaveAttribute('href','/opportunities/buys');fireEvent.click(screen.getByRole('link',{name:'Portfolio'}));expect(screen.getByRole('heading')).toHaveTextContent('Portfolio destination');});