import type { MatchSignal, Observation, RelatedObservationMatch } from '../types';

// Symptom dictionary for cross-category and semantic correlation
const SYMPTOM_CLUSTERS: Record<string, string[]> = {
  moisture_slip: ['water', 'leak', 'leaking', 'drip', 'dripping', 'pipe', 'puddle', 'wet', 'slippery', 'hazard', 'ceiling', 'drain', 'overflow', 'plumbing', 'spill', 'moisture', 'damp'],
  electrical_power: ['spark', 'flicker', 'flickering', 'breaker', 'blackout', 'power', 'outlet', 'wire', 'exposed', 'buzzing', 'shock', 'switch', 'light', 'ballast'],
  hvac_airflow: ['hot', 'cold', 'stuffy', 'ac', 'heating', 'vent', 'chilly', 'freezing', 'air', 'fan', 'temperature', 'humidity', 'airflow', 'thermostat'],
  access_door: ['lock', 'jammed', 'stuck', 'keycard', 'swipe', 'handle', 'hinge', 'latch', 'door', 'gate', 'exit', 'entrance'],
  structural_safety: ['tile', 'crack', 'loose', 'trip', 'stair', 'railing', 'carpet', 'uneven', 'hole', 'ceiling tile', 'debris', 'hazard'],
  sanitation_odor: ['trash', 'overflowing', 'smell', 'odor', 'restroom', 'toilet', 'clogged', 'soap', 'clean', 'dirty', 'pest']
};

/**
 * Tokenize and normalize text into clean unique keywords (filtering out stop words)
 */
function extractTokens(text: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'is', 'was', 'are', 'were', 'it', 'this', 'that', 'there',
    'has', 'have', 'had', 'be', 'been', 'near', 'some', 'one', 'two', 'very',
    'also', 'just', 'noticed', 'reported', 'found', 'getting', 'again'
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Detect shared symptom clusters between two texts
 */
function findSharedSymptomClusters(textA: string, textB: string): { clusters: string[]; sharedTerms: string[] } {
  const tokensA = new Set(extractTokens(textA));
  const tokensB = new Set(extractTokens(textB));

  const sharedTerms: string[] = [];
  tokensA.forEach(t => {
    if (tokensB.has(t)) {
      sharedTerms.push(t);
    }
  });

  const matchingClusters: string[] = [];
  for (const [clusterName, words] of Object.entries(SYMPTOM_CLUSTERS)) {
    const hasA = words.some(w => tokensA.has(w) || textA.toLowerCase().includes(w));
    const hasB = words.some(w => tokensB.has(w) || textB.toLowerCase().includes(w));
    if (hasA && hasB) {
      matchingClusters.push(clusterName);
      // Collect specific words
      words.forEach(w => {
        if ((tokensA.has(w) || tokensB.has(w)) && !sharedTerms.includes(w)) {
          sharedTerms.push(w);
        }
      });
    }
  }

  return { clusters: matchingClusters, sharedTerms: sharedTerms.slice(0, 6) };
}

/**
 * Compare two locations for similarity
 */
function evaluateLocationProximity(obsA: Observation, obsB: Observation): { score: number; detail: string } {
  const buildingA = obsA.building.trim().toLowerCase();
  const buildingB = obsB.building.trim().toLowerCase();

  if (!buildingA || !buildingB) {
    return { score: 10, detail: 'Indeterminate building location' };
  }

  // Exact building match
  if (buildingA === buildingB) {
    const locA = obsA.specificLocation.toLowerCase();
    const locB = obsB.specificLocation.toLowerCase();

    // Check specific room or corridor token overlap
    const tokensA = extractTokens(locA);
    const tokensB = extractTokens(locB);
    const overlap = tokensA.filter(t => tokensB.includes(t));

    if (overlap.length >= 2 || locA === locB) {
      return {
        score: 95,
        detail: `Exact area match in ${obsA.building} (${overlap.length > 0 ? overlap.join(', ') : 'identical zone'})`
      };
    } else if (overlap.length === 1) {
      return {
        score: 75,
        detail: `Shared vicinity in ${obsA.building} (near: ${overlap[0]})`
      };
    } else {
      return {
        score: 55,
        detail: `Same building (${obsA.building}), different specific room/wing`
      };
    }
  }

  // Different buildings
  return {
    score: 0,
    detail: `Different buildings (${obsA.building} vs ${obsB.building})`
  };
}

/**
 * Evaluate temporal proximity between two observations
 */
function evaluateTemporalProximity(timestampA: string, timestampB: string): { score: number; deltaHours: number; detail: string } {
  const timeA = new Date(timestampA).getTime();
  const timeB = new Date(timestampB).getTime();
  const deltaHours = Math.abs(timeA - timeB) / (1000 * 60 * 60);

  let score = 0;
  let detail = '';

  if (deltaHours <= 12) {
    score = 95;
    detail = `Within ${Math.round(deltaHours)} hours of prior observation (Immediate temporal window)`;
  } else if (deltaHours <= 48) {
    score = 85;
    detail = `${Math.round(deltaHours)} hours apart (~${Math.round(deltaHours / 24)} days) — active sequence`;
  } else if (deltaHours <= 168) { // 7 days
    score = 70;
    detail = `${Math.round(deltaHours / 24)} days apart — recurring within weekly cycle`;
  } else if (deltaHours <= 720) { // 30 days
    score = 45;
    detail = `${Math.round(deltaHours / 24)} days apart — potential medium-term pattern`;
  } else {
    score = 20;
    detail = `Over ${Math.round(deltaHours / 24)} days apart — historical background reference`;
  }

  return { score, deltaHours, detail };
}

/**
 * Core Multi-Signal Matcher:
 * Evaluates candidate observation against an existing observation in Problem Memory.
 */
export function analyzeObservationRelationship(
  candidate: Observation,
  existing: Observation
): RelatedObservationMatch | null {
  if (candidate.id === existing.id) return null;

  const signals: MatchSignal[] = [];

  // 1. Location Signal (Weight: 35%)
  const locResult = evaluateLocationProximity(candidate, existing);
  signals.push({
    type: 'location_proximity',
    label: 'Physical Proximity',
    detail: locResult.detail,
    score: locResult.score,
    weight: 0.35
  });

  // If completely different buildings, threshold is high unless strong specific symptoms
  if (locResult.score === 0) {
    // Return early if buildings differ
    return null;
  }

  // 2. Temporal Signal (Weight: 25%)
  const timeResult = evaluateTemporalProximity(candidate.timestamp, existing.timestamp);
  signals.push({
    type: 'temporal_proximity',
    label: 'Temporal Sequence',
    detail: timeResult.detail,
    score: timeResult.score,
    weight: 0.25
  });

  // 3. Symptom & Semantic Overlap (Weight: 30%)
  const fullTextCand = `${candidate.title} ${candidate.description}`;
  const fullTextExist = `${existing.title} ${existing.description}`;
  const symptomResult = findSharedSymptomClusters(fullTextCand, fullTextExist);

  let symptomScore = 15;
  let symptomDetail = 'No distinct shared symptom keywords identified';

  if (symptomResult.sharedTerms.length > 0) {
    symptomScore = Math.min(100, 40 + (symptomResult.sharedTerms.length * 15));
    symptomDetail = `Shared symptom signals: [${symptomResult.sharedTerms.map(s => `"${s}"`).join(', ')}]`;
  }

  signals.push({
    type: 'symptom_overlap',
    label: 'Symptom & Keyword Overlap',
    detail: symptomDetail,
    score: symptomScore,
    weight: 0.30
  });

  // 4. Category Alignment (Weight: 10%)
  const exactCategory = candidate.category === existing.category;
  // Cross-category synergy (e.g. plumbing leak + safety slip hazard)
  const isSynergisticCrossCategory = 
    (candidate.category === 'plumbing' && existing.category === 'safety') ||
    (candidate.category === 'safety' && existing.category === 'plumbing') ||
    (candidate.category === 'electrical' && existing.category === 'safety') ||
    (candidate.category === 'hvac' && existing.category === 'structural');

  let catScore = 30;
  let catDetail = `Categories: ${candidate.category} vs ${existing.category}`;

  if (exactCategory) {
    catScore = 90;
    catDetail = `Exact category match: ${candidate.category.toUpperCase()}`;
  } else if (isSynergisticCrossCategory) {
    catScore = 75;
    catDetail = `Interdependent categories (${candidate.category} & ${existing.category}) known to produce secondary hazards`;
  }

  signals.push({
    type: 'category_match',
    label: 'Category Alignment',
    detail: catDetail,
    score: catScore,
    weight: 0.10
  });

  // Calculate Weighted Confidence Score
  const totalScore = Math.round(
    signals.reduce((acc, sig) => acc + (sig.score * sig.weight), 0)
  );

  // Confidence Filter threshold: minimum 45 to consider as an AI-suggested match
  if (totalScore < 45) {
    return null;
  }

  let confidenceLevel: 'Low' | 'Moderate' | 'High' | 'Very High' = 'Low';
  if (totalScore >= 80) confidenceLevel = 'Very High';
  else if (totalScore >= 68) confidenceLevel = 'High';
  else if (totalScore >= 52) confidenceLevel = 'Moderate';

  // Construct Responsible Explanation
  const explanation = [
    `Detected in ${candidate.building} (${locResult.detail}).`,
    timeResult.detail,
    symptomResult.sharedTerms.length > 0 
      ? `Symptom indicators identified: ${symptomResult.sharedTerms.slice(0, 4).join(', ')}.`
      : 'Contextual facility proximity match.',
    'Note: AI correlation highlights potential recurrence or downstream consequences; field inspection is strictly required to verify physical causation.'
  ].join(' ');

  return {
    targetObservationId: existing.id,
    overallConfidence: totalScore,
    confidenceLevel,
    signals,
    summaryExplanation: explanation,
    verificationStatus: 'unverified'
  };
}

/**
 * Scan candidate observation against an array of existing observations
 * Returns sorted list of suggested matches
 */
export function findSuggestedMatches(
  candidate: Observation,
  allObservations: Observation[]
): RelatedObservationMatch[] {
  const matches: RelatedObservationMatch[] = [];

  for (const existing of allObservations) {
    const match = analyzeObservationRelationship(candidate, existing);
    if (match) {
      matches.push(match);
    }
  }

  return matches.sort((a, b) => b.overallConfidence - a.overallConfidence);
}
