"use client";

import React, { useState } from "react";
import { Star, Loader2, MessageCircle } from "lucide-react";
import { submitCourseReviewAction } from "@/app/courses/actions";

interface Review {
  id: string;
  rating: number;
  review_text: string;
  created_at: string;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

interface CourseReviewSectionProps {
  courseId: string;
  hasPurchased: boolean;
  reviews: Review[];
  hasReviewed: boolean;
}

export default function CourseReviewSection({ courseId, hasPurchased, reviews, hasReviewed }: CourseReviewSectionProps) {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [reviewText, setReviewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      setMessage({ text: "Please select a star rating.", type: "error" });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    const res = await submitCourseReviewAction(courseId, rating, reviewText);
    setIsSubmitting(false);

    if (res.success) {
      setMessage({ text: "Your review has been submitted successfully! It will appear shortly.", type: "success" });
      setRating(0);
      setReviewText("");
    } else {
      setMessage({ text: res.error || "Failed to submit review.", type: "error" });
    }
  };

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) 
    : "0.0";

  return (
    <div className="mt-12 pt-12 border-t border-[var(--border-color)]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <Star className="w-8 h-8 text-yellow-400 fill-current" />
            Student Reviews
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-3xl font-bold text-[var(--text-primary)]">{averageRating}</span>
            <div className="flex text-yellow-400">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star key={star} className={`w-5 h-5 ${star <= Math.round(Number(averageRating)) ? "fill-current" : "opacity-30"}`} />
              ))}
            </div>
            <span className="text-[var(--text-secondary)] font-bold">({reviews.length} {reviews.length === 1 ? 'review' : 'reviews'})</span>
          </div>
        </div>
      </div>

      {/* Review Submission Form */}
      {hasPurchased && !hasReviewed && (
        <div className="bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-[20px] p-6 md:p-8 mb-10">
          <h3 className="font-heading text-lg font-bold text-[var(--text-primary)] mb-4">Write a Review</h3>
          
          {message && (
            <div className={`p-4 rounded-[12px] text-sm font-bold mb-6 ${message.type === 'success' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
              {message.text}
            </div>
          )}

          {message?.type !== 'success' && (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Overall Rating *</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        className={`w-8 h-8 ${
                          star <= (hoverRating || rating) 
                            ? "text-yellow-400 fill-current" 
                            : "text-[var(--border-color)]"
                        }`} 
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-[var(--text-secondary)] mb-2">Your Review (Optional)</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="What did you like about this course?"
                  rows={4}
                  className="w-full bg-[var(--bg-primary)] border border-[var(--border-color)] text-[var(--text-primary)] rounded-[12px] py-3 px-4 focus:outline-none focus:border-[var(--brand-primary)] transition-colors resize-none"
                ></textarea>
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="btn-primary px-8 flex items-center gap-2"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <MessageCircle className="w-5 h-5" />}
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12 border border-[var(--border-color)] rounded-[20px] bg-[var(--bg-secondary)]">
            <MessageCircle className="w-10 h-10 text-[var(--border-color)] mx-auto mb-4" />
            <p className="text-[var(--text-secondary)] font-bold">No reviews yet.</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review.id} className="p-6 rounded-[20px] bg-[var(--bg-secondary)] border border-[var(--border-color)]">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-[var(--bg-primary)] border border-[var(--border-color)] overflow-hidden flex items-center justify-center">
                    {review.profiles?.avatar_url ? (
                      <img src={review.profiles.avatar_url} alt={review.profiles.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-[var(--brand-primary)] font-bold text-lg">
                        {(review.profiles?.full_name || "?")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-[var(--text-primary)] font-heading">{review.profiles?.full_name || "Student"}</h4>
                    <p className="text-xs text-[var(--text-secondary)]">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "opacity-30"}`} />
                  ))}
                </div>
              </div>
              {review.review_text && (
                <p className="text-[var(--text-secondary)] leading-relaxed">{review.review_text}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
