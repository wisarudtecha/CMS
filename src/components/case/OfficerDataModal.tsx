import { UnitWithSop } from "@/store/api/dispatch"
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog/dialog"
import { useGetUserByUserNameQuery } from "@/store/api/userApi"
import { mapSopToOrderedProgress } from "./sopStepTranForm"
import { useMemo } from "react"
import { DialogTitle } from "@radix-ui/react-dialog"
import ProgressStepPreviewUnit from "./activityTimeline/unitActivityTimeline"
import { useTranslation } from "@/hooks/useTranslation"

interface OfficerDataModal {
    officer: UnitWithSop
    onOpenChange: () => void
}

export default function OfficerDataModal({
    officer,
    onOpenChange,
}: OfficerDataModal) {
    const { data: userData, isLoading } = useGetUserByUserNameQuery({ username: officer.unit.username })
    const { t,language} = useTranslation();
    const progressSteps = useMemo(() => {
        return mapSopToOrderedProgress(officer.Sop,language);
    }, [officer]);

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
        <Dialog open={!!officer} onOpenChange={onOpenChange}>
            <DialogHeader>
                <DialogTitle hidden={true}>

                </DialogTitle>
            </DialogHeader>
            <DialogContent aria-describedby="" className=" dark:text-white bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 max-w-4xl w-[90vw] md:w-[70vw] max-h-[90vh] overflow-y-auto custom-scrollbar z-99999 rounded-xl shadow-2xl">

                {/* Header */}
                {/* <div className="bg-gradient-to-r from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 px-6 py-4  top-0  rounded-2xl">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        Officer Information
                    </h2>
                </div> */}

                {/* Officer Details Section */}
                <div className=" dark:border-gray-700 rounded-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                                <div className="flex items-center gap-2 ">

                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t("case.officer_detail.personal_title")}</h3>
                                </div>

                                <div className="">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.fullname")}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1">
                                            {userData?.data?.firstName && userData?.data?.lastName
                                                ? `${userData.data.firstName} ${userData.data.lastName}`
                                                : "N/A"
                                            }
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.username")}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1 font-mono">
                                            {officer?.unit?.username || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.mobile_number")}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1 font-mono">
                                            {userData?.data?.mobileNo || "N/A"}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.email")}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1">
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
                        <div className="">
                        <div className="space-y-4 mb-3">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t("case.officer_detail.service_title")}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.vehicle")}</label>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1">
                                            {officer?.unit?.unitId || "N/A"}

                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                                <div className="flex items-center gap-2">
                                    <h3 className="font-semibold text-gray-900 dark:text-white">{t("userform.orgInfo")}</h3>
                                </div>

                                <div className="space-y-3">
                                    <div>
                                        {/* <label className="text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wide">{t("case.officer_detail.vehicle")}</label> */}
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-400 mt-1">
                                            {  "N/A"}

                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        </div>
                    </div>

                    {/* Address Section - Full Width */}
                    {/* {userData?.data?.address && (
                        <div className="mt-6 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg  ">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                                    <span className="text-purple-600 dark:text-purple-400 text-xs">📍</span>
                                </div>
                                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{t("case.officer_detail.address")}</label>
                            </div>
                            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-8">
                                {userData.data.address}
                            </p>
                        </div>
                    )} */}


                </div>

                {/* Progress Steps Section */}
                <div className="rounded-2xl">
                    <div className="flex items-center gap-2 mb-6">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{t("case.officer_detail.service_progress_title")}</h3>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg   p-6">
                        <ProgressStepPreviewUnit progressSteps={progressSteps} />
                    </div>
                </div>

                {/* Footer with additional details */}
                {/* <div className="bg-gray-100 dark:bg-gray-900 p-6 border-t border-gray-200 dark:border-gray-700">
                    <div className="text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Last updated: {new Date().toLocaleString()} • Officer ID: {officer?.unit?.unitId}
                        </p>
                    </div>
                </div> */}
            </DialogContent>


        </Dialog>
    )
}