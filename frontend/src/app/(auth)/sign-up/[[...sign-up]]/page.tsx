import { SignUp, ClerkLoaded, ClerkLoading } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Loader2 } from "lucide-react";

const SignUpPage = () => {
  return (
    <div className="grid min-h-screen grid-cols-1 ">
      <div className="h-full flex-col items-center justify-center px-4 lg:flex">
        <div className="space-y-4 pt-16 text-center">
          <h1 className="text-3xl font-bold text-white">Welcome back!</h1>
          <p className="text-base text-[#7E8CA0]">
            Log in or create account to get back to your dashboard.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-center">
          <ClerkLoaded>
            <SignUp path="/sign-up" signInUrl="/sign-in" appearance={{theme: dark}}/>
          </ClerkLoaded>

          <ClerkLoading>
            <Loader2 className="animate-spin text-muted-foreground" />
          </ClerkLoading>
        </div>
      </div>

      {/* <div className="hidden h-full items-center justify-center bg-black lg:flex">
        <Image src="/new_logo.png" alt="Finance logo" height={300} width={300} />
      </div> */}
    </div>
  );
};

export default SignUpPage;