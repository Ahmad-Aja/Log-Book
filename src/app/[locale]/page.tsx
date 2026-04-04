import { cookies } from "next/headers";
import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ locale: string }>;
}

export default async function RootPage({ params }: Props) {
  const { locale } = await params;
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (accessToken) {
    redirect(`/${locale}/dashboard`);
  }

  redirect(`/${locale}/login`);
}
