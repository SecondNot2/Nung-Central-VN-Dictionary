import React, { useState } from "react";
import { analyzeImage } from "../../services/ai/megaLlmService";

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
    <div className="max-w-6xl mx-auto px-4 py-12 bg-nung-sand bg-paper min-h-screen">
      <div className="text-center mb-12 relative">
        <div className="inline-block bg-white border-4 border-black p-8 shadow-brutal transform rotate-1">
          <h1 className="text-5xl font-display font-black text-nung-dark mb-4 uppercase tracking-tighter">
            Trình soi ảnh AI
          </h1>
          <div className="flex flex-col items-center gap-2">
            <span className="bg-nung-red text-white px-3 py-1 border-2 border-black font-black uppercase tracking-widest text-[10px] -rotate-2">
              Tính năng đang thử nghiệm (Beta)
            </span>
            <p className="text-gray-600 font-serif font-bold italic mt-2 underline decoration-nung-blue decoration-2 underline-offset-4">
              Tải lên hình ảnh văn bản, đồ vật hoặc cảnh vật để hiểu ý nghĩa.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Upload Section */}
        <div className="bg-white p-8 border-4 border-black shadow-brutal relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-nung-red/5 -mr-12 -mt-12 rounded-full group-hover:bg-nung-red/10 transition-colors"></div>

          <h3 className="text-xl font-display font-black text-nung-dark mb-6 uppercase tracking-widest border-l-8 border-nung-red pl-4">
            Tải lên hình ảnh
          </h3>

          <div className="mb-8 flex flex-col items-center justify-center border-4 border-dashed border-black h-80 bg-nung-sand/5 hover:bg-nung-sand/10 transition-all relative group/upload">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="Preview"
                className="h-full w-full object-contain p-4 group-hover/upload:scale-105 transition-transform"
              />
            ) : (
              <div className="text-center p-8 space-y-4">
                <div className="w-20 h-20 bg-white border-4 border-black flex items-center justify-center mx-auto shadow-brutal-sm group-hover/upload:-translate-y-2 transition-transform">
                  <i className="fa-solid fa-cloud-arrow-up text-4xl text-nung-red"></i>
                </div>
                <p className="font-black uppercase tracking-widest text-sm">
                  Nhấp vào đây hoặc kéo thả ảnh
                </p>
                <p className="text-xs font-serif font-bold italic text-gray-400">
                  Hỗ trợ JPG, PNG (Tối đa 5MB)
                </p>
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
            className={`w-full py-4 border-4 border-black font-black uppercase tracking-widest transition-all relative overflow-hidden group/btn ${
              !processedImage || loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed shadow-none"
                : "bg-black text-white shadow-brutal hover:translate-x-2 hover:translate-y-2 hover:shadow-none"
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-circle-notch fa-spin mr-3"></i> Đang
                đọc dữ liệu...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <i className="fa-solid fa-wand-magic-sparkles mr-3 text-nung-red"></i>{" "}
                Kích hoạt AI phân tích
              </span>
            )}
          </button>
        </div>

        {/* Result Section */}
        <div className="bg-white p-8 border-4 border-black shadow-brutal flex flex-col relative overflow-hidden">
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-nung-blue/5 -ml-16 -mb-16 rounded-full"></div>

          <h3 className="text-xl font-display font-black text-nung-dark mb-6 uppercase tracking-widest border-l-8 border-nung-blue pl-4">
            Báo cáo từ AI
          </h3>

          <div className="flex-1 overflow-y-auto min-h-[400px] bg-paper border-4 border-black p-6 relative z-10">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full space-y-8 py-12">
                <div className="relative">
                  <div className="w-20 h-20 border-8 border-nung-sand border-t-nung-red rounded-full animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fa-solid fa-brain text-2xl text-nung-dark animate-pulse"></i>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-black uppercase tracking-widest text-lg mb-2">
                    Đang suy nghĩ...
                  </p>
                  <p className="text-sm font-serif font-bold italic text-gray-500">
                    Hệ thống đang đối chiếu dữ liệu hình ảnh với kho từ điển
                  </p>
                </div>
              </div>
            ) : analysis ? (
              <div className="prose prose-nung max-w-none">
                {analysis.split("\n").map((line, i) => (
                  <p
                    key={i}
                    className="mb-4 text-nung-dark font-serif font-bold leading-relaxed last:mb-0"
                  >
                    {line}
                  </p>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-300 space-y-6 opacity-50">
                <div className="w-24 h-24 border-4 border-dashed border-gray-300 flex items-center justify-center rotate-6">
                  <i className="fa-regular fa-image text-5xl"></i>
                </div>
                <p className="italic font-serif font-bold text-center px-12 text-lg">
                  Kết quả phân tích chi tiết sẽ được hiển thị ngay tại đây sau
                  khi bạn tải ảnh lên.
                </p>
              </div>
            )}
          </div>

          <div className="mt-6 flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-widest italic">
            <i className="fa-solid fa-shield-halved"></i>
            Dữ liệu được bảo mật và xóa sau phiên làm việc
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageAnalyzer;
