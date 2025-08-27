// /src/components/area/Area.tsx
import React, { useMemo, useState } from "react";
import { Eye, Search } from "lucide-react";
import { GroupIcon, PencilIcon, TrashBinIcon } from "@/icons";
import type { AreaCoverage, ResponseArea, ResponseMetrics } from "@/types/area";

const AreaContent: React.FC<{
  areas: ResponseArea[],
  coverages: AreaCoverage[],
  metrics: ResponseMetrics[],
  color: (value: string) => void,
  percent: (value: number) => string,
  time: (value: number) => string,
}> = ({
  areas,
  coverages,
  metrics,
  color,
  percent,
  time
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRiskLevel, setFilterRiskLevel] = useState<string>("all");

  // Filtered Areas
  const filteredAreas = useMemo(() => {
    return areas.filter(area => {
      const matchesSearch = area.areaName.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          area.areaName.th.includes(searchTerm) ||
                          area.areaCode.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterRiskLevel === "all" || area.riskLevel === filterRiskLevel;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterRiskLevel, areas]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search areas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <select
              value={filterRiskLevel}
              onChange={(e) => setFilterRiskLevel(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Risk Levels</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredAreas.length} of {areas.length} areas
          </div>
        </div>
      </div>

      {/* Areas Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAreas.map((area) => {
          const metric = metrics.find(m => m.areaId === area.id);
          const coverage = coverages.filter(c => c.areaId === area.id);
          
          return (
            <div key={area.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {area.areaName.en}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {area.areaCode} • {area.areaName.th}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${color(area.riskLevel)}`}>
                    {area.riskLevel.toUpperCase()}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Population</span>
                    <span className="text-gray-900 dark:text-white font-medium">{area.population.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Response Target</span>
                    <span className="text-gray-900 dark:text-white font-medium">{time(area.responseTimeTarget)}</span>
                  </div>
                  {metric && (
                    <>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Avg Response</span>
                        <span className={`font-medium ${
                          metric.averageResponseTime <= area.responseTimeTarget 
                            ? "text-green-600 dark:text-green-400" 
                            : "text-red-600 dark:text-red-400"
                        }`}>
                          {time(metric.averageResponseTime)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">SLA Compliance</span>
                        <span className="text-gray-900 dark:text-white font-medium">{percent(metric.slaCompliance)}</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <GroupIcon className="w-4 h-4" />
                    {coverage.length} units assigned
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <Eye className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <PencilIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                      <TrashBinIcon className="w-4 h-4 text-gray-400 hover:text-red-600 dark:hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AreaContent;