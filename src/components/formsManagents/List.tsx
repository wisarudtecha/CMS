// /src/components/workflow/list/List.tsx
import
React,
{
  useEffect,
  useMemo,
  useState
}
  from 'react';
import Input from "@/components/form/input/InputField";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { Modal } from "@/components/ui/modal";
import { Table } from "@/components/ui/table";
import {
  AlertIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CloseIcon,
  ErrorIcon,
  GridIcon,
  ListIcon,
} from "@/icons";
import OnBackOnly from "@/components/ui/pagesTemplate/onBackOnly"
// Import the new TicketCard component
import FormCard from './formCard';
// Import the new TableRowActions component
import ButtonAction from './ButtonAction';
import { statusConfig } from '../ui/status/status';
import { FormField, FormManager } from '../interface/FormField';
import DynamicForm from '../form/dynamic-form/DynamicForm';
// TypeScript interfaces

interface ApiResponse {
  Forms: FormManager[];
}

interface SortConfig {
  key: keyof FormManager | null;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  status: string;
  category: string;
  search: string;
}

interface PaginationConfig {
  page: number;
  pageSize: number;
}

interface ConfirmDialog {
  isOpen: boolean;
  type: 'delete' | 'status';
  FormManagerId: string;
  FormManagerName: string;
  newStatus?: FormManager['status'];
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning';
  message: string;
}


const fetchForms = async (): Promise<ApiResponse> => {

  return {
    Forms: [
      {
        "formId": "form-001",
        "formName": "Employee Onboarding Survey",
        "formColSpan": 12,
        "createBy":"Phanuphong",
        "formFieldJson": [
          {
            "id": "e6a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c",
            "label": "Full Name",
            "type": "textInput",
            "value": "John Doe",
            "placeholder": "Enter your full name",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "f7g8h9i0-j1k2-l3m4-n5o6-p7q8r9s0t1u2",
            "label": "Email Address",
            "type": "emailInput",
            "value": "john.doe@example.com",
            "placeholder": "Enter your email",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "label": "Phone Number",
            "type": "Integer",
            "value": 1234567890,
            "placeholder": "Enter your phone number",
            "required": false,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
            "label": "Address Line 1",
            "type": "textInput",
            "value": "123 Main St",
            "placeholder": "Street address, P.O. box, company name, c/o",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
            "label": "City",
            "type": "textInput",
            "value": "Anytown",
            "placeholder": "City",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "d4e5f6a7-b8c9-0d1e-2f3a-4b5c6d7e8f90",
            "label": "State/Province/Region",
            "type": "textInput",
            "value": "Anystate",
            "placeholder": "State/Province/Region",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "e5f6a7b8-c9d0-1e2f-3a4b-5c6d7e8f90a1",
            "label": "Postal/ZIP Code",
            "type": "Integer",
            "value": 12345,
            "placeholder": "Postal/ZIP Code",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "f6a7b8c9-d0e1-2f3a-4b5c-6d7e8f90a1b2",
            "label": "Country",
            "type": "select",
            "value": "USA",
            "options": ["USA", "Canada", "Mexico"],
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "g7h8i9j0-k1l2-m3n4-o5p6-q7r8s9t0u1v2",
            "label": "Comments",
            "type": "textAreaInput",
            "value": "Looking forward to hearing from you!",
            "placeholder": "Enter your comments here",
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "h8i9j0k1-l2m3-n4o5-p6q7-r8s9t0u1v2w3",
            "label": "Subscribe to Newsletter",
            "type": "radio",
            "value": "Yes",
            "options": ["Yes", "No"],
            "required": false,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-06-25T10:00:00Z",
        "type": "Survey",
        "description": "A survey for newly onboarded employees to gather initial feedback."
      },
      {
        "formId": "form-002",
        "formName": "Travel Request Form",
        "formColSpan": 12,
        "createBy":"Phanu",
        "formFieldJson": [
          {
            "id": "j1k2l3m4-n5o6-p7q8-r9s0-t1u2v3w4x5y6",
            "label": "Overall Satisfaction",
            "type": "select",
            "value": "Satisfied",
            "options": ["Very Satisfied", "Satisfied", "Neutral", "Dissatisfied", "Very Dissatisfied"],
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "k2l3m4n5-o6p7-q8r9-s0t1-u2v3w4x5y6z7",
            "label": "Features you like most (select all that apply)",
            "type": "option",
            "value": ["Feature A", "Feature C"],
            "options": ["Feature A", "Feature B", "Feature C", "Feature D"],
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "l3m4n5o6-p7q8-r9s0-t1u2-v3w4x5y6z7a8",
            "label": "Suggestions for Improvement",
            "type": "textAreaInput",
            "value": "Consider adding more customization options.",
            "placeholder": "Enter your suggestions",
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "m4n5o6p7-q8r9-s0t1-u2v3-w4x5y6z7a8b9",
            "label": "How likely are you to recommend us?",
            "type": "Integer",
            "value": 9,
            "placeholder": "Scale of 1-10",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "n5o6p7q8-r9s0-t1u2-v3w4-x5y6z7a8b9c0",
            "label": "Upload a screenshot (optional)",
            "type": "image",
            "value": null,
            "required": false,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "o6p7q8r9-s0t1-u2v3-w4x5-y6z7a8b9c0d1",
            "label": "Date of Feedback",
            "type": "dateInput",
            "value": "2025-07-04",
            "required": true,
            "colSpan": 6,
            "isChild": false
          }
        ],
        "status": "draft",
        "createdAt": "2025-07-05T14:30:00Z",
        "type": "Request",
        "description": "Form for employees to submit travel requests for approval."
      },
      {
        "formId": "form-003",
        "formName": "IT Support Ticket",
        "formColSpan": 12,
        "createBy":"phong",
        "formFieldJson": [
          {
            "id": "e6a1b2c3-d4e5-6f7a-8b9c-0d1e2f3a4b5c",
            "label": "Event Name",
            "type": "textInput",
            "value": "Tech Conference 2025",
            "placeholder": "e.g., Annual Tech Summit",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "f7g8h9i0-j1k2-l3m4-n5o6-p7q8r9s0t1u2",
            "label": "Registration Date",
            "type": "dateLocal",
            "value": "2025-06-15T10:00",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
            "label": "Number of Attendees",
            "type": "Integer",
            "value": 2,
            "placeholder": "How many people will attend?",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "b2c3d4e5-f6a7-8b9c-0d1e-2f3a4b5c6d7e",
            "label": "Dietary Restrictions",
            "type": "option",
            "value": ["Vegetarian", "Gluten-Free"],
            "options": ["Vegetarian", "Vegan", "Gluten-Free", "Dairy-Free", "None"],
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "c3d4e5f6-a7b8-9c0d-1e2f-3a4b5c6d7e8f",
            "label": "Password for Access",
            "type": "passwordInput",
            "value": "secure_pass123",
            "placeholder": "Create a password",
            "required": true,
            "colSpan": 6,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-05-12T09:45:00Z",
        "type": "Ticket",
        "description": "Form for employees to report IT-related issues."
      },
      {
        "formId": "form-004",
        "formName": "Customer Feedback Form",
        "formColSpan": 12,
        "createBy":"nu",
        "formFieldJson": [
          {
            "id": "i9j0k1l2-m3n4-o5p6-q7r8-s9t0u1v2w3x4",
            "label": "Desired Position",
            "type": "textInput",
            "value": "Software Engineer",
            "placeholder": "e.g., Junior Developer",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "j0k1l2m3-n4o5-p6q7-r8s9-t0u1v2w3x4y5",
            "label": "Upload Resume",
            "type": "image",
            "value": null,
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "k1l2m3n4-o5p6-q7r8-s9t0-u1v2w3x4y5z6",
            "label": "Years of Experience",
            "type": "Integer",
            "value": 3,
            "placeholder": "Enter years of experience",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "l2m3n4o5-p6q7-r8s9-t0u1-v2w3x4y5z6a7",
            "label": "Availability Date",
            "type": "dateInput",
            "value": "2025-08-01",
            "required": false,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "m3n4o5p6-q7r8-s9t0-u1v2-w3x4y5z6a7b8",
            "label": "LinkedIn Profile URL",
            "type": "textInput",
            "value": "https://linkedin.com/in/johndoe",
            "placeholder": "Optional",
            "required": false,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-03-01T11:00:00Z",
        "type": "Feedback",
        "description": "Collects feedback from customers on services provided."
      },
      {
        "formId": "form-005",
        "formName": "Product Bug Report",
        "formColSpan": 12,
        "createBy":"tung tung tung sahur",
        "formFieldJson": [
          {
            "id": "u2v3w4x5-y6z7-a8b9-c0d1-e2f3a4b5c6d7",
            "label": "Issue Type",
            "type": "select",
            "value": "Technical Support",
            "options": ["Technical Support", "Billing Inquiry", "General Question", "Feature Request"],
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "v3w4x5y6-z7a8-b9c0-d1e2-f3a4b5c6d7e8",
            "label": "Description of Issue",
            "type": "textAreaInput",
            "value": "My application keeps crashing after the latest update.",
            "placeholder": "Please describe your issue in detail",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "w4x5y6z7-a8b9-c0d1-e2f3-a4b5c6d7e8f9",
            "label": "Priority",
            "type": "radio",
            "value": "High",
            "options": ["Low", "Medium", "High", "Urgent"],
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "x5y6z7a8-b9c0-d1e2-f3a4-b5c6d7e8f9g0",
            "label": "Attach Relevant Files",
            "type": "multiImage",
            "value": [],
            "required": false,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2025-01-20T16:00:00Z",
        "type": "Bug Report",
        "description": "Form for reporting software bugs and issues."
      },
      {
        "formId": "form-006",
        "formName": "New Project Proposal",
        "formColSpan": 12,
        "createBy":"tralalero tralala",
        "formFieldJson": [
          {
            "id": "field-601",
            "label": "Project Name",
            "showLabel": true,
            "type": "text",
            "value": "",
            "placeholder": "Enter project name",
            "required": true,
            "colSpan": 12
          },
          {
            "id": "field-602",
            "label": "Project Goals",
            "showLabel": true,
            "type": "textarea",
            "value": "",
            "placeholder": "Outline project objectives",
            "required": true,
            "colSpan": 12
          }
        ],
        "status": "draft",
        "createdAt": "2025-04-01T08:00:00Z",
        "type": "Proposal",
        "description": "Template for submitting new project proposals for review."
      },
      {
        "formId": "form-007",
        "formName": "Leave Request Form",
        "formColSpan": 12,
        "createBy":"Bombbubini gusini",
        "formFieldJson": [
          {
            "id": "y6z7a8b9-c0d1-e2f3-a4b5-c6d7e8f9g0h1",
            "label": "Date of Birth",
            "type": "dateInput",
            "value": "1990-01-01",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "z7a8b9c0-d1e2-f3a4-b5c6-d7e8f9g0h1i2",
            "label": "Blood Type",
            "type": "select",
            "value": "A+",
            "options": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],
            "required": false,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "a8b9c0d1-e2f3-a4b5-c6d7-e8f9g0h1i2j3",
            "label": "Allergies",
            "type": "option",
            "value": ["Pollen", "Peanuts"],
            "options": ["Pollen", "Dust", "Peanuts", "Shellfish", "Penicillin"],
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "b9c0d1e2-f3a4-b5c6-d7e8-f9g0h1i2j3k4",
            "label": "Current Medications",
            "type": "textAreaInput",
            "value": "None",
            "placeholder": "List any medications you are currently taking",
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "c0d1e2f3-a4b5-c6d7-e8f9-g0h1i2j3k4l5",
            "label": "Emergency Contact Name",
            "type": "textInput",
            "value": "Jane Doe",
            "placeholder": "Full name of emergency contact",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "d1e2f3a4-b5c6-d7e8-f9g0-h1i2j3k4l5m6",
            "label": "Emergency Contact Phone",
            "type": "Integer",
            "value": 9876543210,
            "placeholder": "Phone number of emergency contact",
            "required": true,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-11-15T10:00:00Z",
        "type": "Request",
        "description": "Form for employees to request time off."
      },
      {
        "formId": "form-008",
        "formName": "Expense Reimbursement Form",
        "formColSpan": 12,
        "createBy":"tar tar tar shur",
        "formFieldJson": [
          {
            "id": "p0q1r2s3-t4u5-v6w7-x8y9-z0a1b2c3d4e5",
            "label": "Company Name",
            "type": "textInput",
            "value": "Acme Corp",
            "placeholder": "Your company's legal name",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "q1r2s3t4-u5v6-w7x8-y9z0-a1b2c3d4e5f6",
            "label": "Industry",
            "type": "select",
            "value": "Technology",
            "options": ["Technology", "Healthcare", "Finance", "Education", "Retail"],
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "r2s3t4u5-v6w7-x8y9-z0a1-b2c3d4e5f6g7",
            "label": "Number of Employees",
            "type": "Integer",
            "value": 50,
            "placeholder": "Approximate number of employees",
            "required": false,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "s3t4u5v6-w7x8-y9z0-a1b2-c3d4e5f6g7h8",
            "label": "Website URL",
            "type": "textInput",
            "value": "https://www.acmecorp.com",
            "placeholder": "Your company's website",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "t4u5v6w7-x8y9-z0a1-b2c3-d4e5f6g7h8i9",
            "label": "Primary Contact Person",
            "type": "InputGroup",
            "value": [
              {
                "id": "g3h4i5j6-k7l8-m9n0-o1p2-q3r4s5t6u7v8",
                "label": "Contact Name",
                "type": "textInput",
                "value": "Alice Smith",
                "placeholder": "First and last name",
                "required": true,
                "colSpan": 12,
                "isChild": true
              },
              {
                "id": "h4i5j6k7-l8m9-n0o1-p2q3-r4s5t6u7v8w9",
                "label": "Contact Email",
                "type": "emailInput",
                "value": "alice.smith@acmecorp.com",
                "placeholder": "Contact email",
                "required": true,
                "colSpan": 12,
                "isChild": true
              }
            ],
            "required": true,
            "colSpan": 12,
            "isChild": false,
            "GroupColSpan": 1
          },
          {
            "id": "u5v6w7x8-y9z0-a1b2-c3d4-e5f6g7h8i9j0",
            "label": "Preferred Communication Method",
            "type": "radio",
            "value": "Email",
            "options": ["Email", "Phone", "Video Call"],
            "required": false,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-02-10T11:00:00Z",
        "type": "Reimbursement",
        "description": "Form for employees to submit expense reimbursement requests."
      },
      {
        "formId": "form-009",
        "formName": "Vendor Registration Form",
        "formColSpan": 12,
        "createBy":"bananinu",
        "formFieldJson": [
          {
            "id": "v6w7x8y9-z0a1-b2c3-d4e5-f6g7h8i9j0k1",
            "label": "Feature Title",
            "type": "textInput",
            "value": "Dark Mode Toggle",
            "placeholder": "Concise title for your feature",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "w7x8y9z0-a1b2-c3d4-e5f6-g7h8i9j0k1l2",
            "label": "Feature Description",
            "type": "textAreaInput",
            "value": "Allow users to switch between light and dark themes.",
            "placeholder": "Describe the feature in detail",
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "x8y9z0a1-b2c3-d4e5-f6g7-h8i9j0k1l2m3",
            "label": "Expected Benefit",
            "type": "textAreaInput",
            "value": "Improved user experience, especially in low-light environments.",
            "placeholder": "How will this feature benefit users?",
            "required": false,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "y9z0a1b2-c3d4-e5f6-g7h8-i9j0k1l2m3n4",
            "label": "Priority",
            "type": "select",
            "value": "Medium",
            "options": ["Low", "Medium", "High"],
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "z0a1b2c3-d4e5-f6g7-h8i9-j0k1l2m3n4o5",
            "label": "References/Examples (URLs)",
            "type": "multiImage",
            "value": [],
            "required": false,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "inactive",
        "createdAt": "2023-12-01T09:00:00Z",
        "type": "Registration",
        "description": "Form for new vendors to register with the company."
      },
      {
        "formId": "form-010",
        "formName": "Training Program Enrollment",
        "formColSpan": 12,
        "createBy":"tesr",
        "formFieldJson": [
          {
            "id": "m3n4o5p6-q7r8-s9t0-u1v2-w3x4y5z6a7b8",
            "label": "Course Title",
            "type": "select",
            "value": "Introduction to Programming",
            "options": ["Introduction to Programming", "Advanced Algorithms", "Web Development Fundamentals", "Data Science with Python"],
            "required": true,
            "colSpan": 12,
            "isChild": false
          },
          {
            "id": "n4o5p6q7-r8s9-t0u1-v2w3-x4y5z6a7b8c9",
            "label": "Student ID",
            "type": "textInput",
            "value": "S123456",
            "placeholder": "Your student ID",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "o5p6q7r8-s9t0-u1v2-w3x4-y5z6a7b8c9d0",
            "label": "Enrollment Date",
            "type": "dateInput",
            "value": "2025-09-01",
            "required": true,
            "colSpan": 6,
            "isChild": false
          },
          {
            "id": "p6q7r8s9-t0u1-v2w3-x4y5-z6a7b8c9d0e1",
            "label": "Emergency Contact",
            "type": "InputGroup",
            "value": [
              {
                "id": "i5j6k7l8-m9n0-o1p2-q3r4-s5t6u7v8w9x0",
                "label": "Contact Name",
                "type": "textInput",
                "value": "David Lee",
                "placeholder": "Emergency contact name",
                "required": true,
                "colSpan": 12,
                "isChild": true
              },
              {
                "id": "j6k7l8m9-n0o1-p2q3-r4s5-t6u7v8w9x0y1",
                "label": "Contact Phone",
                "type": "Integer",
                "value": 1122334455,
                "placeholder": "Emergency contact phone",
                "required": true,
                "colSpan": 12,
                "isChild": true
              }
            ],
            "required": true,
            "colSpan": 12,
            "isChild": false,
            "GroupColSpan": 1
          },
          {
            "id": "q7r8s9t0-u1v2-w3x4-y5z6-a7b8c9d0e1f2",
            "label": "Previous Programming Experience",
            "type": "radio",
            "value": "Yes",
            "options": ["Yes", "No"],
            "required": true,
            "colSpan": 12,
            "isChild": false
          }
        ],
        "status": "active",
        "createdAt": "2024-01-01T08:00:00Z",
        "type": "Enrollment",
        "description": "Form for employees to enroll in internal training programs."
      }
    ]
  };
};

const deleteWorkflow = async (id: string): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Deleting workflow ${id}`);
};

const updateWorkflowStatus = async (id: string, status: FormManager['status']): Promise<void> => {
  // await new Promise(resolve => setTimeout(resolve, 500));
  console.log(`Updating workflow ${id} status to ${status}`);
};



const FormListComponent: React.FC = () => {
  const [showDynamicForm, setShowDynamicForm] = useState<boolean>(false);
  const [dynamicEditFormAction, setDynamicEditFormAction] = useState<boolean>(false);
  const [dynamicEditDataFormAction, setDynamicEditDataFormAction] = useState<boolean>(false);
  const [forms, setForms] = useState<FormManager[]>([]);
  const [SelectForm, setSelectForm] = useState<FormField | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [displayMode, setDisplayMode] = useState<'card' | 'table'>('card');
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
  const [filterConfig, setFilterConfig] = useState<FilterConfig>({
    status: '',
    category: '',
    search: ''
  });
  const [pagination, setPagination] = useState<PaginationConfig>({
    page: 1,
    pageSize: 10
  });
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    isOpen: false,
    type: 'delete',
    FormManagerId: '',
    FormManagerName: '',
    newStatus: undefined
  });
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [searchInput, setSearchInput] = useState<string>('');

  const filterOptions = [
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "draft", label: "Draft" },
  ];

  const paginationOptions = [
    { value: "10", label: "10" },
    { value: "20", label: "20" },
    { value: "50", label: "50" },
    { value: "100", label: "100" },
  ];
  const handleOnEdit = (form: FormField) => {
    setSelectForm(form)
    setDynamicEditFormAction(true)
    setDynamicEditDataFormAction(true)
    setShowDynamicForm(true)
  }
  const handleOnView = (form: FormField) => {
    setSelectForm(form)
    setDynamicEditFormAction(false)
    setDynamicEditDataFormAction(false)
    setShowDynamicForm(true)
  }
  const onBack = () => {
    setSelectForm(undefined)
    setShowDynamicForm(false)
  }
  // The `dropdownChild` function is no longer needed since actions are handled within TicketCard/TableRowActions
  // const dropdownChild = (): ReactNode => {
  //   const downdownClassName = "flex w-full font-normal text-left text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300";
  //   return (
  //     <>
  //     </>
  //   );
  // };

  useEffect(() => {
    const loadFormManagers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchForms();
        setForms(response.Forms);
      }
      catch (err) {
        setError('Failed to fetch forms. Please try again.');
        console.error('Error fetching forms:', err);
      }
      finally {
        setLoading(false);
      }
    };

    loadFormManagers();
  }, []);

  // Add toast notification
  const addToast = (type: Toast['type'], message: string) => {
    const id = Date.now().toString();
    const newToast: Toast = { id, type, message };
    setToasts(prev => [...prev, newToast]);

    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Remove toast
  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  // Handle search
  const handleSearch = () => {
    setFilterConfig(prev => ({ ...prev, search: searchInput }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle sort
  const handleSort = (key: keyof FormManager) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter
  const handleFilter = (key: keyof FilterConfig, value: string) => {
    setFilterConfig(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilterConfig({ status: '', category: '', search: '' });
    setSearchInput('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Handle delete workflow
  const handleDeleteWorkflow = async () => {
    try {
      await deleteWorkflow(confirmDialog.FormManagerId);
      setForms(prev => prev.filter(w => w.formId !== confirmDialog.FormManagerId));
      addToast('success', `Workflow "${confirmDialog.FormManagerName}" deleted successfully`);
      setConfirmDialog({ isOpen: false, type: 'delete', FormManagerId: '', FormManagerName: '' });
    }
    catch (err) {
      addToast('error', `Failed to delete workflow, ${err}`);
    }
  };

  // Handle update workflow status
  const handleUpdateStatus = async () => {
    if (!confirmDialog.newStatus) {
      return;
    }

    try {
      await updateWorkflowStatus(confirmDialog.FormManagerId, confirmDialog.newStatus);
      setForms(prev => prev.map(w =>
        w.formId === confirmDialog.FormManagerId
          ? { ...w, status: confirmDialog.newStatus! }
          : w
      ));
      addToast('success', `Workflow status updated to ${confirmDialog.newStatus}`);
      setConfirmDialog({ isOpen: false, type: 'status', FormManagerId: '', FormManagerName: '' });
    }
    catch (err) {
      addToast('error', `Failed to update workflow status, ${err}`);
    }
  };





  // Filter and sort forms
  const filteredAndSortedFormManagers = useMemo(() => {
    const filtered = forms.filter(workflow => {
      const matchesSearch = !filterConfig.search ||
        workflow.formName.toLowerCase().includes(filterConfig.search.toLowerCase()) ||
        workflow.description.toLowerCase().includes(filterConfig.search.toLowerCase());

      const matchesStatus = !filterConfig.status || workflow.status === filterConfig.status;
      const matchesCategory = !filterConfig.category || workflow.type === filterConfig.category;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aValue = a[sortConfig.key!] ?? '';
        const bValue = b[sortConfig.key!] ?? '';

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [forms, filterConfig, sortConfig]);

  // Paginated forms
  const paginatedFormManagers = useMemo(() => {
    const startIndex = (pagination.page - 1) * pagination.pageSize;
    const endIndex = startIndex + pagination.pageSize;
    return filteredAndSortedFormManagers.slice(startIndex, endIndex);
  }, [filteredAndSortedFormManagers, pagination]);

  // Pagination info
  const totalPages = Math.ceil(filteredAndSortedFormManagers.length / pagination.pageSize);
  const startEntry = (pagination.page - 1) * pagination.pageSize + 1;
  const endEntry = Math.min(pagination.page * pagination.pageSize, filteredAndSortedFormManagers.length);

  // Status configurations
  // const statusConfig = {
  //   active: { icon: VideoIcon, color: "text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-800", label: "Active" },
  //   inactive: { icon: ListIcon, color: "text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-800", label: "Inactive" },
  //   draft: { icon: TimeIcon, color: "text-yellow-600 dark:text-yellow-300 bg-yellow-100 dark:bg-yellow-800", label: "Draft" },
  //   testing: { icon: BoltIcon, color: "text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-800", label: "Testing" }
  // };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueCategories = () => {
    return [...new Set(forms.map(w => w.type).filter(Boolean))];
  };

  const getUniqueCategoriesOptions = getUniqueCategories()
    .filter((category): category is string => typeof category === 'string')
    .map(category => ({
      value: category,
      label: category
    }));
  const onSetStatusInactive = (formId: string, formName: string, newStatus: FormManager['status']) => {
    setConfirmDialog({
      isOpen: true,
      type: 'status', // Set type to 'status' for status updates
      FormManagerId: formId,
      FormManagerName: formName,
      newStatus: newStatus, // Pass 'inactive' as the new status
    });
  };
  if (showDynamicForm) {
    return <OnBackOnly onBack={onBack}>

      <DynamicForm initialForm={SelectForm} edit={dynamicEditFormAction} editFormData={dynamicEditDataFormAction}  >
      </DynamicForm>

    </OnBackOnly>
  }
  return (
    <>
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mx-auto w-full">
          {/* Loading */}
          {loading && (
            <></>
          )}

          {/* Error */}
          {error && (
            <></>
          )}

          {/* Toast Notifications */}
          <div className="fixed top-4 right-4 z-50 space-y-2">
            {toasts.map(toast => (
              <div
                key={toast.id}
                className={`flex items-center gap-3 p-4 rounded-lg shadow-lg transition-all duration-300 ${toast.type === 'success' ? 'bg-green-100 dark:bg-green-800 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-100' :
                  toast.type === 'error' ? 'bg-red-100 dark:bg-red-800 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-100' :
                    'bg-yellow-100 dark:bg-yellow-800 border border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-100'
                  }`}
              >
                {toast.type === 'success' && <CheckCircleIcon className="w-5 h-5 text-green-600 dark:text-green-300" />}
                {toast.type === 'error' && <ErrorIcon className="w-5 h-5 text-red-600 dark:text-red-300" />}
                {toast.type === 'warning' && <AlertIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-300" />}
                <span className="text-sm font-medium">{toast.message}</span>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <CloseIcon className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="p-0">
            <div className="mx-auto">
              {/* Header */}
              <div className="mb-8">


                {/* Controls */}
                <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
                  {/* Search */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Input
                        type="text"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search FormManager..."
                      />
                    </div>
                    <Button
                      onClick={handleSearch}
                      variant="dark"
                      className="h-11"
                    >
                      Search
                    </Button>
                  </div>

                  {/* Display Mode Toggle */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600 dark:text-gray-300">View:</span>
                    <div className="flex rounded-lg overflow-hidden">
                      <Button
                        onClick={() => setDisplayMode('card')}
                        className="rounded-r-none"
                        variant={`${displayMode === 'card'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <GridIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => setDisplayMode('table')}
                        className="rounded-l-none"
                        variant={`${displayMode === 'table'
                          ? 'primary'
                          : 'outline'
                          }`}
                      >
                        <ListIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button
                      onClick={undefined}
                      variant="primary"
                    >
                      Create Form
                    </Button>
                  </div>

                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-4 mt-4">
                  {/* Status Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterConfig.status}
                      onChange={(value) => handleFilter('status', value)}
                      options={filterOptions}
                      placeholder="Select Status"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="flex items-center gap-2">
                    <Select
                      value={filterConfig.category}
                      onChange={(value) => handleFilter('category', value)}
                      options={getUniqueCategoriesOptions}
                      placeholder="Select Category"
                    />
                  </div>

                  {/* Clear Filters */}
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                    >
                      <CloseIcon className="w-4 h-4" />
                      Clear Filters
                    </Button>
                  )}
                </div>
              </div>

              {/* Results Info */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Showing {startEntry}-{endEntry} of {filteredAndSortedFormManagers.length} forms
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-300">Show:</span>
                  <Select
                    value={pagination.pageSize.toString()}
                    onChange={(value) => setPagination(prev => ({ ...prev, pageSize: parseInt(value), page: 1 }))}
                    options={paginationOptions}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-300">entries</span>
                </div>
              </div>

              {/* Content */}
              {displayMode === 'card' ? (
                /* Card View */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {paginatedFormManagers.map((form) => (
                    <FormCard
                      key={form.formId}
                      form={form}
                      handleOnEdit={() => handleOnEdit(form)}
                      handleOnView={() => handleOnView(form)}
                      formatDate={formatDate}
                      onSetStatusInactive={onSetStatusInactive}
                    />
                  ))}
                </div>
              ) : (
                /* Table View */
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8">
                  <div className="overflow-x-auto">
                    <Table className="w-full">
                      <thead className="bg-gray-100 dark:bg-gray-800">
                        <tr>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('formName')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Name
                              {sortConfig.key === 'formName' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('status')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Status
                              {sortConfig.key === 'status' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-left">
                            <button
                              onClick={() => handleSort('createdAt')}
                              className="flex items-center gap-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider hover:text-gray-700 dark:hover:text-gray-200"
                            >
                              Created
                              {sortConfig.key === 'createdAt' && (
                                sortConfig.direction === 'asc' ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />
                              )}
                            </button>
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Create By
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedFormManagers.map((form) => {
                          const config = statusConfig[form.status]
                          return (
                            <tr key={form.formId} className="hover:bg-gray-100 dark:hover:bg-gray-800">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{form.formName}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{form.description}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 `}>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                  {form.status}
                                </span>

                                {/* <Select 
                                  value={form.status}
                                  onChange={(value) => setConfirmDialog({
                                    isOpen: true,
                                    type: 'status',
                                    FormManagerId: form.formId,
                                    FormManagerName: form.name,
                                    newStatus: value as FormManager['status']
                                  })}
                                  className={`px-2 py-1 rounded-full text-xs font-medium border-0`}
                                  options={filterOptions}
                                >
                                </Select> */}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                {formatDate(form.createdAt)}
                              </td>

                      
                                {/* Use the new TableRowActions component */}
                                {/* <TableRowActions
                                  form={form}
                                  onSetStatusInactive={handleSetWorkflowStatusInactive}
                                  handleOnEdit={() => handleOnEdit(form)} 
                                  handleOnView={() => handleOnView(form)}
                                /> */}
                                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                                  {form.createBy}
                                </td>
                                <td className="px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <ButtonAction
                                  form={form}
                                  type='list'
                                  onSetStatusInactive={onSetStatusInactive}
                                  handleOnEdit={() => handleOnEdit(form)} 
                                  handleOnView={() => handleOnView(form)}/>
                                </div>
                              </td>
                              
                             
                            </tr>
                          );
                        })}
                      </tbody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Page {pagination.page} of {totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>

                    {/* Page Numbers */}
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            onClick={() => setPagination(prev => ({ ...prev, page }))}
                            variant={`${pagination.page === page
                              ? 'info'
                              : 'primary'
                              }`}
                          >
                            {page}
                          </Button>
                        );
                      })}
                    </div>

                    <Button
                      onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))}
                      disabled={pagination.page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}

              {/* No Results */}
              {paginatedFormManagers.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-500 dark:text-gray-400 text-lg mb-2">No forms found</div>
                  <p className="text-gray-400 dark:text-gray-500 mb-4">
                    {filterConfig.search || filterConfig.status || filterConfig.category
                      ? 'Try adjusting your filters or search terms'
                      : 'Create your first workflow to get started'
                    }
                  </p>
                  {(filterConfig.search || filterConfig.status || filterConfig.category) && (
                    <Button
                      onClick={clearFilters}
                      className="h-11"
                      variant="primary"
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Confirmation Dialog */}
          {confirmDialog.isOpen && (
            <Modal isOpen={confirmDialog.isOpen} onClose={() => setConfirmDialog({ isOpen: false, type: 'delete', FormManagerId: '', FormManagerName: '' })} className="max-w-4xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmDialog.type === 'delete' ? 'Delete Workflow' : 'Update Status'}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {confirmDialog.type === 'delete'
                      ? 'This action cannot be undone'
                      : 'Change workflow status'
                    }
                  </p>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-200 mb-6">
                {confirmDialog.type === 'delete'
                  ? `Are you sure you want to delete "${confirmDialog.FormManagerName}"?`
                  : `Change "${confirmDialog.FormManagerName}" status to ${confirmDialog.newStatus}?`
                }
              </p>

              <div className="flex items-center gap-3 justify-end">
                <Button
                  onClick={() => setConfirmDialog({ isOpen: false, type: 'delete', FormManagerId: '', FormManagerName: '' })}
                >
                  Cancel
                </Button>
                <Button
                  onClick={confirmDialog.type === 'delete' ? handleDeleteWorkflow : handleUpdateStatus}
                  variant={`${confirmDialog.type === 'delete'
                    ? 'error'
                    : 'primary'
                    }`}
                >
                  {confirmDialog.type === 'delete' ? 'Delete' : 'Update'}
                </Button>
              </div>
            </Modal>
          )}
        </div>
      </div>
    </>
  );
};

export default FormListComponent;