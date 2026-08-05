"use client";

import { Search, X } from "lucide-react";
import { forwardRef, type InputHTMLAttributes } from "react";

import { cn } from "@pergon/ui/lib/utils";
import { Input } from "./input";

interface SearchInputProps extends InputHTMLAttributes<HTMLInputElement> {
  onClear?: () => void;
}

const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, value, defaultValue, ...props }, ref) => {
    const hasValue =
      value !== undefined
        ? String(value).length > 0
        : defaultValue !== undefined && String(defaultValue).length > 0;

    return (
      <div className="relative">
        <Search
          aria-hidden="true"
          className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
        />
        <Input
          ref={ref}
          type="search"
          value={value}
          defaultValue={defaultValue}
          className={cn("pl-9", onClear && "pr-9", className)}
          {...props}
        />
        {onClear && hasValue ? (
          <button
            type="button"
            aria-label="Limpiar búsqueda"
            onClick={onClear}
            className="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring absolute right-1 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-sm transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50"
          >
            <X className="size-4" />
          </button>
        ) : null}
      </div>
    );
  },
);
SearchInput.displayName = "SearchInput";

export { SearchInput };
export type { SearchInputProps };
