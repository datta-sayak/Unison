import { Suspense } from "react";
import SignInForm from "../../components/SignInForm";

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
