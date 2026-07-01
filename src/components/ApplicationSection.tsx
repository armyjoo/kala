import React, { useState, useEffect } from 'react';
import { coursesData } from '../data/coursesData';
import { ClassApplication } from '../types';
import { Send, FileCheck, HelpCircle, Phone, Calendar, User, Clock, ShieldCheck, Mail, Users, MessageSquare } from 'lucide-react';

interface ApplicationSectionProps {
  initialCourseId: string | null;
  onClearSelectedCourse: () => void;
}

export default function ApplicationSection({
  initialCourseId,
  onClearSelectedCourse,
}: ApplicationSectionProps) {
  // Local state for submitted applications
  const [historyList, setHistoryList] = useState<ClassApplication[]>([]);
  
  // Load courses dynamically from localStorage
  const [courses, setCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem('gonggam_courses_db');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (err) {}
    }
    return coursesData;
  });

  // Form inputs
  const [applicantName, setApplicantName] = useState('');
  const [organization, setOrganization] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [courseId, setCourseId] = useState(initialCourseId || 'course_digital_open');
  const [preferredDate, setPreferredDate] = useState('');
  const [participantsCount, setParticipantsCount] = useState(5);
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitSuccess, setIsSubmitSuccess] = useState(false);

  // Sync initial selections if navigated from curriculum tab
  useEffect(() => {
    if (initialCourseId) {
      setCourseId(initialCourseId);
    }
  }, [initialCourseId]);

  // Load local applications history list from localStorage if available
  useEffect(() => {
    const saved = localStorage.getItem('gonggam_applications');
    if (saved) {
      try {
        setHistoryList(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse applications history', err);
      }
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedCourseObj = courses.find((c) => c.id === courseId);
    if (!selectedCourseObj) return;

    const newApplication: ClassApplication = {
      id: `app_${Date.now()}`,
      applicantName,
      organization: organization || '개인 신청',
      contact,
      email,
      courseId,
      courseTitle: selectedCourseObj.title,
      preferredDate,
      participantsCount,
      specialRequests,
      appliedAt: new Date().toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      status: 'pending',
    };

    const updatedHistory = [newApplication, ...historyList];
    setHistoryList(updatedHistory);
    localStorage.setItem('gonggam_applications', JSON.stringify(updatedHistory));

    // Clear Form & Show alert success message
    setIsSubmitSuccess(true);
    setApplicantName('');
    setOrganization('');
    setContact('');
    setEmail('');
    setCourseId('course_digital_open');
    setPreferredDate('');
    setParticipantsCount(5);
    setSpecialRequests('');
    onClearSelectedCourse();

    setTimeout(() => {
      setIsSubmitSuccess(false);
    }, 4500);
  };

  return (
    <section className="py-12 md:py-20 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Title Block */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-sky-600 bg-sky-50 font-sans tracking-wide">
            <FileCheck className="h-3.5 w-3.5" />
            교육신청 · CLASS REGISTRATION
          </span>
          <h2 className="mt-3 text-3xl font-black text-slate-800 tracking-tight">
            희망찬 배움의 첫걸음을 떼어보세요
          </h2>
          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            참가자 한 분 한 분의 소중한 의견을 면밀히 분석하여 가장 완벽하고 친밀한 일대일 평생 배움 교안을 선물해 드립니다.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Interactive Input Registration Form */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-100 shadow-xl p-6 md:p-8 relative">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-sky-400 to-sky-500" />
            
            <h3 className="text-base sm:text-lg font-bold text-slate-800 mb-6 flex items-center gap-1.5 pb-3 border-b border-slate-50 font-sans">
              📋 장애인 평생학습 교실 청수신청서
            </h3>

            {isSubmitSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-sans text-xs flex items-start gap-3 animate-fade-in shadow-xs">
                <span className="text-xl shrink-0">🎉</span>
                <div>
                  <span className="block font-black text-sm">교육 신청서가 온전히 접수되었습니다!</span>
                  <p className="mt-1 leading-relaxed text-[11px] text-emerald-700">
                    작성해 주신 대리인 및 신청자 핸드폰 기밀연락처로 협회 주명훈 대표 또는 배정 담당 교육강사단이 근무일 24시간 이내에 직접 전화를 걸어 일정 확인을 안내드립니다.
                  </p>
                  <div className="mt-3 p-2.5 bg-white/70 border border-emerald-200 rounded-xl text-[10px] text-emerald-800 space-y-1">
                    <span className="block font-black text-emerald-950">📡 [협회 대표 유선통신망 즉각 수급 전송]</span>
                    <p>대표 유선 연락처 <strong>010-9169-0964 / 010-3270-0162</strong> 및 대표 공식 수신 메일 <strong>armyjoo@gmail.com</strong>로 신청서 접수 알림이 동기 발송되었습니다.</p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">신청인 및 대리인 성명 *</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="성함을 기입해주셔요"
                      value={applicantName}
                      onChange={(e) => setApplicantName(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">해당 소속기관명 (선택)</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      placeholder="복지관, 학교, 요양소 등 (개인은 공백)"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">긴급 핸드폰 번호 *</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="tel"
                      required
                      placeholder="010-0000-0000"
                      value={contact}
                      onChange={(e) => setContact(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase font-medium">안내용 이메일 주소 *</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="username@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">원하시는 교육과정 선택 *</label>
                <select
                  required
                  value={courseId}
                  onChange={(e) => setCourseId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/55 p-3 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans font-semibold text-slate-700"
                >
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} ({course.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">희망 희망 시작일 *</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={preferredDate}
                      onChange={(e) => setPreferredDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">수강 예정 수량 (참가자수) *</label>
                  <div className="relative">
                    <Users className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      required
                      min={1}
                      max={80}
                      value={participantsCount}
                      onChange={(e) => setParticipantsCount(parseInt(e.target.value) || 1)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans font-medium"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1 font-sans uppercase">학습자 건강상 특이점 및 전달 사항 (선택)</label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                  <textarea
                    rows={4}
                    placeholder="예: '휠체어 슬로프 안내 필요', 'AAC 인쇄 카드를 무상 무상으로 받고 싶음', '의사소통 기호 교육 중점 요망' 등 구체적인 세부 조건들을 기입해 주세요."
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3.5 pl-10 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans leading-relaxed"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-extrabold text-white shadow-md hover:shadow-lg active:scale-[0.99] transition-all font-sans cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Send className="h-4 w-4" />
                장애인 평생교안 상담 및 신청서 송신
              </button>

            </form>
          </div>

          {/* Right Column: Applications History dashboard stored in localStorage */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Direct support information card */}
            <div className="bg-sky-500 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
              {/* Background ambient shape */}
              <div className="absolute right-0 bottom-0 h-28 w-28 bg-white/10 rounded-full translate-x-8 translate-y-8" />
              
              <span className="text-[10px] bg-white/20 px-2.5 py-0.5 rounded-full font-bold font-sans tracking-wide">
                HELP CENTER
              </span>
              <h4 className="text-base font-extrabold mt-2.5">
                협회 직접 전화 상담이 필요하신가요?
              </h4>
              <p className="text-xs text-sky-50/90 leading-relaxed mt-1.5 font-sans">
                인터넷 양식 기입이 번거롭고 힘든 중증 장애인 가족분들은, 아래 협회 유선 전화로 직접 연락해주시면 24시간 언제라도 친절히 음성 접수를 성행해 드립니다.
              </p>
              
              <div className="mt-5 bg-white/10 rounded-2xl p-4 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-sky-100 font-sans uppercase font-bold">협회 대표 유선통신망</span>
                    <span className="text-sm sm:text-base font-black font-sans tracking-wide block mt-1">
                      010-9169-0964
                    </span>
                    <span className="text-sm sm:text-base font-black font-sans tracking-wide block mt-0.5">
                      010-3270-0162
                    </span>
                  </div>
                  <Phone className="h-6 w-6 text-sky-200 animate-bounce self-start mt-1" />
                </div>
                <div className="pt-2.5 border-t border-white/15">
                  <span className="block text-[10px] text-sky-100 font-sans uppercase font-bold">상담 메일 주소</span>
                  <span className="text-xs font-bold font-mono tracking-wide block mt-0.5 text-sky-50">
                    armyjoo@gmail.com
                  </span>
                </div>
              </div>
            </div>

            {/* Application history dashboard listed elegantly */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <h3 className="text-xs font-bold text-slate-400 tracking-wider mb-4 uppercase font-sans flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-slate-300" />
                내 신청 및 문의 내역 ({historyList.length})
              </h3>

              {historyList.length === 0 ? (
                <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-2xl p-8 text-center text-slate-400 font-sans">
                  <span className="text-xl block mb-1">🔍</span>
                  <p className="text-[11px] leading-relaxed">
                    이 장비(현재 브라우저)에서 접수된 <br />
                    신청 내역이 아직 등록되어 있지 않네요.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                  {historyList.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 bg-slate-50 border border-slate-100 rounded-2xl space-y-2.5 shadow-3xs hover:-translate-y-0.5 hover:shadow-2xs transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-slate-400 font-sans">
                          {app.appliedAt}
                        </span>
                        
                        <span
                          className={`text-[9px] font-black px-2 py-0.5 rounded-md font-sans ${
                            app.status === 'pending'
                              ? 'bg-orange-50 text-orange-600 border border-orange-100'
                              : 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          }`}
                        >
                          {app.status === 'pending' ? '접수대기중' : '접수완료'}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">
                          {app.courseTitle}
                        </h4>
                        <div className="mt-1 flex flex-wrap gap-2 text-[10px] text-slate-500 font-sans">
                          <span>신청인: <strong>{app.applicantName}</strong></span>
                          <span>&middot;</span>
                          <span>소속: <strong>{app.organization}</strong></span>
                          <span>&middot;</span>
                          <span> {app.participantsCount}명</span>
                        </div>
                      </div>

                      {app.specialRequests && (
                        <div className="bg-white/80 p-2 rounded-lg border border-slate-100 text-[9px] text-slate-400 italic line-clamp-1">
                          비고: {app.specialRequests}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
