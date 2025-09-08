import { CalendarDays, Contact, Cpu, MapPin, Phone, Share2 } from "lucide-react";
import DateStringToDateFormat from "../date/DateToString";
import FormViewer from "../form/dynamic-form/FormViewValue";
// import { getTextPriority } from "../function/Prioriy";
import { IndividualFormField } from "../interface/FormField";
import { mergeArea } from "@/store/api/area";
import { CaseDetails } from "@/types/case";
import Button from "../ui/button/Button";
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput";
import { useState } from "react";
import { closeStatus } from "../ui/status/status";
const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>
interface FormFieldValueDisplayProps {
    caseData?: CaseDetails;
    showResult?: boolean;
    isCreate?: boolean;
}

const renderField = (field: IndividualFormField): Record<string, any> => {
    if (field.type === "InputGroup" && Array.isArray(field.value)) {
        return {
            [field.label]: field.value.map((child: any) => renderField(child))
        };
    }

    if (field.type === "dynamicField" && Array.isArray(field.options)) {
        const selectedOption = field.options.find((opt: any) => opt.value === field.value);
        return {
            [field.label]: {
                value: field.value || "-",
                ...(selectedOption && Array.isArray(selectedOption.form)
                    ? { form: selectedOption.form.map((child: any) => renderField(child)) }
                    : {})
            }
        };
    }

    let value = field.value;
    // Keep File objects for image fields
    if ((field.type === "multiImage" || field.type === "dndMultiImage") && Array.isArray(value)) {
        return { [field.label]: value };
    }
    if (field.type === "image" && value instanceof File) {
        return { [field.label]: value };
    }

    if (field.type === "option" && Array.isArray(value)) {
        value = value.length > 0 ? value : [];
    }
    if (field.type === "select" || field.type === "radio") {
        value = value || "-";
    }
    if (typeof value === "string" && value.trim() === "") {
        value = "-";
    }
    return { [field.label]: value };
};

const FormFieldValueDisplay: React.FC<FormFieldValueDisplayProps> = ({ caseData, showResult = false, isCreate }) => {
    const [closeValue, setCloseValue] = useState<string>("")
    const closeCaseOption = ["แก้ไขเสร็จสิ้น", "เปลี่ยนอุปกรณ์เสร์จสิ้น"]
    const isCloseStage = closeStatus.find(status => status === caseData?.status);
    const handleCloseCaseChange = (value: string) => {
        setCloseValue(value)
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">

            {caseData?.workOrderRef && <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-2">
                <span className=" text-md text-blue-500 dark:text-blue-400 " >WorkOrder Infomation</span>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">WorkOrder No # {caseData?.workOrderRef || "-"} </span>
                    {/* <div className="text-md font-medium text-gray-900 dark:text-white">{caseData?.workOrderNummber||"-"}</div> */}
                </div>



            </div>}
            <div className={`bg-gray-50 dark:bg-gray-900 p-4 rounded-lg ${caseData?.workOrderRef ? "" : "col-span-2 sm:col-span-1"}`}>
                <span className=" text-md text-blue-500 dark:text-blue-400 " >Case Information</span>
                {isCreate === false ? (
                    <div>
                        <span className="text-md text-gray-500 dark:text-gray-400">
                            No # <span className="text-md font-medium text-gray-900 dark:text-white">
                                {caseData?.workOrderNummber || "-"}
                            </span>
                        </span>

                    </div>
                ) : null}

                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Types : {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">{caseData?.caseType?.caseType || "-"}</div>
                </div>
                {caseData?.caseType && <FormViewer formData={caseData.caseType.formField} />}


                {/* <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Priority</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{caseData?.caseType?.priority ? getTextPriority(caseData.caseType.priority).level : "-"}</div>

                </div> */}
                <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Service Center</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white"> {caseData?.area && mergeArea(caseData?.area) || "-"}</div>
                </div>
            </div>
            <div className="col-span-2 sm:col-span-1">
                <div className="mb-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-fit  ">
                    <div className="flex mb-2 text-blue-500 dark:text-blue-400">
                        <MapPin /><span className=" mx-1 text-md  " >Event Area</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex  gap-x-2 gap-y-1 ">

                            <div>
                                {caseData?.location ? caseData.location : "-"}
                            </div>
                        </div>

                    </div>

                </div>
                {/* <div className=" bg-gray-50 dark:bg-gray-900 p-4 rounded-lg ">
                    <div className="mb-2">
                        <span className=" text-md text-blue-500 dark:text-blue-400 " >Vehicle & Assembly</span>
                    </div>
                    <div className="mb-2">
                        <span className="text-md text-gray-500 dark:text-gray-400">Vehicle Information</span>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                            {vehicleInformation}
                        </div>
                    </div>
                    <div className="mb-2">
                        <span className="text-md text-gray-500 dark:text-gray-400">Assembly Information</span>
                        <div className="text-md font-medium text-gray-900 dark:text-white">
                            {assemblyInformation}
                        </div>
                    </div>
                </div> */}
                <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 mb-3">
                    {/* <div className="mb-2">
        <span className=" text-md text-blue-500 dark:text-blue-400 " >Customer Information</span>
    </div> */}
                    {/* <div className="mb-2">
        <span className="text-md text-gray-500 dark:text-gray-400">Customer Name</span>
        <div className="text-md font-medium text-gray-900 dark:text-white">
            {caseData?.customerData?.name || "-"}
        </div>
    </div> */}

                    <div className="flex items-center mb-2 text-blue-500 dark:text-blue-400">
                        <Contact className="h-5 w-5 mr-2" />
                        <span className="text-md">Contact</span>
                    </div>

                    {/* Phone Number */}
                    <div className="mb-4">
                        <div className="flex items-center text-md text-gray-500 dark:text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            <span>Phone Number</span>
                        </div>
                        <div className="pl-6 text-md font-medium text-gray-900 dark:text-white">
                            {caseData?.customerData?.mobileNo || "-"}
                        </div>
                    </div>

                    {/* Contact Method */}
                    <div className="mb-4">
                        <div className="flex items-center text-md text-gray-500 dark:text-gray-400">
                            <Share2 className="h-4 w-4 mr-2" />
                            <span>Contact Method</span>
                        </div>
                        <div className="pl-6 text-md font-medium text-gray-900 dark:text-white">
                            {caseData?.customerData?.contractMethod?.name || "-"}
                        </div>
                        {/* {caseData?.customerData?.contractMethod.name == "Email" ?
            <>
                <span className="text-md text-gray-500 dark:text-gray-400">Customer Email</span>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                    {caseData.customerData?.email || "-"}
                </div>
            </> : null} */}
                    </div>

                    {/* IoT Device */}
                    <div className="mb-4">
                        <div className="flex items-center text-md text-gray-500 dark:text-gray-400">
                            <Cpu className="h-4 w-4 mr-2" />
                            <span>IoT Device</span>
                        </div>
                        <div className="pl-6 text-md font-medium text-gray-900 dark:text-white">
                            {caseData?.iotDevice || "-"}
                        </div>
                    </div>

                    {/* Schedule Date */}
                    {caseData?.requireSchedule && (
                        <div className="mb-2">
                            <div className="flex items-center text-md text-gray-500 dark:text-gray-400">
                                <CalendarDays className="h-4 w-4 mr-2" />
                                <span>Request Schedule Date {requireElements}</span>
                            </div>
                            <div className="pl-6 text-md font-medium text-gray-900 dark:text-white">
                                {caseData?.scheduleDate != "" && caseData?.scheduleDate != null ?
                                    DateStringToDateFormat(caseData.scheduleDate) :
                                    "-"
                                }
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-2">
                <div className="mb-2">
                    <span className="flex mb-2 text-blue-500 dark:text-blue-400"><span>Detail <span>{requireElements}</span></span></span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData?.description || "-"}
                    </div>
                </div>
            </div>
            {showResult && <div className=" col-span-2 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <h3 className="text-gray-900 dark:text-gray-300">Result</h3>
                <div className="">
                    <SearchableSelect
                        options={closeCaseOption}
                        value={closeValue}
                        onChange={handleCloseCaseChange}
                        placeholder={"Select Result"}
                        className="  mb-2 items-center"
                    />

                    <div className="">
                        {/* <h3 className="text-gray-900 dark:text-gray-400 mx-3">Result Details</h3> */}
                        <textarea

                            value={""}
                            placeholder="Result Details"
                            className={`w-full mb-2  h-20 p-2 appearance-none rounded text-gray-700 leading-tight bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent  dark:text-gray-300 dark:border-gray-800 dark:bg-gray-800 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700`}
                        />
                    </div>
                </div>
                <div className="flex justify-end items-end">
                    <div className="justify-end items-end flex">
                        <Button size="sm" variant="outline">Cancel</Button>
                    </div>

                    <div className="ml-2">
                        <Button size="sm" variant="outline" disabled={!isCloseStage}>Close Case</Button>
                    </div>

                </div>
            </div>
            }
            {/* <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="mb-2">
                    <span className="text-md text-blue-500 dark:text-blue-400">Attachments</span>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                    {Array.isArray(attachments) && attachments.length > 0 ? (
                        attachments.map((attachment, index) => {
                            const imageUrl = attachment instanceof File
                                ? URL.createObjectURL(attachment)
                                : String(attachment);
                            return (
                                <a key={index} href={imageUrl} target="_blank" rel="noopener noreferrer">
                                    <img
                                        src={imageUrl}
                                        alt={`Attachment ${index + 1}`}
                                        className="w-24 h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700 hover:opacity-80 transition-opacity"
                                    />
                                </a>
                            );
                        })
                    ) : (
                        <div className="text-sm text-gray-500 dark:text-gray-400">No attachments found.</div>
                    )}
                </div>
            </div> */}

            <div>
            </div>


        </div >
    );
};
export default FormFieldValueDisplay