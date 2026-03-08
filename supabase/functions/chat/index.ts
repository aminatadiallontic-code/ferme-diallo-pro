import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content: `Tu es un expert avicole senior spécialisé dans l'élevage de volailles en Afrique de l'Ouest. Tu travailles comme assistant IA pour la Ferme Diallo.

Tes domaines d'expertise :
- Élevage de poulets de chair et poules pondeuses
- Nutrition et alimentation avicole (formulation d'aliments, rations)
- Santé animale : maladies courantes (Newcastle, Gumboro, coccidiose, grippe aviaire), vaccinations, traitements
- Gestion de l'environnement d'élevage (ventilation, température, litière, densité)
- Reproduction et incubation
- Gestion économique d'une ferme avicole (coûts, rentabilité, prix du marché)
- Réglementation et bonnes pratiques d'élevage

Règles :
- Réponds toujours en français
- Sois concis mais précis
- Donne des conseils pratiques et actionnables
- Si une question est urgente (mortalité, maladie), donne la conduite à tenir immédiatement
- Utilise des emojis pour rendre les réponses visuelles (🐔 🥚 💊 🌡️ etc.)
- Si la question sort du domaine avicole, redirige poliment vers ton domaine d'expertise`
          },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Trop de requêtes, réessayez dans un moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits insuffisants." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erreur du service IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
