"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Sparkles,
  Calendar,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState(30);
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["analytics", "stats"],
    queryFn: analyticsApi.getStats,
  });

  const { data: exportHistory = [], isLoading: exportsLoading } = useQuery({
    queryKey: ["analytics", "exports"],
    queryFn: () => analyticsApi.getExportHistory(50),
  });

  const { data: timelineData = [], isLoading: timelineLoading } = useQuery({
    queryKey: ["analytics", "timeline", dateRange],
    queryFn: () => analyticsApi.getTimelineData(dateRange),
  });

  const { data: activitiesByType = {}, isLoading: activitiesTypeLoading } =
    useQuery({
      queryKey: ["analytics", "activitiesByType"],
      queryFn: analyticsApi.getActivitiesByType,
    });

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#8b5cf6",
    "#ec4899",
    "#f97316",
  ];

  // Prepare data for charts
  const exportsByFormatData = stats
    ? [
        {
          name: "PDF",
          value: stats.stats.exportsByFormat.pdf,
          color: "#3b82f6",
        },
        {
          name: "Word",
          value: stats.stats.exportsByFormat.word,
          color: "#10b981",
        },
        {
          name: "ATS",
          value: stats.stats.exportsByFormat.ats,
          color: "#f59e0b",
        },
      ]
    : [];

  // Prepare data for activities by type chart
  const activitiesByTypeData = Object.entries(activitiesByType).map(
    ([action, count], index) => {
      // Format action names for display
      const displayName = action
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

      return {
        name: displayName,
        value: count,
        color: COLORS[index % COLORS.length],
      };
    }
  );

  // Filter and paginate export history
  const filteredExports = exportHistory.filter((exp) => {
    const matchesFormat = filterFormat === "all" || exp.format === filterFormat;
    const matchesSearch =
      !searchTerm ||
      exp.cvName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      exp.template.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFormat && matchesSearch;
  });

  const totalPages = Math.ceil(filteredExports.length / itemsPerPage);
  const paginatedExports = filteredExports.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-gray-900">
            Analytics Dashboard
          </h3>
          <p className="text-gray-600 mt-1">
            Track your CV performance and usage metrics
          </p>
        </div>

        {/* Date Range Selector */}
        <select
          value={dateRange}
          onChange={(e) => setDateRange(Number(e.target.value))}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
          <option value={7}>Last 7 days</option>
          <option value={30}>Last 30 days</option>
          <option value={90}>Last 90 days</option>
          <option value={365}>Last year</option>
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          icon={Download}
          title="Total Exports"
          value={stats?.stats.cvDownloads || 0}
          color="blue"
          loading={statsLoading}
        />
        <StatCard
          icon={FileText}
          title="CVs Uploaded"
          value={stats?.stats.cvUploads || 0}
          color="green"
          loading={statsLoading}
        />
        <StatCard
          icon={Sparkles}
          title="CVs Tailored"
          value={stats?.stats.tailoringCount || 0}
          color="purple"
          loading={statsLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activities by Type */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-purple-600" />
            All Activities
          </h4>
          {activitiesTypeLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          ) : activitiesByTypeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={activitiesByTypeData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry: any) => {
                    const percent = (
                      (entry.value /
                        Object.values(activitiesByType).reduce(
                          (a: number, b: number) => a + b,
                          0
                        )) *
                      100
                    ).toFixed(0);
                    return `${entry.name} (${percent}%)`;
                  }}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value">
                  {activitiesByTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No activity data yet
            </div>
          )}
        </div>

        {/* Exports by Format */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Exports by Format
          </h4>
          {statsLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          ) : exportsByFormatData.length > 0 &&
            exportsByFormatData.some((d) => d.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={exportsByFormatData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }: any) =>
                    `${name}: ${(percent * 100).toFixed(0)}%`
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value">
                  {exportsByFormatData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No export data yet
            </div>
          )}
        </div>

        {/* Activity Timeline */}
        <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            Activity Timeline (Last {dateRange} days)
          </h4>
          {timelineLoading ? (
            <div className="h-64 flex items-center justify-center text-gray-500">
              Loading chart...
            </div>
          ) : timelineData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return `${date.getMonth() + 1}/${date.getDate()}`;
                  }}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => formatDate(value)}
                  formatter={(value) => [`${value} activities`, "Count"]}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="activities"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-500">
              No activity data yet
            </div>
          )}
        </div>
      </div>

      {/* Export History Table */}
      <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-purple-600" />
          Recent Export History ({filteredExports.length} exports)
        </h4>

        {/* Filters */}
        {exportHistory.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-3">
            <input
              type="text"
              placeholder="Search by CV name or template..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              value={filterFormat}
              onChange={(e) => {
                setFilterFormat(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="all">All Formats</option>
              <option value="pdf">PDF Only</option>
              <option value="word">Word Only</option>
              <option value="ats">ATS Only</option>
            </select>
          </div>
        )}

        {exportsLoading ? (
          <div className="text-center py-8 text-gray-500">
            Loading exports...
          </div>
        ) : filteredExports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Format
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Template
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CV Name
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedExports.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(item.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          item.format === "pdf"
                            ? "bg-blue-100 text-blue-800"
                            : item.format === "word"
                            ? "bg-green-100 text-green-800"
                            : "bg-orange-100 text-orange-800"
                        }`}>
                        {item.format.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.template}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                      {item.cvName || item.cvId.substring(0, 8) + "..."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-700">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredExports.length)}{" "}
                  of {filteredExports.length} exports
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-3 py-1 rounded text-sm ${
                            currentPage === page
                              ? "bg-blue-500 text-white"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                          }`}>
                          {page}
                        </button>
                      )
                    )}
                  </div>
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            {exportHistory.length > 0
              ? "No exports match your filters"
              : "No exports yet. Export your first CV to see history here."}
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Total Exports</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {stats?.totalExports || 0}
              </p>
            </div>
            <Download className="h-12 w-12 text-blue-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">
                Export Activities
              </p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {stats?.totalActivities || 0}
              </p>
            </div>
            <TrendingUp className="h-12 w-12 text-green-500 opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">
                Last Activity
              </p>
              <p className="text-sm font-semibold text-purple-900 mt-2">
                {stats?.lastActivity
                  ? formatDate(stats.lastActivity)
                  : "No activity yet"}
              </p>
            </div>
            <Calendar className="h-12 w-12 text-purple-500 opacity-50" />
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ElementType;
  title: string;
  value: number;
  color: "blue" | "green" | "purple" | "orange";
  loading?: boolean;
}

function StatCard({ icon: Icon, title, value, color, loading }: StatCardProps) {
  const colorClasses = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
  };

  return (
    <div className="bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        <div
          className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          {loading ? (
            <div className="h-8 w-16 bg-gray-200 animate-pulse rounded mt-1"></div>
          ) : (
            <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
