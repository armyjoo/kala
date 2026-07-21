import React, { useState } from 'react';
import { X, Lock, Mail, User, ShieldCheck, Calendar, Award, Camera, Upload } from 'lucide-react';
import { signUp, login } from '../lib/firebase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' }) => void;
}

export default function AuthModal({ isOpen, onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);

  // Login input states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Signup input states
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpName, setSignUpName] = useState('');
  const [signUpBirth, setSignUpBirth] = useState('');
  const [signUpRole, setSignUpRole] = useState<'일반회원' | '강사'>('일반회원');
  const [signUpCertificate, setSignUpCertificate] = useState('');
  const [signUpPhoto, setSignUpPhoto] = useState<string>('');
  const [photoError, setPhotoError] = useState('');
  const [signUpSuccess, setSignUpSuccess] = useState(false);

  if (!isOpen) return null;

  // Firebase 로그인 처리
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const emailInput = loginEmail.trim();

    try {
      const user = await login(emailInput, loginPassword);
      if (user) {
        onLoginSuccess({ name: user.name, role: user.role });
        onClose();
      } else {
        setLoginError('회원 정보를 찾을 수 없습니다.');
      }
    } catch (err: any) {
      setLoginError(err.message || '아이디(이메일) 또는 비밀번호가 올바르지 않습니다.');
    }
  };

  // 사진 업로드 핸들러
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

  // 테스트용 사진 자동 입력
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

  // Firebase 회원가입 처리
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhotoError('');

    if (signUpRole === '강사' && !signUpPhoto) {
      setPhotoError('강사 가입 시 반명함 사진 첨부는 법적 등록을 위해 필수 사항입니다.');
      return;
    }

    try {
      // 1. Firebase 가입 전송
      const newMember = await signUp(signUpEmail.trim(), signUpPassword, signUpName.trim(), signUpRole);

      // 2. 폼 초기화
      const targetEmail = newMember?.email || signUpEmail.trim();
      setSignUpEmail('');
      setSignUpPassword('');
      setSignUpName('');
      setSignUpBirth('');
      setSignUpCertificate('');
      setSignUpPhoto('');

      setSignUpSuccess(true);

      setTimeout(() => {
        setSignUpSuccess(false);
        setIsLogin(true);
        setLoginEmail(targetEmail);
        setLoginPassword('');
      }, 2000);
    } catch (err: any) {
      alert(err.message || '회원가입 과정 중 시스템 오류가 발생했습니다.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl border border-slate-100 animate-zoom-in max-h-[92vh] flex flex-col">
        <div className="absolute top-0 left-0 w-full h-2.5 bg-gradient-to-r from-sky-400 via-sky-300 to-orange-400 shrink-0" />

        {/* Header */}
        <div className="p-6 md:p-8 pb-4 flex items-center justify-between border-b border-slate-100 shrink-0">
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 md:px-8 py-4 space-y-5">
          {signUpSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl font-sans text-xs space-y-1 animate-fade-in">
              <p className="font-extrabold text-[13px]">🎉 협회 통합가입 신청 성공!</p>
              <p>기록 정보 검증이 안전하게 마쳤습니다. 간편 로그인을 위해 즉시 전환중입니다...</p>
            </div>
          )}

          {isLogin ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {loginError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 animate-pulse">
                  <span className="text-base">⚠️</span>
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans">이메일 주소</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="example@gonggam.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
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
                    className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 py-2.5 pl-11 pr-4 text-sm outline-none focus:border-sky-400 focus:bg-white transition-all font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-sky-500 to-sky-600 py-3 text-sm font-black text-white shadow-md hover:opacity-95 transition-all font-sans cursor-pointer mt-4"
              >
                안전인증 로그인접속
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignUpSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 tracking-wider uppercase font-sans mb-1">
                  회원 종류 선택 <span className="text-orange-500 font-bold">*</span>
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
                    {signUpPhoto ? (
                      <div className="h-20 w-16 bg-slate-100 border border-slate-200 rounded-lg overflow-hidden shrink-0 shadow-xs relative group">
                        <img
                          src={signUpPhoto}
                          alt="반명함 원본"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setSignUpPhoto('')}
                          className="absolute inset-0 bg-black/60 text-white text-[9px] opacity-0 group-hover:opacity-100 flex items-center justify-center font-sans transition-opacity cursor-pointer"
                        >
                          초기화
                        </button>
                      </div>
                    ) : (
                      <div className="h-20 w-16 bg-white border border-slate-200 border-dashed rounded-lg flex flex-col items-center justify-center text-slate-400 shrink-0 text-[10px] font-sans">
                        <Camera className="h-5 w-5 opacity-40 mb-1" />
                        미등록
                      </div>
                    )}

                    <div className="space-y-1.5 flex-1 font-sans">
                      <div className="flex gap-2">
                        <label className="flex-1 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 py-2 text-center text-[11px] font-bold text-slate-700 cursor-pointer transition-colors flex items-center justify-center gap-1">
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
                          className="rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-[11px] px-3 py-2 transition-colors cursor-pointer"
                        >
                          📸 자동 대입
                        </button>
                      </div>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        자격 명부 발급용 사진이 필요합니다 (PNG/JPG, 최대 2MB).
                      </p>
                    </div>
                  </div>
                </div>
              )}

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

              <div className="space-y-1">
                <label className="block text-[11px] font-black text-slate-400 tracking-wider font-sans uppercase">대표 자격증 1개 기재 *</label>
                <div className="relative text-xs">
                  <Award className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="예: 사회복지사 2급 / 미술치료지도사"
                    value={signUpCertificate}
                    onChange={(e) => setSignUpCertificate(e.target.value)}
                    className="w-full text-xs rounded-xl border border-slate-200 bg-slate-50/50 py-2 px-3 pl-9 outline-none focus:border-sky-400 focus:bg-white font-sans"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-2xl bg-gradient-to-r from-orange-500 to-orange-600 py-3 text-sm font-black text-white shadow-md hover:opacity-95 transition-all font-sans cursor-pointer mt-4"
              >
                협회 정회원 심사 신청 가입
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 text-center shrink-0 border-t border-slate-100 bg-slate-50/50">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs text-slate-500 hover:text-sky-500 transition-colors font-sans underline cursor-pointer"
          >
            {isLogin ? '처음 방문하셨나요? 회원가입하기' : '이미 계정이 있으신가요? 로그인하기'}
          </button>
        </div>
      </div>
    </div>
  );
}
