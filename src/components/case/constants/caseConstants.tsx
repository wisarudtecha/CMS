export const COMMON_INPUT_CSS = "appearance-none border !border-1 rounded text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent dark:text-gray-300 dark:border-gray-800 dark:bg-gray-900 disabled:text-gray-500 disabled:border-gray-300 disabled:opacity-40 disabled:bg-gray-100 dark:disabled:bg-gray-900 dark:disabled:text-gray-400 dark:disabled:border-gray-700";

export const REQUIRED_ELEMENT = <span className="text-red-500 text-sm font-bold">*</span>;

export const TOAST_MESSAGES = {
    SAVE_SUCCESS: "Changes saved successfully!",
    SAVE_DRAFT_SUCCESS: "Save As Draft successfully!",
    CREATE_SUCCESS: "Create Case successfully!",
    DISPATCH_SUCCESS: "Dispatch Successfully!",
    DISPATCH_FAILED: "Dispatch Failed",
    UPDATE_FAILED: "Failed to Update Case",
    CREATE_FAILED: "Failed to Create Case"
} as const;

 export const source = [{ name: "CALL", id: "01" }, { name: "METTLINK", id: "02" }, { name: "METTRIQ", id: "04" }, { name: "IOT-Alert", id: "05" }, { name: "Other", id: "06" }];