import { v2 as cloudinary } from "cloudinary";

// configured inside the function so .env is already loaded
export const uploadImage = (buffer) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder: "ticketshows/events" }, (err, result) =>
        err ? reject(err) : resolve(result),
      )
      .end(buffer);
  });
};
