require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');

const seed = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to MongoDB');

  await Promise.all([User.deleteMany({}), Job.deleteMany({}), Company.deleteMany({})]);

  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@jobmatch.co.il',
    password: 'Admin123!',
    role: 'admin',
  });

  const company = await Company.create({
    name: 'TechCorp Israel',
    contactPerson: 'דנה כהן',
    email: 'hr@techcorp.co.il',
    phone: '03-1234567',
    website: 'https://techcorp.co.il',
    description: 'חברת טכנולוגיה מובילה',
  });

  const companyUser = await User.create({
    name: 'TechCorp HR',
    email: 'hr@techcorp.co.il',
    password: 'Company123!',
    role: 'company',
    company: company._id,
  });

  await User.create({
    name: 'יוסי ישראלי',
    email: 'candidate@test.co.il',
    password: 'Test123!',
    role: 'candidate',
  });

  const jobs = await Job.insertMany([
    {
      title: 'מפתח Full Stack',
      companyName: 'TechCorp Israel',
      company: company._id,
      location: 'תל אביב',
      region: 'מרכז',
      salary: '20,000–30,000 ₪',
      description: 'אנו מחפשים מפתח Full Stack מנוסה לצוות הפיתוח שלנו. העבודה כוללת פיתוח ממשקי משתמש מתקדמים ושירותי Backend.',
      requirements: ['ניסיון של 3+ שנים', 'React', 'Node.js', 'MongoDB'],
      skills: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'Docker'],
    },
    {
      title: 'מנהל מוצר',
      companyName: 'StartupXYZ',
      location: 'הרצליה',
      region: 'שרון',
      salary: '25,000–35,000 ₪',
      description: 'מחפשים מנהל מוצר עם ניסיון בפיתוח מוצרי SaaS ועבודה עם צוותי פיתוח.',
      requirements: ['ניסיון של 5+ שנים', 'ניסיון ב-SaaS', 'אנגלית ברמה גבוהה'],
      skills: ['Product Management', 'Agile', 'JIRA', 'Figma'],
    },
    {
      title: 'Data Scientist',
      companyName: 'Analytics Pro',
      location: 'חיפה',
      region: 'צפון',
      salary: '18,000–28,000 ₪',
      description: 'תפקיד Data Scientist בחברת אנליטיקס מובילה. עבודה עם מודלי ML, ניתוח נתונים גדולים.',
      requirements: ['Python', 'Machine Learning', 'SQL', 'תואר רלוונטי'],
      skills: ['Python', 'TensorFlow', 'SQL', 'Pandas', 'Spark'],
    },
    {
      title: 'מנהל לוגיסטיקה',
      companyName: 'South Logistics',
      location: 'באר שבע',
      region: 'דרום',
      salary: '15,000–20,000 ₪',
      description: 'דרוש מנהל לוגיסטיקה לחברה מובילה באזור הדרום.',
      requirements: ['ניסיון של 2+ שנים', 'רישיון נהיגה'],
      skills: ['ניהול מחסן', 'Excel', 'ERP'],
    },
    {
      title: 'מפתח Backend',
      companyName: 'Jerusalem Tech',
      location: 'ירושלים',
      region: 'ירושלים',
      salary: '22,000–28,000 ₪',
      description: 'מחפשים מפתח Backend עם ניסיון ב-Python ו-Django לחברת סטארטאפ בירושלים.',
      requirements: ['Python', 'Django', 'PostgreSQL'],
      skills: ['Python', 'Django', 'REST API', 'Docker'],
    },
  ]);

  console.log('✅ Seed complete!');
  console.log('  Admin:     admin@jobmatch.co.il / Admin123!');
  console.log('  Company:   hr@techcorp.co.il / Company123!');
  console.log('  Candidate: candidate@test.co.il / Test123!');
  console.log(`  Jobs created: ${jobs.length}`);

  await mongoose.disconnect();
};

seed().catch(err => { console.error(err); process.exit(1); });
