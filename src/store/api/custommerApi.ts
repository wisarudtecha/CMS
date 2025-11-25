import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";
import { useTranslation } from "@/hooks/useTranslation";

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
  no?: string;
  lat?: string;
  lon?: string;
  road?: string;
  room?: string;
  floor?: string;
  street?: string;
  country?: string;
  building?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  subDistrict?: string;
}

export function mergeAddress(address: Address): string {
  const addressParts: string[] = [];
  const { t } = useTranslation();
  // House/Building number
  if (address.no) {
    addressParts.push(address.no);
  }

  // Room and Floor
  if (address.room && address.floor) {
    addressParts.push(`${t("common.room")} ${address.room}, ${t("common.floor")} ${address.floor}`);
  } else if (address.room) {
    addressParts.push(`${t("common.room")} ${address.room}`);
  } else if (address.floor) {
    addressParts.push(`${t("common.floor")} ${address.floor}`);
  }

  // Building name
  if (address.building) {
    addressParts.push(address.building);
  }

  // Street or Road (handle both, prioritize the one with value)
  if (address.street) {
    addressParts.push(address.street);
  } else if (address.road) {
    addressParts.push(address.road);
  }

  // Sub-district
  if (address.subDistrict) {
    addressParts.push(address.subDistrict);
  }

  // District
  if (address.district) {
    addressParts.push(address.district);
  }

  // Province
  if (address.province) {
    addressParts.push(address.province);
  }

  // Postal Code
  if (address.postalCode) {
    addressParts.push(address.postalCode);
  }

  // Country
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

    getCustommerByPhoneNo: builder.query<ApiResponse<Customer>, { phoneNo: string }>({
      query: (params) => ({
        url: `/customer/byPhoneNo/${params.phoneNo}`,
        params,
      }),
      providesTags: ["Customer"],
    }),

    getCustommerByPhoneNoMutation: builder.mutation<ApiResponse<Customer>, { phoneNo: string }>({
      query: (params) => ({
        url: `/customer/byPhoneNo/${params.phoneNo}`,
        params,
      }),
      invalidatesTags: ["Customer"],
    }),








  }),
});
export const {
  useGetCustommersQuery,
  useGetCustommerByPhoneNoQuery,
  useLazyGetCustommerByPhoneNoQuery,
  useLazyGetCustommersQuery,
  useGetCustommerByPhoneNoMutationMutation,
} = customerApi;

