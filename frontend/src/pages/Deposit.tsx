import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowDownRight,
  Copy,
  QrCode,
  Wallet,
  IndianRupee,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeposit, useDepositAddress } from '@/hooks/useWallet';
import { copyToClipboard } from '@/utils/helpers';
import { formatINR } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Deposit: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultCurrency = searchParams.get('currency') || 'INR';
  const [currency, setCurrency] = useState(defaultCurrency);
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('upi');

  const deposit = useDeposit();
  const { data: depositAddress } = useDepositAddress(currency === 'USDT' ? 'USDT' : '');

  const handleCopyAddress = async () => {
    if (depositAddress?.address) {
      const success = await copyToClipboard(depositAddress.address);
      if (success) {
        toast.success('Address copied!');
      }
    }
  };

  const handleDeposit = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    try {
      await deposit.mutateAsync({
        amount: parseFloat(amount),
        currency: currency as 'USDT' | 'INR',
        paymentMethod,
      });
      setAmount('');
    } catch {
      // Error handled by mutation
    }
  };

  const paymentMethods = [
    { id: 'upi', name: 'UPI', description: 'Instant deposit via UPI' },
    { id: 'bank', name: 'Bank Transfer', description: 'NEFT/IMPS/RTGS' },
    { id: 'paytm', name: 'Paytm', description: 'Deposit via Paytm Wallet' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Deposit</h1>
        <p className="text-muted-foreground">
          Add funds to your wallet
        </p>
      </div>

      <Tabs value={currency} onValueChange={setCurrency}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="INR">
            <IndianRupee className="mr-2 h-4 w-4" />
            Deposit INR
          </TabsTrigger>
          <TabsTrigger value="USDT">
            <Wallet className="mr-2 h-4 w-4" />
            Deposit USDT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="INR" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit INR</CardTitle>
              <CardDescription>
                Choose your preferred payment method
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Minimum deposit: ₹100
                </p>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="text-sm font-medium mb-2 block">Payment Method</label>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        paymentMethod === method.id
                          ? 'border-primary bg-primary/5'
                          : 'hover:border-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {method.description}
                          </p>
                        </div>
                        {paymentMethod === method.id && (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Deposits are usually processed within 5-30 minutes depending on the payment method.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full"
                size="lg"
                onClick={handleDeposit}
                loading={deposit.isPending}
                disabled={!amount || parseFloat(amount) <= 0}
              >
                <ArrowDownRight className="mr-2 h-4 w-4" />
                Deposit {amount ? formatINR(parseFloat(amount)) : 'INR'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="USDT" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Deposit USDT</CardTitle>
              <CardDescription>
                Send USDT to your wallet address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* QR Code */}
              <div className="flex justify-center">
                <div className="p-4 border rounded-lg">
                  {depositAddress?.qrCode ? (
                    <img
                      src={depositAddress.qrCode}
                      alt="Deposit QR Code"
                      className="w-48 h-48"
                    />
                  ) : (
                    <div className="w-48 h-48 bg-muted flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="text-sm font-medium mb-2 block">Your USDT Address</label>
                <div className="flex gap-2">
                  <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-sm break-all">
                    {depositAddress?.address || 'Loading...'}
                  </div>
                  <Button variant="outline" onClick={handleCopyAddress}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Only send USDT (TRC20) to this address. Sending other tokens may result in permanent loss.
                </AlertDescription>
              </Alert>

              <div className="text-sm text-muted-foreground space-y-1">
                <p>Network: TRC20 (Tron)</p>
                <p>Minimum deposit: 10 USDT</p>
                <p>Confirmations required: 20</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Deposit;
