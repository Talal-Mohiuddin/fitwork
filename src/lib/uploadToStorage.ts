import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

/**
 * Upload a file to Firebase Storage and return the download URL
 * @param file - The file to upload
 * @param path - The storage path (e.g., 'instructors/userId/profile.jpg')
 * @returns The download URL of the uploaded file
 */
export async function uploadFileToStorage(
  file: File,
  path: string
): Promise<string> {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw new Error("Failed to upload file");
  }
}

/**
 * Upload a base64 image to Firebase Storage and return the download URL
 * @param base64String - The base64 encoded image string
 * @param path - The storage path
 * @returns The download URL of the uploaded file
 */
export async function uploadBase64ToStorage(
  base64String: string,
  path: string
): Promise<string> {
  try {
    // Convert base64 to blob
    const response = await fetch(base64String);
    const blob = await response.blob();
    
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, blob);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading base64:", error);
    throw new Error("Failed to upload image");
  }
}

/**
 * Upload multiple images and return their URLs
 * @param files - Array of files to upload
 * @param basePath - Base storage path (e.g., 'instructors/userId')
 * @returns Array of download URLs
 */
export async function uploadMultipleFiles(
  files: File[],
  basePath: string
): Promise<string[]> {
  const uploadPromises = files.map((file, index) => {
    const fileName = `${Date.now()}_${index}_${file.name}`;
    const path = `${basePath}/${fileName}`;
    return uploadFileToStorage(file, path);
  });

  return Promise.all(uploadPromises);
}
