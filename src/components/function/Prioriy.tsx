export const getPriorityColorClass = (priority: number): string => {
    if (priority <= 3) return "bg-red-600"
    if (priority <= 6) return "bg-yellow-600"
    return "bg-blue-600"
}
export const getPriorityBorderColorClass = (priority: number): string => {
    if (priority <= 3) return "border-l-red-600"
    if (priority <= 6) return "border-l-yellow-500"
    return "border-l-blue-600"
}
export const getTextPriority = (priority: number): string => {
    if (priority <= 3) return "High"
    if (priority <= 6) return "Medium"
    return "Low"
}