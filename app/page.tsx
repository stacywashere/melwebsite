"use client";

import { useEffect, useState } from "react";

const USER_ID = "945011184799719464";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const DISCORD_PROFILE_URL = `https://discordapp.com/users/${USER_ID}`;

type DiscordUser = {
  id: string;
  username: string;
  display_name: string | null;
  global_name: string | null;
  avatar: string | null;
};

type LanyardData = {
  discord_user: DiscordUser;
  discord_status: "online" | "idle" | "dnd" | "offline";
  activities: Array<{
    application_id?: string;
    assets?: {
      large_image?: string;
      large_text?: string;
      small_image?: string;
      small_text?: string;
    };
    details?: string;
    name: string;
    state?: string;
    type: number;
  }>;
  listening_to_spotify: boolean;
  spotify: {
    album: string;
    album_art_url: string;
    artist: string;
    song: string;
    track_id: string;
  } | null;
};

const fallback: LanyardData = {
  discord_user: {
    id: USER_ID,
    username: "ukzyo",
    display_name: "ᵐᵉⁱ",
    global_name: "ᵐᵉⁱ",
    avatar: "535db2bf825f28477c383b0efc8ca2e1",
  },
  discord_status: "dnd",
  activities: [],
  listening_to_spotify: false,
  spotify: null,
};

const activityLabels: Record<number, string> = {
  0: "playing",
  1: "streaming",
  2: "listening to",
  3: "watching",
  5: "competing in",
};

const statusLabels: Record<LanyardData["discord_status"], string> = {
  online: "Online",
  idle: "Idle",
  dnd: "Do Not Disturb",
  offline: "Offline",
};

const applicationIcons: Record<string, string> = {
  "363445589247131668":
    "https://cdn.discordapp.com/app-icons/363445589247131668/f2b60e350a2097289b3b0b877495e55f.png?size=128",
};

function getActivityImage(activity: LanyardData["activities"][number]) {
  const image = activity.assets?.large_image ?? activity.assets?.small_image;

  if (image?.startsWith("mp:")) {
    return `https://media.discordapp.net/${image.slice(3)}`;
  }

  if (image?.startsWith("http://") || image?.startsWith("https://")) {
    return image;
  }

  if (image && activity.application_id) {
    return `https://cdn.discordapp.com/app-assets/${activity.application_id}/${image}.png`;
  }

  return activity.application_id ? applicationIcons[activity.application_id] : undefined;
}

const socialLinks = [
  { name: "Discord Server", icon: "discord", href: "https://discord.gg/KHMQDZPn3y" },
  { name: "Spotify", icon: "spotify", href: "https://open.spotify.com/user/gfhmi7rc2rr0s3fzuyt80g798?si=3fb674039463484b" },
  { name: "Steam", icon: "steam", href: "https://steamcommunity.com/id/ukzyo/" },
  { name: "Roblox", icon: "roblox", href: "https://www.roblox.com/users/1113106419/profile" },
];

export default function Home() {
  const [profile, setProfile] = useState<LanyardData>(fallback);

  useEffect(() => {
    const preventDefault = (event: Event) => event.preventDefault();

    document.addEventListener("contextmenu", preventDefault);
    document.addEventListener("dragstart", preventDefault);
    document.addEventListener("selectstart", preventDefault);

    return () => {
      document.removeEventListener("contextmenu", preventDefault);
      document.removeEventListener("dragstart", preventDefault);
      document.removeEventListener("selectstart", preventDefault);
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    const refreshProfile = () => {
      fetch(`https://api.lanyard.rest/v1/users/${USER_ID}`, {
        signal: controller.signal,
      })
        .then((response) => {
          if (!response.ok) throw new Error("Could not load Discord profile");
          return response.json();
        })
        .then((result) => {
          if (result.success && result.data) setProfile(result.data);
        })
        .catch(() => undefined);
    };

    refreshProfile();
    const interval = window.setInterval(refreshProfile, 30_000);

    return () => {
      window.clearInterval(interval);
      controller.abort();
    };
  }, []);

  const user = profile.discord_user;
  const avatar = user.avatar
    ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=256`
    : "https://cdn.discordapp.com/embed/avatars/0.png";
  const activity = profile.activities.find((item) => item.type !== 4 && item.name !== "Spotify");
  const activityImage = activity ? getActivityImage(activity) : undefined;
  const isPlayingGame = profile.activities.some(
    (item) => item.type === 0 && item.name !== "Spotify",
  );
  const presenceLabel = profile.listening_to_spotify
    ? "Listening to Music"
    : isPlayingGame
      ? "Playing a Game"
      : statusLabels[profile.discord_status];

  return (
    <main>
      <section className="profile-card" aria-label={`${user.username}'s Discord profile`}>
        <img className="emily" src={`${BASE_PATH}/emilytop.png`} alt="Emily the Strange" draggable={false} />

        <div className="discord-profile">
          <img className="cobweb" src={`${BASE_PATH}/cobweb.png`} alt="" aria-hidden="true" draggable={false} />
          <div className="profile-main">
            <div className="avatar-wrap">
              <img className="avatar" src={avatar} alt={`${user.username}'s Discord avatar`} draggable={false} />
            </div>

            <div className="user-details">
              <a
                className="discord-profile-link"
                href={DISCORD_PROFILE_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${user.username}'s Discord profile`}
              >
                <h1>{user.display_name ?? user.global_name ?? user.username}</h1>
                <p>@{user.username}</p>
              </a>
              <div className="presence">
                <span className={`presence-dot status-${profile.discord_status}`} aria-hidden="true" />
                {presenceLabel}
              </div>
            </div>
          </div>

          {profile.listening_to_spotify && profile.spotify ? (
            <div
              className="spotify-row"
              aria-label={`Listen to ${profile.spotify.song} by ${profile.spotify.artist} on Spotify`}
            >
              <img className="spotify-art" src={profile.spotify.album_art_url} alt="" draggable={false} />
              <div className="spotify-copy">
                <strong>{profile.spotify.song}</strong>
                <p>{profile.spotify.artist}</p>
              </div>
              <a
                className="activity-popout"
                href={`https://open.spotify.com/track/${profile.spotify.track_id}`}
                target="_blank"
                rel="noreferrer"
                aria-label="Open this track on Spotify"
              >
                ↗
              </a>
            </div>
          ) : activity ? (
            <div className="spotify-row activity-row" aria-label={`${activityLabels[activity.type] ?? "using"} ${activity.name}`}>
              {activityImage ? (
                <img
                  className="spotify-art activity-art"
                  src={activityImage}
                  alt=""
                  aria-hidden="true"
                  draggable={false}
                />
              ) : (
                <span className="activity-mark" aria-hidden="true">✦</span>
              )}
              <div className="spotify-copy">
                <span>{activityLabels[activity.type] ?? "active on discord"}</span>
                <strong>{activity.name}</strong>
                {(activity.details || activity.state) && <p>{activity.details ?? activity.state}</p>}
              </div>
            </div>
          ) : null}
        </div>

        <nav className="social-links" aria-label="Social links">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              target="_blank"
              rel="noreferrer"
              aria-label={social.name}
              data-label={social.name}
            >
              <img
                src={`https://cdn.simpleicons.org/${social.icon}/ffffff?viewbox=auto`}
                alt=""
                aria-hidden="true"
                draggable={false}
              />
            </a>
          ))}
        </nav>
      </section>

      <a className="credit" href="https://stacy.rest" target="_blank" rel="noreferrer">
        stacy
      </a>
    </main>
  );
}
