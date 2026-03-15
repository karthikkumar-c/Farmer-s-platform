"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

const COLLECTIONS = [
  "users",
  "listings",
  "orders",
  "payments",
  "priceHistory",
  "verifications",
  "disputes",
];

export default function DatabaseViewer() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, any[]>>({});
  const [stats, setStats] = useState<Record<string, number>>({});

  const loadData = async () => {
    setLoading(true);
    try {
      const allData: Record<string, any[]> = {};
      const allStats: Record<string, number> = {};

      for (const collectionName of COLLECTIONS) {
        const q = query(collection(db, collectionName), limit(50));
        const snapshot = await getDocs(q);

        allStats[collectionName] = snapshot.size;
        allData[collectionName] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      }

      setData(allData);
      setStats(allStats);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const formatValue = (value: any): string => {
    if (value === null || value === undefined) return "null";
    if (typeof value === "object") {
      if (value.toDate && typeof value.toDate === "function") {
        return value.toDate().toLocaleString();
      }
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Database Viewer</h1>
          <p className="text-muted-foreground">
            Inspect Firestore collections and documents
          </p>
        </div>
        <Button onClick={loadData} disabled={loading}>
          {loading ? "Loading..." : "Refresh Data"}
        </Button>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(stats).map(([name, count]) => (
          <Card key={name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{count}</div>
              <p className="text-xs text-muted-foreground">documents</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Tables */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 gap-2">
          {COLLECTIONS.map((col) => (
            <TabsTrigger key={col} value={col} className="text-xs">
              {col}{" "}
              <Badge className="ml-1" variant="secondary">
                {stats[col] || 0}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {COLLECTIONS.map((collectionName) => (
          <TabsContent
            key={collectionName}
            value={collectionName}
            className="space-y-4"
          >
            <Card>
              <CardHeader>
                <CardTitle>Collection: {collectionName}</CardTitle>
                <CardDescription>
                  {stats[collectionName] || 0} documents found
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] w-full">
                  {data[collectionName]?.length > 0 ? (
                    <div className="space-y-4">
                      {data[collectionName].map((doc, idx) => (
                        <Card key={doc.id} className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <Badge variant="outline">ID: {doc.id}</Badge>
                            <Badge>Document {idx + 1}</Badge>
                          </div>
                          <div className="grid grid-cols-1 gap-2 mt-3">
                            {Object.entries(doc)
                              .filter(([key]) => key !== "id")
                              .map(([key, value]) => (
                                <div key={key} className="flex border-b pb-2">
                                  <div className="font-mono text-xs font-semibold text-blue-600 w-1/3">
                                    {key}:
                                  </div>
                                  <div className="font-mono text-xs text-muted-foreground w-2/3 break-all">
                                    {formatValue(value)}
                                  </div>
                                </div>
                              ))}
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No documents found in this collection
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
