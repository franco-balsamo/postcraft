import { v2 as cloudinary } from 'cloudinary';
import 'dotenv/config';

const configured =
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET;

if (configured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key:    process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure:     true,
  });
} else {
  console.warn('[cloudinary] Credentials not set — image upload will be unavailable.');
}

export default cloudinary;
export const cloudinaryEnabled = Boolean(configured);
