import { FormConfigItem } from "@/components/interface/FormField";
import { LetterText, Hash, AlignJustify, Mail, CheckSquare, ChevronsUpDown, ImageIcon, FileIcon, CalendarDays, Clock, Circle, LayoutGrid, Slack, Lock, Phone } from "lucide-react";
import { JSX } from "react";

export const maxGridCol = 5

export const colSpanClasses: Record<string, string> = {
  1: 'md:col-span-1',
  2: 'md:col-span-2',
  3: 'md:col-span-3',
  4: 'md:col-span-4',
  5: 'md:col-span-5',
  6: 'md:col-span-6',
  7: 'md:col-span-7',
  8: 'md:col-span-8',
  9: 'md:col-span-9',
  10: 'md:col-span-10',
  11: 'md:col-span-11',
  12: 'md:col-span-12',
};

export const gridColumnContainerClasses: Record<string, string> = {
  1: 'md:grid-cols-1',
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10',
  11: 'md:grid-cols-11',
  12: 'md:grid-cols-12',
};


export const commonClasses = "appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight border-gray-300 bg-gray-200 dark:bg-gray-900 dark:border-gray-700 pointer-events-none opacity-70 dark:text-gray-400 rounded-md ";


export const formConfigurations: FormConfigItem[] = [
  { formType: "textInput", title: "Text", canBeChild: true, property: ["contain", "maxLength", "minLength"] },
  { formType: "Integer", title: "Number", canBeChild: true, property: ["maxnumber", "minnumber"] },
  { formType: "textAreaInput", title: "Text Area", canBeChild: true, property: ["contain", "maxLength", "minLength"] },
  { formType: "emailInput", title: "Email", canBeChild: true, property: ["validEmailFormat"] },
  { formType: "option", title: "Multi-Checkbox", options: [], canBeChild: true, property: ["maxSelections", "minSelections"] },
  { formType: "select", title: "Single-Select", options: [], canBeChild: true },
  { formType: "image", title: "Image", canBeChild: true, property: ["maxFileSize", "allowedFileTypes"] },
  { formType: "dndImage", title: "DnD Image", canBeChild: true, property: ["maxFileSize", "allowedFileTypes"] },
  { formType: "multiImage", title: "Multi-Image", canBeChild: true, property: ["maxFileSize", "allowedFileTypes", "minFiles", "maxFiles"] },
  { formType: "dndMultiImage", title: "DnD Multi-Image", canBeChild: true, property: ["maxFileSize", "allowedFileTypes", "minFiles", "maxFiles"] },
  { formType: "passwordInput", title: "Password", canBeChild: true, property: ["minLength", "maxLength", "hasUppercase", "hasLowercase", "hasNumber", "hasSpecialChar", "noWhitespace",], },
  { formType: "dateInput", title: "Date", canBeChild: true, property: ["minDate", "maxDate", "futureDateOnly", "pastDateOnly"] },
  { formType: "dateLocal", title: "Date & Time", canBeChild: true, property: ["minLocalDate", "maxLocalDate", "futureDateOnly", "pastDateOnly"] },
  { formType: "radio", title: "Radio", options: [], canBeChild: true },
  { formType: "InputGroup", title: "Group", canBeChild: false },
  { formType: "dynamicField", title: "Dynamic Field", canBeChild: false },
  // { formType: "phoneNumber", title: "Phone Number", canBeChild:true, property: ["allowedCountries"]}
];


export const formTypeIcons: Record<string, JSX.Element> = {
  textInput: <LetterText size={16} />,
  Integer: <Hash size={16} />,
  textAreaInput: <AlignJustify size={16} />,
  emailInput: <Mail size={16} />,
  option: <CheckSquare size={16} />,
  select: <ChevronsUpDown size={16} />,
  image: <ImageIcon size={16} />,
  dndImage: <FileIcon size={16} />,
  multiImage: <ImageIcon size={16} />,
  dndMultiImage: <ImageIcon size={16} />,
  passwordInput: <Lock size={16} />,
  dateInput: <CalendarDays size={16} />,
  dateLocal: <Clock size={16} />,
  radio: <Circle size={16} />,
  InputGroup: <LayoutGrid size={16} />,
  dynamicField: <Slack size={16} />,
  phoneNumber: <Phone size={16} />
};
