import { useState, useEffect } from 'react';
import { useStripe, useElements, PaymentElement } from '@stripe/react-stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { apiRequest } from '@/lib/queryClient';
import { Loader2 } from 'lucide-react';

// Make sure to call loadStripe outside of a component's render to avoid
// recreating the Stripe object on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CheckoutFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

const CheckoutForm = ({ amount, onSuccess, onError }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js hasn't yet loaded.
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (error) {
        toast({
          title: 'Payment Failed',
          description: error.message || 'An error occurred while processing your payment.',
          variant: 'destructive',
        });
        
        if (onError) {
          onError(error);
        }
      } else {
        toast({
          title: 'Payment Successful',
          description: 'Thank you for your purchase!',
        });
        
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error: any) {
      toast({
        title: 'Payment Failed',
        description: error.message || 'An error occurred while processing your payment.',
        variant: 'destructive',
      });
      
      if (onError) {
        onError(error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement className="mb-6" />
      
      <Button 
        type="submit" 
        disabled={!stripe || isLoading}
        className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white hover:shadow-md transition-all"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${(amount / 100).toFixed(2)}`
        )}
      </Button>
    </form>
  );
};

interface PaymentFormProps {
  amount: number;
  onSuccess?: () => void;
  onError?: (error: any) => void;
}

export const PaymentForm = ({ amount, onSuccess, onError }: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    // Create a PaymentIntent as soon as the page loads
    const fetchPaymentIntent = async () => {
      try {
        const response = await apiRequest('/api/create-payment-intent', {
          method: 'POST',
          body: JSON.stringify({ amount })
        });
        
        if (response && response.clientSecret) {
          setClientSecret(response.clientSecret);
        } else {
          toast({
            title: 'Error',
            description: 'Failed to initialize payment. Please try again.',
            variant: 'destructive',
          });
        }
      } catch (error: any) {
        toast({
          title: 'Error',
          description: error.message || 'Failed to initialize payment. Please try again.',
          variant: 'destructive',
        });
      }
    };

    fetchPaymentIntent();
  }, [amount, toast]);

  return (
    <div className="w-full max-w-md mx-auto">
      {clientSecret ? (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <div className="p-6 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Payment Information</h3>
            <CheckoutForm amount={amount} onSuccess={onSuccess} onError={onError} />
          </div>
        </Elements>
      ) : (
        <div className="p-6 bg-white rounded-lg shadow-md flex items-center justify-center h-60">
          <div className="flex flex-col items-center">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mb-4" />
            <p className="text-blue-700">Initializing payment...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentForm;