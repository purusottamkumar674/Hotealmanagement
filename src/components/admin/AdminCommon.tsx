'use client';
import type { ReactNode } from 'react';
import { Download } from 'lucide-react';
export function AdminHeader({title,subtitle,actions}:{title:string;subtitle?:string;actions?:ReactNode}){return <div className="admin-page-heading"><div><h1>{title}</h1><p>{subtitle}</p></div>{actions&&<div className="admin-header-actions">{actions}</div>}</div>}
export function Pill({status}:{status:string}){const s=status.toLowerCase();const cls=s.includes('confirm')||s.includes('done')||s.includes('paid')||s.includes('replied')?'confirmed':s.includes('cancel')||s.includes('failed')?'cancelled':s.includes('pending')||s.includes('await')?'pending':s.includes('progress')?'progress':'';return <span className={`status ${cls}`}>{status}</span>}
export function exportCSV(filename:string,headers:string[],rows:(string|number)[][]){const csv=[headers,...rows].map(row=>row.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n');const file=new Blob(['\ufeff',csv],{type:'text/csv;charset=utf-8;'});const url=URL.createObjectURL(file);const a=document.createElement('a');a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}
export function DemoNote({children}:{children?:ReactNode}){return <div className="admin-note">{children||'Preview data only — no Supabase connection or real hotel integration is active. Changes are saved in this browser.'}</div>}
export function EmptyAdmin({text}:{text:string}){return <div className="admin-empty">{text}</div>}
