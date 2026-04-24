const OpenAI = require('openai');
const logger = require('../utils/logger');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const analyzeCV = async (cvText, jobDescription = '') => {
  const prompt = `You are an expert HR recruiter. Analyze the following CV and return a JSON object.

CV TEXT:
${cvText}

JOB DESCRIPTION:
${jobDescription}

Return ONLY valid JSON with this exact structure:
{
  "skills": ["skill1", "skill2"],
  "experience": "brief summary of experience level and years",
  "summary": "2-3 sentence professional summary",
  "matchScore": 75
}

matchScore (0-100) reflects how well the CV matches the job description. If no job description, score general employability.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  });

  const result = JSON.parse(response.choices[0].message.content);
  return {
    skills: result.skills || [],
    experience: result.experience || '',
    summary: result.summary || '',
    matchScore: Math.min(100, Math.max(0, result.matchScore || 0)),
  };
};

const REGION_MAP = `
Region mapping (use the city/area mentioned to pick the right region):
- צפון: חיפה, נהריה, עכו, טבריה, נצרת, קריות, עפולה, צפת, כרמיאל
- מרכז: תל אביב, רמת גן, גבעתיים, פתח תקוה, ראשון לציון, חולון, בת ים, אור יהודה, בני ברק
- גוש דן: same as מרכז + ראשון לציון, לוד, רמלה
- ירושלים: ירושלים, בית שמש, מעלה אדומים
- דרום: באר שבע, אשדוד, אשקלון, אילת, קריית גת, נתיבות
- שרון: נתניה, הרצליה, כפר סבא, רעננה, הוד השרון, רא'אנה
- אחר: anything else or unknown
`;

const parseJobFromEmail = async (subject, body) => {
  const prompt = `You are an HR assistant. Parse the following email and extract job posting data.
The email may be in Hebrew or English.

SUBJECT: ${subject}
BODY: ${body}

${REGION_MAP}

Return ONLY valid JSON:
{
  "title": "job title",
  "companyName": "company name if mentioned",
  "location": "job location/city in Hebrew",
  "region": "one of: צפון | מרכז | גוש דן | ירושלים | דרום | שרון | אחר",
  "salary": "salary range if mentioned",
  "description": "full job description",
  "requirements": ["requirement1", "requirement2"],
  "skills": ["skill1", "skill2"]
}

If a field is not found, use empty string or empty array. region must be one of the exact values listed.`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  });

  return JSON.parse(response.choices[0].message.content);
};

module.exports = { analyzeCV, parseJobFromEmail };
