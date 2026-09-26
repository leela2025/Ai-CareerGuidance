const fs = require('fs');
const path = require('path');

// Load skill graph dataset
const skillGraphPath = path.join(__dirname, '..', 'data', 'skillGraph.json');
let skillGraph = [];

try {
  const rawData = fs.readFileSync(skillGraphPath, 'utf8');
  skillGraph = JSON.parse(rawData);
} catch (err) {
  console.error('⚠️ Could not load skillGraph.json, initializing empty graph:', err.message);
  skillGraph = [];
}

/**
 * Normalizes skill strings for robust fuzzy comparison.
 * e.g., 'React.js' -> 'react', 'JavaScript (ES6+)' -> 'javascript es6', 'NodeJS' -> 'node.js/express'
 */
const normalizeSkillName = (name) => {
  if (!name || typeof name !== 'string') return '';
  let clean = name.toLowerCase().trim();
  clean = clean.replace(/(\.js|js)$/i, '');
  if (clean.includes('node')) return 'node.js/express';
  if (clean.includes('react') && !clean.includes('native')) return 'react';
  if (clean.includes('javascript') || clean === 'js') return 'javascript es6';
  if (clean.includes('typescript') || clean === 'ts') return 'typescript';
  if (clean.includes('promise') || clean.includes('async')) return 'async/promises';
  if (clean.includes('html') || clean.includes('css')) return 'html/css';
  if (clean.includes('dom')) return 'dom basics';
  if (clean.includes('docker')) return 'docker basics';
  if (clean.includes('rest')) return 'rest api design';
  if (clean.includes('sql') || clean.includes('database') || clean.includes('mongo')) return 'database modeling (sql/nosql)';
  if (clean.includes('python')) return 'python';
  if (clean.includes('machine learning') || clean === 'ml') return 'machine learning basics';
  if (clean.includes('deep learning') || clean === 'dl') return 'deep learning & neural networks';
  if (clean.includes('prompt') || clean.includes('llm')) return 'large language models & prompt engineering';
  if (clean.includes('rag') || clean.includes('vector')) return 'vector databases & rag';
  return clean;
};

/**
 * Find exact or best matching graph entry for a skill name
 */
const findGraphEntry = (skillName) => {
  if (!skillName) return null;
  const targetNorm = normalizeSkillName(skillName);

  // Exact name match first
  let entry = skillGraph.find((item) => item.skill.toLowerCase() === skillName.toLowerCase());
  if (entry) return entry;

  // Normalized key match
  entry = skillGraph.find((item) => normalizeSkillName(item.skill) === targetNorm);
  if (entry) return entry;

  // Substring match
  entry = skillGraph.find((item) =>
    item.skill.toLowerCase().includes(targetNorm) || targetNorm.includes(item.skill.toLowerCase())
  );
  return entry || null;
};

/**
 * Returns prerequisites for a specified skill
 */
const getPrerequisites = (skillName) => {
  const entry = findGraphEntry(skillName);
  return entry ? entry.prerequisites : [];
};

/**
 * Checks dependency gaps for a target skill against a list of completed skills
 * @param {Array<string>} userCompletedSkills - array of skill names that the user has completed
 * @param {string} targetSkill - skill name being marked or analyzed
 * @returns {Object} { hasGaps: boolean, targetSkill, missingPrerequisites: string[], riskExplanation: string }
 */
const checkDependencyGaps = (userCompletedSkills = [], targetSkill = '') => {
  const entry = findGraphEntry(targetSkill);

  if (!entry || !entry.prerequisites || entry.prerequisites.length === 0) {
    return {
      hasGaps: false,
      targetSkill,
      missingPrerequisites: [],
      riskExplanation: '',
    };
  }

  // Normalize user's completed skill pool
  const normalizedUserSkills = (userCompletedSkills || []).map((s) => normalizeSkillName(s));

  // Identify missing prerequisites
  const missingPrerequisites = entry.prerequisites.filter((prereq) => {
    const normPrereq = normalizeSkillName(prereq);
    return !normalizedUserSkills.some((us) => us === normPrereq || us.includes(normPrereq));
  });

  const hasGaps = missingPrerequisites.length > 0;
  let riskExplanation = '';

  if (hasGaps) {
    riskExplanation = `Attempting to master '${targetSkill}' without verified mastery of ${missingPrerequisites.join(
      ', '
    )} creates foundational fragility. Learners skipping these fundamentals typically struggle with advanced debugging, performance bottlenecks, and technical interview scrutiny.`;
  }

  return {
    hasGaps,
    targetSkill: entry.skill,
    missingPrerequisites,
    riskExplanation,
  };
};

/**
 * Performs a comprehensive scan across all milestones in a roadmap
 * @param {Array<Object>} milestones - roadmap milestone documents
 * @returns {Object} summary report with all detected gaps
 */
const checkAllRoadmapGaps = (milestones = []) => {
  const reports = [];
  const completedSkills = [];

  // Sort milestones by order to simulate learning trajectory
  const sorted = [...milestones].sort((a, b) => (a.order || 0) - (b.order || 0));

  for (const m of sorted) {
    const isCompleted = m.status === 'completed';
    const isVerified = Boolean(m.verified);

    // Check if this milestone has prerequisite gaps based on skills marked before it
    const gapCheck = checkDependencyGaps(completedSkills, m.skillName);

    if (gapCheck.hasGaps) {
      reports.push({
        milestoneId: m._id || m.skillId,
        skillName: m.skillName,
        status: m.status,
        verified: isVerified,
        missingPrerequisites: gapCheck.missingPrerequisites,
        riskExplanation: gapCheck.riskExplanation,
        severity: isCompleted ? 'high' : 'medium', // High if already marked completed without prerequisites!
      });
    }

    if (isCompleted) {
      completedSkills.push(m.skillName);
    }
  }

  return {
    totalGaps: reports.length,
    highRiskCount: reports.filter((r) => r.severity === 'high').length,
    reports,
  };
};

/**
 * Returns metadata (assessmentType, category, difficulty) for a skill
 */
const getSkillMetadata = (skillName) => {
  const entry = findGraphEntry(skillName);
  if (entry) {
    return {
      skill: entry.skill,
      category: entry.category,
      assessmentType: entry.assessmentType || 'quiz',
      difficulty: entry.difficulty || 'intermediate',
      description: entry.description,
      prerequisites: entry.prerequisites,
    };
  }

  // Heuristic fallback for custom/unlisted skills
  const lower = (skillName || '').toLowerCase();
  const isCodingPractical =
    lower.includes('build') ||
    lower.includes('project') ||
    lower.includes('react') ||
    lower.includes('node') ||
    lower.includes('express') ||
    lower.includes('docker') ||
    lower.includes('full stack') ||
    lower.includes('python');

  return {
    skill: skillName,
    category: 'Technical Competency',
    assessmentType: isCodingPractical ? 'practical-task' : 'quiz',
    difficulty: 'intermediate',
    description: `Core competency in ${skillName}`,
    prerequisites: [],
  };
};

/**
 * Returns all skills in the static graph
 */
const getAllSkills = () => skillGraph;

module.exports = {
  getPrerequisites,
  checkDependencyGaps,
  checkAllRoadmapGaps,
  getSkillMetadata,
  getAllSkills,
  normalizeSkillName,
  findGraphEntry,
};
