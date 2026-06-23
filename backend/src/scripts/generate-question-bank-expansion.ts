/**
 * Generates question-bank-expansion.seed.json to reach 400 total curated questions.
 * Run: npx ts-node -r tsconfig-paths/register src/scripts/generate-question-bank-expansion.ts
 */
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

type Q = {
  id: string;
  category: string;
  subcategory: string;
  level: string;
  roleTags: string[];
  skillTags: string[];
  difficulty: number;
  frequency: string;
  question: string;
  evaluationRubric: { excellent: string[]; good: string[]; weak: string[] };
  sampleAnswerOutline: string[];
  followUpQuestions: string[];
  prepTimeMinutes: number;
  source: string;
};

const RUBRIC = {
  excellent: ['Structured answer with concrete example and measurable outcome'],
  good: ['Relevant example but missing metrics or depth'],
  weak: ['Generic or theoretical without personal experience'],
};

const SD_RUBRIC = {
  excellent: ['Requirements, scale, API, data model, bottlenecks, trade-offs'],
  good: ['High-level design with some gaps in scale or failure modes'],
  weak: ['Vague components without data flow or trade-offs'],
};

const OUTLINE_BEH = ['Situation', 'Task', 'Action', 'Result + metric'];
const OUTLINE_TECH = ['Definition', 'When to use', 'Trade-offs', 'Example from experience'];
const OUTLINE_SD = ['Requirements & scale', 'High-level design', 'Deep dive', 'Bottlenecks'];
const FOLLOW_BEH = ['Can you give another example?', 'What would you do differently?'];
const FOLLOW_TECH = ['How does that scale?', 'What are the trade-offs?'];
const FOLLOW_SD = ['How would you handle 10x traffic?', 'What fails first?'];

const LEVELS = ['junior', 'mid', 'senior', 'lead'] as const;
const FREQ = ['very_common', 'common', 'occasional'] as const;

function q(
  id: string,
  category: string,
  subcategory: string,
  level: string,
  roleTags: string[],
  skillTags: string[],
  question: string,
  opts?: Partial<Pick<Q, 'difficulty' | 'frequency' | 'prepTimeMinutes' | 'evaluationRubric' | 'sampleAnswerOutline' | 'followUpQuestions'>>,
): Q {
  const isSd = category === 'system-design';
  return {
    id,
    category,
    subcategory,
    level,
    roleTags,
    skillTags,
    difficulty: opts?.difficulty ?? (level === 'senior' || level === 'lead' ? 4 : 3),
    frequency: opts?.frequency ?? 'common',
    question,
    evaluationRubric: opts?.evaluationRubric ?? (isSd ? SD_RUBRIC : RUBRIC),
    sampleAnswerOutline: opts?.sampleAnswerOutline ?? (isSd ? OUTLINE_SD : category === 'behavioral' ? OUTLINE_BEH : OUTLINE_TECH),
    followUpQuestions: opts?.followUpQuestions ?? (isSd ? FOLLOW_SD : category === 'behavioral' ? FOLLOW_BEH : FOLLOW_TECH),
    prepTimeMinutes: opts?.prepTimeMinutes ?? (isSd ? 35 : category === 'behavioral' ? 15 : 20),
    source: 'curated',
  };
}

function pad(n: number, w = 3) {
  return String(n).padStart(w, '0');
}

function genFromPool(
  prefix: string,
  category: string,
  subcategory: string,
  roleTags: string[],
  skillTags: string[],
  questions: string[],
  levelCycle: string[] = ['mid', 'senior', 'junior', 'mid'],
  startIndex = 1,
): Q[] {
  return questions.map((question, i) =>
    q(
      `${prefix}-${pad(startIndex + i)}`,
      category,
      subcategory,
      levelCycle[i % levelCycle.length],
      roleTags,
      [...skillTags, subcategory],
      question,
    ),
  );
}

const behavioralPool = [
  'Describe a time you had a disagreement with your manager.',
  'Tell me about a project that failed and what you learned.',
  'Give an example of when you went above and beyond.',
  'Describe a time you had to meet a tight deadline.',
  'Tell me about a time you influenced without authority.',
  'Describe a situation where you received harsh feedback.',
  'Tell me about mentoring or helping a teammate grow.',
  'Describe a time you had to learn something quickly.',
  'Tell me about a difficult stakeholder and how you handled it.',
  'Describe a time you improved a process on your team.',
  'Tell me about a time you made a mistake in production.',
  'Describe a conflict between team members you resolved.',
  'Tell me about your proudest professional achievement.',
  'Describe a time you had to say no to a request.',
  'Tell me about working with a difficult coworker.',
  'Describe a time you had incomplete requirements.',
  'Tell me about a time you advocated for the user.',
  'Describe when you had to balance speed vs quality.',
  'Tell me about a cross-functional project you led.',
  'Describe a time you changed your mind after new data.',
  'Tell me about handling competing priorities.',
  'Describe a time you improved team communication.',
  'Tell me about a time you took initiative without being asked.',
  'Describe delivering bad news to stakeholders.',
  'Tell me about a time you recovered from burnout or overload.',
  'Describe a situation requiring empathy with a customer.',
  'Tell me about onboarding or documenting for your team.',
  'Describe a time you disagreed with a technical decision.',
  'Tell me about building trust with a new team.',
  'Describe a time you simplified a complex system or process.',
  'Tell me about a goal you did not achieve.',
  'Describe working under ambiguous leadership direction.',
  'Tell me about a time you defended a junior engineer.',
  'Describe managing up when your manager was unavailable.',
  'Tell me about a ethical dilemma at work.',
  'Describe a time you used data to change a decision.',
  'Tell me about coordinating across time zones.',
  'Describe a time you had to deprioritize your own work.',
  'Tell me about feedback that changed your approach.',
  'Describe a time you turned around a skeptical stakeholder.',
  'Why do you want to work here?',
  'Where do you see yourself in 3–5 years?',
  'What is your greatest strength for this role?',
  'What is an area you are actively improving?',
  'Describe your ideal team culture.',
  'How do you handle stress during release week?',
  'Tell me about a book or course that changed how you work.',
  'Describe your approach to code review feedback.',
  'Tell me about a time you championed diversity or inclusion.',
  'Describe how you stay current with industry trends.',
  'Tell me about a time you had to cut scope to ship.',
  'Describe your most challenging 1:1 conversation.',
  'Tell me about a time you fixed a broken deployment process.',
  'Describe when you had to earn trust as an outsider on a team.',
  'Tell me about a product decision you disagreed with.',
  'Describe a time you automated away manual work.',
  'Tell me about presenting technical topics to non-technical audiences.',
  'Describe a time you prioritized customer impact over internal politics.',
  'Tell me about a long-term investment that paid off later.',
  'Describe handling a critical incident under pressure.',
  'Tell me about a time you onboarded a new technology stack.',
  'Describe when you had to rebuild a relationship with a peer.',
];

const frontendPool = [
  'Explain the React reconciliation algorithm at a high level.',
  'What is the difference between controlled and uncontrolled components?',
  'How does useMemo differ from useCallback?',
  'Explain CSS specificity and how you debug layout issues.',
  'What causes layout shift and how do you measure CLS?',
  'Explain event delegation and when you would use it.',
  'How would you optimize a slow React list with 10k items?',
  'What is hydration mismatch in SSR frameworks?',
  'Explain CORS from a frontend perspective.',
  'How do you structure a large frontend codebase?',
  'What is the virtual DOM and what are its trade-offs?',
  'Explain micro-frontends and when they make sense.',
  'How do you handle authentication tokens securely in SPAs?',
  'Describe your approach to accessibility in React apps.',
  'What is tree shaking and how does it affect bundle size?',
  'Explain the event loop and its impact on UI jank.',
  'How would you implement infinite scroll efficiently?',
  'What are Web Vitals and which do you prioritize?',
  'Explain state management options and when to use each.',
  'How do you test React components effectively?',
  'Describe optimizing LCP on a marketing landing page.',
  'What is SSR vs SSG vs ISR in Next.js?',
  'Explain Content Security Policy headers for XSS mitigation.',
  'How do you debug memory leaks in SPAs?',
  'Describe implementing dark mode with design tokens.',
  'What is the difference between rem and em?',
  'Explain service workers and offline-first patterns.',
  'How would you migrate a jQuery app to React incrementally?',
  'Describe your approach to i18n in frontend apps.',
  'What is React Server Components and why use them?',
  'Explain TypeScript utility types you use daily.',
  'How do you prevent prop drilling without overusing context?',
  'Describe implementing a design system in a product team.',
  'What is critical CSS and how do you inline it?',
  'Explain shadow DOM and web components trade-offs.',
  'How would you profile React render performance?',
  'Describe handling file uploads with progress in the browser.',
  'What is IndexedDB vs localStorage for client persistence?',
  'Explain SameSite cookie attributes and auth flows.',
  'How do you implement feature flags on the frontend?',
  'Describe error boundaries and global error reporting.',
  'What is hydration in Vue/Nuxt vs React?',
  'Explain Tailwind vs CSS modules trade-offs.',
  'How would you build a accessible modal dialog?',
  'Describe lazy loading routes and code splitting strategy.',
  'What is FLIP animation technique?',
  'Explain WebSocket vs SSE for real-time UI updates.',
  'How do you handle SEO for a client-rendered app?',
  'Describe implementing undo/redo in a complex editor UI.',
  'What is the composables pattern in Vue 3?',
  'Explain Vitest vs Jest for frontend unit tests.',
  'How would you reduce bundle size for a legacy webpack app?',
  'Describe implementing drag-and-drop with keyboard support.',
  'What is React concurrent rendering benefit for UX?',
  'Explain font loading strategies to avoid FOIT/FOUT.',
  'How do you secure against DOM-based XSS?',
  'Describe building a chart dashboard with performance constraints.',
  'What is Partial Prerendering in modern frameworks?',
  'Explain module federation for shared UI packages.',
  'How would you implement optimistic UI updates?',
  'Describe cross-tab state sync patterns.',
];

const backendPool = [
  'Explain REST vs GraphQL trade-offs for your last project.',
  'How do you design idempotent API endpoints?',
  'Describe database indexing strategy for a high-read table.',
  'What is the N+1 query problem and how do you fix it?',
  'Explain ACID vs BASE in distributed systems.',
  'How would you implement rate limiting for a public API?',
  'Describe caching layers and cache invalidation strategies.',
  'What is connection pooling and when does it matter?',
  'Explain message queues vs event streams.',
  'How do you handle database migrations in production?',
  'Describe implementing JWT auth vs session cookies.',
  'What is optimistic vs pessimistic locking?',
  'Explain CAP theorem with a real example.',
  'How would you debug a memory leak in a Node.js service?',
  'Describe designing a webhook delivery system.',
  'What is database sharding and when would you use it?',
  'Explain saga pattern for distributed transactions.',
  'How do you implement graceful shutdown in NestJS/Express?',
  'Describe observability: logs, metrics, traces.',
  'What is CQRS and when is it worth the complexity?',
  'Explain OAuth2 flows you have implemented.',
  'How would you design a multi-tenant SaaS data model?',
  'Describe handling duplicate requests in payment APIs.',
  'What is eventual consistency and how do you explain it to PMs?',
  'Explain gRPC vs REST for internal services.',
  'How do you structure error responses across microservices?',
  'Describe implementing full-text search at scale.',
  'What is the outbox pattern for reliable events?',
  'Explain blue-green vs canary deployments.',
  'How would you design a job scheduler with retries?',
  'Describe SQL query optimization you performed.',
  'What is read replica lag and how do you handle it?',
  'Explain API versioning strategies.',
  'How do you prevent SQL injection and ORM pitfalls?',
  'Describe implementing file storage with S3 pre-signed URLs.',
  'What is circuit breaker pattern and where did you use it?',
  'Explain horizontal vs vertical scaling trade-offs.',
  'How would you build a notification service?',
  'Describe schema design for an e-commerce order flow.',
  'What is two-phase commit and why is it avoided?',
  'Explain Redis use cases beyond caching.',
  'How do you handle secrets rotation in backend services?',
  'Describe implementing audit logs for compliance.',
  'What is backpressure in streaming pipelines?',
  'Explain DDD bounded contexts in a monolith migration.',
  'How would you design a feature flag service backend?',
  'Describe testing strategy for integration-heavy services.',
  'What is poison message handling in queues?',
  'Explain PostgreSQL MVCC at a practical level.',
  'How do you implement soft deletes vs hard deletes?',
  'Describe building a CSV import pipeline safely.',
  'What is idempotency key design for Stripe-like APIs?',
  'Explain health checks and readiness probes.',
  'How would you reduce latency for a global API?',
  'Describe event sourcing pros and cons you experienced.',
  'What is database connection storm during deploys?',
  'Explain zero-downtime migration for large tables.',
  'How do you handle timezone bugs in scheduling systems?',
  'Describe implementing RBAC in an API layer.',
  'What is thundering herd and mitigation strategies?',
  'Explain batch vs stream ETL for analytics.',
  'How would you design a URL shortener backend?',
  'Describe handling GDPR delete requests across services.',
];

const systemDesignPool = [
  'Design a URL shortener like bit.ly.',
  'Design a news feed like Twitter.',
  'Design a chat application like WhatsApp.',
  'Design a ride-sharing dispatch system.',
  'Design a video streaming platform like YouTube.',
  'Design an e-commerce checkout system.',
  'Design a rate limiter for API gateway.',
  'Design a distributed cache.',
  'Design a notification system.',
  'Design a search autocomplete.',
  'Design a collaborative document editor.',
  'Design a payment processing system.',
  'Design a metrics and monitoring system.',
  'Design a job queue for background workers.',
  'Design a file storage service like Dropbox.',
  'Design a recommendation engine.',
  'Design a ticket booking system for concerts.',
  'Design a leaderboard for a mobile game.',
  'Design a web crawler at scale.',
  'Design a distributed logging pipeline.',
  'Design a hotel reservation system.',
  'Design a food delivery tracking system.',
  'Design a CDN for static assets.',
  'Design a email delivery service.',
  'Design a calendar scheduling system like Calendly.',
  'Design a stock trading platform (read-heavy).',
  'Design a social graph for friend suggestions.',
  'Design a map reduce batch analytics job.',
  'Design a real-time analytics dashboard.',
  'Design a multi-region active-active database.',
  'Design a API gateway for microservices.',
  'Design a fraud detection pipeline.',
  'Design a IoT telemetry ingestion system.',
  'Design a comment system on viral posts.',
  'Design a ad auction system.',
  'Design a config/feature flag service.',
  'Design a distributed lock service.',
  'Design a session store for millions of users.',
  'Design a photo sharing app backend.',
  'Design a parking lot system (OO + scale).',
  'Design a vending machine state machine at scale.',
  'Design a key-value store like Redis.',
  'Design a time-series database for metrics.',
  'Design a blockchain wallet backend (high level).',
  'Design a ML model serving infrastructure.',
  'Design a data warehouse ingestion layer.',
  'Design a multi-tenant analytics SaaS.',
  'Design a global DNS/load balancing layer.',
  'Design a disaster recovery strategy for a bank app.',
  'Design a CI/CD artifact storage system.',
  'Design a chatbot routing platform.',
  'Design a subscription billing system.',
  'Design a content moderation pipeline.',
  'Design a proximity-based dating app backend.',
  'Design a live sports score update system.',
  'Design a warehouse inventory management system.',
  'Design a ride ETA estimation service.',
  'Design a spam filter for email at scale.',
  'Design a distributed cron scheduler.',
  'Design a password manager sync service.',
  'Design a online exam proctoring system.',
];

const faangExtraPool = [
  'Design Google Search autocomplete.',
  'Design Instagram Stories.',
  'Design Uber surge pricing.',
  'Design Netflix video encoding pipeline.',
  'Design Amazon shopping cart consistency.',
  'Design Facebook friend request system.',
  'Design LinkedIn connection suggestions.',
  'Design Apple iCloud photo sync.',
  'Design Spotify playlist collaboration.',
  'Design Airbnb booking calendar conflicts.',
  'Design Stripe idempotent payment API.',
  'Design Slack message threading at scale.',
  'Design Meta News Feed ranking (high level).',
  'Design Google Maps ETA routing.',
  'Design Dropbox file conflict resolution.',
  'Design Discord voice channel routing.',
  'Design Pinterest image pin recommendation.',
  'Design TikTok For You feed (high level).',
  'Design AWS S3 durability model (conceptual).',
  'Design Google Docs operational transform sync.',
  'Tell me about a time you optimized latency for millions of users.',
  'Describe a technical decision with significant business trade-off.',
  'How would you debug a 1% error rate spike at scale?',
  'Explain a time you reduced infrastructure cost without hurting reliability.',
  'Describe designing for partial outages in multi-region setup.',
  'Tell me about handling on-call for a critical tier-0 service.',
  'Explain how you would roll out a risky migration safely.',
  'Describe measuring success for an infrastructure project.',
  'Tell me about mentoring engineers toward senior level.',
  'Explain your approach to technical RFCs and design reviews.',
];

const pmPool = [
  'How do you prioritize a backlog with conflicting stakeholders?',
  'Walk me through writing a PRD for a new feature.',
  'How do you measure product-market fit for a B2B SaaS?',
  'Describe a time you killed a feature after launch.',
  'How do you work with engineering on estimation?',
  'Explain how you define North Star metrics.',
  'Describe a failed experiment and what you learned.',
  'How do you gather user feedback at scale?',
  'Tell me about launching in a new market segment.',
  'How do you handle scope creep before a deadline?',
  'Describe your framework for go/no-go launch decisions.',
  'How do you align roadmap with company strategy?',
  'Tell me about balancing tech debt vs new features.',
  'How do you write user stories engineers love?',
  'Describe stakeholder management during a reorg.',
  'How do you validate a problem before building a solution?',
  'Tell me about a data-driven roadmap pivot.',
  'How do you run effective sprint planning as a PM?',
  'Describe competitive analysis you led.',
  'How do you price a new product tier?',
  'Tell me about managing a product through regulatory change.',
  'How do you communicate delays to executives?',
  'Describe a time you said no to a key customer request.',
  'How do you define activation vs retention metrics?',
  'Tell me about onboarding optimization you led.',
  'How do you partner with design on discovery?',
  'Describe a cross-functional launch war room.',
  'How do you handle conflicting A/B test results?',
  'Tell me about building a product ops function.',
  'How do you manage a product with multiple personas?',
  'Describe OKRs you set for your product area.',
  'How do you run a beta program effectively?',
  'Tell me about sunsetting a legacy product.',
  'How do you assess build vs buy decisions?',
  'Describe a pricing experiment and its outcome.',
];

const dataPool = [
  'Explain bias-variance tradeoff with an example.',
  'How do you detect and handle data drift in production?',
  'Describe designing an A/B test for a checkout funnel.',
  'What is precision vs recall and when to optimize each?',
  'Explain feature engineering for a churn model.',
  'How do you explain SHAP values to a PM?',
  'Describe SQL window functions you use often.',
  'What is multicollinearity and how do you fix it?',
  'Explain train/validation/test split best practices.',
  'How do you handle missing data in a production pipeline?',
  'Describe building a real-time recommendation feature.',
  'What is Type I vs Type II error in experimentation?',
  'Explain dimensionality reduction techniques you used.',
  'How do you monitor ML model performance over time?',
  'Describe a time your model failed in production.',
  'What is causal inference vs correlation in product analytics?',
  'Explain ETL vs ELT for a modern data stack.',
  'How do you design a metrics layer for self-serve BI?',
  'Describe anomaly detection approaches you implemented.',
  'What is data lineage and why does it matter?',
  'Explain bootstrapping confidence intervals simply.',
  'How do you sample fairly for survey analysis?',
  'Describe building a churn prediction pipeline end-to-end.',
  'What is overfitting and regularization techniques?',
  'Explain cohort analysis for retention.',
  'How do you validate data quality in incoming streams?',
  'Describe NLP preprocessing for classification.',
  'What is uplift modeling and when to use it?',
  'Explain star schema vs snowflake for warehousing.',
  'How do you communicate uncertainty in forecasts?',
  'Describe a dashboard that changed a business decision.',
  'What is Simpson paradox with a product example?',
  'Explain time series forecasting methods you used.',
  'How do you handle imbalanced classes in fraud detection?',
  'Describe feature store benefits and trade-offs.',
];

const devopsPool = [
  'Explain CI/CD pipeline stages you consider essential.',
  'How do you implement infrastructure as code safely?',
  'Describe Kubernetes pod lifecycle and probes.',
  'What is GitOps and how does it differ from traditional CD?',
  'Explain Terraform state management pitfalls.',
  'How do you design on-call rotations and runbooks?',
  'Describe container image security scanning in CI.',
  'What is service mesh and when is it overkill?',
  'Explain autoscaling policies for Kubernetes HPA.',
  'How do you manage secrets in Kubernetes?',
  'Describe disaster recovery testing you led.',
  'What is SLO vs SLA vs SLI?',
  'Explain incident response steps for a SEV1.',
  'How do you reduce MTTR for recurring incidents?',
  'Describe monitoring cardinality problems and fixes.',
  'What is immutable infrastructure in practice?',
  'Explain canary analysis with automated rollback.',
  'How do you cost-optimize cloud workloads?',
  'Describe building a internal developer platform.',
  'What is eBPF used for in observability?',
  'Explain network policies in zero-trust architecture.',
  'How do you patch OS vulnerabilities without downtime?',
  'Describe log aggregation architecture at scale.',
  'What is chaos engineering and safe experiments?',
  'Explain multi-cluster Kubernetes strategy.',
];

const mobilePool = [
  'Explain iOS vs Android app lifecycle differences.',
  'How do you handle offline-first mobile sync?',
  'Describe optimizing app startup time.',
  'What is deep linking and universal links setup?',
  'Explain push notification delivery architecture.',
  'How do you reduce mobile app crash rate?',
  'Describe React Native bridge performance issues.',
  'What is app thinning and on-demand resources?',
  'Explain mobile analytics privacy (ATT, GDPR).',
  'How do you implement secure local storage on mobile?',
  'Describe CI/CD for mobile release trains.',
  'What is Flutter widget rebuild optimization?',
  'Explain handling low-memory warnings on iOS.',
  'How do you test mobile apps across device matrix?',
  'Describe implementing in-app purchases securely.',
  'What is background fetch vs silent push?',
  'Explain mobile A/B testing implementation.',
  'How do you debug ANR issues on Android?',
  'Describe modularization in large Android apps.',
  'What is SwiftUI vs UIKit migration strategy?',
];

const securityPool = [
  'Explain OWASP Top 10 risks relevant to web apps.',
  'How do you threat model a new API feature?',
  'Describe handling secrets in source code incidents.',
  'What is SSRF and how do you prevent it?',
  'Explain zero-trust network access model.',
  'How do you respond to a suspected data breach?',
  'Describe penetration test findings you remediated.',
  'What is SAML vs OIDC for enterprise SSO?',
  'Explain encryption at rest vs in transit.',
  'How do you implement least privilege IAM policies?',
  'Describe secure SDLC practices on your team.',
  'What is supply chain attack mitigation for dependencies?',
  'Explain CSRF protection mechanisms.',
  'How do you secure admin panels and internal tools?',
  'Describe security review for AI/LLM features.',
];

const vnHrPool = [
  'Bạn mong muốn mức lương bao nhiêu?',
  'Bạn có thể onboard trong bao lâu?',
  'Tại sao bạn quan tâm công ty chúng tôi?',
  'Điểm mạnh và điểm yếu của bạn là gì?',
  'Bạn xử lý áp lực deadline thế nào?',
  'Kinh nghiệm làm việc nhóm đa văn hóa của bạn?',
  'Bạn có làm việc overtime khi cần không?',
  'Mục tiêu nghề nghiệp 3 năm tới của bạn?',
  'Bạn có visa/work permit phù hợp không?',
  'Câu hỏi bạn muốn hỏi interviewer?',
  'Kinh nghiệm làm việc remote/hybrid?',
  'Lý do nghỉ việc công ty cũ (cách trả lời chuyên nghiệp)?',
  'Bạn có portfolio/GitHub để chia sẻ không?',
  'Thái độ với feedback từ sếp và đồng nghiệp?',
  'Kỳ vọng về môi trường startup vs corporate?',
];

const qaPool = [
  'Explain test pyramid for a web application.',
  'How do you prioritize regression tests before release?',
  'Describe automating flaky E2E tests.',
  'What is shift-left testing in agile teams?',
  'Explain API contract testing with Pact or similar.',
  'How do you test accessibility automatically?',
  'Describe performance testing strategy for APIs.',
  'What is exploratory testing vs scripted testing?',
  'Explain CI test parallelization for speed.',
  'How do you report quality metrics to leadership?',
];

const items: Q[] = [
  ...genFromPool('exp-beh', 'behavioral', 'general', ['software-engineer'], ['communication'], behavioralPool.slice(0, 52)),
  ...genFromPool('exp-fe', 'technical', 'frontend', ['software-engineer'], ['react', 'frontend'], frontendPool.slice(0, 44), ['junior', 'mid', 'senior', 'mid']),
  ...genFromPool('exp-be', 'technical', 'backend', ['software-engineer'], ['backend', 'api'], backendPool.slice(0, 44), ['mid', 'senior', 'senior', 'lead']),
  ...genFromPool('exp-sd', 'system-design', 'distributed-systems', ['software-engineer'], ['system-design'], systemDesignPool.slice(0, 44), ['senior', 'lead', 'senior', 'lead']),
  ...genFromPool('exp-faang', 'system-design', 'faang', ['faang', 'software-engineer'], ['system-design', 'faang'], faangExtraPool.slice(0, 24), ['senior', 'lead', 'senior', 'lead']),
  ...genFromPool('exp-pm', 'situational', 'product-manager', ['product-manager'], ['product', 'strategy'], pmPool.slice(0, 24), ['mid', 'senior', 'mid', 'senior']),
  ...genFromPool('exp-data', 'technical', 'data-science', ['data-scientist', 'data-analyst'], ['data', 'sql'], dataPool.slice(0, 24), ['mid', 'senior', 'mid', 'senior']),
  ...genFromPool('exp-devops', 'technical', 'devops', ['software-engineer', 'devops'], ['kubernetes', 'ci-cd'], devopsPool.slice(0, 14), ['senior', 'lead', 'senior', 'mid']),
  ...genFromPool('exp-mobile', 'technical', 'mobile', ['mobile-engineer'], ['ios', 'android'], mobilePool.slice(0, 12), ['mid', 'senior', 'junior', 'mid']),
  ...genFromPool('exp-sec', 'technical', 'security', ['software-engineer'], ['security'], securityPool.slice(0, 10), ['senior', 'lead', 'senior', 'mid']),
  ...genFromPool('exp-vn', 'company-culture', 'vietnam-hr', ['software-engineer'], ['communication'], vnHrPool.slice(0, 10), ['junior', 'mid', 'mid', 'mid'], 1).map((item) => ({
    ...item,
    frequency: 'very_common' as const,
    prepTimeMinutes: 10,
  })),
  ...genFromPool('exp-qa', 'technical', 'qa', ['qa-engineer'], ['testing'], qaPool.slice(0, 8), ['mid', 'mid', 'junior', 'mid']),
];

const dataDir = join(__dirname, '..', 'modules', 'interview-prep', 'data');
const existingIds = new Set<string>();

for (const file of ['question-bank.seed.json', 'question-bank-p2.seed.json']) {
  try {
    const existing = JSON.parse(readFileSync(join(dataDir, file), 'utf-8')) as Q[];
    existing.forEach((e) => existingIds.add(e.id));
  } catch {
    /* skip */
  }
}

const unique = items.filter((item) => !existingIds.has(item.id));
const dupInBatch = new Set<string>();
const deduped = unique.filter((item) => {
  if (dupInBatch.has(item.id)) return false;
  dupInBatch.add(item.id);
  return true;
});

const outPath = join(dataDir, 'question-bank-expansion.seed.json');
writeFileSync(outPath, JSON.stringify(deduped, null, 2));

const totalAfter = existingIds.size + deduped.length;
console.log(`Wrote ${deduped.length} expansion questions to ${outPath}`);
console.log(`Total after seed: ${totalAfter} (target 400, delta ${400 - totalAfter})`);

if (totalAfter !== 400) {
  console.warn(`Warning: total is ${totalAfter}, not exactly 400. Adjust pools.`);
  process.exit(totalAfter < 400 ? 1 : 0);
}
