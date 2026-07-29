/**
 * @file page.tsx
 * @description React page component displaying the public profile card of a Calmora community user.
 * Searches and displays profile summaries, location tags, website links, streaks, and public feeds.
 * Includes interactive triggers for direct messaging, reports, block lists, and follow states.
 */

"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { motion } from "framer-motion"
import {
  MapPin, Globe, Calendar, Trophy, Flame, Zap, Star,
  Users, UserPlus, UserCheck, Shield, MessageSquare,
  Flag, Ban, Loader2, Award, Target, Heart, Brain,
} from "lucide-react"
import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { communityApi } from "@/lib/community-api"
import { PostCard } from "@/components/community/PostCard"
import { MessageModal } from "@/components/community/MessageModal"
import { useAuth } from "@/lib/hooks/useAuth"
import type { UserProfile, PostData } from "@/lib/community-api"

export default function PublicProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user: currentUser } = useAuth()
  const username = params.username as string

  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [posts, setPosts] = useState<PostData[]>([])
  const [following, setFollowing] = useState(false)
  const [blocked, setBlocked] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showMessage, setShowMessage] = useState(false)
  const [showFollowers, setShowFollowers] = useState(false)
  const [showFollowing, setShowFollowing] = useState(false)
  const [followers, setFollowers] = useState<UserProfile[]>([])
  const [followingUsers, setFollowingUsers] = useState<UserProfile[]>([])

  useEffect(() => {
    loadProfile()
  }, [username])

  /**
   * Queries users by their @username to load profile attributes,
   * follow status, and recent post feed cards.
   */
  const loadProfile = async () => {
    setLoading(true)
    try {
      // Use search to find user by username
      const searchRes = await communityApi.search(`@${username}`, "users")
      const foundUser = searchRes.users?.[0]
      if (foundUser) {
        setProfile(foundUser)
        // Check follow status
        if (currentUser) {
          try {
            const followRes = await communityApi.checkFollow(foundUser._id)
            setFollowing(followRes.following)
          } catch {}
        }
        // Load user posts
        try {
          const postsRes = await communityApi.getUserPosts(foundUser._id)
          setPosts(postsRes.posts)
        } catch {}
      }
    } catch {}
    setLoading(false)
  }

  /**
   * Dispatches toggleFollow API request and syncs follower count updates.
   */
  const handleFollow = useCallback(async () => {
    if (!profile) return
    try {
      const res = await communityApi.toggleFollow(profile._id)
      setFollowing(res.following)
      setProfile((prev) => prev ? { ...prev, followerCount: res.followerCount } : prev)
    } catch {}
  }, [profile])

  /**
   * Dispatches toggleBlock API request and syncs block status updates.
   */
  const handleBlock = useCallback(async () => {
    if (!profile) return
    try {
      const res = await communityApi.toggleBlock(profile._id)
      setBlocked(res.blocked)
    } catch {}
  }, [profile])

  /**
   * Submits an abuse report ticket against the profile being viewed.
   */
  const handleReport = useCallback(async () => {
    if (!profile) return
    try {
      await communityApi.submitReport("user", profile._id, "inappropriate")
      alert("Report submitted")
    } catch {}
  }, [profile])

  /**
   * Fetches user follower account summaries and opens the overlay list modal.
   */
  const loadFollowers = async () => {
    if (!profile) return
    try {
      const res = await communityApi.getFollowers(profile._id)
      setFollowers(res.users)
      setShowFollowers(true)
    } catch {}
  }

  /**
   * Fetches user following account summaries and opens the overlay list modal.
   */
  const loadFollowing = async () => {
    if (!profile) return
    try {
      const res = await communityApi.getFollowing(profile._id)
      setFollowingUsers(res.users)
      setShowFollowing(true)
    } catch {}
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="text-center py-20">
        <p className="text-white/50 text-lg">User not found</p>
        <Button variant="glass" className="mt-4" onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  const displayName = profile.displayName || profile.name || "User"
  const initials = displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
  const isOwnProfile = currentUser?.id === profile._id
  const level = profile.level || 1
  const xp = profile.xp || 0
  const nextLevelXp = level * 500
  const xpInLevel = xp % nextLevelXp

  return (
    <div className="space-y-6">
      {/* Cover Banner Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden h-48 md:h-64 bg-gradient-to-r from-blue-900/50 via-purple-900/50 to-cyan-900/50"
      >
        {profile.coverImage && (
          <img src={profile.coverImage} alt="" className="w-full h-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e] via-transparent to-transparent" />

        {/* Profile info details overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6 flex items-end gap-4">
          <Avatar src={profile.avatar} name={displayName} size="xl" className="ring-4 ring-[#0a0f1e]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-white">{displayName}</h1>
              {profile.isVerified && (
                <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                </svg>
              )}
            </div>
            <p className="text-white/50 text-sm">@{profile.username || "user"}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left sidebar - Profile metadata card */}
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <GlassCard>
              <div className="space-y-3">
                {/* Action trigger buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-2">
                    <Button
                      variant={following ? "secondary" : "primary"}
                      size="sm"
                      className="flex-1"
                      icon={following ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                      onClick={handleFollow}
                    >
                      {following ? "Following" : "Follow"}
                    </Button>
                    <Button variant="glass" size="sm" icon={<MessageSquare className="w-4 h-4" />} onClick={() => setShowMessage(true)} />
                    <Button variant="ghost" size="sm" icon={<Flag className="w-4 h-4 text-rose-400" />} onClick={handleReport} />
                    <Button variant="ghost" size="sm" icon={<Ban className="w-4 h-4 text-rose-400" />} onClick={handleBlock} />
                  </div>
                )}

                {/* Biography string */}
                {profile.bio && (
                  <p className="text-sm text-white/70">{profile.bio}</p>
                )}

                {/* Details layout */}
                <div className="space-y-1.5">
                  {profile.location && (
                    <div className="flex items-center gap-2 text-xs text-white/40">
                      <MapPin className="w-3.5 h-3.5" /> {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-2 text-xs">
                      <Globe className="w-3.5 h-3.5 text-white/40" />
                      <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">{profile.website}</a>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-xs text-white/40">
                    <Calendar className="w-3.5 h-3.5" /> Joined {new Date(profile.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                  </div>
                </div>

                {/* Followers and posts count statistics */}
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 rounded-xl bg-white/5">
                    <p className="text-lg font-bold text-gradient-amber">{profile.followerCount || 0}</p>
                    <button onClick={loadFollowers} className="text-xs text-white/40 hover:text-white transition-colors">Followers</button>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white/5">
                    <p className="text-lg font-bold text-gradient-emerald">{profile.followingCount || 0}</p>
                    <button onClick={loadFollowing} className="text-xs text-white/40 hover:text-white transition-colors">Following</button>
                  </div>
                  <div className="text-center p-2 rounded-xl bg-white/5">
                    <p className="text-lg font-bold text-gradient-cyan">{profile.postCount || 0}</p>
                    <p className="text-xs text-white/40">Posts</p>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* XP & Level progression meters */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <GlassCard>
              <h3 className="text-sm font-semibold text-white mb-3">Progress</h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-white/50">Level {level}</span>
                    <span className="text-white/50">{xpInLevel || 0} / {nextLevelXp} XP</span>
                  </div>
                  <Progress value={Math.min(Math.round(((xpInLevel || 0) / nextLevelXp) * 100), 100)} variant="success" size="sm" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-500/10">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{profile.streak || 0}</p>
                      <p className="text-[10px] text-white/40">Day Streak</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-500/10">
                    <Zap className="w-4 h-4 text-purple-400" />
                    <div>
                      <p className="text-sm font-bold text-white">{profile.reputation || 0}</p>
                      <p className="text-[10px] text-white/40">Reputation</p>
                    </div>
                  </div>
                </div>
              </div>
            </GlassCard>
          </motion.div>

          {/* Interest tags */}
          {profile.interests && profile.interests.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-2">Interests</h3>
                <div className="flex flex-wrap gap-1.5">
                  {profile.interests.map((i) => (
                    <Badge key={i} variant="info" size="sm">{i}</Badge>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </div>

        {/* Right - Public feeds and Badges row */}
        <div className="lg:col-span-2 space-y-4">
          {/* Badges list */}
          {profile.badges && profile.badges.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <GlassCard>
                <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" /> Badges ({profile.badges.length})
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.badges.map((b) => (
                    <div key={b.name} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                      <span className="text-lg">{b.icon || "🏅"}</span>
                      <span className="text-xs text-white/70">{b.name}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}

          {/* Feed Posts */}
          <h3 className="text-lg font-semibold text-white">Posts</h3>
          {posts.length === 0 ? (
            <GlassCard>
              <p className="text-center text-white/30 text-sm py-8">No posts yet</p>
            </GlassCard>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} />
            ))
          )}
        </div>
      </div>

      {/* Followers list modal dialog */}
      {showFollowers && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFollowers(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0f1e] p-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-3">Followers</h3>
            {followers.map((f) => (
              <button key={f._id} onClick={() => { setShowFollowers(false); router.push(`/profile/${f.username || f._id}`) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left">
                <Avatar src={f.avatar} name={f.displayName || f.name} size="sm" />
                <span className="text-sm text-white">{f.displayName || f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Following list modal dialog */}
      {showFollowing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowFollowing(false)}>
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#0a0f1e] p-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-white mb-3">Following</h3>
            {followingUsers.map((f) => (
              <button key={f._id} onClick={() => { setShowFollowing(false); router.push(`/profile/${f.username || f._id}`) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/5 transition-all text-left">
                <Avatar src={f.avatar} name={f.displayName || f.name} size="sm" />
                <span className="text-sm text-white">{f.displayName || f.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message composition modal */}
      <MessageModal open={showMessage} onClose={() => setShowMessage(false)} initialUserId={profile._id} />
    </div>
  )
}
