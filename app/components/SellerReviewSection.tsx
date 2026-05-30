"use client";
import React, { useEffect, useState } from "react";
import { Star, ChevronDown, ChevronUp, Send } from "lucide-react";
import { API_BASE_URL } from "@/app/constants/api";

interface Review {
  id: number;
  rating: number;
  comment: string;
  createdAt: string;
  author?: {
    id: number;
    username: string;
    avatar?: string;
  };
}

interface Props {
  sellerId?: number | string;
  currentUserId?: number | string;
  isOwnProduct: boolean;
}

const toAbsoluteImageUrl = (url: string): string => {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE_URL}${url}`;
};

const timeAgo = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
};

export default function SellerReviewSection({ sellerId, currentUserId, isOwnProduct }: Props) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  /* ── fetch reviews ── */
  useEffect(() => {
    if (!sellerId) return;
    setIsLoading(true);
    fetch(
      `${API_BASE_URL}/api/reviews?filters[recipient][id][$eq]=${sellerId}&populate[author][fields][0]=username&populate[author][fields][1]=avatar&sort=createdAt:desc&pagination[limit]=20`
    )
      .then((r) => r.json())
      .then((data) => {
        const items: Review[] = (data?.data ?? []).map((r: any) => ({
          id: r.id,
          rating: r.rating ?? r.attributes?.rating ?? 0,
          comment: r.comment ?? r.attributes?.comment ?? "",
          createdAt: r.createdAt ?? r.attributes?.createdAt ?? "",
          author: r.author ?? r.attributes?.author?.data
            ? {
                id: r.attributes.author.data.id,
                username: r.attributes.author.data.attributes?.username,
                avatar: r.attributes.author.data.attributes?.avatar,
              }
            : undefined,
        }));
        setReviews(items);
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [sellerId, submitSuccess]);

  /* ── submit review ── */
  const handleSubmit = async () => {
    if (!selectedRating || !comment.trim() || !sellerId || !currentUserId) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch(`${API_BASE_URL}/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: {
            rating: selectedRating,
            comment: comment.trim(),
            recipient: Number(sellerId),
            author: Number(currentUserId),
          },
        }),
      });
      if (!res.ok) throw new Error("Failed to submit review.");
      setSubmitSuccess((v) => !v); // toggle to re-fetch
      setComment("");
      setSelectedRating(0);
      setShowForm(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0;

  const visibleReviews = expanded ? reviews : reviews.slice(0, 2);
  const canReview = !!currentUserId && !isOwnProduct;

  return (
    <div className="px-4 py-3 space-y-3">

      {/* ── Header row ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-[#1a1a1a] font-sans tracking-wide uppercase">
            Reviews
          </span>
          {reviews.length > 0 && (
            <span className="flex items-center gap-1">
              <span className="text-[11px] font-bold text-[#c0613a] font-sans">{avgRating.toFixed(1)}</span>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={10}
                    className={s <= Math.round(avgRating) ? "text-[#f0a500]" : "text-[#e0d8d2]"}
                    fill={s <= Math.round(avgRating) ? "currentColor" : "currentColor"}
                  />
                ))}
              </div>
              <span className="text-[10px] text-[#aaa] font-sans">({reviews.length})</span>
            </span>
          )}
        </div>

        {canReview && (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-[11px] font-semibold text-[#c0613a] font-sans hover:underline transition-colors"
          >
            {showForm ? "Cancel" : "+ Write a review"}
          </button>
        )}
      </div>

      {/* ── Write review form ── */}
      {showForm && canReview && (
        <div className="rounded-xl border border-[#f0ddd3] bg-[#fdf9f7] p-3 space-y-2.5">
          {/* Star picker */}
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((s) => (
              <button
                key={s}
                onMouseEnter={() => setHoverRating(s)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setSelectedRating(s)}
                className="transition-transform hover:scale-110"
                aria-label={`Rate ${s} star${s > 1 ? "s" : ""}`}
              >
                <Star
                  size={20}
                  className={
                    s <= (hoverRating || selectedRating)
                      ? "text-[#f0a500]"
                      : "text-[#ddd]"
                  }
                  fill={s <= (hoverRating || selectedRating) ? "currentColor" : "currentColor"}
                />
              </button>
            ))}
            {selectedRating > 0 && (
              <span className="ml-1.5 text-[11px] text-[#888] font-sans">
                {["", "Poor", "Fair", "Good", "Very good", "Excellent"][selectedRating]}
              </span>
            )}
          </div>

          {/* Comment textarea */}
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this seller…"
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-xl border border-[#e8e2db] bg-white px-3 py-2.5 text-[12px] text-[#333] font-sans placeholder:text-[#bbb] focus:outline-none focus:border-[#c0613a] transition-colors"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#bbb] font-sans">{comment.length}/500</span>
            {submitError && (
              <span className="text-[10px] text-red-400 font-sans">{submitError}</span>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || !selectedRating || !comment.trim()}
              className="flex items-center gap-1.5 rounded-full bg-[#c0613a] px-4 py-1.5 text-[11px] font-semibold text-white font-sans transition-all hover:bg-[#a8502e] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send size={11} />
              {submitting ? "Sending…" : "Post"}
            </button>
          </div>
        </div>
      )}

      {/* ── Reviews list ── */}
      {isLoading ? (
        <div className="space-y-2.5">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-[#ede8e2] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-2 w-24 rounded bg-[#ede8e2]" />
                <div className="h-2 w-full rounded bg-[#ede8e2]" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <p className="text-[11px] text-[#bbb] font-sans text-center py-2">
          No reviews yet — be the first!
        </p>
      ) : (
        <div className="space-y-3">
          {visibleReviews.map((review) => (
            <div key={review.id} className="flex gap-2.5">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {review.author?.avatar ? (
                  <img
                    src={toAbsoluteImageUrl(review.author.avatar)}
                    alt={review.author.username}
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#c0613a] flex items-center justify-center text-white text-[10px] font-bold font-sans">
                    {(review.author?.username ?? "?").charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#1a1a1a] font-sans truncate">
                    {review.author?.username ?? "Anonymous"}
                  </span>
                  <span className="text-[10px] text-[#bbb] font-sans flex-shrink-0">
                    {timeAgo(review.createdAt)}
                  </span>
                </div>
                <div className="flex mt-0.5 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star
                      key={s}
                      size={9}
                      className={s <= review.rating ? "text-[#f0a500]" : "text-[#e0d8d2]"}
                      fill="currentColor"
                    />
                  ))}
                </div>
                <p className="text-[11px] text-[#666] font-sans leading-relaxed line-clamp-3">
                  {review.comment}
                </p>
              </div>
            </div>
          ))}

          {/* Show more / less */}
          {reviews.length > 2 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              className="flex items-center gap-1 text-[11px] text-[#c0613a] font-semibold font-sans hover:underline w-full justify-center pt-1"
            >
              {expanded ? (
                <><ChevronUp size={12} /> Show less</>
              ) : (
                <><ChevronDown size={12} /> View all {reviews.length} reviews</>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
}