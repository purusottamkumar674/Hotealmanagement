'use client';
import { BookingsPanel, CalendarPanel, GuestsPanel, InventoryPanel, PaymentsPanel, PricingPanel, RefundsPanel } from './OperationsPanels';
import { CmsPanel, GalleryPanel, OffersPanel, ReportsPanel, ReviewsPanel, SeoPanel } from './MarketingPanels';
import { AuditPanel, HotelsPanel, IntegrationsPanel, NotificationsPanel, RoomsAdminPanel, SettingsPanel, StaffPanel } from './SystemPanels';
export function AdminSection({section}:{section:string}){switch(section){
 case 'hotels':return <HotelsPanel/>;case 'rooms':return <RoomsAdminPanel/>;case 'inventory':return <InventoryPanel/>;case 'calendar':return <CalendarPanel/>;case 'pricing':return <PricingPanel/>;
 case 'bookings':return <BookingsPanel/>;case 'guests':return <GuestsPanel/>;case 'payments':return <PaymentsPanel/>;case 'refunds':return <RefundsPanel/>;
 case 'reviews':return <ReviewsPanel/>;case 'seo':return <SeoPanel/>;case 'reports':return <ReportsPanel/>;case 'cms':return <CmsPanel/>;case 'offers':return <OffersPanel/>;case 'gallery':return <GalleryPanel/>;
 case 'staff':return <StaffPanel/>;case 'notifications':return <NotificationsPanel/>;case 'integrations':return <IntegrationsPanel/>;case 'audit-logs':return <AuditPanel/>;case 'settings':return <SettingsPanel/>;
 default:return null;
 }}
