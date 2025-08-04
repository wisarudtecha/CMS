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

interface PaginationParams {
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

