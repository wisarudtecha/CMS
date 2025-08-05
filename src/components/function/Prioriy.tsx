
export interface PriorityText {
  level: "High" | "Medium" | "Low" ;
    color: "high" | "medium" | "low" ;
}
export const getPriorityColorClass = (priority: number): string => {
    if (priority <= 0) return ""
    if (priority <= 3) return "bg-red-600"
    if (priority <= 6) return "bg-yellow-600"
    return "bg-blue-600"
}
export const getPriorityBorderColorClass = (priority: number): string => {
    if (priority <= 0) return ""
    if (priority <= 3) return "border-l-red-600"
    if (priority <= 6) return "border-l-yellow-500"
    return "border-l-blue-600"
}
export const getTextPriority = (priority: number): PriorityText => {
  if (priority <= 3) return { level: "High" ,color: "high" };
  if (priority <= 6) return { level: "Medium" ,color: "medium" };
  return { level: "Low",color: "low"  };
};