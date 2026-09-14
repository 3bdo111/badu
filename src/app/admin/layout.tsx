import { type ReactNode } from "react";

export const metadata = {
  title: "BADU Admin Dashboard",
  description: "Management portal for BADU brand storefront",
  robots: {
    index: false,
    follow: false,
    noimageindex: true,
  },
};

export default function RootAdminLayout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
