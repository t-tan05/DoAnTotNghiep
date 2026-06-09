import { Outlet } from "react-router-dom";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useAuth } from "@/hooks/useAuth";

export default function ProfileLayout() {
  const { user } = useAuth();

  return (
    <section className="bg-muted/40 py-6 md:py-8">
      <div className="mx-auto grid max-w-7xl gap-5 px-4 md:px-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <ProfileSidebar userName={user?.name} email={user?.email} />

        <div className="min-w-0">
          <Outlet />
        </div>
      </div>
    </section>
  );
}