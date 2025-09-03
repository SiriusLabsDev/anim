import { SignIn, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { dark } from "@clerk/themes";

const SignInPage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1">
      <div className="h-full flex-col items-center justify-center px-4 lg:flex">
        <div className="space-y-4 pt-16 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-base text-[#7E8CA0]">
            Log in or create account to get back to your dashboard.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <ClerkLoaded>
            <SignIn path="/sign-in" appearance={{ theme: dark}} signUpUrl="/sign-up"/>
          </ClerkLoaded>

          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;