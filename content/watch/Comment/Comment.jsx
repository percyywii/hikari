"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { DiscussionEmbed } from "disqus-react";
import { FaComment, FaHeart, FaReply, FaTriangleExclamation, FaCheck } from "react-icons/fa6";
import { IoSend } from "react-icons/io5";
import Image from "next/image";

const SEED_COMMENTS = [
  {
    id: "seed-1",
    author: "Kurogane",
    avatar: "/images/waifus/1.png",
    timeAgo: "2 hours ago",
    content: "The animation quality this season is insane! The pacing in the second half gave me chills.",
    likes: 18,
    isSpoiler: false,
    replies: [
      {
        id: "seed-1-1",
        author: "HikariFan",
        avatar: "/images/logo.png",
        timeAgo: "1 hour ago",
        content: "Totally agree! The sound design with headphones made it 10x better.",
        likes: 5,
      }
    ]
  },
  {
    id: "seed-2",
    author: "Zenith",
    avatar: "/images/logo.png",
    timeAgo: "5 hours ago",
    content: "Make sure you watch through the credits. The post-credit scene sets up the entire next arc!",
    likes: 31,
    isSpoiler: true,
  },
  {
    id: "seed-3",
    author: "Akane",
    avatar: "/images/waifus/1.png",
    timeAgo: "1 day ago",
    content: "Best episode so far! Voice acting was on another level.",
    likes: 12,
    isSpoiler: false,
  }
];

const CommentItem = ({ comment, onLike, onReply }) => {
  const [revealed, setRevealed] = useState(!comment.isSpoiler);
  const [hasLiked, setHasLiked] = useState(false);

  const handleLike = () => {
    if (!hasLiked) {
      setHasLiked(true);
      onLike(comment.id);
    }
  };

  return (
    <div className="flex gap-3 py-3 border-b border-slate-100 dark:border-[#1E2235]/60 last:border-b-0">
      <div className="relative w-9 h-9 rounded-full overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
        <Image
          src={comment.avatar || "/images/logo.png"}
          alt={comment.author}
          fill
          sizes="36px"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
            {comment.author}
          </span>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">
            {comment.timeAgo}
          </span>
          {comment.isSpoiler && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-medium">
              Spoiler
            </span>
          )}
        </div>

        {/* Content */}
        <div className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {comment.isSpoiler && !revealed ? (
            <button
              onClick={() => setRevealed(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-[#161926] text-amber-600 dark:text-amber-400 text-xs border border-amber-500/20 hover:bg-slate-200 dark:hover:bg-[#1E2338] transition-colors"
            >
              <FaTriangleExclamation className="w-3 h-3" />
              <span>Contains spoiler — click to reveal</span>
            </button>
          ) : (
            <p className="whitespace-pre-line">{comment.content}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
          <button
            onClick={handleLike}
            className={`inline-flex items-center gap-1 transition-colors ${
              hasLiked ? "text-rose-500 font-semibold" : "hover:text-rose-500 cursor-pointer"
            }`}
          >
            <FaHeart className={`w-3 h-3 ${hasLiked ? "fill-rose-500" : ""}`} />
            <span>{(comment.likes || 0) + (hasLiked ? 1 : 0)}</span>
          </button>

          <button
            onClick={() => onReply(comment.author)}
            className="inline-flex items-center gap-1 hover:text-cyan-500 dark:hover:text-cyan-400 transition-colors cursor-pointer"
          >
            <FaReply className="w-2.5 h-2.5" />
            <span>Reply</span>
          </button>
        </div>

        {/* Nested replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-2 pl-3 border-l-2 border-slate-200 dark:border-[#23283E] space-y-2">
            {comment.replies.map((reply) => (
              <div key={reply.id} className="text-xs py-1">
                <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                  <span>{reply.author}</span>
                  <span className="text-[10px] text-slate-400 font-normal">{reply.timeAgo}</span>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mt-0.5">{reply.content}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Comments = ({ AnimeID, title }) => {
  const pathname = usePathname();
  const { data: session } = useSession();

  const [activeTab, setActiveTab] = useState("community");
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [isSpoiler, setIsSpoiler] = useState(false);
  const [disqusLoading, setDisqusLoading] = useState(true);
  const [disqusBlocked, setDisqusBlocked] = useState(false);

  // Load comments from localStorage with seed fallback
  useEffect(() => {
    if (!AnimeID) return;
    try {
      const storageKey = `hikari_comments_${AnimeID}`;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setComments(JSON.parse(saved));
      } else {
        setComments(SEED_COMMENTS);
      }
    } catch {
      setComments(SEED_COMMENTS);
    }
  }, [AnimeID]);

  // Handle Disqus loading and adblock detection
  useEffect(() => {
    if (activeTab !== "disqus") return;

    setDisqusLoading(true);
    setDisqusBlocked(false);

    // Timeout after 3.5s if Disqus is blocked or fails to inject
    const timer = setTimeout(() => {
      const disqusNode = document.querySelector("#disqus_thread");
      if (!disqusNode || disqusNode.innerHTML.trim() === "") {
        setDisqusBlocked(true);
        setDisqusLoading(false);
      } else {
        setDisqusLoading(false);
      }
    }, 3500);

    const checkInterval = setInterval(() => {
      const disqusNode = document.querySelector("#disqus_thread");
      if (disqusNode && disqusNode.innerHTML.trim() !== "") {
        setDisqusLoading(false);
        clearInterval(checkInterval);
        clearTimeout(timer);
      }
    }, 400);

    return () => {
      clearTimeout(timer);
      clearInterval(checkInterval);
    };
  }, [activeTab]);

  const handlePostComment = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const authorName = session?.user?.name || "Anime Enthusiast";
    const authorAvatar = session?.user?.image?.medium || session?.user?.image?.large || "/images/logo.png";

    const createdComment = {
      id: `comm_${Date.now()}`,
      author: authorName,
      avatar: authorAvatar,
      timeAgo: "Just now",
      content: newComment.trim(),
      likes: 0,
      isSpoiler,
      replies: [],
    };

    const updated = [createdComment, ...comments];
    setComments(updated);
    setNewComment("");
    setIsSpoiler(false);

    try {
      localStorage.setItem(`hikari_comments_${AnimeID}`, JSON.stringify(updated));
    } catch (err) {
      console.warn("[Comments] Could not save to localStorage:", err);
    }
  };

  const handleLike = (commentId) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c))
    );
  };

  const handleReply = (author) => {
    setNewComment((prev) => `@${author} `);
  };

  return (
    <div
      id="comment"
      className="bg-white dark:bg-[#10121A] border border-slate-200/90 dark:border-[#1E2235] relative rounded-2xl pb-6 w-full h-max shadow-xl shadow-black/5 dark:shadow-black/30 transition-colors"
    >
      {/* Header with Dual Tabs */}
      <div className="py-3.5 px-5 border-b border-slate-200 dark:border-[#1E2235] flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <FaComment className="text-cyan-500 dark:text-cyan-400" />
          <h2 className="text-slate-900 dark:text-slate-100 text-base font-bold font-['Outfit']">
            Discussion
          </h2>
          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20">
            {comments.length}
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center p-1 rounded-lg bg-slate-100 dark:bg-[#161926] border border-slate-200/80 dark:border-[#23283E]">
          <button
            type="button"
            onClick={() => setActiveTab("community")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "community"
                ? "bg-white dark:bg-[#0E1017] text-cyan-600 dark:text-cyan-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Community
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("disqus")}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
              activeTab === "disqus"
                ? "bg-white dark:bg-[#0E1017] text-cyan-600 dark:text-cyan-400 shadow-sm font-semibold"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Disqus
          </button>
        </div>
      </div>

      {/* Community Tab Content */}
      {activeTab === "community" && (
        <div className="px-5 pt-4">
          {/* Post Form */}
          <form onSubmit={handlePostComment} className="mb-6">
            <div className="relative border border-slate-200 dark:border-[#23283E] focus-within:border-cyan-500/60 rounded-xl overflow-hidden bg-slate-50 dark:bg-[#0E1017] transition-all">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts on this episode... (Be respectful, keep spoilers tagged!)"
                rows={3}
                className="w-full p-3 bg-transparent outline-none text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
              />

              <div className="flex items-center justify-between px-3 py-2 bg-slate-100/70 dark:bg-[#141724] border-t border-slate-200/80 dark:border-[#1E2235]">
                {/* Spoiler Toggle */}
                <label className="flex items-center gap-1.5 cursor-pointer text-xs text-slate-600 dark:text-slate-400 select-none">
                  <input
                    type="checkbox"
                    checked={isSpoiler}
                    onChange={(e) => setIsSpoiler(e.target.checked)}
                    className="accent-cyan-500 rounded"
                  />
                  <span>Mark as spoiler</span>
                </label>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={!newComment.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-40 text-white text-xs font-semibold shadow-sm transition-all cursor-pointer"
                >
                  <IoSend className="w-3 h-3" />
                  <span>Post</span>
                </button>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-1">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onLike={handleLike}
                onReply={handleReply}
              />
            ))}
          </div>
        </div>
      )}

      {/* Disqus Tab Content with Adblock Fallback */}
      {activeTab === "disqus" && (
        <div className="px-5 pt-4">
          {disqusLoading && !disqusBlocked && (
            <div className="h-44 grid place-content-center text-center">
              <div className="w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin mx-auto mb-2"></div>
              <p className="text-xs text-slate-400">Loading Disqus discussion...</p>
            </div>
          )}

          {disqusBlocked && (
            <div className="p-6 text-center rounded-xl bg-amber-500/10 border border-amber-500/25 my-4">
              <FaTriangleExclamation className="w-6 h-6 text-amber-500 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Disqus was blocked or unavailable
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
                Disqus was blocked by an ad-blocker or tracker protection. You can switch to our Community Discussion tab above to chat freely without any blockers!
              </p>
              <button
                type="button"
                onClick={() => setActiveTab("community")}
                className="mt-3 px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium transition-colors"
              >
                Switch to Community Discussion
              </button>
            </div>
          )}

          <div style={{ display: disqusLoading || disqusBlocked ? "none" : "block" }}>
            <DiscussionEmbed
              shortname={process.env.NEXT_PUBLIC_DISQUS_SHORTNAME || "taro-6"}
              config={{
                url: `${process.env.NEXT_PUBLIC_URL || "https://hikari.app"}${pathname}`,
                identifier: String(AnimeID),
                title: `${title} - Hikari`,
                language: "en",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Comments;
