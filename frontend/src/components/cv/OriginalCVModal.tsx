"use client";

import React from "react";
import { FileText, User } from "lucide-react";
import { CV } from "@/lib/cv";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface OriginalCVModalProps {
  originalCv: CV;
  isOpen: boolean;
  onClose: () => void;
}

export default function OriginalCVModal({
  originalCv,
  isOpen,
  onClose,
}: OriginalCVModalProps) {
  if (!isOpen || !originalCv) return null;

  const { parsedData } = originalCv;

  // Dynamic field type detection
  const getFieldType = (value: unknown): string => {
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
  };

  // Dynamic field renderer for display
  const renderField = (key: string, value: unknown, label?: string) => {
    const fieldType = getFieldType(value);
    const fieldLabel =
      label ||
      key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1");

    if (fieldType === "array") {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fieldLabel}
          </label>
          <div className="space-y-2">
            {((value as unknown[]) || []).map(
              (item: unknown, index: number) => {
                if (item === undefined || item === null || item === "") {
                  return null;
                }
                return (
                  <div key={index} className="flex items-center space-x-2">
                    {typeof item === "string" ? (
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
                        {item}
                      </div>
                    ) : (
                      <div className="flex-1">
                        {renderField(`${key}[${index}]`, item)}
                      </div>
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
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <h5 className="text-sm font-medium text-gray-900">{fieldLabel}</h5>
          {Object.entries(value || {})
            .filter(
              ([, subValue]) => subValue !== undefined && subValue !== null
            )
            .map(([subKey, subValue]) => (
              <div key={subKey} className="relative">
                <h6 className="text-xs font-medium text-gray-600 capitalize mb-1">
                  {subKey}
                </h6>
                {renderField(subKey, subValue)}
              </div>
            ))}
        </div>
      );
    }

    if (fieldType === "textarea") {
      return (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            {fieldLabel}
          </label>
          <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 whitespace-pre-wrap">
            {String(value ?? "")}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          {fieldLabel}
        </label>
        <div className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700">
          {String(value ?? "")}
        </div>
      </div>
    );
  };

  // Dynamic section renderer
  const renderSection = (key: string, value: unknown, title?: string) => {
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
            </div>
            <div className="space-y-4">
              {(value as unknown[])?.map((item: unknown, index: number) => {
                const itemObj = (item as Record<string, unknown>) || {};
                const hasFields = Object.keys(itemObj).length > 0;

                return (
                  <div
                    key={index}
                    className="border border-gray-200 rounded-lg p-4 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="text-sm font-medium text-gray-900">
                        {sectionTitle} {index + 1}
                      </h5>
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
                                fieldKey.charAt(0).toUpperCase() +
                                  fieldKey.slice(1).replace(/([A-Z])/g, " $1")
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="text-center text-gray-500">
                          <p className="text-sm">No fields available</p>
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
                    className={
                      getFieldType(fieldValue) === "textarea"
                        ? "md:col-span-2"
                        : ""
                    }>
                    {renderField(
                      fieldKey,
                      fieldValue,
                      fieldKey.charAt(0).toUpperCase() +
                        fieldKey.slice(1).replace(/([A-Z])/g, " $1")
                    )}
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          <div>{renderField(key, value, sectionTitle)}</div>
        )}
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="2xl"
      headerClassName="bg-gradient-to-r from-blue-50 to-indigo-50"
      bodyClassName="bg-gray-50/30"
      footer={
        <Button onClick={onClose} variant="outline">
          Close
        </Button>
      }>
      {/* Custom Header Content */}
      <div className="flex items-center gap-3 -mt-6 mb-6">
        <div className="p-2 bg-blue-100 rounded-lg">
          <FileText className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">Original CV</h3>
          <p className="text-sm text-gray-600">{originalCv.originalFileName}</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-8">
        {Object.entries(parsedData)
          .filter(
            ([, value]) => value !== undefined && value !== null && value !== ""
          )
          .map(([key, value]) => renderSection(key, value))}
      </div>
    </Modal>
  );
}
