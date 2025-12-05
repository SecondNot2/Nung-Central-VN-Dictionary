import React, { useState, useCallback } from "react";
import Cropper, { Area, Point } from "react-easy-crop";

interface ImageCropperProps {
  imageSrc: string;
  onCropComplete: (croppedBlob: Blob) => void;
  onCancel: () => void;
}

/**
 * Creates a canvas with the cropped portion of the image
 */
const createCroppedImage = async (
  imageSrc: string,
  pixelCrop: Area
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  // Set canvas size to desired crop size
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas is empty"));
        }
      },
      "image/jpeg",
      0.9
    );
  });
};

const createImage = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
};

const ImageCropper: React.FC<ImageCropperProps> = ({
  imageSrc,
  onCropComplete,
  onCancel,
}) => {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const onCropCompleteCallback = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;

    setIsProcessing(true);
    try {
      const croppedBlob = await createCroppedImage(imageSrc, croppedAreaPixels);
      onCropComplete(croppedBlob);
    } catch (error) {
      console.error("Error cropping image:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="px-6 py-4 border-b border-earth-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-earth-900">Cắt ảnh đại diện</h2>
          <button
            onClick={onCancel}
            className="p-2 text-earth-400 hover:text-earth-600 hover:bg-earth-100 rounded-lg transition-all"
          >
            <i className="fa-solid fa-xmark text-lg" />
          </button>
        </div>

        {/* Cropper Area */}
        <div className="relative h-80 bg-earth-900">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCallback}
          />
        </div>

        {/* Zoom Control */}
        <div className="px-6 py-4 bg-earth-50 border-t border-earth-200">
          <div className="flex items-center gap-4">
            <i className="fa-solid fa-magnifying-glass-minus text-earth-400" />
            <input
              type="range"
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 h-2 bg-earth-200 rounded-lg appearance-none cursor-pointer accent-bamboo-600"
            />
            <i className="fa-solid fa-magnifying-glass-plus text-earth-400" />
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-earth-200 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl font-medium text-earth-700 bg-white border border-earth-300 hover:bg-earth-100 transition-all disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirm}
            disabled={isProcessing}
            className="px-5 py-2.5 rounded-xl font-medium text-white bg-bamboo-600 hover:bg-bamboo-700 transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-circle-notch fa-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="fa-solid fa-check" />
                Xác nhận
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper;
