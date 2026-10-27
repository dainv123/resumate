"use client";

import React, { useCallback } from "react";
import {
  Plus,
  Trash2,
  User,
  Briefcase,
  GraduationCap,
  Award,
  Mail,
  Phone,
} from "lucide-react";
import { CVData } from "@/types/cv.types";
import { Collapse } from "@/components/ui/Collapse";

interface DynamicFormEditorProps {
  formData: CVData;
  onUpdate: (path: string, value: string | string[] | object) => void;
  isEditing?: boolean;
  className?: string;
}

export default function DynamicFormEditor({
  formData,
  onUpdate,
  isEditing = true,
  className = "",
}: DynamicFormEditorProps) {
  // Helper to get icon for each section
  const getSectionIcon = (key: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      experience: <Briefcase className="h-4 w-4 text-blue-600" />,
      education: <GraduationCap className="h-4 w-4 text-green-600" />,
      skills: <Award className="h-4 w-4 text-purple-600" />,
      email: <Mail className="h-4 w-4 text-gray-600" />,
      phone: <Phone className="h-4 w-4 text-gray-600" />,
    };
    return (
      iconMap[key.toLowerCase()] || <User className="h-4 w-4 text-gray-600" />
    );
  };

  const updateField = useCallback(
    (path: string, value: string | string[] | object) => {
      onUpdate(path, value);
    },
    [onUpdate]
  );

  // Tạo giá trị mặc định phù hợp cho từng loại trường - memoized
  const getDefaultValueForField = useCallback((fieldName: string): unknown => {
    const lowerFieldName = fieldName.toLowerCase();

    // Các trường có cấu trúc đặc biệt
    if (
      lowerFieldName.includes("skill") ||
      lowerFieldName.includes("language")
    ) {
      return {
        technical: [],
        soft: [],
        languages: [],
      };
    }

    if (
      lowerFieldName.includes("education") ||
      lowerFieldName.includes("experience") ||
      lowerFieldName.includes("project") ||
      lowerFieldName.includes("certification")
    ) {
      return [];
    }

    if (lowerFieldName.includes("contact") || lowerFieldName.includes("info")) {
      return {
        phone: "",
        email: "",
        address: "",
        linkedin: "",
        github: "",
        website: "",
      };
    }

    if (lowerFieldName.includes("social") || lowerFieldName.includes("link")) {
      return {
        website: "",
        linkedin: "",
        github: "",
        twitter: "",
        portfolio: "",
      };
    }

    if (
      lowerFieldName.includes("achievement") ||
      lowerFieldName.includes("award")
    ) {
      return [];
    }

    if (lowerFieldName.includes("reference")) {
      return [];
    }

    // Các trường đơn giản
    if (lowerFieldName.includes("email") || lowerFieldName.includes("@")) {
      return "";
    }

    if (
      lowerFieldName.includes("url") ||
      lowerFieldName.includes("http") ||
      lowerFieldName.includes("website") ||
      lowerFieldName.includes("github") ||
      lowerFieldName.includes("linkedin")
    ) {
      return "";
    }

    if (lowerFieldName.includes("phone") || lowerFieldName.includes("number")) {
      return "";
    }

    if (lowerFieldName.includes("date") || lowerFieldName.includes("birth")) {
      return "";
    }

    if (
      lowerFieldName.includes("summary") ||
      lowerFieldName.includes("description") ||
      lowerFieldName.includes("bio") ||
      lowerFieldName.includes("about")
    ) {
      return "";
    }

    // Mặc định là string rỗng
    return "";
  }, []);

  // Dynamic field type detection - memoized
  const getFieldType = useCallback((value: unknown): string => {
    if (typeof value === "boolean") return "checkbox";
    if (typeof value === "number") return "number";
    if (typeof value === "string") {
      if (value.includes("@")) return "email";
      if (value.startsWith("http")) return "url";
      if (value.length > 100) return "textarea";
      return "text";
    }
    if (Array.isArray(value)) return "array";
    if (typeof value === "object" && value !== null) return "object";
    return "text";
  }, []);

  // Dynamic field renderer - memoized
  const renderField = useCallback(
    (key: string, value: unknown, path: string, label?: string) => {
      const fieldType = getFieldType(value);
      const fieldLabel =
        label ||
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");

      if (fieldType === "array") {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                {fieldLabel}
              </label>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    const newArray = [...(Array.isArray(value) ? value : [])];
                    // Create new object based on the structure of the first existing item
                    let newItem = {};
                    if (newArray.length > 0) {
                      const firstItem = newArray[0] as Record<string, unknown>;
                      // Copy structure from first item but with empty values
                      newItem = Object.keys(firstItem).reduce((acc, key) => {
                        const value = firstItem[key];
                        if (Array.isArray(value)) {
                          acc[key] = [];
                        } else if (
                          typeof value === "object" &&
                          value !== null
                        ) {
                          acc[key] = {};
                        } else {
                          acc[key] = "";
                        }
                        return acc;
                      }, {} as Record<string, unknown>);
                    } else {
                      // If no items exist, create empty object
                      newItem = {};
                    }
                    newArray.push(newItem);
                    updateField(path, newArray);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
                  <Plus className="h-4 w-4" />
                  <span>Thêm {fieldLabel.slice(0, -1)}</span>
                </button>
              )}
            </div>
            <div className="space-y-2">
              {((value as unknown[]) || []).map(
                (item: unknown, index: number) => {
                  // Skip rendering if item is empty
                  if (item === undefined || item === null || item === "") {
                    return null;
                  }
                  return (
                    <div key={index} className="flex items-center space-x-2">
                      {typeof item === "string" ? (
                        <input
                          type="text"
                          value={item}
                          onChange={(e) => {
                            const newArray = [
                              ...(Array.isArray(value) ? value : []),
                            ];
                            newArray[index] = e.target.value;
                            updateField(path, newArray);
                          }}
                          className="flex-1 input-base"
                          readOnly={!isEditing}
                        />
                      ) : (
                        <div className="flex-1">
                          {renderField(
                            `${key}[${index}]`,
                            item,
                            `${path}[${index}]`,
                            `${key} ${index + 1}`
                          )}
                        </div>
                      )}
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            const newArray = [
                              ...(Array.isArray(value) ? value : []),
                            ];
                            newArray.splice(index, 1);
                            updateField(path, newArray);
                          }}
                          className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
        );
      }

      if (fieldType === "object") {
        return (
          <div className="space-y-4 p-4 border border-gray-200 rounded-lg">
            <h5 className="text-sm font-medium text-gray-900">{fieldLabel}</h5>
            {Object.entries(value || {})
              .filter(
                ([, subValue]) => subValue !== undefined && subValue !== null
              )
              .map(([subKey, subValue]) => (
                <div key={subKey} className="relative group">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="text-sm font-medium text-gray-600 capitalize">
                      {subKey}
                    </h5>
                    {isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Xóa trường "${subKey}"?`)) {
                            const newData = {
                              ...(value as Record<string, unknown>),
                            };
                            delete newData[subKey];
                            updateField(path, newData);
                          }
                        }}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all opacity-0 group-hover:opacity-100"
                        title="Xóa trường">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  {renderField(subKey, subValue, `${path}.${subKey}`)}
                </div>
              ))}
          </div>
        );
      }

      if (fieldType === "textarea") {
        return (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                {fieldLabel}
              </label>
              {isEditing && (
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Xóa trường "${fieldLabel}"?`)) {
                      updateField(path, "");
                    }
                  }}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                  title="Xóa trường">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <textarea
              value={String(value ?? "")}
              onChange={(e) => updateField(path, e.target.value)}
              rows={4}
              className="textarea-base"
              placeholder={`Nhập ${fieldLabel.toLowerCase()}...`}
              readOnly={!isEditing}
            />
          </div>
        );
      }

      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="block text-sm font-medium text-gray-700">
              {fieldLabel}
            </label>
            {isEditing && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Xóa trường "${fieldLabel}"?`)) {
                    updateField(path, "");
                  }
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                title="Xóa trường">
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
          <input
            type={fieldType}
            value={String(value ?? "")}
            onChange={(e) => updateField(path, e.target.value)}
            className="input-base"
            placeholder={`Nhập ${fieldLabel.toLowerCase()}...`}
            readOnly={!isEditing}
          />
        </div>
      );
    },
    [getFieldType, updateField, isEditing]
  );

  // Dynamic section renderer - memoized
  const renderSection = useCallback(
    (key: string, value: unknown, path: string, title?: string) => {
      const sectionTitle =
        title ||
        key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
      const isArray = Array.isArray(value);
      const isObject = typeof value === "object" && value !== null && !isArray;

      return (
        <div key={key}>
          {isArray ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        const newArray = [...(value || [])];
                        // Create new object based on the structure of the first existing item
                        let newItem = {};
                        if (newArray.length > 0) {
                          const firstItem = newArray[0] as Record<
                            string,
                            unknown
                          >;
                          // Copy structure from first item but with empty values
                          newItem = Object.keys(firstItem).reduce(
                            (acc, key) => {
                              const value = firstItem[key];
                              if (Array.isArray(value)) {
                                acc[key] = [];
                              } else if (
                                typeof value === "object" &&
                                value !== null
                              ) {
                                acc[key] = {};
                              } else {
                                acc[key] = "";
                              }
                              return acc;
                            },
                            {} as Record<string, unknown>
                          );
                        } else {
                          // If no items exist, create empty object
                          newItem = {};
                        }
                        newArray.push(newItem);
                        updateField(path, newArray);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 text-sm font-medium">
                      <Plus className="h-4 w-4" />
                      Thêm {sectionTitle.slice(0, -1)}
                    </button>
                  )}
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          confirm(`Xóa tất cả ${sectionTitle.toLowerCase()}?`)
                        ) {
                          updateField(path, []);
                        }
                      }}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 text-sm font-medium">
                      <Trash2 className="h-4 w-4" />
                      Xóa tất cả
                    </button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                {(value as unknown[])?.map((item: unknown, index: number) => {
                  const itemObj = (item as Record<string, unknown>) || {};
                  const hasFields = Object.keys(itemObj).length > 0;

                  return (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h5 className="text-sm font-medium text-gray-900">
                          {sectionTitle} {index + 1}
                        </h5>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              const newArray = [
                                ...(Array.isArray(value) ? value : []),
                              ];
                              newArray.splice(index, 1);
                              updateField(path, newArray);
                            }}
                            className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {hasFields ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {Object.entries(itemObj).map(
                            ([fieldKey, fieldValue]) => (
                              <div
                                key={fieldKey}
                                className={
                                  getFieldType(fieldValue) === "textarea"
                                    ? "md:col-span-2"
                                    : ""
                                }>
                                {renderField(
                                  fieldKey,
                                  fieldValue,
                                  `${path}[${index}].${fieldKey}`,
                                  fieldKey.charAt(0).toUpperCase() +
                                    fieldKey.slice(1).replace(/([A-Z])/g, " $1")
                                )}
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                          <div className="text-center text-gray-500 mb-4">
                            <p className="text-sm">
                              Chưa có trường nào. Hãy thêm trường đầu tiên!
                            </p>
                            {(value as unknown[])?.length > 0 && (
                              <p className="text-xs mt-2 text-blue-600">
                                💡 Gợi ý: Item mới sẽ có cùng cấu trúc với item
                                đầu tiên
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Add field button for empty or existing objects */}
                      {isEditing && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                          <div className="flex items-center gap-2 mb-3">
                            <Plus className="h-4 w-4 text-blue-600" />
                            <p className="text-sm font-medium text-blue-900">
                              Thêm trường mới cho {sectionTitle} {index + 1}
                            </p>
                          </div>
                          <div className="space-y-3">
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Tên trường (ví dụ: name, description, techStack)"
                                className="flex-1 px-3 py-2.5 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const fieldName = (
                                      e.target as HTMLInputElement
                                    ).value.trim();
                                    if (fieldName) {
                                      const newData = {
                                        ...itemObj,
                                      };
                                      newData[fieldName] =
                                        getDefaultValueForField(fieldName);
                                      updateField(`${path}[${index}]`, newData);
                                      (e.target as HTMLInputElement).value = "";
                                    }
                                  }
                                }}
                              />
                              <button
                                type="button"
                                onClick={(e) => {
                                  const input = (
                                    e.target as HTMLButtonElement
                                  ).parentElement?.querySelector("input");
                                  const fieldName = input?.value.trim();
                                  if (fieldName) {
                                    const newData = {
                                      ...itemObj,
                                    };
                                    newData[fieldName] =
                                      getDefaultValueForField(fieldName);
                                    updateField(`${path}[${index}]`, newData);
                                    if (input) input.value = "";
                                  }
                                }}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 font-medium">
                                <Plus className="h-4 w-4" />
                                <span>Thêm</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isObject ? (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries((value as Record<string, unknown>) || {}).map(
                  ([fieldKey, fieldValue]) => (
                    <div
                      key={fieldKey}
                      className={`${
                        getFieldType(fieldValue) === "textarea"
                          ? "md:col-span-2"
                          : ""
                      } relative group`}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          {renderField(
                            fieldKey,
                            fieldValue,
                            `${path}.${fieldKey}`
                          )}
                        </div>
                        {isEditing && (
                          <button
                            type="button"
                            onClick={() => {
                              const newData = {
                                ...(value as Record<string, unknown>),
                              };
                              delete (newData as any)[fieldKey];
                              updateField(path, newData);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-all">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
              {isEditing && (
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Plus className="h-4 w-4 text-blue-600" />
                    <p className="text-sm font-medium text-blue-900">
                      Thêm trường mới cho {sectionTitle}
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Tên trường (ví dụ: website, github)"
                        className="flex-1 px-3 py-2.5 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const fieldName = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (fieldName) {
                              const newData = {
                                ...(value as Record<string, unknown>),
                              };
                              // Tạo cấu trúc phù hợp dựa trên tên trường
                              newData[fieldName] =
                                getDefaultValueForField(fieldName);
                              updateField(path, newData);
                              (e.target as HTMLInputElement).value = "";
                            }
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={(e) => {
                          const input = (
                            e.target as HTMLButtonElement
                          ).parentElement?.querySelector("input");
                          const fieldName = input?.value.trim();
                          if (fieldName) {
                            const newData = {
                              ...(value as Record<string, unknown>),
                            };
                            // Tạo cấu trúc phù hợp dựa trên tên trường
                            newData[fieldName] =
                              getDefaultValueForField(fieldName);
                            updateField(path, newData);
                            if (input) input.value = "";
                          }
                        }}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 font-medium">
                        <Plus className="h-4 w-4" />
                        <span>Thêm</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>{renderField(key, value, path, sectionTitle)}</div>
          )}
        </div>
      );
    },
    [getFieldType, updateField, getDefaultValueForField, renderField, isEditing]
  );

  if (!formData) return null;

  // Separate contact fields from other fields
  const contactFields = formData.contact || {};
  const otherFields = Object.entries(formData).filter(
    ([key, value]) =>
      key !== "contact" &&
      key !== "createdAt" &&
      key !== "lastModified" &&
      key !== "template" &&
      key !== "updatedAt" &&
      key !== "version" &&
      value !== undefined &&
      value !== null &&
      value !== ""
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Contact Information Card */}
      {Object.keys(contactFields).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Thông tin liên hệ
            </h3>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
              {Object.keys(contactFields).length} fields
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(contactFields).map(([fieldKey, fieldValue]) => (
              <div key={fieldKey} className="relative group">
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    {renderField(
                      fieldKey,
                      fieldValue,
                      `contact.${fieldKey}`,
                      fieldKey === "name"
                        ? "Họ tên"
                        : fieldKey === "email"
                        ? "Email"
                        : fieldKey === "phone"
                        ? "Số điện thoại"
                        : fieldKey === "address"
                        ? "Địa chỉ"
                        : fieldKey === "linkedin"
                        ? "LinkedIn"
                        : fieldKey === "github"
                        ? "GitHub"
                        : fieldKey === "website"
                        ? "Website"
                        : fieldKey === "location"
                        ? "Vị trí"
                        : fieldKey.charAt(0).toUpperCase() + fieldKey.slice(1)
                    )}
                  </div>
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => {
                        const newData = {
                          ...contactFields,
                        };
                        delete newData[fieldKey as keyof typeof contactFields];
                        updateField("contact", newData);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-all">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {isEditing && (
            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-3">
                <Plus className="h-4 w-4 text-blue-600" />
                <p className="text-sm font-medium text-blue-900">
                  Thêm trường liên hệ mới
                </p>
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tên trường (ví dụ: twitter, instagram)"
                  className="flex-1 px-3 py-2.5 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      const fieldName = (
                        e.target as HTMLInputElement
                      ).value.trim();
                      if (fieldName) {
                        const newData = {
                          ...contactFields,
                        };
                        newData[fieldName as keyof typeof contactFields] = "";
                        updateField("contact", newData);
                        (e.target as HTMLInputElement).value = "";
                      }
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={(e) => {
                    const input = (
                      e.target as HTMLButtonElement
                    ).parentElement?.querySelector("input");
                    const fieldName = input?.value.trim();
                    if (fieldName) {
                      const newData = {
                        ...contactFields,
                      };
                      newData[fieldName as keyof typeof contactFields] = "";
                      updateField("contact", newData);
                      if (input) input.value = "";
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center gap-1 font-medium">
                  <Plus className="h-4 w-4" />
                  <span>Thêm</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Other Fields */}
      {otherFields.map(([key, value]) => {
        const sectionTitle =
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");
        const itemCount = Array.isArray(value) ? value.length : undefined;

        return (
          <Collapse
            key={key}
            title={sectionTitle}
            icon={getSectionIcon(key)}
            badge={itemCount}
            defaultOpen={
              key === "name" ||
              key === "email" ||
              key === "phone" ||
              key === "summary"
            }
            contentClassName="p-0 bg-gray-50">
            <div className="p-4">{renderSection(key, value, key)}</div>
          </Collapse>
        );
      })}
    </div>
  );
}
