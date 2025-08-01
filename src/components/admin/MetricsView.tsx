// /src/components/admin/MetricsView.tsx
import { JSX } from "react";
import type { RoleAnalytics, RoleMetrics } from "@/types/role";
import type { UserMetrics } from "@/types/user";
import MetricsCard from "@/components/admin/MetricsCard";

const MetricsView: React.FC<{ 
  metrics: UserMetrics | RoleMetrics | RoleAnalytics;
  attrMetrics: { key: string; title: string; icon: React.FC<{ className: string }>; color: string; className: string; trend?: number }[];
}> = ({ metrics, attrMetrics }) => {
  const cardMetrics: JSX.Element[] = [];

  Object.entries(metrics).forEach(([key, item]) => {
    const metric = attrMetrics.find((m) => m.key === key);

    if (!metric) {
      // Handle case where metric is not found, e.g., skip or log an error
      // console.warn(`Metric configuration not found for key: ${key}`);
      return;
    }

    const { title, icon: Icon, className, trend, color } = metric as {
      title: string;
      icon: React.FC<{ className: string }>;
      className: string;
      trend?: number;
      color: string;
    };
    const value = item as string | number;

    cardMetrics.push(
      <MetricsCard
        key={key}
        title={title}
        value={value}
        icon={<Icon className={`w-6 h-6 ${className}`} />}
        trend={trend}
        color={color}
      />
    );
  });

  const attrMetricsLength = attrMetrics?.length || 0;
  const gridSize = Math.ceil(attrMetricsLength / (attrMetricsLength <= 4 ? 1 : 2));
  
  return (
    <div className={`xl:grid grid-cols-1 md:grid-cols-${gridSize} gap-x-6`}>
      {cardMetrics}
    </div>
  );
}

export default MetricsView;
