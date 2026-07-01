import React, { useState } from 'react';
import { Menu, X, User, LogOut, ChevronRight, GraduationCap, UserMinus } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface NavigationProps {
  currentTab: string;
  onTabChange: (tabId: string) => void;
  onOpenAuth: () => void;
  currentUser: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
  onLogout: () => void;
  onDeleteAccount?: () => void;
}

export default function Navigation({
  currentTab,
  onTabChange,
  onOpenAuth,
  currentUser,
  onLogout,
  onDeleteAccount,
}: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);

  const isAdmin = currentUser && (currentUser.role === '관리자' || currentUser.role === '부관리자');

  // Exact 8 menus defined in additional instructions, with dynamic admin portal appended
  const menuItems = [
    { id: 'intro', label: '소개' },
    { id: 'greetings', label: '인사말' },
    { id: 'curriculum', label: '교육과정' },
    { id: 'stories', label: '교육스토리' },
    { id: 'application', label: '교육신청' },
    { id: 'performance', label: '교육실적' },
    { id: 'lounge', label: '강사방' },
    { id: 'notice', label: '공지사항' },
    ...(isAdmin ? [{ id: 'admin', label: '🛡️ 관리패널' }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-sky-100 bg-white/95 shadow-xs backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          
          {/* Logo & Slogan Area */}
          <div 
            onClick={() => onTabChange('intro')} 
            className="flex items-center cursor-pointer group"
          >
            <BrandLogo size="md" customHeight={45} />
          </div>

          {/* Desktop Navigation Link Array */}
          <nav className="hidden xl:flex items-center space-x-1">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`relative rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'text-sky-600 bg-sky-50/70 font-bold shadow-2xs'
                      : 'text-slate-600 hover:text-sky-500 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute bottom-1.5 left-1/2 h-1 w-5 -translate-x-1/2 rounded-full bg-sky-400" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right aligned access menu (로그인, 회원가입 or User card) */}
          <div className="hidden xl:flex items-center gap-4">
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
                <div className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded-full ${currentUser.role === '강사' ? 'bg-orange-400' : 'bg-sky-400 animate-pulse'}`} />
                  <span className="text-xs font-bold text-slate-700">
                    {currentUser.name} <span className="text-[10px] text-slate-400 font-medium font-sans">({currentUser.role})</span>
                  </span>
                </div>
                <div className="flex items-center gap-1 border-l border-slate-200 pl-2">
                  <button
                    onClick={onLogout}
                    title="로그아웃"
                    className="text-slate-400 hover:text-sky-600 transition-colors p-1 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                  {onDeleteAccount && currentUser.role !== '관리자' && (
                    <button
                      onClick={onDeleteAccount}
                      title="회원탈퇴"
                      className="text-slate-300 hover:text-rose-500 transition-colors p-1 cursor-pointer"
                    >
                      <UserMinus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-1 font-sans text-xs font-medium text-slate-500">
                <button
                  onClick={onOpenAuth}
                  className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:text-sky-500 hover:bg-slate-50 transition-all font-bold cursor-pointer"
                >
                  로그인
                </button>
                <span className="text-slate-200">|</span>
                <button
                  onClick={onOpenAuth}
                  className="rounded-lg px-2.5 py-1.5 text-slate-600 hover:text-sky-500 hover:bg-slate-50 transition-all font-bold cursor-pointer"
                >
                  회원가입
                </button>
              </div>
            )}
          </div>

          {/* Tablet & Mini Menu trigger */}
          <div className="flex xl:hidden items-center gap-2">
            {currentUser && (
              <span className="text-[10px] font-bold bg-sky-50 text-sky-700 px-2 py-1 rounded-full max-w-[100px] truncate">
                {currentUser.name}
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 active:scale-95 transition-all cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="xl:hidden bg-white border-t border-slate-100 shadow-lg px-4 pt-3 pb-6 space-y-2 animate-fade-in">
          <div className="grid grid-cols-2 gap-1.5 mb-3">
            {menuItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    setIsOpen(false);
                  }}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-600 font-bold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{item.label}</span>
                  <ChevronRight className="h-4 w-4 opacity-50" />
                </button>
              );
            })}
          </div>

          {/* Users authentication section in mobile drawer */}
          <div className="border-t border-slate-100 pt-3">
            {currentUser ? (
              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl">
                <div>
                  <span className="text-xs font-bold text-slate-700">{currentUser.name} 님</span>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {currentUser.role === '강사' 
                      ? '공감플러스 공식 강사' 
                      : currentUser.role === '관리자' 
                        ? '대표 관리자' 
                        : currentUser.role === '부관리자' 
                          ? '공식 부관리자' 
                          : '공감플러스 일반회원'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-1.5 bg-red-50 text-red-600 py-1.5 px-3 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  로그아웃
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-1">
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-sky-500 rounded-xl text-white text-xs font-bold hover:bg-sky-600 transition-colors cursor-pointer"
                >
                  로그인하기
                </button>
                <button
                  onClick={() => {
                    onOpenAuth();
                    setIsOpen(false);
                  }}
                  className="w-full text-center py-2.5 bg-slate-100 rounded-xl text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors mt-1 cursor-pointer"
                >
                  회원가입하기
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
