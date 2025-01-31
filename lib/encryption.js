
export function encodePasswordToBase64(password) {
    try {
      const encDataByte = new TextEncoder().encode(password);
      const encodedData = btoa(String.fromCharCode(...encDataByte));
      return encodedData;
    } catch (ex) {
      throw new Error("Error in base64Encode: " + ex.message);
    }
}