import { PublicDocument } from "@/components/layout/public-document";
import { publicMetadata } from "@/lib/public-metadata";

export const metadata = publicMetadata;

/** Root layout of the public site. The CMS admin under (payload) has its own root layout. */
export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <PublicDocument>{children}</PublicDocument>;
}
