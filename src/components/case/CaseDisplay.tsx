import { MapPin } from "lucide-react";
import DateStringToDateFormat from "../date/DateToString";
import FormViewer from "../form/dynamic-form/FormViewValue";
import { getTextPriority } from "../function/Prioriy";
import { CaseItem } from "../interface/CaseItem";
import { IndividualFormField } from "../interface/FormField";
const requireElements = <span className=" text-red-500 text-sm font-bold">*</span>
interface FormFieldValueDisplayProps {
    caseData?: CaseItem;
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

const FormFieldValueDisplay: React.FC<FormFieldValueDisplayProps> = ({ caseData }) => {
    if (!caseData || !caseData.formData || !caseData.formData.formFieldJson) return null;
    const result = caseData.formData.formFieldJson.map(renderField);
    const fieldMap = result.reduce((acc, curr) => ({ ...acc, ...curr }), {});

    const vehicleInformation = Array.isArray(fieldMap["Group"])
        ? fieldMap["Group"].find((item: any) => item["Vehicle Information"])?.["Vehicle Information"] || "-"
        : fieldMap["Vehicle Information"] || "-";

    const assemblyInformation = Array.isArray(fieldMap["Group"])
        ? fieldMap["Group"].find((item: any) => item["Assembly Information"])?.["Assembly Information"] || "-"
        : "-";

    const attachments = fieldMap["Attachments"];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <span className=" text-md text-blue-500 dark:text-blue-400 " >Case Information</span>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Case Types : {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">{caseData?.caseType?.caseType}</div>
                </div>
                {caseData.caseType && <FormViewer formData={caseData.caseType} />}
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Case Detail {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.description}

                    </div>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Request Service Date {requireElements}</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.date != "" ?
                            DateStringToDateFormat(caseData.date) :
                            "-"
                        }
                    </div>
                </div>
                <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Priority</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{caseData.priority ? getTextPriority(caseData.priority).level : "-"}</div>

                </div>
                <div>
                    <span className="text-md text-gray-500 dark:text-gray-400">Service Center</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white"> {caseData.serviceCenter}</div>
                </div>
            </div>
            <div >
                <div className="mb-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg h-fit  ">
                    <div className="mb-2">
                        <span className=" text-md text-blue-500 dark:text-blue-400 " >Location Information</span>
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="flex flex-wrap gap-x-2 gap-y-1 ">
                            <MapPin />
                            {Array.isArray(fieldMap["3. Service Location & Destination:"])
                                ? fieldMap["3. Service Location & Destination:"].map((item: any, idx: number) => {
                                    return Object.values(item).map((val, i) => (
                                        <div key={idx + "-" + i}>{String(val)}</div>
                                    ));
                                })
                                : (caseData.location ?? "-")}
                        </div>

                    </div>

                </div>
                <div className=" bg-gray-50 dark:bg-gray-900 p-4 rounded-lg ">
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
                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 md:col-span-2">
                <div className="mb-2">
                    <span className=" text-md text-blue-500 dark:text-blue-400 " >Customer Information</span>
                </div>
                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Customer Name</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.customerData?.name || "-"}
                    </div>
                </div>

                <span className="text-md text-gray-500 dark:text-gray-400">Customer Phone Number</span>
                <div className="text-md font-medium text-gray-900 dark:text-white">
                    {caseData.customerData?.mobileNo || "-"}
                </div>

                <div className="mb-2">
                    <span className="text-md text-gray-500 dark:text-gray-400">Customer Contact Method</span>
                    <div className="text-md font-medium text-gray-900 dark:text-white">
                        {caseData.customerData?.contractMethod || "-"}
                    </div>
                    {caseData.customerData?.contractMethod == "Email" ?
                        <>
                            <span className="text-md text-gray-500 dark:text-gray-400">Customer Email</span>
                            <div className="text-md font-medium text-gray-900 dark:text-white">
                                {caseData.customerData?.email || "-"}
                            </div>
                        </> : null}


                </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg col-span-1 md:col-span-2">
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
            </div>
        </div>
    );
};
export default FormFieldValueDisplay