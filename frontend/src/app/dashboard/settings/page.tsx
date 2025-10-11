"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import { useTheme } from "@/contexts/ThemeContext";
import { usersApi, UserStats } from "@/lib/users";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import {
  User,
  Lock,
  Globe,
  BarChart3,
  Shield,
  Trash2,
  Upload,
  Download,
  Calendar,
  CheckCircle,
  Moon,
  Sun,
} from "lucide-react";
import { useRouter } from "next/navigation";

type TabType = "profile" | "language" | "plan" | "privacy";

export default function SettingsPage() {
  const { user, updateUser, logout } = useAuth();
  const { language, setLanguage, languages, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { showSuccess, showError } = useToast();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<TabType>("profile");
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [name, setName] = useState(user?.name || "");
  const [avatar, setAvatar] = useState(user?.avatar || "");

  // Password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Delete account modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setAvatar(user.avatar || "");
    }
  }, [user]);

  const fetchStats = async () => {
    try {
      const data = await usersApi.getStats();
      setStats(data);
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      showError(t("settings.nameRequired"));
      return;
    }

    setLoading(true);
    try {
      const updatedUser = await usersApi.updateProfile({ name, avatar });
      updateUser(updatedUser);
      showSuccess(t("settings.profileUpdated"));
    } catch (error: any) {
      showError(error.response?.data?.message || t("settings.profileUpdated"));
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      showError(t("settings.allFieldsRequired"));
      return;
    }

    if (newPassword.length < 8) {
      showError(t("settings.passwordTooShort"));
      return;
    }

    if (newPassword !== confirmPassword) {
      showError(t("settings.passwordMismatch"));
      return;
    }

    setLoading(true);
    try {
      await usersApi.changePassword({ oldPassword, newPassword });
      showSuccess(t("settings.passwordChanged"));
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      showError(error.response?.data?.message || t("settings.passwordChanged"));
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showError(t("settings.typeDeleteCorrectly"));
      return;
    }

    setLoading(true);
    try {
      await usersApi.deleteAccount();
      showSuccess(t("settings.accountDeleted"));
      logout();
      router.push("/");
    } catch (error: any) {
      showError(error.response?.data?.message || t("settings.accountDeleted"));
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    try {
      const data = await usersApi.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `resumate-data-${new Date().toISOString()}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccess(t("settings.dataExported"));
    } catch (error: any) {
      showError(t("settings.dataExported"));
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "profile" as TabType, label: t("settings.profile"), icon: User },
    { id: "language" as TabType, label: t("settings.language"), icon: Globe },
    {
      id: "plan" as TabType,
      label: t("settings.planAndUsage"),
      icon: BarChart3,
    },
    { id: "privacy" as TabType, label: t("settings.privacy"), icon: Shield },
  ];

  const isGoogleAccount = (user as any)?.googleId && !(user as any)?.password;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
        <h3 className="text-3xl font-bold text-dark font-inter">
          {t("settings.title")}
        </h3>
        <p className="text-main font-karla mt-2">{t("settings.subtitle")}</p>
      </div>

      {/* Tabs + Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-6 py-4 border-b-2 font-medium text-sm transition-colors
                    ${
                      activeTab === tab.id
                        ? "border-blue text-blue bg-blue-50"
                        : "border-transparent text-main hover:text-dark hover:bg-gray-50"
                    }
                  `}>
                  <Icon size={18} />
                  {tab.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-dark font-inter mb-4">
                  {t("settings.profileInformation")}
                </h4>

                {/* Avatar */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.avatar")}
                  </label>
                  <div className="flex items-center gap-4">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={t("settings.avatar")}
                        className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-blue flex items-center justify-center text-white text-2xl font-bold">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <input
                        type="text"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        placeholder={t("settings.avatarPlaceholder")}
                        className="input-base mb-2"
                      />
                      <p className="text-sm text-main">
                        {t("settings.avatarHint")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.name")}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="input-base"
                    placeholder={t("settings.namePlaceholder")}
                  />
                </div>

                {/* Email (readonly) */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.email")}
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="input-base bg-gray-50 cursor-not-allowed"
                  />
                </div>

                {/* {t("settings.accountType")} */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.accountType")}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    {isGoogleAccount ? (
                      <>
                        <Globe size={20} className="text-blue" />
                        <span className="text-main">
                          {t("settings.googleAccount")}
                        </span>
                      </>
                    ) : (
                      <>
                        <User size={20} className="text-blue" />
                        <span className="text-main">
                          {t("settings.emailAccount")}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* {t("settings.memberSince")} */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.memberSince")}
                  </label>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <Calendar size={20} className="text-blue" />
                    <span className="text-main">
                      {new Date(user?.createdAt || "").toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {/* {t("settings.changePassword")} Button */}
                {!isGoogleAccount && (
                  <div className="mb-6">
                    <Button
                      variant="outline"
                      onClick={() => setShowPasswordModal(true)}
                      className="w-full sm:w-auto">
                      <Lock size={18} className="mr-2" />
                      {t("settings.changePassword")}
                    </Button>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex justify-end pt-4 border-t border-gray-200">
                  <Button
                    onClick={handleUpdateProfile}
                    loading={loading}
                    disabled={loading}>
                    {t("settings.saveChanges")}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Language Tab */}
          {activeTab === "language" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-dark font-inter mb-4">
                  {t("settings.languagePreferences")}
                </h4>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-dark mb-2">
                    {t("settings.interfaceLanguage")}
                  </label>
                  <select
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value as "en" | "vi");
                      showSuccess(t("settings.languageChanged"));
                    }}
                    className="input-base">
                    {languages.map((lang) => (
                      <option key={lang.code} value={lang.code}>
                        {lang.nativeName}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-main mt-2">
                    {t("settings.chooseLanguage")}
                  </p>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-lg border border-blue">
                  <CheckCircle size={20} className="text-blue mt-0.5" />
                  <div>
                    <p className="text-sm text-dark font-medium">
                      {t("settings.languageSaved")}
                    </p>
                    <p className="text-sm text-main mt-1">
                      Your language preference is saved in your browser and will
                      be remembered for future sessions.
                    </p>
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="mt-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Dark Mode</h5>
                      <p className="text-sm text-gray-600 mt-1">
                        Toggle dark mode appearance for better viewing in low
                        light
                      </p>
                    </div>
                    <button
                      onClick={toggleTheme}
                      className="p-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {theme === "dark" ? (
                        <Sun className="h-5 w-5 text-yellow-500" />
                      ) : (
                        <Moon className="h-5 w-5 text-gray-700" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* {t("settings.planAndUsageTitle")} Tab */}
          {activeTab === "plan" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-dark font-inter mb-4">
                  {t("settings.planAndUsageTitle")}
                </h4>

                {/* Current Plan */}
                <div className="mb-6 p-6 bg-gradient-to-r from-blue to-purple-500 rounded-lg text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-2xl font-bold mb-2">
                        {stats?.plan.toUpperCase() || "FREE"} Plan
                      </h5>
                      <p className="opacity-90">
                        {t("settings.enjoyFeatures")}
                      </p>
                    </div>
                    <BarChart3 size={48} className="opacity-80" />
                  </div>
                </div>

                {/* Usage Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-main">
                        {t("settings.totalCVs")}
                      </span>
                      <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-dark">
                      {stats?.totalCvs || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-main">
                        {t("settings.projects")}
                      </span>
                      <CheckCircle size={18} className="text-green-500" />
                    </div>
                    <p className="text-3xl font-bold text-dark">
                      {stats?.totalProjects || 0}
                    </p>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-main">
                        {t("settings.tailoredCVs")}
                      </span>
                      <CheckCircle size={18} className="text-purple-500" />
                    </div>
                    <p className="text-3xl font-bold text-dark">
                      {stats?.tailoredCvs || 0}
                    </p>
                  </div>
                </div>

                {/* Features */}
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h5 className="font-semibold text-dark mb-3">
                    {t("settings.planFeatures")}
                  </h5>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-main">
                      <CheckCircle size={16} className="text-green-500" />
                      {t("settings.unlimitedCVUploads")}
                    </li>
                    <li className="flex items-center gap-2 text-main">
                      <CheckCircle size={16} className="text-green-500" />
                      {t("settings.unlimitedProjects")}
                    </li>
                    <li className="flex items-center gap-2 text-main">
                      <CheckCircle size={16} className="text-green-500" />
                      {t("settings.aiJobTailoring")}
                    </li>
                    <li className="flex items-center gap-2 text-main">
                      <CheckCircle size={16} className="text-green-500" />
                      {t("settings.portfolioGenerator")}
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Privacy Tab */}
          {activeTab === "privacy" && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-semibold text-dark font-inter mb-4">
                  {t("settings.privacyDataManagement")}
                </h4>

                {/* {t("settings.exportData")} */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-dark mb-2">
                        {t("settings.exportYourData")}
                      </h5>
                      <p className="text-sm text-main mb-4">
                        Download all your data including CVs, projects, and
                        portfolio information in JSON format.
                      </p>
                      <Button
                        variant="outline"
                        onClick={handleExportData}
                        loading={loading}
                        disabled={loading}>
                        <Download size={18} className="mr-2" />
                        {t("settings.exportData")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* {t("settings.deleteAccount")} */}
                <div className="mb-6 p-4 border-2 border-red-200 bg-red-50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-semibold text-red-800 mb-2">
                        {t("settings.deleteAccount")}
                      </h5>
                      <p className="text-sm text-red-700 mb-4">
                        Permanently delete your account and all associated data.
                        This action cannot be undone.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteModal(true)}
                        className="border-red-500 text-red-600 hover:bg-red-100">
                        <Trash2 size={18} className="mr-2" />
                        {t("settings.deleteAccount")}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* {t("settings.privacyNotice")} */}
                <div className="p-4 bg-blue-50 rounded-lg border border-blue">
                  <h5 className="font-semibold text-dark mb-2">
                    {t("settings.privacyNotice")}
                  </h5>
                  <p className="text-sm text-main">
                    We take your privacy seriously. Your data is encrypted and
                    stored securely. We never share your personal information
                    with third parties.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* {t("settings.changePassword")} Modal */}
      <Modal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        title={t("settings.changePassword")}>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Current Password
            </label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input-base"
              placeholder={t("settings.currentPasswordPlaceholder")}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              New Password
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-base"
              placeholder={t("settings.newPasswordPlaceholder")}
            />
            <p className="text-xs text-main mt-1">
              {t("settings.newPasswordHint")}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-base"
              placeholder={t("settings.confirmPasswordPlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowPasswordModal(false)}>
              {t("settings.cancel")}
            </Button>
            <Button
              onClick={handleChangePassword}
              loading={loading}
              disabled={loading}>
              {t("settings.updatePassword")}
            </Button>
          </div>
        </div>
      </Modal>

      {/* {t("settings.deleteAccount")} Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title={t("settings.deleteAccount")}>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium mb-2">
              {t("settings.deleteConfirmation")}
            </p>
            <p className="text-sm text-red-700">
              This action is permanent and cannot be undone. All your CVs,
              projects, and portfolio data will be permanently deleted.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark mb-2">
              {t("settings.typeDelete")}
            </label>
            <input
              type="text"
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input-base"
              placeholder={t("settings.typeDeletePlaceholder")}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
              {t("settings.cancel")}
            </Button>
            <Button
              onClick={handleDeleteAccount}
              loading={loading}
              disabled={loading || deleteConfirmText !== "DELETE"}
              className="bg-red-600 hover:bg-red-700 text-white">
              <Trash2 size={18} className="mr-2" />
              {t("settings.deleteAccount")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
