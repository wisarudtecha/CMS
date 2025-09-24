import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog/dialog"
import { Unit } from "@/store/api/dispatch"
import { useTranslation } from "@/hooks/useTranslation"
import { DepartmentCommandStationDataMerged, mergeDeptCommandStation } from "@/store/api/caseApi"
import { useGetUserByUserNameQuery } from "@/store/api/userApi"
import { useMemo } from "react"
import { User, AtSign, Phone, Mail, Truck, Tag, Building } from "lucide-react"

interface CreateSubCaseModel {
    open: boolean
    officer: Unit
    onOpenChange: (isOpen: boolean) => void
}

export default function OfficerDetailModal({
    officer,
    open,
    onOpenChange,
}: CreateSubCaseModel) {
    const { data: userData, isLoading } = useGetUserByUserNameQuery({ username: officer?.username })
    const { t } = useTranslation();
    const deptComStn = useMemo(() =>
        JSON.parse(localStorage.getItem("DeptCommandStations") ?? "[]") as DepartmentCommandStationDataMerged[], []
    );
    const userStation = deptComStn.find((items) => {
        return items.commId === userData?.data?.commId && items.stnId === userData?.data?.stnId && items.deptId === userData.data.deptId;
    });
    if (isLoading) {
        return (
            <Dialog open={!!officer} onOpenChange={onOpenChange}>
                <DialogContent aria-describedby="" className="bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700 max-w-4xl w-[90vw] md:w-[70vw] max-h-[90vh] overflow-y-auto custom-scrollbar flex flex-col">
                    <DialogHeader>
                        <DialogTitle hidden={true}>

                        </DialogTitle>
                    </DialogHeader>
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading officer data...</p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        )
    }
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white max-w-4xl w-[90vw] md:w-[70vw] h-[70vh] flex flex-col z-1000001 rounded-lg shadow-2xl">
                <DialogHeader className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <DialogTitle className="flex items-center gap-3 text-2xl font-bold">
                        {t("case.officer_detail.personal_title")}
                    </DialogTitle>
                </DialogHeader>
                <div className=" dark:border-gray-700 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                                <div className="flex items-center gap-2 mb-3">
                                    <h3 className="font-semibold text-blue-500 dark:text-blue-400">{t("case.officer_detail.personal_title")}</h3>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                                <User className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.fullname")}</label>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 ml-6">
                                            {userData?.data?.firstName && userData?.data?.lastName
                                                ? `${userData.data.firstName} ${userData.data.lastName}`
                                                : "N/A"
                                            }
                                        </p>
                                    </div>
                                    
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                                <AtSign className="w-3 h-3 text-gray-600 dark:text-gray-300" />                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.username")}</label>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 font-mono ml-6">
                                            {officer?.username || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">                                                <Phone className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.mobile_number")}</label>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 font-mono ml-6">
                                            {userData?.data?.mobileNo || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                                <Mail className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                            <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.email")}</label>
                                        </div>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 ml-6">
                                            {userData?.data?.email || "N/A"}
                                        </p>
                                    </div>

                                    {/* <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">Department</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1">
                                            {userData?.data?.commId || "N/A"}
                                        </p>
                                    </div> */}
                                </div>
                            </div>
                        </div>

                        {/* Service Information */}
                        <div className="flex flex-col h-full">
                            <div className="space-y-4 mb-3">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                                    <div className="flex items-center gap-2 mb-3 text-blue-500 dark:text-blue-400">
                                            <Truck className="w-4 h-4  " />
                                        <h3 className="font-semibold ">{t("case.officer_detail.service_title")}</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                    <Tag className="w-3 h-3 text-gray-600 dark:text-gray-300" />
                                                <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.vehicle")}</label>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 ml-6">
                                                {officer?.unitId || "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg flex-1 flex flex-col">
                                    <div className="flex items-center gap-2 mb-3 text-blue-500 dark:text-blue-400">
                                            <Building className="w-4 h-4" />
                                        <h3 className="font-semibold">{t("userform.orgInfo")}</h3>
                                    </div>

                                    <div className="flex-1 flex ">
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400">
                                            {userStation && mergeDeptCommandStation(userStation) || "N/A"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Address Section - Full Width */}
                    {/* {userData?.data?.address && (
                        <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                                    <span className="text-gray-600 dark:text-gray-300 text-xs">📍</span>
                                </div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("case.officer_detail.address")}</label>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-8">
                                {userData.data.address}
                            </p>
                        </div>
                    )} */}


                </div>


                {/* <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                 
                
                </DialogFooter> */}
            </DialogContent>
        </Dialog>
    )
}