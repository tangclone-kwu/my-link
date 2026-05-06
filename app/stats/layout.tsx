import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "통계",
  description: "나의 링크 클릭 수와 성과 통계를 확인해보세요.",
};

export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
