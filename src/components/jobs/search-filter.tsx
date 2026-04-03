"use client";

import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Search } from "lucide-react";

type SearchFilterProps = {
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function SearchFilter({ onSearch, onStatusChange, onSortChange }: SearchFilterProps) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row lg:items-end">
      <div className="flex-1">
        <Input
          placeholder="Search by company or position..."
          onChange={(e) => onSearch(e.target.value)}
          className="pl-9"
        />
        <Search className="absolute left-3 top-[3.2rem] h-4 w-4 text-zinc-400" />
      </div>
      <div className="w-full sm:w-40">
        <Select
          options={[
            { value: "all", label: "All Status" },
            { value: "Applied", label: "Applied" },
            { value: "Interview", label: "Interview" },
            { value: "Rejected", label: "Rejected" },
            { value: "Offer", label: "Offer" },
          ]}
          defaultValue="all"
          onChange={(e) => onStatusChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-44">
        <Select
          options={[
            { value: "date-desc", label: "Newest First" },
            { value: "date-asc", label: "Oldest First" },
            { value: "company", label: "Company (A-Z)" },
            { value: "status", label: "Status" },
          ]}
          defaultValue="date-desc"
          onChange={(e) => onSortChange(e.target.value)}
        />
      </div>
    </div>
  );
}
