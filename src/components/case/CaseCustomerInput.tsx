import { Custommer } from "@/types";
import { ChangeEvent } from "react";
import Input from "../form/input/InputField";
// import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput";
import { Customer } from "@/store/api/custommerApi";
import { useTranslation } from "@/hooks/useTranslation";
// import { contractMethodMock } from "./source";

interface CustomerInputProps {
    customerData: Custommer
    listCustomerData: Customer[];
    handleCustomerDataChange: (newValue: Custommer) => void;
    hidePhone?: boolean
}
const commonInputCss = "shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700"
const CustomerInput: React.FC<CustomerInputProps> = ({
    customerData,
    listCustomerData,
    handleCustomerDataChange,
    hidePhone = false
}) => {
    const { t } = useTranslation();

    // const handleCustomerDataNameChange = (e: ChangeEvent<HTMLInputElement>) => {
    //     handleCustomerDataChange({
    //         ...customerData,
    //         name: e.target.value
    //     });
    // };



    // const handleCustomerDataContractMethodeChange = (data: contractMethod) => {
    //     handleCustomerDataChange({ ...customerData, contractMethod: data });
    // };
    const handleCustomerDataPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let updatedCustomerData = { ...customerData, mobileNo: value };
        if (value !== "") {
            const matchingCustomer = listCustomerData.find(
                (customer) => customer.mobileNo === value
            );
            if (matchingCustomer) {
                updatedCustomerData = {
                    ...matchingCustomer,
                    name: `${matchingCustomer.firstName} ${matchingCustomer.lastName}`,
                    email: matchingCustomer.email,
                    photo: matchingCustomer.photo,
                    id: matchingCustomer.id,
                    contractMethod: updatedCustomerData.contractMethod
                };
            } else {
                updatedCustomerData = {
                    ...updatedCustomerData,
                    mobileNo: value,

                } as Custommer;
            }
        } else {
            updatedCustomerData = {
                ...updatedCustomerData
            } as Custommer;
        }
        handleCustomerDataChange(updatedCustomerData);
    };

    const handleCustomerEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? "" : e.target.value;
        handleCustomerDataChange({ ...customerData, email: value });
    };

    return (
        <div className=" text-gray-900 dark:text-gray-400 mx-3">
            {/* <div className="w-auto md:mr-2">
                <h3 className="mb-2 ">Customer Name :</h3>
                <Input
                    value={customerData.name}
                    onChange={(e) => { handleCustomerDataNameChange(e) }}
                    className={`${commonInputCss}`}
                    placeholder={"Enter Customer Name"}
                />
            </div> */}
            {!hidePhone &&
                <div className="w-auto md:mr-2">
                    <h3 className="my-1 ">{t("case.display.phone_number")} :</h3>
                    <Input
                        value={customerData.mobileNo ?? ""}
                        onChange={(e) => { handleCustomerDataPhoneChange(e) }}
                        className={`${commonInputCss}`}
                        placeholder={t("case.display.phone_number_placeholder")}
                    />
                </div>}
            {/* <div className="w-auto md:mr-2">
                <h3 className="my-2">Contact Method : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <SearchableSelect
                    options={contractMethodMock.map(m => m.name)}
                    className="sm:my-3"
                    value={customerData.contractMethod?.name ?? ""}
                    onChange={(selectedName) => {
                        const selectedMethod = contractMethodMock.find(
                            (method) => method.name === selectedName
                        );
                        if (selectedMethod) {
                            handleCustomerDataContractMethodeChange(selectedMethod);
                        }
                    }}
                />
            </div> */}
            {customerData.contractMethod?.name === "Email" &&
                <div className="w-auto md:mr-2  ">
                    <h3 className="my-2">Customer Email : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                    <Input
                        type="email"
                        onChange={handleCustomerEmailChange}
                        value={customerData.email || ""}
                        placeholder="Enter Email"
                        className={commonInputCss}
                        required={true}
                    />
                </div>
            }
        </div>
    );
};

export default CustomerInput