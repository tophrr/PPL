import { LoginPageDesign } from '@/src/components/kitalaku/pages';
import { SignIn } from '@clerk/nextjs';

export default function LoginPage() {
  return (
    <LoginPageDesign>
      <SignIn routing="hash" />
    </LoginPageDesign>
  );
}
