// /src/components/admin/system-configuration/skill/SkillManagement.tsx
import React, { useState, useMemo } from "react";
import { 
  Users, 
  Award, 
  TrendingUp, 
  AlertTriangle, 
  BookOpen,
  Search,
  Plus,
  Settings,
  BarChart3,
  UserCheck,
  Target,
  Clock,
  Star,
  CheckCircle,
  XCircle,
  Eye
} from "lucide-react";
import type { EnhancedSkill, SkillCategory, SkillMetrics } from "@/types/user";

const SkillManagementComponent: React.FC = () => {
  // State Management
  const [activeTab, setActiveTab] = useState<"overview" | "skills" | "assessments" | "analytics">("overview");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table" | "matrix">("grid");

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
      icon: <AlertTriangle className="w-5 h-5" />,
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

  // Mock skills data
  const mockSkills: EnhancedSkill[] = useMemo(() => [
    {
      id: "1",
      orgId: "org1",
      skillId: "TECH001",
      en: "Camera Operation",
      th: "การใช้งานกล้อง",
      category: "technical",
      level: "intermediate",
      prerequisites: [],
      certificationRequired: false,
      active: true,
      icon: "📷",
      color: "bg-blue-50",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      createdBy: "admin",
      updatedBy: "admin"
    },
    {
      id: "2",
      orgId: "org1",
      skillId: "TECH002",
      en: "Water Sensor Maintenance",
      th: "การบำรุงรักษา Sensor น้ำ",
      category: "technical",
      level: "advanced",
      prerequisites: ["TECH001"],
      certificationRequired: true,
      expirationPeriod: 12,
      active: true,
      icon: "💧",
      color: "bg-cyan-50",
      createdAt: "2024-01-15",
      updatedAt: "2024-01-15",
      createdBy: "admin",
      updatedBy: "admin"
    }
  ], []);

  // Filtered skills based on search and category
  const filteredSkills = useMemo(() => {
    return mockSkills.filter(skill => {
      const matchesSearch = skill.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           skill.th.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "all" || skill.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, mockSkills]);

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

  // Component: Skill Grid Item
  const SkillGridItem: React.FC<{ skill: EnhancedSkill }> = ({ skill }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={`p-2 rounded-lg ${skill.color || "bg-gray-100"} mr-3`}>
            <span className="text-lg">{skill.icon || "🔧"}</span>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white">{skill.en}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{skill.th}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Eye className="w-4 h-4 text-gray-500" />
          </button>
          <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
            <Settings className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Level:</span>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            skill.level === "expert" ? "bg-purple-100 text-purple-700" :
            skill.level === "advanced" ? "bg-blue-100 text-blue-700" :
            skill.level === "intermediate" ? "bg-green-100 text-green-700" :
            "bg-gray-100 text-gray-700"
          }`}>
            {skill.level}
          </span>
        </div>

        {skill.certificationRequired && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Certification:</span>
            <Award className="w-4 h-4 text-yellow-500" />
          </div>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600 dark:text-gray-400">Status:</span>
          <div className="flex items-center">
            {skill.active ? (
              <CheckCircle className="w-4 h-4 text-green-500" />
            ) : (
              <XCircle className="w-4 h-4 text-red-500" />
            )}
            <span className={`ml-1 text-xs ${skill.active ? "text-green-600" : "text-red-600"}`}>
              {skill.active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-6">
      <div className="mx-auto w-full">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <Plus className="w-4 h-4 mr-2" />
                Add Skill
              </button>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center">
                <BarChart3 className="w-4 h-4 mr-2" />
                Analytics
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mt-6">
            {[
              { id: "overview", label: "Overview", icon: BarChart3 },
              { id: "skills", label: "Skills", icon: Settings },
              { id: "assessments", label: "Assessments", icon: UserCheck },
              { id: "analytics", label: "Analytics", icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
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
                icon={<Users className="w-5 h-5 text-white" />}
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
                icon={<Clock className="w-5 h-5 text-white" />}
                color="bg-orange-500"
              />
              <MetricsCard
                title="Expiring Soon"
                value={mockMetrics.expiringCertifications}
                icon={<AlertTriangle className="w-5 h-5 text-white" />}
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
        )}

        {/* Skills Tab */}
        {activeTab === "skills" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white dark:bg-gray-800">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Search skills..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Categories</option>
                    {skillCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">View:</span>
                  <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                    {(["grid", "table", "matrix"] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          viewMode === mode
                            ? "bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
                        }`}
                      >
                        {mode.charAt(0).toUpperCase() + mode.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredSkills.map((skill) => (
                <SkillGridItem key={skill.id} skill={skill} />
              ))}
            </div>

            {filteredSkills.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Skills Found</h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Assessments and Analytics tabs would go here */}
        {(activeTab === "assessments" || activeTab === "analytics") && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-12 border border-gray-200 dark:border-gray-700 text-center">
            <div className="mb-4">
              {activeTab === "assessments" ? (
                <UserCheck className="w-16 h-16 text-gray-400 mx-auto" />
              ) : (
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto" />
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {activeTab === "assessments" ? "Assessment Tools" : "Advanced Analytics"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {activeTab === "assessments" 
                ? "Skill assessment and certification management tools will be implemented here."
                : "Comprehensive skill analytics and reporting dashboard will be implemented here."
              }
            </p>
            <button className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Coming Soon
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillManagementComponent;
