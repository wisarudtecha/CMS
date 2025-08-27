// /src/components/area/Overview.tsx
import React, { useCallback, useState } from "react";
import { MapPin, Target, TrendingUp } from "lucide-react";
import { AlertHexaIcon, AngleLeftIcon, ChevronDownIcon, GroupIcon, TimeIcon } from "@/icons";
import type { ResponseArea, ResponseMetrics } from "@/types/area";

const OverviewContent: React.FC<{
  areas: ResponseArea[],
  metrics: ResponseMetrics[],
  color: (value: string) => void,
  percent: (value: number) => string,
  time: (value: number) => string,
}> = ({
  areas,
  metrics,
  color,
  percent,
  time
}) => {
  const [expandedMetrics, setExpandedMetrics] = useState<string[]>([]);

  const toggleMetricsExpanded = useCallback((areaId: string) => {
    setExpandedMetrics(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  }, []);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Summary Cards */}
      <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Total Areas</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{areas.length}</p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {time(metrics.reduce((acc, m) => acc + m.averageResponseTime, 0) / metrics.length)}
              </p>
            </div>
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <TimeIcon className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">SLA Compliance</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {percent(Math.round(metrics.reduce((acc, m) => acc + m.slaCompliance, 0) / metrics.length))}
              </p>
            </div>
            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
              <Target className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Active Incidents</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {metrics.reduce((acc, m) => acc + m.activeIncidents, 0)}
              </p>
            </div>
            <div className="p-3 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <AlertHexaIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Area Performance Cards */}
      <div className="lg:col-span-3">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Area Performance</h2>
        <div className="space-y-4">
          {areas.map((area: ResponseArea) => {
            const metric = metrics.find((m: ResponseMetrics) => m.areaId === area.id);
            const isExpanded = expandedMetrics.includes(area.id);
            
            return (
              <div key={area.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => toggleMetricsExpanded(area.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
                        ) : (
                          <AngleLeftIcon className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {area.areaName.en}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {area.areaCode} • Population: {area.population.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${color(area.riskLevel)}`}>
                        {area.riskLevel.toUpperCase()}
                      </span>
                      {metric && (
                        <div className="flex items-center gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <TimeIcon className="w-4 h-4 text-gray-400" />
                            <span>{time(metric.averageResponseTime)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4 text-gray-400" />
                            <span>{percent(metric.slaCompliance)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GroupIcon className="w-4 h-4 text-gray-400" />
                            <span>{metric.availableUnits}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isExpanded && metric && (
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Total Cases</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{metric.totalCases}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Active Incidents</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{metric.activeIncidents}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Response Target</p>
                          <p className="text-lg font-semibold text-gray-900 dark:text-white">{time(area.responseTimeTarget)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500 dark:text-gray-400">Demand Trend</p>
                          <div className="flex items-center gap-1">
                            <TrendingUp className={`w-4 h-4 ${
                              metric.demandTrend === "up" ? "text-red-500" : 
                              metric.demandTrend === "down" ? "text-green-500" : "text-gray-400"
                            }`} />
                            <span className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                              {metric.demandTrend}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;