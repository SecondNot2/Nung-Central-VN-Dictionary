/**
 * Image Utility Functions
 * Handles image resizing and optimization for uploads
 */

export interface ResizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1 for JPEG quality
  format?: "image/jpeg" | "image/png" | "image/webp";
}

const DEFAULT_OPTIONS: ResizeOptions = {
  maxWidth: 400,
  maxHeight: 400,
  quality: 0.85,
  format: "image/jpeg",
};

/**
 * Resize and compress an image file
 * @param file - The original image file
 * @param options - Resize options
 * @returns Promise<File> - The resized image as a new File
 */
export async function resizeImage(
  file: File,
  options: ResizeOptions = {}
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    // Create image element to load the file
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read image file"));
    };

    img.onload = () => {
      try {
        // Calculate new dimensions maintaining aspect ratio
        let { width, height } = img;
        const maxW = opts.maxWidth || 400;
        const maxH = opts.maxHeight || 400;

        if (width > maxW || height > maxH) {
          const ratio = Math.min(maxW / width, maxH / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Enable image smoothing for better quality
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Draw the image
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
              return;
            }

            // Create new file from blob
            const extension =
              opts.format === "image/png"
                ? "png"
                : opts.format === "image/webp"
                ? "webp"
                : "jpg";
            const newFileName = file.name.replace(/\.[^/.]+$/, `.${extension}`);

            const resizedFile = new File([blob], newFileName, {
              type: opts.format,
              lastModified: Date.now(),
            });

            console.log(
              `Image resized: ${file.size} bytes → ${
                resizedFile.size
              } bytes (${Math.round((resizedFile.size / file.size) * 100)}%)`
            );

            resolve(resizedFile);
          },
          opts.format,
          opts.quality
        );
      } catch (err) {
        reject(err);
      }
    };

    img.onerror = () => {
      reject(new Error("Failed to load image"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Check if file needs resizing based on size or dimensions
 * @param file - The image file to check
 * @param maxSizeBytes - Maximum file size in bytes (default 500KB)
 */
export function needsResize(
  file: File,
  maxSizeBytes: number = 500 * 1024
): boolean {
  return file.size > maxSizeBytes;
}

/**
 * Process avatar image - resize if needed
 * @param file - Original avatar file
 * @returns Promise<File> - Processed file ready for upload
 */
export async function processAvatarImage(file: File): Promise<File> {
  // If file is small enough, return as-is
  if (file.size <= 200 * 1024) {
    console.log("Avatar is already small enough, no resize needed");
    return file;
  }

  // Resize to avatar dimensions with good compression
  return resizeImage(file, {
    maxWidth: 300,
    maxHeight: 300,
    quality: 0.8,
    format: "image/jpeg",
  });
}
