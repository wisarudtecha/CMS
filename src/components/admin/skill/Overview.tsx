// /src/components/admin/skill/SkillManagement.tsx
import React, { useState } from "react";
import { Award, BookOpen, Settings, Star, Target, TrendingUp } from "lucide-react";
import { AlertHexaIcon, GroupIcon, TimeIcon } from "@/icons";
import type { SkillCategory, SkillMetrics } from "@/types/user";

const OverviewContent: React.FC = () => {
  // State Management
  const [, setSelectedCategory] = useState<string>("all");

  // Mock Data (replace with actual API calls)
  const skillCategories: SkillCategory[] = [
    {
      id: "technical",
      name: "Technical Skills",
      description: "Equipment operation and technical expertise",
      icon: <Settings className="w-5 h-5" />,
      color: "bg-blue-100 text-blue-600",
      skillCount: 24,
      avgProficiency: 3.4
    },
    {
      id: "operational",
      name: "Operational Skills",
      description: "Field operations and response procedures",
      icon: <Target className="w-5 h-5" />,
      color: "bg-green-100 text-green-600",
      skillCount: 18,
      avgProficiency: 4.1
    },
    {
      id: "safety",
      name: "Safety & Compliance",
      description: "Safety protocols and regulatory compliance",
      icon: <AlertHexaIcon className="w-5 h-5" />,
      color: "bg-red-100 text-red-600",
      skillCount: 15,
      avgProficiency: 4.5
    },
    {
      id: "certification",
      name: "Certifications",
      description: "Professional certifications and licenses",
      icon: <Award className="w-5 h-5" />,
      color: "bg-purple-100 text-purple-600",
      skillCount: 12,
      avgProficiency: 3.8
    }
  ];

  const mockMetrics: SkillMetrics = {
    totalSkills: 69,
    totalUserSkills: 2847,
    avgProficiencyScore: 3.7,
    skillsNeedingAssessment: 156,
    expiringCertifications: 23,
    topPerformers: 45
  };

  // Component: Metrics Cards
  const MetricsCard: React.FC<{ title: string; value: number; icon: React.ReactNode; trend?: number; color: string }> = 
    ({ title, value, icon, trend, color }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value.toLocaleString()}</p>
          {trend && (
            <div className="flex items-center mt-1">
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600">+{trend}% this month</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  // Component: Skill Category Card
  const SkillCategoryCard: React.FC<{ category: SkillCategory }> = ({ category }) => (
    <div 
      className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
      onClick={() => setSelectedCategory(category.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${category.color}`}>
          {category.icon}
        </div>
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {category.skillCount} skills
        </span>
      </div>
      
      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{category.name}</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{category.description}</p>
      
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">Avg. Proficiency</span>
        <div className="flex items-center">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= category.avgProficiency 
                    ? "text-yellow-400 fill-current" 
                    : "text-gray-300"
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            {category.avgProficiency.toFixed(1)}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        <MetricsCard
          title="Total Skills"
          value={mockMetrics.totalSkills}
          icon={<BookOpen className="w-5 h-5 text-white" />}
          trend={5}
          color="bg-blue-500"
        />
        <MetricsCard
          title="User Skills"
          value={mockMetrics.totalUserSkills}
          icon={<GroupIcon className="w-5 h-5 text-white" />}
          trend={12}
          color="bg-green-500"
        />
        <MetricsCard
          title="Avg. Proficiency"
          value={mockMetrics.avgProficiencyScore}
          icon={<Star className="w-5 h-5 text-white" />}
          trend={8}
          color="bg-yellow-500"
        />
        <MetricsCard
          title="Need Assessment"
          value={mockMetrics.skillsNeedingAssessment}
          icon={<TimeIcon className="w-5 h-5 text-white" />}
          color="bg-orange-500"
        />
        <MetricsCard
          title="Expiring Soon"
          value={mockMetrics.expiringCertifications}
          icon={<AlertHexaIcon className="w-5 h-5 text-white" />}
          color="bg-red-500"
        />
        <MetricsCard
          title="Top Performers"
          value={mockMetrics.topPerformers}
          icon={<Award className="w-5 h-5 text-white" />}
          trend={15}
          color="bg-purple-500"
        />
      </div>

      {/* Skill Categories */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Skill Categories</h2>
          <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
            View All Categories
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skillCategories.map((category) => (
            <SkillCategoryCard key={category.id} category={category} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewContent;
