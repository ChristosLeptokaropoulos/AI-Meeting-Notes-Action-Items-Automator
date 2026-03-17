'use client';

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { ActionItem, Meeting } from '@/lib/types';

type StatusFilter = 'all' | 'pending' | 'in_progress' | 'completed';
type PriorityFilter = 'all' | 'high' | 'medium' | 'low';

export default function DashboardPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  const fetchMeetings = useCallback(async () => {
    try {
      const res = await fetch('/api/meetings');
      if (!res.ok) throw new Error('Failed to fetch meetings');
      const data = await res.json();
      setMeetings(data.meetings || []);
    } catch {
      toast.error('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  // Flatten all action items with their meeting context
  const allItems: (ActionItem & { meetingTitle: string })[] = meetings.flatMap(
    (m) =>
      (m.action_items || []).map((item) => ({
        ...item,
        meetingTitle: m.title || 'Untitled Meeting',
      }))
  );

  // Apply filters
  const filteredItems = allItems.filter((item) => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && item.priority !== priorityFilter) return false;
    return true;
  });

  // Stats
  const stats = [
    { label: 'Total Items', value: allItems.length, emoji: '📋', color: '' },
    { label: 'Pending', value: allItems.filter((i) => i.status === 'pending').length, emoji: '⏳', color: 'text-yellow-600' },
    { label: 'In Progress', value: allItems.filter((i) => i.status === 'in_progress').length, emoji: '🔄', color: 'text-blue-600' },
    { label: 'Completed', value: allItems.filter((i) => i.status === 'completed').length, emoji: '✅', color: 'text-green-600' },
    { label: 'High Priority', value: allItems.filter((i) => i.priority === 'high').length, emoji: '🔴', color: 'text-red-600' },
  ];
  const totalItems = stats[0].value;

  async function updateStatus(id: string, status: string) {
    try {
      const res = await fetch(`/api/action-items/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update');

      // Update local state
      setMeetings((prev) =>
        prev.map((m) => ({
          ...m,
          action_items: m.action_items?.map((item) =>
            item.id === id ? { ...item, status: status as ActionItem['status'] } : item
          ),
        }))
      );

      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  }

  function getPriorityColor(priority: string) {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  }

  function getStatusLabel(status: string) {
    switch (status) {
      case 'pending': return '⏳ Pending';
      case 'in_progress': return '🔄 In Progress';
      case 'completed': return '✅ Completed';
      default: return status;
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="text-lg text-muted-foreground animate-pulse">
          Loading dashboard...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Track and manage action items across all your meetings.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="pt-6">
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-sm text-muted-foreground">{stat.emoji} {stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Status:</span>
              <Select
                value={statusFilter}
                onValueChange={(v) => setStatusFilter(v as StatusFilter)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Priority:</span>
              <Select
                value={priorityFilter}
                onValueChange={(v) => setPriorityFilter(v as PriorityFilter)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(statusFilter !== 'all' || priorityFilter !== 'all') && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setStatusFilter('all');
                  setPriorityFilter('all');
                }}
              >
                Clear filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Items List */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Action Items ({filteredItems.length}
            {filteredItems.length !== totalItems && ` of ${totalItems}`})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              {totalItems === 0
                ? 'No action items yet. Extract your first meeting!'
                : 'No items match the current filters.'}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item, index) => (
                <div
                  key={item.id || index}
                  className="flex items-start gap-4 p-4 rounded-lg border hover:shadow-sm transition-shadow"
                >
                  <div className="flex-1 space-y-1">
                    <p className="font-medium">{item.task}</p>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      <span>👤 {item.owner}</span>
                      <span>📅 {item.deadline}</span>
                      <span>📁 {item.meetingTitle}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={getPriorityColor(item.priority)}>
                      {item.priority}
                    </Badge>
                    <Select
                      value={item.status}
                      onValueChange={(v) => { if (item.id && v) updateStatus(item.id, v); }}
                    >
                      <SelectTrigger className="w-[155px] text-xs h-8">
                        <SelectValue>
                          {getStatusLabel(item.status)}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">⏳ Pending</SelectItem>
                        <SelectItem value="in_progress">🔄 In Progress</SelectItem>
                        <SelectItem value="completed">✅ Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Meeting History */}
      {meetings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              Meeting History ({meetings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {meetings.map((meeting, index) => (
                <div
                  key={meeting.id || index}
                  className="p-4 rounded-lg border space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium">
                      {meeting.title || 'Untitled Meeting'}
                    </p>
                    <div className="flex items-center gap-2">
                      {meeting.source && (
                        <Badge variant="secondary">
                          {meeting.source === 'audio' ? '🎤 Audio' : '📝 Pasted'}
                        </Badge>
                      )}
                      <Badge variant="outline">
                        {meeting.action_items?.length || 0} items
                      </Badge>
                    </div>
                  </div>
                  {meeting.summary && (
                    <p className="text-sm text-muted-foreground">{meeting.summary}</p>
                  )}
                  {meeting.created_at && (
                    <p className="text-xs text-muted-foreground">
                      {new Date(meeting.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
