import { ApiResponse} from "@/types";
import { baseApi } from "./baseApi";
import { CaseSubType, CaseType } from "@/components/interface/CaseType";

export const formApi = baseApi.injectEndpoints({
    endpoints: (builder) => ({
        // Ticket CRUD operations

        getType: builder.query<ApiResponse<CaseType[]>, null>({
            query: () => "/casetypes",
            providesTags: ["Cases"],
        }),

        getSubType: builder.query<ApiResponse<CaseSubType[]>, null>({
            query: () => "/casesubtypes",
            providesTags: ["Cases"],
        }),

       


       
    }),
});
export const {
    useGetSubTypeQuery,
    useGetTypeQuery,
} = formApi;

