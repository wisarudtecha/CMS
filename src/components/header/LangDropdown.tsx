// /src/components/header/LangDropdown.tsx
import { useState } from "react";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Dropdown } from "../ui/dropdown/Dropdown";
// import { i18n } from '@lingui/core';
// import { Trans } from "@lingui/react/macro";

import { useTranslation } from "../../hooks/useTranslation";

interface LanguageSwitcherProps {
  className?: string;
  showNative?: boolean;
}

export default function LangDropdown({ className = "bg-gray-100", showNative = true }: LanguageSwitcherProps) {
  const { t, language, setLanguage, languages } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);

  function toggleLanguage(lang: string) {
    // i18n.activate(lang);
    setLanguage(lang as typeof language); // Cast to any if necessary, or use a more specific type
    setIsOpen(false);
  }

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }
  return (
    <div className="relative">
      <button
        onClick={toggleDropdown}
        className="flex items-center text-gray-700 dropdown-toggle dark:text-gray-400"
      >
        {/*
        <span className="mr-3 overflow-hidden rounded-full h-11 w-11">
          <img src="/images/user/owner.jpg" alt="User" />
        </span>
        */}

        {/* <span className="block mr-1 font-medium text-theme-sm"><Trans>nav.language</Trans></span> */}
        <span className="block mr-1 font-medium text-theme-sm">{t('navigation.topbar.settings.language')}</span>
        <svg
          className={`stroke-gray-500 dark:stroke-gray-400 transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
          width="18"
          height="20"
          viewBox="0 0 18 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.3125 8.65625L9 13.3437L13.6875 8.65625"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute left-0 lg:-left-50 mt-[17px] flex w-[260px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark"
      >
        <ul className="flex flex-col gap-1 pt-4 pb-3 border-gray-200 dark:border-gray-800">
          {/*
          <li>
            <DropdownItem
              onItemClick={() => toggleLanguage("th")}
              className={`${languages.find((e) => e.code === "th") ? "bg-gray-100" : ""} flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300`}
            >
              ไทย
            </DropdownItem>
          </li>
          <li>
            <DropdownItem
              onItemClick={() => toggleLanguage("en")}
              className={`${languages.find((e) => e.code === "en") ? "bg-gray-100" : ""} flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300`}
            >
              English
            </DropdownItem>
          </li>
          */}
          {languages.map((lang) => (
            <li key={lang.code}>
              <DropdownItem
                onItemClick={() => toggleLanguage(lang.code)}
                className={`${showNative && language === lang.code ? className : ""} flex items-center gap-3 px-3 py-2 font-medium text-gray-700 rounded-lg group text-theme-sm hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300`}
              >
                {lang.nativeName}
              </DropdownItem>
            </li>
          ))}
        </ul>
      </Dropdown>
    </div>
  );
}
