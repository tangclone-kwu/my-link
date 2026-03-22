export interface LinkItem {
  linkId: string;
  title: string;
  url: string;
  createdAt: string; // ISO date string or Firebase Timestamp equivalent
  clickCount?: number;
}

export const DUMMY_PROFILE = {
  nickname: "dev123",
  bio: "안녕하세요, 프론트엔드 개발자입니다.",
};

export const DUMMY_LINKS: LinkItem[] = [
  {
    linkId: "link_1",
    title: "인스타그램",
    url: "https://instagram.com/yourusername",
    createdAt: new Date("2024-03-22T10:00:00Z").toISOString(),
    clickCount: 0,
  },
  {
    linkId: "link_2",
    title: "유튜브",
    url: "https://youtube.com/@yourchannel",
    createdAt: new Date("2024-03-22T10:05:00Z").toISOString(),
    clickCount: 0,
  },
  {
    linkId: "link_3",
    title: "블로그",
    url: "https://yourblog.tistory.com",
    createdAt: new Date("2024-03-22T10:10:00Z").toISOString(),
    clickCount: 0,
  },
  {
    linkId: "link_4",
    title: "GitHub",
    url: "https://github.com/yourusername",
    createdAt: new Date("2024-03-22T10:15:00Z").toISOString(),
    clickCount: 0,
  },
  {
    linkId: "link_5",
    title: "포트폴리오",
    url: "https://yourportfolio.com",
    createdAt: new Date("2024-03-22T10:20:00Z").toISOString(),
    clickCount: 0,
  }
];
