"use client";
import type { Hotel } from "@/lib/catalog";
import { createContext, useContext } from "react";
export const BrandContext = createContext<Hotel[]>([]);
export const useBrands = () => useContext(BrandContext);
