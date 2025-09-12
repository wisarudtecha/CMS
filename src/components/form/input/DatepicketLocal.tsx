"use client";
import React from 'react';
import DatePicker, { registerLocale, DatePickerProps } from 'react-datepicker';
import { th, enUS } from 'date-fns/locale';
import "react-datepicker/dist/react-datepicker.css";

registerLocale("th", th);
registerLocale("en", enUS);

interface DatePickerLocalProps extends Omit<DatePickerProps, 'onChange'> {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  language: string;
  className?: string;
  minDate?: Date;
  maxDate?: Date;
  showTimeSelect?: boolean;
  dateFormat?: string;
  placeholderText?: string;
  calendarClassName?: string;
  wrapperClassName?: string;
  popperClassName?: string;
}

const DatePickerLocal: React.FC<DatePickerLocalProps> = (props) => {
  const {
    selected,
    onChange,
    language,
    className = "",
    minDate,
    maxDate,
    showTimeSelect = false,
    dateFormat = "P",
    placeholderText = "Select date",
    calendarClassName = "dark-theme-datepicker",
    wrapperClassName = "",
    popperClassName = "",
    disabled,
    readOnly,
    autoComplete,
    autoFocus,
    id,
    name,
    required,
    tabIndex,
    title,
  } = props;

  return (
    <DatePicker
      selected={selected}
      onChange={onChange}
      locale={language}
      className={className}
      minDate={minDate}
      maxDate={maxDate}
      showTimeSelect={showTimeSelect}
      dateFormat={dateFormat}
      placeholderText={placeholderText}
      calendarClassName={calendarClassName}
      wrapperClassName={wrapperClassName}
      popperClassName={popperClassName}
      disabled={disabled}
      readOnly={readOnly}
      autoComplete={autoComplete}
      autoFocus={autoFocus}
      id={id}
      name={name}
      required={required}
      tabIndex={tabIndex}
      title={title}
    />
  );
};

export default DatePickerLocal;