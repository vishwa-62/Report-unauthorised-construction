// Mock AI Analysis Service for Construction Image Verification

const VIOLATIONS = [
  {
    label: 'Illegal Building',
    minConf: 82,
    maxConf: 97,
    recommendation: 'High probability of unauthorized structural foundation. Compare with municipal agricultural or zone permissions. Propose immediate halt order.'
  },
  {
    label: 'Road Encroachment',
    minConf: 75,
    maxConf: 95,
    recommendation: 'Boundary wall or structure extends past property grid line. Recommend inspection to measure distance from the main road center line.'
  },
  {
    label: 'Commercial Conversion',
    minConf: 70,
    maxConf: 92,
    recommendation: 'Commercial storefront or shutter structure detected in residential zone. Cross-verify with building usage licenses.'
  },
  {
    label: 'Extra Floor',
    minConf: 80,
    maxConf: 98,
    recommendation: 'Height profile exceeds standard floor approvals. Verify structure elevation certificates and FSI (Floor Space Index) records.'
  },
  {
    label: 'Setback Violation',
    minConf: 65,
    maxConf: 89,
    recommendation: 'Structure margin appears below 3 meters from adjacent building plot line. Request field measurement of side setback width.'
  }
];

function analyzeImage(description = '', fileName = '') {
  // Try to find a matching label based on description keyword keywords
  const descLower = description.toLowerCase();
  let selected = null;

  if (descLower.includes('road') || descLower.includes('encroach') || descLower.includes('footpath') || descLower.includes('drain')) {
    selected = VIOLATIONS[1]; // Road Encroachment
  } else if (descLower.includes('floor') || descLower.includes('height') || descLower.includes('storey') || descLower.includes('story')) {
    selected = VIOLATIONS[3]; // Extra Floor
  } else if (descLower.includes('shop') || descLower.includes('commercial') || descLower.includes('store') || descLower.includes('shutter')) {
    selected = VIOLATIONS[2]; // Commercial Conversion
  } else if (descLower.includes('setback') || descLower.includes('margin') || descLower.includes('touching') || descLower.includes('gap')) {
    selected = VIOLATIONS[4]; // Setback Violation
  } else if (descLower.includes('agricultural') || descLower.includes('building') || descLower.includes('concrete') || descLower.includes('permit')) {
    selected = VIOLATIONS[0]; // Illegal Building
  } else {
    // Choose one at random
    selected = VIOLATIONS[Math.floor(Math.random() * VIOLATIONS.length)];
  }

  // Generate random confidence score
  const confidence = (Math.random() * (selected.maxConf - selected.minConf) + selected.minConf).toFixed(2);

  return {
    prediction_label: selected.label,
    confidence_score: parseFloat(confidence),
    recommendation: selected.recommendation,
    raw_response: JSON.stringify({
      engine_version: "CityGuard-AI-Vision-v2.1",
      timestamp: new Date().toISOString(),
      detected_objects: ["construction_materials", "scaffolding", "structure"],
      analyzed_file: fileName
    })
  };
}

module.exports = {
  analyzeImage
};
