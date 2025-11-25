import { useTranslation } from "@/hooks/useTranslation";
import { v4 } from "uuid";
import reportConfix from "./reportConfix.json";
import { openJasperReport } from "./openReport";

const ReportComponent: React.FC = () => {
    const { t } = useTranslation();

    return (
        <div className="space-y-6 rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
            {reportConfix.map((section) => (
                <div
                    key={v4()}
                    className="bg-white dark:bg-gray-900 rounded-lg shadow-sm border-none overflow-hidden mb-8"
                >
                    <div className="overflow-auto custom-scrollbar">
                        <table className="min-w-full table-auto">
                            <thead className="bg-gray-100 dark:bg-gray-800">
                                <tr>
                                    <th className="px-6 py-3 text-left text-sm font-medium text-gray-900 dark:text-white">
                                        {t(section.title)}
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                                {section.child.map((item) => (
                                    <tr
                                        key={v4()}
                                        className="hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                                        onClick={()=>openJasperReport(item.url)}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-gray-700 dark:text-gray-400">
                                                {t(item.title)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ReportComponent;
