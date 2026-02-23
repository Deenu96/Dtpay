import React, { useState } from 'react';
import {
  Shield,
  Upload,
  CheckCircle2,
  AlertCircle,
  Camera,
  FileText,
  CreditCard,
  ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/utils/helpers';

const KYCPage: React.FC = () => {
  const { user } = useAuth();
  const [uploadedDocs, setUploadedDocs] = useState({
    pan: false,
    aadhaar: false,
    selfie: false,
  });

  const kycStatus = user?.kycStatus || 'not_started';

  const steps = [
    {
      id: 'pan',
      title: 'PAN Card',
      description: 'Upload a clear photo of your PAN card',
      icon: CreditCard,
      required: true,
    },
    {
      id: 'aadhaar',
      title: 'Aadhaar Card',
      description: 'Upload front and back of your Aadhaar card',
      icon: FileText,
      required: true,
    },
    {
      id: 'selfie',
      title: 'Selfie Verification',
      description: 'Take a selfie holding your ID document',
      icon: Camera,
      required: true,
    },
  ];

  const getStatusConfig = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          icon: CheckCircle2,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          title: 'KYC Verified',
          description: 'Your identity has been verified successfully.',
        };
      case 'pending':
        return {
          icon: AlertCircle,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          title: 'KYC Under Review',
          description: 'Your documents are being reviewed. This may take 1-2 business days.',
        };
      case 'rejected':
        return {
          icon: AlertCircle,
          color: 'text-red-500',
          bgColor: 'bg-red-100',
          title: 'KYC Rejected',
          description: 'Your documents were rejected. Please re-upload clear documents.',
        };
      default:
        return {
          icon: Shield,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          title: 'Complete KYC',
          description: 'Verify your identity to unlock all features.',
        };
    }
  };

  const statusConfig = getStatusConfig();
  const completedSteps = Object.values(uploadedDocs).filter(Boolean).length;
  const progress = (completedSteps / steps.length) * 100;

  const handleFileUpload = (docId: string) => {
    // Simulate file upload
    setUploadedDocs((prev) => ({ ...prev, [docId]: true }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">KYC Verification</h1>
        <p className="text-muted-foreground">
          Complete your identity verification to unlock all features
        </p>
      </div>

      {/* Status Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className={cn('p-3 rounded-full', statusConfig.bgColor)}>
              <statusConfig.icon className={cn('h-6 w-6', statusConfig.color)} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{statusConfig.title}</h2>
              <p className="text-muted-foreground">{statusConfig.description}</p>
              {kycStatus === 'not_started' && (
                <div className="mt-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progress</span>
                    <span>{completedSteps}/{steps.length} completed</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}
            </div>
            <Badge
              variant={
                kycStatus === 'verified'
                  ? 'success'
                  : kycStatus === 'pending'
                  ? 'warning'
                  : kycStatus === 'rejected'
                  ? 'destructive'
                  : 'default'
              }
            >
              {kycStatus === 'not_started' ? 'Not Started' : kycStatus}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Document Upload Steps */}
      {kycStatus !== 'verified' && kycStatus !== 'pending' && (
        <div className="grid gap-4">
          {steps.map((step, index) => (
            <Card
              key={step.id}
              className={cn(
                'transition-colors',
                uploadedDocs[step.id as keyof typeof uploadedDocs]
                  ? 'border-green-500'
                  : 'hover:border-primary'
              )}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      'p-3 rounded-full',
                      uploadedDocs[step.id as keyof typeof uploadedDocs]
                        ? 'bg-green-100'
                        : 'bg-muted'
                    )}
                  >
                    <step.icon
                      className={cn(
                        'h-5 w-5',
                        uploadedDocs[step.id as keyof typeof uploadedDocs]
                          ? 'text-green-600'
                          : 'text-muted-foreground'
                      )}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{step.title}</h3>
                      {uploadedDocs[step.id as keyof typeof uploadedDocs] && (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                  <Button
                    variant={
                      uploadedDocs[step.id as keyof typeof uploadedDocs]
                        ? 'outline'
                        : 'default'
                    }
                    onClick={() => handleFileUpload(step.id)}
                  >
                    {uploadedDocs[step.id as keyof typeof uploadedDocs] ? (
                      <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Uploaded
                      </>
                    ) : (
                      <>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Submit Button */}
      {kycStatus === 'not_started' && completedSteps === steps.length && (
        <Alert className="bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle>Ready to Submit</AlertTitle>
          <AlertDescription>
            All documents have been uploaded. Click below to submit for verification.
          </AlertDescription>
        </Alert>
      )}

      {kycStatus === 'not_started' && (
        <Button
          className="w-full"
          size="lg"
          disabled={completedSteps < steps.length}
        >
          Submit for Verification
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      )}

      {/* Benefits */}
      <Card>
        <CardHeader>
          <CardTitle>Benefits of KYC Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { title: 'Higher Limits', desc: 'Increased trading and withdrawal limits' },
              { title: 'Faster Processing', desc: 'Priority support and faster transactions' },
              { title: 'Enhanced Security', desc: 'Additional security features enabled' },
            ].map((benefit) => (
              <div key={benefit.title} className="p-4 border rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500 mb-2" />
                <h4 className="font-medium">{benefit.title}</h4>
                <p className="text-sm text-muted-foreground">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KYCPage;
