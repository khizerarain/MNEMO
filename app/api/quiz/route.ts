import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { sm2 } from "@/lib/sm2";

export const dynamic = "force-dynamic";

/**
 * POST /api/quiz
 *
 * Applies the SM-2 spaced repetition algorithm to a quiz card after the user
 * rates how well they remembered the answer. The SM-2 algorithm returns the
 * next review date, which we save back into the `quiz_cards` table.
 *
 * Body: { cardId: string, quality: number }
 * quality must be between 0 and 5 (SM-2 convention).
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { cardId, quality } = body as { cardId: string; quality: number };

    // Validate the incoming payload before touching the database.
    if (!cardId || typeof quality !== "number") {
      return NextResponse.json(
        { error: "Card ID and quality rating are required" },
        { status: 400 }
      );
    }

    if (quality < 0 || quality > 5) {
      return NextResponse.json(
        { error: "Quality must be between 0 and 5" },
        { status: 400 }
      );
    }

    // Load the existing card so we can run SM-2 on its current state.
    const { data: card, error: cardError } = await supabase
      .from("quiz_cards")
      .select("id, user_id, repetitions, easiness_factor, interval_days, next_review_at")
      .eq("id", cardId)
      .single();

    if (cardError || !card) {
      return NextResponse.json(
        { error: "Card not found" },
        { status: 404 }
      );
    }

    // Ensure users can only update their own cards.
    if (card.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Run SM-2 to compute the new interval and next review date.
    const result = sm2(card, quality);

    // Persist the updated SM-2 state back to Supabase.
    const { error: updateError } = await supabase
      .from("quiz_cards")
      .update({
        repetitions: result.repetitions,
        easiness_factor: result.easiness_factor,
        interval_days: result.interval_days,
        next_review_at: result.next_review_at.toISOString(),
      })
      .eq("id", cardId);

    if (updateError) {
      console.error("Failed to update quiz card:", updateError);
      return NextResponse.json(
        { error: "Failed to update quiz card" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Quiz error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
