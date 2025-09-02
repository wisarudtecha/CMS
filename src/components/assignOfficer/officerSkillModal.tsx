import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"
import { Unit } from "@/store/api/dispatch"
import { Wrench } from "lucide-react"
import Badge from "../ui/badge/Badge"

interface CreateSubCaseModel {
    open: boolean
    officer: Unit
    onOpenChange: (isOpen: boolean) => void
}

export default function SkillModal({
    // officer,
    open,
    onOpenChange,
}: CreateSubCaseModel) {
    const skillList = ["กล้อง", "Sensor น้ำ", "เชื่อมท่อ", "ระบบไฟฟ้า", "การซ่อมบำรุง", "เครื่องมือวัด"]
    
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[90vw] md:w-[70vw] h-[70vh] flex flex-col z-99999 rounded-lg shadow-2xl">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                        {/* <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-full">
                            <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <span>รายการทักษะ</span>
                            <p className="text-sm font-normal text-gray-600 dark:text-gray-400 mt-1">
                                เจ้าหน้าที่: {officer?.username || 'ไม่ระบุ'}
                            </p>
                        </div> */}
                    </DialogTitle>
                </DialogHeader>

                <div className="flex-1 overflow-auto p-6 space-y-6">
                    {/* Officer Info Card */}
                    {/* <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 p-4 rounded-lg border border-blue-200 dark:border-gray-600">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">{officer?.username || 'เจ้าหน้าที่'}</h3>
                                <p className="text-gray-600 dark:text-gray-400">รหัส: {officer?.id || 'ไม่ระบุ'}</p>
                            </div>
                        </div>
                    </div> */}

                    {/* Skills List */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <Wrench className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                                Skill List
                            </h3>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {skillList.map((skill, index) => (
                                <div
                                    key={index}
                                    className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg p-4 hover:shadow-md hover:border-blue-300 dark:hover:border-blue-600 transition-all duration-200 cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                                            {skill}
                                        </span>
                                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 dark:border-gray-600 group-hover:border-blue-500 flex items-center justify-center">

                                        </div>
                                    </div>
                                    <div className="mt-2">
                                        <Badge  className="text-xs">
                                            พื้นฐาน
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Alternative: Simple Badge List */}
                        {/* <div className="flex flex-wrap gap-3">
                            {skillList.map((skill, index) => (
                                <Badge
                                    key={index}
                                    variant="outline"
                                    className="px-4 py-2 text-sm font-medium bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-blue-50 dark:hover:bg-blue-900 hover:border-blue-300 dark:hover:border-blue-600 cursor-pointer transition-colors"
                                >
                                    {skill}
                                </Badge>
                            ))}
                        </div> */}
                    </div>
                </div>

                {/* <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                 
                
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}