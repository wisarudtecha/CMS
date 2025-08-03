// /src/utils/stringFormatters.ts
import type { Address } from "@/types/user";

export const camelToCap = (input: string): string => {
  return input
    .replace(/([a-z])([A-Z])/g, "$1 $2") // insert space before capital letters
    .replace(/^./, str => str.toUpperCase()) // capitalize the first letter
    .replace(/\b\w/g, str => str.toUpperCase()); // capitalize each word
}

export const formatAddress = (address: Address): string => {
  const parts = [
    address.street,
    address.floor ? `Floor ${address.floor}` : "",
    address.room,
    address.building,
    address.road,
    address.subDistrict,
    address.district,
    `${address.province || ""} ${address.postalCode || ""}`,
    address.country,
  ];

  return parts.filter(Boolean).join(", ");
}

export const isValidJsonString = (str: string): boolean => {
  try {
    const parsed = JSON.parse(str);
    return typeof parsed === "object" && parsed !== null;
  }
  catch {
    return false;
  }
}
