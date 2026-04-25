import { LoginPageDesign } from '@/src/components/kitalaku/pages';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <LoginPageDesign title=" " subtitle=" ">
      <SignUp routing="hash" />
    </LoginPageDesign>
  );
}
