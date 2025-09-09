import { ApiResponse } from "@/types";
import { baseApi } from "./baseApi";

export interface Area {
    id: string;
    orgId: string;
    countryId: string;
    provId: string;
    distId: string;
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

export const mergeArea = (data: Area, language: string) => {
    if (language === "th") {
        return `${data.countryTh ? `${data.countryTh}` : ""}` +
            `${data.provinceTh ? `-${data.provinceTh}` : ""}` +
            `${data.districtTh ? `-${data.districtTh}` : ""}`
    } else {
        return `${data.countryEn ? `${data.countryEn}` : ""}` +
            `${data.provinceEn ? `-${data.provinceEn}` : ""}` +
            `${data.districtEn ? `-${data.districtEn}` : ""}`
    }
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