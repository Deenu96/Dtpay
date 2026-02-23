import React, { useState } from 'react';
import { Send, Bell, User, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { notificationService } from '@/services';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const Notifications: React.FC = () => {
  const [activeTab, setActiveTab] = useState('send');
  const [notificationType, setNotificationType] = useState<'all' | 'user'>('all');
  const [userId, setUserId] = useState('');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'success' | 'error'>('info');

  const sendToAll = useMutation({
    mutationFn: (data: { title: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }) =>
      notificationService.sendToAll(data),
    onSuccess: () => {
      toast.success('Notification sent to all users');
      setTitle('');
      setMessage('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });

  const sendToUser = useMutation({
    mutationFn: (data: { userId: string; title: string; message: string; type: 'info' | 'warning' | 'success' | 'error' }) =>
      notificationService.sendToUser(data.userId, { title: data.title, message: data.message, type: data.type }),
    onSuccess: () => {
      toast.success('Notification sent to user');
      setTitle('');
      setMessage('');
      setUserId('');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to send notification');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return;

    if (notificationType === 'all') {
      await sendToAll.mutateAsync({ title, message, type });
    } else {
      if (!userId) {
        toast.error('Please enter a user ID');
        return;
      }
      await sendToUser.mutateAsync({ userId, title, message, type });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="text-muted-foreground">Send notifications to users</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="send">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Send Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient Type */}
                <div className="space-y-2">
                  <Label>Recipient</Label>
                  <div className="flex gap-4">
                    <Button
                      type="button"
                      variant={notificationType === 'all' ? 'default' : 'outline'}
                      onClick={() => setNotificationType('all')}
                      className="flex-1"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      All Users
                    </Button>
                    <Button
                      type="button"
                      variant={notificationType === 'user' ? 'default' : 'outline'}
                      onClick={() => setNotificationType('user')}
                      className="flex-1"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Specific User
                    </Button>
                  </div>
                </div>

                {/* User ID (if specific user) */}
                {notificationType === 'user' && (
                  <div className="space-y-2">
                    <Label htmlFor="userId">User ID</Label>
                    <Input
                      id="userId"
                      placeholder="Enter user ID"
                      value={userId}
                      onChange={(e) => setUserId(e.target.value)}
                    />
                  </div>
                )}

                {/* Notification Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <Select value={type} onValueChange={(value) => setType(value as 'info' | 'warning' | 'success' | 'error')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="success">Success</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter notification title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                {/* Message */}
                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    id="message"
                    placeholder="Enter notification message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full min-h-[120px] p-3 border rounded-md bg-background resize-none"
                  />
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={!title || !message || sendToAll.isPending || sendToUser.isPending}
                  className="w-full"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {sendToAll.isPending || sendToUser.isPending
                    ? 'Sending...'
                    : 'Send Notification'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center py-12 text-muted-foreground">
                Notification history coming soon
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Notifications;
