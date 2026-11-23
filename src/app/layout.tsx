import type { Metadata } from 'next';
import './globals.css';
import { AppChrome } from '@/components/AppChrome';
export const metadata: Metadata={
  title:{default:'Flower Inn & Petal Inn | A beautiful way to stay',template:'%s | Flower & Petal'},
  description:'Explore Flower Inn and Petal Inn in one elegant hotel booking website. Discover rooms, see illustrative pricing, and explore our frontend booking preview.',
  robots:{index:false,follow:false},
};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><AppChrome>{children}</AppChrome></body></html>;}
