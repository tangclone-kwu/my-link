"use client";

import { useState, useEffect } from "react";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { useQuery } from "@tanstack/react-query";
import { onAuthStateChanged, User } from "firebase/auth";
import { db, auth } from "@/lib/firebase";
import { LinkItem } from "@/data/links";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  clickCount: {
    label: "클릭 수",
    color: "#6366f1", // indigo-500
  },
} satisfies ChartConfig;

export default function StatsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
      if (!currentUser) {
        window.location.href = '/';
      }
    });
    return () => unsubscribe();
  }, []);

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

  const isInitialLoading = authLoading || isLinksLoading;

  if (isInitialLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (!user) return null;

  const totalClicks = links.reduce((sum, link) => sum + (link.clickCount || 0), 0);
  
  const chartData = links.map(link => ({
    title: link.title.length > 10 ? link.title.slice(0, 10) + "..." : link.title,
    clickCount: link.clickCount || 0,
  }));

  return (
    <main className="relative flex min-h-screen flex-col items-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 animate-in fade-in duration-500">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden flex justify-center">
        <div className="absolute -top-32 h-64 w-64 rounded-full bg-indigo-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-indigo-900 dark:mix-blend-screen dark:opacity-20 animate-pulse transition-all duration-1000"></div>
        <div className="absolute top-32 right-1/4 h-72 w-72 rounded-full bg-cyan-300 mix-blend-multiply blur-3xl opacity-30 dark:bg-cyan-900 dark:mix-blend-screen dark:opacity-20 animate-pulse delay-75 transition-all duration-1000"></div>
      </div>

      <header className="w-full max-w-4xl flex items-center justify-between py-2 mb-10 z-10">
        <Link href="/" className="flex items-center gap-2 select-none group transition-transform hover:scale-105">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500 text-white font-bold text-xl shadow-md group-hover:bg-indigo-600 transition-colors">M</div>
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">My Link</span>
        </Link>
        <Link 
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-700 bg-white/80 dark:bg-slate-800/80 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 backdrop-blur-md"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          대시보드로 돌아가기
        </Link>
      </header>

      <div className="z-10 flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">링크 통계</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">각 링크의 클릭 수와 성과를 한눈에 확인해 보세요.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="col-span-1 shadow-lg border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <CardHeader className="pb-2">
              <CardDescription className="text-sm font-semibold text-slate-500 dark:text-slate-400">총 클릭 수</CardDescription>
              <CardTitle className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300 mt-2 group-hover:scale-105 transition-transform origin-left inline-block">{totalClicks.toLocaleString()}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mt-2">모든 링크의 합산 조회수입니다.</p>
            </CardContent>
          </Card>
          
          <Card className="col-span-1 md:col-span-2 shadow-lg border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            <CardHeader>
              <CardTitle className="text-lg">링크별 클릭 수</CardTitle>
              <CardDescription>어떤 링크가 가장 인기가 많은지 확인해 보세요.</CardDescription>
            </CardHeader>
            <CardContent>
              {links.length > 0 ? (
                <ChartContainer config={chartConfig} className="min-h-[250px] w-full mt-4">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                    <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-800" />
                    <XAxis
                      dataKey="title"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      className="text-xs font-medium"
                    />
                    <YAxis 
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      allowDecimals={false}
                      className="text-xs font-medium"
                    />
                    <ChartTooltip cursor={{ fill: 'var(--color-clickCount)', opacity: 0.1 }} content={<ChartTooltipContent hideLabel />} />
                    <Bar
                      dataKey="clickCount"
                      fill="var(--color-clickCount)"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={60}
                    />
                  </BarChart>
                </ChartContainer>
              ) : (
                <div className="flex h-[250px] items-center justify-center text-slate-500 dark:text-slate-400 font-medium">
                  등록된 링크가 없습니다.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
