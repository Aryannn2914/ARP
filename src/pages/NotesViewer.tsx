import { Search, Upload, FileText, Sparkles, Download, Trash2, Brain, AlertCircle, Star, Coins, Loader2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { auth } from '../config/firebase';

interface Note {
  _id: string;
  title: string;
  type: string
  size: string;
  uploadDate: string;
  summary: string;
  category: string;
  fileUrl: string;
  student: string;
  status: 'pending' | 'approved' | 'rejected';
}

const API_URL = 'http://localhost:3001/api';

export default function NotesViewer() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [backendError, setBackendError] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userTokens, setUserTokens] = useState<number>(0);
  const [totalApprovedNotes, setTotalApprovedNotes] = useState<number>(0);
  const [user, setUser] = useState<any>(null);
  const [loadingTokens, setLoadingTokens] = useState<boolean>(true);

  const categories = ['all', 'computer-science', 'mathematics', 'web-dev', 'other'];

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        fetchNotes();
        fetchUserTokens(currentUser);
      } else {
        setLoadingTokens(false);
        navigate("/login");
      }
    });
    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUserTokens = async (currentUser: any) => {
    if (!currentUser) return;
    
    setLoadingTokens(true);
    try {
      // Use displayName, email (before @), or uid as fallback for student name
      const studentName = currentUser.displayName || 
                        currentUser.email?.split('@')[0] || 
                        currentUser.uid || 
                        'Unknown Student';
      const response = await axios.get(`${API_URL}/user/tokens/${encodeURIComponent(studentName)}`);
      setUserTokens(response.data.tokens || 0);
      setTotalApprovedNotes(response.data.totalApprovedNotes || 0);
    } catch (error: any) {
      console.error('Error fetching user stars:', error);
      // Don't show error toast for tokens, just set to 0
      setUserTokens(0);
      setTotalApprovedNotes(0);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchNotes = async () => {
    setLoading(true);
    setBackendError(false);
    try {
      const response = await axios.get(`${API_URL}/notes`);
      console.log(' Fetched notes:', response.data);
      setNotes(response.data);
    } catch (error: any) {
      console.error(' Error fetching notes:', error);
      setBackendError(true);
      
      // More specific error messages
      if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        toast.error('Cannot connect to backend server', {
          description: 'Make sure the backend is running on http://localhost:3001'
        });
      } else {
        toast.error('Failed to load notes', {
          description: error.response?.data?.message || error.message
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'];
    
    if (!allowedTypes.includes(file.type)) {
      toast.error('Invalid file type', {
        description: 'Please upload PDF, DOC, DOCX, or TXT files only'
      });
      return;
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Maximum file size is 10MB'
      });
      return;
    }

    if (!user) {
      toast.error('Please log in to upload notes');
      navigate("/login");
      return;
    }

    // Use displayName, email (before @), or uid as fallback for student name
    const studentName = user.displayName || 
                       user.email?.split('@')[0] || 
                       user.uid || 
                       'Unknown Student';

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', file.name.replace(/\.[^/.]+$/, ""));
    // formData.append('summary', 'Newly uploaded study material.');
    formData.append('student', studentName);
    formData.append('category', selectedCategory === 'all' ? 'other' : selectedCategory);

    const toastId = toast.loading('Uploading note...', {
      description: file.name,
    });

    try {
      const response = await axios.post(`${API_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Upload successful:', response.data);

      toast.success('Note uploaded successfully!', { 
        id: toastId,
        description: 'Waiting for teacher approval. You will earn stars once approved!' 
      });
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Refresh tokens in case of any updates
      if (user) {
        fetchUserTokens(user);
      }
    } catch (error: any) {
      console.error(' Upload error:', error);
      
      if (error.code === 'ERR_NETWORK') {
        toast.error('Cannot connect to backend server', { 
          id: toastId,
          description: 'Make sure the backend is running on http://localhost:3001'
        });
      } else if (error.response?.status === 400) {
        toast.error('Upload failed', { 
          id: toastId,
          description: error.response.data.message || 'Invalid file'
        });
      } else {
        toast.error('File upload failed', { 
          id: toastId,
          description: error.response?.data?.message || error.message
        });
      }
    }
  };

  const handleDelete = async (noteId: string, noteTitle: string) => {
    const originalNotes = [...notes];
    setNotes(notes.filter(note => note._id !== noteId));

    const toastId = toast.loading(`Deleting "${noteTitle}"...`);

    try {
      await axios.delete(`${API_URL}/notes/${noteId}`);
      toast.success(`"${noteTitle}" deleted successfully`, { id: toastId });
      // Refresh tokens
      if (user) {
        fetchUserTokens(user);
      }
    } catch (error: any) {
      console.error('Error deleting note:', error);
      toast.error(`Failed to delete "${noteTitle}"`, { 
        id: toastId,
        description: error.response?.data?.message || error.message
      });
      setNotes(originalNotes);
    }
  };

  const handleSummarize = (noteTitle: string) => {
    toast.success(`AI is generating summary for "${noteTitle}"...`);
  };

  const handleDownload = (fileUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.setAttribute('download', title);
    link.setAttribute('target', '_blank');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`Downloading "${title}"...`);
  };

  const filteredNotes = notes
    .filter(note => {
      const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());

  return (
    <div className="min-h-screen py-12">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf,.doc,.docx,.txt"
      />
      
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">My Notes</h1>
              <p className="text-muted-foreground">Upload, manage, and summarize your study materials</p>
            </div>
            <Card className="border-border bg-card rounded-xl p-4 w-full sm:w-auto sm:min-w-[200px]">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-yellow-500/10">
                  <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">ARP Stars</p>
                  {loadingTokens ? (
                    <Loader2 className="h-6 w-6 animate-spin text-primary mt-1" />
                  ) : (
                    <p className="text-2xl font-bold">{userTokens}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{totalApprovedNotes} approved note{totalApprovedNotes !== 1 ? 's' : ''}</p>
                </div>
              </div>
            </Card>
          </div>
          <Alert className="mb-6 border-primary/20 bg-primary/5">
            <Coins className="h-4 w-4 text-primary" />
            <AlertDescription>
              <strong>Earn ARP Stars!</strong> Upload your study notes and earn 50 stars when teachers approve them. 
              Redeem stars for gift cards, study goodies, and UPI cash!
            </AlertDescription>
          </Alert>
        </div>

        {/* Backend Connection Error Alert */}
        {backendError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Backend Connection Error</strong>
              <br />
              Cannot connect to the backend server. Please ensure:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Backend server is running: <code className="text-xs bg-black/20 px-1 py-0.5 rounded">npm run dev</code></li>
                <li>MongoDB is running and accessible</li>
                <li>Backend is accessible at: <code className="text-xs bg-black/20 px-1 py-0.5 rounded">http://localhost:3001</code></li>
              </ul>
              <Button 
                onClick={fetchNotes} 
                variant="outline" 
                size="sm" 
                className="mt-3"
              >
                Retry Connection
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 rounded-lg border-border focus:ring-2 focus:ring-primary transition-base"
              />
            </div>
            <Button
              onClick={handleUploadClick}
              disabled={backendError}
              className="rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card disabled:opacity-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Notes
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-lg transition-base ${
                  selectedCategory === category
                    ? 'gradient-primary text-white'
                    : 'border-border hover:bg-accent/10'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {loading ? (
            <Card className="border-border bg-card rounded-xl">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading notes...</p>
              </CardContent>
            </Card>
          ) : filteredNotes.length > 0 ? (
            filteredNotes.map((note) => (
              <Card
                key={note._id}
                className="group hover:shadow-card-hover transition-base border-border bg-card rounded-xl"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <FileText className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-xl mb-1">{note.title}</CardTitle>
                        <CardDescription className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="rounded-md">
                            {note.type.split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <span className="text-sm">{note.size}</span>
                          <span className="text-sm">•</span>
                          <span className="text-sm flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {note.student}
                          </span>
                          <span className="text-sm">•</span>
                          <span className="text-sm">Uploaded {note.uploadDate}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">{note.summary}</p>
                  <div className="flex flex-wrap gap-2">
                    {/* <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSummarize(note.title)}
                      className="rounded-lg border-border hover:bg-accent/10 transition-base"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Summarize
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate('/mock-tests')}
                      className="rounded-lg border-border hover:bg-primary/10 hover:text-primary transition-base"
                    >
                      <Brain className="h-4 w-4 mr-2" />
                      Generate Test
                    </Button> */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownload(note.fileUrl, note.title)}
                      className="rounded-lg border-border hover:bg-accent/10 transition-base"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(note._id, note.title)}
                      className="rounded-lg border-border hover:bg-destructive/10 hover:text-destructive transition-base"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-border bg-card rounded-xl">
              <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                <div className="p-4 rounded-full bg-muted mb-4">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No notes found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery 
                    ? 'Try a different search term' 
                    : backendError 
                      ? 'Connect to the backend to see your notes'
                      : 'Upload your first note to get started'}
                </p>
                {!searchQuery && !backendError && (
                  <Button
                    onClick={handleUploadClick}
                    className="rounded-lg gradient-primary text-white hover:opacity-90 transition-base shadow-card"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Notes
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}