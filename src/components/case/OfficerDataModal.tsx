import { UnitWithSop } from "@/store/api/dispatch"
import { Dialog, DialogContent } from "@/components/ui/dialog/dialog"
import { useGetUserByUserNameQuery } from "@/store/api/userApi"
import { mapSopToOrderedProgress } from "./sopStepTranForm"
import { useMemo } from "react"
import ProgressStepPreview from "../progress/ProgressBar"
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
    const { data: userData, isLoading } = useGetUserByUserNameQuery({ username: officer.unit.username })
    const progressSteps = useMemo(() => {
            return mapSopToOrderedProgress(officer.Sop);
        }, [officer]);
    if (isLoading) {
        return (
            <Dialog open={!!officer} onOpenChange={onOpenChange}>
                <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[90vw] md:w-[70vw] h-[70vh] flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }
    return (
        <Dialog open={!!officer} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[90vw] md:w-[70vw] h-[70vh] flex flex-col z-99999 rounded-lg shadow-2xl">
                <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg `}>
                    Officer Data
                    <div>
                        <div className="grid-cols-2 grid gap-2">
                            <div>
                                Name : {userData?.data?.firstName + " " + userData?.data?.lastName}
                            </div>
                            <div>
                                Mobile Number : {userData?.data?.mobileNo}
                            </div>
                        </div>
                        <div>
                            Address : {userData?.data?.address}
                        </div>
                        <div>
                            Vehicle : {officer?.unit?.unitId}
                        </div>
                    </div>
                </div>
                {/* <div className=" overflow-auto custom-scrollbar">
                    <CaseCard caseData={officer.Sop} editFormData={false} showAttachButton={false} showCommentButton={false} />

                    <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg `}>
                        <div className="mb-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">หน่วยงาน</span>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["1. Service Type:"] ?? "-"}</div>
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
                </div> */}
                <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg `}>
                    <ProgressStepPreview progressSteps={progressSteps}/>
                </div>
                {/* <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                 
                
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}