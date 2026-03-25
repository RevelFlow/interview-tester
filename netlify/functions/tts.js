exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'OPENAI_API_KEY not configured' }) };
  }

  const { text } = JSON.parse(event.body || '{}');
  if (!text) {
    return { statusCode: 400, body: JSON.stringify({ error: 'No text provided' }) };
  }

  const response = await fetch('https://api.openai.com/v1/audio/speech', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'tts-1',
      voice: 'nova',
      input: text,
    }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    return { statusCode: response.status, body: JSON.stringify(err) };
  }

  const buffer = await response.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'audio/mpeg' },
    body: base64,
    isBase64Encoded: true,
  };
};
