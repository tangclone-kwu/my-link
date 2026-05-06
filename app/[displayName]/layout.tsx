import type { Metadata } from 'next';
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ displayName: string }>;
}): Promise<Metadata> {
  const { displayName } = await params;
  const decodedName = decodeURIComponent(displayName).replace(/^@/, '');

  try {
    const q = query(collection(db, "users"), where("nickname", "==", decodedName));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return {
        title: 'User Not Found',
        description: '해당 프로필을 찾을 수 없습니다.',
      };
    }

    const userData = snapshot.docs[0].data();
    return {
      title: `@${userData.nickname}`,
      description: userData.bio || `${userData.nickname}님의 모든 링크를 한 곳에서 확인하세요.`,
    };
  } catch (error) {
    return {
      title: `@${decodedName}`,
      description: '나의 모든 것을 담은 페이지',
    };
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
