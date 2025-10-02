"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Button from "@/components/ui/Button";
import {
  FileText,
  Upload,
  Eye,
  Briefcase,
  Sparkles,
  Users,
  TrendingUp,
  CheckCircle,
  Plus,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import { cvApi } from "@/lib/cv";
import { projectsApi } from "@/lib/projects";

export default function DashboardPage() {
  const { user } = useAuth();
  const [cvs, setCvs] = useState<unknown[]>([]);
  const [projects, setProjects] = useState<unknown[]>([]);

  // Calculate real metrics
  const calculateCVQualityScore = (cvs: unknown[]): number => {
    if (cvs.length === 0) return 0;

    let totalScore = 0;
    cvs.forEach((cv) => {
      let score = 0;
      const data = (cv as any)?.parsedData;

      // Basic Info (20 points)
      if (data.name) score += 5;
      if (data.email) score += 5;
      if (data.phone) score += 5;
      if (data.address) score += 5;

      // Experience (30 points)
      if (data.experience && data.experience.length > 0) {
        score += Math.min(30, data.experience.length * 10);
      }

      // Skills (20 points)
      if (data.skills && Object.values(data.skills).flat().length > 0) {
        score += Math.min(20, Object.values(data.skills).flat().length * 2);
      }

      // Projects (15 points)
      if (data.projects && data.projects.length > 0) {
        score += Math.min(15, data.projects.length * 5);
      }

      // Education (10 points)
      if (data.education && data.education.length > 0) {
        score += 10;
      }

      // Summary (5 points)
      if (data.summary && data.summary.length > 50) {
        score += 5;
      }

      totalScore += Math.min(100, score);
    });

    return Math.round(totalScore / cvs.length);
  };

  const calculateProfileCompleteness = (
    user: unknown,
    cvs: unknown[],
    projects: unknown[]
  ): number => {
    let score = 0;

    // User Profile (30 points)
    if ((user as any)?.name) score += 10;
    if ((user as any)?.email) score += 10;
    if ((user as any)?.avatar) score += 10;

    // CVs (40 points)
    if (cvs.length > 0) {
      score += Math.min(40, cvs.length * 20);
    }

    // Projects (20 points)
    if (projects.length > 0) {
      score += Math.min(20, projects.length * 10);
    }

    // Portfolio (10 points)
    if (projects.some((p) => (p as any)?.isAddedToCv)) {
      score += 10;
    }

    return Math.min(100, score);
  };

  const calculateSuccessRate = (cvs: unknown[]): number => {
    if (cvs.length === 0) return 0;

    const tailoredCvs = cvs.filter((cv) => (cv as any)?.isTailored);
    const successRate = (tailoredCvs.length / cvs.length) * 100;

    return Math.round(successRate);
  };

  // Calculate metrics
  const cvQualityScore = calculateCVQualityScore(cvs);
  const profileCompleteness = calculateProfileCompleteness(user, cvs, projects);
  const successRate = calculateSuccessRate(cvs);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cvsData, projectsData] = await Promise.all([
          cvApi.getUserCvs(),
          projectsApi.getUserProjects(),
        ]);
        setCvs(cvsData);
        setProjects(projectsData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const recentCvs = cvs.slice(0, 3);
  const recentProjects = projects.slice(0, 3);
  const tailoredCvs = cvs.filter((cv) => (cv as any)?.isTailored);

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-3xl font-bold text-dark font-inter mb-2">
              Chào mừng trở lại, {user?.name}! 👋
            </h3>
            <p className="text-main text-lg font-karla">
              Quản lý CV và portfolio của bạn một cách dễ dàng với Resumate.
            </p>
          </div>
          <div className="hidden md:block">
            <div className="w-16 h-16 bg-blue rounded-full flex items-center justify-center">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-blue rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-main font-karla">
                Total CVs
              </p>
              <p className="text-2xl font-bold text-dark font-inter">
                {cvs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-main font-karla">
                Projects
              </p>
              <p className="text-2xl font-bold text-dark font-inter">
                {projects.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-main font-karla">
                Tailored CVs
              </p>
              <p className="text-2xl font-bold text-dark font-inter">
                {tailoredCvs.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-yellow rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-main font-karla">
                Success Rate
              </p>
              <p className="text-2xl font-bold text-dark font-inter">
                {successRate}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/dashboard/cv" className="group">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:border-blue">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-dark font-inter">
                  My CV
                </h3>
                <p className="text-sm text-main font-karla">
                  Quản lý CV của bạn
                </p>
              </div>
            </div>
            <div className="flex items-center text-blue text-sm font-medium">
              <span>Xem tất cả CV</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/projects" className="group">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:border-green-500">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-dark font-inter">
                  Projects
                </h3>
                <p className="text-sm text-main font-karla">Quản lý dự án</p>
              </div>
            </div>
            <div className="flex items-center text-green-600 text-sm font-medium">
              <span>Xem tất cả dự án</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/job-tailor" className="group">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:border-purple-500">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-dark font-inter">
                  Job Tailor
                </h3>
                <p className="text-sm text-main font-karla">Tạo CV tailored</p>
              </div>
            </div>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <span>Tailor CV mới</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>

        <Link href="/dashboard/portfolio" className="group">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200 hover:shadow-md transition-all duration-300 group-hover:border-yellow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Users className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-dark font-inter">
                  Portfolio
                </h3>
                <p className="text-sm text-main font-karla">Xem portfolio</p>
              </div>
            </div>
            <div className="flex items-center text-yellow text-sm font-medium">
              <span>Xem portfolio</span>
              <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </div>
          </div>
        </Link>
      </div>

      {/* Recent CVs */}
      {recentCvs.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-dark font-inter">
              CV gần đây
            </h3>
            <Link
              href="/dashboard/cv"
              className="text-blue text-sm font-medium hover:text-dark transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentCvs.map((cv) => (
              <div
                key={(cv as any)?.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue rounded-lg flex items-center justify-center mr-4">
                    <FileText className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark font-karla">
                      {(cv as any)?.originalFileName}
                    </h3>
                    <p className="text-sm text-main">
                      {(cv as any)?.isTailored ? "Tailored CV" : "Original CV"}{" "}
                      •
                      {new Date((cv as any)?.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {(cv as any)?.isTailored && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                      Tailored
                    </span>
                  )}
                  <Link href={`/dashboard/cv`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-dark font-inter">
              Dự án gần đây
            </h3>
            <Link
              href="/dashboard/projects"
              className="text-green-600 text-sm font-medium hover:text-green-700 transition-colors">
              Xem tất cả →
            </Link>
          </div>
          <div className="space-y-4">
            {recentProjects.map((project) => (
              <div
                key={(project as any)?.id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <Briefcase className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-dark font-karla">
                      {(project as any)?.name}
                    </h3>
                    <p className="text-sm text-main">
                      {(project as any)?.techStack?.join(", ")} •
                      {new Date((project as any)?.createdAt).toLocaleDateString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/dashboard/projects`}>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Getting Started */}
      {cvs.length === 0 && projects.length === 0 && (
        <div className="bg-gradient-to-r from-blue to-purple-500 rounded-lg p-8 text-white">
          <div className="text-center">
            <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="h-8 w-8" />
            </div>
            <h3 className="text-2xl font-bold mb-2 font-inter">
              Bắt đầu với Resumate
            </h3>
            <p className="text-lg mb-6 font-karla">
              Upload CV đầu tiên của bạn để bắt đầu tạo portfolio chuyên nghiệp
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/dashboard/cv">
                <Button
                  variant="outline"
                  className="bg-white text-blue hover:bg-gray-100">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload CV
                </Button>
              </Link>
              <Link href="/dashboard/projects">
                <Button
                  variant="outline"
                  className="bg-white text-green-600 hover:bg-gray-100">
                  <Briefcase className="h-4 w-4 mr-2" />
                  Thêm Project
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Tips & Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-yellow rounded-lg flex items-center justify-center mr-3">
              <CheckCircle className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-dark font-inter">
              Tips & Tricks
            </h3>
          </div>
          <ul className="space-y-2 text-sm text-main font-karla">
            <li className="flex items-start">
              <span className="w-2 h-2 bg-blue rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Sử dụng Job Tailor để tạo CV phù hợp với từng vị trí
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Thêm project mới để cập nhật portfolio
            </li>
            <li className="flex items-start">
              <span className="w-2 h-2 bg-purple-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
              Export CV dưới nhiều định dạng khác nhau
            </li>
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-dark font-inter">
              Performance
            </h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-main font-karla">
                CV Quality Score
              </span>
              <span className="text-sm font-bold text-dark">
                {cvQualityScore}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue h-2 rounded-full"
                style={{ width: `${cvQualityScore}%` }}></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-main font-karla">
                Profile Completeness
              </span>
              <span className="text-sm font-bold text-dark">
                {profileCompleteness}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${profileCompleteness}%` }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
