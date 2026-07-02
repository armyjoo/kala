import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  deleteUser 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy 
} from 'firebase/firestore';

// 제공해주신 실제 Firebase 설정 값 연동
const firebaseConfig = {
  apiKey: "AIzaSyC-abVlm29DlNXmR-dzh3h6nATB4RO5wcc",
  authDomain: "festive-basis-ldpgw.firebaseapp.com",
  projectId: "festive-basis-ldpgw",
  storageBucket: "festive-basis-ldpgw.firebasestorage.app",
  messagingSenderId: "230367417648",
  appId: "1:230367417648:web:d91ef08df3db52139924f5"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// 로그인 함수
export const login = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;
  const userDoc = await getDoc(doc(db, 'users', user.uid));
  if (userDoc.exists()) {
    return userDoc.data();
  }
  return null;
};

// 회원가입 함수
export const signUp = async (email: string, password: string, name: string, role: '일반회원' | '강사' = '일반회원') => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const user = userCredential.user;

  const userData = {
    uid: user.uid,
    email: email,
    name: name,
    role: role,
    signUpDate: new Date().toISOString().split('T')[0],
    birthDate: '',
    certificate: ''
  };

  await setDoc(doc(db, 'users', user.uid), userData);
  return userData;
};

// 로그아웃 함수
export const logOut = async () => {
  await signOut(auth);
};

// 회원 탈퇴 함수
export const deleteAccount = async (uid: string) => {
  const currentUser = auth.currentUser;
  if (currentUser && currentUser.uid === uid) {
    await deleteUser(currentUser);
  }
};

// 교육 신청 내역 저장 함수
export const submitApplication = async (applicationData: any) => {
  const docRef = await addDoc(collection(db, 'applications'), {
    ...applicationData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// 게시글 작성 함수
export const createLoungePost = async (postData: { title: string; content: string; author: string; authorRole: string }) => {
  const docRef = await addDoc(collection(db, 'lounge'), {
    ...postData,
    createdAt: new Date().toISOString()
  });
  return docRef.id;
};

// 게시글 목록 조회 함수
export const getLoungePosts = async () => {
  const loungeQuery = query(collection(db, 'lounge'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(loungeQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 공지사항 목록 조회 함수
export const getNoticePosts = async () => {
  const noticeQuery = query(collection(db, 'notice'), orderBy('createdAt', 'desc'));
  const querySnapshot = await getDocs(noticeQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

// 전체 회원 목록 조회 함수 (관리자 페이지 연동용)
export const getAllUsers = async () => {
  const usersQuery = query(collection(db, 'users'));
  const querySnapshot = await getDocs(usersQuery);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

import { collection, getDocs, query, orderBy } from 'firebase/firestore';
// db 초기화 코드가 윗부분에 이미 존재할 것입니다. (const db = getFirestore(app); 등)

// ... 기존 코드들 ...

/**
 * 전체 유저 목록을 가져오는 함수
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    // 필요한 경우 가입일순(signUpUpdate) 등으로 정렬할 수 있습니다.
    const q = query(usersRef, orderBy('signUpUpdate', 'desc')); 
    const querySnapshot = await getDocs(q);
    
    const users = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return users;
  } catch (error) {
    console.error("유저 목록을 가져오는 중 오류 발생:", error);
    throw error;
  }
};
