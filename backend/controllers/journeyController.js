const CareerJourney = require('../models/CareerJourney');
const Profile = require('../models/Profile');
const SecurityLog = require('../models/SecurityLog');
const aiService = require('../services/aiService');

// Helper to generate a clean, readable unique stage ID
const generateStageId = () => {
  return `stage_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
};

/**
 * @desc    Initialize a lifelong career journey for the user
 * @route   POST /api/journey/start
 * @access  Private
 */
const startJourney = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Check if user already has an active journey
    let journey = await CareerJourney.findOne({ user: userId });

    if (journey && Array.isArray(journey.stages) && journey.stages.length > 0 && req.query.forceRestart !== 'true') {
      return res.status(200).json({
        success: true,
        message: 'Existing career journey retrieved',
        journey,
      });
    }

    // Retrieve user's profile to extract lifeStage, skills, interests, constraints
    let profile = await Profile.findOne({ user: userId });
    if (!profile) {
      profile = await Profile.create({
        user: userId,
        lifeStage: 'undergraduate',
        educationLevel: 'B.Tech / B.E.',
        branch: 'Computer Science & Engineering',
        currentSkills: [],
        interests: [],
      });
    }

    // Call Claude AI service with stage-aware prompt
    const aiResult = await aiService.generateJourneyStage(profile, []);

    const initialStageId = generateStageId();
    const initialStageNode = {
      stageId: initialStageId,
      lifeStageAtTime: profile.lifeStage || 'undergraduate',
      decisionPoint: aiResult.decisionPoint,
      chosenPath: null,
      alternativePaths: aiResult.alternatives,
      status: 'exploring',
      satisfactionRating: null,
      satisfactionNote: '',
      branchReason: '',
      parentStageId: null,
      timestamp: new Date(),
    };

    if (journey) {
      journey.stages = [initialStageNode];
      journey.currentStageId = initialStageId;
      await journey.save();
    } else {
      journey = await CareerJourney.create({
        user: userId,
        stages: [initialStageNode],
        currentStageId: initialStageId,
      });
    }

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'journey-start',
      req,
      details: {
        stageId: initialStageId,
        lifeStage: profile.lifeStage,
        decisionPoint: aiResult.decisionPoint,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Lifelong career journey initialized successfully',
      journey,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's full ongoing career journey (all stages, decisions, branches)
 * @route   GET /api/journey
 * @access  Private
 */
const getJourney = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const journey = await CareerJourney.findOne({ user: userId });

    res.status(200).json({
      success: true,
      journey: journey || null,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Commit to one of the offered paths at a specific stage, advancing the journey
 * @route   POST /api/journey/:stageId/choose
 * @access  Private
 */
const choosePath = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { stageId } = req.params;
    const { pathTitle, chosenPath } = req.body;

    const journey = await CareerJourney.findOne({ user: userId });
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'No active career journey found for this account. Please start one first.',
      });
    }

    const stageIndex = journey.stages.findIndex((s) => s.stageId === stageId);
    if (stageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Journey stage '${stageId}' was not found.`,
      });
    }

    const stageNode = journey.stages[stageIndex];

    // Find the matching alternative in the stage node or use the provided object
    let selectedAlternative = null;
    if (chosenPath && chosenPath.title) {
      selectedAlternative = chosenPath;
    } else if (pathTitle) {
      selectedAlternative = stageNode.alternativePaths.find(
        (p) => p.title.toLowerCase().trim() === pathTitle.toLowerCase().trim()
      );
    }

    if (!selectedAlternative) {
      selectedAlternative = stageNode.alternativePaths[0]; // Fallback to primary option
    }

    // Mark current stage node as committed
    stageNode.chosenPath = {
      title: selectedAlternative.title,
      reasoning: selectedAlternative.reasoning || '',
      matchScore: selectedAlternative.matchScore || 85,
      nextSteps: selectedAlternative.nextSteps || [],
      estimatedTimeframe: selectedAlternative.estimatedTimeframe || '3-6 Months',
      chosenAt: new Date(),
    };
    stageNode.status = 'committed';

    // Retrieve user's profile for context
    const profile = await Profile.findOne({ user: userId });

    // Call Claude AI to generate the sequential NEXT decision point down this committed route
    const nextAiResult = await aiService.generateJourneyStage(
      profile,
      journey.stages,
      null,
      stageNode.chosenPath
    );

    const nextStageId = generateStageId();
    const nextStageNode = {
      stageId: nextStageId,
      lifeStageAtTime: profile?.lifeStage || stageNode.lifeStageAtTime,
      decisionPoint: nextAiResult.decisionPoint,
      chosenPath: null,
      alternativePaths: nextAiResult.alternatives,
      status: 'exploring',
      satisfactionRating: null,
      satisfactionNote: '',
      branchReason: '',
      parentStageId: stageId,
      timestamp: new Date(),
    };

    journey.stages.push(nextStageNode);
    journey.currentStageId = nextStageId;
    await journey.save();

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'journey-choose',
      req,
      details: {
        stageId,
        chosenPath: stageNode.chosenPath.title,
        nextStageId,
      },
    });

    res.status(200).json({
      success: true,
      message: `Committed to '${stageNode.chosenPath.title}'. Next decision point generated.`,
      journey,
      nextStageId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Re-branch from ANY past or current decision point ("Not satisfied, give me alternatives")
 * @route   POST /api/journey/:stageId/branch
 * @access  Private
 */
const branchJourney = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { stageId } = req.params;
    const { reason } = req.body;

    const journey = await CareerJourney.findOne({ user: userId });
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'No active career journey found for this account.',
      });
    }

    const targetStageIndex = journey.stages.findIndex((s) => s.stageId === stageId);
    if (targetStageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Specified stage node '${stageId}' not found in your journey history.`,
      });
    }

    // Mark previous node as revisited to document user navigation history
    const targetStage = journey.stages[targetStageIndex];
    if (targetStage.status !== 'committed') {
      targetStage.status = 'revisited';
    }

    // Fetch profile
    const profile = await Profile.findOne({ user: userId });

    // History up to the targeted stage node
    const historyUpToStage = journey.stages.slice(0, targetStageIndex + 1);

    const branchReasonText =
      reason?.trim() || 'User requested fresh alternatives at this career juncture.';

    // Generate fresh alternatives from Claude AI with the branch reason explicitly acknowledged
    const freshAiResult = await aiService.generateJourneyStage(
      profile,
      historyUpToStage,
      branchReasonText,
      null
    );

    const newBranchStageId = generateStageId();
    const newBranchStageNode = {
      stageId: newBranchStageId,
      lifeStageAtTime: profile?.lifeStage || targetStage.lifeStageAtTime,
      decisionPoint: freshAiResult.decisionPoint,
      chosenPath: null,
      alternativePaths: freshAiResult.alternatives,
      status: 'exploring',
      satisfactionRating: null,
      satisfactionNote: '',
      branchReason: branchReasonText,
      parentStageId: stageId,
      timestamp: new Date(),
    };

    journey.stages.push(newBranchStageNode);
    journey.currentStageId = newBranchStageId;
    await journey.save();

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'journey-branch',
      req,
      details: {
        branchedFromStageId: stageId,
        newStageId: newBranchStageId,
        reason: branchReasonText,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Fresh alternative trajectory successfully branched without losing history.',
      journey,
      newStageId: newBranchStageId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Record or update satisfaction rating for a committed stage
 * @route   PATCH /api/journey/:stageId/satisfaction
 * @access  Private
 */
const setSatisfaction = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { stageId } = req.params;
    const { rating, note } = req.body;

    const parsedRating = Number(rating);
    if (!parsedRating || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5.',
      });
    }

    const journey = await CareerJourney.findOne({ user: userId });
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Career journey not found.',
      });
    }

    const stage = journey.stages.find((s) => s.stageId === stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: `Stage '${stageId}' not found.`,
      });
    }

    stage.satisfactionRating = parsedRating;
    if (note !== undefined) {
      stage.satisfactionNote = note.trim();
    }

    await journey.save();

    // Audit log
    await SecurityLog.logAction({
      userId,
      action: 'journey-satisfaction',
      req,
      details: {
        stageId,
        rating: parsedRating,
      },
    });

    res.status(200).json({
      success: true,
      message: `Satisfaction rating of ${parsedRating}/5 recorded successfully.`,
      journey,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Compare the alternative paths offered at a specific stage
 * @route   GET /api/journey/:stageId/compare
 * @access  Private
 */
const compareStageAlternatives = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { stageId } = req.params;

    const journey = await CareerJourney.findOne({ user: userId });
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Career journey not found.',
      });
    }

    const stage = journey.stages.find((s) => s.stageId === stageId);
    if (!stage) {
      return res.status(404).json({
        success: false,
        message: `Stage '${stageId}' not found.`,
      });
    }

    // Build structured side-by-side comparison matrix
    const comparison = stage.alternativePaths.map((alt) => {
      return {
        title: alt.title,
        matchScore: alt.matchScore,
        estimatedTimeframe: alt.estimatedTimeframe,
        reasoning: alt.reasoning,
        nextStepsCount: alt.nextSteps ? alt.nextSteps.length : 0,
        nextSteps: alt.nextSteps || [],
        isChosen: stage.chosenPath?.title === alt.title,
      };
    });

    res.status(200).json({
      success: true,
      stageId: stage.stageId,
      lifeStageAtTime: stage.lifeStageAtTime,
      decisionPoint: stage.decisionPoint,
      comparison,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  startJourney,
  getJourney,
  choosePath,
  branchJourney,
  setSatisfaction,
  compareStageAlternatives,
};
