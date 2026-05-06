"use client";

import { useEffect, useState } from "react";
import { collection, query, where, getDocs, orderBy, doc, updateDoc, increment } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { use } from "react";

interface LinkItem {
  linkId: string;
  title: string;
  url: string;
  createdAt: string;
  clickCount: number;
}

export default function ProfileViewer({
  params,
}: {
  params: Promise<{ displayName: string }>;
}) {
  const unwrappedParams = use(params);
  const [decodedName, setDecodedName] = useState<string>("");

  useEffect(() => {
    if (unwrappedParams.displayName) {
      const name = decodeURIComponent(unwrappedParams.displayName).replace(/^@/, '');
      setDecodedName(name);
    }
  }, [unwrappedParams.displayName]);

  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useQuery({
    queryKey: ['public-user', decodedName],
    queryFn: async () => {
      if (!decodedName) return null;
      const q = query(collection(db, "users"), where("nickname", "==", decodedName));
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        throw new Error("User not found");
      }
      const docData = snapshot.docs[0];
      return {
        uid: docData.id,
        ...(docData.data() as { nickname: string; bio: string; email: string }),
      };
    },
    enabled: !!decodedName,
    retry: false, // Don't retry if user is not found, fail fast to 404
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['public-links', userData?.uid],
    queryFn: async () => {
      if (!userData?.uid) return [];
      const q = query(collection(db, "users", userData.uid, "links"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as LinkItem);
    },
    enabled: !!userData?.uid,
  });

  const handleLinkClick = async (linkId: string) => {
    if (!userData?.uid) return;
    try {
      const linkRef = doc(db, "users", userData.uid, "links", linkId);
      await updateDoc(linkRef, {
        clickCount: increment(1)
      });
    } catch (error) {
      console.error("Error updating click count:", error);
    }
  };

  // Loading state
  if (isUserLoading || !decodedName || (isUserLoading === false && isLinksLoading && userData)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  // 404 State
  if (isUserError || !userData) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center py-6 px-4 bg-slate-50 dark:bg-slate-950 text-center">
        <h1 className="text-4xl font-black text-slate-800 dark:text-slate-200 mb-4">404</h1>
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">해당 프로필을 찾을 수 없습니다.</p>
        <Button 
          variant="default" 
          className="bg-indigo-500 hover:bg-indigo-600 cursor-pointer"
          onClick={() => window.location.href = '/'}
        >
          My Link 만들기
        </Button>
      </main>
    );
  }

  // Viewer State
  return (
    <main className="relative flex min-h-screen flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
      
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="absolute top-1/4 h-96 w-96 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-indigo-900 dark:mix-blend-screen dark:opacity-20 animate-pulse transition-all duration-1000"></div>
      </div>

      <div className="z-10 flex w-full max-w-md flex-col items-center gap-10">
        
        {/* Profile Card */}
        <section className="flex flex-col items-center text-center gap-5 w-full">
          <div className="flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-4xl font-black uppercase tracking-tighter ring-4 ring-white dark:ring-slate-900">
            {userData.nickname.charAt(0).toUpperCase()}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              @{userData.nickname}
            </h1>
            <p className="text-base font-medium text-slate-600 dark:text-slate-400">
              {userData.bio}
            </p>
          </div>
        </section>

        {/* Links List */}
        <section className="w-full flex flex-col gap-4">
          {links.length > 0 ? (
            links.map((link) => (
              <a 
                key={link.linkId} 
                href={link.url}
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={() => handleLinkClick(link.linkId)}
                className="group relative flex w-full items-center justify-between overflow-hidden rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200 transition-all hover:shadow-md hover:ring-indigo-300 dark:bg-slate-900 dark:ring-slate-800 dark:hover:ring-indigo-700 hover:-translate-y-1"
              >
                <div className="absolute inset-x-0 bottom-0 h-1 origin-left scale-x-0 transform bg-gradient-to-r from-indigo-500 to-cyan-400 transition-transform duration-300 group-hover:scale-x-100"></div>
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={`http://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`} 
                      alt="" 
                      className="h-5 w-5" 
                      onError={(e) => { e.currentTarget.style.display = 'none'; }} 
                    />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{link.title}</span>
                  </div>
                </div>
              </a>
            ))
          ) : (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400">
              추가된 링크가 없습니다.
            </div>
          )}
        </section>

        <footer className="mt-10 py-6 text-center text-sm text-slate-400 dark:text-slate-500 font-medium tracking-wide">
          <a href="/" className="hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Made with My Link
          </a>
        </footer>
      </div>
    </main>
  );
}
