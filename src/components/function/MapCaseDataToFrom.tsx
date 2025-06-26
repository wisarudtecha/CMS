import {Casev2} from "../interface/Case";
import { FormField, IndividualFormField, IndividualFormFieldWithChildren } from "../interface/FormField";

export default function mapCaseToForm(singleCase: Casev2, initialFormSchema: FormField): FormField {
    // Create a deep copy of the initial form schema to ensure immutability
    // and prevent modification of the original schema.
    const newFormSchema: FormField = JSON.parse(JSON.stringify(initialFormSchema));

    // Iterate over each field in the formFieldJson array of the new schema.
    const mappedFields: IndividualFormField[] = newFormSchema.formFieldJson.map(field => {
        let updatedValue: any = field.value; // Initialize with the field's current value

        // Use a switch statement on the field label to determine how to map data
        // from the `singleCase` object to the current `field`.
        // The labels here must exactly match the `label` property in your `formFieldJson`.
        switch (field.label) {
            case "1. Service Type:":
                updatedValue = singleCase["Service Type"];
                break;
            case "Contact Method: ":
                updatedValue = singleCase["Contact Method"];
                break;
            case "2. Request Service Date:":
                updatedValue = singleCase["Request Service Date"];
                break;
            case "3. Service Location & Destination:":
                // This is an "InputGroup" type field. Its `value` property
                // is an array of child `IndividualFormFieldWithChildren`.
                // We need to iterate over these children and update their values.
                if (field.type === "InputGroup") {
                    // Explicitly cast `field.value` to an array of `IndividualFormFieldWithChildren`
                    // to allow TypeScript to understand its structure and enable `map` on it.
                    updatedValue = (field.value as IndividualFormFieldWithChildren[]).map(childField => {
                        let updatedChildValue: any = childField.value;
                        switch (childField.label) {
                            case "Radio Button Form":
                                updatedChildValue = singleCase["Service Location & Destination"].Type;
                                break;
                            case "Text Area Form":
                                updatedChildValue = singleCase["Service Location & Destination"].Address;
                                break;
                        }
                        // Return a new child field object with the updated value.
                        return { ...childField, value: updatedChildValue };
                    });
                }
                break;
            case "Priority Level:":
                updatedValue = singleCase["Priority Level"];
                break;
            case "4. Service Center:":
                updatedValue = singleCase["Service Center"];
                break;
            case "5. Customer Name:":
                updatedValue = singleCase["Customer Name"];
                break;
            case "6. Customer Phone:":
                updatedValue = singleCase["Customer Phone"];
                break;
            case "8. Vehicle Information:":
                updatedValue = singleCase["Vehicle Information"];
                break;
            case "9. Assembly Information:":
                updatedValue = singleCase["Assembly Information"];
                break;
            case "Photos:":
                updatedValue = singleCase["Photos"];
                break;
            case "7. Service Details: *": // This label directly matches your form's label
                updatedValue = singleCase["Service Details"];
                break;
            case "10. Assembly Procedure:":
                updatedValue = singleCase["Assembly Procedure"];
                break;
            // No default case needed, as unmatched fields will retain their original `value`.
        }

        // Return a new field object with the potentially updated value.
        // This maintains immutability for the individual field objects.
        return { ...field, value: updatedValue };
    });

    // Assign the array of mapped (and updated) fields back to the new form schema.
    newFormSchema.formFieldJson = mappedFields;

    // Return the complete new form schema with all values populated.
    return newFormSchema;
}