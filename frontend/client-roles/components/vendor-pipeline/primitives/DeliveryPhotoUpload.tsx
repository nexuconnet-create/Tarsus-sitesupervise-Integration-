"use client";

import { useEffect, useCallback } from "react";
import { Plus, X } from "lucide-react";
import toast from "react-hot-toast";

interface DeliveryPhotoUploadProps {
  photos: File[];
  onPhotosChange: (photos: File[]) => void;
  maxPhotos?: number;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024;

export default function DeliveryPhotoUpload({
  photos,
  onPhotosChange,
  maxPhotos = 5,
  disabled = false,
}: DeliveryPhotoUploadProps) {
  const objectUrls = photos.map((file) => URL.createObjectURL(file));

  useEffect(() => {
    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const handleAdd = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      const remaining = maxPhotos - photos.length;
      const valid: File[] = [];

      for (const f of files.slice(0, remaining)) {
        if (!f.type.startsWith("image/")) {
          toast.error(`${f.name} is not an image`);
          continue;
        }
        if (f.size > MAX_FILE_SIZE) {
          toast.error(`${f.name} exceeds 10MB limit`);
          continue;
        }
        valid.push(f);
      }

      if (valid.length > 0) {
        onPhotosChange([...photos, ...valid]);
      }
      e.target.value = "";
    },
    [photos, maxPhotos, onPhotosChange],
  );

  const handleRemove = useCallback(
    (index: number) => {
      onPhotosChange(photos.filter((_, i) => i !== index));
    },
    [photos, onPhotosChange],
  );

  const previewUrl = (file: File) => URL.createObjectURL(file);
  const atMax = photos.length >= maxPhotos;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Delivery Photos ({photos.length}/{maxPhotos})
        </p>
        {!atMax && !disabled && (
          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 cursor-pointer transition-colors">
            <Plus size={14} />
            Add Photo
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleAdd}
              disabled={disabled}
              className="hidden"
            />
          </label>
        )}
      </div>

      {photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((file, i) => (
            <div key={`${file.name}-${i}`} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              <img
                src={previewUrl(file)}
                alt={`Delivery photo ${i + 1}`}
                className="w-full h-full object-cover"
              />
              {!disabled && (
                <button
                  onClick={() => handleRemove(i)}
                  className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent px-1.5 py-1">
                <p className="text-[10px] text-white truncate">{file.name}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
          <p className="text-sm text-gray-400">
            {disabled ? "No photos uploaded" : "Click 'Add Photo' to upload delivery photos"}
          </p>
        </div>
      )}

      <p className="text-[10px] text-gray-400">
        Max {maxPhotos} photos, 10MB each. Accepted: JPEG, PNG, WebP.
      </p>
    </div>
  );
}
