
import { useEffect, useState } from "react"
import {
    Cpu,
    Tag,
    Wifi,
    X
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import { getPriorityBorderColorClass, getPriorityColorClass } from "../function/Prioriy"
import CaseHistory from "@/utils/json/caseHistory.json"
import Avatar from "../ui/avatar/Avatar"
import React from "react"
import DateStringToDateFormat from "../date/DateToString"
import { mergeAddress } from "@/store/api/custommerApi"
import { CaseDetails, CaseEntity } from "@/types/case"
import { useGetDeviceIoTQuery } from "@/store/api/deviceIoT"
import { Device } from "@/types/deviceIoT"
import { statusIdToStatusTitle } from "../ui/status/status"
import { useNavigate } from "react-router"
import { useTranslation } from "@/hooks/useTranslation"



interface PanelProps {
    caseItem?: CaseDetails;
    referCaseList?: string[];
    onClose: () => void;
}
const Panel: React.FC<PanelProps> = ({ onClose, caseItem, referCaseList }) => {
    const [activeRightPanel, setActiveRightPanel] = useState<"customer" | "cases">("customer");
    const [activeTab, setActiveTab] = useState("Device info");
    const [device, setDevice] = useState<Device>()
    const [referCase, setReferCase] = useState<CaseEntity[]>([]);
    const { t,language } = useTranslation();
    const tabs = [
        { id: "Device info", label: t("case.panel.device_info") }
    ];

    const navigate = useNavigate()

    if (referCaseList && referCaseList.length != 0) {
        tabs.push({ id: "Subcase", label: "Subcase" });


    }

    
    useEffect(() => {
        if (referCaseList) {

            try {
                const caseList = localStorage.getItem("caseList");
                caseList && setReferCase(
                    JSON.parse(caseList).filter((caseItem: CaseEntity) =>
                        referCaseList.includes(caseItem.caseId)
                    ) as CaseEntity[]
                );
            } catch (error) {
                console.log(error);
            }
        }
    }, [referCaseList])


    // const addTab = [
    //     // { id: "customer-info", label: "Info" },
    //     { id: "Device info", label: "Device info" },
    //     // { id: "Location", label: "Location" },
    //     // { id: "Knowledge Base", label: "Knowledge Base" },
    //     // { id: "FAQ", label: "FAQ" },
    // ];
    const serviceHistory = CaseHistory;

    const cachedDevices = localStorage.getItem("devices");

    const { data: deviceResponse } = useGetDeviceIoTQuery(
        { start: 0, length: 100 },
        { skip: cachedDevices !== null }
    );

    useEffect(() => {
        if (deviceResponse?.data) {
            localStorage.setItem("devices", JSON.stringify(deviceResponse.data));
        }
    }, [deviceResponse?.data]);


    const deviceList = cachedDevices ? JSON.parse(cachedDevices) as Device[] : deviceResponse?.data;

    useEffect(() => {
        const matchDevice = deviceList?.find((device) => {
            return device.deviceId === caseItem?.iotDevice
        })
        if (matchDevice) {
            setDevice(matchDevice)
        } else {
            setDevice(undefined)
        }
    }, [caseItem?.iotDevice])


    return (
        <div className="overflow-y-auto w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col custom-scrollbar">
            {/* Mobile-only header with a title and close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Details</h3>
                <Button variant="ghost" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile/Tablet Tabs for switching between Customer Info and Service History */}
            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="flex">
                    {/* <button
                        onClick={() => setActiveRightPanel("customer")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "customer"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Customer Info
                    </button> */}
                    <button
                        onClick={() => setActiveRightPanel("cases")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "cases"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        {t("case.panel.service_history")}
                    </button>
                </div>
            </div>

            {/* Customer Info Section */}
            <div
                className={`${activeRightPanel === "customer" ? "flex" : "hidden"
                    } md:flex flex-col border-b md:border-b-0 md:border-r border-gray-200 dark:border-gray-800 md:max-h-80`}
            >
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                    <div className="flex overflow-x-auto custom-scrollbar">
                        {caseItem ? (
                            tabs.map((tab) => (
                                <button
                                    key={tab?.id}
                                    onClick={() => setActiveTab(tab?.id ?? '')}
                                    className={`relative px-2 md:px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-r border-gray-200 dark:border-gray-700 ${activeTab === tab?.id
                                        ? "text-gray-900 dark:text-white bg-white dark:bg-gray-600 border-b-2 border-b-blue-500"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-750"
                                        }`}
                                >
                                    {tab?.label}
                                </button>
                            ))
                        ) : (
                            tabs.slice(0, 4).map((tab) => (
                                <button
                                    key={tab?.id}
                                    onClick={() => setActiveTab(tab?.id ?? '')}
                                    className={`relative px-2 md:px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-r border-gray-200 dark:border-gray-700 ${activeTab === tab?.id
                                        ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-750"
                                        }`}
                                >
                                    {tab?.label}
                                </button>
                            ))
                        )}
                    </div>
                </div>

                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {activeTab === "customer-info" ? (
                            <>
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">
                                        Customer Information
                                    </span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="flex flex-wrap gap-3 items-center">
                                        <Avatar
                                            src={
                                                caseItem?.customerData?.photo
                                                    ? caseItem?.customerData.photo
                                                    : "/images/user/unknow user.png"
                                            }
                                            size="xxlarge"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {caseItem?.customerData?.name ? caseItem?.customerData?.name : "-"}
                                            </h3>
                                            {/* {customerData && (
                                                <>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        Business ID: 123456789
                                                    </div>
                                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                                        Level: Premium
                                                    </div>
                                                </>
                                            )} */}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Date of birth</div>
                                            <div className="text-gray-900 dark:text-white">
                                                {caseItem?.customerData?.dob ? DateStringToDateFormat(caseItem?.customerData.dob,false,language) : "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Email</div>
                                            <div className="text-gray-900 dark:text-white">
                                                {caseItem?.customerData?.email ? caseItem?.customerData.email : "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Phone Number</div>
                                        <div className="text-gray-900 dark:text-white">
                                            {caseItem?.customerData?.mobileNo ? caseItem?.customerData.mobileNo : "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Address</div>
                                        <div className="text-gray-900 dark:text-white">
                                            {caseItem?.customerData?.address ? mergeAddress(caseItem?.customerData.address) : "-"}
                                        </div>
                                    </div>
                                </div>
                            </>

                        ) : activeTab === "Subcase" ? (
                            <div className="space-y-3">
                                {referCase.length > 0 ? (
                                    referCase.map((SupCase) => (
                                        <div
                                            key={SupCase.caseId}
                                            onClick={() => navigate(`/case/${SupCase.caseId}`)}
                                            className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors cursor-pointer border-l-4 ${getPriorityBorderColorClass(SupCase.priority)} group`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center space-x-2 mb-2">
                                                        <div className={`w-2 h-2 ${getPriorityColorClass(SupCase.priority)} rounded-full flex-shrink-0`}></div>
                                                        <span className="text-xs text-gray-600 dark:text-gray-500 font-mono">#{SupCase.caseId}</span>
                                                        <span className="text-xs text-gray-600 dark:text-gray-500">
                                                            {new Date(SupCase.createdDate).toLocaleDateString()}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                                        {SupCase.caseDetail || 'No details available'}
                                                    </h4>
                                                    <div className="flex items-center justify-between">
                                                        <Badge>
                                                            {statusIdToStatusTitle(SupCase.statusId)}
                                                        </Badge>
                                                        <span className="text-xs text-gray-600 dark:text-gray-400">
                                                            {SupCase.createdBy}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-500 py-4">
                                        No subcases found
                                    </div>
                                )}
                            </div>
                        ) : activeTab === "Location" ? (
                            <div className="text-center py-4">
                                <img src={"../../../public/images/map/Location-image.jpeg"} alt="Location Map" className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        )
                            : activeTab === "Device info" ? (
                                <>
                                    <div className="flex items-center space-x-2">
                                        <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">
                                            {t("case.panel.device_info")}
                                        </span>
                                    </div>

                                    <div className="space-y-2 text-xs">
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <div className="flex items-center text-blue-500 dark:text-blue-400 mb-1 space-x-1">
                                                    <Wifi className="w-3 h-3" />
                                                    <span>{t("case.display.iot_device")}</span>
                                                </div>
                                                <div className="text-gray-900 dark:text-white">
                                                    {caseItem?.iotDevice || "-"}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center text-blue-500 dark:text-blue-400 mb-1 space-x-1">
                                                    <Cpu className="w-3 h-3" />
                                                    <span>{t("case.panel.device_type")}</span>
                                                </div>
                                                <div className="text-gray-900 dark:text-white">
                                                    {device?.deviceType || "-"}
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <div className="flex items-center text-blue-500 dark:text-blue-400 mb-1 space-x-1">
                                                <Tag className="w-3 h-3" />
                                                <span>{t("case.panel.device_model")}</span>
                                            </div>
                                            <div className="text-gray-900 dark:text-white">
                                                {device?.model || "-"}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ): (
                        <div className="text-center py-4">
                            <div className="text-gray-500 dark:text-gray-400 mb-1 text-sm">No data available for this tab.</div>
                        </div>
                            )}
                    </div>
                </ScrollArea>
            </div>

            {/* Service History Section */}
            <div className={`${activeRightPanel === "cases" ? "flex" : "hidden"} md:flex flex-1 flex-col`}>
                <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-900 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t("case.panel.service_history")}</h3>
                        <Button variant="ghost" size="sm" className="p-1 text-xs">{t("case.assignment.advance_filter")}</Button>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {caseItem?.customerData?.name ? serviceHistory.map((historyItem) => (
                            <div
                                key={historyItem.id}
                                className={`bg-gray-100 dark:bg-gray-800 rounded-lg p-3 hover:bg-gray-200 dark:hover:bg-gray-750 transition-colors cursor-pointer border-l-4 ${getPriorityBorderColorClass(historyItem.priority)} group`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 mb-2">
                                            <div className={`w-2 h-2 ${getPriorityColorClass(historyItem.priority)} rounded-full flex-shrink-0`}></div>
                                            <span className="text-xs text-gray-600 dark:text-gray-500 font-mono">#{historyItem.id}</span>
                                            <span className="text-xs text-gray-600 dark:text-gray-500">{historyItem.date}</span>
                                        </div>
                                        <h4 className="text-sm font-medium text-gray-900 dark:text-white leading-tight mb-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                                            {historyItem.title}
                                        </h4>
                                        <div className="flex items-center justify-between">
                                            <Badge>
                                                {historyItem.status}
                                            </Badge>
                                            <span className="text-xs text-gray-600 dark:text-gray-400">
                                                {Array.isArray(historyItem.assignee)
                                                    ? historyItem.assignee.map((a: { name: string }) => a.name).join(", ")
                                                    : ((historyItem.assignee as { name?: string })?.name || "-")}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : <></>}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
};

export default Panel