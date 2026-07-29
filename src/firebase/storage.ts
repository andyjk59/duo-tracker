const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export async function uploadPhoto(file: File, folder: string): Promise<string> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary is not configured yet (.env.local is missing VITE_CLOUDINARY_* values).");
  }
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);
  formData.append("folder", folder);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    throw new Error(`Cloudinary upload failed: ${response.status}`);
  }
  const data = await response.json();
  return data.secure_url as string;
}

// Deleting from Cloudinary requires a signed request (API secret), which can't
// live in client-side code safely. Orphaned images just stay in the free tier's
// storage quota — not a concern at this app's scale.
export async function deletePhoto(_url: string): Promise<void> {}
