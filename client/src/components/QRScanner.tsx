import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Camera, QrCode, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/useAuth';

interface QRScannerProps {
  onSuccess?: (tableId: number, restaurantId: number) => void;
  onClose: () => void;
}

const QRScanner = ({ onSuccess, onClose }: QRScannerProps) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [scanResult, setScanResult] = useState<{
    tableId: number;
    restaurantId: number;
    tableName: string;
    restaurantName: string;
  } | null>(null);
  
  // Mock function to simulate QR code scanning
  // In a real implementation, you would use a library like 'react-qr-reader'
  const startScanning = async () => {
    setScanning(true);
    
    try {
      // Check if the browser supports camera access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setCameraPermission(false);
        toast({
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
          variant: 'destructive',
        });
        setScanning(false);
        return;
      }
      
      // Request camera permission
      await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraPermission(true);
      
      // Simulate scanning a QR code after a short delay
      setTimeout(() => {
        simulateScan();
      }, 2000);
      
    } catch (error) {
      setCameraPermission(false);
      toast({
        title: 'Camera Permission Denied',
        description: 'Please allow camera access to scan QR codes.',
        variant: 'destructive',
      });
      setScanning(false);
    }
  };
  
  const simulateScan = async () => {
    // In a real app, this data would come from the QR code scanning library
    const mockQRData = JSON.stringify({
      tableId: 1,
      restaurantId: 1,
    });
    
    try {
      handleScanResult(mockQRData);
    } catch (error) {
      toast({
        title: 'Invalid QR Code',
        description: 'The scanned QR code is not a valid table code.',
        variant: 'destructive',
      });
    } finally {
      setScanning(false);
    }
  };
  
  const handleScanResult = async (data: string) => {
    try {
      const parsedData = JSON.parse(data);
      
      if (!parsedData.tableId || !parsedData.restaurantId) {
        throw new Error('Invalid QR code format');
      }
      
      // Fetch table and restaurant details
      const tableData = await apiRequest(`/api/tables/${parsedData.tableId}`);
      const restaurantData = await apiRequest(`/api/restaurants/${parsedData.restaurantId}`);
      
      setScanResult({
        tableId: parsedData.tableId,
        restaurantId: parsedData.restaurantId,
        tableName: tableData.name || `Table ${tableData.tableNumber}`,
        restaurantName: restaurantData.name,
      });
      
    } catch (error) {
      console.error('Error handling scan result:', error);
      toast({
        title: 'Error',
        description: 'Failed to process QR code. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  const confirmTableBooking = async () => {
    if (!scanResult || !user) return;
    
    try {
      const reservation = await apiRequest('/api/reservations', {
        method: 'POST',
        body: JSON.stringify({
          userId: user.id,
          restaurantId: scanResult.restaurantId,
          tableId: scanResult.tableId,
          date: new Date().toISOString(),
          status: 'confirmed',
          partySize: 2, // Default party size
        }),
      });
      
      toast({
        title: 'Table Reserved',
        description: `You've successfully reserved ${scanResult.tableName} at ${scanResult.restaurantName}.`,
      });
      
      if (onSuccess) {
        onSuccess(scanResult.tableId, scanResult.restaurantId);
      }
      
      onClose();
    } catch (error) {
      toast({
        title: 'Reservation Failed',
        description: 'Unable to reserve the table. Please try again.',
        variant: 'destructive',
      });
    }
  };
  
  // Clean up function to stop camera stream
  useEffect(() => {
    return () => {
      if (cameraPermission) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then((stream) => {
            stream.getTracks().forEach((track) => {
              track.stop();
            });
          })
          .catch(() => {
            // Ignore errors
          });
      }
    };
  }, [cameraPermission]);
  
  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-blue-800">
            {scanResult ? 'Confirm Reservation' : 'Scan Table QR Code'}
          </DialogTitle>
          <DialogDescription className="text-center">
            {scanResult 
              ? `Reserve ${scanResult.tableName} at ${scanResult.restaurantName}` 
              : 'Point your camera at a Crave table QR code to make a reservation'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex flex-col items-center justify-center p-4">
          {!scanResult ? (
            <>
              {scanning ? (
                <div className="relative w-full max-w-xs aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                  <div className="absolute inset-0 flex items-center justify-center">
                    {cameraPermission === false ? (
                      <div className="text-center p-4">
                        <X className="mx-auto h-12 w-12 text-red-500 mb-2" />
                        <p className="text-red-500 font-medium">Camera access denied</p>
                        <p className="text-sm text-gray-500 mt-1">Please enable camera access in your browser settings</p>
                      </div>
                    ) : (
                      <>
                        <div className="absolute z-10 w-48 h-48 border-2 border-blue-500 rounded-lg animate-pulse"></div>
                        <div className="text-center">
                          <p className="text-blue-700 animate-pulse">Scanning...</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-blue-50 p-8 rounded-lg mb-6 text-center">
                  <QrCode className="h-16 w-16 text-blue-700 mx-auto mb-3" />
                  <p className="text-blue-800 mb-1 font-medium">Ready to scan table code</p>
                  <p className="text-sm text-blue-600">Camera access is required</p>
                </div>
              )}
              
              {!scanning && (
                <Button 
                  onClick={startScanning}
                  className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Start Scanning
                </Button>
              )}
            </>
          ) : (
            <div className="bg-blue-50 p-6 rounded-lg w-full mb-4">
              <div className="text-center mb-4">
                <div className="w-16 h-16 rounded-full bg-blue-100 mx-auto flex items-center justify-center mb-3">
                  <QrCode className="h-8 w-8 text-blue-700" />
                </div>
                <h3 className="text-lg font-semibold text-blue-900">{scanResult.tableName}</h3>
                <p className="text-blue-700">{scanResult.restaurantName}</p>
              </div>
              
              <div className="bg-white p-3 rounded border border-blue-200 mb-4">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-500">Date</span>
                  <span className="text-sm font-medium">{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Time</span>
                  <span className="text-sm font-medium">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose} className="mb-2 sm:mb-0">
            Cancel
          </Button>
          
          {scanResult && (
            <Button 
              onClick={confirmTableBooking}
              className="bg-gradient-to-r from-blue-600 to-blue-800 text-white"
            >
              Confirm Reservation
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default QRScanner;