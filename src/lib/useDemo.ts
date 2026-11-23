'use client';
import { useEffect, useState } from 'react';
import { getDemoState, observeState, type DemoState } from './demo-store';
export function useDemo(){const [state,setState]=useState<DemoState|null>(null);useEffect(()=>{const refresh=()=>setState(getDemoState());refresh();return observeState(refresh)},[]);return state;}
