import React, { useState } from 'react';
import { Search, Filter, Eye, XCircle, MoreHorizontal, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import Pagination from '@/components/common/Pagination';
import StatusBadge from '@/components/common/StatusBadge';
import { useTrades, useTrade, useResolveDispute, useCancelTrade } from '@/hooks/useTrades';
import { TradeStatus } from '@/types';
import { formatCurrency, formatDate } from '@/utils/formatters';

const Trades: React.FC = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [status, setStatus] = useState<TradeStatus | ''>('');
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolution, setResolution] = useState<'release_to_buyer' | 'return_to_seller'>('release_to_buyer');
  const [resolutionReason, setResolutionReason] = useState('');

  const { data, isLoading } = useTrades({
    page,
    limit,
    status: status || undefined,
  });

  const { data: tradeDetail } = useTrade(selectedTradeId || '');
  const resolveDispute = useResolveDispute();

  const trades = data?.data.data || [];
  const total = data?.data.total || 0;
  const totalPages = Math.ceil(total / limit);

  const handleResolve = async () => {
    if (selectedTradeId && resolutionReason) {
      await resolveDispute.mutateAsync({
        id: selectedTradeId,
        data: { resolution, reason: resolutionReason },
      });
      setResolveModalOpen(false);
      setSelectedTradeId(null);
      setResolutionReason('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Trades</h1>
          <p className="text-muted-foreground">Monitor and manage trades</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search trades..." className="pl-10" />
            </div>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as TradeStatus);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-40">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trades Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Trades ({total})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12" />
              ))}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Trade ID</TableHead>
                      <TableHead>Buyer</TableHead>
                      <TableHead>Seller</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {trades.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                          No trades found
                        </TableCell>
                      </TableRow>
                    ) : (
                      trades.map((trade: { id: string; buyerName: string; sellerName: string; amount: number; status: string; createdAt: string }) => (
                        <TableRow key={trade.id}>
                          <TableCell className="font-medium">#{trade.id.slice(-6)}</TableCell>
                          <TableCell>{trade.buyerName}</TableCell>
                          <TableCell>{trade.sellerName}</TableCell>
                          <TableCell>{formatCurrency(trade.amount, 'USDT')}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <StatusBadge status={trade.status as 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed'} />
                              {trade.status === 'disputed' && (
                                <AlertTriangle className="w-4 h-4 text-red-500" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{formatDate(trade.createdAt, 'MMM dd, yyyy')}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="w-4 h-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedTradeId(trade.id);
                                    setViewModalOpen(true);
                                  }}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                                {trade.status === 'disputed' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedTradeId(trade.id);
                                      setResolveModalOpen(true);
                                    }}
                                    className="text-orange-500"
                                  >
                                    <AlertTriangle className="w-4 h-4 mr-2" />
                                    Resolve Dispute
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={total}
                pageSize={limit}
                onPageChange={setPage}
                onPageSizeChange={setLimit}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* View Modal */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trade Details</DialogTitle>
          </DialogHeader>
          {tradeDetail?.data && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Trade ID</p>
                  <p className="font-medium">{tradeDetail.data.id}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <StatusBadge status={tradeDetail.data.status as 'active' | 'pending' | 'completed' | 'cancelled' | 'disputed'} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Buyer</p>
                  <p className="font-medium">{tradeDetail.data.buyerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Seller</p>
                  <p className="font-medium">{tradeDetail.data.sellerName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="font-medium">{formatCurrency(tradeDetail.data.amount, 'USDT')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Price</p>
                  <p className="font-medium">{formatCurrency(tradeDetail.data.price, 'USDT')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Resolve Modal */}
      <Dialog open={resolveModalOpen} onOpenChange={setResolveModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Resolve Dispute</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Resolution</Label>
              <Select
                value={resolution}
                onValueChange={(value) => setResolution(value as 'release_to_buyer' | 'return_to_seller')}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="release_to_buyer">Release to Buyer</SelectItem>
                  <SelectItem value="return_to_seller">Return to Seller</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="reason">Reason</Label>
              <textarea
                id="reason"
                className="w-full p-3 border rounded-md bg-background"
                rows={4}
                placeholder="Enter resolution reason..."
                value={resolutionReason}
                onChange={(e) => setResolutionReason(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setResolveModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleResolve}
                disabled={!resolutionReason || resolveDispute.isPending}
              >
                {resolveDispute.isPending ? 'Resolving...' : 'Resolve Dispute'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Trades;
