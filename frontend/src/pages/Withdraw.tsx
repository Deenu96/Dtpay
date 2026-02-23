import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ArrowUpRight,
  Wallet,
  IndianRupee,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletContext } from '@/context/WalletContext';
import { useWithdraw } from '@/hooks/useWallet';
import { formatINR, formatUSDT } from '@/utils/formatters';
import toast from 'react-hot-toast';

const Withdraw: React.FC = () => {
  const [searchParams] = useSearchParams();
  const defaultCurrency = searchParams.get('currency') || 'INR';
  const [currency, setCurrency] = useState(defaultCurrency);
  const [amount, setAmount] = useState('');
  const [address, setAddress] = useState('');
  const [upiId, setUpiId] = useState('');

  const { balance } = useWalletContext();
  const withdraw = useWithdraw();

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (currency === 'USDT' && !address) {
      toast.error('Please enter a USDT address');
      return;
    }

    if (currency === 'INR' && !upiId) {
      toast.error('Please enter a UPI ID');
      return;
    }

    try {
      await withdraw.mutateAsync({
        amount: parseFloat(amount),
        currency: currency as 'USDT' | 'INR',
        address: currency === 'USDT' ? address : undefined,
        upiId: currency === 'INR' ? upiId : undefined,
      });
      setAmount('');
      setAddress('');
      setUpiId('');
    } catch {
      // Error handled by mutation
    }
  };

  const maxAmount = currency === 'USDT' 
    ? balance?.usdt.available || 0 
    : balance?.inr.available || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Withdraw</h1>
        <p className="text-muted-foreground">
          Withdraw funds from your wallet
        </p>
      </div>

      <Tabs value={currency} onValueChange={setCurrency}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="INR">
            <IndianRupee className="mr-2 h-4 w-4" />
            Withdraw INR
          </TabsTrigger>
          <TabsTrigger value="USDT">
            <Wallet className="mr-2 h-4 w-4" />
            Withdraw USDT
          </TabsTrigger>
        </TabsList>

        <TabsContent value="INR" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw INR</CardTitle>
              <CardDescription>
                Withdraw INR to your bank account or UPI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Balance */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">
                  {balance ? formatINR(balance.inr.available) : '₹0'}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (INR)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Minimum: ₹100 | Fee: ₹10
                  </p>
                  <button
                    onClick={() => setAmount(maxAmount.toString())}
                    className="text-xs text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* UPI ID */}
              <div>
                <label className="text-sm font-medium mb-2 block">UPI ID</label>
                <Input
                  type="text"
                  placeholder="yourname@upi"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Withdrawals are processed within 24 hours. Make sure your UPI ID is correct.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full"
                size="lg"
                onClick={handleWithdraw}
                loading={withdraw.isPending}
                disabled={!amount || parseFloat(amount) <= 0 || !upiId}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw {amount ? formatINR(parseFloat(amount)) : 'INR'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="USDT" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Withdraw USDT</CardTitle>
              <CardDescription>
                Withdraw USDT to an external wallet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Available Balance */}
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Available Balance</p>
                <p className="text-2xl font-bold">
                  {balance ? formatUSDT(balance.usdt.available) : '0 USDT'}
                </p>
              </div>

              {/* Amount Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Amount (USDT)</label>
                <Input
                  type="number"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <div className="flex justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    Minimum: 10 USDT | Fee: 1 USDT
                  </p>
                  <button
                    onClick={() => setAmount(maxAmount.toString())}
                    className="text-xs text-primary hover:underline"
                  >
                    Max
                  </button>
                </div>
              </div>

              {/* Address Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">USDT Address (TRC20)</label>
                <Input
                  type="text"
                  placeholder="Enter TRC20 address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Double-check your address. Transactions cannot be reversed once sent.
                </AlertDescription>
              </Alert>

              <Button
                className="w-full"
                size="lg"
                onClick={handleWithdraw}
                loading={withdraw.isPending}
                disabled={!amount || parseFloat(amount) <= 0 || !address}
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                Withdraw {amount ? `${amount} USDT` : 'USDT'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Withdraw;
