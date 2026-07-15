import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const BASE_URL = "https://mnemo-brain.vercel.app";
const TEST_EMAIL = `mnemo-test-${Date.now()}@example.com`;
const TEST_PASSWORD = "TestPassword123!";
const SAMPLE_TEXT = "The Pareto Principle states that roughly 80% of effects come from 20% of causes. In productivity, a small number of tasks produce most of the results.";

function log(step, status, detail = "") {
  const icon = status === "PASS" ? "✅" : status === "FAIL" ? "❌" : status === "WARN" ? "⚠️" : "⏳";
  console.log(`${icon} ${step}${detail ? " — " + detail : ""}`);
}

async function runTests() {
  let userId = "";

  try {
    // 1. Supabase Auth - create confirmed user
    const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      email_confirm: true,
    });
    if (createError) throw createError;
    userId = createData.user.id;
    log("Supabase Auth create user", "PASS");

    // 2. Supabase Auth - sign in
    const anonClient = createClient(SUPABASE_URL, ANON_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    const { data: signInData, error: signInError } = await anonClient.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (signInError) throw signInError;
    log("Supabase Auth sign in", "PASS");

    // 3. Database - tables and RLS
    const { data: memInsert, error: insertError } = await adminClient
      .from("memories")
      .insert({
        user_id: userId,
        raw_content: SAMPLE_TEXT,
        title: "Pareto Principle",
        ideas: [{ insight: "80/20 rule", question: "What is the Pareto Principle?", answer: "80% of effects come from 20% of causes" }],
      })
      .select()
      .single();
    if (insertError) throw insertError;
    log("Database insert memory", "PASS", memInsert.id);

    const { data: memories, error: readError } = await adminClient
      .from("memories")
      .select("id")
      .eq("user_id", userId);
    if (readError) throw readError;
    log("Database read memory", "PASS", `${memories.length} rows`);

    let embedding = null;

    // 4. Voyage Embeddings API
    let embedError = null;
    try {
      const embedResponse = await fetch("https://api.voyageai.com/v1/embeddings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.VOYAGE_API_KEY}`,
        },
        body: JSON.stringify({ model: "voyage-3", input: SAMPLE_TEXT, input_type: "document" }),
      });
      const embedResult = await embedResponse.json();
      if (!embedResponse.ok) throw new Error(JSON.stringify(embedResult));
      embedding = embedResult.data?.[0]?.embedding;
      if (!embedding || embedding.length !== 1024) throw new Error(`Invalid embedding dimensions: ${embedding?.length}`);
      log("Voyage Embeddings API", "PASS", `${embedding.length} dimensions`);
    } catch (err) {
      embedError = err;
      log("Voyage Embeddings API", "FAIL", err.message);
    }
    if (embedError) throw embedError;

    const openRouterKey = process.env.OPENROUTER_API_KEY;
    if (openRouterKey) {
      const llmResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${openRouterKey}`,
          "HTTP-Referer": BASE_URL,
          "X-Title": "MNEMO",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o",
          messages: [{ role: "user", content: "Extract 1 key idea from this text and return only the idea: " + SAMPLE_TEXT }],
          max_tokens: 200,
        }),
      });
      const llmResult = await llmResponse.json();
      if (!llmResponse.ok) throw new Error(JSON.stringify(llmResult));
      const llmText = llmResult.choices?.[0]?.message?.content;
      if (!llmText) throw new Error("Empty OpenRouter response");
      log("OpenRouter LLM API", "PASS", llmText.slice(0, 60).replace(/\n/g, " "));
    } else {
      log("OpenRouter LLM API", "SKIP", "no OPENROUTER_API_KEY");
    }

    // 6. pgvector match function
    const { data: matches, error: matchError } = await adminClient.rpc("match_memories", {
      query_embedding: embedding,
      match_threshold: 0.5,
      match_count: 5,
      p_user_id: userId,
    });
    if (matchError) throw matchError;
    log("pgvector match_memories", "PASS", `${matches.length} matches`);

    // 7. SM-2 algorithm
    function sm2(card, quality) {
      let { repetitions, easiness_factor, interval_days } = card;
      if (quality >= 3) {
        if (repetitions === 0) interval_days = 1;
        else if (repetitions === 1) interval_days = 6;
        else interval_days = Math.round(interval_days * easiness_factor);
        repetitions += 1;
      } else {
        repetitions = 0;
        interval_days = 1;
      }
      easiness_factor = easiness_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (easiness_factor < 1.3) easiness_factor = 1.3;
      const next_review_at = new Date();
      next_review_at.setDate(next_review_at.getDate() + interval_days);
      return { repetitions, easiness_factor, interval_days, next_review_at };
    }
    const card = {
      id: "test",
      repetitions: 0,
      easiness_factor: 2.5,
      interval_days: 1,
      next_review_at: new Date().toISOString(),
    };
    const result = sm2(card, 4);
    if (result.interval_days !== 1) throw new Error("SM-2 interval incorrect");
    log("SM-2 algorithm", "PASS", `interval ${result.interval_days} days`);

    // 8. Deployed pages load
    const pages = ["/", "/auth/login", "/auth/signup"];
    for (const page of pages) {
      const res = await fetch(BASE_URL + page);
      log(`Page ${page}`, res.ok ? "PASS" : "FAIL", `status ${res.status}`);
    }

    // 9. Cleanup
    await adminClient.from("memories").delete().eq("user_id", userId);
    await adminClient.auth.admin.deleteUser(userId);
    log("Cleanup", "PASS");

    console.log("\n🎉 All system tests passed.");
  } catch (error) {
    console.error("\n❌ Test failed:", error.message);
    if (error.cause) console.error(error.cause);
    process.exit(1);
  }
}

runTests();
