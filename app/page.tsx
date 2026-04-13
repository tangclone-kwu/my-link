"use client";

import { useState, useEffect } from "react";
import { collection, doc, setDoc, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      url: "",
    },
  })

  useEffect(() => {
    const q = query(
      collection(db, "users", "anonymous", "links"),
      orderBy("createdAt", "desc")
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedLinks = snapshot.docs.map(doc => doc.data() as LinkItem);
      setLinks(fetchedLinks);
      setIsInitialLoading(false);
    }, (error) => {
      console.error("Error fetching links: ", error);
      setIsInitialLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      form.reset();
    }
  }, [isOpen, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    const formattedUrl = values.url.startsWith('http') ? values.url : `https://${values.url}`;

    const newLinkId = `link_${Date.now()}`;
    const newLink: LinkItem = {
      linkId: newLinkId,
      title: (values.title || "").trim() || formattedUrl.replace(/^https?:\/\/(www\.)?/, ''),
      url: formattedUrl,
      createdAt: new Date().toISOString(),
      clickCount: 0,
    };

    try {
      await setDoc(doc(collection(db, "users", "anonymous", "links"), newLinkId), newLink);
      setIsOpen(false);
    } catch (error) {
      console.error("Error adding document: ", error);
      alert("링크 추가 중 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="relative flex min-h-screen flex-col items-center py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="absolute -top-32 h-64 w-64 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-indigo-900 dark:mix-blend-screen dark:opacity-20 animate-pulse transition-all duration-1000"></div>
        <div className="absolute top-32 right-1/4 h-72 w-72 rounded-full bg-cyan-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-cyan-900 dark:mix-blend-screen dark:opacity-20 animate-pulse delay-75 transition-all duration-1000"></div>
      </div>

      <div className="z-10 flex w-full max-w-md flex-col items-center gap-10">
        
        {/* Profile Section */}
        <section className="flex flex-col items-center text-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white shadow-xl shadow-indigo-200 dark:shadow-indigo-900/20 text-4xl font-black uppercase tracking-tighter ring-4 ring-white dark:ring-slate-900">
            {DUMMY_PROFILE.nickname.charAt(0)}
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              @{DUMMY_PROFILE.nickname}
            </h1>
            <p className="text-base font-medium text-slate-600 dark:text-slate-400">
              {DUMMY_PROFILE.bio}
            </p>
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
            return (
              <a
                key={link.linkId}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative block w-full transform transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02]"
              >
                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-cyan-400 opacity-0 blur transition-all duration-300 group-hover:opacity-40 dark:group-hover:opacity-60"></div>
                <Card className="relative flex min-h-[4.5rem] w-full items-center justify-between rounded-2xl border border-slate-200/50 bg-white/70 p-2 pr-5 text-slate-800 shadow-sm backdrop-blur-xl transition-all duration-300 group-hover:bg-white/95 group-hover:shadow-lg dark:border-white/10 dark:bg-slate-900/60 dark:text-slate-100 dark:group-hover:bg-slate-800/90 overflow-hidden">
                  
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 shadow-inner overflow-hidden ml-1">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={faviconUrl}
                      alt={`${link.title} icon`}
                      className="h-6 w-6 object-contain"
                      loading="lazy"
                    />
                  </div>
                  
                  <span className="flex-1 px-4 text-center text-md font-semibold tracking-wide">
                    {link.title}
                  </span>
                  
                  <div className="w-8 flex justify-end opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-slate-400 dark:text-slate-500"
                    >
                      <path d="M5 12h14" />
                      <line x1="12" y1="5" x2="19" y2="12" />
                      <line x1="12" y1="19" x2="19" y2="12" />
                    </svg>
                  </div>
                </Card>
              </a>
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


