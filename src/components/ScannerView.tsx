import { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2, Smartphone } from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { takePicture, pickFromGallery } from '@/utils/camera';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { parseDates } from '@/utils/dateParser';
import { Product } from '@/types/product';

interface ScannerViewProps {
  onClose: () => void;
  onProductScanned: (product: Omit<Product, 'id' | 'addedDate'>) => void;
}

export function ScannerView({ onClose, onProductScanned }: ScannerViewProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedText, setExtractedText] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleImageCapture = async (file?: File) => {
    try {
      setIsProcessing(true);
      
      let imageData: string | null = null;
      
      if (file) {
        // Handle file upload
        const reader = new FileReader();
        reader.onload = async (e) => {
          imageData = e.target?.result as string;
          setCapturedImage(imageData);
          await simulateAIProcessing(imageData);
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleNativeCamera = async () => {
    try {
      setIsProcessing(true);
      const imageData = await takePicture();
      
      if (imageData) {
        setCapturedImage(imageData);
        await simulateAIProcessing(imageData);
      } else {
        toast.error('Failed to capture image');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error with native camera:', error);
      toast.error('Failed to access camera');
      setIsProcessing(false);
    }
  };

  const handleNativeGallery = async () => {
    try {
      setIsProcessing(true);
      const imageData = await pickFromGallery();
      
      if (imageData) {
        setCapturedImage(imageData);
        await simulateAIProcessing(imageData);
      } else {
        toast.error('Failed to pick image');
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error with gallery:', error);
      toast.error('Failed to access gallery');
      setIsProcessing(false);
    }
  };
  
  const simulateAIProcessing = async (imageData: string) => {
    try {
      // Call the AI scanning edge function
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/scan-product`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ imageBase64: imageData }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to process image');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to extract product information');
      }

      const aiData = result.data;
      
      // Build extracted text display
      const extractedInfo = [
        aiData.productName && `Product: ${aiData.productName}`,
        aiData.manufacturingDate && `MFG: ${aiData.manufacturingDate}`,
        aiData.expiryDate && `EXP: ${aiData.expiryDate}`,
        aiData.bestBeforeDuration && `Best Before: ${aiData.bestBeforeDuration}`,
        aiData.category && `Category: ${aiData.category}`,
      ].filter(Boolean).join('\n');
      
      setExtractedText(extractedInfo || 'No information extracted');
      
      // Parse dates - handle both AI extraction and text parsing
      let manufacturingDate: Date | undefined;
      let expiryDate: Date | undefined;
      
      if (aiData.manufacturingDate) {
        const [month, year] = aiData.manufacturingDate.split('/');
        manufacturingDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }
      
      if (aiData.expiryDate) {
        const [month, year] = aiData.expiryDate.split('/');
        expiryDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      }
      
      // If we have "best before" duration, calculate expiry from manufacturing date
      if (aiData.bestBeforeDuration && manufacturingDate && !expiryDate) {
        const fullText = `MFG: ${aiData.manufacturingDate}\n${aiData.bestBeforeDuration}`;
        const parsedDates = parseDates(fullText);
        if (parsedDates.expiryDate) {
          expiryDate = parsedDates.expiryDate;
        }
      }
      
      if (expiryDate) {
        const product: Omit<Product, 'id' | 'addedDate'> = {
          name: aiData.productName || 'Unknown Product',
          imageUrl: imageData,
          manufacturingDate,
          expiryDate,
          category: aiData.category || 'Scanned Product',
          notes: `AI extracted: ${extractedInfo}`,
        };
        
        toast.success('Product scanned successfully!');
        onProductScanned(product);
      } else {
        toast.error('Could not detect expiry date. Please enter manually.');
      }
    } catch (error) {
      console.error('AI processing error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b">
        <h2 className="text-xl font-semibold">Scan Product</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-5 h-5" />
        </Button>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {!capturedImage ? (
          <Card className="p-8 space-y-6">
            <div className="text-center space-y-2">
              <Camera className="w-16 h-16 mx-auto text-muted-foreground" />
              <h3 className="text-lg font-semibold">Capture Product Label</h3>
              <p className="text-sm text-muted-foreground">
                Take a photo of the product label showing the manufacturing and expiry dates
              </p>
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageCapture(file);
              }}
            />
            
            <div className="space-y-3">
              {Capacitor.isNativePlatform() ? (
                <>
                  <Button
                    className="w-full h-14 text-lg"
                    onClick={handleNativeCamera}
                    disabled={isProcessing}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-14 text-lg"
                    onClick={handleNativeGallery}
                    disabled={isProcessing}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload from Gallery
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full h-14 text-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Open Camera
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="w-full h-14 text-lg"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Upload from Gallery
                  </Button>
                  
                  <div className="flex items-start gap-2 p-3 bg-accent/50 rounded-lg text-sm">
                    <Smartphone className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-muted-foreground">
                      For full camera functionality, install this app on your mobile device using Capacitor
                    </p>
                  </div>
                </>
              )}
            </div>
          </Card>
        ) : (
          <Card className="p-4 space-y-4">
            {isProcessing ? (
              <div className="text-center py-12 space-y-4">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-primary" />
                <div className="space-y-2">
                  <p className="font-medium">Processing image...</p>
                  <p className="text-sm text-muted-foreground">
                    Extracting dates and identifying product
                  </p>
                </div>
              </div>
            ) : (
              <>
                <img
                  src={capturedImage}
                  alt="Captured product"
                  className="w-full rounded-lg"
                />
                
                {extractedText && (
                  <div className="space-y-2">
                    <Label>Extracted Text:</Label>
                    <div className="p-3 bg-muted rounded-lg text-sm whitespace-pre-wrap">
                      {extractedText}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setCapturedImage(null);
                      setExtractedText('');
                    }}
                  >
                    Retake
                  </Button>
                  <Button className="flex-1" onClick={onClose}>
                    Done
                  </Button>
                </div>
              </>
            )}
          </Card>
        )}
        
        <Card className="p-4 bg-success/10 border-success/20">
          <p className="text-sm text-center">
            <strong>✅ AI Scanning Enabled!</strong> Real OCR and product recognition powered by Lovable AI
          </p>
        </Card>
      </div>
    </div>
  );
}
