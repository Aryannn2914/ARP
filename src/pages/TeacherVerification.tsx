import { useState, useEffect } from 'react';
import { Check, X, FileText, Clock, User, RefreshCw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import axios from 'axios';

interface PendingNote {
  _id: string;
  title: string;
  student: string;
  uploadDate: string;
  type: string;
  size: string;
  status: string;
  summary: string;
  fileUrl: string;
}

interface Stats {
  pending: number;
  approvedToday: number;
  rejectedToday: number;
}

const API_URL = 'http://localhost:3001/api';

export default function TeacherVerification() {
  const [pendingNotes, setPendingNotes] = useState<PendingNote[]>([]);
  const [stats, setStats] = useState<Stats>({
    pending: 0,
    approvedToday: 0,
    rejectedToday: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchPendingNotes(), fetchStats()]);
  };

  const fetchPendingNotes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/teacher/pending-notes`);
      console.log('Pending notes:', response.data); // Debug log
      setPendingNotes(response.data);
    } catch (error) {
      console.error('Error fetching pending notes:', error);
      toast.error('Failed to load pending notes. Make sure backend is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/teacher/stats`);
      console.log('Stats:', response.data); // Debug log
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
    toast.success('Data refreshed');
  };

  const handleDownload = (note: PendingNote) => {
    if (!note.fileUrl) {
      toast.error('File is not available for download');
      return;
    }

    try {
      const link = document.createElement('a');
      link.href = note.fileUrl;
      link.setAttribute('download', note.title || 'note');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading note:', error);
      toast.error('Failed to download file. Please try again.');
    }
  };

  const handleApprove = async (noteId: string, noteTitle: string, studentName: string) => {
    // Optimistic UI update
    setPendingNotes(pendingNotes.filter(note => note._id !== noteId));
    setStats(prev => ({ 
      ...prev, 
      pending: prev.pending - 1,
      approvedToday: prev.approvedToday + 1 
    }));

    const toastId = toast.loading(`Approving "${noteTitle}"...`);

    try {
      await axios.post(`${API_URL}/teacher/approve/${noteId}`, {
        teacherName: 'Teacher' // Replace with actual teacher name from auth
      });
      
      toast.success(`"${noteTitle}" has been approved`, { 
        id: toastId,
        description: `Uploaded by ${studentName} • Student has earned 50 ARP Tokens!` 
      });
    } catch (error) {
      console.error('Error approving note:', error);
      toast.error(`Failed to approve "${noteTitle}"`, { id: toastId });
      // Rollback on error
      fetchData();
    }
  };

  const handleReject = async (noteId: string, noteTitle: string) => {
    // Optimistic UI update
    setPendingNotes(pendingNotes.filter(note => note._id !== noteId));
    setStats(prev => ({ 
      ...prev, 
      pending: prev.pending - 1,
      rejectedToday: prev.rejectedToday + 1 
    }));

    const toastId = toast.loading(`Rejecting "${noteTitle}"...`);

    try {
      await axios.post(`${API_URL}/teacher/reject/${noteId}`, {
        teacherName: 'Teacher', // Replace with actual teacher name from auth
        reason: 'Quality standards not met' // Can add dialog for custom reason
      });
      
      toast.error(`"${noteTitle}" has been rejected`, { id: toastId });
    } catch (error) {
      console.error('Error rejecting note:', error);
      toast.error(`Failed to reject "${noteTitle}"`, { id: toastId });
      // Rollback on error
      fetchData();
    }
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">Teacher Verification</h1>
            <p className="text-muted-foreground">Review and approve student-uploaded notes</p>
          </div>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="rounded-lg"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold">{stats.pending}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Approved Today</p>
                <p className="text-2xl font-bold">{stats.approvedToday}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card rounded-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-red-500/10">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Rejected Today</p>
                <p className="text-2xl font-bold">{stats.rejectedToday}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <Card className="border-border bg-card rounded-xl">
            <CardContent className="p-8 text-center">
              <div className="flex items-center justify-center gap-2">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <p className="text-muted-foreground">Loading pending notes...</p>
              </div>
            </CardContent>
          </Card>
        ) : pendingNotes.length === 0 ? (
          <Card className="border-border bg-card rounded-xl">
            <CardContent className="p-16 text-center">
              <div className="p-4 rounded-full bg-muted mb-4 inline-block">
                <Check className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
              <p className="text-muted-foreground mb-4">No pending notes to review at the moment.</p>
              <Button onClick={handleRefresh} variant="outline" className="rounded-lg">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh List
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="border-border bg-card rounded-xl shadow-card hidden md:block">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border hover:bg-transparent">
                      <TableHead>Note Title</TableHead>
                      <TableHead>Student</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingNotes.map((note) => (
                      <TableRow key={note._id} className="border-border">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-primary" />
                            {note.title}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            {note.student}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-md">
                            {note.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{note.size}</TableCell>
                        <TableCell className="text-muted-foreground">{note.uploadDate}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="rounded-md">
                            <Clock className="h-3 w-3 mr-1" />
                            Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(note)}
                              className="rounded-lg border-border"
                            >
                              <Download className="h-4 w-4 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(note._id, note.title, note.student)}
                              className="rounded-lg bg-green-500 hover:bg-green-600 text-white"
                            >
                              <Check className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleReject(note._id, note.title)}
                              className="rounded-lg border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                            >
                              <X className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>

            {/* Mobile Card View */}
            <div className="grid grid-cols-1 gap-4 md:hidden">
              {pendingNotes.map((note) => (
                <Card key={note._id} className="border-border bg-card rounded-xl shadow-card">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold mb-1">{note.title}</h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                            <User className="h-3 w-3" />
                            {note.student}
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="rounded-md text-xs">
                              {note.type.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{note.size}</span>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-muted-foreground">{note.uploadDate}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="rounded-md">
                        <Clock className="h-3 w-3 mr-1" />
                        Pending
                      </Badge>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownload(note)}
                        className="flex-1 rounded-lg border-border"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleApprove(note._id, note.title, note.student)}
                        className="flex-1 rounded-lg bg-green-500 hover:bg-green-600 text-white"
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(note._id, note.title)}
                        className="flex-1 rounded-lg border-border hover:bg-red-500/10 hover:text-red-500 hover:border-red-500"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}