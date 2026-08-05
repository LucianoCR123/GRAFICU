export const AGE_BRACKETS = [
  { key: "13-17", min: 13, max: 17 },
  { key: "18-24", min: 18, max: 24 },
  { key: "25-34", min: 25, max: 34 },
  { key: "35-44", min: 35, max: 44 },
  { key: "45-54", min: 45, max: 54 },
  { key: "55-64", min: 55, max: 64 },
  { key: "65+", min: 65, max: 200 },
];

export function getAgeBracket(birthYear) {
  const age = new Date().getFullYear() - birthYear;
  return AGE_BRACKETS.find((b) => age >= b.min && age <= b.max)?.key ?? "otro";
}

function emptyBucket(optionIds) {
  const counts = Object.fromEntries(optionIds.map((id) => [id, 0]));
  return { totalVotes: 0, counts, percent: { ...counts } };
}

function addVoteToBucket(bucket, optionId) {
  bucket.totalVotes += 1;
  bucket.counts[optionId] = (bucket.counts[optionId] || 0) + 1;
}

function finalizePercentages(bucket) {
  for (const optionId of Object.keys(bucket.counts)) {
    bucket.percent[optionId] = bucket.totalVotes
      ? Math.round((bucket.counts[optionId] / bucket.totalVotes) * 1000) / 10
      : 0;
  }
}

// votes: [{ optionId, counterOptionId, user: { gender, birthYear, country } }]
// filters: { country?, gender?, ageBracket? } subconjunto opcional
export function aggregatePollResults(poll, votes, filters = {}) {
  const optionIds = poll.options.map((o) => o.id);

  const overall = emptyBucket(optionIds);
  const byCountry = {};
  const byGender = {};
  const byAgeBracket = {};
  const hasFilters = Boolean(filters.country || filters.gender || filters.ageBracket);
  const filtered = hasFilters ? emptyBucket(optionIds) : null;

  let consistentCount = 0;
  let totalAnsweredBoth = 0;
  const matrix = {};
  if (poll.counterQuestion) {
    for (const optId of optionIds) {
      matrix[optId] = Object.fromEntries(optionIds.map((id) => [id, 0]));
    }
  }

  for (const vote of votes) {
    const { gender, birthYear, country } = vote.user;
    const ageBracket = getAgeBracket(birthYear);

    addVoteToBucket(overall, vote.optionId);

    if (!byCountry[country]) byCountry[country] = emptyBucket(optionIds);
    addVoteToBucket(byCountry[country], vote.optionId);

    if (!byGender[gender]) byGender[gender] = emptyBucket(optionIds);
    addVoteToBucket(byGender[gender], vote.optionId);

    if (!byAgeBracket[ageBracket]) byAgeBracket[ageBracket] = emptyBucket(optionIds);
    addVoteToBucket(byAgeBracket[ageBracket], vote.optionId);

    if (filtered) {
      const matchesCountry = !filters.country || filters.country === country;
      const matchesGender = !filters.gender || filters.gender === gender;
      const matchesAge = !filters.ageBracket || filters.ageBracket === ageBracket;
      if (matchesCountry && matchesGender && matchesAge) {
        addVoteToBucket(filtered, vote.optionId);
      }
    }

    if (poll.counterQuestion && vote.counterOptionId) {
      totalAnsweredBoth += 1;
      if (vote.counterOptionId === vote.optionId) consistentCount += 1;
      matrix[vote.optionId][vote.counterOptionId] += 1;
    }
  }

  finalizePercentages(overall);
  Object.values(byCountry).forEach(finalizePercentages);
  Object.values(byGender).forEach(finalizePercentages);
  Object.values(byAgeBracket).forEach(finalizePercentages);
  if (filtered) finalizePercentages(filtered);

  const crosstab = poll.counterQuestion
    ? {
        totalAnsweredBoth,
        consistentCount,
        consistencyRate: totalAnsweredBoth
          ? Math.round((consistentCount / totalAnsweredBoth) * 1000) / 10
          : 0,
        matrix,
      }
    : null;

  return {
    totalVotes: votes.length,
    overall,
    byCountry,
    byGender,
    byAgeBracket,
    filtered,
    crosstab,
  };
}
