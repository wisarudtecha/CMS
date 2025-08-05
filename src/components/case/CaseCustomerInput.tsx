import { Custommer, User } from "@/types";
import { ChangeEvent, useMemo } from "react";
import Input from "../form/input/InputField";
import { SearchableSelect } from "../SearchSelectInput/SearchSelectInput";

interface CustomerInputProps {
    customerData: Custommer
    listCustomerData: User[];
    handleCustomerDataChange: (newValue: Custommer) => void;
}
const commonInputCss = "shadow appearance-none border rounded  text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-800 dark:disabled:text-gray-400 dark:disabled:border-gray-700"
const CustomerInput: React.FC<CustomerInputProps> = ({
    customerData,
    listCustomerData,
    handleCustomerDataChange,
}) => {
    // Improved customerOptions to map label and value properly
    const customerOptions = useMemo(() =>
        listCustomerData.map(user => ({
            label: user.firstName + " " + user.lastName,
            value: user.id, 
            mobileNo: user.mobileNo,
            email: user.email ,
            photo:user.photo,
            id:user.id
        })),
        [listCustomerData]
    );
    const contractMethodMock = ["Iot Alert", "Chat", "Email"];
    const handleCustomerDataNameChange = (selectedId: string) => {
        const selectedCustomer = customerOptions.find(option => option.value === selectedId);

        if (selectedCustomer) {
            handleCustomerDataChange({
                ...customerData,
                name: selectedCustomer.label, 
                mobileNo: String(selectedCustomer.mobileNo), 
                email: selectedCustomer.email, 
                photo:selectedCustomer.photo,
                id:selectedCustomer.id
            });
        } else {
            handleCustomerDataChange({
                ...customerData,
                name: "",
                mobileNo: undefined,
                email: undefined
            });
        }
    };

    const handleCustomerDataContractMethodeChange = (data: string) => {
        handleCustomerDataChange({ ...customerData, contractMethod: data as "Email" | "Chat" | "Iot Alert" | "Phone Number" | ""});
    };

    const handleCustomerDataPhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : e.target.value;
        let updatedCustomerData = { ...customerData, mobileNo: value };
        if (value !== undefined) {
            const matchingCustomer = listCustomerData.find(
                (customer) => customer.mobileNo === value
            );
            if (matchingCustomer) {
                updatedCustomerData = {
                    ...updatedCustomerData,
                    name: `${matchingCustomer.firstName} ${matchingCustomer.lastName}`,
                    email: matchingCustomer.email 
                };
            } else {
                updatedCustomerData = {
                    ...updatedCustomerData,
                    name: "",
                    email: undefined
                };
            }
        } else {
            updatedCustomerData = {
                ...updatedCustomerData,
                name: "",
                email: undefined
            };
        }

        handleCustomerDataChange(updatedCustomerData);
    };

    const handleCustomerEmailChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value === "" ? undefined : e.target.value;
        handleCustomerDataChange({ ...customerData, email: value });
    };

    return (
        <div className=" text-gray-900 dark:text-gray-400 mx-3">
            <div className="w-auto md:mr-2">
                <h3 className="mb-2 ">Customer Name : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <SearchableSelect                    options={customerOptions.map(option => option.label)}
                    value={customerData.name || ""} // Display the name
                    onChange={(label) => {
                        const selectedOption = customerOptions.find(option => option.label === label);
                        handleCustomerDataNameChange(selectedOption ? selectedOption.value : "");
                    }}
                    placeholder={"Enter Customer Name"}
                />
            </div>
            <div className="w-auto md:mr-2">
                <h3 className="my-2 ">Phone Number : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <Input
                    value={customerData.mobileNo ?? ""}
                    onChange={(e) => { handleCustomerDataPhoneChange(e) }}
                    className={`${commonInputCss}`}
                    placeholder={"Enter Customer Phone Number"}
                    required={true}
                />
            </div>
            <div className="w-auto md:mr-2">
                <h3 className="my-2">Contact Method : <span className=" text-red-500 text-sm font-bold">*</span></h3>
                <SearchableSelect
                    options={contractMethodMock}
                    className="sm:my-3"
                    value={customerData.contractMethod ?? ""}
                    onChange={(e) => handleCustomerDataContractMethodeChange(e)}
                />
            </div>
            {customerData.contractMethod === "Email" &&
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