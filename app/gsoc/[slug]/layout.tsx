import { Navigation } from '../../components/nav';
import { ScrollProgressBar } from "../../components/progress-bar";

export default function GSoCPostLayout({
  children,
}: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen bg-gradient-to-tl from-zinc-900 via-zinc-400/10 to-zinc-900 ">
      <ScrollProgressBar />
      <div>
        {children}
      </div>
    </div>
  );
} 