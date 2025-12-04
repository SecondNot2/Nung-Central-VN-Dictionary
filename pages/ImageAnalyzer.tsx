import React, { useState } from "react";
import { analyzeImage } from "../services/megaLlmService";

const ImageAnalyzer: React.FC = () => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processedImage, setProcessedImage] = useState<{
    data: string;
    mimeType: string;
  } | null>(null);

  const compressImage = async (
    file: File
  ): Promise<{ data: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;
        const maxDim = 1024;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = (height * maxDim) / width;
            width = maxDim;
          } else {
            width = (width * maxDim) / height;
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const mimeType = "image/jpeg";
          const dataUrl = canvas.toDataURL(mimeType, 0.8); // 80% quality
          const base64 = dataUrl.split(",")[1];
          resolve({ data: base64, mimeType });
        } else {
          reject(new Error("Could not get canvas context"));
        }
      };
      img.onerror = reject;
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setLoading(true); // Show loading while compressing

      try {
        const processed = await compressImage(file);
        setProcessedImage(processed);
      } catch (err) {
        console.error("Compression error", err);
        // Fallback to original if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = (reader.result as string).split(",")[1];
          setProcessedImage({ data: base64, mimeType: file.type });
        };
        reader.readAsDataURL(file);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleAnalyze = async () => {
    if (!processedImage) return;

    setLoading(true);
    try {
      const result = await analyzeImage(
        processedImage.data,
        processedImage.mimeType
      );
      setAnalysis(result);
    } catch (err) {
      console.error(err);
      setAnalysis(
        (err as any).message ||
          "Không thể phân tích hình ảnh. Vui lòng thử lại sau."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-serif font-bold text-earth-900 mb-2">
          Dịch qua Hình ảnh
        </h1>
        <p className="text-earth-700">
          Tải lên hình ảnh văn bản, đồ vật hoặc cảnh vật để hiểu ý nghĩa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-earth-200">
          <div className="mb-6 flex flex-col items-center justify-center border-2 border-dashed border-earth-300 rounded-lg h-64 bg-earth-50 hover:bg-earth-100 transition-colors relative">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain rounded-lg p-2"
              />
            ) : (
              <div className="text-center text-earth-500 p-4">
                <i className="fa-solid fa-cloud-arrow-up text-4xl mb-3"></i>
                <p>Nhấp để tải ảnh lên</p>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={!processedImage || loading}
            className={`w-full py-3 rounded-lg font-bold text-white transition-all ${
              !processedImage || loading
                ? "bg-earth-300 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 shadow-lg active:scale-95"
            }`}
          >
            {loading ? (
              <span>
                <i className="fa-solid fa-spinner fa-spin mr-2"></i> Đang xử
                lý...
              </span>
            ) : (
              <span>
                <i className="fa-solid fa-wand-magic-sparkles mr-2"></i> Phân
                tích hình ảnh
              </span>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white p-6 rounded-xl shadow-md border border-earth-200 flex flex-col">
          <h3 className="text-xl font-bold text-earth-800 mb-4 border-b border-earth-100 pb-2">
            Kết quả phân tích
          </h3>

          <div className="flex-1 overflow-y-auto min-h-[250px] bg-white border border-earth-100 rounded-lg p-4 text-earth-900 leading-relaxed">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full text-earth-400 space-y-4">
                <div className="w-12 h-12 border-4 border-earth-300 border-t-indigo-500 rounded-full animate-spin"></div>
                <p className="text-center font-medium">
                  Đang phân tích chi tiết hình ảnh...
                  <br />
                  <span className="text-sm font-normal">
                    Quá trình này có thể mất vài giây.
                  </span>
                </p>
              </div>
            ) : analysis ? (
              <div className="prose prose-earth text-earth-900">
                {analysis.split("\n").map((line, i) => (
                  <p key={i} className="mb-2">
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-earth-300">
                <i className="fa-regular fa-image text-5xl mb-3"></i>
                <p className="italic text-center">
                  Kết quả phân tích sẽ hiển thị tại đây.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;

