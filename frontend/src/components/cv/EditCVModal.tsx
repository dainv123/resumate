"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Eye } from "lucide-react";
import { CV } from "@/lib/cv";
import { CVData } from "@/types/cv.types";
import Button from "@/components/ui/Button";
import DynamicFormEditor from "./DynamicFormEditor";

interface EditCVModalProps {
  cv: CV;
  isOpen: boolean;
  onClose: () => void;
  onSave: (cvId: string, updatedData: CVData) => Promise<void>;
  onPreview?: (cvId: string, data: CVData) => void;
}

export default function EditCVModal({
  cv,
  isOpen,
  onClose,
  onSave,
  onPreview,
}: EditCVModalProps) {
  const [formData, setFormData] = useState<CVData>(cv.parsedData);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(cv.parsedData);
    }
  }, [isOpen, cv.parsedData]);

  const handleUpdate = (path: string, value: string | string[] | object) => {
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

      return newData;
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(cv.id, formData);
      onClose();
    } catch (error) {
      console.error("Failed to save CV:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview(cv.id, formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-7xl w-full max-h-[95vh] overflow-hidden border border-gray-200 flex flex-col">
        {/* Sticky Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa CV</h3>
              <p className="text-sm text-gray-600">
                {(cv as any)?.name || cv.originalFileName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30">
          <div className="p-6">
            <DynamicFormEditor
              formData={formData}
              onUpdate={handleUpdate}
              isEditing={true}
            />
          </div>
        </div>

        {/* Sticky Footer */}
        <div className="sticky bottom-0 z-10 flex items-center justify-between p-6 bg-white border-t border-gray-200">
          <div className="text-sm text-gray-500">
            💡 Tip: Hover vào các trường để xem thêm tùy chọn
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={onClose} className="px-6">
              Hủy
            </Button>
            {onPreview && (
              <Button
                variant="outline"
                onClick={handlePreview}
                className="px-6">
                <Eye className="h-4 w-4 mr-2" />
                Xem trước
              </Button>
            )}
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
