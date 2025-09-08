import { useGetListCaseMutationMutation } from "@/store/api/caseApi";



export async function getNewCaseData(){
    const [getCaseList] = useGetListCaseMutationMutation();
    const result = await getCaseList({})
    localStorage.setItem("caseList", JSON.stringify(result.data?.data));
}
