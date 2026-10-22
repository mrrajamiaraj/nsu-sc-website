import { LampLogin } from "@/components/auth/LampLogin";
import { loginAction } from "./actions";

export default function AdminLoginPage() {
  return <LampLogin action={loginAction} />;
}
