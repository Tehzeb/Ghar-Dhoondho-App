import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export type PropertyType = "house" | "apartment" | "plot" | "commercial" | "farmhouse";
export type ListingType = "sale" | "rent";
export type City = "Karachi" | "Lahore" | "Multan" | "Chakwal" | "Islamabad" | "Rawalpindi";

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  listingType: ListingType;
  price: number;
  city: City | string;
  area: string;
  description: string;
  images: string[];
  bedrooms: number;
  bathrooms: number;
  size: string;
  ownerId: string;
  ownerName: string;
  ownerPhone: string;
  createdAt: string;
  featured: boolean;
}

export interface Transaction {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyCity: string;
  propertyType: string;
  transactionType: "sale" | "rent";
  buyerOrRenterId: string;
  buyerOrRenterName: string;
  buyerOrRenterEmail: string;
  sellerOrOwnerId: string;
  sellerOrOwnerName: string;
  sellerOrOwnerEmail: string;
  amount: number;
  date: string;
}

const PROPERTIES_KEY = "ghardhoondo_properties";
const TRANSACTIONS_KEY = "ghardhoondo_transactions";

const SAMPLE_PROPERTIES: Property[] = [
  {
    id: "sample1",
    title: "Modern 4-Bedroom House in DHA",
    type: "house",
    listingType: "sale",
    price: 25000000,
    city: "Lahore",
    area: "DHA Phase 5",
    description: "A beautiful modern house with spacious rooms, marble flooring, and a lush green garden. Located in the heart of DHA with easy access to main boulevard.",
    images: [],
    bedrooms: 4,
    bathrooms: 4,
    size: "10 Marla",
    ownerId: "sample_owner1",
    ownerName: "Ahmed Ali",
    ownerPhone: "0300-1234567",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    featured: true,
  },
  {
    id: "sample2",
    title: "Luxury Apartment in Clifton",
    type: "apartment",
    listingType: "rent",
    price: 85000,
    city: "Karachi",
    area: "Clifton Block 2",
    description: "Stunning sea-view apartment on the 12th floor with premium finishes. Fully furnished with modern kitchen and walk-in closets.",
    images: [],
    bedrooms: 3,
    bathrooms: 2,
    size: "1800 sq ft",
    ownerId: "sample_owner2",
    ownerName: "Sara Khan",
    ownerPhone: "0321-9876543",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    featured: true,
  },
  {
    id: "sample3",
    title: "Commercial Plot in Multan",
    type: "plot",
    listingType: "sale",
    price: 8500000,
    city: "Multan",
    area: "Gulgasht Colony",
    description: "Prime commercial plot on main road with ideal footfall for business. All utilities available.",
    images: [],
    bedrooms: 0,
    bathrooms: 0,
    size: "4 Marla",
    ownerId: "sample_owner3",
    ownerName: "Bilal Mehmood",
    ownerPhone: "0333-5556789",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    featured: false,
  },
  {
    id: "sample4",
    title: "Cozy 2-Bedroom Apartment",
    type: "apartment",
    listingType: "rent",
    price: 45000,
    city: "Islamabad",
    area: "F-10 Markaz",
    description: "Well-maintained apartment in a secure society with 24/7 guard, backup generator, and ample parking.",
    images: [],
    bedrooms: 2,
    bathrooms: 2,
    size: "1200 sq ft",
    ownerId: "sample_owner4",
    ownerName: "Farah Nawaz",
    ownerPhone: "0311-4445566",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    featured: false,
  },
  {
    id: "sample5",
    title: "Farmhouse with Pool in Chakwal",
    type: "farmhouse",
    listingType: "sale",
    price: 15000000,
    city: "Chakwal",
    area: "Talagang Road",
    description: "Beautiful farmhouse spread over 2 kanals with swimming pool, fruit trees, and servant quarters. Perfect weekend retreat.",
    images: [],
    bedrooms: 5,
    bathrooms: 4,
    size: "2 Kanal",
    ownerId: "sample_owner5",
    ownerName: "Imran Malik",
    ownerPhone: "0345-7778899",
    createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
    featured: true,
  },
];

interface PropertiesContextType {
  properties: Property[];
  transactions: Transaction[];
  addProperty: (p: Omit<Property, "id" | "createdAt">) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>;
  addTransaction: (t: Omit<Transaction, "id" | "date">) => Promise<void>;
  refreshProperties: () => Promise<void>;
}

const PropertiesContext = createContext<PropertiesContextType | null>(null);

export function PropertiesProvider({ children }: { children: React.ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const load = useCallback(async () => {
    const [propRaw, txRaw] = await Promise.all([
      AsyncStorage.getItem(PROPERTIES_KEY),
      AsyncStorage.getItem(TRANSACTIONS_KEY),
    ]);
    const loaded: Property[] = propRaw ? JSON.parse(propRaw) : [];
    const merged = [...SAMPLE_PROPERTIES, ...loaded.filter((p) => !SAMPLE_PROPERTIES.find((s) => s.id === p.id))];
    setProperties(merged);
    if (txRaw) setTransactions(JSON.parse(txRaw));
  }, []);

  useEffect(() => { load(); }, [load]);

  const addProperty = useCallback(async (p: Omit<Property, "id" | "createdAt">) => {
    const newProp: Property = {
      ...p,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
    setProperties((prev) => {
      const updated = [newProp, ...prev];
      AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated.filter((x) => !SAMPLE_PROPERTIES.find((s) => s.id === x.id))));
      return updated;
    });
  }, []);

  const deleteProperty = useCallback(async (id: string) => {
    setProperties((prev) => {
      const updated = prev.filter((p) => p.id !== id);
      AsyncStorage.setItem(PROPERTIES_KEY, JSON.stringify(updated.filter((x) => !SAMPLE_PROPERTIES.find((s) => s.id === x.id))));
      return updated;
    });
  }, []);

  const addTransaction = useCallback(async (t: Omit<Transaction, "id" | "date">) => {
    const newTx: Transaction = {
      ...t,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString(),
    };
    setTransactions((prev) => {
      const updated = [...prev, newTx];
      AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshProperties = useCallback(async () => { await load(); }, [load]);

  return (
    <PropertiesContext.Provider value={{ properties, transactions, addProperty, deleteProperty, addTransaction, refreshProperties }}>
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const ctx = useContext(PropertiesContext);
  if (!ctx) throw new Error("useProperties must be used within PropertiesProvider");
  return ctx;
}
