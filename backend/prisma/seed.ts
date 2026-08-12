import { PrismaClient, UserRole, UserStatus, ProjectStatus, ProjectPriority, TaskStatus, TaskPriority, MilestoneStatus, TeamMemberRole, ProjectMemberRole, ActivityAction } from '@prisma/client';

const prisma = new PrismaClient();
// Default password for all seeded users (plain text)
const DEFAULT_PASSWORD = 'password123';

async function main() {
  console.log('🌱 Starting seed...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.taskHistory.deleteMany();
  await prisma.dailyWorkUpdateTask.deleteMany();
  await prisma.dailyWorkUpdateProject.deleteMany();
  await prisma.dailyWorkUpdate.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.checklistItem.deleteMany();
  await prisma.taskLabel.deleteMany();
  await prisma.task.deleteMany();
  await prisma.label.deleteMany();
  await prisma.milestone.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectTeam.deleteMany();
  await prisma.project.deleteMany();
  await prisma.teamMember.deleteMany();
  await prisma.team.deleteMany();
  await prisma.user.deleteMany();

  console.log('✅ Cleaned existing data');

  // ============================================================
  // USERS
  // ============================================================
  const [alice, bob, charlie, diana, evan] = await Promise.all([
    prisma.user.create({
      data: {
        email: 'alice@projectmanager.dev',
        name: 'Alice Johnson',
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        jobTitle: 'CTO',
        department: 'Engineering',
        timezone: 'America/New_York',
        bio: 'Experienced engineering leader with a passion for building great products.',
        phone: '+1-555-0101',
        password: DEFAULT_PASSWORD,
      },
    }),
    prisma.user.create({
      data: {
        email: 'bob@projectmanager.dev',
        name: 'Bob Martinez',
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        jobTitle: 'Frontend Lead',
        department: 'Engineering',
        timezone: 'America/Chicago',
        bio: 'React specialist and team mentor.',
        phone: '+1-555-0102',
        password: DEFAULT_PASSWORD,
      },
    }),
    prisma.user.create({
      data: {
        email: 'charlie@projectmanager.dev',
        name: 'Charlie Kim',
        role: UserRole.MANAGER,
        status: UserStatus.ACTIVE,
        jobTitle: 'Backend Lead',
        department: 'Engineering',
        timezone: 'America/Los_Angeles',
        bio: 'Node.js expert and API architect.',
        phone: '+1-555-0103',
        password: DEFAULT_PASSWORD,
      },
    }),
    prisma.user.create({
      data: {
        email: 'diana@projectmanager.dev',
        name: 'Diana Patel',
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        jobTitle: 'Frontend Developer',
        department: 'Engineering',
        timezone: 'America/Denver',
        bio: 'Vue.js and React developer with a love for great UX.',
        phone: '+1-555-0104',
        password: DEFAULT_PASSWORD,
      },
    }),
    prisma.user.create({
      data: {
        email: 'evan@projectmanager.dev',
        name: 'Evan Chen',
        role: UserRole.DEVELOPER,
        status: UserStatus.ACTIVE,
        jobTitle: 'Full Stack Developer',
        department: 'Engineering',
        timezone: 'America/New_York',
        bio: 'Full stack developer focused on scalable architectures.',
        phone: '+1-555-0105',
        password: DEFAULT_PASSWORD,
      },
    }),
  ]);

  console.log('✅ Created 5 users');

  // ============================================================
  // TEAMS
  // ============================================================
  const [frontendTeam, backendTeam] = await Promise.all([
    prisma.team.create({
      data: {
        name: 'Frontend Team',
        slug: 'frontend-team',
        description: 'Responsible for all user-facing features and UI/UX implementation.',
        color: '#6366f1',
      },
    }),
    prisma.team.create({
      data: {
        name: 'Backend Team',
        slug: 'backend-team',
        description: 'Responsible for APIs, databases, and server infrastructure.',
        color: '#10b981',
      },
    }),
  ]);

  // Team memberships
  await Promise.all([
    prisma.teamMember.create({ data: { teamId: frontendTeam.id, userId: bob.id, role: TeamMemberRole.LEAD } }),
    prisma.teamMember.create({ data: { teamId: frontendTeam.id, userId: diana.id, role: TeamMemberRole.MEMBER } }),
    prisma.teamMember.create({ data: { teamId: backendTeam.id, userId: charlie.id, role: TeamMemberRole.LEAD } }),
    prisma.teamMember.create({ data: { teamId: backendTeam.id, userId: evan.id, role: TeamMemberRole.MEMBER } }),
  ]);

  console.log('✅ Created 2 teams with members');

  // ============================================================
  // PROJECTS
  // ============================================================
  const [ecommerceProject, mobileProject, apiProject] = await Promise.all([
    prisma.project.create({
      data: {
        name: 'E-commerce Platform',
        slug: 'ecommerce-platform',
        description: 'A fully featured e-commerce platform with cart, checkout, and payment processing.',
        status: ProjectStatus.ACTIVE,
        priority: ProjectPriority.HIGH,
        color: '#6366f1',
        icon: '🛒',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-12-31'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'Mobile App',
        slug: 'mobile-app',
        description: 'Cross-platform mobile application built with React Native.',
        status: ProjectStatus.ACTIVE,
        priority: ProjectPriority.MEDIUM,
        color: '#f59e0b',
        icon: '📱',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-09-30'),
      },
    }),
    prisma.project.create({
      data: {
        name: 'API Gateway',
        slug: 'api-gateway',
        description: 'Centralized API gateway for microservices orchestration.',
        status: ProjectStatus.PLANNING,
        priority: ProjectPriority.HIGH,
        color: '#10b981',
        icon: '🔌',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-11-30'),
      },
    }),
  ]);

  // Project members
  await Promise.all([
    // E-commerce project
    prisma.projectMember.create({ data: { projectId: ecommerceProject.id, userId: alice.id, role: ProjectMemberRole.OWNER } }),
    prisma.projectMember.create({ data: { projectId: ecommerceProject.id, userId: bob.id, role: ProjectMemberRole.MANAGER } }),
    prisma.projectMember.create({ data: { projectId: ecommerceProject.id, userId: diana.id, role: ProjectMemberRole.DEVELOPER } }),
    prisma.projectMember.create({ data: { projectId: ecommerceProject.id, userId: evan.id, role: ProjectMemberRole.DEVELOPER } }),

    // Mobile project
    prisma.projectMember.create({ data: { projectId: mobileProject.id, userId: alice.id, role: ProjectMemberRole.OWNER } }),
    prisma.projectMember.create({ data: { projectId: mobileProject.id, userId: charlie.id, role: ProjectMemberRole.MANAGER } }),
    prisma.projectMember.create({ data: { projectId: mobileProject.id, userId: diana.id, role: ProjectMemberRole.DEVELOPER } }),

    // API project
    prisma.projectMember.create({ data: { projectId: apiProject.id, userId: alice.id, role: ProjectMemberRole.OWNER } }),
    prisma.projectMember.create({ data: { projectId: apiProject.id, userId: charlie.id, role: ProjectMemberRole.MANAGER } }),
    prisma.projectMember.create({ data: { projectId: apiProject.id, userId: evan.id, role: ProjectMemberRole.DEVELOPER } }),
  ]);

  // Project-team associations
  await Promise.all([
    prisma.projectTeam.create({ data: { projectId: ecommerceProject.id, teamId: frontendTeam.id } }),
    prisma.projectTeam.create({ data: { projectId: ecommerceProject.id, teamId: backendTeam.id } }),
    prisma.projectTeam.create({ data: { projectId: mobileProject.id, teamId: frontendTeam.id } }),
    prisma.projectTeam.create({ data: { projectId: apiProject.id, teamId: backendTeam.id } }),
  ]);

  console.log('✅ Created 3 projects with members');

  // ============================================================
  // MILESTONES
  // ============================================================
  const [m1, m2, m3, m4, m5] = await Promise.all([
    prisma.milestone.create({
      data: {
        projectId: ecommerceProject.id,
        name: 'MVP Launch',
        description: 'Minimum viable product with core shopping features',
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: new Date('2024-06-30'),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: ecommerceProject.id,
        name: 'Payment Integration',
        description: 'Stripe payment processing fully integrated',
        status: MilestoneStatus.PENDING,
        dueDate: new Date('2024-09-30'),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: mobileProject.id,
        name: 'Alpha Release',
        description: 'Internal alpha testing release',
        status: MilestoneStatus.PENDING,
        dueDate: new Date('2024-05-31'),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: mobileProject.id,
        name: 'App Store Launch',
        description: 'Public launch on iOS and Android',
        status: MilestoneStatus.PENDING,
        dueDate: new Date('2024-09-30'),
      },
    }),
    prisma.milestone.create({
      data: {
        projectId: apiProject.id,
        name: 'Architecture Design',
        description: 'Complete API gateway architecture specification',
        status: MilestoneStatus.IN_PROGRESS,
        dueDate: new Date('2024-04-30'),
      },
    }),
  ]);

  console.log('✅ Created milestones');

  // ============================================================
  // LABELS
  // ============================================================
  const [bugLabel, featureLabel, improveLabel, urgentLabel] = await Promise.all([
    prisma.label.create({ data: { projectId: ecommerceProject.id, name: 'Bug', color: '#ef4444' } }),
    prisma.label.create({ data: { projectId: ecommerceProject.id, name: 'Feature', color: '#6366f1' } }),
    prisma.label.create({ data: { projectId: ecommerceProject.id, name: 'Improvement', color: '#10b981' } }),
    prisma.label.create({ data: { projectId: ecommerceProject.id, name: 'Urgent', color: '#f59e0b' } }),
    prisma.label.create({ data: { projectId: mobileProject.id, name: 'UI', color: '#8b5cf6' } }),
    prisma.label.create({ data: { projectId: mobileProject.id, name: 'Performance', color: '#06b6d4' } }),
    prisma.label.create({ data: { projectId: apiProject.id, name: 'Security', color: '#ef4444' } }),
    prisma.label.create({ data: { projectId: apiProject.id, name: 'Infrastructure', color: '#64748b' } }),
  ]);

  console.log('✅ Created labels');

  // ============================================================
  // TASKS (10 per project)
  // ============================================================

  // E-commerce tasks
  const ecommerceTasks = await Promise.all([
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        milestoneId: m1.id,
        assigneeId: diana.id,
        reporterId: bob.id,
        title: 'Implement product listing page',
        description: 'Create a paginated product listing with filters for category, price range, and availability.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-15'),
        completedAt: new Date('2024-03-14'),
        estimatedHours: 16,
        actualHours: 14,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        milestoneId: m1.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Build shopping cart API',
        description: 'RESTful API for cart management: add, remove, update items.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-20'),
        completedAt: new Date('2024-03-19'),
        estimatedHours: 24,
        actualHours: 22,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        milestoneId: m1.id,
        assigneeId: diana.id,
        reporterId: bob.id,
        title: 'Design checkout flow UI',
        description: 'Multi-step checkout: cart review, shipping, payment, confirmation.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-04-15'),
        estimatedHours: 32,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        milestoneId: m2.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Integrate Stripe payment gateway',
        description: 'Implement Stripe payment processing with webhook handling for payment events.',
        status: TaskStatus.TODO,
        priority: TaskPriority.URGENT,
        dueDate: new Date('2024-05-01'),
        estimatedHours: 40,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: diana.id,
        reporterId: bob.id,
        title: 'User authentication & authorization',
        description: 'JWT-based auth with role-based access control.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-02-28'),
        completedAt: new Date('2024-02-27'),
        estimatedHours: 20,
        actualHours: 18,
        position: 3,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Product search with full-text indexing',
        description: 'Implement full-text search using PostgreSQL tsvector with ranking.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-04-30'),
        estimatedHours: 24,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: diana.id,
        reporterId: alice.id,
        title: 'Product image upload & management',
        description: 'Multi-image upload with resizing, compression, and CDN delivery.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-06-01'),
        estimatedHours: 16,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: evan.id,
        reporterId: alice.id,
        title: 'Order management system',
        description: 'Order lifecycle management: placed, processing, shipped, delivered, cancelled.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-07-01'),
        estimatedHours: 32,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: diana.id,
        reporterId: bob.id,
        title: 'Email notification system',
        description: 'Transactional emails for order confirmation, shipping updates, etc.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-05-15'),
        estimatedHours: 12,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: ecommerceProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Performance optimization & caching',
        description: 'Redis caching for product listings, session management, and query optimization.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        dueDate: new Date('2024-09-01'),
        estimatedHours: 20,
        position: 3,
      },
    }),
  ]);

  // Mobile App tasks
  const mobileTasks = await Promise.all([
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        milestoneId: m3.id,
        assigneeId: diana.id,
        reporterId: charlie.id,
        title: 'Setup React Native project structure',
        description: 'Initialize project with navigation, state management, and styling setup.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-02-15'),
        completedAt: new Date('2024-02-14'),
        estimatedHours: 8,
        actualHours: 6,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        milestoneId: m3.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Implement push notifications',
        description: 'Firebase Cloud Messaging integration for iOS and Android.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-04-15'),
        estimatedHours: 20,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        milestoneId: m3.id,
        assigneeId: diana.id,
        reporterId: charlie.id,
        title: 'Home screen design & implementation',
        description: 'Dashboard with recent activity, quick actions, and navigation.',
        status: TaskStatus.IN_REVIEW,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-31'),
        estimatedHours: 24,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'API integration layer',
        description: 'Axios-based API client with interceptors, error handling, and retry logic.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-01'),
        completedAt: new Date('2024-02-28'),
        estimatedHours: 16,
        actualHours: 14,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: diana.id,
        reporterId: charlie.id,
        title: 'User profile & settings screen',
        description: 'Profile editing, notification preferences, theme selection.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-04-30'),
        estimatedHours: 16,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Offline mode support',
        description: 'Local SQLite caching with sync when connectivity is restored.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-06-30'),
        estimatedHours: 32,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        milestoneId: m4.id,
        assigneeId: diana.id,
        reporterId: alice.id,
        title: 'App Store submission preparation',
        description: 'Screenshots, app description, privacy policy, App Store listing.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-09-01'),
        estimatedHours: 12,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Performance testing & profiling',
        description: 'Memory leak detection, render optimization, bundle size reduction.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-08-15'),
        estimatedHours: 20,
        position: 3,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: diana.id,
        reporterId: charlie.id,
        title: 'Deep linking implementation',
        description: 'Universal links for web-to-app and app-to-app navigation.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-05-31'),
        estimatedHours: 12,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: mobileProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Analytics integration',
        description: 'Mixpanel event tracking for user behavior analytics.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        dueDate: new Date('2024-07-31'),
        estimatedHours: 8,
        position: 4,
      },
    }),
  ]);

  // API Gateway tasks
  const apiTasks = await Promise.all([
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        milestoneId: m5.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'System architecture design',
        description: 'Design microservices topology, service mesh, and communication patterns.',
        status: TaskStatus.DONE,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-03-31'),
        completedAt: new Date('2024-03-28'),
        estimatedHours: 40,
        actualHours: 36,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        milestoneId: m5.id,
        assigneeId: charlie.id,
        reporterId: alice.id,
        title: 'API documentation with OpenAPI 3.0',
        description: 'Comprehensive API documentation using OpenAPI/Swagger spec.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-04-15'),
        estimatedHours: 24,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Rate limiting middleware',
        description: 'Implement token bucket algorithm for per-client rate limiting.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-05-15'),
        estimatedHours: 16,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: charlie.id,
        reporterId: alice.id,
        title: 'JWT token validation service',
        description: 'Centralized JWT validation with RSA key rotation support.',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.URGENT,
        dueDate: new Date('2024-04-30'),
        estimatedHours: 20,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Service health monitoring',
        description: 'Health check endpoints, circuit breaker pattern, and alerting.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-06-30'),
        estimatedHours: 24,
        position: 1,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: charlie.id,
        reporterId: alice.id,
        title: 'Request logging & audit trail',
        description: 'Structured logging with correlation IDs and audit log storage.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-07-15'),
        estimatedHours: 16,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'Load balancing configuration',
        description: 'Nginx upstream configuration with health checks and failover.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-08-01'),
        estimatedHours: 12,
        position: 3,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: charlie.id,
        reporterId: alice.id,
        title: 'API versioning strategy',
        description: 'Implement URL-based versioning with backward compatibility.',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: new Date('2024-05-31'),
        estimatedHours: 8,
        position: 2,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: evan.id,
        reporterId: charlie.id,
        title: 'GraphQL federation setup',
        description: 'Apollo Federation for unified GraphQL schema across services.',
        status: TaskStatus.BACKLOG,
        priority: TaskPriority.LOW,
        dueDate: new Date('2024-10-01'),
        estimatedHours: 40,
        position: 4,
      },
    }),
    prisma.task.create({
      data: {
        projectId: apiProject.id,
        assigneeId: charlie.id,
        reporterId: alice.id,
        title: 'Integration test suite',
        description: 'End-to-end integration tests for all gateway endpoints.',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: new Date('2024-06-15'),
        estimatedHours: 32,
        position: 3,
      },
    }),
  ]);

  console.log('✅ Created 30 tasks across 3 projects');

  // ============================================================
  // TASK LABELS
  // ============================================================
  await Promise.all([
    prisma.taskLabel.create({ data: { taskId: ecommerceTasks[0].id, labelId: featureLabel.id } }),
    prisma.taskLabel.create({ data: { taskId: ecommerceTasks[2].id, labelId: featureLabel.id } }),
    prisma.taskLabel.create({ data: { taskId: ecommerceTasks[3].id, labelId: urgentLabel.id } }),
    prisma.taskLabel.create({ data: { taskId: ecommerceTasks[5].id, labelId: improveLabel.id } }),
    prisma.taskLabel.create({ data: { taskId: ecommerceTasks[9].id, labelId: improveLabel.id } }),
  ]);

  console.log('✅ Created task labels');

  // ============================================================
  // CHECKLIST ITEMS
  // ============================================================
  await Promise.all([
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[2].id, title: 'Design wireframes', isCompleted: true, completedAt: new Date(), position: 1 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[2].id, title: 'Implement cart summary step', isCompleted: true, completedAt: new Date(), position: 2 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[2].id, title: 'Add shipping address form', isCompleted: false, position: 3 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[2].id, title: 'Implement payment step UI', isCompleted: false, position: 4 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[2].id, title: 'Add order confirmation screen', isCompleted: false, position: 5 } }),

    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[3].id, title: 'Setup Stripe account and get API keys', isCompleted: true, completedAt: new Date(), position: 1 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[3].id, title: 'Implement payment intent creation', isCompleted: false, position: 2 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[3].id, title: 'Setup webhook endpoint', isCompleted: false, position: 3 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[3].id, title: 'Handle payment success and failure', isCompleted: false, position: 4 } }),
    prisma.checklistItem.create({ data: { taskId: ecommerceTasks[3].id, title: 'Write unit tests', isCompleted: false, position: 5 } }),
  ]);

  console.log('✅ Created checklist items');

  // ============================================================
  // COMMENTS
  // ============================================================
  const comment1 = await prisma.comment.create({
    data: {
      taskId: ecommerceTasks[2].id,
      authorId: bob.id,
      content: 'The wireframes are ready. @diana please review and let me know if changes are needed.',
    },
  });

  await prisma.comment.create({
    data: {
      taskId: ecommerceTasks[2].id,
      authorId: diana.id,
      content: 'Looks good! I have a few minor suggestions on the mobile responsiveness. Will send a Figma comment.',
      parentId: comment1.id,
    },
  });

  await prisma.comment.create({
    data: {
      taskId: ecommerceTasks[3].id,
      authorId: charlie.id,
      content: 'We need the Stripe test credentials from the client before we can proceed. @evan can you follow up?',
    },
  });

  await prisma.comment.create({
    data: {
      taskId: apiTasks[1].id,
      authorId: alice.id,
      content: 'Great progress on the documentation! Make sure to include authentication examples for each endpoint.',
    },
  });

  console.log('✅ Created comments');

  // ============================================================
  // TASK HISTORY
  // ============================================================
  await Promise.all([
    prisma.taskHistory.create({
      data: {
        taskId: ecommerceTasks[0].id,
        userId: bob.id,
        field: 'status',
        oldValue: 'TODO',
        newValue: 'IN_PROGRESS',
      },
    }),
    prisma.taskHistory.create({
      data: {
        taskId: ecommerceTasks[0].id,
        userId: diana.id,
        field: 'status',
        oldValue: 'IN_PROGRESS',
        newValue: 'DONE',
      },
    }),
    prisma.taskHistory.create({
      data: {
        taskId: ecommerceTasks[2].id,
        userId: bob.id,
        field: 'assignee',
        oldValue: null,
        newValue: diana.id,
      },
    }),
    prisma.taskHistory.create({
      data: {
        taskId: ecommerceTasks[3].id,
        userId: charlie.id,
        field: 'priority',
        oldValue: 'HIGH',
        newValue: 'URGENT',
      },
    }),
  ]);

  console.log('✅ Created task history');

  // ============================================================
  // DAILY WORK UPDATES
  // ============================================================
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

  await Promise.all([
    prisma.dailyWorkUpdate.create({
      data: {
        userId: diana.id,
        date: today,
        summary: 'Implemented the cart summary step in checkout flow. Also reviewed Bob\'s wireframes and left feedback.',
        hoursWorked: 7.5,
        tomorrowPlan: 'Work on the shipping address form component.',
        mood: 4,
        tasks: {
          create: [
            { taskId: ecommerceTasks[2].id, isCompleted: false, hoursSpent: 5, notes: 'Making good progress, about 40% done' },
          ],
        },
        projects: {
          create: [{ projectId: ecommerceProject.id }],
        },
      },
    }),
    prisma.dailyWorkUpdate.create({
      data: {
        userId: evan.id,
        date: today,
        summary: 'Continued working on the product search feature. Added indexing and ranked search results.',
        hoursWorked: 8,
        tomorrowPlan: 'Finish search and start on JWT token validation for API Gateway.',
        blockers: 'Need clarification on search ranking algorithm requirements.',
        mood: 3,
        tasks: {
          create: [
            { taskId: ecommerceTasks[5].id, isCompleted: false, hoursSpent: 6, notes: 'Search is ~70% complete' },
            { taskId: apiTasks[3].id, isCompleted: false, hoursSpent: 2, notes: 'Research phase' },
          ],
        },
        projects: {
          create: [
            { projectId: ecommerceProject.id },
            { projectId: apiProject.id },
          ],
        },
      },
    }),
    prisma.dailyWorkUpdate.create({
      data: {
        userId: charlie.id,
        date: today,
        summary: 'Worked on OpenAPI documentation for the API gateway. Completed authentication and user management sections.',
        hoursWorked: 7,
        tomorrowPlan: 'Complete the payment service documentation and start rate limiting implementation.',
        mood: 5,
        tasks: {
          create: [
            { taskId: apiTasks[1].id, isCompleted: false, hoursSpent: 7, notes: 'About 60% complete' },
          ],
        },
        projects: {
          create: [{ projectId: apiProject.id }],
        },
      },
    }),
    prisma.dailyWorkUpdate.create({
      data: {
        userId: diana.id,
        date: yesterday,
        summary: 'Completed the home screen design for mobile app and got approval. Started implementing it.',
        hoursWorked: 8,
        tomorrowPlan: 'Continue checkout flow implementation.',
        mood: 5,
        tasks: {
          create: [
            { taskId: mobileTasks[2].id, isCompleted: false, hoursSpent: 8, notes: 'Design approved, 50% implemented' },
          ],
        },
        projects: {
          create: [{ projectId: mobileProject.id }],
        },
      },
    }),
    prisma.dailyWorkUpdate.create({
      data: {
        userId: evan.id,
        date: yesterday,
        summary: 'Fixed critical bug in the API integration layer for mobile app. Also finished system architecture documentation.',
        hoursWorked: 9,
        tomorrowPlan: 'Continue product search implementation.',
        mood: 4,
        tasks: {
          create: [
            { taskId: apiTasks[0].id, isCompleted: true, hoursSpent: 3, notes: 'All done!' },
          ],
        },
        projects: {
          create: [
            { projectId: mobileProject.id },
            { projectId: apiProject.id },
          ],
        },
      },
    }),
  ]);

  console.log('✅ Created 5 daily work updates');

  // ============================================================
  // ACTIVITY LOGS
  // ============================================================
  await Promise.all([
    prisma.activityLog.create({
      data: {
        userId: alice.id,
        projectId: ecommerceProject.id,
        action: ActivityAction.CREATED,
        entityType: 'Project',
        entityId: ecommerceProject.id,
        entityTitle: 'E-commerce Platform',
        metadata: { description: 'Project created' },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: diana.id,
        projectId: ecommerceProject.id,
        taskId: ecommerceTasks[0].id,
        action: ActivityAction.STATUS_CHANGED,
        entityType: 'Task',
        entityId: ecommerceTasks[0].id,
        entityTitle: 'Implement product listing page',
        metadata: { from: 'IN_PROGRESS', to: 'DONE' },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: charlie.id,
        projectId: apiProject.id,
        taskId: apiTasks[3].id,
        action: ActivityAction.PRIORITY_CHANGED,
        entityType: 'Task',
        entityId: apiTasks[3].id,
        entityTitle: 'JWT token validation service',
        metadata: { from: 'HIGH', to: 'URGENT' },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: bob.id,
        projectId: ecommerceProject.id,
        taskId: ecommerceTasks[2].id,
        action: ActivityAction.ASSIGNED,
        entityType: 'Task',
        entityId: ecommerceTasks[2].id,
        entityTitle: 'Design checkout flow UI',
        metadata: { assigneeId: diana.id },
      },
    }),
    prisma.activityLog.create({
      data: {
        userId: evan.id,
        projectId: apiProject.id,
        taskId: apiTasks[0].id,
        action: ActivityAction.STATUS_CHANGED,
        entityType: 'Task',
        entityId: apiTasks[0].id,
        entityTitle: 'System architecture design',
        metadata: { from: 'IN_PROGRESS', to: 'DONE' },
      },
    }),
  ]);

  console.log('✅ Created activity logs');

  console.log('\n🎉 Seed complete!');
  console.log(`
  Summary:
  - 5 Users (alice=ADMIN, bob=MANAGER, charlie=MANAGER, diana=DEVELOPER, evan=DEVELOPER)
  - 2 Teams (Frontend Team, Backend Team)
  - 3 Projects (E-commerce Platform, Mobile App, API Gateway)
  - 5 Milestones
  - 8 Labels
  - 30 Tasks (10 per project with varied statuses)
  - 10 Checklist Items
  - 4 Comments
  - 4 Task History entries
  - 5 Daily Work Updates
  - 5 Activity Logs
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
