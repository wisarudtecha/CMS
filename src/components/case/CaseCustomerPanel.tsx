
import { useState } from "react"
import {
    X
} from "lucide-react"
import Button from "@/components/ui/button/Button"
import Badge from "@/components/ui/badge/Badge"
import { ScrollArea } from "@/components/ui/scorllarea/scroll-area"
import locateImage from "../../../public/images/map/Location-image.jpeg"
import { getPriorityBorderColorClass, getPriorityColorClass } from "../function/Prioriy"
import CaseHistory from "@/utils/json/caseHistory.json"
import Avatar from "../ui/avatar/Avatar"
import type { Custommer } from "@/types";
import React from "react"
import DateStringToDateFormat from "../date/DateToString"
import { mergeAddress } from "@/store/api/custommerApi"
interface CustomerPanelProps {
    customerData?: Custommer;
    onClose: () => void; // Added onClose handler for mobile view
}
const CustomerPanel: React.FC<CustomerPanelProps> = ({ onClose, customerData }) => {
    const [activeRightPanel, setActiveRightPanel] = useState<"customer" | "cases">("customer");
    const [activeTab, setActiveTab] = useState("Device info");
    const edittabs = [
        // { id: "customer-info", label: "Info" },
        { id: "Device info", label: "Device info" },
        // { id: "Location", label: "Location" },
        // { id: "Knowledge Base", label: "Knowledge Base" },
    ];
    const addTab = [
        // { id: "customer-info", label: "Info" },
        { id: "Device info", label: "Device info" },
        // { id: "Location", label: "Location" },
        // { id: "Knowledge Base", label: "Knowledge Base" },
        // { id: "FAQ", label: "FAQ" },
    ];
    const serviceHistory = CaseHistory;
    return (
        <div className="overflow-y-auto w-full h-full bg-gray-50 dark:bg-gray-900 flex flex-col custom-scrollbar">
            {/* Mobile-only header with a title and close button */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 md:hidden">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Customer Details</h3>
                <Button variant="ghost" onClick={onClose}>
                    <X className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile/Tablet Tabs for switching between Customer Info and Service History */}
            <div className="md:hidden border-b border-gray-200 dark:border-gray-700 bg-gray-100 dark:bg-gray-800">
                <div className="flex">
                    <button
                        onClick={() => setActiveRightPanel("customer")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "customer"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Customer Info
                    </button>
                    <button
                        onClick={() => setActiveRightPanel("cases")}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${activeRightPanel === "cases"
                            ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                    >
                        Service History
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
                        {customerData ? (
                            edittabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-2 md:px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-r border-gray-200 dark:border-gray-700 ${activeTab === tab.id
                                        ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-750"
                                        }`}
                                >
                                    {tab.label}
                                </button>
                            ))
                        ) : (
                            addTab.slice(0, 4).map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative px-2 md:px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-r border-gray-200 dark:border-gray-700 ${activeTab === tab.id
                                        ? "text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-b-2 border-b-blue-500"
                                        : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-gray-750"
                                        }`}
                                >
                                    {tab.label}
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
                                                customerData?.photo
                                                    ? customerData.photo
                                                    : "/images/user/unknow user.png"
                                            }
                                            size="xxlarge"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white text-sm">
                                                {customerData?.name ? customerData?.name : "-"}
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
                                                {customerData?.dob ? DateStringToDateFormat(customerData.dob) : "-"}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Email</div>
                                            <div className="text-gray-900 dark:text-white">
                                                {customerData?.email ? customerData.email : "-"}
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Phone Number</div>
                                        <div className="text-gray-900 dark:text-white">
                                            {customerData?.mobileNo ? customerData.mobileNo : "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Address</div>
                                        <div className="text-gray-900 dark:text-white">
                                            {customerData?.address ? mergeAddress(customerData.address)  : "-"}
                                        </div>
                                    </div>
                                </div>
                            </>

                        ) : activeTab === "Location" ? (
                            <div className="text-center py-4">
                                <img src={locateImage} alt="Location Map" className="w-full h-48 object-cover rounded-lg" />
                            </div>
                        ) 
                        :activeTab ==="Device info"?(
                            <>
                                <div className="flex items-center space-x-2">
                                    <span className="text-blue-500 dark:text-blue-400 font-medium text-sm">
                                        Device info
                                    </span>
                                </div>
                                
                                <div className="space-y-2 text-xs">
                                    <div className="grid grid-cols-2 gap-2">
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Device ID</div>
                                            <div className="text-gray-900 dark:text-white">
                                                WS-001-ABC789
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-blue-500 dark:text-blue-400 mb-1">Device Type</div>
                                            <div className="text-gray-900 dark:text-white">
                                                waterSensor
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Model</div>
                                        <div className="text-gray-900 dark:text-white">
                                            WS-Model-X
                                        </div>
                                    </div>
                                    {/* <div>
                                        <div className="text-blue-500 dark:text-blue-400 mb-1">Address</div>
                                        <div className="text-gray-900 dark:text-white">
                                            {customerData?.address ? mergeAddress(customerData.address)  : "-"}
                                        </div>
                                    </div> */}
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
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Service History</h3>
                        <Button variant="ghost" size="sm" className="p-1 text-xs">Filter</Button>
                    </div>
                </div>
                <ScrollArea className="flex-1">
                    <div className="p-3 space-y-3">
                        {customerData?.name ? serviceHistory.map((historyItem) => (
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

export default CustomerPanel