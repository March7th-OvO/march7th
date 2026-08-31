import type { Metadata } from "next";
import "./globals.css";
import "./forms-accordion.css";
import "./hero-photo.css";
import FormsScrollFade from "./forms-scroll-fade";
import HeroPhotoEnhancer from "./hero-photo-enhancer";

export const metadata: Metadata = {
  metadataBase: new URL("https://march7th-memories.hutao7758520.chatgpt.site"),
  title: "March 7th · 三月七",
  description: "献给《崩坏：星穹铁道》角色三月七的非官方纪念站——把今天，拍成明天的回忆。",
  openGraph: {
    title: "March 7th · 三月七",
    description: "把今天，拍成明天的回忆。翻开属于三月七的星际相簿。",
    type: "website",
    images: [
      {
        url: "https://assets.march7th.moe/image/backgrounds/hezhao.png",
        width: 2844,
        height: 1600,
        alt: "星穹列车成员在庆典街景前的集体合影",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "March 7th · 三月七",
    description: "把今天，拍成明天的回忆。",
    images: ["https://assets.march7th.moe/image/backgrounds/hezhao.png"],
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
        <FormsScrollFade />
        <HeroPhotoEnhancer />
      </body>
    </html>
  );
}
