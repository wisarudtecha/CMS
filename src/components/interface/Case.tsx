export interface  Case {
    id: string
    title: string
    description?: string
    status?: string
    priority: number
    assignee: string;
    dueDate: string
    comments: number
    category: string
    customer: string
}
export const defaultCase: Case = {
    "id": "",
    "title": "",
    "description": "",
    "status": "",
    "priority": 0,
    "assignee": "",
    "dueDate": "",
    "comments": 0,
    "category": "",
    "customer": ""
}

export interface Casev2 {
    "Service Type": string;
    "Contact Method": string;
    "Request Service Date": string;
    "Service Location & Destination": {
        "Type": string;
        "Address": string; 
    };
    "Priority Level": string;
    "Service Center": string;
    "Customer Name": string;
    "Customer Phone": string;
    "Vehicle Information": string; 
    "Assembly Information": string; 
    "Photos": string[]; 
    "Service Details": string; 
    "Assembly Procedure": string;
    "status":string;
}

export const defaultCasev2: Casev2 = {
    "Service Type": "",
    "Contact Method": "",
    "Request Service Date": "",
    "Service Location & Destination": {
        "Type": "" ,
        "Address": "", 
    },
    "Priority Level": "",
    "Service Center": "",
    "Customer Name": "",
    "Customer Phone": "",
    "Vehicle Information": "", 
    "Assembly Information": "", 
    "Photos": [], 
    "Service Details": "", 
    "Assembly Procedure": "",
    "status":""
}