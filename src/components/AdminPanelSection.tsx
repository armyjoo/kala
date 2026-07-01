import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, ShieldCheck, Trash2, Search, Edit2, 
  Settings, Key, Save, AlertCircle, FileText, Image, CheckCircle,
  Eye, Calendar, Phone, Mail, BookOpen, Clock, Activity, Tag, HelpCircle, X
} from 'lucide-react';
import { ClassApplication } from '../types';
import { db, getAllUsers } from '../lib/firebase';
import { doc, deleteDoc, updateDoc } from 'firebase/firestore';

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

interface AdminPanelSectionProps {
  currentUser: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' } | null;
  onUpdateCurrentUser: (user: { name: string; role: '일반회원' | '강사' | '관리자' | '부관리자' }) => void;
}

export default function AdminPanelSection({ currentUser, onUpdateCurrentUser }: AdminPanelSectionProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('All');
  
  // Applications management state
  const [applications, setApplications] = useState<ClassApplication[]>([]);
  const [adminTab, setAdminTab] = useState<'members' | 'applications'>('members');
  const [appSearchTerm, setAppSearchTerm] = useState('');
  const [appStatusFilter, setAppStatusFilter] = useState<string>('All');

  // Admin account adjustment state
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminUpdateSuccess, setAdminUpdateSuccess] = useState(false);
  const [adminUpdateError, setAdminUpdateError] = useState('');

  // Editing direct member state
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<'일반회원' | '강사' | '관리자' | '부관리자'>('일반회원');
  const [editCertificate, setEditCertificate] = useState('');

  // Editing class application states
  const [editingAppId, setEditingAppId] = useState<string | null>(null);
  const [editAppName, setEditAppName] = useState('');
  const [editAppOrg, setEditAppOrg] = useState('');
  const [editAppContact, setEditAppContact] = useState('');
  const [editAppEmail, setEditAppEmail] = useState('');
  const [editAppCount, setEditAppCount] = useState<number>(5);
  const [editAppStatus, setEditAppStatus] = useState<'pending' | 'approved' | 'completed'>('pending');
  const [viewingApp, setViewingApp] = useState<ClassApplication | null>(null);

  // Access check: only '관리자' (Admin) and '부관리자' (Sub-Admin) can access this control panel.
  const hasAuth = currentUser && (currentUser.role === '관리자' || currentUser.role === '부관리자');

  // Sync / Load database from Firestore + localStorage fallback
  const loadDatabase = async () => {
    try {
      // 1. Fetch from Firestore
      const firestoreUsers = await getAllUsers();
      
      const dbStr = localStorage.getItem('gonggam_members_db');
      let localMembers: Member[] = [];
      if (dbStr) {
        try {
          localMembers = JSON.parse(dbStr);
        } catch (e) {
          console.error("Failed to parse local members db");
        }
      }

      // Combine Firestore and local storage, preferring Firestore by UID/Email match
      const combined: Member[] = [...localMembers];
      firestoreUsers.forEach(fUser => {
        const idx = combined.findIndex(c => c.id === fUser.uid || c.email.toLowerCase() === fUser.email.toLowerCase());
        const mapped: Member = {
          id: fUser.uid,
          email: fUser.email,
          password: 'encrypted-in-firebase',
          name: fUser.name,
          birthDate: fUser.birthDate,
          role: fUser.role,
          certificate: fUser.certificate,
          photo: fUser.photo,
          signUpDate: fUser.signUpDate
        };
        if (idx >= 0) {
          combined[idx] = mapped;
        } else {
          combined.push(mapped);
        }
      });

      setMembers(combined);
      localStorage.setItem('gonggam_members_db', JSON.stringify(combined));

      // Locate current admin profile and preload edit forms
      const currentAdminNode = combined.find(m => m.role === '관리자');
      if (currentAdminNode) {
        setAdminEmail(currentAdminNode.email);
        setAdminPassword(currentAdminNode.password);
        setAdminName(currentAdminNode.name);
      }
    } catch (err) {
      console.error("Error updating database with live accounts:", err);
      // Fallback to purely local loading on failure
      const dbStr = localStorage.getItem('gonggam_members_db');
      if (dbStr) {
        setMembers(JSON.parse(dbStr));
      }
    }
  };

  const loadApplications = () => {
    const saved = localStorage.getItem('gonggam_applications');
    if (saved) {
      try {
        setApplications(JSON.parse(saved));
      } catch (err) {
        console.error('Failed to parse applications in admin panel', err);
      }
    } else {
      setApplications([]);
    }
  };

  useEffect(() => {
    loadDatabase();
    loadApplications();
  }, [currentUser]);

  if (!hasAuth) {
    return (
      <div className="py-24 text-center bg-slate-50 min-h-[60vh] flex flex-col items-center justify-center p-4">
        <div className="h-14 w-14 rounded-full bg-rose-50 text-rose-500 border border-rose-100 flex items-center justify-center mb-4 pb-0.5">
          <AlertCircle className="h-6 w-6" />
        </div>
        <h3 className="text-lg font-black text-slate-800">접근 거부: 관리자 권한 필수</h3>
        <p className="text-slate-500 text-xs mt-1 max-w-sm">
          이 기능은 장애인 평생학습 강사 협회의 대표 관리자 및 부관리자 승인 계정으로만 수정 및 통제가 가능한 제한 보안 영역입니다.
        </p>
      </div>
    );
  }

  // Handle member role modification
  const handleSaveMemberEdit = async (id: string) => {
    try {
      // If it is a real firebase user (non-mock), update Firestore
      if (id && !id.startsWith('mem_')) {
        const userDocRef = doc(db, 'users', id);
        await updateDoc(userDocRef, {
          role: editRole,
          certificate: editCertificate
        });
      }
    } catch (err: any) {
      console.error("Failed to update user in Firestore:", err);
    }

    const updated = members.map(m => {
      if (m.id === id) {
        return { 
          ...m, 
          role: editRole, 
          certificate: editCertificate 
        };
      }
      return m;
    });

    setMembers(updated);
    localStorage.setItem('gonggam_members_db', JSON.stringify(updated));
    setEditingMemberId(null);

    // If editing self, update current session
    const updatedSelf = updated.find(m => m.role === currentUser.role && m.name === currentUser.name);
    if (updatedSelf && currentUser && updatedSelf.id === id) {
      onUpdateCurrentUser({
        name: updatedSelf.name,
        role: updatedSelf.role
      });
    }
  };

  // Handle user deletion
  const handleDeleteMember = async (id: string, name: string, role: string) => {
    if (role === '관리자') {
      alert('대표 관리자 계정은 시스템 무결성을 위해 삭제가 절대 불가능합니다.');
      return;
    }

    if (window.confirm(`정말로 회원님 "${name}" (${role})의 계정 정보를 협회 데이터베이스에서 영구 삭제하시겠습니까?`)) {
      try {
        // If it is a real firebase user, delete from Firestore
        if (id && !id.startsWith('mem_')) {
          await deleteDoc(doc(db, 'users', id));
        }
      } catch (err) {
        console.error("Failed to delete user from Firestore:", err);
      }

      const updated = members.filter(m => m.id !== id);
      setMembers(updated);
      localStorage.setItem('gonggam_members_db', JSON.stringify(updated));
    }
  };

  // Handle Admin user credentials updates
  const handleUpdateAdminCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminEmail.trim() || !adminPassword.trim() || !adminName.trim()) {
      setAdminUpdateError('빈 칸 없이 입력해 주십시오.');
      return;
    }

    // Attempt update
    const updated = members.map(m => {
      if (m.role === '관리자') {
        return {
          ...m,
          email: adminEmail,
          password: adminPassword,
          name: adminName
        };
      }
      return m;
    });

    localStorage.setItem('gonggam_members_db', JSON.stringify(updated));
    setMembers(updated);
    setAdminUpdateError('');
    setAdminUpdateSuccess(true);

    // Update active session synchronously
    onUpdateCurrentUser({
      name: adminName,
      role: '관리자'
    });

    setTimeout(() => {
      setAdminUpdateSuccess(false);
    }, 4000);
  };

  // Application modification actions
  const handleSaveAppEdit = (id: string) => {
    const updated = applications.map(app => {
      if (app.id === id) {
        return {
          ...app,
          applicantName: editAppName,
          organization: editAppOrg,
          contact: editAppContact,
          email: editAppEmail,
          participantsCount: editAppCount,
          status: editAppStatus
        };
      }
      return app;
    });
    setApplications(updated);
    localStorage.setItem('gonggam_applications', JSON.stringify(updated));
    setEditingAppId(null);
  };

  const handleDeleteApp = (id: string, name: string) => {
    if (window.confirm(`[교육신청 삭제] 정말로 "${name}"님의 신청 내역을 접수 목록에서 무기한 파기하시겠습니까?`)) {
      const updated = applications.filter(app => app.id !== id);
      setApplications(updated);
      localStorage.setItem('gonggam_applications', JSON.stringify(updated));
      
      if (viewingApp?.id === id) {
        setViewingApp(null);
      }
    }
  };

  // Filter lists
  const filteredMembers = members.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.certificate.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter === 'All') return matchesSearch;
    return matchesSearch && m.role === roleFilter;
  });

  const filteredApps = applications.filter(app => {
    const matchesSearch = 
      app.applicantName.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.organization.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.courseTitle.toLowerCase().includes(appSearchTerm.toLowerCase()) ||
      app.contact.includes(appSearchTerm);
    
    if (appStatusFilter === 'All') return matchesSearch;
    return matchesSearch && app.status === appStatusFilter;
  });

  // Count summaries
  const totalCount = members.length;
  const instructorCount = members.filter(m => m.role === '강사').length;
  const generalCount = members.filter(m => m.role === '일반회원').length;
  const adminCount = members.filter(m => m.role === '관리자' || m.role === '부관리자').length;

  return (
    <div className="py-12 md:py-20 bg-slate-50/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-10">
          <div className="text-left">
            <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              🛡️ 협회 행정관리 시스템 콘솔
            </h2>
            <p className="text-slate-500 text-xs mt-1 leading-relaxed">
              장애 기구 지원망과 투명 회계 지표, 교육과정 및 가입 인원 상태 기제를 종합적으로 락업 관리할 수 있습니다.
            </p>
          </div>

          <div className="bg-white/80 border border-indigo-100 rounded-2xl py-2 px-4 shadow-3xs flex items-center gap-2 text-xs font-sans">
            <span className="h-2 w-2 rounded-full bg-indigo-505 bg-indigo-500 animate-pulse" />
            <span className="text-slate-500 font-bold">운영 관리자 계정:</span>
            <span className="text-indigo-600 font-black">{currentUser?.name} <span className="text-slate-400 font-medium font-sans">({currentUser?.role})</span></span>
          </div>
        </div>

        {/* Stats Dashboard Grid layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 font-sans">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-slate-50 text-slate-600 border border-slate-150 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">총 등록 인원</span>
              <span className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">{totalCount}명</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0">
              <UserCheck className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">강사진 현황</span>
              <span className="text-xl sm:text-2xl font-black text-sky-600 tracking-tight">{instructorCount}명</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-orange-50 text-orange-500 border border-orange-100 flex items-center justify-center shrink-0">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-orange-400" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">일반 및 정회원</span>
              <span className="text-xl sm:text-2xl font-black text-orange-600 tracking-tight">{generalCount}명</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-3xs flex items-center gap-4">
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-indigo-50 text-indigo-650 flex items-center justify-center shrink-0 border border-indigo-100">
              <ShieldCheck className="h-5 w-5 sm:h-6 sm:w-6 text-indigo-600" />
            </div>
            <div>
              <span className="block text-[10px] sm:text-xs font-black text-slate-400 tracking-widest uppercase">관리 임원진</span>
              <span className="text-xl sm:text-2xl font-black text-indigo-700 tracking-tight">{adminCount}명</span>
            </div>
          </div>

        </div>

        {/* Dynamic Dual-Tab select interface */}
        <div className="flex border-b border-slate-200 mb-6 font-sans text-xs font-bold gap-3">
          <button
            onClick={() => setAdminTab('members')}
            className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'members'
                ? 'border-indigo-600 text-indigo-700 font-extrabold scale-102'
                : 'border-transparent text-slate-405 text-slate-400 hover:text-slate-650'
            }`}
          >
            👥 가입회원 통합 보정 권한통계
          </button>
          <button
            onClick={() => setAdminTab('applications')}
            className={`pb-3 px-4 transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
              adminTab === 'applications'
                ? 'border-indigo-600 text-indigo-700 font-extrabold scale-102'
                : 'border-transparent text-slate-400 hover:text-slate-650'
            }`}
          >
            📋 교육신청 영구 접수 현황판
            <span className={`text-[9px] text-white font-extrabold ml-1.5 px-2 py-0.5 rounded-full ${
              applications.some(a => a.status === 'pending') ? 'bg-orange-500 animate-pulse' : 'bg-slate-400'
            }`}>
              {applications.length}
            </span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Main workspace section (Col 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {adminTab === 'members' ? (
              /* Members Database management subview */
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden text-left">
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <span className="text-sm font-black text-slate-800 font-sans flex items-center gap-1.5">
                    📁 가입 회원 통합 데이터베이스
                  </span>
                  
                  <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="이름/ID/자격증 검색"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full sm:w-44 rounded-lg border border-slate-200 py-1.5 pr-2 pl-8 outline-none text-xs bg-white text-slate-700 focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-slate-700 text-xs outline-none focus:border-indigo-400"
                    >
                      <option value="All">전체 등급 필터</option>
                      <option value="일반회원">일반회원</option>
                      <option value="강사">협회 강사</option>
                      <option value="부관리자">부관리자</option>
                      <option value="관리자">최고 관리자</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-black tracking-wider text-slate-400 uppercase font-sans">
                        <th className="py-3 px-5 text-center">반명함 / 사진</th>
                        <th className="py-3 px-4">성명 / 로그인 아이디</th>
                        <th className="py-3 px-4">회원등급</th>
                        <th className="py-3 px-4">생년월일</th>
                        <th className="py-3 px-4">대표 자격증</th>
                        <th className="py-3 px-4 text-center">동작 행정</th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100">
                      {filteredMembers.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-slate-400 font-sans">
                            등록된 회원 조건과 매칭되는 데이터가 존재하지 않습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredMembers.map((member) => {
                          const isEditing = editingMemberId === member.id;
                          return (
                            <tr key={member.id} className="hover:bg-slate-50/40 transition-colors">
                              
                              <td className="py-4 px-5 text-center">
                                {member.photo ? (
                                  <div className="inline-block relative h-12 w-9 rounded-md overflow-hidden bg-slate-100 border border-slate-200 shadow-3xs">
                                    <img 
                                      src={member.photo} 
                                      alt={`${member.name} 사진`} 
                                      referrerPolicy="no-referrer"
                                      className="h-full w-full object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="inline-flex h-12 w-9 rounded-md bg-slate-100 text-slate-400 border border-slate-200 border-dashed items-center justify-center text-[10px] font-sans">
                                    미제출
                                  </div>
                                )}
                              </td>

                              <td className="py-4 px-4 font-sans">
                                <span className="block font-black text-slate-800 text-sm">{member.name}</span>
                                <span className="block text-[10px] text-slate-400 mt-0.5">{member.email}</span>
                              </td>

                              <td className="py-4 px-4 font-sans">
                                {isEditing ? (
                                  <select
                                    value={editRole}
                                    onChange={(e: any) => setEditRole(e.target.value)}
                                    className="border border-slate-250 border-slate-200 rounded py-1 px-1.5 focus:border-indigo-400 bg-white"
                                  >
                                    <option value="일반회원">일반회원</option>
                                    <option value="강사">강사</option>
                                    <option value="부관리자">부관리자</option>
                                    <option value="관리자">관리자</option>
                                  </select>
                                ) : (
                                  <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                                    member.role === '관리자' 
                                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-700' 
                                      : member.role === '부관리자' 
                                        ? 'bg-purple-50 border border-purple-100 text-purple-700'
                                        : member.role === '강사'
                                          ? 'bg-sky-50 border border-sky-100 text-sky-700'
                                          : 'bg-orange-50 border border-orange-100 text-orange-700'
                                  }`}>
                                    {member.role === '관리자' ? '👑 최고관리자' : member.role === '부관리자' ? '💼 부관리자' : member.role === '강사' ? '🎓 협회 강사' : '🏠 일반회원'}
                                  </span>
                                )}
                              </td>

                              <td className="py-4 px-4 font-mono text-slate-500">
                                {member.birthDate || '미증빙'}
                              </td>

                              <td className="py-4 px-4 font-sans">
                                {isEditing ? (
                                  <input
                                    type="text"
                                    value={editCertificate}
                                    onChange={(e) => setEditCertificate(e.target.value)}
                                    className="w-full text-xs rounded border border-slate-200 py-1 px-1.5 outline-none focus:border-indigo-400 bg-white"
                                  />
                                ) : (
                                  <span className="text-slate-600 font-medium">{member.certificate || '비대상'}</span>
                                )}
                              </td>

                              <td className="py-4 px-4 text-center">
                                <div className="flex items-center justify-center gap-1.5">
                                  {isEditing ? (
                                    <button
                                      onClick={() => handleSaveMemberEdit(member.id)}
                                      className="rounded-lg bg-emerald-55 bg-emerald-50 hover:bg-emerald-100 border border-emerald-250 text-emerald-700 font-bold px-2 py-1 transition-colors cursor-pointer"
                                    >
                                      저장
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => {
                                        setEditingMemberId(member.id);
                                        setEditRole(member.role);
                                        setEditCertificate(member.certificate || '');
                                      }}
                                      className="rounded-lg p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 hover:text-indigo-650 transition-colors cursor-pointer border border-slate-200"
                                      title="회원권한 수정"
                                    >
                                      <Edit2 className="h-3.5 w-3.5" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleDeleteMember(member.id, member.name, member.role)}
                                    className="rounded-lg p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200"
                                    title="회원 삭제"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              /* Classroom Applications Board subview */
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden text-left animate-fade-in">
                <div className="p-5 border-b border-slate-150 bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-sm font-black text-slate-800 font-sans flex items-center gap-1.5">
                      📋 교육 수강신청 통합 접수 현황판
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-normal">
                      유선전화 및 이메일 전송과 함께 아래 목록에 실시간 동기 접수되어 표시되는 수강생 접수 목록입니다.
                    </p>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 font-sans text-xs">
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="신청인/소속/과정 검색"
                        value={appSearchTerm}
                        onChange={(e) => setAppSearchTerm(e.target.value)}
                        className="w-full sm:w-44 rounded-lg border border-slate-200 py-1.5 pr-2 pl-8 outline-none text-xs bg-white text-slate-700 focus:border-indigo-400 focus:bg-white"
                      />
                    </div>
                    
                    <select
                      value={appStatusFilter}
                      onChange={(e) => setAppStatusFilter(e.target.value)}
                      className="border border-slate-200 rounded-lg py-1.5 px-2 bg-white text-slate-705 text-slate-700 text-xs outline-none focus:border-indigo-400"
                    >
                      <option value="All">전체 상태 필터</option>
                      <option value="pending">대기 중 (Pending)</option>
                      <option value="approved">강사배정/상담 (Approved)</option>
                      <option value="completed">완료 (Completed)</option>
                    </select>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs font-sans">
                    <thead>
                      <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-black tracking-wider text-slate-400 uppercase">
                        <th className="py-3 px-4">신청 접수일시</th>
                        <th className="py-3 px-4">수강생명 / 소속기관</th>
                        <th className="py-3 px-4">체결 교육과정명</th>
                        <th className="py-3 px-4">수강예정인원</th>
                        <th className="py-3 px-4">상태 상태</th>
                        <th className="py-3 px-4 text-center">행정 제어</th>
                      </tr>
                    </thead>
                    
                    <tbody className="divide-y divide-slate-100">
                      {filteredApps.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-16 text-center text-slate-400">
                            접수한 수강 신청 내역이 아직 없거나 검색 매칭되는 항목이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredApps.map((app) => {
                          const isEditingApp = editingAppId === app.id;
                          return (
                            <tr key={app.id} className="hover:bg-slate-50/40 transition-colors">
                              
                              {/* Date Column */}
                              <td className="py-4 px-4 font-mono text-slate-400 text-[10px]">
                                {app.appliedAt || '일시 미확인'}
                              </td>

                              {/* Applicant Column */}
                              <td className="py-4 px-4">
                                {isEditingApp ? (
                                  <div className="space-y-1 max-w-[160px]">
                                    <input
                                      type="text"
                                      value={editAppName}
                                      onChange={(e) => setEditAppName(e.target.value)}
                                      className="w-full border border-slate-250 border-slate-200 rounded p-1 text-xs font-bold bg-white"
                                      placeholder="신청명"
                                    />
                                    <input
                                      type="text"
                                      value={editAppOrg}
                                      onChange={(e) => setEditAppOrg(e.target.value)}
                                      className="w-full border border-slate-250 border-slate-200 rounded p-1 text-[10px] bg-white"
                                      placeholder="소속기관"
                                    />
                                  </div>
                                ) : (
                                  <div>
                                    <span className="block font-black text-slate-800 text-sm">{app.applicantName}</span>
                                    <span className="block text-[10px] text-slate-500 mt-0.5">{app.organization}</span>
                                  </div>
                                )}
                              </td>

                              {/* Course Column */}
                              <td className="py-4 px-4">
                                <span className="font-bold text-slate-700">{app.courseTitle}</span>
                                <span className="block text-[10px] text-slate-400 mt-1 font-sans">
                                  희망 개시일: {app.preferredDate || '별도 상담'}
                                </span>
                              </td>

                              {/* Participants count column */}
                              <td className="py-4 px-4 font-semibold font-mono text-slate-700">
                                {isEditingApp ? (
                                  <input
                                    type="number"
                                    min={1}
                                    value={editAppCount}
                                    onChange={(e) => setEditAppCount(parseInt(e.target.value) || 1)}
                                    className="w-16 border border-slate-200 rounded p-1 text-xs font-mono font-bold text-center bg-white"
                                  />
                                ) : (
                                  <span>{app.participantsCount}명 규모</span>
                                )}
                              </td>

                              {/* Status badge Column */}
                              <td className="py-4 px-4">
                                {isEditingApp ? (
                                  <select
                                    value={editAppStatus}
                                    onChange={(e: any) => setEditAppStatus(e.target.value)}
                                    className="border border-slate-200 rounded py-1 px-1.5 focus:border-indigo-400 bg-white text-xs font-bold"
                                  >
                                    <option value="pending">대기 중</option>
                                    <option value="approved">상담/배정</option>
                                    <option value="completed">결산완료</option>
                                  </select>
                                ) : (
                                  <span className={`inline-block py-0.5 px-2 rounded-full font-bold text-[9px] ${
                                    app.status === 'completed'
                                      ? 'bg-indigo-50 border border-indigo-100 text-indigo-700'
                                      : app.status === 'approved'
                                        ? 'bg-emerald-55 bg-emerald-50 border border-emerald-100 text-emerald-700 font-extrabold animate-pulse'
                                        : 'bg-orange-50 border border-orange-100 text-orange-700'
                                  }`}>
                                    {app.status === 'completed' ? '🏁 교육 완료' : app.status === 'approved' ? '📞 강사배정 상담' : '🕒 검토 대기'}
                                  </span>
                                )}
                              </td>

                              {/* Application row Action buttons */}
                              <td className="py-4 px-4 text-center">
                                {isEditingApp ? (
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleSaveAppEdit(app.id)}
                                      className="rounded bg-emerald-600 font-extrabold hover:bg-emerald-505 bg-emerald-500 text-white px-2 py-1 transition-colors cursor-pointer text-[10px]"
                                    >
                                      완료
                                    </button>
                                    <button
                                      onClick={() => setEditingAppId(null)}
                                      className="rounded bg-slate-100 font-bold hover:bg-slate-200 text-slate-500 px-2 py-1 transition-colors cursor-pointer text-[10px]"
                                    >
                                      취소
                                    </button>
                                  </div>
                                ) : (
                                  <div className="flex items-center justify-center gap-1.5">
                                    {/* Inspector trigger button */}
                                    <button
                                      onClick={() => setViewingApp(app)}
                                      className="rounded-lg p-1.5 bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600 border border-slate-200 text-slate-400 transition-colors cursor-pointer"
                                      title="신청 세부내용 확인"
                                    >
                                      <Eye className="h-3 w-3" />
                                    </button>

                                    {/* Edit button */}
                                    <button
                                      onClick={() => {
                                        setEditingAppId(app.id);
                                        setEditAppName(app.applicantName);
                                        setEditAppOrg(app.organization || '개인');
                                        setEditAppContact(app.contact);
                                        setEditAppEmail(app.email);
                                        setEditAppCount(app.participantsCount);
                                        setEditAppStatus(app.status);
                                      }}
                                      className="rounded-lg p-1.5 bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-slate-200"
                                      title="신청서 내용 수정"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </button>

                                    {/* Delete Button */}
                                    <button
                                      onClick={() => handleDeleteApp(app.id, app.applicantName)}
                                      className="rounded-lg p-1.5 bg-slate-50 hover:bg-rose-50 text-slate-405 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200"
                                      title="신청 내역 삭제"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </button>
                                  </div>
                                )}
                              </td>

                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900 leading-relaxed font-sans shadow-3xs text-left">
              <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <strong>⚠️ 실무 보안 교육 유의사항:</strong> 가입된 회원의 사후 통제 시 개인정보 보호법 준수를 요합니다. 자격증 및 등급 임의 승격 시 해당 강사가 강사 전용 사랑방 아고라 및 공식 자료 다운로드 통제망에 즉시 등급 연대됨을 항상 인지해 주시기 바랍니다.
              </div>
            </div>

          </div>

          {/* Admin adjustments panel (Col 4) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            <div className="bg-white rounded-3xl border border-slate-100 shadow-xs p-6 relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-650" />
              
              <h3 className="text-xs font-black text-slate-400 tracking-wider mb-4 uppercase font-sans flex items-center gap-1.5 font-bold">
                <Settings className="h-4 w-4 text-slate-500" />
                대표 관리자 계정 변경 (admin)
              </h3>

              {adminUpdateSuccess && (
                <div className="mb-4 p-3 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-850 font-sans text-xs flex items-center gap-1.5 animate-fade-in">
                  <CheckCircle className="h-4.5 w-4.5 text-indigo-500" />
                  대표관리자 접속 권한이 완전 정상 업데이트 되었습니다!
                </div>
              )}

              {adminUpdateError && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-850 font-sans text-xs flex items-center gap-1.5 animate-fade-in">
                  <AlertCircle className="h-4.5 w-4.5 text-rose-500" />
                  {adminUpdateError}
                </div>
              )}

              <form onSubmit={handleUpdateAdminCredentials} className="space-y-4 font-sans text-xs">
                
                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 font-bold">최고관리자 성명 *</label>
                  <input
                    type="text"
                    required
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 outline-none focus:border-indigo-400 focus:bg-white text-slate-705 text-slate-700 transition-colors font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 font-bold">대표관리자 ID / 이메일 *</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 outline-none focus:border-indigo-400 focus:bg-white text-slate-700 transition-colors font-mono font-bold"
                    />
                  </div>
                  <span className="block text-[9px] text-slate-400 mt-1">※ 최초 기본 ID는 'admin' 입니다. 수정 시 수정된 ID로 재로그인 하셔야 합니다.</span>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-1 font-bold">접속 비밀번호 *</label>
                  <div className="relative">
                    <Key className="absolute right-3 top-3.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="password"
                      required
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 outline-none focus:border-indigo-400 focus:bg-white text-slate-700 transition-colors font-mono"
                    />
                  </div>
                  <span className="block text-[9px] text-slate-400 mt-1">※ 최초 비밀번호는 'admin' 입니다.</span>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-505 bg-indigo-500 text-white font-bold py-2.5 shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-95 transition-all text-xs"
                  >
                    <Save className="h-4 w-4" />
                    관리자 기밀권한 즉시 업데이트
                  </button>
                </div>

              </form>
            </div>

            {/* Quick explanation guide card */}
            <div className="bg-indigo-900 text-white p-6 rounded-3xl space-y-3 font-sans shadow-md">
              <h4 className="text-sm font-black flex items-center gap-1.5 border-b border-white/10 pb-2">
                📂 모의 데이터베이스 구조안내
              </h4>
              <p className="text-[11px] text-indigo-200 leading-relaxed">
                본 웹페이지는 <strong>장애인 평생학습 강사 협회</strong>의 시연용 데이터 연속 보장을 위하여, 가입 회원 목록 및 임직원 권한, 수강신청 접수 현황을 브라우저 내 독립된 `localStorage` 기반으로 영구 통제하고 있습니다. 브라우저를 종료하거나 새로고침을 해도 수강 신청서 접수 목록이 완벽하게 동기 유지됩니다!
              </p>
              <div className="text-[10px] bg-white/5 p-2.5 rounded-xl border border-white/5">
                <span className="block text-indigo-300 font-bold">💡 실시간 동기화 상태:</span>
                교육신청 탭에서 접수되는 즉시 협회 전임 강사단과 주명훈 대표가 확인하고 연락 절차를 개시할 수 있습니다.
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Classroom Application Detailed Modal Inspector (확인) */}
      {viewingApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs text-left animate-fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-3xl border border-slate-100 shadow-2xl p-6 md:p-8">
            <button
              onClick={() => setViewingApp(null)}
              className="absolute top-5 right-5 text-slate-405 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <h3 className="text-lg font-black text-slate-800 border-b border-slate-100 pb-3.5 mb-5 flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600" />
              <span>신청서 상세 내역 확인 검토</span>
            </h3>

            <div className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-50">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase">신청 대리인 성명</span>
                  <p className="text-sm font-extrabold text-slate-800 mt-1">{viewingApp.applicantName}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400">소속 기관명</span>
                  <p className="text-sm font-bold text-slate-800 mt-1">{viewingApp.organization || '(개인)'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-50">
                <div>
                  <span className="block text-[10px] font-black text-slate-400">긴급 무선전화</span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">{viewingApp.contact}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400">안내 이메일</span>
                  <p className="text-sm font-mono text-slate-800 mt-1">{viewingApp.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 pb-3 border-b border-slate-50">
                <div>
                  <span className="block text-[10px] font-black text-slate-400">희망 장애 교육 프로그램</span>
                  <p className="text-sm font-black text-indigo-700 mt-1">🏷️ {viewingApp.courseTitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-3 border-b border-slate-50">
                <div>
                  <span className="block text-[10px] font-black text-slate-400">희망 수업 개설 개시일</span>
                  <p className="text-sm font-black text-slate-800 mt-1">{viewingApp.preferredDate || '(협회 통신망 별도 일정 확정)'}</p>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400">참정 예상 규모</span>
                  <p className="text-sm font-mono font-bold text-slate-800 mt-1">{viewingApp.participantsCount}명 기준 구성</p>
                </div>
              </div>

              <div>
                <span className="block text-[10px] font-black text-slate-450 text-slate-400 mb-1">💡 장애 유형 / 특이 돌봄 요구조건 및 상세 희망서</span>
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-slate-655 text-slate-700 leading-relaxed max-h-[120px] overflow-y-auto whitespace-pre-wrap font-sans">
                  {viewingApp.specialRequests || '등록해 주신 수강생의 구체적인 돌봄 유형이나 특이 희망사항 요강이 없습니다. 상담 전화를 통해 상세 보정 파악할 예정입니다.'}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                <div>
                  <span className="block text-[9px] text-slate-400 font-mono">신청 등록 서버 수취 일시: {viewingApp.appliedAt}</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingAppId(viewingApp.id);
                      setEditAppName(viewingApp.applicantName);
                      setEditAppOrg(viewingApp.organization);
                      setEditAppContact(viewingApp.contact);
                      setEditAppEmail(viewingApp.email);
                      setEditAppCount(viewingApp.participantsCount);
                      setEditAppStatus(viewingApp.status);
                      setViewingApp(null);
                    }}
                    className="px-4 py-1.5 border border-slate-205 border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 text-xs font-bold cursor-pointer transition-colors flex items-center gap-1 text-[11px]"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    수정하기
                  </button>
                  <button
                    onClick={() => setViewingApp(null)}
                    className="px-5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold cursor-pointer font-sans"
                  >
                    확인 완료
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
