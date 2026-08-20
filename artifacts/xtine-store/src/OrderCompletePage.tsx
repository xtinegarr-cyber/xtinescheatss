import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  ArrowLeft, 
  Download, 
  Package, 
  Grip
} from 'lucide-react';
import { useGetCheckoutConfirmation, getGetCheckoutConfirmationQueryKey } from '@workspace/api-client-react';
import { Seo } from './seo';

type OrderData = {
  paymentStatus: string;
  items: Array<{ name: string; quantity: number }>;
  fulfillmentUrl: string;
};

export default function OrderCompletePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('session_id');
    if (id) {
      setSessionId(id);
    } else {
      setSessionId('');
    }
  }, []);

  const { data, isLoading, isError } = useGetCheckoutConfirmation(
    { session_id: sessionId as string },
    { 
      query: { 
        enabled: !!sessionId,
        queryKey: getGetCheckoutConfirmationQueryKey({ session_id: sessionId as string })
      }
    }
  );

  return (
    <main className="noise min-h-[100dvh] bg-[#09090f] text-white selection:bg-[#6C5CE7] selection:text-white flex flex-col">
      <Seo
        title="Checkout Confirmation | XtineCheats"
        description="View your XtineCheats order confirmation."
        path="/order-complete"
        noIndex
      />
      {/* Header */}
      <header className="relative z-50 border-b border-[#1e1e2e] bg-[#0c0c16]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-[1400px] items-center px-5 lg:px-10">
          <Link href="/" className="group flex items-center gap-3">
            <Grip size={22} className="text-[#a0a0b8] transition-colors group-hover:text-white" />
            <span className="font-display text-[19px] font-extrabold tracking-[-.03em] text-white">Xtine<span className="text-[#6C5CE7]">Cheats</span></span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-5 z-10 py-20">
        <div className="w-full max-w-lg">
          {sessionId === null || isLoading ? (
            <LoadingState />
          ) : isError || !sessionId ? (
            <ErrorState />
          ) : (
            <SuccessState data={data as OrderData} />
          )}
        </div>
      </div>
    </main>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#0f0f18] border border-[#1e1e2e] shadow-2xl reveal">
      <Loader2 className="w-12 h-12 text-[#6C5CE7] animate-spin mb-6" />
      <h2 className="text-xl font-bold text-white mb-2" data-testid="status-loading-title">Verifying Payment</h2>
      <p className="text-[#a0a0b8] text-[14px]">Please wait while we confirm your transaction securely.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl bg-[#0f0f18] border border-[#1e1e2e] shadow-2xl reveal">
      <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-6 border border-red-500/20">
        <XCircle className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-2" data-testid="status-error-title">Verification Failed</h2>
      <p className="text-[#a0a0b8] text-[14px] mb-8">We could not verify this order. The session might be invalid or expired.</p>
      
      <Link href="/" className="flex items-center gap-2 rounded-lg bg-[#1e1e2e] px-6 py-3 text-[14px] font-bold text-white transition-all hover:bg-[#2a2a3a]" data-testid="button-return-home">
        <ArrowLeft className="w-4 h-4" />
        Return to Store
      </Link>
    </div>
  );
}

function SuccessState({ data }: { data: OrderData }) {
  if (!data) return null;
  
  return (
    <div className="flex flex-col rounded-2xl bg-[#0f0f18] border border-[#1e1e2e] shadow-2xl overflow-hidden reveal">
      {/* Success Header */}
      <div className="bg-[#6C5CE7]/10 border-b border-[#6C5CE7]/20 p-8 text-center flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#6C5CE7]/20 flex items-center justify-center mb-4 border border-[#6C5CE7]/30">
          <CheckCircle2 className="w-8 h-8 text-[#8B7CF8]" />
        </div>
        <h2 className="text-2xl font-extrabold text-white tracking-tight mb-2" data-testid="status-success-title">Order Complete</h2>
        <p className="text-[#a0a0b8] text-[14px]">Your payment was successful and your items are ready.</p>
      </div>

      {/* Order Details */}
      <div className="p-8">
        <h3 className="text-[12px] font-bold uppercase tracking-wider text-[#5a5a72] mb-4">Purchased Items</h3>
        <div className="space-y-3 mb-8">
          {data.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl bg-[#13131e] border border-[#1e1e2e] p-4" data-testid={`card-product-${i}`}>
              <div className="flex w-10 h-10 shrink-0 items-center justify-center rounded-lg bg-[#1e1e2e] text-[#a0a0b8]">
                <Package className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-[14px] truncate" data-testid={`text-product-name-${i}`}>{item.name}</p>
                <p className="text-[12px] text-[#5a5a72]">Quantity: {item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Fulfillment Action */}
        <div className="rounded-xl border border-[#1e1e2e] bg-[#13131e] p-6 mb-8 text-center">
          <h3 className="font-bold text-white mb-2">Access Your Purchase</h3>
          <p className="text-[13px] text-[#a0a0b8] mb-6">Click below to access your digital goods or service dashboard.</p>
          
          <a 
            href={data.fulfillmentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-[#6C5CE7] py-3.5 text-[14px] font-bold text-white transition-all hover:bg-[#7B6FF0] hover:shadow-[0_0_20px_rgba(108,92,231,0.3)]"
            data-testid="link-fulfillment"
          >
            <Download className="w-4 h-4" />
            Access Purchase
          </a>
        </div>

        <div className="flex justify-center">
          <Link href="/" className="flex items-center gap-2 text-[14px] font-medium text-[#a0a0b8] hover:text-white transition-colors" data-testid="link-return-home">
            <ArrowLeft className="w-4 h-4" />
            Back to storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
