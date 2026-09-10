import AppSidebar from "@/components/AppSidebar";
import Header from "@/components/Header";
import "./globals.css";

export const metadata = {
  title: "Notes",
  description: "블록 단위로 글을 작성하고 관리하는 노트 앱",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body>
        <div className="app-shell">
          <Header />
          <div className="app-body">
            <AppSidebar />
            <div className="app-main">{children}</div>
          </div>
        </div>
      </body>
    </html>
  );
}
