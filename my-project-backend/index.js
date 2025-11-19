// server.js
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// --- Mock-test DB helpers (filesystem) ---
const fsp = fs.promises;

const DATA_ROOT = (function resolveDataRoot() {
  const p1 = path.join(__dirname, 'public', 'data');
  const p2 = path.join(__dirname, '..', 'public', 'data');
  if (fs.existsSync(p1)) return p1;
  if (fs.existsSync(p2)) return p2;
  return p1; // default
})();

const shuffle = (arr) => {
  arr = arr.slice();
  for (let i = arr.length - 1; i > 0; i--) {
    const r = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[r]] = [arr[r], arr[i]];
  }
  return arr;
};
const pickN = (arr, n) => (n >= arr.length ? shuffle(arr) : shuffle(arr).slice(0, n));
const toLower = (v) => String(v || '').trim().toLowerCase();

async function loadPool(standard, subject) {
  const base = path.join(DATA_ROOT, standard, subject);
  const manifestPath = path.join(base, 'manifest.json');
  const manifest = JSON.parse(await fsp.readFile(manifestPath, 'utf8'));
  const files = Array.isArray(manifest?.chapters) ? manifest.chapters : [];

  const all = [];
  for (const file of files) {
    try {
      const p = path.join(base, file);
      const arr = JSON.parse(await fsp.readFile(p, 'utf8'));
      if (Array.isArray(arr)) all.push(...arr);
    } catch (e) {
      console.warn('[mock] failed chapter load:', file, e.message);
    }
  }
  return all; // rows like: { question, chapter_no, marks(2/3/5), difficulty:"Easy|Medium|Hard" }
}


const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Create uploads directory if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/notes-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected successfully'))
.catch(err => console.error('MongoDB connection error:', err));

// ===== SCHEMAS =====

// Note Schema
const noteSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  size: { type: String, required: true },
  uploadDate: { type: String, required: true },
  summary: { type: String, required: true },
  category: { type: String, default: 'other' },
  fileUrl: { type: String, required: true },
  fileName: { type: String, required: true },
  student: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'], 
    default: 'pending' 
  },
  verifiedBy: { type: String, default: null },
  verifiedAt: { type: Date, default: null },
  rejectionReason: { type: String, default: null }
}, { timestamps: true });

const Note = mongoose.model('Note', noteSchema);

// User/Student Schema for tokens
const userSchema = new mongoose.Schema({
  studentName: { type: String, required: true, unique: true },
  tokens: { type: Number, default: 0 },
  totalApprovedNotes: { type: Number, default: 0 }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// ===== MULTER CONFIGURATION =====

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['application/pdf', 'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
    'text/plain'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ===== HELPER FUNCTIONS =====

function formatFileSize(bytes) {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

// ===== STUDENT ROUTES (Notes Viewer) =====

// Get all APPROVED notes (for students)
app.get('/api/notes', async (req, res) => {
  try {
    const notes = await Note.find({ status: 'approved' }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
});

// Upload a new note (goes to PENDING status)
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, summary, student, category } = req.body;

    const newNote = new Note({
      title: title || req.file.originalname.replace(/\.[^/.]+$/, ""),
      type: req.file.mimetype,
      size: formatFileSize(req.file.size),
      uploadDate: formatDate(new Date()),
      summary: summary || 'Newly uploaded study material.',
      category: category || 'other',
      fileUrl: `http://localhost:${PORT}/uploads/${req.file.filename}`,
      fileName: req.file.filename,
      student: student || 'Anonymous Student',
      status: 'pending' // Important: starts as pending
    });

    const savedNote = await newNote.save();
    res.status(201).json(savedNote);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// Delete a note (students can only delete their own pending notes)
app.delete('/api/notes/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    // Delete the file from filesystem
    const filePath = path.join(__dirname, 'uploads', note.fileName);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
});

// ===== TEACHER ROUTES (Verification) =====

// Get all PENDING notes (for teacher verification)
app.get('/api/teacher/pending-notes', async (req, res) => {
  try {
    const pendingNotes = await Note.find({ status: 'pending' }).sort({ createdAt: -1 });
    res.json(pendingNotes);
  } catch (error) {
    console.error('Error fetching pending notes:', error);
    res.status(500).json({ message: 'Error fetching pending notes', error: error.message });
  }
});

// Get verification statistics
app.get('/api/teacher/stats', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const pendingCount = await Note.countDocuments({ status: 'pending' });
    const approvedToday = await Note.countDocuments({ 
      status: 'approved', 
      verifiedAt: { $gte: today } 
    });
    const rejectedToday = await Note.countDocuments({ 
      status: 'rejected', 
      verifiedAt: { $gte: today } 
    });

    res.json({
      pending: pendingCount,
      approvedToday: approvedToday,
      rejectedToday: rejectedToday
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: 'Error fetching stats', error: error.message });
  }
});

// Approve a note
app.post('/api/teacher/approve/:id', async (req, res) => {
  try {
    const { teacherName } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.status !== 'pending') {
      return res.status(400).json({ message: 'Note is not pending' });
    }

    note.status = 'approved';
    note.verifiedBy = teacherName || 'Teacher';
    note.verifiedAt = new Date();

    const updatedNote = await note.save();

    // Award tokens to the student when note is approved
    const studentName = note.student || 'Anonymous Student';
    const tokensToAward = 50; // 50 tokens per approved note

    // Find or create user
    let user = await User.findOne({ studentName: studentName });
    if (!user) {
      user = new User({
        studentName: studentName,
        tokens: tokensToAward,
        totalApprovedNotes: 1
      });
    } else {
      user.tokens += tokensToAward;
      user.totalApprovedNotes += 1;
    }
    await user.save();

    console.log(`Awarded ${tokensToAward} token(s) to ${studentName}. Total tokens: ${user.tokens}`);

    res.json(updatedNote);
  } catch (error) {
    console.error('Error approving note:', error);
    res.status(500).json({ message: 'Error approving note', error: error.message });
  }
});

// Reject a note
app.post('/api/teacher/reject/:id', async (req, res) => {
  try {
    const { teacherName, reason } = req.body;

    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (note.status !== 'pending') {
      return res.status(400).json({ message: 'Note is not pending' });
    }

    note.status = 'rejected';
    note.verifiedBy = teacherName || 'Teacher';
    note.verifiedAt = new Date();
    note.rejectionReason = reason || 'Quality standards not met';

    const updatedNote = await note.save();
    res.json(updatedNote);
  } catch (error) {
    console.error('Error rejecting note:', error);
    res.status(500).json({ message: 'Error rejecting note', error: error.message });
  }
});

// ===== TOKEN ROUTES =====

// Get user tokens by student name
app.get('/api/user/tokens/:studentName', async (req, res) => {
  try {
    const { studentName } = req.params;
    let user = await User.findOne({ studentName: studentName });
    
    if (!user) {
      // Create user if doesn't exist
      user = new User({
        studentName: studentName,
        tokens: 0,
        totalApprovedNotes: 0
      });
      await user.save();
    }
    
    res.json({
      studentName: user.studentName,
      tokens: user.tokens,
      totalApprovedNotes: user.totalApprovedNotes
    });
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    res.status(500).json({ message: 'Error fetching user tokens', error: error.message });
  }
});

// Get all users with tokens (leaderboard)
app.get('/api/users/tokens', async (req, res) => {
  try {
    const users = await User.find().sort({ tokens: -1 }).limit(100);
    res.json(users);
  } catch (error) {
    console.error('Error fetching users tokens:', error);
    res.status(500).json({ message: 'Error fetching users tokens', error: error.message });
  }
});

// Redeem tokens for gift card
app.post('/api/user/redeem', async (req, res) => {
  try {
    const { studentName, gift, cost } = req.body;

    if (!studentName || !gift || !cost) {
      return res.status(400).json({ message: 'Missing required fields: studentName, gift, cost' });
    }

    let user = await User.findOne({ studentName: studentName });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.tokens < cost) {
      return res.status(400).json({ message: 'Insufficient tokens' });
    }

    // Deduct tokens
    user.tokens -= cost;
    await user.save();

    console.log(`${studentName} redeemed ${gift} for ${cost} tokens. Remaining: ${user.tokens}`);

    res.json({
      success: true,
      studentName: user.studentName,
      tokens: user.tokens,
      redeemedGift: gift,
      cost: cost
    });
  } catch (error) {
    console.error('Error redeeming tokens:', error);
    res.status(500).json({ message: 'Error redeeming tokens', error: error.message });
  }
});

// --- Mock questions API ---
// GET /api/mock?standard=10th&subject=civics&total=20&marks=all|2|3|5&difficulty=easy|medium|hard
app.get('/api/mock', async (req, res) => {
  try {
    const { standard, subject } = req.query;
    const total = Math.max(0, parseInt(req.query.total || '0', 10) || 0);
    const marksSel = (req.query.marks || 'all').toString();
    const diffSel = toLower(req.query.difficulty || '');

    if (!standard || !subject) {
      return res.status(400).json({ error: 'standard and subject are required' });
    }

    let pool = await loadPool(standard, subject);

    if (diffSel) pool = pool.filter(r => toLower(r.difficulty) === diffSel);

    const m2 = pool.filter(r => r.marks === 2);
    const m3 = pool.filter(r => r.marks === 3);
    const m5 = pool.filter(r => r.marks === 5);

    let n2 = 0, n3 = 0, n5 = 0;
    if (marksSel === '2') n2 = total;
    else if (marksSel === '3') n3 = total;
    else if (marksSel === '5') n5 = total;
    else { n2 = Math.floor(total * 0.4); n3 = Math.floor(total * 0.35); n5 = total - n2 - n3; }

    const s2 = pickN(m2, n2);
    const s3 = pickN(m3, n3);
    const s5 = pickN(m5, n5);

    const normalize = q => ({
      questions: q.question,
      chpt_no: q.chapter_no,
      marks: q.marks,
      difficulty: toLower(q.difficulty),
    });

    return res.json({
      meta: {
        standard, subject,
        totalRequested: total,
        marksChoice: marksSel,
        difficulty: diffSel,
        createdAt: new Date().toISOString(),
      },
      sections: {
        '2': s2.map(normalize),
        '3': s3.map(normalize),
        '5': s5.map(normalize),
      }
    });
  } catch (e) {
    console.error('[mock] error:', e);
    return res.status(500).json({ error: e.message || 'server error' });
  }
});

// ===== START SERVER =====
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});