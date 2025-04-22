import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { X, ImageIcon } from 'lucide-react';

interface QRCodeScannerProps {
  onClose: () => void;
  onScanComplete: (tableId: string) => void;
}

const QRCodeScanner = ({ onClose, onScanComplete }: QRCodeScannerProps) => {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(true);
  
  // Simulate a QR code scan after a delay
  useEffect(() => {
    if (scanning) {
      const timer = setTimeout(() => {
        // Simulate a successful scan
        setScanning(false);
        onScanComplete('12'); // This would typically be the decoded table ID from the QR code
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [scanning, onScanComplete]);
  
  const handleEnterCodeManually = () => {
    const tableId = prompt('Please enter table code:');
    if (tableId) {
      onScanComplete(tableId);
    }
  };
  
  const handleScanFromGallery = () => {
    toast({
      title: "Gallery access",
      description: "This feature would open your gallery to select a QR code image.",
    });
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* Header */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-white text-lg font-medium">Scan Table QR Code</h2>
        <button className="text-white" onClick={onClose}>
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Scanner Area */}
      <div className="flex-grow flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-sm aspect-square relative mb-8">
          <div className="absolute inset-0 border-2 border-white rounded-lg"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            {/* QR Code Example */}
            <img
              src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://crave.app/table/123"
              alt="Table QR Code"
              className="w-48 h-48 opacity-50"
            />
          </div>
          {/* Scanner Animation */}
          {scanning && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-primary animate-bounce"
              style={{ top: '50%' }}
            ></div>
          )}
        </div>
        <p className="text-white text-center mb-2">Position the QR code within the frame to scan</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">
          When seated at the restaurant, scan the QR code on your table to check-in and place orders
        </p>
      </div>

      {/* Controls */}
      <div className="p-6">
        <button
          className="w-full py-3 bg-white text-primary font-medium rounded-lg mb-3"
          onClick={handleEnterCodeManually}
        >
          Enter Table Code Manually
        </button>
        <button
          className="w-full py-3 text-white flex items-center justify-center"
          onClick={handleScanFromGallery}
        >
          <ImageIcon className="mr-2" size={18} />
          Scan from Gallery
        </button>
      </div>
    </div>
  );
};

export default QRCodeScanner;
