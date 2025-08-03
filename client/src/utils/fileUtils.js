// Convert a file object (e.g., image) to a Base64-encoded string using FileReader
export const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        // Resolve with the result when reading is complete
        reader.onloadend = () => resolve(reader.result);

        // Reject the promise if an error occurs
        reader.onerror = reject;

        // Start reading the file as a Data URL (Base64 string)
        reader.readAsDataURL(file);
    });
};
