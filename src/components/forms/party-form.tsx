"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth/auth-context";
import { useUserData } from "@/lib/data/user-data-context";
import { useSubmitGuard } from "@/lib/hooks/use-submit-guard";
import { createParty } from "@/lib/firestore/parties";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StickySave } from "@/components/ui/sticky-save";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LABOUR_CATEGORIES, MATERIAL_CATEGORIES } from "@/constants";
import { toast } from "sonner";
import type { PartyType } from "@/types";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const fieldClass = "h-12 rounded-2xl border-border bg-card shadow-card";

export function PartyForm({ defaultType }: { defaultType?: PartyType }) {
  const { user } = useAuth();
  const { refresh } = useUserData();
  const { runGuarded, lock } = useSubmitGuard();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [partyType, setPartyType] = useState<PartyType>(defaultType ?? "labour");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const categories =
    partyType === "labour" ? LABOUR_CATEGORIES : MATERIAL_CATEGORIES;

  const toggleItem = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || loading) return;

    await runGuarded(async () => {
      setLoading(true);
      try {
        const id = await createParty(user.uid, {
          partyType,
          name: name.trim() || "Unnamed party",
          phone: phone || undefined,
          ...(partyType === "labour"
            ? { skills: selectedItems }
            : { categories: selectedItems }),
        });
        await refresh();
        toast.success("Party created");
        lock();
        router.push(`/parties/${id}`);
      } catch {
        toast.error("Failed to create party");
        setLoading(false);
      }
    });
  };

  return (
    <>
      <form id="party-form" onSubmit={handleSubmit} className="space-y-4 pb-32">
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={partyType}
            onValueChange={(v) => {
              setPartyType(v as PartyType);
              setSelectedItems([]);
            }}
          >
            <SelectTrigger className={fieldClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="labour">Labour</SelectItem>
              <SelectItem value="material">Material Vendor</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            className={fieldClass}
            placeholder={partyType === "labour" ? "Raju Rastogi" : "ABC Traders"}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            className={fieldClass}
            placeholder="9999999999"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label>{partyType === "labour" ? "Skills" : "Categories"}</Label>
          <div className="flex flex-wrap gap-2">
            {categories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => toggleItem(item)}
                className={cn(
                  "min-h-[44px] rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  selectedItems.includes(item)
                    ? "bg-primary text-primary-foreground"
                    : "border border-border bg-card text-subtext"
                )}
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      </form>
      <StickySave form="party-form" loading={loading} label="Save" />
    </>
  );
}
