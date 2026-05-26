import { PrismaClient, UserRole, LeadStatus, LeadSource, OpportunityStage, SequenceStepType, WorkflowTriggerType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const passwordHash = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@aicrm.com' },
    update: {},
    create: {
      email: 'admin@aicrm.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      title: 'System Administrator',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'manager@aicrm.com' },
    update: {},
    create: {
      email: 'manager@aicrm.com',
      passwordHash,
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.SALES_MANAGER,
      title: 'Sales Manager',
    },
  });

  const sdr = await prisma.user.upsert({
    where: { email: 'sdr@aicrm.com' },
    update: {},
    create: {
      email: 'sdr@aicrm.com',
      passwordHash,
      firstName: 'Mike',
      lastName: 'Chen',
      role: UserRole.SDR,
      title: 'Sales Development Rep',
    },
  });

  const ae = await prisma.user.upsert({
    where: { email: 'ae@aicrm.com' },
    update: {},
    create: {
      email: 'ae@aicrm.com',
      passwordHash,
      firstName: 'Emily',
      lastName: 'Davis',
      role: UserRole.AE,
      title: 'Account Executive',
    },
  });

  console.log('Users created');

  const companies = await Promise.all([
    prisma.company.create({
      data: {
        name: 'TechCorp Inc.',
        domain: 'techcorp.com',
        industry: 'Technology',
        employeeCount: 250,
        revenue: '$50M',
        city: 'San Francisco',
        state: 'CA',
        country: 'US',
        linkedinUrl: 'https://linkedin.com/company/techcorp',
      },
    }),
    prisma.company.create({
      data: {
        name: 'FinanceFlow',
        domain: 'financeflow.io',
        industry: 'FinTech',
        employeeCount: 120,
        revenue: '$20M',
        city: 'New York',
        state: 'NY',
        country: 'US',
      },
    }),
    prisma.company.create({
      data: {
        name: 'HealthPlus Medical',
        domain: 'healthplus.com',
        industry: 'Healthcare',
        employeeCount: 500,
        revenue: '$120M',
        city: 'Boston',
        state: 'MA',
        country: 'US',
      },
    }),
    prisma.company.create({
      data: {
        name: 'GrowthMarketing',
        domain: 'growthmarketing.co',
        industry: 'Marketing',
        employeeCount: 45,
        revenue: '$5M',
        city: 'Austin',
        state: 'TX',
        country: 'US',
      },
    }),
    prisma.company.create({
      data: {
        name: 'DataSync Solutions',
        domain: 'datasync.io',
        industry: 'Technology',
        employeeCount: 80,
        revenue: '$12M',
        city: 'Seattle',
        state: 'WA',
        country: 'US',
      },
    }),
  ]);

  console.log('Companies created');

  const statuses = [LeadStatus.NEW, LeadStatus.CONTACTED, LeadStatus.QUALIFIED, LeadStatus.MQL, LeadStatus.SQL, LeadStatus.OPPORTUNITY];
  const sources = [LeadSource.WEBSITE_FORM, LeadSource.LANDING_PAGE, LeadSource.LINKEDIN_IMPORT, LeadSource.REFERRAL, LeadSource.AD_PLATFORM];

  const leads = [];
  for (let i = 0; i < 25; i++) {
    const lead = await prisma.lead.create({
      data: {
        firstName: ['John', 'Jane', 'Robert', 'Lisa', 'David', 'Maria', 'James', 'Amanda', 'Michael', 'Jennifer'][i % 10],
        lastName: ['Smith', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson'][i % 10],
        email: `lead${i + 1}@example.com`,
        phone: `+1-555-${String(1000 + i).padStart(4, '0')}`,
        jobTitle: ['CEO', 'CTO', 'VP Sales', 'Marketing Director', 'Head of Growth', 'Sales Manager', 'Product Manager', 'Engineering Manager', 'Founder', 'SDR Manager'][i % 10],
        status: statuses[i % statuses.length],
        source: sources[i % sources.length],
        score: Math.floor(Math.random() * 100),
        aiScore: Math.random() * 100,
        companyId: companies[i % companies.length].id,
        ownerId: [sdr.id, ae.id, manager.id][i % 3],
        createdById: sdr.id,
        utmSource: i % 2 === 0 ? 'google' : 'linkedin',
        utmMedium: i % 3 === 0 ? 'cpc' : 'organic',
        utmCampaign: i % 4 === 0 ? 'spring_promo' : 'always_on',
        notes: i % 5 === 0 ? `Lead from ${sources[i % sources.length]} - interested in demo` : null,
        lastContactedAt: i % 3 === 0 ? new Date(Date.now() - i * 86400000) : null,
      },
    });
    leads.push(lead);
  }

  console.log('Leads created');

  for (const lead of leads.slice(0, 10)) {
    await prisma.activity.createMany({
      data: [
        { leadId: lead.id, userId: lead.ownerId, type: 'NOTE', subject: 'Initial contact', description: 'Reached out via email' },
        { leadId: lead.id, userId: lead.ownerId, type: 'EMAIL', subject: 'Discovery call follow-up', description: 'Sent meeting recap' },
      ],
    });
  }

  console.log('Activities created');

  for (const lead of leads.slice(0, 8)) {
    await prisma.opportunity.create({
      data: {
        leadId: lead.id,
        companyId: lead.companyId,
        ownerId: lead.ownerId,
        name: `Deal - ${lead.firstName} ${lead.lastName}`,
        stage: [OpportunityStage.PROPOSAL, OpportunityStage.QUALIFICATION, OpportunityStage.NEGOTIATION, OpportunityStage.CLOSED_WON][Math.floor(Math.random() * 4)],
        value: Math.floor(Math.random() * 100000) + 5000,
        probability: Math.floor(Math.random() * 60) + 20,
        forecastDate: new Date(Date.now() + 30 * 86400000),
      },
    });
  }

  console.log('Opportunities created');

  await prisma.scoringRule.createMany({
    data: [
      { name: 'C-Level Title', field: 'jobTitle', operator: 'in', value: 'CEO,CTO,VP,Founder,Director', points: 20 },
      { name: 'Has Email', field: 'email', operator: 'neq', value: '', points: 10 },
      { name: 'Has Company', field: 'companyId', operator: 'neq', value: '', points: 15 },
      { name: 'Large Company', field: 'company.employeeCount', operator: 'gte', value: '100', points: 15 },
      { name: 'Multiple Activities', field: 'activities', operator: 'gte', value: '3', points: 10 },
    ],
  });

  console.log('Scoring rules created');

  const sequence = await prisma.sequence.create({
    data: {
      name: 'Standard Outreach',
      description: '5-step outreach sequence for new leads',
      ownerId: sdr.id,
    },
  });

  await prisma.sequenceStep.createMany({
    data: [
      { sequenceId: sequence.id, order: 1, type: SequenceStepType.EMAIL, subject: 'Quick introduction', content: 'Hi {{firstName}}, I noticed {{companyName}}...', delayDays: 0 },
      { sequenceId: sequence.id, order: 2, type: SequenceStepType.WAIT, delayDays: 3 },
      { sequenceId: sequence.id, order: 3, type: SequenceStepType.EMAIL, subject: 'Following up', content: 'Hi {{firstName}}, just following up...', delayDays: 0 },
      { sequenceId: sequence.id, order: 4, type: SequenceStepType.WAIT, delayDays: 5 },
      { sequenceId: sequence.id, order: 5, type: SequenceStepType.LINKEDIN, content: 'Connect on LinkedIn', delayDays: 0 },
    ],
  });

  console.log('Sequences created');

  await prisma.workflow.createMany({
    data: [
      {
        name: 'New Lead Assignment',
        description: 'Auto-assign new leads to available SDRs',
        triggerType: WorkflowTriggerType.LEAD_CREATED,
        conditions: { operator: 'AND', rules: [{ field: 'score', operator: 'gte', value: '30' }] },
        actions: [{ type: 'ASSIGN_OWNER', value: sdr.id }, { type: 'SEND_NOTIFICATION', value: { title: 'New lead assigned', userId: sdr.id } }],
        isActive: true,
      },
      {
        name: 'High Score Alert',
        description: 'Notify manager when high-value lead appears',
        triggerType: WorkflowTriggerType.LEAD_SCORE_CHANGED,
        conditions: { operator: 'AND', rules: [{ field: 'score', operator: 'gte', value: '70' }] },
        actions: [{ type: 'SEND_NOTIFICATION', value: { title: 'High-value lead detected', message: 'A lead scored 70+', userId: manager.id } }],
        isActive: true,
      },
    ],
  });

  console.log('Workflows created');

  await prisma.campaign.createMany({
    data: [
      { name: 'Google Ads - Q1', source: LeadSource.AD_PLATFORM, utmSource: 'google', utmCampaign: 'q1_demand_gen', budget: 10000, spent: 4500, isActive: true },
      { name: 'LinkedIn Outreach', source: LeadSource.LINKEDIN_IMPORT, utmSource: 'linkedin', utmCampaign: 'sdr_outreach', budget: 5000, spent: 2000, isActive: true },
      { name: 'Website Form', source: LeadSource.WEBSITE_FORM, utmSource: 'direct', utmCampaign: 'organic', budget: 0, spent: 0, isActive: true },
    ],
  });

  console.log('Campaigns created');
  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
