"use client";

// @ts-nocheck - TypeScript strict mode disabled for this file due to complex dynamic form handling
import React, { useState, useEffect, useCallback } from "react";
import { X, Save, User, Trash2, Plus } from "lucide-react";
import { CV, CVData } from "@/lib/cv";
import Button from "@/components/ui/Button";

interface EditCVModalProps {
  cv: CV;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cvId: string, updatedData: CVData) => Promise<void>;
}

export default function EditCVModal({
  cv,
  isOpen,
  onClose,
  onSave,
}: EditCVModalProps) {
  const [formData, setFormData] = useState<CVData>(cv.parsedData);
  const [isSaving, setIsSaving] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setFormData(cv.parsedData);
    }
  }, [isOpen, cv.parsedData]);

  useEffect(() => {
    console.log("FormData updated:", formData);
  }, [formData, forceUpdate]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log("Saving CV with data:", formData);
      console.log("CV ID:", cv.id);
      await onSave(cv.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save CV:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Get nested value from path - memoized
  const getNestedValue = useCallback(
    (data: Record<string, unknown>, path: string): unknown => {
      const keys = path.split(".");
      let current = data;
      for (const key of keys) {
        if (current && typeof current === "object") {
          // Handle array indices in path (e.g., "projects[1]")
          if (key.includes("[") && key.includes("]")) {
            const arrayKey = key.substring(0, key.indexOf("["));
            const index = parseInt(
              key.substring(key.indexOf("[") + 1, key.indexOf("]"))
            );

            if (arrayKey in current && Array.isArray(current[arrayKey])) {
              const array = current[arrayKey] as unknown[];
              if (array[index]) {
                current = array[index] as Record<string, unknown>;
              } else {
                return undefined;
              }
            } else {
              return undefined;
            }
          } else if (key in current) {
            current = current[key] as Record<string, unknown>;
          } else {
            return undefined;
          }
        } else {
          return undefined;
        }
      }
      return current;
    },
    []
  );

  const updateField = useCallback(
    (path: string, value: string | string[] | object) => {
      console.log("Updating field:", path, "with value:", value);
      setFormData((prev) => {
        const newData = { ...prev };
        const keys = path.split(".");
        let current = newData;

        // Handle array indices in path (e.g., "projects[0].name")
        for (let i = 0; i < keys.length - 1; i++) {
          const key = keys[i];

          // Check if this key contains array index
          if (key.includes("[") && key.includes("]")) {
            const arrayKey = key.substring(0, key.indexOf("["));
            const index = parseInt(
              key.substring(key.indexOf("[") + 1, key.indexOf("]"))
            );

            if (!(current as any)[arrayKey]) {
              (current as any)[arrayKey] = [];
            } else {
              // Deep clone array
              (current as any)[arrayKey] = [
                ...((current as any)[arrayKey] as unknown[]),
              ];
            }

            const array = (current as any)[arrayKey] as unknown[];
            if (!array[index]) {
              array[index] = {};
            } else {
              // Deep clone array item
              array[index] = { ...(array[index] as Record<string, unknown>) };
            }

            current = array[index] as any;
          } else {
            // Regular object key
            if (!(current as any)[key]) {
              (current as any)[key] = {};
            } else {
              // Deep clone nested objects
              (current as any)[key] = { ...(current as any)[key] };
            }
            current = (current as any)[key] as any;
          }
        }

        const lastKey = keys[keys.length - 1];
        if (lastKey.includes("[") && lastKey.includes("]")) {
          const arrayKey = lastKey.substring(0, lastKey.indexOf("["));
          const index = parseInt(
            lastKey.substring(lastKey.indexOf("[") + 1, lastKey.indexOf("]"))
          );
          const array = (current as any)[arrayKey] as unknown[];
          array[index] = value;
        } else {
          (current as any)[lastKey] = value;
        }

        console.log("Updated formData:", newData);
        console.log("FormData keys:", Object.keys(newData));
        setForceUpdate((prev) => prev + 1);
        return newData;
      });
    },
    []
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
                      } else if (typeof value === "object" && value !== null) {
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
                          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
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
                      <button
                        type="button"
                        onClick={() => {
                          console.log(
                            "Deleting array item:",
                            index,
                            "from path:",
                            path
                          );
                          const newArray = [
                            ...(Array.isArray(value) ? value : []),
                          ];
                          newArray.splice(index, 1);
                          console.log("New array:", newArray);
                          updateField(path, newArray);
                          setForceUpdate((prev) => prev + 1);
                        }}
                        className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
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
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Xóa trường "${fieldLabel}"?`)) {
                    // Handle array field deletion (e.g., "projects[1].description")
                    if (path.includes("[") && path.includes("]")) {
                      const pathParts = path.split(".");
                      const arrayPath = pathParts[0]; // e.g., "projects[1]"
                      const fieldName = pathParts[pathParts.length - 1]; // e.g., "description"

                      setFormData((prev) => {
                        const newData = { ...prev };
                        const arrayKey = arrayPath.substring(
                          0,
                          arrayPath.indexOf("[")
                        );
                        const index = parseInt(
                          arrayPath.substring(
                            arrayPath.indexOf("[") + 1,
                            arrayPath.indexOf("]")
                          )
                        );
                        const array = [
                          ...((newData as any)[arrayKey] as unknown[]),
                        ];
                        if (array[index]) {
                          const newItem = {
                            ...(array[index] as Record<string, unknown>),
                          };
                          delete newItem[fieldName];
                          array[index] = newItem;
                          (newData as any)[arrayKey] = array;
                        }
                        setForceUpdate((prev) => prev + 1);
                        return newData;
                      });
                    } else {
                      // Handle regular field deletion
                      const pathParts = path.split(".");
                      if (pathParts.length > 1) {
                        const parentPath = pathParts.slice(0, -1).join(".");
                        const fieldName = pathParts[pathParts.length - 1];
                        const parentData = getNestedValue(
                          formData as any,
                          parentPath
                        ) as Record<string, unknown>;
                        if (parentData) {
                          const newParentData = { ...parentData };
                          delete newParentData[fieldName];
                          updateField(parentPath, newParentData);
                        }
                      } else {
                        // Root field deletion
                        setFormData((prev) => {
                          const newData = { ...prev };
                          delete (newData as any)[path];
                          setForceUpdate((prev) => prev + 1);
                          return newData;
                        });
                      }
                    }
                  }
                }}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
                title="Xóa trường">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <textarea
              value={String(value ?? "")}
              onChange={(e) => updateField(path, e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400 resize-none"
              placeholder={`Nhập ${fieldLabel.toLowerCase()}...`}
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
            <button
              type="button"
              onClick={() => {
                if (confirm(`Xóa trường "${fieldLabel}"?`)) {
                  console.log("Deleting field:", fieldLabel, "Path:", path);

                  // Handle array field deletion (e.g., "projects[1].duration")
                  if (path.includes("[") && path.includes("]")) {
                    const pathParts = path.split(".");
                    const arrayPath = pathParts[0]; // e.g., "projects[1]"
                    const fieldName = pathParts[pathParts.length - 1]; // e.g., "duration"

                    console.log(
                      "Array path:",
                      arrayPath,
                      "Field name:",
                      fieldName
                    );

                    // Get the array item
                    const arrayKey = arrayPath.substring(
                      0,
                      arrayPath.indexOf("[")
                    );
                    const index = parseInt(
                      arrayPath.substring(
                        arrayPath.indexOf("[") + 1,
                        arrayPath.indexOf("]")
                      )
                    );

                    setFormData((prev) => {
                      const newData = { ...prev };
                      const array = [
                        ...((newData as any)[arrayKey] as unknown[]),
                      ];
                      if (array[index]) {
                        const newItem = {
                          ...(array[index] as Record<string, unknown>),
                        };
                        delete newItem[fieldName];
                        array[index] = newItem;
                        (newData as any)[arrayKey] = array;
                      }
                      console.log("Updated array item:", newData);
                      setForceUpdate((prev) => prev + 1);
                      return newData;
                    });
                  } else {
                    // Handle regular field deletion
                    const pathParts = path.split(".");
                    if (pathParts.length > 1) {
                      const parentPath = pathParts.slice(0, -1).join(".");
                      const fieldName = pathParts[pathParts.length - 1];
                      const parentData = getNestedValue(
                        formData as any,
                        parentPath
                      ) as Record<string, unknown>;
                      if (parentData) {
                        const newParentData = { ...parentData };
                        delete newParentData[fieldName];
                        updateField(parentPath, newParentData);
                        setForceUpdate((prev) => prev + 1);
                      }
                    } else {
                      // Root field deletion
                      setFormData((prev) => {
                        const newData = { ...prev };
                        delete (newData as any)[path];
                        setForceUpdate((prev) => prev + 1);
                        return newData;
                      });
                    }
                  }
                }
              }}
              className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-all"
              title="Xóa trường">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
          <input
            type={fieldType}
            value={String(value ?? "")}
            onChange={(e) => updateField(path, e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all hover:border-gray-400"
            placeholder={`Nhập ${fieldLabel.toLowerCase()}...`}
          />
        </div>
      );
    },
    [getFieldType, updateField, formData, getNestedValue]
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
        <div key={key} className="bg-gray-50 p-4 rounded-lg">
          <h4 className="text-base font-medium text-gray-900 mb-4 flex items-center">
            <User className="h-4 w-4 mr-2" />
            {sectionTitle}
          </h4>

          {isArray ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">
                  {sectionTitle} ({value?.length || 0} items)
                </span>
                <div className="flex items-center gap-2">
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
                    Thêm {sectionTitle.slice(0, -1)}
                  </button>
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
                              className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                          <div className="text-xs text-blue-700">
                            💡 Gợi ý: Tên trường sẽ được tạo với giá trị phù hợp
                            dựa trên tên bạn nhập
                            {(value as unknown[])?.length > 0 && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                                <strong>Lưu ý:</strong> Item mới sẽ tự động có
                                cùng cấu trúc với item đầu tiên trong danh sách
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
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
                        <button
                          type="button"
                          onClick={() => {
                            const newData = {
                              ...(value as Record<string, unknown>),
                            };
                            delete newData[fieldKey];
                            updateField(path, newData);
                          }}
                          className="opacity-0 group-hover:opacity-100 text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-all">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )
                )}
              </div>
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
                      className="flex-1 px-3 py-2 border border-blue-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  <div className="text-xs text-blue-700">
                    💡 Gợi ý:
                    <br />• <strong>Đơn giản:</strong> website, github,
                    linkedin, phone, email, summary
                    <br />• <strong>Danh sách:</strong> education, experience,
                    projects, certifications
                    <br />• <strong>Kỹ năng:</strong> skills, languages (tạo cấu
                    trúc technical/soft/languages)
                    <br />• <strong>Liên hệ:</strong> contact, social (tạo
                    object với nhiều trường)
                  </div>
                  <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                    <strong>Lưu ý:</strong> Trường mới sẽ được tạo với giá trị
                    rỗng. Bạn có thể chỉnh sửa giá trị sau khi thêm.
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div>{renderField(key, value, path, sectionTitle)}</div>
          )}
        </div>
      );
    },
    [getFieldType, updateField, getDefaultValueForField, renderField]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200">
        {/* Header */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa CV</h3>
              <p className="text-sm text-gray-600">{cv.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)] bg-gray-50/30">
          <div className="space-y-8">
            {Object.entries(formData)
              .filter(
                ([, value]) =>
                  value !== undefined && value !== null && value !== ""
              )
              .map(([key, value]) => renderSection(key, value, key))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-500">
            💡 Tip: Hover vào các trường để xem thêm tùy chọn
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Hủy
            </Button>
            <Button onClick={handleSave} loading={isSaving} className="px-6">
              <Save className="h-4 w-4 mr-2" />
              Lưu thay đổi
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
