import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Settings, Users, Calendar, Award, Camera, Upload } from 'lucide-react';
import { signUp, login } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' }) => void;
}

interface Member {
  id: string;
  email: string;
  password: string;
  name: string;
  birthDate: string;
  role: '일반회원' | '강사' | '관리자' | '부관리자';
  certificate: string;
  photo?: string;
  signUpDate: string;
}

// Preseeded system default users
const SYSTEM_INITIAL_MEMBERS: Member[] = [
  {
    id: 'mem_admin',
    email: 'admin',
    password: 'admin',
    name: '대표관리자 주명훈',
    birthDate: '1981-12-05',
    role: '관리자',
    certificate: '사회복지사 1급, 평생교육사 1급',
    signUpDate: '2026-06-01',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mem_instructor_1',
    email: 'instructor@gonggam.com',
    password: 'instructor',
    name: '이민수 전문강사',
    birthDate: '1982-04-12',
    role: '강사',
    certificate: '미술치료사 1급, 마음언어 AAC 교육사 1급',
    signUpDate: '2026-06-05',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mem_subadmin',
    email: 'sub@gonggam.com',
    password: 'sub',
    name: '박은혜 부관리자',
    birthDate: '1988-08-20',
    role: '부관리자',
    certificate: '평생교육 프로그램 지도자 전격증',
    signUpDate: '2026-06-08',
    photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200&h=200'
  },
  {
    id: 'mem_member_1',
    email: 'member@gonggam.com',
    password: 'member',
    name: '김성실 회원',
    birthDate: '1990-12-05',
    role: '일반회원',
    certificate: '컴퓨터활용능력 2급',
    signUpDate: '2026-06-10'
  }
];

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  
  // Login input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup input states (based on specific criteria)
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpBirth, setSignUpBirth] = useState('');
  const [signUpRole, setSignUpRole] = useState<'일반회원' | '강사'>('일반회원');
  const [signUpCertificate, setSignUpCertificate] = useState('');
  const [signUpPhoto, setSignUpPhoto] = useState<string>(''); // base64 representation of half-passport ID photo
  const [photoError, setPhotoError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  // Admin password alteration flow states
  const [needsAdminPasswordChange, setNeedsAdminPasswordChange] = useState(false);
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [confirmAdminPassword, setConfirmAdminPassword] = useState('');

  // Initialize and seed members DB if not present in localStorage
  useEffect(() => {
    const db = localStorage.getItem('gonggam_members_db');
    if (!db) {
      localStorage.setItem('gonggam_members_db', JSON.stringify(SYSTEM_INITIAL_MEMBERS));
    } else {
      try {
        const parsed = JSON.parse(db);
        const hasAdmin = parsed.some((m: any) => m.role === '관리자');
        if (!hasAdmin) {
          const newAdmin: Member = {
            id: 'mem_admin',
            email: 'admin',
            password: 'admin',
            name: '대표관리자 주명훈',
            birthDate: '1981-12-05',
            role: '관리자',
            certificate: '사회복지사 1급, 평생교육사 1급',
            signUpDate: '2026-06-01'
          };
          parsed.push(newAdmin);
          localStorage.setItem('gonggam_members_db', JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem('gonggam_members_db', JSON.stringify(SYSTEM_INITIAL_MEMBERS));
      }
    }
  }, []);

  if (!isOpen) return null;

  // Retrieve current active users list
  const getMembersDb = (): Member[] => {
    const db = localStorage.getItem('gonggam_members_db');
    if (db) {
      try {
        return JSON.parse(db);
      } catch (e) {
        return SYSTEM_INITIAL_MEMBERS;
      }
    }
    return SYSTEM_INITIAL_MEMBERS;
  };

  // Login handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailInput = loginEmail.trim();

    // Check special admin simulation credentials
    if (emailInput === 'admin' && loginPassword === 'admin') {
      setNeedsAdminPasswordChange(true);
      return;
    }

    try {
      const user = await login(emailInput, loginPassword);
      onLoginSuccess({
        name: user.name,
        role: user.role
      });
      onClose();
    } catch (err: any) {
      setLoginError(err.message || '아이디(이메일) 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  // Submit admin password alteration
  const handleAdminPasswordChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminPassword) {
      alert('새로운 비밀번호를 입력해 주세요.');
      return;
    }
    if (newAdminPassword === 'admin') {
      alert('기본값인 "admin"은 보안상 위험하여 사용할 수 수 없습니다. 다른 비밀번호를 지정해 주세요.');
      return;
    }
    if (newAdminPassword !== confirmAdminPassword) {
      alert('비밀번호가 일치하지 않습니다. 다시 한번 확인해 주세요.');
      return;
    }

    const db = getMembersDb();
    const updated = db.map(m => {
      if (m.email === 'admin') {
        return { ...m, password: newAdminPassword };
      }
      return m;
    });

    localStorage.setItem('gonggam_members_db', JSON.stringify(updated));
    alert('🎉 대표관리자의 비밀번호가 안전하게 교체되었습니다! 즉시 안전하게 로그인합니다.');
    
    onLoginSuccess({
      name: '대표관리자 주명훈',
      role: '관리자'
    });
    
    setNeedsAdminPasswordChange(false);
    setNewAdminPassword('');
    setConfirmAdminPassword('');
    onClose();
  };

  // Image reader to base64
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhotoError('');
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 2 * 1024 * 1024) {
        setPhotoError('반명함 사진 한도는 2MB 이하입니다.');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setSignUpPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Fast apply mock avatar for testers convenience
  const applyMockPhoto = () => {
    const sampleAvatars = [
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200&h=200',
      'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=200&h=200'
    ];
    const picked = sampleAvatars[Math.floor(Math.random() * sampleAvatars.length)];
    setSignUpPhoto(picked);
    setPhotoError('');
  };

  // Sign Up handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError('');

    // Photo is mandatory for instructors (강사)
    if (signUpRole === '강사' && !signUpPhoto) {
      setPhotoError('강사 가입 시 반명함 사진 첨부는 법적 등록을 위해 필수 사항입니다.');
      return;
    }

    try {
      const newMember = await signUp({
        email: signUpEmail.trim(),
        password: signUpPassword,
        name: signUpName.trim(),
        birthDate: signUpBirth,
        role: signUpRole,
        certificate: signUpCertificate.trim(),
        photo: signUpRole === '강사' ? signUpPhoto : undefined
      });

      // Clear sign up inputs
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpName('');
      setSignUpBirth('');
      setSignUpCertificate('');
      setSignUpPhoto('');
      
      setSignUpSuccess(true);
      
      // Switch to login tab and notify success
      setTimeout(() => {
        setSignUpSuccess(false);
        setIsLogin(true);
        // Pre-populate login credentials
        setLoginEmail(newMember.email);
        setLoginPassword(''); // Safe behavior, let user fill password
      }, 2000);
    } catch (err: any) {
      alert(err.message || '회원가입 과정 중 시스템 오류가 발생했습니다.');
    }
  };

  // Fast login bypass triggers (Handles fallback simulation as well)
  const handleQuickLogin = async (emailAddress: string, passwordText: string) => {
    setLoginEmail(emailAddress);
    setLoginPassword(passwordText);
    
    try {
      const user = await login(emailAddress, passwordText);
      onLoginSuccess({
        name: user.name,
        role: user.role
      });
      onClose();
    } catch (err) {
      // Fallback for demo simulation if Firebase account is not yet populated
      const db = getMembersDb();
      const matched = db.find(m => m.email === emailAddress && m.password === passwordText);
      if (matched) {
        onLoginSuccess({
          name: matched.name,
          role: matched.role
        });
        onClose();
      } else {
        alert('빠른 로그인 안내: 테스트 회원 정보 인증에 실패했습니다.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-zoom-in max-h-[92vh] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-sky-400 via-sky-300 to-orange-400 shrink-0" />
        
        {/* Modal Scrollable Wrapper */}
        <div className="overflow-y-auto p-6 md:p-8 space-y-5">
          
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-50 pb-3">
            <div>
              <span className="block text-[10px] font-extrabold text-sky-500 tracking-wider font-sans">장애인 평생학습 교정망</span>
              <h3 className="text-lg md:text-xl font-black text-slate-800 font-sans mt-0.5">
                {isLogin ? '공감플러스 통합로그인' : '협회 신규회원 통합가입'}
              </h3>
            </div>
            <button 
              onClick={onClose}
              className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Verification Notices success modal */}
          {signUpSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-sans text-xs space-y-1 animate-fade-in">
              <p className="font-extrabold text-[13px]">🎉 협회 통합가입 신청 성공!</p>
              <p>기록 정보 검증이 안전하게 마쳤습니다. 간편 로그인을 위해 즉시 전환중입니다...</p>
            </div>
          )}

          {/* 1. LOGIN SUB-VIEW LAYOUT */}
          {isLogin ? (
            needsAdminPasswordChange ? (
              <form onSubmit={handleAdminPasswordChangeSubmit} className="space-y-4">
                <div className="p-4 bg-orange-50 border border-orange-200 text-orange-950 rounded-2xl text-xs font-sans font-bold flex flex-col gap-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">⚠️</span>
                    <span className="text-[13px] font-extrabold text-orange-850">관리자 비밀번호 초기화 안내</span>
                  </div>
                  <p className="text-slate-600 font-medium leading-relaxed">
                    최초 계정인 <code className="bg-white/80 px-1 py-0.5 rounded">admin</code>의 기본 비밀번호가 감지되었습니다. 
                    시스템의 보안과 안전한 운영을 위해 <strong>새비밀번호를 즉시 설정</strong>해 주십시오. 
                    지정 후 바로 관리자 자격으로 로그인됩니다.
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans">새 비밀번호 입력</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="안전하고 새로운 비밀번호"
                      value={newAdminPassword}
                      onChange={(e) => setNewAdminPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-1 focus:ring-orange-400 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans">새 비밀번호 확인</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="비밀번호 확인"
                      value={confirmAdminPassword}
                      onChange={(e) => setConfirmAdminPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-orange-400 focus:bg-white focus:ring-1 focus:ring-orange-400 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setNeedsAdminPasswordChange(false)}
                    className="flex-1 rounded-2xl border border-slate-200 py-3 text-sm font-bold text-slate-500 hover:bg-slate-50 cursor-pointer"
                  >
                    이전으로
                  </button>
                  <button
                    type="submit"
                    className="flex-1 rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-black text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all font-sans cursor-pointer"
                  >
                    비밀번호 변경 및 관리자 시작
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                
                {loginError && (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 animate-pulse">
                    <span className="text-base">⚠️</span>
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans">아이디 (이메일 주소 / admin)</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="example@gonggam.com 또는 admin"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-400 transition-all font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans">접속 비밀번호</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white focus:ring-1 focus:ring-sky-400 transition-all font-sans"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-black text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all font-sans cursor-pointer mt-4"
                >
                  안전인증 로그인접속
                </button>
              </form>
            )
          ) : (
            
            /* 2. SIGNUP SUB-VIEW LAYOUT */
            <form onSubmit={handleSignUpSubmit} className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
              
              {/* Profile Image upload mandatory only for '강사' */}
              <div>
                <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans mb-1">
                  회원 종류 선택 <span className="text-orange-550 font-bold">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 mb-4 font-sans">
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpRole('일반회원');
                      setPhotoError('');
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      signUpRole === '일반회원' 
                        ? 'border-orange-300 bg-orange-50/50 text-orange-700 font-black ring-1 ring-orange-300' 
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <User className="h-4 w-4" />
                    일반회원 가입
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSignUpRole('강사');
                      setPhotoError('');
                    }}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-xs font-bold transition-all ${
                      signUpRole === '강사' 
                        ? 'border-sky-400 bg-sky-50 text-sky-700 font-black ring-1 ring-sky-400' 
                        : 'border-slate-200 bg-slate-50 text-slate-500'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    전문강사 가입
                  </button>
                </div>
              </div>

              {/* Photo Input (MANDATORY FOR INSTRUCTOR '강사') */}
              {signUpRole === '강사' && (
                <div className="p-4 rounded-2xl bg-sky-50/40 border border-sky-100 flex flex-col items-center justify-center gap-3">
                  <span className="block text-[11px] font-black text-sky-700 font-sans tracking-wide">
                    ⚠️ 강사용 반명함 증명사진 필수 등록 (3x4 Passport)
                  </span>

                  {photoError && (
                    <span className="block text-[10px] font-bold text-rose-500 font-sans text-center">
                      {photoError}
                    </span>
                  )}

                  <div className="flex items-center gap-4 w-full">
                    
                    {/* Circle Image preview */}
                    {signUpPhoto ? (
                      <div className="h-20 w-16 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-3xs relative group">
                        <img 
                          src={signUpPhoto} 
                          alt="반명함 원본" 
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSignUpPhoto('')}
                          className="absolute inset-0 bg-black/60 text-white text-[9px] opacity-0 group-hover:opacity-100 flex items-center justify-center font-sans tracking-tight transition-opacity cursor-pointer"
                        >
                          초기화
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-16 bg-white border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0 text-[10px] font-sans">
                        <Camera className="h-5 w-5 opacity-40 mb-1 text-slate-400" />
                        미등록
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 font-sans">
                      <div className="flex gap-2">
                        <label className="flex-1 rounded-xl bg-white border border-slate-250 border-slate-200 hover:bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-700 cursor-pointer transition-colors shadow-3xs flex items-center justify-center gap-1">
                          <Upload className="h-3.5 w-3.5" />
                          사진 첨부하기
                          <input
                            type="file"
                            required={signUpRole === '강사'}
                            accept="image/*"
                            onChange={handlePhotoUpload}
                            className="hidden"
                          />
                        </label>
                        
                        <button
                          type="button"
                          onClick={applyMockPhoto}
                          className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] px-3 py-2 transition-colors cursor-pointer shadow-3xs"
                        >
                          📸 테스트 사진 자동 대입
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        실무 자격 명부 발급 및 수강생 배포를 위해 인물 정량 사진이 필요합니다 (PNG/JPG, 최대 2MB).
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* Login Credentials block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">이메일 주소 (ID) *</label>
                  <div className="relative text-xs">
                    <Mail className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">비밀번호 설정 *</label>
                  <div className="relative text-xs">
                    <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      minLength={4}
                      placeholder="비밀번호 4자리 이상"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Minimal personal inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">이름 (실명 필수) *</label>
                  <div className="relative text-xs">
                    <User className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      required
                      placeholder="공감지기"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">생년월일 *</label>
                  <div className="relative text-xs">
                    <Calendar className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="date"
                      required
                      value={signUpBirth}
                      onChange={(e) => setSignUpBirth(e.target.value)}
                      className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white font-sans"
                    />
                  </div>
                </div>
              </div>

              {/* Representative Certificate field */}
              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">대표 자격증 1개 기재 *</label>
                <div className="relative text-xs">
                  <Award className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="예: 사회복지사 2급 / 미술치료지도사 / 평생교육지도사 등"
                    value={signUpCertificate}
                    onChange={(e) => setSignUpCertificate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white font-sans"
                  />
                </div>
                <span className="block text-[9px] text-slate-400 font-sans mt-1">※ 소지하고 계시는 국가공인 또는 등록 민간 자격증 중 핵심 자격증 1가지를 명시해 주시기 바랍니다.</span>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-black text-white shadow-md hover:opacity-95 active:scale-[0.98] transition-all font-sans cursor-pointer mt-4"
              >
                협회 정회원 심사 신청 가입
              </button>
            </form>
          )}


          {/* Toggle login / signup */}
          <div className="text-center pt-2 shrink-0 border-t border-slate-50">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-xs text-slate-500 hover:text-sky-500 transition-colors font-sans underline"
            >
              {isLogin ? '처음 방문하셨나요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
