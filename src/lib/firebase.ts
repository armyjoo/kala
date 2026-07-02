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
