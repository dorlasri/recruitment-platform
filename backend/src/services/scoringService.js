const calculateScore = (application, questionnaire) => {
  const { aiAnalysis } = application;
  const score = { skillsMatch: 0, experienceMatch: 0, availability: 0, salaryFit: 0 };

  // Skills match (0-50): derived from AI match score
  if (aiAnalysis?.matchScore != null) {
    score.skillsMatch = Math.round((aiAnalysis.matchScore / 100) * 50);
  }

  // Experience match (0-30): based on skills count and experience summary
  const skillCount = aiAnalysis?.skills?.length || 0;
  if (skillCount >= 10) score.experienceMatch = 30;
  else if (skillCount >= 6) score.experienceMatch = 20;
  else if (skillCount >= 3) score.experienceMatch = 10;
  else score.experienceMatch = 5;

  // Availability (0-10)
  if (questionnaire) {
    const avail = (questionnaire.availability || '').toLowerCase();
    if (avail.includes('immediate') || avail.includes('מיידי') || avail.includes('מידי')) {
      score.availability = 10;
    } else if (avail.includes('week') || avail.includes('שבוע')) {
      score.availability = 7;
    } else if (avail.includes('month') || avail.includes('חודש')) {
      score.availability = 4;
    } else {
      score.availability = 2;
    }

    // Salary fit (0-10): has expectation = shows seriousness
    score.salaryFit = questionnaire.salaryExpectation ? 8 : 5;
  } else {
    score.availability = 5;
    score.salaryFit = 5;
  }

  score.totalScore = score.skillsMatch + score.experienceMatch + score.availability + score.salaryFit;
  return score;
};

module.exports = { calculateScore };
