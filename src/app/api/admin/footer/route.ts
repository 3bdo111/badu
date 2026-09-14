import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/auth/admin-auth";
import { serverSettingsRepository } from "@/lib/repositories/server-settings-repository";

export async function GET() {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const groups = await serverSettingsRepository.getFooterGroups(true);
    const socialLinks = await serverSettingsRepository.getSocialLinks(true);
    return NextResponse.json({ groups, socialLinks });
  } catch (error) {
    console.error("GET /api/admin/footer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await verifyAdminSession();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    let savedGroups = await serverSettingsRepository.getFooterGroups(true);
    let savedSocials = await serverSettingsRepository.getSocialLinks(true);

    if (Array.isArray(body.groups)) {
      const sanitizedGroups = body.groups.map((group: { id?: string; title?: { en?: string; ar?: string }; sortOrder?: number; visible?: boolean; links?: Array<{ id?: string; label?: { en?: string; ar?: string }; url?: string; sortOrder?: number; visible?: boolean }> }, gIdx: number) => ({
        id: String(group.id || `group-${Date.now()}-${gIdx}`),
        title: {
          en: String(group.title?.en || ""),
          ar: String(group.title?.ar || group.title?.en || ""),
        },
        sortOrder: typeof group.sortOrder === "number" ? group.sortOrder : gIdx,
        visible: Boolean(group.visible !== false),
        links: Array.isArray(group.links)
          ? group.links.map((link, lIdx) => ({
              id: String(link.id || `link-${Date.now()}-${lIdx}`),
              groupId: String(group.id || `group-${Date.now()}-${gIdx}`),
              label: {
                en: String(link.label?.en || ""),
                ar: String(link.label?.ar || link.label?.en || ""),
              },
              url: String(link.url || "/"),
              sortOrder: typeof link.sortOrder === "number" ? link.sortOrder : lIdx,
              visible: Boolean(link.visible !== false),
            }))
          : [],
      }));
      savedGroups = await serverSettingsRepository.saveFooterGroups(sanitizedGroups);
    }

    if (Array.isArray(body.socialLinks)) {
      const sanitizedSocials = body.socialLinks.map((s: { id?: string; platform?: string; label?: string; url?: string; icon?: string; sortOrder?: number; visible?: boolean }, idx: number) => ({
        id: String(s.id || `soc-${Date.now()}-${idx}`),
        platform: String(s.platform || "social"),
        label: String(s.label || "Social Link"),
        url: String(s.url || "https://"),
        icon: String(s.icon || s.platform || "social"),
        sortOrder: typeof s.sortOrder === "number" ? s.sortOrder : idx,
        visible: Boolean(s.visible !== false),
      }));
      savedSocials = await serverSettingsRepository.saveSocialLinks(sanitizedSocials);
    }

    return NextResponse.json({ groups: savedGroups, socialLinks: savedSocials });
  } catch (error) {
    console.error("PUT /api/admin/footer error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
