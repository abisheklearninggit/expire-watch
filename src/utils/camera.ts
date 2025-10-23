import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export async function takePicture(): Promise<string | null> {
  // Check if running on native platform
  if (!Capacitor.isNativePlatform()) {
    console.log('Camera only works on native platforms');
    return null;
  }

  try {
    // Request camera permissions
    const permissions = await Camera.checkPermissions();
    
    if (permissions.camera !== 'granted') {
      const result = await Camera.requestPermissions({ permissions: ['camera'] });
      if (result.camera !== 'granted') {
        throw new Error('Camera permission denied');
      }
    }

    // Take photo
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Camera,
    });

    return image.dataUrl || null;
  } catch (error) {
    console.error('Error taking picture:', error);
    return null;
  }
}

export async function pickFromGallery(): Promise<string | null> {
  if (!Capacitor.isNativePlatform()) {
    console.log('Gallery only works on native platforms');
    return null;
  }

  try {
    // Request photo permissions
    const permissions = await Camera.checkPermissions();
    
    if (permissions.photos !== 'granted') {
      const result = await Camera.requestPermissions({ permissions: ['photos'] });
      if (result.photos !== 'granted') {
        throw new Error('Photos permission denied');
      }
    }

    // Pick photo from gallery
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.DataUrl,
      source: CameraSource.Photos,
    });

    return image.dataUrl || null;
  } catch (error) {
    console.error('Error picking from gallery:', error);
    return null;
  }
}
