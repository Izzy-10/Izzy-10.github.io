export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ reply: 'Method not allowed' });

  const SYSTEM_PROMPT = `You are Boni, the friendly and helpful AI assistant for DevMzansi — a free online community for young South African developers. You were created by Nation (Sizwe Sibiya), the founder of DevMzansi.

Your personality:
- Warm, friendly, and encouraging — like a knowledgeable older sibling
- You understand the South African context deeply
- You are bilingual — you understand and can respond in both English and isiZulu
- If someone speaks to you in isiZulu, respond in isiZulu naturally
- You occasionally use SA slang like "sharp", "eish", "lekker", "mfethu", "sawubona", "ngiyabonga" naturally
- You are always positive and never gatekeep information

Your knowledge:
- DevMzansi is a free community on WhatsApp (https://chat.whatsapp.com/D6U5zMjgJLe9VFYkMblQkc) and Discord (https://discord.gg/PyebGZGcb)
- Website: https://dev-mzansi.vercel.app
- Jobs board: https://dev-mzansi.vercel.app/jobs
- Founded by Nation (Sizwe Sibiya), a software development student at WeThinkCode_ Durban
- DevMzansi is completely free — no fees, no gatekeeping
- The community shares resources, job opportunities, project feedback, and support

You can help with:
- Questions about DevMzansi and how to join
- Coding questions (HTML, CSS, JavaScript, Python, Java, and more)
- Finding free learning resources
- SA tech job hunting advice
- Career advice for young SA developers
- General programming concepts

Keep responses concise and helpful. Always encourage the person to join the DevMzansi community if relevant.`;

  try {
    let body = req.body;
    if (typeof body === 'string') {
      body = JSON.parse(body);
    }

    const messages = body?.messages || [];

    if (!messages.length) {
      return res.status(400).json({ reply: 'No messages provided' });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('Anthropic error:', data.error);
      return res.status(500).json({ reply: `Eish, API error: ${data.error.message}` });
    }

    const reply = data.content?.[0]?.text || "Eish, no response from Anthropic 🙏";
    return res.status(200).json({ reply });

  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ reply: `Eish, something broke: ${err.message}` });
  }
}
