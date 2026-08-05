import AccountInfoForm from "@/components/profile/AccountInfoForm";
import DefaultAddressCard from "@/components/profile/DefaultAddressCard";
import { useAuth } from "@/hooks/useAuth";
import { isStaffUser } from "@/utils/authRole";

export default function AccountProfilePage() {
  const { user } = useAuth();
  const isStaff = isStaffUser(user);

  return (
    <div className={isStaff ? "grid min-w-0 gap-5" : "grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]"}>
      <div className="min-w-0">
        <AccountInfoForm />
      </div>

      {!isStaff && (
        <div className="min-w-0">
          <DefaultAddressCard />
        </div>
      )}
    </div>
  );
}
