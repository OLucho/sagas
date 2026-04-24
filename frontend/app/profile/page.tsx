import type { Metadata } from "next";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Mi Perfil",
  description: "Edita tu información de perfil, nombre de usuario, WhatsApp e Instagram.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
