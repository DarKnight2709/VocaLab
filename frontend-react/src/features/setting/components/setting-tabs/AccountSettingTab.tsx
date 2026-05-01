interface AccountSettingTabProps {
  onEditProfile: () => void;
  onChangePassword: () => void;
  onSocialLinks: () => void;
}

export default function AccountSettingTab({
  onEditProfile,
  onChangePassword,
  onSocialLinks,
}: AccountSettingTabProps) {
  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">General</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={onEditProfile}
            className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Profile information
          </button>
          <button
            onClick={onChangePassword}
            className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Change password
          </button>
          <button
            disabled
            className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-md opacity-50 cursor-not-allowed"
          >
            2FA (coming soon)
          </button>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Socials & Profile</h2>
        <div className="flex flex-col gap-2">
          <button
            onClick={onSocialLinks}
            className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Social links
          </button>
          <button className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-gray-300 rounded-md hover:bg-gray-50">
            Manage profile display content
          </button>
        </div>
      </section>

      <section className="space-y-3 pt-6 border-t">
        <button
          className="w-fit inline-flex items-center gap-2 whitespace-nowrap px-4 py-2 text-sm font-medium transition-colors border border-red-200 text-red-600 rounded-md hover:bg-red-50"
          onClick={() => {
            console.log("Delete Account requested");
          }}
        >
          Delete Account
        </button>
      </section>
    </div>
  );
}
