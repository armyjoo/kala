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

/**
 * 전체 회원 목록 조회 함수 (관리자 페이지 연동용)
 * 에러 방지를 위해 가입일순 정렬(orderBy)과 안전하게 데이터를 가져오기 위한 try-catch 문을 조합했습니다.
 */
export const getAllUsers = async () => {
  try {
    const usersRef = collection(db, 'users');
    // 회원 정보를 가입일(signUpDate) 기준으로 내림차순 정렬하여 가져옵니다.
    const q = query(usersRef, orderBy('signUpDate', 'desc')); 
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  } catch (error) {
    console.error("전체 유저 목록을 가져오는 중 오류 발생:", error);
    // 만약 데이터베이스의 기존 데이터 필드명 차이로 정렬(orderBy) 오류가 난다면, 
    // 아래 주석 처리된 일반 query 코드로 변경해서 시도해 보세요.
    // const q = query(collection(db, 'users'));
    // const querySnapshot = await getDocs(q);
    // return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    throw error;
  }
};
