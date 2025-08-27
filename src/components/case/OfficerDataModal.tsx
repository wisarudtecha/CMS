import { UnitWithSop } from "@/store/api/dispatch"
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog"
import { CaseCard } from "./sopCard"
interface OfficerDataModal {
    // open: boolean
    officer: UnitWithSop
    onOpenChange: () => void
}

export default function OfficerDataModal({
    officer,
    // open,
    onOpenChange,
}: OfficerDataModal) {

    return (
        <Dialog open={!!officer} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[90vw] md:w-[70vw] h-[70vh] flex flex-col z-99999 rounded-lg shadow-2xl">
                {/* <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span>รายการทักษะ</span>
                            <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                เจ้าหน้าที่: {officer?.username || 'ไม่ระบุ'}
                            </p>
                        </div>
                    </DialogTitle>
                </DialogHeader> */}
                <div className=" overflow-auto custom-scrollbar">
                    <CaseCard caseData={officer.Sop} editFormData={false} showAttachButton={false} showCommentButton={false} />
                    <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg `}>
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">หน่วยงาน</span>
                            {/* <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["1. Service Type:"] ?? "-"}</div> */}
                            <div className="text-sm font-medium text-gray-900 dark:text-white">หน่วงงาน 1</div>
                        </div>
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">หมายเลขรถ</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">001</div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">เจ้าหน้าที่สายตรวจ</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">watee</div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">วันเวลาที่สั่งการ</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white"><br /></div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">วันเวลาที่ตอบรับสั่งการ</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white"><br /></div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">วันเวลาที่ถึงจุดขอรับบริการ</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white"><br /></div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">วันเวลาที่เสร็จสิ้น</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white"><br /></div>
                        </div>
                        <div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">ระยะเวลา</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">ตอบรับงาน : 00:00:00 เดินทาง 00.00.00 ปฎิบัติงาน 00.00.00</div>
                        </div>
                    </div>
                </div>
                {/* <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                 
                
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}