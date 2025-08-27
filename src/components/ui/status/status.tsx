import { TimeIcon, VideoIcon } from "@/icons";
import { BoltIcon, ListIcon } from "lucide-react";

export const statusConfig = {
  active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" ,variants:"success" },
  inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" ,variants:"error"},
  draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" ,variants:"medium"},
  testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" ,variants:"low"}
};

export const caseStatus = [
  { title: "New", group: ["S001", "S008"] ,show:true},
  { title: "Assigned", group: ["S002", "S009"] ,show:true},
  { title: "In-progress ", group: ["S003", "S004", "S005", "S006", "S010", "S011", "S012", "S013", "S015", "S019"] ,show:true},
  { title: "On-Hold", group: ["S017", "S018"] ,show:false},
  { title: "Done", group: ["S007", "S016"] ,show:true},
  { title: "Cancel", group: ["S014"] ,show:false},
]

export const closeStatus =["S007", "S016", "S017", "S018"]

export const unitStatus = [
  { title: "ไม่พร้อมปฏิบัติการ", group: ["000"] },
  { title: "พร้อมปฏิบัติการ", group: ["001"] },
  { title: "ตอบรับ", group: ["002"] },
  { title: "กำลังเดินทาง", group: ["003"] },
  { title: "ถึงที่เกิดเหตุ", group: ["004"] },
  { title: "ถึงที่เกิดเหตุ", group: ["005"] },
  { title: "ปิดเหตุ", group: ["006"] },
  { title: "ถูกสั่งการ", group: ["007"] },
  // { title: "Cancel", group: ["S014"] },
]



export const statusIdToStatusTitle = (statusId: string) => {

    const status = caseStatus.find(col => col.group.includes(statusId));
    return status ? status.title : statusId;

}