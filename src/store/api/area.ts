import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";

export interface Area {
  id: string;
  orgId: string;
  countryId: string;
  provId: string;
  districtEn: string;
  districtTh: string;
  districtActive: boolean;
  provinceEn: string;
  provinceTh: string;
  provinceActive: boolean;
  countryEn: string;
  countryTh: string;
  countryActive: boolean;
}


export const areaApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        
        getArea: builder.query<ApiResponse<Area[]>, null>({
            query: () => ({
                url: "/area/country_province_districts",
            }),
            providesTags: ["Area"],
        }),






    }),
});
export const {
    useGetAreaQuery,
} = areaApi;