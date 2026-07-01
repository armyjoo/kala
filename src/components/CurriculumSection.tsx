import React, { useState } from 'react';
import { coursesData } from '../data/coursesData';
import { Course } from '../types';
import { BookOpen, Calendar, Clock, ChevronDown, ChevronUp, Check, Play, UserCheck, Plus, Pencil, Trash2, X, PlusCircle, CheckCircle } from 'lucide-react';

interface CurriculumSectionProps {
  onSelectCourseForApply: (courseId: string) => void;
  currentUser?: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
}

export default function CurriculumSection({ onSelectCourseForApply, currentUser }: CurriculumSectionProps) {
  // Load courses dynamically from localStorage
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem('gonggam_courses_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {
        console.error('Failed to parse courses from localStorage', err);
      }
    }
    // Seed with starting template list
    localStorage.setItem('gonggam_courses_db', JSON.stringify(coursesData));
    return coursesData;
  });

  const [expandedCourseId, setExpandedCourseId] = useState<string | null>('course_digital_open');

  // Course Editor State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form Fields
  const [formTitle, setFormTitle] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formTarget, setFormTarget] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formTags, setFormTags] = useState('');
  const [formObjectives, setFormObjectives] = useState<string[]>(['']);
  const [formSyllabus, setFormSyllabus] = useState<Array<{ week: string; topic: string }>>([
    { week: '1주차', topic: '' },
  ]);

  const toggleExpand = (id: string) => {
    setExpandedCourseId((prev) => (prev === id ? null : id));
  };

  const isAdmin = currentUser && (currentUser.role === '관리자' || currentUser.role === '부관리자');

  // Trigger: Open Form for Adding Course
  const handleOpenAdd = () => {
    setEditingCourse(null);
    setFormTitle('');
    setFormDuration('총 6주 (주 1회, 회당 120분)');
    setFormTarget('배우고 소통하길 희망하는 연천군 학습자');
    setFormDescription('');
    setFormTags('배움, 자립');
    setFormObjectives(['핵심 교육 목표를 기입해 주셔요.']);
    setFormSyllabus([
      { week: '1주차', topic: '기본 오리엔테이션 및 첫인사 나누기' },
    ]);
    setIsEditorOpen(true);
  };

  // Trigger: Open Form for Editing Course
  const handleOpenEdit = (course: Course, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding card
    setEditingCourse(course);
    setFormTitle(course.title);
    setFormDuration(course.duration);
    setFormTarget(course.target);
    setFormDescription(course.description);
    setFormTags(course.tags.join(', '));
    setFormObjectives([...course.objectives]);
    setFormSyllabus([...course.syllabus]);
    setIsEditorOpen(true);
  };

  // Trigger: Delete Course
  const handleDeleteCourse = (courseId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid expanding card
    if (window.confirm(`[교육과정 삭제] 정말로 "${title}" 과정을 영구적으로 제거하시겠습니까?`)) {
      const updated = courses.filter((c) => c.id !== courseId);
      setCourses(updated);
      localStorage.setItem('gonggam_courses_db', JSON.stringify(updated));
      
      if (expandedCourseId === courseId) {
        setExpandedCourseId(updated[0]?.id || null);
      }
    }
  };

  // Save Add/Edit course
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      alert('과정 제목을 입력해 주십시오.');
      return;
    }

    const cleanObjectives = formObjectives.filter((o) => o.trim() !== '');
    const cleanSyllabus = formSyllabus.filter((s) => s.topic.trim() !== '' && s.week.trim() !== '');
    const cleanTags = formTags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');

    if (editingCourse) {
      // Modify existing
      const updated = courses.map((c) => {
        if (c.id === editingCourse.id) {
          return {
            ...c,
            title: formTitle,
            duration: formDuration,
            target: formTarget,
            description: formDescription,
            objectives: cleanObjectives.length > 0 ? cleanObjectives : ['교육 성취 목표 수립'],
            syllabus: cleanSyllabus.length > 0 ? cleanSyllabus : [{ week: '1주차', topic: '교육 진행' }],
            tags: cleanTags,
          };
        }
        return c;
      });
      setCourses(updated);
      localStorage.setItem('gonggam_courses_db', JSON.stringify(updated));
    } else {
      // Create new
      const newCourse: Course = {
        id: `course_custom_${Date.now()}`,
        title: formTitle,
        duration: formDuration,
        target: formTarget,
        description: formDescription,
        objectives: cleanObjectives.length > 0 ? cleanObjectives : ['교육 성취 목표 수립'],
        syllabus: cleanSyllabus.length > 0 ? cleanSyllabus : [{ week: '1주차', topic: '교육 진행' }],
        tags: cleanTags,
      };
      const updated = [newCourse, ...courses];
      setCourses(updated);
      localStorage.setItem('gonggam_courses_db', JSON.stringify(updated));
      setExpandedCourseId(newCourse.id);
    }

    setIsEditorOpen(false);
  };

  // Form helpers for array elements
  const handleAddObjectiveRow = () => {
    setFormObjectives([...formObjectives, '']);
  };

  const handleRemoveObjectiveRow = (idx: number) => {
    const list = [...formObjectives];
    list.splice(idx, 1);
    setFormObjectives(list);
  };

  const handleObjectiveChange = (idx: number, val: string) => {
    const list = [...formObjectives];
    list[idx] = val;
    setFormObjectives(list);
  };

  const handleAddSyllabusRow = () => {
    const nextWeek = `${formSyllabus.length + 1}주차`;
    setFormSyllabus([...formSyllabus, { week: nextWeek, topic: '' }]);
  };

  const handleRemoveSyllabusRow = (idx: number) => {
    const list = [...formSyllabus];
    list.splice(idx, 1);
    setFormSyllabus(list);
  };

  const handleSyllabusChange = (idx: number, field: 'week' | 'topic', val: string) => {
    const list = [...formSyllabus];
    list[idx] = { ...list[idx], [field]: val };
    setFormSyllabus(list);
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Course Grid Header */}
        <div className="text-center mb-12 relative">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
            <BookOpen className="h-3.5 w-3.5" />
            교육과정 · CURRICULUM
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
            다채롭고 깊은 공감플러스 배움 설계
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            학습자의 속도에 정확하게 발맞추기 위해 세심하게 설계한 맞춤형 소통/협응/자립 가이드입니다.
          </p>

          {/* Admin Upload Trigger Button */}
          {isAdmin && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleOpenAdd}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl text-xs font-black shadow-md cursor-pointer transition-all hover:scale-103 active:scale-97"
              >
                <Plus className="h-4 w-4 stroke-[3px]" />
                새로운 교육과정 개설 개시
              </button>
            </div>
          )}
        </div>

        {/* Master Catalog Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          
          {/* Left Course Cards Column */}
          <div className="space-y-5">
            {courses.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                <span className="text-4xl block mb-2">📒</span>
                <p className="text-xs font-bold">공시된 교육과정이 없습니다. 관리자 계정으로 가입해 등록해 주세요.</p>
              </div>
            ) : (
              courses.map((course) => {
                const isExpanded = expandedCourseId === course.id;
                return (
                  <div
                    key={course.id}
                    className={`group rounded-2xl bg-white border transition-all duration-300 ${
                      isExpanded
                        ? 'border-sky-300 shadow-md ring-1 ring-sky-300/40'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/30'
                    }`}
                  >
                    <div className="p-6 cursor-pointer relative" onClick={() => toggleExpand(course.id)}>
                      
                      {/* Admin inline management buttons */}
                      {isAdmin && (
                        <div className="absolute top-5 right-5 flex items-center gap-1 z-10">
                          <button
                            onClick={(e) => handleOpenEdit(course, e)}
                            className="p-1 px-2.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[10px] font-bold border border-emerald-200 cursor-pointer flex items-center gap-1"
                            title="강좌 수정"
                          >
                            <Pencil className="h-3 w-3" />
                            수정
                          </button>
                          <button
                            onClick={(e) => handleDeleteCourse(course.id, course.title, e)}
                            className="p-1 px-2.5 rounded-lg bg-rose-50 text-rose-750 hover:bg-rose-100 text-[10px] font-bold border border-rose-200 text-rose-700 cursor-pointer flex items-center gap-1"
                            title="강좌 삭제"
                          >
                            <Trash2 className="h-3 w-3" />
                            삭제
                          </button>
                        </div>
                      )}

                      <div className="flex flex-wrap gap-1.5 mb-3.5 pr-20">
                        {course.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[10px] font-bold text-slate-500 bg-slate-100/80 px-2 py-0.5 rounded-md font-sans"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>

                      <h3 className="text-base sm:text-lg font-bold text-slate-800 group-hover:text-sky-600 transition-colors pr-10">
                        {course.title}
                      </h3>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 pr-10">
                        {course.description}
                      </p>

                      {/* Simple metadata bar */}
                      <div className="mt-4 pt-3 border-t border-slate-50 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-500 font-sans">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="h-3.5 w-3.5 text-sky-400" />
                          {course.duration}
                        </span>
                        
                        <button className="text-sky-500 font-bold flex items-center gap-1 hover:underline">
                          {isExpanded ? (
                            <>
                              간략히 보기
                              <ChevronUp className="h-3.5 w-3.5" />
                            </>
                          ) : (
                            <>
                              자세히 보기 &middot; 계획서 전체 펼치기
                              <ChevronDown className="h-3.5 w-3.5" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Right Curriculum detail Box */}
          {expandedCourseId && courses.find((c) => c.id === expandedCourseId) ? (
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-md p-6 md:p-8 animate-fade-in lg:sticky lg:top-24 max-h-[82vh] overflow-y-auto">
              {(() => {
                const activeCourse = courses.find((c) => c.id === expandedCourseId)!;
                return (
                  <div>
                    <span className="block text-[10px] font-bold text-sky-500 tracking-wider font-sans mb-1 uppercase">
                      ACTIVE CURRICULUM DETAILS
                    </span>
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">
                      {activeCourse.title}
                    </h3>

                    {/* Target segment box */}
                    <div className="bg-slate-50 rounded-xl p-4 mb-5 border border-slate-100 flex items-start gap-3">
                      <div className="h-8 w-8 bg-sky-50 text-sky-500 rounded-lg flex items-center justify-center shrink-0">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-600">권장 추천 수강 대상</span>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{activeCourse.target}</p>
                      </div>
                    </div>

                    {/* Educational Objectives */}
                    <h4 className="text-xs font-bold text-slate-400 tracking-wide mb-3 font-sans">
                      💡 교육 핵심 성취 목표
                    </h4>
                    <ul className="mb-5 space-y-2.5">
                      {activeCourse.objectives.map((obj, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                          <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Week syllabus */}
                    <h4 className="text-xs font-bold text-slate-400 tracking-wide mb-3 font-sans">
                      📅 주차별 교육 소강좌 구성안
                    </h4>
                    
                    <div className="space-y-2 mb-6 max-h-[220px] overflow-y-auto pr-2 custom-scrollbar">
                      {activeCourse.syllabus.map((syl, i) => (
                        <div key={i} className="flex gap-3 p-2 bg-slate-50/50 hover:bg-slate-50 rounded-lg border border-slate-100 text-xs text-left">
                          <span className="font-bold text-sky-500 pr-2 border-r border-slate-200 shrink-0 font-sans block w-14">
                            {syl.week}
                          </span>
                          <span className="text-slate-600 font-medium">{syl.topic}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => onSelectCourseForApply(activeCourse.id)}
                      className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-extrabold text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all font-sans cursor-pointer text-center flex items-center justify-center gap-1.5"
                    >
                      <Play className="h-4 w-4 fill-white animate-pulse" />
                      이 강좌 신청서 바로 작성하러 가기
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="bg-slate-100/50 border border-slate-200 border-dashed rounded-3xl p-10 text-center text-slate-400 lg:sticky lg:top-24">
              <span className="text-4xl block mb-2">🎓</span>
              <p className="text-sm font-medium">강의계획서 상세 보기를 보시려면 <br />좌측 강좌 목록 중 원하시는 수업을 클릭해 주세요.</p>
            </div>
          )}

        </div>

      </div>

      {/* Course Core Editor Overlay Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8 overflow-y-auto max-h-[90vh]">
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-xl font-black text-slate-800 mb-6 flex items-center gap-2 border-b border-slate-100 pb-3">
              <span>{editingCourse ? '✏️ 교육과정 상세 편정·수정' : '🆕 대단원 공감교육과정 신규 개설'}</span>
              <span className="text-xs font-semibold text-sky-500 bg-sky-50 px-2 py-0.5 rounded-full font-sans">
                {currentUser?.name} 관리자 계정 승인
              </span>
            </h3>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-450 text-slate-500 mb-1">교육과정명 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 발달장애인 마음 다듬기 교실"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-450 text-slate-500 mb-1">교육 기간 및 차수 *</label>
                  <input
                    type="text"
                    required
                    placeholder="예: 총 8주 (주 1회, 회당 120분)"
                    value={formDuration}
                    onChange={(e) => setFormDuration(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-450 text-slate-500 mb-1">권장 수강 대상군 *</label>
                <input
                  type="text"
                  required
                  placeholder="예: 기기 활용에 거부감이 있고 자립 의지가 있는 발달장애 어르신"
                  value={formTarget}
                  onChange={(e) => setFormTarget(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-450 text-slate-500 mb-1">과정 개괄 및 상세 설명 *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="강좌의 취지, 학습 기대 가치를 따스한 문체로 가입해 주십시오."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-black text-slate-550 text-slate-500 uppercase">💡 핵심 교육목표 조각들</label>
                    <button
                      type="button"
                      onClick={handleAddObjectiveRow}
                      className="text-sky-600 font-extrabold hover:underline text-[10px]"
                    >
                      + 항목 추가
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-slate-100 p-2 rounded-xl bg-slate-50/30">
                    {formObjectives.map((obj, i) => (
                      <div key={i} className="flex gap-1.5 items-center">
                        <span className="text-slate-400 font-black shrink-0 font-sans">{i+1}.</span>
                        <input
                          type="text"
                          required
                          value={obj}
                          onChange={(e) => handleObjectiveChange(i, e.target.value)}
                          placeholder="교육 성취 지향점 입력"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none text-[11px] focus:border-sky-450"
                        />
                        {formObjectives.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveObjectiveRow(i)}
                            className="text-rose-500 font-bold hover:bg-rose-50 p-1 rounded font-sans"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Syllabus */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[10px] font-black text-slate-550 text-slate-500 uppercase">📅 주차별 수업 과정안</label>
                    <button
                      type="button"
                      onClick={handleAddSyllabusRow}
                      className="text-sky-600 font-extrabold hover:underline text-[10px]"
                    >
                      + 주차 추가
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto border border-slate-100 p-2 rounded-xl bg-slate-50/30">
                    {formSyllabus.map((syl, i) => (
                      <div key={i} className="flex gap-1 items-center">
                        <input
                          type="text"
                          required
                          value={syl.week}
                          onChange={(e) => handleSyllabusChange(i, 'week', e.target.value)}
                          placeholder="예: 1주차"
                          className="w-12 text-center rounded-lg border border-slate-200 bg-white px-1 py-1 outline-none text-[11px] font-bold"
                        />
                        <input
                          type="text"
                          required
                          value={syl.topic}
                          onChange={(e) => handleSyllabusChange(i, 'topic', e.target.value)}
                          placeholder="주요 주차별 일주 학습 주제"
                          className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1 outline-none text-[11px] focus:border-sky-450"
                        />
                        {formSyllabus.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveSyllabusRow(i)}
                            className="text-rose-500 font-bold hover:bg-rose-50 p-1 rounded font-sans"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-450 text-slate-500 mb-1">배움 키워드 태그들 (쉼표로 구분)</label>
                <input
                  type="text"
                  placeholder="디지털, 자립, 오감, 미술 치료, 연천군"
                  value={formTags}
                  onChange={(e) => setFormTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-mono"
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
                  className="px-6 py-2 bg-sky-500 text-white rounded-xl text-xs font-bold hover:bg-sky-600 transition-colors shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" />
                  교안 게시하여 즉시 공개하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </section>
  );
}
