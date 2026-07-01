import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  deleteUser, 
  signOut,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  collection, 
  getDocs 
} from 'firebase/firestore';

// Firebase Config values retrieved from firebase-applet-config.json
const firebaseConfig = {
  apiKey: "AIzaSyC-abVlm29DlNXmR-dzh3h6nATB4RO5wcc",
  authDomain: "festive-basis-ldpgw.firebaseapp.com",
  projectId: "festive-basis-ldpgw",
  storageBucket: "festive-basis-ldpgw.firebasestorage.app",
  messagingSenderId: "230367417648",
  appId: "1:230367417648:web:d91ef08df3db52139924f5"
};

// Resilient Initialization
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);

// Member Interface
export interface RealUser {
  uid: string;
  email: string;
  name: string;
  birthDate: string;
  role: '일반회원' | '강사' | '관리자' | '부관리자';
  certificate: string;
  photo?: string;
  signUpDate: string;
}

/**
 * 회원 가입 (Sign Up)
 * Firebase Auth 계정 생성 후 Firestore의 'users' 컬렉션에 부가 정보 저장
 */
export async function signUp(params: {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  role: '일반회원' | '강사' | '관리자' | '부관리자';
  certificate: string;
  photo?: string;
}): Promise<RealUser> {
  const { email, password, name, birthDate, role, certificate, photo } = params;

  try {
    // 1. Auth 사용자 생성
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Auth Profile Display Name 설정
    await updateProfile(user, { displayName: name });

    const signUpDate = new Date().toISOString().split('T')[0];
    const userData: RealUser = {
      uid: user.uid,
      email,
      name,
      birthDate,
      role,
      certificate,
      photo,
      signUpDate,
    };

    // 3. Firestore에 부가 회원정보 저장
    await setDoc(doc(db, 'users', user.uid), userData);

    // 4. 로컬 회원 동기화 (기존 localStorage 호환성 대비 추가)
    syncLocalMemberDb(userData);

    return userData;
  } catch (error: any) {
    console.error('Firebase SignUp Error:', error);
    throw new Error(translateFirebaseError(error.code) || error.message);
  }
}

/**
 * 로그인 (Login)
 * Firebase Auth 로그인 인증 후 Firestore에서 해당 사용자의 상세 권한/부대정보 조회
 */
export async function login(email: string, password: string): Promise<RealUser> {
  // admin 계정 등 특수 시뮬레이션 호환성을 위한 처리
  if (email.toLowerCase() === 'admin' && password === 'admin') {
    return {
      uid: 'mem_admin',
      email: 'admin',
      name: '대표관리자 주명훈',
      birthDate: '1981-12-05',
      role: '관리자',
      certificate: '사회복지사 1급, 평생교육사 1급',
      signUpDate: '2026-06-01',
    };
  }

  try {
    // 1. Auth 로그인 검증
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Firestore에서 상세 권한 정보 읽기
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    if (userDocSnap.exists()) {
      const userData = userDocSnap.data() as RealUser;
      syncLocalMemberDb(userData);
      return userData;
    } else {
      // 만약 정보가 유실되었을 경우의 대비 기본 유저 반환
      const fallbackUser: RealUser = {
        uid: user.uid,
        email: user.email || email,
        name: user.displayName || '회원',
        birthDate: '',
        role: '일반회원',
        certificate: '',
        signUpDate: new Date().toISOString().split('T')[0],
      };
      await setDoc(doc(db, 'users', user.uid), fallbackUser);
      return fallbackUser;
    }
  } catch (error: any) {
    console.error('Firebase Login Error:', error);
    throw new Error(translateFirebaseError(error.code) || error.message);
  }
}

/**
 * 회원 탈퇴 및 계정 삭제 (Delete Account)
 * Firestore 사용자 DB 문서 삭제 및 Firebase Auth 사용자 영구 삭제 수행
 */
export async function deleteAccount(uid: string): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('인증되지 않은 사용자입니다. 로그인 후 다시 실행해 하세요.');
  }

  try {
    // 1. Firestore 정보 삭제
    await deleteDoc(doc(db, 'users', uid));

    // 2. Auth 삭제
    await deleteUser(currentUser);

    // 3. 로컬 DB에서 삭제
    removeLocalMember(uid);
  } catch (error: any) {
    console.error('Firebase Delete Account Error:', error);
    throw new Error(error.message);
  }
}

/**
 * 로그아웃
 */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/**
 * Firestore의 전체 사용자 목록 조회 (관리용)
 */
export async function getAllUsers(): Promise<RealUser[]> {
  try {
    const querySnapshot = await getDocs(collection(db, 'users'));
    const usersList: RealUser[] = [];
    querySnapshot.forEach((doc) => {
      usersList.push({ uid: doc.id, ...doc.data() } as RealUser);
    });
    return usersList;
  } catch (error) {
    console.error('Error fetching all users from Firestore:', error);
    return [];
  }
}

// ============ 로컬 스토리지 호환용 동기화 헬퍼 함수 ============

function syncLocalMemberDb(user: RealUser) {
  try {
    const localDbStr = localStorage.getItem('gonggam_members_db');
    let localDb: any[] = localDbStr ? JSON.parse(localDbStr) : [];
    
    // 중복 확인 후 갱신 또는 삽입
    const index = localDb.findIndex((m: any) => m.email.toLowerCase() === user.email.toLowerCase() || m.id === user.uid);
    const mappedMember = {
      id: user.uid,
      email: user.email,
      password: 'encrypted-in-firebase', // 보안처리
      name: user.name,
      birthDate: user.birthDate,
      role: user.role,
      certificate: user.certificate,
      photo: user.photo,
      signUpDate: user.signUpDate
    };

    if (index >= 0) {
      localDb[index] = mappedMember;
    } else {
      localDb.push(mappedMember);
    }
    localStorage.setItem('gonggam_members_db', JSON.stringify(localDb));
  } catch (e) {
    console.error('Local synchronization failed', e);
  }
}

function removeLocalMember(uid: string) {
  try {
    const localDbStr = localStorage.getItem('gonggam_members_db');
    if (localDbStr) {
      let localDb: any[] = JSON.parse(localDbStr);
      localDb = localDb.filter((m: any) => m.id !== uid);
      localStorage.setItem('gonggam_members_db', JSON.stringify(localDb));
    }
  } catch (e) {
    console.error('Local member removal sync failed', e);
  }
}

/**
 * 주요 파이어베이스 오류 코드 번역 및 안내화
 */
function translateFirebaseError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':
      return '이미 가입된 이메일 주소입니다.';
    case 'auth/invalid-email':
      return '올바르지 않은 이메일 형식입니다.';
    case 'auth/weak-password':
      return '보안에 취약한 비밀번호입니다. (6자리 이상 권장)';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return '아이디(이메일) 또는 비밀번호가 잘못되었습니다.';
    case 'auth/too-many-requests':
      return '비정상적인 로그인 시도가 많아 잠시 차단되었습니다. 나중에 다시 시도해 주세요.';
    default:
      return '';
  }
}
