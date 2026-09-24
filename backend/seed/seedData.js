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

    console.log('🌱 Inserting student profiles...');

    // Profile for Alex
    await Profile.create({
      user: studentUser._id,
      educationLevel: 'B.Tech / B.E.',
      branch: 'Computer Science & Engineering',
      graduationYear: '2026',
      currentSkills: ['JavaScript', 'React', 'Node.js', 'Express', 'HTML5', 'CSS3', 'Git'],
      interests: ['Full Stack Development', 'Cloud Architecture', 'Artificial Intelligence'],
      resumeText: 'Alex Chen\nAspiring Full Stack Engineer\nSkills: JavaScript, React, Node.js, Express, MongoDB\nProjects: E-commerce web platform, Chat app with WebSockets.',
    });

    // Profile for Sarah
    await Profile.create({
      user: student2._id,
      educationLevel: 'B.Tech / B.E.',
      branch: 'AI & Data Science',
      graduationYear: '2026',
      currentSkills: ['Python', 'Pandas', 'Scikit-Learn', 'SQL', 'Tableau', 'FastAPI'],
      interests: ['Machine Learning', 'Data Engineering', 'NLP'],
      resumeText: 'Sarah Patel\nData Science & ML enthusiast\nSkills: Python, SQL, Pandas, Scikit-learn\nProjects: Customer Churn Predictor, Sentiment Analysis with BERT.',
    });

    console.log('🌱 Inserting career suggestions & roadmaps...');

    // Career Suggestion for Alex
    const careerSuggestion = await CareerSuggestion.create({
      user: studentUser._id,
      suggestedPaths: [
        {
          title: 'Full Stack Cloud Engineer',
          matchScore: 92,
          description: 'Combines your solid React and Node.js foundation with cloud containerization and distributed backend systems.',
          targetRoles: ['Full Stack Developer', 'Cloud Application Engineer', 'MERN Stack Specialist'],
          marketDemand: 'Very High',
        },
        {
          title: 'Frontend Systems Architect',
          matchScore: 86,
          description: 'Focuses deeply on component design systems, modern client-side state management, and high-performance web applications.',
          targetRoles: ['Frontend Engineer', 'UI/UX Technical Specialist', 'React Developer'],
          marketDemand: 'High',
        },
        {
          title: 'DevOps & Cloud Automation Specialist',
          matchScore: 78,
          description: 'Bridges software engineering and infrastructure via Docker, Kubernetes, CI/CD pipelines, and cloud services.',
          targetRoles: ['Junior DevOps Engineer', 'Cloud Operations Specialist'],
          marketDemand: 'High',
        },
      ],
      skillGaps: ['TypeScript', 'Docker', 'Kubernetes', 'Scalable System Design', 'AWS Cloud Services'],
      aiReasoning: 'Alex shows exemplary proficiency in core MERN stack primitives. To unlock high-paying Tier-1 tech roles, mastering TypeScript, containerization (Docker), and cloud architecture is the highest leverage path.',
    });

    // Roadmap for Alex
    await Roadmap.create({
      user: studentUser._id,
      careerGoal: 'Full Stack Cloud Engineer',
      milestones: [
        {
          skillId: 'ts-01',
          skillName: 'TypeScript Fundamentals & Typing React/Node',
          category: 'Type Safety & Core Languages',
          status: 'completed',
          order: 1,
          completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          resources: [
            { title: 'TypeScript Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/intro.html', type: 'documentation' },
            { title: 'TypeScript Course by FreeCodeCamp', url: 'https://www.freecodecamp.org/news/learn-typescript-beginners-guide/', type: 'course' },
          ],
        },
        {
          skillId: 'docker-02',
          skillName: 'Docker & Containerization for MERN Apps',
          category: 'DevOps & Infrastructure',
          status: 'in-progress',
          order: 2,
          resources: [
            { title: 'Docker Getting Started Tutorial', url: 'https://docs.docker.com/get-started/', type: 'documentation' },
            { title: 'Containerizing Node.js and MongoDB Apps', url: 'https://nodejs.org/en/docs/guides/nodejs-docker-webapp', type: 'article' },
          ],
        },
        {
          skillId: 'aws-03',
          skillName: 'AWS Core Services (EC2, S3, IAM, ECS)',
          category: 'Cloud Architecture',
          status: 'pending',
          order: 3,
          resources: [
            { title: 'AWS Cloud Practitioner Essentials', url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/', type: 'course' },
            { title: 'Deploying MERN Applications on AWS', url: 'https://aws.amazon.com/getting-started/hands-on/deploy-docker-containers/', type: 'project' },
          ],
        },
        {
          skillId: 'sys-04',
          skillName: 'Distributed System Design & Microservices Basics',
          category: 'System Architecture',
          status: 'pending',
          order: 4,
          resources: [
            { title: 'System Design Primer', url: 'https://github.com/donnemartin/system-design-primer', type: 'documentation' },
          ],
        },
        {
          skillId: 'cicd-05',
          skillName: 'Automated CI/CD with GitHub Actions',
          category: 'Automation & Testing',
          status: 'pending',
          order: 5,
          resources: [
            { title: 'GitHub Actions Documentation', url: 'https://docs.github.com/en/actions', type: 'documentation' },
          ],
        },
      ],
      overallProgress: 20,
    });

    // Resume Feedback for Alex
    await ResumeFeedback.create({
      user: studentUser._id,
      submittedResumeText: 'Alex Chen\nB.Tech CSE, 2026\nProjects: MERN Stack E-Commerce App, Realtime Chat\nSkills: React, Node, Express, MongoDB, Git',
      aiScore: 84,
      targetRole: 'Full Stack Cloud Engineer',
      strengths: [
        'Well-defined technical stack with direct relevance to modern web development.',
        'High-impact projects demonstrating full-stack competencies.',
        'Clear educational timeline and relevant coursework.',
      ],
      improvements: [
        'Quantify project outcomes (e.g., "Reduced database query latency by 35% through indexing").',
        'Add TypeScript and container tools (Docker) once in progress.',
        'Include live demo URLs and active GitHub repository hyperlinks.',
      ],
      summary: 'Solid foundation for an entry-level Full Stack role. Incorporating measurable impact metrics and cloud deployment links will make this resume stand out to hiring managers.',
    });

    // Sample Resume Feedback for Sarah
    await ResumeFeedback.create({
      user: student2._id,
      submittedResumeText: 'Sarah Patel\nB.Tech AI & DS, 2026\nProjects: Churn Prediction Model, BERT Sentiment Classifier\nSkills: Python, Pandas, Scikit-Learn, SQL',
      aiScore: 88,
      targetRole: 'Machine Learning Engineer',
      strengths: [
        'Strong focus on data science algorithms and modern libraries.',
        'Hands-on machine learning projects addressing real-world classification problems.',
      ],
      improvements: [
        'Specify evaluation metrics for models (e.g., F1-score, AUC-ROC).',
        'Highlight data preprocessing pipelines and feature engineering steps.',
      ],
      summary: 'Impressive machine learning portfolio with strong analytical rigour.',
    });

    console.log('✅ [Seed Completed Successfully]');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials for Viva / Evaluation:');
    console.log('👉 Student:  student@careercompass.ai  |  Student@123');
    console.log('👉 Admin:    admin@careercompass.ai    |  Admin@123');
    console.log('----------------------------------------------------');

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
};

seedDatabase();
