

export function CommandInformation() {
  return (
    <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg">
                <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">หน่วยงาน</span>
                    {/* <div className="text-sm font-medium text-gray-900 dark:text-white">{fieldMap["1. Service Type:"] ?? "-"}</div> */}
                    <div className="text-sm font-medium text-gray-900 dark:text-white">หน่วงงาน 1</div>
                </div>
                <div className="mb-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">หมายเลขรถ</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">001</div>
                </div>
                <div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">เจ้าหน้าที่สายตรวจ</span>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">watee</div>
                </div>
            </div>
  );
}
