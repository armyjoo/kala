export interface AACCard {
  id: string;
  label: string;
  englishLabel?: string;
  category: 'request' | 'expression' | 'condition';
  icon: string; // Lucide icon name or emoji expression
  description: string;
  soundText: string; // Text to be read by the Speech Synthesis API
}

export interface Course {
  id: string;
  title: string;
  duration: string;
  target: string;
  description: string;
  objectives: string[];
  syllabus: { week: string; topic: string }[];
  tags: string[];
}

export interface ActivityStory {
  id: string;
  title: string;
  date: string;
  author: string;
  content: string;
  summary: string;
  imageUrl?: string;
  images?: string[];
  viewCount: number;
}

export interface ClassApplication {
  id: string;
  applicantName: string;
  organization: string;
  contact: string;
  email: string;
  courseId: string;
  courseTitle: string;
  preferredDate: string;
  participantsCount: number;
  specialRequests: string;
  appliedAt: string;
  status: 'pending' | 'approved' | 'completed';
}

export interface Notices {
  id: string;
  title: string;
  content: string;
  date: string;
  author: string;
  isImportant: boolean;
  viewCount: number;
}

export interface LoungeMessage {
  id: string;
  author: string;
  role: '강사' | '회원' | '방문자';
  content: string;
  date: string;
  likes: number;
  replies?: Array<{
    id: string;
    author: string;
    content: string;
    date: string;
  }>;
}
