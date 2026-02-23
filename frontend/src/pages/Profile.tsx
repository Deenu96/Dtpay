import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  User,
  Mail,
  Phone,
  Camera,
  Edit2,
  Save,
  X,
  Shield,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useUpdateProfile, useUploadAvatar } from '@/hooks/useAuth';
import { getInitials } from '@/utils/helpers';
import { formatDate } from '@/utils/formatters';

const profileSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  phone: z.string().regex(/^[6-9]\d{9}$/, 'Please enter a valid phone number'),
});

type ProfileFormData = z.infer<typeof profileSchema>;

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatar();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      phone: user?.phone || '',
    },
  });

  const onSubmit = async (data: ProfileFormData) => {
    try {
      await updateProfile.mutateAsync(data);
      setIsEditing(false);
    } catch {
      // Error handled by mutation
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await uploadAvatar.mutateAsync(file);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and account settings
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="p-6 text-center">
            <div className="relative inline-block">
              <Avatar className="h-32 w-32 mx-auto">
                <AvatarImage src={user?.avatar} />
                <AvatarFallback className="text-4xl">
                  {user ? getInitials(`${user.firstName} ${user.lastName}`) : 'U'}
                </AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors">
                <Camera className="h-4 w-4" />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarUpload}
                />
              </label>
            </div>

            <h2 className="mt-4 text-xl font-semibold">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-muted-foreground">{user?.email}</p>

            <div className="mt-4 flex justify-center gap-2">
              <Badge variant={user?.kycStatus === 'verified' ? 'success' : 'warning'}>
                {user?.kycStatus === 'verified' ? (
                  <>
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    KYC Verified
                  </>
                ) : (
                  'KYC Pending'
                )}
              </Badge>
              {user?.twoFactorEnabled && (
                <Badge variant="secondary">
                  <Shield className="mr-1 h-3 w-3" />
                  2FA Enabled
                </Badge>
              )}
            </div>

            <div className="mt-6 pt-6 border-t text-left space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Member Since</span>
                <span>{user?.createdAt ? formatDate(user.createdAt) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Referral Code</span>
                <span className="font-mono">{user?.referralCode}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email Verified</span>
                <Badge variant={user?.isEmailVerified ? 'success' : 'warning'}>
                  {user?.isEmailVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Phone Verified</span>
                <Badge variant={user?.isPhoneVerified ? 'success' : 'warning'}>
                  {user?.isPhoneVerified ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details</CardDescription>
            </div>
            {!isEditing ? (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </Button>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="firstName"
                      className="pl-10"
                      disabled={!isEditing}
                      {...register('firstName')}
                      error={errors.firstName?.message}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    disabled={!isEditing}
                    {...register('lastName')}
                    error={errors.lastName?.message}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={user?.email}
                    disabled
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    className="pl-10"
                    disabled={!isEditing}
                    {...register('phone')}
                    error={errors.phone?.message}
                  />
                </div>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="submit"
                    loading={updateProfile.isPending}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
