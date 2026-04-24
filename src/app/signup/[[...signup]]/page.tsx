import { LoginPageDesign } from '@/src/components/kitalaku/pages';
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <LoginPageDesign
      title="Create your Workspace"
      subtitle="Mulai kolaborasi yang lebih rapi dan terkontrol bersama tim dan klien Anda."
    >
      <SignUp routing="hash" />
    </LoginPageDesign>
  );
}
