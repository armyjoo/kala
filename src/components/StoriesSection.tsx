import React, { useState } from 'react';
import { storiesData as initialStories } from '../data/storiesData';
import { ActivityStory } from '../types';
import { Sparkles, Calendar, User, Eye, Search, PlusCircle, BookOpen, AlertCircle, X, ChevronRight, Pencil, Trash2, CheckCircle } from 'lucide-react';

interface StoriesSectionProps {
  currentUser: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
}

export default function StoriesSection({ currentUser }: StoriesSectionProps) {
  // Load/persist stories dynamically
  const [stories, setStories] = useState<ActivityStory[]>(() => {
    const saved = localStorage.getItem('gonggam_stories_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse stories from localStorage', err);
      }
    }
    // Seed database if empty
    localStorage.setItem('gonggam_stories_db', JSON.stringify(initialStories));
    return initialStories;
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStory, setSelectedStory] = useState<ActivityStory | null>(null);
  const [viewerActiveImg, setViewerActiveImg] = useState<string>('');

  // Story Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingStory, setEditingStory] = useState<ActivityStory | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formSummary, setFormSummary] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formImages, setFormImages] = useState<string[]>([]);

  // Authorized to write/edit/delete: '강사' (Instructor), '관리자' (Admin), '부관리자' (Sub-Admin)
  const isAuthorized = currentUser && (
    currentUser.role === '강사' || 
    currentUser.role === '관리자' || 
    currentUser.role === '부관리자'
  );

  // Filter based on search term
  const filteredStories = stories.filter(
    (story) =>
      story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      story.summary.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenStory = (story: ActivityStory) => {
    setSelectedStory(story);
    setViewerActiveImg(story.images?.[0] || story.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600');
    // Increment viewCount
    const updated = stories.map((s) => (s.id === story.id ? { ...s, viewCount: s.viewCount + 1 } : s));
    setStories(updated);
    localStorage.setItem('gonggam_stories_db', JSON.stringify(updated));
  };

  // Open Form for Adding Story
  const handleOpenAdd = () => {
    setEditingStory(null);
    setFormTitle('');
    setFormSummary('');
    setFormContent('');
    setFormImageUrl('https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600');
    setFormImages([]);
    setIsEditorOpen(true);
  };

  // Open Form for Editing Story
  const handleOpenEdit = (story: ActivityStory, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening read modal
    setEditingStory(story);
    setFormTitle(story.title);
    setFormSummary(story.summary);
    setFormContent(story.content);
    setFormImageUrl(story.imageUrl || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600');
    setFormImages(story.images || (story.imageUrl ? [story.imageUrl] : []));
    setIsEditorOpen(true);
  };

  // Delete Story
  const handleDeleteStory = (storyId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid opening read modal
    if (window.confirm(`[교육스토리 삭제] 정말로 "${title}" 기고 수기를 영구히 삭제하시겠습니까?`)) {
      const updated = stories.filter((s) => s.id !== storyId);
      setStories(updated);
      localStorage.setItem('gonggam_stories_db', JSON.stringify(updated));
      
      if (selectedStory?.id === storyId) {
        setSelectedStory(null);
      }
    }
  };

  const handleSaveStory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formContent.trim()) {
      alert('이야기 제목과 본문 내용을 채워주십시오.');
      return;
    }

    const savedImages = formImages.length > 0 ? formImages : [formImageUrl];
    const mainImageUrl = savedImages[0] || 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=600';

    if (editingStory) {
      // Modify
      const updated = stories.map((s) => {
        if (s.id === editingStory.id) {
          return {
            ...s,
            title: formTitle,
            summary: formSummary || formContent.slice(0, 100) + '...',
            content: formContent,
            imageUrl: mainImageUrl,
            images: savedImages,
          };
        }
        return s;
      });
      setStories(updated);
      localStorage.setItem('gonggam_stories_db', JSON.stringify(updated));
      
      if (selectedStory?.id === editingStory.id) {
        setSelectedStory({
          ...selectedStory,
          title: formTitle,
          summary: formSummary,
          content: formContent,
          imageUrl: mainImageUrl,
          images: savedImages,
        });
        setViewerActiveImg(mainImageUrl);
      }
    } else {
      // Create New
      const roleStr = currentUser ? (currentUser.role === '관리자' ? '대표관리자' : currentUser.role === '부관리자' ? '부관리자' : '강사') : '교육강사';
      const storyToAdd: ActivityStory = {
        id: `story_custom_${Date.now()}`,
        title: formTitle,
        summary: formSummary || formContent.slice(0, 100) + '...',
        content: formContent,
        author: `${currentUser?.name || '협회'} ${roleStr}`,
        date: new Date().toISOString().split('T')[0],
        imageUrl: mainImageUrl,
        images: savedImages,
        viewCount: 1,
      };

      const updated = [storyToAdd, ...stories];
      setStories(updated);
      localStorage.setItem('gonggam_stories_db', JSON.stringify(updated));
    }

    setIsEditorOpen(false);
  };

  return (
    <section className="py-12 md:py-20 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Ribbon */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 border-b border-slate-100 pb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-orange-600 bg-orange-50 font-sans tracking-wide">
              <Sparkles className="h-3.5 w-3.5" />
              교육스토리 · STORIES
            </span>
            <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
              연천에서 일구는 감동의 평생 교육 현장
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              배움의 깊이와 성취를 이뤄내고 있는 연천군 수강생들과 강사진의 진솔하고 아늑한 대화 기록들을 모았습니다.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search input bar */}
            <div className="relative font-sans text-xs">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="제목, 작가 등으로 스토리를 검색해 보세요"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-64 rounded-xl border border-slate-200 bg-slate-50 py-2.5 pr-4 pl-10 text-slate-700 outline-none focus:border-sky-300 focus:bg-white transition-all text-xs font-medium"
              />
            </div>

            {/* Instructor / Admin post story shortcut */}
            {isAuthorized && (
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-bold text-white shadow-md cursor-pointer transition-all hover:scale-103 active:scale-97 shrink-0"
              >
                <PlusCircle className="h-4.5 w-4.5" />
                현장 기고문 등록
              </button>
            )}
          </div>
        </div>

        {/* Primary Story Feed Grid */}
        {filteredStories.length === 0 ? (
          <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center text-slate-400 font-sans">
            <AlertCircle className="h-10 w-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-semibold">검색 결과와 매칭되는 감동 수기가 존재하지 않습니다.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredStories.map((story) => (
              <article
                key={story.id}
                onClick={() => handleOpenStory(story)}
                className="group flex flex-col h-full bg-white border border-slate-150 border-slate-100 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl transition-all duration-300 -translate-y-0 hover:-translate-y-1.5 cursor-pointer relative"
              >
                {/* Admin/Author Control Panel inside Card */}
                {isAuthorized && (
                  <div className="absolute top-3 left-3 z-10 flex gap-1">
                    <button
                      onClick={(e) => handleOpenEdit(story, e)}
                      className="p-1 px-2.5 rounded-lg bg-white/95 text-emerald-700 hover:bg-emerald-50 text-[10px] font-black border border-slate-200/80 shadow-xs cursor-pointer flex items-center gap-1"
                      title="수기 수정"
                    >
                      <Pencil className="h-3 w-3" />
                      수정
                    </button>
                    <button
                      onClick={(e) => handleDeleteStory(story.id, story.title, e)}
                      className="p-1 px-2.5 rounded-lg bg-white/95 text-rose-700 hover:bg-rose-50 text-[10px] font-black border border-slate-200/80 shadow-xs cursor-pointer flex items-center gap-1"
                      title="수기 삭제"
                    >
                      <Trash2 className="h-3 w-3" />
                      삭제
                    </button>
                  </div>
                )}

                {/* Story card thumbnail */}
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={story.imageUrl}
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-3 right-3 bg-white/95 text-[10px] font-bold text-slate-700 px-2.5 py-1 rounded-md font-sans border border-slate-100 shadow-3xs">
                    {story.date}
                  </div>
                </div>

                {/* Card body */}
                <div className="p-5 flex flex-col justify-between flex-1 space-y-4">
                  <div className="space-y-2">
                    <span className="inline-block text-[10px] font-bold text-sky-500 font-sans tracking-wide">
                      {story.author}
                    </span>
                    <h3 className="text-sm md:text-base font-black text-slate-800 line-clamp-1 group-hover:text-sky-500 transition-colors">
                      {story.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">
                      {story.summary}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1 font-medium">
                      <Eye className="h-3.5 w-3.5 text-slate-300" />
                      조회수 {story.viewCount}회
                    </span>

                    <span className="font-extrabold text-sky-500 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                      수기 읽기
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Detailed Study story Viewer overlay */}
        {selectedStory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="relative w-full max-w-3xl bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-y-auto max-h-[85vh] animate-fade-in">
              <button
                onClick={() => setSelectedStory(null)}
                className="absolute top-5 right-5 z-10 text-slate-600 bg-white/80 hover:bg-white hover:text-slate-900 px-3 py-1.5 rounded-full border border-slate-200 transition-all font-sans text-xs font-bold shadow-xs cursor-pointer animate-pulse"
              >
                닫기 ×
              </button>

              <div className="h-56 sm:h-72 overflow-hidden relative bg-slate-900 border-b border-slate-100">
                <img
                  src={viewerActiveImg || selectedStory.imageUrl}
                  alt={selectedStory.title}
                  className="w-full h-full object-contain mx-auto"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent pointer-events-none" />
                <div className="absolute bottom-6 left-6 right-6">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className="text-[10px] bg-sky-500 text-white font-bold px-2 py-0.5 rounded-md font-sans">
                      수기 기고
                    </span>
                    {isAuthorized && (
                      <button
                        onClick={(e) => {
                          setSelectedStory(null);
                          handleOpenEdit(selectedStory, e);
                        }}
                        className="text-[10px] bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-md font-sans hover:underline flex items-center gap-1"
                      >
                        <Pencil className="h-2.5 w-2.5" />
                        수정하기
                      </button>
                    )}
                  </div>
                  <h3 className="text-lg sm:text-xl md:text-2xl font-extrabold text-white leading-tight">
                    {selectedStory.title}
                  </h3>
                </div>
              </div>

              {/* Gallery Image Selector Carousel */}
              {selectedStory.images && selectedStory.images.length > 1 && (
                <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-center gap-2">
                  {selectedStory.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setViewerActiveImg(img)}
                      className={`relative h-14 w-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                        viewerActiveImg === img ? 'border-sky-500 scale-105 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <span className="absolute bottom-1 right-1 px-1 bg-black/60 rounded text-[8px] text-white font-mono font-bold">
                        {idx + 1}/3
                      </span>
                    </button>
                  ))}
                </div>
              )}

              <div className="p-6 md:p-10">
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-sans mb-6 pb-4 border-b border-slate-100">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {selectedStory.date}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1 text-slate-700 font-semibold animate-pulse">
                    <User className="h-3.5 w-3.5 text-sky-400" />
                    {selectedStory.author}
                  </span>
                  <span>|</span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    조회수 {selectedStory.viewCount}회
                  </span>
                </div>

                <div className="text-slate-700 text-sm md:text-base leading-relaxed whitespace-pre-wrap font-sans space-y-4">
                  {selectedStory.content}
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                  <button
                    onClick={() => setSelectedStory(null)}
                    className="px-6 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs hover:shadow-md cursor-pointer transition-all"
                  >
                    목록으로 가기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

      {/* Story Editor Overlay Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-150 pb-3">
              <span>{editingStory ? '✏️ 현장 공감수기 일지 수정' : '🆕 새로운 교육스토리 수기 기고'}</span>
              <span className="text-xs font-semibold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-md font-sans animate-pulse">
                {currentUser?.name || '협회'} 계정
              </span>
            </h3>

            <form onSubmit={handleSaveStory} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">수기 제목 *</label>
                <input
                  type="text"
                  required
                  placeholder="감동적인 교육 일지 제목을 적어주세요"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all font-sans font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">이야기 한 줄 요약 *</label>
                <input
                  type="text"
                  required
                  placeholder="목록에서 독자들에게 바로 소구될 수 한 줄 요약을 작성해 주세요"
                  value={formSummary}
                  onChange={(e) => setFormSummary(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-2 font-sans uppercase">
                  현장 교육 사진 등록 (최대 3장) *
                </label>
                
                {/* Image Previews */}
                {formImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    {formImages.map((img, idx) => (
                      <div key={idx} className="relative h-20 rounded-xl overflow-hidden border border-slate-200 group bg-slate-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setFormImages(p => p.filter((_, i) => i !== idx))}
                          className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white text-[10px] h-5 w-5 rounded-full flex items-center justify-center cursor-pointer shadow-sm group-hover:scale-110 transition-transform font-bold"
                          title="사진 제거"
                        >
                          ×
                        </button>
                        <span className="absolute bottom-1 left-1 bg-black/60 text-[9px] text-white px-1.5 py-0.2 rounded font-sans font-bold">
                          {idx === 0 ? '대표 ★' : `${idx + 1}번째`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload Action Trigger Box */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <label className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-white rounded-xl p-4 cursor-pointer transition-all gap-1 text-center">
                    <span className="text-xl">📸</span>
                    <span className="text-xs font-bold text-slate-700">새 사진 파일 선택하기</span>
                    <span className="text-[10px] text-slate-400 font-sans">허용: JPG, PNG, GIF 등 (최대 3장)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        if (!e.target.files) return;
                        const files = Array.from(e.target.files);
                        
                        if (formImages.length + files.length > 3) {
                          alert('사진은 최대 3장까지만 등록 가능합니다.');
                          return;
                        }

                        const readPromises = files.map(file => {
                          return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onload = () => resolve(reader.result as string);
                            reader.readAsDataURL(file as any);
                          });
                        });

                        Promise.all(readPromises).then(results => {
                          setFormImages(prev => [...prev, ...results].slice(0, 3));
                        });
                      }}
                      className="hidden"
                    />
                  </label>

                  {/* Fallback Direct URL input if needed */}
                  <div className="sm:w-1/3 flex flex-col justify-between p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                    <span className="text-[10px] font-bold text-slate-500 font-sans">또는 웹 이미지 주소:</span>
                    <input
                      type="text"
                      placeholder="https://imageUrl..."
                      value={formImageUrl}
                      onChange={(e) => {
                        setFormImageUrl(e.target.value);
                        if (formImages.length < 3) {
                          setFormImages(prev => {
                            if (prev.includes(e.target.value)) return prev;
                            return [...prev, e.target.value].slice(0, 3);
                          });
                        }
                      }}
                      className="w-full text-[10px] p-2 border border-slate-200 rounded-lg outline-none bg-white font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">본문 내용 *</label>
                <textarea
                  required
                  rows={8}
                  placeholder="학습자의 미세한 변화, 수업 기획의 과정, 연천 지역사회와 호흡한 생생한 경험을 감동적으로 서술해 주세요."
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-sm outline-none focus:border-orange-400 focus:bg-white transition-all font-sans leading-relaxed text-slate-700"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-500 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-orange-500 rounded-xl text-white text-xs font-bold hover:bg-orange-600 transition-colors shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  기고 발행 및 저장
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
