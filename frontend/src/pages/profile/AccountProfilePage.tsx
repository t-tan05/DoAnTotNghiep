import AccountInfoForm from "@/components/profile/AccountInfoForm";
import DefaultAddressCard from "@/components/profile/DefaultAddressCard";

export default function AccountProfilePage() {
  return (
    <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
      <div className="min-w-0">
        <AccountInfoForm />
      </div>

      <div className="min-w-0">
        <DefaultAddressCard />
      </div>
    </div>
  );
}