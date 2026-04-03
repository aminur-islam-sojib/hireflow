"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

type SearchFilterProps = {
  onSearch: (value: string) => void;
  onStatusChange: (value: string) => void;
  onSortChange: (value: string) => void;
};

export function SearchFilter({
  onSearch,
  onStatusChange,
  onSortChange,
}: SearchFilterProps) {
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
          defaultValue="all"
          onValueChange={(value) => onStatusChange(value ?? "all")}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Applied">Applied</SelectItem>
            <SelectItem value="Interview">Interview</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
            <SelectItem value="Offer">Offer</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-44">
        <Select
          defaultValue="date-desc"
          onValueChange={(value) => onSortChange(value ?? "date-desc")}
        >
          <SelectTrigger className="w-full h-10">
            <SelectValue placeholder="Newest First" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-desc">Newest First</SelectItem>
            <SelectItem value="date-asc">Oldest First</SelectItem>
            <SelectItem value="company">Company (A-Z)</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
