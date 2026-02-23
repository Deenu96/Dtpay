import React, { useState } from 'react';
import { Save, Settings as SettingsIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { adminSettingsService } from '@/services';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const queryClient = useQueryClient();

  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => adminSettingsService.getSettings(),
  });

  const updateSettings = useMutation({
    mutationFn: (data: Parameters<typeof adminSettingsService.updateSettings>[0]) =>
      adminSettingsService.updateSettings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
      toast.success('Settings updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update settings');
    },
  });

  const settings = settingsData?.data;

  const handleSubmit = (section: string, data: Record<string, unknown>) => {
    updateSettings.mutate({ [section]: data } as Parameters<typeof adminSettingsService.updateSettings>[0]);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="page-header">
          <h1 className="page-title">Settings</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-10 bg-muted rounded" />
              <div className="h-10 bg-muted rounded" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="text-muted-foreground">Configure platform settings</p>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="upi">UPI</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SettingsIcon className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              {settings?.general && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit('general', {
                      platformName: formData.get('platformName'),
                      supportEmail: formData.get('supportEmail'),
                      supportPhone: formData.get('supportPhone'),
                      timezone: formData.get('timezone'),
                      defaultCurrency: formData.get('defaultCurrency'),
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="platformName">Platform Name</Label>
                    <Input
                      id="platformName"
                      name="platformName"
                      defaultValue={settings.general.platformName}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportEmail">Support Email</Label>
                    <Input
                      id="supportEmail"
                      name="supportEmail"
                      type="email"
                      defaultValue={settings.general.supportEmail}
                    />
                  </div>
                  <div>
                    <Label htmlFor="supportPhone">Support Phone</Label>
                    <Input
                      id="supportPhone"
                      name="supportPhone"
                      defaultValue={settings.general.supportPhone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input
                      id="timezone"
                      name="timezone"
                      defaultValue={settings.general.timezone}
                    />
                  </div>
                  <div>
                    <Label htmlFor="defaultCurrency">Default Currency</Label>
                    <Input
                      id="defaultCurrency"
                      name="defaultCurrency"
                      defaultValue={settings.general.defaultCurrency}
                    />
                  </div>
                  <Button type="submit" disabled={updateSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trading Settings */}
        <TabsContent value="trading">
          <Card>
            <CardHeader>
              <CardTitle>Trading Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {settings?.trading && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit('trading', {
                      minOrderAmount: Number(formData.get('minOrderAmount')),
                      maxOrderAmount: Number(formData.get('maxOrderAmount')),
                      minTradeAmount: Number(formData.get('minTradeAmount')),
                      maxTradeAmount: Number(formData.get('maxTradeAmount')),
                      orderExpiryHours: Number(formData.get('orderExpiryHours')),
                      tradeExpiryMinutes: Number(formData.get('tradeExpiryMinutes')),
                      autoCancelUnpaidOrders: formData.get('autoCancelUnpaidOrders') === 'on',
                      requireVerifiedForTrading: formData.get('requireVerifiedForTrading') === 'on',
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minOrderAmount">Min Order Amount (USDT)</Label>
                      <Input
                        id="minOrderAmount"
                        name="minOrderAmount"
                        type="number"
                        defaultValue={settings.trading.minOrderAmount}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxOrderAmount">Max Order Amount (USDT)</Label>
                      <Input
                        id="maxOrderAmount"
                        name="maxOrderAmount"
                        type="number"
                        defaultValue={settings.trading.maxOrderAmount}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minTradeAmount">Min Trade Amount (USDT)</Label>
                      <Input
                        id="minTradeAmount"
                        name="minTradeAmount"
                        type="number"
                        defaultValue={settings.trading.minTradeAmount}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxTradeAmount">Max Trade Amount (USDT)</Label>
                      <Input
                        id="maxTradeAmount"
                        name="maxTradeAmount"
                        type="number"
                        defaultValue={settings.trading.maxTradeAmount}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orderExpiryHours">Order Expiry (Hours)</Label>
                      <Input
                        id="orderExpiryHours"
                        name="orderExpiryHours"
                        type="number"
                        defaultValue={settings.trading.orderExpiryHours}
                      />
                    </div>
                    <div>
                      <Label htmlFor="tradeExpiryMinutes">Trade Expiry (Minutes)</Label>
                      <Input
                        id="tradeExpiryMinutes"
                        name="tradeExpiryMinutes"
                        type="number"
                        defaultValue={settings.trading.tradeExpiryMinutes}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="autoCancelUnpaidOrders"
                      name="autoCancelUnpaidOrders"
                      defaultChecked={settings.trading.autoCancelUnpaidOrders}
                    />
                    <Label htmlFor="autoCancelUnpaidOrders">Auto-cancel Unpaid Orders</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="requireVerifiedForTrading"
                      name="requireVerifiedForTrading"
                      defaultChecked={settings.trading.requireVerifiedForTrading}
                    />
                    <Label htmlFor="requireVerifiedForTrading">Require KYC for Trading</Label>
                  </div>
                  <Button type="submit" disabled={updateSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fee Settings */}
        <TabsContent value="fees">
          <Card>
            <CardHeader>
              <CardTitle>Fee Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {settings?.fees && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit('fees', {
                      tradingFeePercentage: Number(formData.get('tradingFeePercentage')),
                      withdrawalFeePercentage: Number(formData.get('withdrawalFeePercentage')),
                      minWithdrawalFee: Number(formData.get('minWithdrawalFee')),
                      maxWithdrawalFee: Number(formData.get('maxWithdrawalFee')),
                      depositFee: Number(formData.get('depositFee')),
                    });
                  }}
                  className="space-y-4"
                >
                  <div>
                    <Label htmlFor="tradingFeePercentage">Trading Fee (%)</Label>
                    <Input
                      id="tradingFeePercentage"
                      name="tradingFeePercentage"
                      type="number"
                      step="0.01"
                      defaultValue={settings.fees.tradingFeePercentage}
                    />
                  </div>
                  <div>
                    <Label htmlFor="withdrawalFeePercentage">Withdrawal Fee (%)</Label>
                    <Input
                      id="withdrawalFeePercentage"
                      name="withdrawalFeePercentage"
                      type="number"
                      step="0.01"
                      defaultValue={settings.fees.withdrawalFeePercentage}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minWithdrawalFee">Min Withdrawal Fee (USDT)</Label>
                      <Input
                        id="minWithdrawalFee"
                        name="minWithdrawalFee"
                        type="number"
                        step="0.01"
                        defaultValue={settings.fees.minWithdrawalFee}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxWithdrawalFee">Max Withdrawal Fee (USDT)</Label>
                      <Input
                        id="maxWithdrawalFee"
                        name="maxWithdrawalFee"
                        type="number"
                        step="0.01"
                        defaultValue={settings.fees.maxWithdrawalFee}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="depositFee">Deposit Fee (USDT)</Label>
                    <Input
                      id="depositFee"
                      name="depositFee"
                      type="number"
                      step="0.01"
                      defaultValue={settings.fees.depositFee}
                    />
                  </div>
                  <Button type="submit" disabled={updateSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* UPI Settings */}
        <TabsContent value="upi">
          <Card>
            <CardHeader>
              <CardTitle>UPI Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {settings?.upi && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit('upi', {
                      enabled: formData.get('enabled') === 'on',
                      upiId: formData.get('upiId'),
                      merchantName: formData.get('merchantName'),
                      autoApproveDeposits: formData.get('autoApproveDeposits') === 'on',
                      minDepositAmount: Number(formData.get('minDepositAmount')),
                      maxDepositAmount: Number(formData.get('maxDepositAmount')),
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      id="enabled"
                      name="enabled"
                      defaultChecked={settings.upi.enabled}
                    />
                    <Label htmlFor="enabled">Enable UPI Payments</Label>
                  </div>
                  <div>
                    <Label htmlFor="upiId">UPI ID</Label>
                    <Input
                      id="upiId"
                      name="upiId"
                      defaultValue={settings.upi.upiId}
                    />
                  </div>
                  <div>
                    <Label htmlFor="merchantName">Merchant Name</Label>
                    <Input
                      id="merchantName"
                      name="merchantName"
                      defaultValue={settings.upi.merchantName}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="autoApproveDeposits"
                      name="autoApproveDeposits"
                      defaultChecked={settings.upi.autoApproveDeposits}
                    />
                    <Label htmlFor="autoApproveDeposits">Auto-approve Deposits</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="minDepositAmount">Min Deposit (USDT)</Label>
                      <Input
                        id="minDepositAmount"
                        name="minDepositAmount"
                        type="number"
                        defaultValue={settings.upi.minDepositAmount}
                      />
                    </div>
                    <div>
                      <Label htmlFor="maxDepositAmount">Max Deposit (USDT)</Label>
                      <Input
                        id="maxDepositAmount"
                        name="maxDepositAmount"
                        type="number"
                        defaultValue={settings.upi.maxDepositAmount}
                      />
                    </div>
                  </div>
                  <Button type="submit" disabled={updateSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
            </CardHeader>
            <CardContent>
              {settings?.notifications && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    handleSubmit('notifications', {
                      emailNotifications: formData.get('emailNotifications') === 'on',
                      smsNotifications: formData.get('smsNotifications') === 'on',
                      pushNotifications: formData.get('pushNotifications') === 'on',
                      notifyOnNewUser: formData.get('notifyOnNewUser') === 'on',
                      notifyOnLargeTrade: formData.get('notifyOnLargeTrade') === 'on',
                      notifyOnDispute: formData.get('notifyOnDispute') === 'on',
                      largeTradeThreshold: Number(formData.get('largeTradeThreshold')),
                    });
                  }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <Switch
                      id="emailNotifications"
                      name="emailNotifications"
                      defaultChecked={settings.notifications.emailNotifications}
                    />
                    <Label htmlFor="emailNotifications">Email Notifications</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="smsNotifications"
                      name="smsNotifications"
                      defaultChecked={settings.notifications.smsNotifications}
                    />
                    <Label htmlFor="smsNotifications">SMS Notifications</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="pushNotifications"
                      name="pushNotifications"
                      defaultChecked={settings.notifications.pushNotifications}
                    />
                    <Label htmlFor="pushNotifications">Push Notifications</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="notifyOnNewUser"
                      name="notifyOnNewUser"
                      defaultChecked={settings.notifications.notifyOnNewUser}
                    />
                    <Label htmlFor="notifyOnNewUser">Notify on New User Registration</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="notifyOnLargeTrade"
                      name="notifyOnLargeTrade"
                      defaultChecked={settings.notifications.notifyOnLargeTrade}
                    />
                    <Label htmlFor="notifyOnLargeTrade">Notify on Large Trade</Label>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      id="notifyOnDispute"
                      name="notifyOnDispute"
                      defaultChecked={settings.notifications.notifyOnDispute}
                    />
                    <Label htmlFor="notifyOnDispute">Notify on Dispute</Label>
                  </div>
                  <div>
                    <Label htmlFor="largeTradeThreshold">Large Trade Threshold (USDT)</Label>
                    <Input
                      id="largeTradeThreshold"
                      name="largeTradeThreshold"
                      type="number"
                      defaultValue={settings.notifications.largeTradeThreshold}
                    />
                  </div>
                  <Button type="submit" disabled={updateSettings.isPending}>
                    <Save className="w-4 h-4 mr-2" />
                    {updateSettings.isPending ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
