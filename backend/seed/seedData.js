const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');

// Fix for Windows DNS resolving MongoDB Atlas SRV records
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore
}

// Load environment variables from backend root .env
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const User = require('../models/User');
const Profile = require('../models/Profile');
const CareerSuggestion = require('../models/CareerSuggestion');
const Roadmap = require('../models/Roadmap');
const ResumeFeedback = require('../models/ResumeFeedback');

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.error('❌ Cannot seed database: MONGO_URI is missing in .env');
      process.exit(1);
    }

    console.log('🔄 Connecting to MongoDB Atlas...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connected. Clearing existing demo seed data...');

    // Clear collections
    await User.deleteMany({});
    await Profile.deleteMany({});
    await CareerSuggestion.deleteMany({});
    await Roadmap.deleteMany({});
    await ResumeFeedback.deleteMany({});

    // Import Mentor & Notification models
    const Mentor = require('../models/Mentor');
    const MentorFeedback = require('../models/MentorFeedback');
    const ConnectionRequest = require('../models/ConnectionRequest');
    const Conversation = require('../models/Conversation');
    const Notification = require('../models/Notification');

    await Mentor.deleteMany({});
    await MentorFeedback.deleteMany({});
    await ConnectionRequest.deleteMany({});
    await Conversation.deleteMany({});
    await Notification.deleteMany({});

    console.log('🌱 Inserting demo users...');

    // 1. Create Student User (Alex Chen)
    const studentUser = new User({
      name: 'Alex Chen',
      email: 'student@careercompass.ai',
      password: 'Student@123',
      role: 'student',
    });
    await studentUser.save();

    // 2. Create Admin User (Dr. Evelyn Reed)
    const adminUser = new User({
      name: 'Dr. Evelyn Reed',
      email: 'admin@careercompass.ai',
      password: 'Admin@123',
      role: 'admin',
    });
    await adminUser.save();

    // 3. Create Second Student User (Sarah Patel)
    const student2 = new User({
      name: 'Sarah Patel',
      email: 'sarah.patel@careercompass.ai',
      password: 'Student@123',
      role: 'student',
    });
    await student2.save();

    // 4. Create Mentor Users
    const mentorUser1 = new User({
      name: 'Dr. Aris Vance',
      email: 'aris.vance@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await mentorUser1.save();

    const mentorUser2 = new User({
      name: 'Ananya Roy',
      email: 'ananya.roy@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await mentorUser2.save();

    const mentorUser3 = new User({
      name: 'Rohan Sharma',
      email: 'rohan.sharma@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await mentorUser3.save();

    const mentorUser4 = new User({
      name: 'Neha Kulkarni',
      email: 'neha.kulkarni@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await mentorUser4.save();

    console.log('🌱 Inserting mentors & profiles...');

    // Create Mentor Profiles
    const m1 = await Mentor.create({
      user: mentorUser1._id,
      type: 'expert',
      headline: 'Principal Cloud Architect at AWS, 12+ yrs exp | Ex-Microsoft',
      bio: 'Over a decade of designing distributed cloud systems and hiring software engineers. Passionate about helping university students master system design, Docker containerization, and enterprise AWS deployments.',
      expertiseTags: ['cloud-architecture', 'system-design', 'aws', 'backend', 'career-growth'],
      verified: true,
      availability: 'Weekday Evenings (6 PM - 9 PM IST)',
      rating: 4.9,
      totalReviews: 24,
      totalConversations: 48,
      companyOrCollege: 'Amazon Web Services (AWS)',
      yearsOfExperience: '12+ Years',
    });
    mentorUser1.mentorProfileId = m1._id;
    await mentorUser1.save();

    const m2 = await Mentor.create({
      user: mentorUser2._id,
      type: 'expert',
      headline: 'Senior AI Research Scientist | Stanford PhD | Ex-Meta',
      bio: 'Specializing in Large Language Models, PyTorch pipelines, and applied AI systems. I guide students on bridging academic theoretical ML into production engineering and publishing competitive research.',
      expertiseTags: ['artificial-intelligence', 'machine-learning', 'python', 'nlp', 'research'],
      verified: true,
      availability: 'Weekends (10 AM - 2 PM IST)',
      rating: 5.0,
      totalReviews: 18,
      totalConversations: 36,
      companyOrCollege: 'Meta AI / Stanford Alum',
      yearsOfExperience: '8 Years',
    });
    mentorUser2.mentorProfileId = m2._id;
    await mentorUser2.save();

    const m3 = await Mentor.create({
      user: mentorUser3._id,
      type: 'peer',
      headline: 'Switched from Mechanical to SDE-1 at Razorpay (Self-Taught MERN)',
      bio: 'I was completely lost in mechanical engineering until my final year. Built 4 full-stack projects, practiced DSA consistently, and cracked a Tier-1 tech role with zero formal CS degree. Happy to share my exact roadmap and review resumes!',
      expertiseTags: ['career-switch', 'mern-stack', 'self-taught', 'fresher-journey', 'motivation'],
      verified: true,
      availability: 'Flexible / Daily Evenings',
      rating: 4.9,
      totalReviews: 32,
      totalConversations: 64,
      companyOrCollege: 'Razorpay (Mechanical to Tech)',
      yearsOfExperience: '2 Years',
    });
    mentorUser3.mentorProfileId = m3._id;
    await mentorUser3.save();

    const m4 = await Mentor.create({
      user: mentorUser4._id,
      type: 'peer',
      headline: 'Cracked Off-Campus Placement from Tier-3 College | SDE at Flipkart',
      bio: 'Top companies never visited our campus. I cracked product-based company hiring solely through open-source contributions, rigorous LeetCode consistency, and cold outreach. Ask me how to stand out without brand college pedigree.',
      expertiseTags: ['tier-3-success', 'off-campus-hiring', 'dsa-prep', 'fresher', 'motivation'],
      verified: true,
      availability: 'Saturday & Sunday',
      rating: 4.9,
      totalReviews: 29,
      totalConversations: 55,
      companyOrCollege: 'Flipkart (Tier-3 College Alum)',
      yearsOfExperience: '1.5 Years',
    });
    mentorUser4.mentorProfileId = m4._id;
    await mentorUser4.save();

    // Create 3 Pending Expert Mentors for Admin Verification Queue Demo
    const pendingUser1 = new User({
      name: 'Dr. Rajesh Sen',
      email: 'rajesh.sen@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await pendingUser1.save();

    const pendingMentor1 = await Mentor.create({
      user: pendingUser1._id,
      type: 'expert',
      headline: 'VP of Engineering at Fintech Unicorn | Ex-Goldman Sachs, 15+ yrs exp',
      bio: 'Leading high-frequency transaction engines and distributed financial microservices. I am passionate about mentoring final-year students on scalable distributed system design, clean coding practices, and navigating corporate technical interviews.',
      expertiseTags: ['fintech', 'distributed-systems', 'microservices', 'leadership', 'java'],
      verified: false,
      status: 'pending',
      availability: 'Weekends (4 PM - 7 PM IST)',
      rating: 5.0,
      totalReviews: 0,
      totalConversations: 0,
      companyOrCollege: 'Fintech Unicorn (Ex-Goldman Sachs)',
      yearsOfExperience: '15+ Years',
    });
    pendingUser1.mentorProfileId = pendingMentor1._id;
    await pendingUser1.save();

    const pendingUser2 = new User({
      name: 'Aanya Sharma',
      email: 'aanya.sharma@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await pendingUser2.save();

    const pendingMentor2 = await Mentor.create({
      user: pendingUser2._id,
      type: 'expert',
      headline: 'Senior Staff Data Platform Engineer at Uber | Apache Spark Contributor',
      bio: '8+ years orchestrating petabyte-scale streaming pipelines with Apache Kafka, Spark, and Databricks. Looking to guide ambitious engineers transitioning from basic Python scripting to production big data engineering and vector search infra.',
      expertiseTags: ['data-engineering', 'apache-spark', 'kafka', 'big-data', 'python'],
      verified: false,
      status: 'pending',
      availability: 'Tuesday & Thursday Evenings',
      rating: 5.0,
      totalReviews: 0,
      totalConversations: 0,
      companyOrCollege: 'Uber / Ex-Grab',
      yearsOfExperience: '8+ Years',
    });
    pendingUser2.mentorProfileId = pendingMentor2._id;
    await pendingUser2.save();

    const pendingUser3 = new User({
      name: 'Karan Verma',
      email: 'karan.verma@careercompass.ai',
      password: 'Student@123',
      role: 'student',
      isMentor: true,
    });
    await pendingUser3.save();

    const pendingMentor3 = await Mentor.create({
      user: pendingUser3._id,
      type: 'expert',
      headline: 'Staff Security Architect at Palo Alto Networks | CISSP, OSCP Certified',
      bio: '10 years defending cloud perimeters, threat modeling Kubernetes clusters, and running red-team penetration tests. Eager to help university students build defensible portfolios and master secure development fundamentals.',
      expertiseTags: ['cybersecurity', 'cloud-security', 'penetration-testing', 'kubernetes-security', 'devsecops'],
      verified: false,
      status: 'pending',
      availability: 'Saturdays (11 AM - 3 PM IST)',
      rating: 5.0,
      totalReviews: 0,
      totalConversations: 0,
      companyOrCollege: 'Palo Alto Networks',
      yearsOfExperience: '10 Years',
    });
    pendingUser3.mentorProfileId = pendingMentor3._id;
    await pendingUser3.save();

    // Sample reviews for mentors
    await MentorFeedback.create({
      mentor: m1._id,
      user: studentUser._id,
      rating: 5,
      comment: 'Dr. Vance gave me pinpoint feedback on my AWS architecture project. Best 30 minutes of career guidance I have had in college.',
    });

    await MentorFeedback.create({
      mentor: m3._id,
      user: student2._id,
      rating: 5,
      comment: 'Rohan made me believe that switching into tech without a CS background is completely doable. Super inspiring peer!',
    });

    // Seed one accepted connection & conversation between Alex and Rohan
    const sampleReq = await ConnectionRequest.create({
      user: studentUser._id,
      mentor: m3._id,
      mentorUser: mentorUser3._id,
      status: 'accepted',
      message: 'Hi Rohan! I am learning MERN stack and would love advice on how you transitioned from mechanical engineering.',
      respondedAt: new Date(),
    });

    const sampleConv = await Conversation.create({
      connectionRequest: sampleReq._id,
      participants: [studentUser._id, mentorUser3._id],
      messages: [
        {
          sender: studentUser._id,
          text: 'Hi Rohan! I am learning MERN stack and would love advice on how you transitioned from mechanical engineering.',
          timestamp: new Date(Date.now() - 3600000),
          read: true,
        },
        {
          sender: mentorUser3._id,
          text: 'Hey Alex! Glad to connect. The biggest key was building full-stack apps with TypeScript and deploying them with Docker. Happy to review your GitHub!',
          timestamp: new Date(Date.now() - 1800000),
          read: false,
        },
      ],
      status: 'active',
      lastMessageAt: new Date(Date.now() - 1800000),
    });

    sampleReq.conversation = sampleConv._id;
    await sampleReq.save();

    // Seed Demo Notifications for In-App Notification Bell
    await Notification.create([
      {
        user: studentUser._id,
        title: 'Connection Accepted! 💬',
        message: 'Rohan Sharma accepted your mentorship connection request. You can now chat directly in Connections.',
        type: 'connection-accepted',
        link: '/connections',
        read: false,
      },
      {
        user: studentUser._id,
        title: 'Welcome to CareerCompassAI! 🧭',
        message: 'Your AI-powered career roadmap and verification engine is ready to explore.',
        type: 'system',
        link: '/roadmap',
        read: true,
      },
      {
        user: adminUser._id,
        title: '3 Expert Mentor Applications Pending ⏳',
        message: 'Dr. Rajesh Sen, Aanya Sharma, and Karan Verma applied for Verified Expert status.',
        type: 'mentor-status',
        link: '/admin/mentors',
        read: false,
      },
    ]);

    // ------------------------------------------------------------------------
    // Seed PlatformFeedback & SuccessStory Module Data
    // ------------------------------------------------------------------------
    const PlatformFeedback = require('../models/PlatformFeedback');
    const SuccessStory = require('../models/SuccessStory');

    await PlatformFeedback.deleteMany({});
    await SuccessStory.deleteMany({});

    console.log('🌱 Seeding platform feedback & ratings...');
    await PlatformFeedback.create([
      {
        user: studentUser._id,
        overallRating: 5,
        featureRatings: { aiAccuracy: 5, roadmapUsefulness: 5, uiExperience: 5 },
        comment:
          'CareerCompassAI transformed my career trajectory. The dynamic roadmap milestone breakdown gave me exact weekly goals that helped me stay focused and land interviews.',
      },
      {
        user: mentorUser3._id, // Rohan Sharma
        overallRating: 5,
        featureRatings: { aiAccuracy: 4, roadmapUsefulness: 5, uiExperience: 5 },
        comment:
          'The branching journey feature is brilliant. It normalizes changing paths and taking alternative routes instead of treating career choices as permanent traps.',
      },
      {
        user: mentorUser4._id, // Neha Kulkarni
        overallRating: 4,
        featureRatings: { aiAccuracy: 4, roadmapUsefulness: 4, uiExperience: 5 },
        comment:
          'The real-time mentor connect layer adds immense trust. As someone who switched from mechanical to software, being able to mentor others directly on the platform is fulfilling.',
      },
      {
        user: mentorUser2._id, // Ananya Roy
        overallRating: 5,
        featureRatings: { aiAccuracy: 5, roadmapUsefulness: 5, uiExperience: 4 },
        comment:
          'Super impressed with the resume keyword gap analysis. It accurately pinpointed system design skills missing from my mentee’s profile.',
      },
      {
        user: mentorUser1._id, // Dr. Aris Vance
        overallRating: 5,
        featureRatings: { aiAccuracy: 5, roadmapUsefulness: 5, uiExperience: 5 },
        comment:
          'A state-of-the-art career guidance platform that balances machine intelligence with human credibility. Exceptional design and pedagogy.',
      },
    ]);

    console.log('🌱 Seeding approved community success stories...');
    await SuccessStory.create([
      {
        user: studentUser._id,
        title: 'From Confused 12th Grader to Cloud Architect at a Fintech Scale-up',
        storyText:
          'Right after 12th grade board exams, I was paralyzed by choices between generic BSc and private engineering colleges. CareerCompassAI suggested a structured pathway focusing on Distributed Systems and AWS certifications. By breaking down multi-year goals into 3-month milestones, I stayed consistent, built real Terraform projects, and cracked a Cloud Architect position right out of college.\n\nThe biggest gamechanger was realizing I did not have to know everything on day one—the roadmap guided me step by step through Linux internals, networking, and microservices.',
        lifeStageJourney: 'school → engineering → cloud architect',
        beforeAfter: {
          before: 'Paralyzed by degree choices with zero technical direction',
          after: 'AWS Certified Solutions Architect leading fintech cloud migrations',
        },
        status: 'approved',
        featured: true,
        likes: [studentUser._id, mentorUser1._id, mentorUser3._id],
        approvedAt: new Date(Date.now() - 86400000 * 10),
      },
      {
        user: mentorUser3._id,
        title: 'Switching from Mechanical Engineering to MERN Full-Stack Developer in 8 Months',
        storyText:
          'I graduated with a mechanical degree and quickly realized core plant jobs offered limited growth. Everyone told me without a Computer Science degree, product startups wouldn’t even open my resume. CareerCompassAI helped me identify exact project gaps and motivated me to build full-stack apps with TypeScript, React, and MongoDB.\n\nAfter 8 months of consistent building and getting my resume analyzed through the AI keyword scanner, I cleared three rounds of technical interviews at TechVentures Ltd. You don’t need a CS degree—you need proof of work and relentless curiosity.',
        lifeStageJourney: 'undergraduate → career-shift → full-stack engineer',
        beforeAfter: {
          before: 'Mechanical grad with 0 lines of code and no tech referrals',
          after: 'Full-Stack Developer building high-scale MERN microservices',
        },
        status: 'approved',
        featured: true,
        likes: [studentUser._id, mentorUser2._id, mentorUser4._id, mentorUser1._id],
        approvedAt: new Date(Date.now() - 86400000 * 7),
      },
      {
        user: mentorUser4._id,
        title: 'Returning to the Tech Workforce After a 4-Year Caregiver Career Break',
        storyText:
          'After taking a four-year hiatus to care for my family, my confidence had hit rock bottom. Tech moved so fast with CI/CD and cloud tools that my old testing skills felt obsolete. CareerCompassAI’s Workforce Re-entry track helped me target modern Cypress, Playwright, and Selenium workflows.\n\nWithin five months of following the customized curriculum and connecting with empathetic mentors on this platform, I rejoined the workforce as a Senior Automation Engineer with flexible remote work.',
        lifeStageJourney: 're-entering → upskilling → qa automation engineer',
        beforeAfter: {
          before: '4-year resume gap and overwhelming imposter syndrome',
          after: 'Senior QA Automation Engineer with full remote flexibility',
        },
        status: 'approved',
        featured: false,
        likes: [studentUser._id, mentorUser3._id],
        approvedAt: new Date(Date.now() - 86400000 * 5),
      },
      {
        user: mentorUser2._id,
        title: 'Transitioning from Tier-1 Customer Support to Associate Product Manager',
        storyText:
          'Answering customer support tickets for two years taught me deep empathy for user pain points, but I lacked formal product framework knowledge. The Lifelong Career Navigator suggested an agile transition path: user journey mapping, SQL data analytics, and PRD writing.\n\nI built internal dashboards at my current company, showcased them to our Head of Product, and secured an internal transfer into Product Management. Don’t underestimate your domain context—turn it into your product superpower!',
        lifeStageJourney: 'working-professional → career-shift → associate pm',
        beforeAfter: {
          before: 'Handling 60+ repetitive customer support tickets per day',
          after: 'Associate Product Manager designing multi-platform feature roadmaps',
        },
        status: 'approved',
        featured: true,
        likes: [studentUser._id, mentorUser1._id],
        approvedAt: new Date(Date.now() - 86400000 * 3),
      },
      {
        user: studentUser._id,
        title: 'Cracking Remote Open Source Fellowships from a Tier-3 College',
        storyText:
          'Coming from a non-metro college with zero on-campus placements from tier-1 firms, I thought competitive exams were my only choice. CareerCompassAI pointed me toward open-source contributions and portfolio building. I contributed documentation, then bug fixes to leading Python libraries, and ultimately earned a paid fellowship that paid higher than campus salaries.',
        lifeStageJourney: 'undergraduate → tier-3 college → open source fellow',
        beforeAfter: {
          before: 'Tier-3 college with no on-campus tech companies visiting',
          after: 'Global open source fellow collaborating with engineers worldwide',
        },
        status: 'approved',
        featured: false,
        likes: [mentorUser3._id],
        approvedAt: new Date(Date.now() - 86400000 * 2),
      },
      {
        user: mentorUser1._id,
        title: 'From Confusion Over Academic Research to Leading AI Innovation',
        storyText:
          'Early in my master’s program, academic papers felt like impenetrable mathematical jargon. A mentor told me: implement the math in code first, understand the intuition, then write the paper. CareerCompassAI’s curriculum approach mirrors this exact learning philosophy and has guided hundreds of my university students into world-class research institutes.',
        lifeStageJourney: 'undergraduate → masters → ai researcher',
        beforeAfter: {
          before: 'Overwhelmed by theoretical math equations and research papers',
          after: 'AI Research Scientist with 20+ peer-reviewed international publications',
        },
        status: 'approved',
        featured: false,
        likes: [studentUser._id, mentorUser2._id, mentorUser4._id],
        approvedAt: new Date(Date.now() - 86400000 * 1),
      },
    ]);

    // ------------------------------------------------------------------------
    // Seed Skill Verification & Reality-Check Layer (Assessments & Projects)
    // ------------------------------------------------------------------------
    const SkillAssessment = require('../models/SkillAssessment');
    const Project = require('../models/Project');

    await SkillAssessment.deleteMany({});
    await Project.deleteMany({});

    console.log('🌱 Seeding Skill Assessments & Project Reality Checks...');

    // Seed 1: Passed Skill Assessment (JavaScript ES6)
    await SkillAssessment.create({
      userId: studentUser._id,
      skillName: 'JavaScript ES6',
      assessmentType: 'quiz',
      status: 'passed',
      score: 86,
      attemptNumber: 1,
      questions: [
        {
          question: 'What is the primary difference between var, let, and const in JavaScript ES6?',
          type: 'mcq',
          options: ['Scope and reassignment rules', 'Execution speed', 'Memory limit', 'Browser support'],
          correctAnswer: 'Scope and reassignment rules',
        },
      ],
      aiEvaluation: {
        score: 86,
        passed: true,
        specificFeedback: [
          'Excellent conceptual explanation of lexical scoping and closures.',
          'Accurately identified edge cases in object destructuring with default parameters.',
        ],
        gapsIdentified: ['Minor: deeper consideration of WeakMap garbage collection semantics.'],
        evaluatedAt: new Date(Date.now() - 86400000 * 2),
      },
    });

    // Seed 2: Failed Assessment with Mistake Pattern Analysis (Async/Promises)
    await SkillAssessment.create({
      userId: studentUser._id,
      skillName: 'Async/Promises',
      assessmentType: 'quiz',
      status: 'failed',
      score: 56,
      attemptNumber: 2,
      questions: [
        {
          question: 'How does Promise.all behave when one of 5 promises rejects?',
          type: 'mcq',
          options: ['Rejects immediately with that error', 'Waits for all 5 to settle', 'Returns null', 'Retries 3 times'],
          correctAnswer: 'Rejects immediately with that error',
        },
      ],
      aiEvaluation: {
        score: 56,
        passed: false,
        specificFeedback: [
          'Confused microtask vs macrotask queue sequencing in multiple scenarios.',
          'Incorrectly assumed that forEach awaits async callbacks sequentially.',
        ],
        gapsIdentified: [
          'Event loop microtask queue drain timing',
          'Sequential vs concurrent async iterator patterns',
        ],
        evaluatedAt: new Date(Date.now() - 86400000 * 1),
      },
      mistakeAnalysis: {
        rootCauseMisconception: 'Conflating asynchronous microtask queuing with synchronous execution ordering.',
        affectedConcepts: ['Event loop', 'Call stack', 'Promise.all fail-fast short-circuiting'],
        targetedExplanation: 'Notice how across multiple failed attempts, your choices assumed synchronous immediate execution. In JavaScript, promise callbacks enter the microtask queue and run only after the synchronous call stack is completely drained.',
        suggestedMicroResource: 'Spend 10 minutes tracing a 5-line async script using console.time and debugger breakpoints.',
        analyzedAt: new Date(Date.now() - 86400000 * 1),
      },
    });

    // Seed 3: Project with Reality Check and Completed Mock Interview
    await Project.create({
      userId: studentUser._id,
      title: 'Cloud-Based E-Commerce Platform',
      description:
        'A full-stack commerce engine featuring responsive product catalogs, JWT-authenticated user sessions, MongoDB compound indexing for high-speed catalog searches, and resilient Stripe checkout processing.',
      techStack: ['React', 'Node.js', 'Express', 'MongoDB Atlas', 'JWT', 'Stripe'],
      userRole: 'Sole Developer / Full Stack Lead',
      claimedComplexity: 'intermediate',
      realityCheckResult: {
        realismScore: 88,
        consistencyFlags: ['Scope and tech stack are balanced and realistic for an intermediate university engineering project.'],
        honestAssessment:
          'This project presents a coherent, credible technical narrative. The combination of MERN with JWT and Stripe aligns well with industry standards. Be ready to explain idempotency keys for payment processing.',
        suggestedFramingImprovements: [
          'Highlight the compound indexing strategy in MongoDB Atlas to quantify database performance gains.',
          'Document how network dropouts during checkout were handled gracefully.',
        ],
        checkedAt: new Date(Date.now() - 86400000 * 3),
      },
      interviewResult: {
        questions: [
          {
            questionId: 'q1',
            question: 'How do you prevent duplicate order charges if a customer clicks the pay button twice during network latency?',
            focusArea: 'Transaction Idempotency',
          },
          {
            questionId: 'q2',
            question: 'Why did you choose compound indexing in MongoDB Atlas, and what were the trade-offs on write performance?',
            focusArea: 'Database Optimization',
          },
        ],
        answers: [
          {
            questionId: 'q1',
            question: 'How do you prevent duplicate order charges?',
            answer: 'We generated a unique idempotency key on client form submission and checked Redis before creating the Stripe charge session.',
          },
          {
            questionId: 'q2',
            question: 'Why compound indexing?',
            answer: 'Our search queries filtered by category and sorted by price simultaneously; a compound index avoided memory-based sorting.',
          },
        ],
        overallScore: 85,
        perQuestionFeedback: [
          {
            question: 'How do you prevent duplicate order charges?',
            answer: 'Idempotency key check implemented.',
            score: 90,
            feedback: 'Excellent response demonstrating authentic production payment integration understanding.',
          },
          {
            question: 'Why compound indexing?',
            answer: 'Avoided in-memory sort on catalog queries.',
            score: 80,
            feedback: 'Good index justification; also consider mentioning index size overhead on RAM.',
          },
        ],
        readinessVerdict: 'Interview Ready: Demonstrates solid ownership and architectural rationale.',
        completedAt: new Date(Date.now() - 86400000 * 2),
      },
    });

    // Seed 4: Second Project ready for Interview
    await Project.create({
      userId: studentUser._id,
      title: 'Real-Time Collaborative Workspace',
      description:
        'A multi-user collaborative canvas allowing simultaneous sketching and note-taking with WebSockets, state synchronizing via Redis Pub/Sub, and Docker Compose orchestration.',
      techStack: ['React', 'Node.js', 'WebSockets', 'Redis', 'Docker'],
      userRole: 'Full Stack Engineer',
      claimedComplexity: 'advanced',
      realityCheckResult: {
        realismScore: 80,
        consistencyFlags: [
          'Real-time multi-user syncing is an ambitious project; be prepared to defend conflict resolution (e.g. CRDTs or last-write-wins).',
        ],
        honestAssessment:
          'Impressive technical scope. A tech recruiter will immediately probe how you handle disconnected clients and reconnection storms.',
        suggestedFramingImprovements: [
          'Specify your conflict resolution model explicitly in the project summary.',
          'Detail the Docker container build optimizations in your README.',
        ],
        checkedAt: new Date(Date.now() - 86400000 * 1),
      },
    });

    console.log('✅ [Seed Completed Successfully with Mentors & Chat]');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Viva / Evaluation:');
    console.log('👉 Student:  student@careercompass.ai  |  Student@123');
    console.log('👉 Admin:    admin@careercompass.ai    |  Admin@123');
    console.log('👉 Peer Mentor: rohan.sharma@careercompass.ai | Student@123');
    console.log('👉 Expert Mentor: aris.vance@careercompass.ai | Student@123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
