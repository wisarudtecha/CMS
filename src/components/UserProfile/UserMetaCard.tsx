// /src/components/UserProfile/UserMetaCard.tsx
import { UserMeta } from "@/types/user";

export default function UserMetaCard({ meta }: { meta: UserMeta }) {
  return (
    <>
      <div className="p-5 border border-gray-200 rounded-2xl dark:border-gray-800 lg:p-6 mb-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex flex-col items-center w-full gap-6 xl:flex-row">
            <div className="w-20 h-20 overflow-hidden border border-gray-200 rounded-full dark:border-gray-800">
              {/* <img src="/images/user/owner.jpg" alt="user" /> */}
              {meta?.avatar ? (
                <img src={meta?.avatar} alt="user" />
              ) : (
                <div className="w-5 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {meta?.firstName ? meta?.firstName[0] : ""}
                  {meta?.lastName ? meta?.lastName[0] : ""}
                </div>
              )}
            </div>
            <div className="order-3 xl:order-2">
              <h4 className="mb-2 text-lg font-semibold text-center text-gray-800 dark:text-white/90 xl:text-left">
                {meta.fullname}
              </h4>
              <div className="flex flex-col items-center gap-1 text-center xl:flex-row xl:gap-3 xl:text-left">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {meta.jobTitle}
                </p>
                <div className="hidden h-3.5 w-px bg-gray-300 dark:bg-gray-700 xl:block"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {meta.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
