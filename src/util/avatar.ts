import { Platform } from "react-native";

const SERVER_BASE = "https://nestboard-backend-final.vercel.app";

export function getFullAvatarUrl(avatarUrl?: string | null): string {
  if (!avatarUrl) {
    return "https://ui-avatars.com/api/?name=User&background=6366f1&color=fff";
  }
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${SERVER_BASE}${avatarUrl.startsWith("/") ? "" : "/"}${avatarUrl}`;
}

