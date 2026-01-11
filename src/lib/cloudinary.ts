/**
 * Cloudinary Upload Service
 * 
 * This module handles image uploads to Cloudinary and returns the secure URLs
 * to be stored in Firebase.
 */

const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
}

/**
 * Upload an image file to Cloudinary
 * @param file - The image file to upload
 * @param folder - Optional folder path in Cloudinary (e.g., 'instructors/profiles')
 * @returns The Cloudinary upload result with secure URL
 */
export async function uploadToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append("folder", folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Upload a base64 encoded image to Cloudinary
 * @param base64String - The base64 encoded image string
 * @param folder - Optional folder path in Cloudinary
 * @returns The Cloudinary upload result with secure URL
 */
export async function uploadBase64ToCloudinary(
  base64String: string,
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing. Please set NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET environment variables.");
  }

  const formData = new FormData();
  formData.append("file", base64String);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  
  if (folder) {
    formData.append("folder", folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload to Cloudinary");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw error;
  }
}

/**
 * Upload a video file to Cloudinary
 * @param file - The video file to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns The Cloudinary upload result with secure URL
 */
export async function uploadVideoToCloudinary(
  file: File,
  folder?: string
): Promise<CloudinaryUploadResult> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary configuration is missing.");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("resource_type", "video");
  
  if (folder) {
    formData.append("folder", folder);
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to upload video to Cloudinary");
    }

    const data = await response.json();
    return {
      secure_url: data.secure_url,
      public_id: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      resource_type: data.resource_type,
    };
  } catch (error) {
    console.error("Cloudinary video upload error:", error);
    throw error;
  }
}

/**
 * Upload multiple images to Cloudinary
 * @param files - Array of image files to upload
 * @param folder - Optional folder path in Cloudinary
 * @returns Array of Cloudinary URLs
 */
export async function uploadMultipleToCloudinary(
  files: File[],
  folder?: string
): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadToCloudinary(file, folder));
  const results = await Promise.all(uploadPromises);
  return results.map((result) => result.secure_url);
}

/**
 * Check if a string is a Cloudinary URL
 * @param url - The URL to check
 * @returns True if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
  return url.includes("cloudinary.com") || url.includes("res.cloudinary.com");
}

/**
 * Check if a string is a base64 image
 * @param str - The string to check
 * @returns True if it's a base64 image
 */
export function isBase64Image(str: string): boolean {
  return str.startsWith("data:image");
}

/**
 * Get optimized Cloudinary URL with transformations
 * @param url - The original Cloudinary URL
 * @param options - Transformation options
 * @returns Optimized URL
 */
export function getOptimizedCloudinaryUrl(
  url: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: string;
  } = {}
): string {
  if (!isCloudinaryUrl(url)) return url;

  const { width, height, quality = 80, format = "auto" } = options;
  
  // Build transformation string
  const transforms: string[] = [`q_${quality}`, `f_${format}`];
  
  if (width) transforms.push(`w_${width}`);
  if (height) transforms.push(`h_${height}`);
  
  const transformString = transforms.join(",");
  
  // Insert transformation into URL
  return url.replace("/upload/", `/upload/${transformString}/`);
}
