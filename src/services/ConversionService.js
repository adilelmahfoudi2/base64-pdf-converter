import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { decode, encode } from 'base-64';

export const ConversionService = {
  base64ToPdf: async (base64String, fileName = 'converted') => {
    try {
      let cleanBase64 = base64String.trim();
      
      if (cleanBase64.includes(',')) {
        cleanBase64 = cleanBase64.split(',')[1];
      }
      
      cleanBase64 = cleanBase64.replace(/\s/g, '');
      
      if (!isValidBase64(cleanBase64)) {
        throw new Error('Invalid Base64 string');
      }
      
      const fileUri = `${FileSystem.documentDirectory}${fileName}.pdf`;
      
      await FileSystem.writeAsStringAsync(fileUri, cleanBase64, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      
      return {
        success: true,
        uri: fileUri,
        fileName: `${fileName}.pdf`,
        size: fileInfo.size,
      };
    } catch (error) {
      console.error('Base64 to PDF conversion error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  pdfToBase64: async (fileUri) => {
    try {
      const base64String = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      const fileName = fileUri.split('/').pop();
      
      return {
        success: true,
        base64: base64String,
        fileName: fileName,
        size: fileInfo.size,
        base64Size: base64String.length,
      };
    } catch (error) {
      console.error('PDF to Base64 conversion error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  shareFile: async (fileUri) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        throw new Error('Sharing is not available on this device');
      }
      
      await Sharing.shareAsync(fileUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF File',
      });
      
      return { success: true };
    } catch (error) {
      console.error('Share error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  saveToDownloads: async (fileUri, fileName) => {
    try {
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
      
      if (!permissions.granted) {
        throw new Error('Storage permission not granted');
      }
      
      const base64Content = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      const newFileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
        'application/pdf'
      );
      
      await FileSystem.writeAsStringAsync(newFileUri, base64Content, {
        encoding: FileSystem.EncodingType.Base64,
      });
      
      return {
        success: true,
        uri: newFileUri,
      };
    } catch (error) {
      console.error('Save to downloads error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  deleteFile: async (fileUri) => {
    try {
      await FileSystem.deleteAsync(fileUri, { idempotent: true });
      return { success: true };
    } catch (error) {
      console.error('Delete file error:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  },

  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};

const isValidBase64 = (str) => {
  if (!str || str.length === 0) return false;
  
  const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
  
  if (!base64Regex.test(str)) return false;
  
  if (str.length % 4 !== 0) return false;
  
  try {
    decode(str.substring(0, 100));
    return true;
  } catch (e) {
    return false;
  }
};

export default ConversionService;
