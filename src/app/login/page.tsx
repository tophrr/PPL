import { LoginPageDesign } from "@/src/components/kitalaku-ui";
import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <LoginPageDesign>
      <div className="mt-8 flex justify-center">
        <SignIn routing="hash" />
      </div>
    </LoginPageDesign>
  );
}
