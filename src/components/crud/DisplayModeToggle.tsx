// /src/components/crud/DisplayModeToggle.tsx
import React from "react";
import Button from "@/components/ui/button/Button";
import { GridIcon, ListIcon } from "@/icons";

interface DisplayModeToggleProps {
  mode: "card" | "table";
  onChange: (mode: "card" | "table") => void;
}

export const DisplayModeToggle: React.FC<DisplayModeToggleProps> = ({
  mode,
  onChange
}) => {
  return (
    <div className="flex items-center gap-2">
      {/* <span className="text-sm text-gray-600 dark:text-gray-300">View:</span> */}
      <div className="flex rounded-lg overflow-hidden">
        <Button
          onClick={() => onChange("card")}
          className="rounded-r-none h-11"
          variant={mode === "card" ? "primary" : "outline"}
        >
          <GridIcon className="w-4 h-4" />
        </Button>
        <Button
          onClick={() => onChange("table")}
          className="rounded-l-none h-11"
          variant={mode === "table" ? "primary" : "outline"}
        >
          <ListIcon className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
