import { TimeIcon, VideoIcon } from "@/icons";
import { BoltIcon, ListIcon } from "lucide-react";

export const statusConfig = {
  active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" ,variants:"success" },
  inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" ,variants:"error"},
  draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" ,variants:"medium"},
  testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" ,variants:"low"}
};

