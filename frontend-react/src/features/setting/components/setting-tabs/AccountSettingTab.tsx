interface AccountSettingTabProps {
  onEditProfile: () => void;
}

export default function AccountSettingTab({
  onEditProfile,
}: AccountSettingTabProps) {
  return (
    <div>
      <h1 className="text-2xl font-bold">General</h1>
      <button
        onClick={onEditProfile}
        className="inline-flex items-center gap-2 whitespace-nowrap  px-4 py-2 text-base font-medium transition-colors border-2 border-gray-400"
      >
        Profile information
      </button>
      <br />
      <button className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-base font-medium transition-colors border-2 border-gray-400">
        Change password
      </button>
      <br />
      <button className="inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-base font-medium transition-colors border-2 border-gray-400">
        2FA (develop later)
      </button>
      <br />

      <button className="text-2xl font-bold border-2 border-gray-400">
        Social links
      </button>
      <br />
      <button className="text-2xl font-bold border-2 border-gray-400">
        Manage what content shows on the profile
      </button>
      <br />

      <button
        className="text-2xl font-bold text-red-500 border-2 border-gray-400"
        onClick={() => {
          console.log("Hello");
        }}
      >
        Delete Account
      </button>
    </div>
  );
}
