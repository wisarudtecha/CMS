import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";

export interface Customer {
    id: string;
    orgId: string;
    displayName: string;
    title: string;
    firstName: string;
    middleName: string;
    lastName: string;
    citizenId: string;
    dob: string;
    blood: string;
    gender: string;
    mobileNo: string;
    address: Address;
    photo: string;
    email: string;
    userType: string;
    active: boolean;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
}

export interface Address {
    lat: string;
    lon: string;
    road: string;
    room: string;
    floor: string;
    street: string;
    country: string;
    building: string;
    district: string;
    province: string;
    postalCode: string;
    subDistrict: string;
}


export function mergeAddress(address: Address): string {
  const addressParts: string[] = [];

  if (address.building) {
    addressParts.push(address.building);
  }
  if (address.room && address.floor) {
    addressParts.push(`Room ${address.room}, Floor ${address.floor}`);
  } else if (address.room) {
    addressParts.push(`Room ${address.room}`);
  } else if (address.floor) {
    addressParts.push(`Floor ${address.floor}`);
  }

  if (address.street) {
    addressParts.push(address.street);
  }
  if (address.road) {
    addressParts.push(address.road);
  }
  
  const locationParts: string[] = [];
  if (address.subDistrict) {
    locationParts.push(address.subDistrict);
  }
  if (address.district) {
    locationParts.push(address.district);
  }
  if (address.province) {
    locationParts.push(address.province);
  }

  if (locationParts.length > 0) {
    addressParts.push(locationParts.join(', '));
  }

  if (address.postalCode) {
    addressParts.push(address.postalCode);
  }
  if (address.country) {
    addressParts.push(address.country);
  }

  return addressParts.join(', ');
}

export interface PaginationParams {
    start?: number;
    length?: number;
}

export const customerApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        getCustommers: builder.query<ApiResponse<Customer[]>, PaginationParams>({
            query: (params) => ({
                url: "/customer",
                params,
            }),
            providesTags: ["Customer"],
        }),






    }),
});
export const {
    useGetCustommersQuery
} = customerApi;

