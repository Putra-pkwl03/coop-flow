import React from "react";
import { HiXMark } from "react-icons/hi2";
import {
  FieldAdmin,
  CreateFieldAdminPayload,
  UpdateFieldAdminPayload,
} from "../../../../types/fieldAdmin";
import FieldAdminForm from "./FieldAdminForm";

interface FieldAdminModalProps {
  admin: FieldAdmin | null;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: CreateFieldAdminPayload | UpdateFieldAdminPayload) => void;
}

export default function FieldAdminModal({
  admin,
  saving,
  onClose,
  onSave,
}: FieldAdminModalProps) {
  const isEdit = !!admin;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            {isEdit ? "Edit Admin Lapangan" : "Tambah Admin Lapangan"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <HiXMark className="text-xl" />
          </button>
        </div>

        <FieldAdminForm
          admin={admin}
          saving={saving}
          onClose={onClose}
          onSave={onSave}
        />
      </div>
    </div>
  );
}
