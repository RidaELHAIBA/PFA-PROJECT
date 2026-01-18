import Image from "next/image";
import { redirect } from "next/navigation";

export default function Home() {
  // Cette fonction s'exécute côté serveur et redirige vers /login
  redirect("/login");
}

