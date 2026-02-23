import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminKYCService } from '@/services';
import { KYCStatus, PaginationParams } from '@/types';
import toast from 'react-hot-toast';

const KYC_QUERY_KEY = 'kyc';

export const useKYCSubmissions = (params: PaginationParams & { status?: KYCStatus }) => {
  return useQuery({
    queryKey: [KYC_QUERY_KEY, params],
    queryFn: () => adminKYCService.getKYCSubmissions(params),
    keepPreviousData: true,
  });
};

export const useKYCDetail = (id: string) => {
  return useQuery({
    queryKey: [KYC_QUERY_KEY, id],
    queryFn: () => adminKYCService.getKYCById(id),
    enabled: !!id,
  });
};

export const useApproveKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes?: string }) =>
      adminKYCService.approveKYC(id, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KYC_QUERY_KEY] });
      toast.success('KYC approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve KYC');
    },
  });
};

export const useRejectKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, notes }: { id: string; reason: string; notes?: string }) =>
      adminKYCService.rejectKYC(id, reason, notes),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KYC_QUERY_KEY] });
      toast.success('KYC rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject KYC');
    },
  });
};

export const useKYCStats = () => {
  return useQuery({
    queryKey: [KYC_QUERY_KEY, 'stats'],
    queryFn: () => adminKYCService.getKYCStats(),
  });
};

export const useBulkApproveKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => adminKYCService.bulkApproveKYC(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KYC_QUERY_KEY] });
      toast.success('KYCs approved successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to approve KYCs');
    },
  });
};

export const useBulkRejectKYC = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ids, reason }: { ids: string[]; reason: string }) =>
      adminKYCService.bulkRejectKYC(ids, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [KYC_QUERY_KEY] });
      toast.success('KYCs rejected successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to reject KYCs');
    },
  });
};
