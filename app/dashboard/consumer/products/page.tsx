"use client";

import { useState, useEffect } from "react";
import { Search, Loader2, ShieldCheck, Zap } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  getVerifiedListings,
  createOrder,
  updateListing,
} from "@/lib/firestore";
import { getLoggedInUser } from "@/lib/auth";

const MILLET_TYPES = [
  "Finger Millet (Ragi)",
  "Pearl Millet (Bajra)",
  "Foxtail Millet",
  "Little Millet",
  "Kodo Millet",
  "Sorghum (Jowar)",
  "Proso Millet",
  "Barnyard Millet",
];

const DEFAULT_FILTERS = {
  targetPrice: 50,
  priceTolerancePct: 10,
  selectedMillets: [] as string[],
};

export default function BrowseCropsPage() {
  const [crops, setCrops] = useState<any[]>([]);
  const [usingSmartMatch, setUsingSmartMatch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");
  const [buyQuantity, setBuyQuantity] = useState("");
  const [selectedCrop, setSelectedCrop] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [showAllUsed, setShowAllUsed] = useState(false);

  useEffect(() => {
    async function fetchCrops() {
      try {
        const data = await getVerifiedListings();
        setCrops(data);
        setUsingSmartMatch(false);
      } catch (error) {
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchCrops();
  }, []);

  async function reloadListings() {
    setLoading(true);
    setMatchError("");
    try {
      const data = await getVerifiedListings();
      setCrops(data);
      setUsingSmartMatch(false);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const showAllVisible = usingSmartMatch && !showAllUsed;

  async function clearFilters() {
    setFilters(DEFAULT_FILTERS);
    setSearchTerm("");
    setMatchError("");
    setUsingSmartMatch(false);
    setShowAllUsed(false);
    await reloadListings();
  }

  const filteredCrops = crops.filter(
    (c) =>
      c.milletType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.farmerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.location?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  function toggleMilletType(millet: string) {
    const updated = filters.selectedMillets.includes(millet)
      ? filters.selectedMillets.filter((m) => m !== millet)
      : [...filters.selectedMillets, millet];
    setFilters({ ...filters, selectedMillets: updated });
    setShowAllUsed(false);
  }

  async function handleSmartMatch() {
    setMatchLoading(true);
    setMatchError("");
    setShowAllUsed(false);
    try {
      const response = await fetch("http://localhost:5000/api/ai/smart-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          maxPrice: filters.targetPrice,
          preferredQuality: "Standard",
          allowLowerQuality: true,
          priceTolerancePct: filters.priceTolerancePct || undefined,
          milletTypes:
            filters.selectedMillets.length > 0
              ? filters.selectedMillets
              : undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch matches");
      }

      const data = await response.json();
      const matches = (data.topMatches || []).map((match: any) => ({
        ...match,
        id: match.listingId,
      }));
      setCrops(matches);
      setUsingSmartMatch(true);
      setShowAllUsed(false);
    } catch (error: any) {
      setMatchError(error?.message || "Failed to fetch matches");
    } finally {
      setMatchLoading(false);
    }
  }

  async function handleShowAll() {
    setShowAllUsed(true);
    await reloadListings();
  }

  async function handleBuy() {
    if (!selectedCrop || !buyQuantity) return;
    const user = getLoggedInUser();
    if (!user) return;
    const qty = parseFloat(buyQuantity);
    if (isNaN(qty) || qty <= 0 || qty > selectedCrop.quantity) {
      toast.error("Invalid quantity");
      return;
    }
    setBuying(true);
    try {
      await createOrder({
        listingId: selectedCrop.id,
        buyerId: user.id,
        buyerName: user.name,
        buyerPhone: user.phone,
        sellerId: selectedCrop.farmerId,
        sellerName: selectedCrop.farmerName,
        sellerPhone: "",
        productName: selectedCrop.milletType,
        quantity: qty,
        unit: "kg",
        pricePerKg: selectedCrop.pricePerKg,
        totalPrice: qty * selectedCrop.pricePerKg,
        status: "placed",
        deliveryAddress: "Demo Address, Bangalore",
      });

      // Update the listing quantity after successful order
      const remainingQuantity = selectedCrop.quantity - qty;
      await updateListing(selectedCrop.id, { quantity: remainingQuantity });

      toast.success("Order placed successfully!");
      setSelectedCrop(null);
      setBuyQuantity("");

      // Refresh listings - this will automatically filter out zero-quantity items
      const updated = await getVerifiedListings();
      setCrops(updated);
    } catch (error) {
      toast.error("Failed to place order");
    } finally {
      setBuying(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Browse Verified Crops
        </h1>
        <p className="text-muted-foreground">
          All crops are quality-verified by local SHGs before listing
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by crop, farmer, or location..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setShowAllUsed(false);
            }}
            className="pl-9"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">Filters</Button>
          </SheetTrigger>
          {showAllVisible && (
            <Button variant="ghost" onClick={handleShowAll} disabled={loading}>
              Show All Crops
            </Button>
          )}
          <SheetContent side="right" className="flex h-full flex-col p-0">
            <SheetHeader>
              <SheetTitle>Smart Filters</SheetTitle>
              <SheetDescription>
                Adjust your matching criteria and apply filters.
              </SheetDescription>
            </SheetHeader>
            <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
              <div className="space-y-4">
                <div className="text-sm font-semibold text-muted-foreground">
                  Price
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target-price">Target Price (Rs/kg)</Label>
                  <Input
                    id="target-price"
                    type="number"
                    min="1"
                    value={filters.targetPrice}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        targetPrice: parseInt(e.target.value) || 0,
                      });
                      setShowAllUsed(false);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price-tolerance">Price Tolerance (%)</Label>
                  <Input
                    id="price-tolerance"
                    type="number"
                    min="0"
                    max="100"
                    value={filters.priceTolerancePct}
                    onChange={(e) => {
                      setFilters({
                        ...filters,
                        priceTolerancePct: parseInt(e.target.value) || 0,
                      });
                      setShowAllUsed(false);
                    }}
                  />
                </div>
              </div>
              <div className="space-y-3">
                <div className="text-sm font-semibold text-muted-foreground">
                  Millet Types
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {MILLET_TYPES.map((millet) => (
                    <button
                      key={millet}
                      onClick={() => toggleMilletType(millet)}
                      className={`p-2 rounded-lg border-2 text-xs transition ${
                        filters.selectedMillets.includes(millet)
                          ? "border-blue-500 bg-blue-50 font-medium"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {filters.selectedMillets.includes(millet) && (
                        <span className="mr-1">✓</span>
                      )}
                      {millet}
                    </button>
                  ))}
                </div>
              </div>
              {matchError && (
                <div className="text-sm text-red-600">{matchError}</div>
              )}
            </div>
            <SheetFooter>
              <Button onClick={handleSmartMatch} disabled={matchLoading}>
                {matchLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Finding matches...
                  </>
                ) : (
                  <>
                    <Zap className="mr-2 h-4 w-4" />
                    Apply Filters
                  </>
                )}
              </Button>
              {showAllVisible && (
                <Button
                  variant="outline"
                  onClick={handleShowAll}
                  disabled={loading}
                >
                  Show All Crops
                </Button>
              )}
              <Button variant="ghost" onClick={clearFilters}>
                Clear Filters
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {filteredCrops.length === 0 ? (
        <Card className="border-border">
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">No verified crops found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredCrops.map((crop) => (
            <Card key={crop.id} className="border-border flex flex-col">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg text-foreground">
                    {crop.milletType}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {usingSmartMatch && typeof crop.matchScore === "number" && (
                      <Badge variant="secondary">
                        Match {crop.matchScore}%
                      </Badge>
                    )}
                    <Badge
                      variant="default"
                      className="flex items-center gap-1"
                    >
                      <ShieldCheck className="h-3 w-3" /> Verified
                    </Badge>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  by {crop.farmerName}
                </p>
              </CardHeader>
              <CardContent className="flex-1 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Location</span>
                  <span className="text-foreground">{crop.location}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Taluk</span>
                  <span className="text-foreground">{crop.taluk || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Available</span>
                  <span className="text-foreground">{crop.quantity} kg</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Price</span>
                  <span className="font-bold text-primary">
                    Rs {crop.pricePerKg}/kg
                  </span>
                </div>
                {crop.verifiedByName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Verified by</span>
                    <span className="text-foreground">
                      {crop.verifiedByName}
                    </span>
                  </div>
                )}
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full"
                      onClick={() => {
                        setSelectedCrop(crop);
                        setBuyQuantity("");
                      }}
                    >
                      Buy Now
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Purchase {crop.milletType}</DialogTitle>
                      <DialogDescription>
                        From {crop.farmerName} - Rs {crop.pricePerKg}/kg (
                        {crop.quantity} kg available)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>Quantity (kg)</Label>
                        <Input
                          type="number"
                          min="1"
                          max={crop.quantity}
                          value={buyQuantity}
                          onChange={(e) => setBuyQuantity(e.target.value)}
                          placeholder="Enter quantity"
                        />
                      </div>
                      {buyQuantity && !isNaN(parseFloat(buyQuantity)) && (
                        <div className="p-3 bg-muted rounded-lg">
                          <p className="text-sm text-muted-foreground">
                            Total:{" "}
                            <span className="font-bold text-foreground">
                              Rs{" "}
                              {(
                                parseFloat(buyQuantity) * crop.pricePerKg
                              ).toFixed(2)}
                            </span>
                          </p>
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleBuy} disabled={buying}>
                        {buying ? "Placing Order..." : "Confirm Purchase"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
