import { Outlet } from "react-router-dom";
import FloatingChatbot from "./FloatingChatbot";
import Navbar from "./Navbar";

export default function PublicLayout() {
  return (
    <>
      <header className="sticky top-0 z-50 bg-white/85 pb-2 backdrop-blur">
        <Navbar />
      </header>
      <Outlet />
      <FloatingChatbot />
    </>
  );
}
