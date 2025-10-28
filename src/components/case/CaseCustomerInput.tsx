import { Custommer } from "@/types";
import { ChangeEvent } from "react";
// import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput";
import { Customer } from "@/store/api/custommerApi";
import { useTranslation } from "@/hooks/useTranslation";
import { COMMON_INPUT_CSS } from "./constants/caseConstants";
// import { contractMethodMock } from "./source";

interface CustomerInputProps {
    customerData: Custommer
    listCustomerData: Customer[];
    handleCustomerDataChange: (newValue: Custommer) => void;
    hidePhone?: boolean
}

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

    // const handleCustomerEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
    //     const value = e.target.value === "" ? "" : e.target.value;
    //     handleCustomerDataChange({ ...customerData, email: value });
    // };

    return (
        <div className="mx-3 text-gray-900 dark:text-gray-400">
            {/* <div className="w-auto md:mr-2">
                <h3 className="mb-2 ">Customer Name :</h3>
                <input
                    value={customerData.name}
                    onChange={(e) => { handleCustomerDataNameChange(e) }}
                    className={`${commonInputCss}`}
                    placeholder={"Enter Customer Name"}
                />
            </div> */}
            {!hidePhone &&
                <div className={` w-auto md:mr-2`}>
                    <h3 className="my-2 ">{t("case.display.phone_number")} :</h3>
                    <input
                        value={customerData.mobileNo ?? ""}
                        onChange={(e) => { handleCustomerDataPhoneChange(e) }}
                        className={`${COMMON_INPUT_CSS}`}
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
            {/* {customerData.contractMethod?.name === "Email" &&
                <div className="w-auto md:mr-2  ">
                    <h3 className="my-2">Customer Email : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                    <input
                        type="email"
                        onChange={handleCustomerEmailChange}
                        value={customerData.email || ""}
                        placeholder="Enter Email"
                        className={COMMON_INPUT_CSS}
                        required={true}
                    />
                </div>
            } */}
        </div>
    );
};

export default CustomerInput