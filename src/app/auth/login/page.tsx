import { Metadata } from "next";
import LoginForm from "./login-form"

export const metadata: Metadata = {
  title: "Login - IELTS 8.0 Master",
  description: "Sign in to your IELTS vocabulary account",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <LoginForm />
    </div>
  )
}


