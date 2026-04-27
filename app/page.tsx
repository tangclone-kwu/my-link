"use client";

import { useState, useEffect } from "react";
import { collection, doc, setDoc, updateDoc, deleteDoc, getDoc, query, orderBy, getDocs, where } from "firebase/firestore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useTheme } from "next-themes"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Link2, LogOut, Moon, Settings, Sun } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DUMMY_PROFILE, LinkItem } from "@/data/links"

const formSchema = z.object({
  title: z.string().optional(),
  url: z.string().min(1, { message: "URL을 입력해주세요." }).refine(val => {
    const urlToCheck = val.startsWith('http') ? val : `https://${val}`;
    try {
      new URL(urlToCheck);
      return urlToCheck.includes('.');
    } catch {
      return false;
    }
  }, { message: "올바른 도메인/URL 형식이 아닙니다. (예: example.com)" })
})

export default function Page() {
  const [isOpen, setIsOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkItem | null>(null);
  const [deletingLink, setDeletingLink] = useState<LinkItem | null>(null);
  
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [editingField, setEditingField] = useState<'nickname' | 'bio' | null>(null);
  const [editValue, setEditValue] = useState("");

  const { resolvedTheme, setTheme } = useTheme();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['profile', user?.uid],
    queryFn: async () => {
      if (!user) return null;
      const profileRef = doc(db, "users", user.uid);
      const docSnapshot = await getDoc(profileRef);
      if (!docSnapshot.exists()) {
        const defaultNickname = user.email ? user.email.split('@')[0] : (user.displayName || DUMMY_PROFILE.nickname);
        const newProfile = {
          uid: user.uid,
          nickname: defaultNickname,
          bio: DUMMY_PROFILE.bio,
          email: user.email || "",
          updatedAt: new Date().toISOString()
        };
        await setDoc(profileRef, newProfile);
        return newProfile;
      }
      return docSnapshot.data() as { nickname: string; bio: string };
    },
    enabled: !!user,
  });

  const { data: links = [], isLoading: isLinksLoading } = useQuery({
    queryKey: ['links', user?.uid],
    queryFn: async () => {
      if (!user) return [];
      const q = query(
        collection(db, "users", user.uid, "links"),
        orderBy("createdAt", "desc")
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => doc.data() as LinkItem);
    },
    enabled: !!user,
  });

  const currentNickname = profile?.nickname || (user?.email ? user.email.split('@')[0] : (user?.displayName || DUMMY_PROFILE.nickname));

  useEffect(() => {
    if (!isOpen) form.reset();
  }, [isOpen, form]);

  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { title: "", url: "" },
  });

  useEffect(() => {
    if (editingLink) editForm.reset({ title: editingLink.title, url: editingLink.url });
  }, [editingLink, editForm]);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login error:", error);
      alert("로그인 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfileMutation = useMutation({
    mutationFn: async ({ field, value }: { field: 'nickname' | 'bio'; value: string }) => {
      if (!user) throw new Error("유저 정보가 없습니다.");
      const trimmedValue = value.trim();

      if (field === 'nickname') {
        if (trimmedValue === '') throw new Error('닉네임을 입력해주세요.');
        const q = query(collection(db, "users"), where("nickname", "==", trimmedValue));
        const snapshot = await getDocs(q);
        const duplicate = snapshot.docs.find(d => d.id !== user.uid);
        if (duplicate) throw new Error('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요!');
      }

      await updateDoc(doc(db, "users", user.uid), {
        [field]: trimmedValue,
        updatedAt: new Date().toISOString()
      });
      return trimmedValue;
    },
    onMutate: async ({ field, value }) => {
      setEditingField(null);
      const trimmedValue = value.trim();
      
      await queryClient.cancelQueries({ queryKey: ['profile', user?.uid] });

      const previousProfile = queryClient.getQueryData<{ nickname: string, bio: string }>(['profile', user?.uid]);

      if (previousProfile) {
        queryClient.setQueryData(['profile', user?.uid], {
          ...previousProfile,
          [field]: trimmedValue,
        });
      }

      return { previousProfile };
    },
    onError: (error: any, variables, context) => {
      console.error("Error updating profile:", error);
      alert(error.message || "프로필 수정 중 오류가 발생했습니다.");
      
      if (context?.previousProfile) {
        queryClient.setQueryData(['profile', user?.uid], context.previousProfile);
      }
      setEditingField(variables.field);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.uid] });
    }
  });

  const handleProfileUpdate = () => {
    if (!profile || !editingField) return;
    const trimmedValue = editValue.trim();
    if (trimmedValue === profile[editingField]) {
      setEditingField(null);
      return;
    }
    updateProfileMutation.mutate({ field: editingField, value: editValue });
  };

  const deleteLinkMutation = useMutation({
    mutationFn: async (linkId: string) => {
      if (!user) throw new Error("유저 정보가 없습니다.");
      await deleteDoc(doc(db, "users", user.uid, "links", linkId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      setDeletingLink(null);
    },
    onError: (error) => {
      console.error("Error deleting link: ", error);
      alert("링크 삭제 중 오류가 발생했습니다.");
    }
  });

  const handleDelete = () => {
    if (!deletingLink) return;
    deleteLinkMutation.mutate(deletingLink.linkId);
  };

  const editLinkMutation = useMutation({
    mutationFn: async ({ linkId, values }: { linkId: string; values: z.infer<typeof formSchema> }) => {
      if (!user) throw new Error("유저 정보가 없습니다.");
      const formattedUrl = values.url.startsWith('http') ? values.url : `https://${values.url}`;
      await updateDoc(doc(db, "users", user.uid, "links", linkId), {
        title: (values.title || "").trim() || formattedUrl.replace(/^https?:\/\/(www\.)?/, ''),
        url: formattedUrl,
        updatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      setEditingLink(null);
    },
    onError: (error) => {
      console.error("Error editing link: ", error);
      alert("링크 수정 중 오류가 발생했습니다.");
    }
  });

  const onEditSubmit = (values: z.infer<typeof formSchema>) => {
    if (!editingLink) return;
    editLinkMutation.mutate({ linkId: editingLink.linkId, values });
  };

  const addLinkMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      if (!user) throw new Error("유저 정보가 없습니다.");
      const formattedUrl = values.url.startsWith('http') ? values.url : `https://${values.url}`;
      const newLinkId = `link_${Date.now()}`;
      const newLink: LinkItem = {
        linkId: newLinkId,
        title: (values.title || "").trim() || formattedUrl.replace(/^https?:\/\/(www\.)?/, ''),
        url: formattedUrl,
        createdAt: new Date().toISOString(),
        clickCount: 0,
      };
      await setDoc(doc(collection(db, "users", user.uid, "links"), newLinkId), newLink);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['links', user?.uid] });
      setIsOpen(false);
    },
    onError: (error) => {
      console.error("Error adding link: ", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    }
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    addLinkMutation.mutate(values);
  };

  const isSubmitting = updateProfileMutation.isPending || deleteLinkMutation.isPending || editLinkMutation.isPending || addLinkMutation.isPending;
  const isInitialLoading = isProfileLoading || isLinksLoading;

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) {
    return (
      <main className="relative flex min-h-screen flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <header className="w-full max-w-5xl flex items-center justify-start py-4 mb-10 md:mb-20 z-10">
          <div className="flex items-center gap-2 select-none">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xl shadow-md">M</div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Link</span>
          </div>
        </header>

        <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
          <div className="absolute top-1/4 h-96 w-96 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-indigo-900 dark:mix-blend-screen dark:opacity-20 animate-pulse transition-all duration-1000"></div>
          <div className="absolute top-1/3 right-1/4 h-80 w-80 rounded-full bg-cyan-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-cyan-900 dark:mix-blend-screen dark:opacity-20 animate-pulse delay-75 transition-all duration-1000"></div>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center w-full max-w-md gap-10 z-10 pb-20">
          <div className="text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              나만의 모든 링크,<br />단 하나의 주소로.
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              여러 곳에 흩어져 있는 내 정보를 한 곳에 모아보세요.<br className="hidden sm:inline" />
              지금 시작하시면 바로 사용할 수 있습니다.
            </p>
          </div>

          <button
            onClick={handleLogin}
            className="group relative flex h-14 w-full max-w-sm items-center justify-center gap-3 rounded-2xl bg-white shadow-xl shadow-indigo-200/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-indigo-300/50 dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800 dark:hover:bg-slate-800 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-150"
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 opacity-0 transition-opacity duration-300 group-hover:opacity-10 dark:from-indigo-500 dark:to-cyan-400 dark:group-hover:opacity-20"></div>
            <svg className="h-6 w-6 relative z-10" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span className="text-lg font-semibold text-slate-700 dark:text-slate-200 relative z-10">Google로 시작하기</span>
          </button>
        </div>

        <footer className="mt-auto pt-16 pb-4 text-center text-sm font-semibold tracking-tight text-slate-400 dark:text-slate-500 z-10">
          © {new Date().getFullYear()} My Link. All rights reserved.
        </footer>
      </main>
    );
  }

  return (
    <main className="relative flex min-h-screen flex-col items-center py-6 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
      
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="absolute -top-32 h-64 w-64 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-indigo-900 dark:mix-blend-screen dark:opacity-20 animate-pulse transition-all duration-1000"></div>
        <div className="absolute top-32 right-1/4 h-72 w-72 rounded-full bg-cyan-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-cyan-900 dark:mix-blend-screen dark:opacity-20 animate-pulse delay-75 transition-all duration-1000"></div>
      </div>

      <header className="w-full max-w-md flex items-center justify-between py-2 mb-6 z-10">
        <div className="flex items-center gap-2 select-none">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xl shadow-md">M</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">My Link</span>
        </div>
        
        {/* Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger className="rounded-full ring-2 ring-indigo-100 dark:ring-indigo-900/50 hover:opacity-80 transition-opacity focus:outline-none focus-visible:ring-indigo-500 flex items-center justify-center bg-transparent cursor-pointer">
            <Avatar className="h-10 w-10">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt="Profile" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white font-bold">
                {(user.email ? user.email.split('@')[0] : (user.displayName || DUMMY_PROFILE.nickname)).charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 mt-2 rounded-xl border-slate-200 shadow-xl dark:border-slate-800">
            <DropdownMenuLabel className="font-normal py-3 px-3">
              <div className="flex flex-col space-y-1.5">
                <p className="text-sm font-semibold leading-none truncate text-slate-900 dark:text-slate-100">
                  {user.displayName || DUMMY_PROFILE.nickname}
                </p>
                <p className="text-xs leading-none text-slate-500 dark:text-slate-400 truncate">
                  {user.email || "이메일 정보 없음"}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem 
              onClick={() => {
                const profileUrl = `${window.location.origin}/@${currentNickname}`;
                navigator.clipboard.writeText(profileUrl);
                alert('내 프로필 링크가 클립보드에 복사되었습니다!');
              }}
              className="cursor-pointer py-2 px-3 text-sm focus:bg-slate-100 dark:focus:bg-slate-800"
            >
              <Link2 className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>프로필 링크 복사</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => {
                window.open(`/@${currentNickname}`, '_blank');
              }}
              className="cursor-pointer py-2 px-3 text-sm focus:bg-slate-100 dark:focus:bg-slate-800"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" x2="21" y1="14" y2="3"/></svg>
              <span>내 프로필 방문</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => alert("현재 프로필 설정 편집 기능은 준비 중입니다.")}
              className="cursor-pointer py-2 px-3 text-sm focus:bg-slate-100 dark:focus:bg-slate-800"
            >
              <Settings className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>프로필 설정 편집</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="cursor-pointer py-2 px-3 text-sm focus:bg-slate-100 dark:focus:bg-slate-800"
            >
              {resolvedTheme === "dark" ? (
                <Sun className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              ) : (
                <Moon className="mr-3 h-4 w-4 text-slate-500 dark:text-slate-400" />
              )}
              <span>{resolvedTheme === "dark" ? "라이트 모드" : "다크 모드"}</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-slate-100 dark:bg-slate-800" />
            <DropdownMenuItem 
              onClick={handleLogout} 
              className="text-red-500 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/50 cursor-pointer font-medium py-2 px-3 text-sm"
            >
              <LogOut className="mr-3 h-4 w-4" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="z-10 flex w-full max-w-md flex-col items-center gap-10">
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-5 w-full">
          <div className="group relative flex h-24 w-24 items-center justify-center rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-4xl font-black uppercase tracking-tighter ring-4 ring-white dark:ring-slate-900">
            {user.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.photoURL} alt="Profile" className="h-full w-full object-cover" />
            ) : (
              currentNickname.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-2 relative w-full items-center">
            {editingField === 'nickname' ? (
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleProfileUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProfileUpdate();
                  if (e.key === 'Escape') setEditingField(null);
                }}
                className="text-2xl font-bold text-center max-w-[200px] h-10 border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-slate-900"
              />
            ) : (
              <h1 
                className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md px-2 py-1 transition-colors group flex items-center justify-center gap-1"
                onClick={() => {
                  setEditValue(currentNickname);
                  setEditingField('nickname');
                }}
                title="닉네임 수정"
              >
                @{currentNickname}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-50 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </h1>
            )}

            {editingField === 'bio' ? (
              <Input
                autoFocus
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onBlur={handleProfileUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleProfileUpdate();
                  if (e.key === 'Escape') setEditingField(null);
                }}
                className="text-base font-medium text-center max-w-[300px] h-8 border-indigo-200 focus-visible:ring-indigo-500 bg-white dark:bg-slate-900"
              />
            ) : (
              <p 
                className="text-base font-medium text-slate-600 dark:text-slate-400 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md px-2 py-1 transition-colors min-h-[1.5rem] min-w-[5rem] group flex items-center justify-center gap-1"
                onClick={() => {
                  setEditValue(profile?.bio || DUMMY_PROFILE.bio);
                  setEditingField('bio');
                }}
                title="소개글 수정"
              >
                {profile?.bio || DUMMY_PROFILE.bio}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 group-hover:opacity-50 transition-opacity"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
              </p>
            )}
          </div>
        </section>

        {/* Links & Controls Section */}
        <section className="w-full flex flex-col gap-4">
          
          {/* Add Link Button placed at the top of the list */}
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger
              render={
                <button
                  className="group relative flex w-full min-h-[4.5rem] items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-indigo-200/80 bg-white/40 p-2 text-indigo-500 transition-all duration-300 hover:border-indigo-400 hover:bg-white/80 dark:border-indigo-900/50 dark:bg-slate-900/40 dark:text-indigo-400 dark:hover:border-indigo-500/80 dark:hover:bg-slate-800/80 shadow-sm backdrop-blur-xl"
                />
              }
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100/80 text-indigo-600 transition-all duration-300 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white dark:bg-indigo-950/80 dark:text-indigo-300 dark:group-hover:bg-indigo-500 dark:group-hover:text-white shadow-sm">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              </div>
              <span className="font-semibold tracking-wide">새로운 링크 추가하기</span>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>새 링크 추가</DialogTitle>
                <DialogDescription>
                  공유하고 싶은 웹사이트의 주소와 제목을 입력하세요.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="title" className="font-semibold">제목 (선택)</Label>
                  <Input 
                    id="title" 
                    placeholder="예: 내 포트폴리오" 
                    {...form.register("title")} 
                  />
                  {form.formState.errors.title && (
                    <p className="text-sm text-red-500 animate-in slide-in-from-top-1">
                      {form.formState.errors.title.message}
                    </p>
                  )}
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="url" className="font-semibold">URL (필수)</Label>
                  <Input 
                    id="url" 
                    placeholder="예: https://example.com" 
                    {...form.register("url")} 
                    className={form.formState.errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}
                  />
                  {form.formState.errors.url && (
                    <p className="text-sm text-red-500 animate-in slide-in-from-top-1">
                      {form.formState.errors.url.message}
                    </p>
                  )}
                </div>

                <DialogFooter className="pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsOpen(false)} disabled={isSubmitting}>
                    취소
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        추가 중...
                      </>
                    ) : (
                      "추가하기"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>

          {/* Delete Confirmation Modal */}
          <Dialog open={!!deletingLink} onOpenChange={(open) => !open && setDeletingLink(null)}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>정말 삭제하시겠습니까?</DialogTitle>
                <DialogDescription>
                  삭제하려는 정보가 맞는지 확인해 주세요.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-3 pt-4 px-1">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-900">
                  <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">{deletingLink?.title}</p>
                  <p className="text-sm text-slate-500 truncate">{deletingLink?.url}</p>
                </div>
                <p className="text-red-500 font-semibold text-sm">
                  이 작업은 되돌릴 수 없습니다.
                </p>
              </div>
              <DialogFooter className="mt-4">
                <Button variant="outline" type="button" onClick={() => setDeletingLink(null)} disabled={isSubmitting}>
                  취소
                </Button>
                <Button variant="destructive" type="button" onClick={handleDelete} disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      삭제 중...
                    </>
                  ) : "삭제하기"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {isInitialLoading && (
            <div className="flex w-full justify-center py-10">
              <svg className="animate-spin h-8 w-8 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          )}

          {!isInitialLoading && links.map((link) => {
            const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${link.url}`;
            
            if (editingLink?.linkId === link.linkId) {
              return (
                <Card key={link.linkId} className="relative flex w-full flex-col p-4 rounded-2xl border-2 border-indigo-400/50 bg-indigo-50/80 shadow-md dark:border-indigo-500/50 dark:bg-indigo-950/40 backdrop-blur-xl">
                  <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="inline-edit-title" className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">제목</Label>
                      <Input 
                        id="inline-edit-title"
                        placeholder="예: 내 포트폴리오" 
                        {...editForm.register("title")} 
                        className="bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800"
                        autoFocus
                      />
                      {editForm.formState.errors.title && (
                        <p className="text-xs text-red-500 font-medium">{editForm.formState.errors.title.message}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="inline-edit-url" className="text-xs font-semibold text-indigo-900 dark:text-indigo-200">URL <span className="text-red-500">*</span></Label>
                      <Input 
                        id="inline-edit-url"
                        placeholder="예: https://example.com" 
                        {...editForm.register("url")} 
                        className={`bg-white dark:bg-slate-900 border-indigo-200 dark:border-indigo-800 ${editForm.formState.errors.url ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                      />
                      {editForm.formState.errors.url && (
                        <p className="text-xs text-red-500 font-medium">{editForm.formState.errors.url.message}</p>
                      )}
                    </div>
                    <div className="flex justify-end gap-2 pt-1 border-t border-indigo-100 dark:border-indigo-900/50 mt-1">
                      <Button type="button" variant="ghost" size="sm" onClick={() => setEditingLink(null)} disabled={isSubmitting} className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-100 dark:text-indigo-300 dark:hover:text-indigo-100 dark:hover:bg-indigo-900">
                        취소
                      </Button>
                      <Button type="submit" size="sm" disabled={isSubmitting} className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-500 dark:hover:bg-indigo-600">
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-3 w-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            갱신 중...
                          </>
                        ) : "갱신하기"}
                      </Button>
                    </div>
                  </form>
                </Card>
              );
            }

            return (
              <div
                key={link.linkId}
                className="group relative block w-full transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 blur transition-all duration-300 group-hover:opacity-40 dark:group-hover:opacity-60"></div>
                <Card className="relative flex min-h-[4.5rem] w-full items-center justify-between rounded-2xl border border-slate-200/50 bg-white/70 p-2 pr-3 text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:bg-white/95 group-hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:group-hover:bg-slate-800/90 overflow-hidden">
                  
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center min-w-0 pr-2"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 shadow-inner overflow-hidden ml-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={faviconUrl}
                        alt={`${link.title} icon`}
                        className="h-6 w-6 object-contain"
                        loading="lazy"
                      />
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-center px-4 overflow-hidden text-center">
                      <span className="text-md font-semibold tracking-wide truncate">
                        {link.title}
                      </span>
                      {link.updatedAt && (
                        <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium truncate tracking-wide">
                          최근 수정 {new Intl.DateTimeFormat('ko-KR', { 
                            year: '2-digit', month: '2-digit', day: '2-digit', 
                            hour: '2-digit', minute: '2-digit', hour12: false
                          }).format(new Date(link.updatedAt))}
                        </span>
                      )}
                    </div>
                  </a>
                  
                  {/* Buttons */}
                  <div className="flex shrink-0 items-center space-x-1 z-10 w-auto">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setEditingLink(link);
                      }}
                      className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-indigo-400 dark:hover:bg-slate-800 rounded-full transition-colors flex items-center justify-center"
                      title="수정"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        setDeletingLink(link);
                      }}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:text-slate-500 dark:hover:text-red-500 dark:hover:bg-red-950/50 rounded-full transition-colors flex items-center justify-center"
                      title="삭제"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                    </button>
                  </div>
                </Card>
              </div>
            );
          })}
          {!isInitialLoading && links.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              아직 추가된 링크가 없습니다.
            </div>
          )}
        </section>
      </div>

      {/* Footer Section */}
      <footer className="mt-auto pt-16 pb-4 text-center text-sm font-semibold tracking-tight text-slate-400 dark:text-slate-500">
        Made with <span className="text-indigo-500 dark:text-indigo-400">My Link</span>
      </footer>
    </main>
  )
}


