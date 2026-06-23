import Image from "next/image";
import { AuthForm } from "@/components/forms/auth-form";
import { BRAND } from "@/lib/brand";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#172554] px-4 py-8 md:px-8">
      <div className="flex w-full max-w-md flex-col items-center">
        <div className="flex w-full flex-col items-center">
          <Image
            src={BRAND.assets.logoWhite}
            alt={BRAND.name}
            width={238}
            height={243}
            priority
            unoptimized
            className="block h-auto w-full max-w-[240px] object-contain"
          />
          <p className="mt-5 text-center text-sm font-medium uppercase tracking-[0.12em] text-white/55">
            Project Finance
          </p>
        </div>

        <div className="mt-10 w-full rounded-[24px] bg-white/[0.06] p-6 backdrop-blur-sm">
          <h1 className="text-center text-xl font-semibold text-white">
            Sign in
          </h1>
          <p className="mt-2 text-center text-sm leading-relaxed text-white/60">
            Manage projects and finances on site
          </p>
          <div className="mt-6">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  );
}
