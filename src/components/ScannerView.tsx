import { useState, useRef } from 'react';
import { Camera, X, Upload, Loader2 } from 'lucide-react';
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
  
  const handleImageCapture = async (file: File) => {
    try {
      setIsProcessing(true);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        setCapturedImage(imageData);
        
        // Simulate OCR and product recognition
        // In production, this would call your AI service
        await simulateAIProcessing(imageData);
      };
      reader.readAsDataURL(file);
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast.error('Failed to process image. Please try again.');
      setIsProcessing(false);
    }
  };
  
  const simulateAIProcessing = async (imageData: string) => {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Mock extracted text (in production, this comes from OCR)
    const mockText = `
      Product Label
      MFG: 03/2024
      Best before 18 months
      Ingredients: ...
    `;
    
    setExtractedText(mockText);
    
    // Parse dates from extracted text
    const parsedDates = parseDates(mockText);
    
    if (parsedDates.expiryDate) {
      // Mock product name (in production, this comes from AI product recognition)
      const mockProductName = 'Product Name (AI will identify this)';
      
      const product: Omit<Product, 'id' | 'addedDate'> = {
        name: mockProductName,
        imageUrl: imageData,
        manufacturingDate: parsedDates.manufacturingDate,
        expiryDate: parsedDates.expiryDate,
        category: 'Scanned Product',
        notes: `Extracted text: ${mockText}`,
      };
      
      toast.success('Product scanned successfully!');
      onProductScanned(product);
    } else {
      toast.error('Could not detect expiry date. Please enter manually.');
    }
    
    setIsProcessing(false);
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
        
        <Card className="p-4 bg-accent/50 border-accent">
          <p className="text-sm text-center">
            <strong>Note:</strong> AI scanning will be enabled in production. For now, this is a demo showing the interface and date parsing logic.
          </p>
        </Card>
      </div>
    </div>
  );
}
