import { useNavigate } from "react-router";
import CaseDetailView from "./main/CaseDetailView";

export default function CaseCreation() {
    const navigate = useNavigate();
    return <CaseDetailView caseData={undefined} onBack={() => navigate(-1)} />;
}