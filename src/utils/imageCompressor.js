/**
 * High-performance client-side image compression utility using HTML5 Canvas.
 * Compresses large user images (e.g. 5MB-15MB phone photos) down to ~100KB-250KB
 * before uploading to Cloudinary, ensuring instant uploads and avoiding Vercel payload limits.
 *
 * @param {File|Blob} file - Original file from <input type="file">
 * @param {object} options
 * @param {number} options.maxWidth - Max width in pixels (default: 1280)
 * @param {number} options.maxHeight - Max height in pixels (default: 1280)
 * @param {number} options.quality - Compression quality 0.0 to 1.0 (default: 0.82)
 * @param {string} options.outputType - MIME type for compressed output (default: 'image/webp')
 * @returns {Promise<string>} Base64 data URL of compressed image
 */
export const compressImage = (file, options = {}) => {
  const {
    maxWidth = 1280,
    maxHeight = 1280,
    quality = 0.82,
    outputType = 'image/webp',
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided for compression'));
    }

    // Pass SVGs directly without rasterizing
    if (file.type && file.type.includes('svg')) {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Maintain aspect ratio while bounding within maxWidth/maxHeight
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(e.target.result); // Fallback to raw data url if canvas unavailable
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        let compressedDataUrl = canvas.toDataURL(outputType, quality);

        // Fallback to JPEG if browser doesn't support WebP canvas export
        if (!compressedDataUrl.startsWith('data:image/webp')) {
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(compressedDataUrl);
      };
      img.onerror = () => resolve(e.target.result); // Graceful fallback
      img.src = e.target.result;
    };
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
};

export default compressImage;
