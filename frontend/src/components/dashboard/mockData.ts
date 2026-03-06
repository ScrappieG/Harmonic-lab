import type { DashboardStats, SessionDetailData, SessionListItem, SessionTrendPoint } from './types'

const toOverallScore = (technical: number, communication: number, problemSolving: number) =>
  Number(((technical + communication + problemSolving) / 3).toFixed(1))

export const dashboardStats: DashboardStats = {
  sessions: 7,
  avgScore: 3.0,
  maxScore: 4,
  totalMinutes: 158,
}

export const sessionTrend: SessionTrendPoint[] = [
  { date: 'Feb 4', score: 3.3 },
  { date: 'Feb 7', score: 2.3 },
  { date: 'Feb 9', score: 3.1 },
  { date: 'Feb 11', score: 2.6 },
  { date: 'Feb 13', score: 2.9 },
]

export const sessionDetails: SessionDetailData[] = [
  {
    session: {
      id: 'session-01',
      problemName: 'Design a URL Shortener',
      createdAt: '2026-02-13T10:12:00.000Z',
      totalTimeMinutes: 22,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(3, 3, 3),
      scoreTechnical: 3,
      scoreComm: 3,
      scorePs: 3,
      pass: true,
      feedbackOverall:
        'Solid grasp of hash-based lookups and collision detection. Consider discussing cache hit ratios and their impact on effective latency.',
      feedbackComm:
        'Strong clarification phase - asked about scale and read/write ratios early. Work on narrating your decision-making process more explicitly.',
      feedbackPs:
        'Good comparison of hashing vs counter-based ID generation. Try tracing through specific failure scenarios step by step next time.',
      overallTakeaway:
        'You showed a solid grasp of URL shortener design fundamentals. Your clarification phase was strong, and you navigated the core hashing vs counter tradeoff well. The main area for growth is in articulation - slowing down during transitions between sections and narrating your reasoning more explicitly.',
    },
    problemDetails: {
      code: `class URLShortener:
    def __init__(self):
        self.counter = 0
        self.url_map = {}  # short -> long
        self.reverse_map = {}  # long -> short

    def shorten(self, long_url: str) -> str:
        # Idempotency: return existing short URL
        if long_url in self.reverse_map:
            return self.reverse_map[long_url]

        self.counter += 1
        short_code = self._encode(self.counter)
        self.url_map[short_code] = long_url
        self.reverse_map[long_url] = short_code
        return f"https://short.ly/{short_code}"

    def resolve(self, short_code: str) -> str | None:
        return self.url_map.get(short_code)`,
      transcript: null,
      problemStatement: null,
    },
  },
  {
    session: {
      id: 'session-02',
      problemName: 'Rate Limiter Architecture',
      createdAt: '2026-02-11T09:40:00.000Z',
      totalTimeMinutes: 18,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(3, 2, 3),
      scoreTechnical: 3,
      scoreComm: 2,
      scorePs: 3,
      pass: false,
      feedbackOverall: 'Basic sliding window approach was correct, but scaling tradeoffs remained underdeveloped.',
      feedbackComm: 'Reasoning was understandable, though pacing was uneven in the second half.',
      feedbackPs: 'Could improve by explicitly comparing token bucket vs leaky bucket under bursty traffic.',
      overallTakeaway: 'Solid baseline solution with room to deepen systems tradeoff analysis.',
    },
    problemDetails: {
      code: 'class RateLimiter:\n    pass',
    },
  },
  {
    session: {
      id: 'session-03',
      problemName: 'Message Queue Tradeoffs',
      createdAt: '2026-02-09T15:05:00.000Z',
      totalTimeMinutes: 25,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(3, 3, 4),
      scoreTechnical: 3,
      scoreComm: 3,
      scorePs: 4,
      pass: true,
      feedbackOverall: 'Strong discussion of at-least-once delivery and ordering constraints.',
      feedbackComm: 'Clear structure and smooth transitions between requirements and design choices.',
      feedbackPs: 'Good failure-mode coverage; add more depth on consumer lag recovery.',
      overallTakeaway: 'Strong systems reasoning with balanced communication and tradeoff framing.',
    },
    problemDetails: {
      code: '# Queue design notes',
    },
  },
  {
    session: {
      id: 'session-04',
      problemName: 'Database Indexing Strategy',
      createdAt: '2026-02-07T13:00:00.000Z',
      totalTimeMinutes: 15,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(2, 2, 3),
      scoreTechnical: 2,
      scoreComm: 2,
      scorePs: 3,
      pass: false,
      feedbackOverall: 'Identified indexing options but lacked selectivity and cost model discussion.',
      feedbackComm: 'Answers were brief; expand on why each index strategy fits the workload.',
      feedbackPs: 'Need stronger quantitative reasoning around read/write amplification.',
      overallTakeaway: 'Good start; emphasize workload characteristics and measurable tradeoffs.',
    },
    problemDetails: {
      code: '-- Index strategy draft',
    },
  },
  {
    session: {
      id: 'session-05',
      problemName: 'Load Balancer Design',
      createdAt: '2026-02-04T11:10:00.000Z',
      totalTimeMinutes: 30,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(4, 3, 3),
      scoreTechnical: 4,
      scoreComm: 3,
      scorePs: 3,
      pass: true,
      feedbackOverall: 'Strong balancing algorithm selection and health-check strategy.',
      feedbackComm: 'Good narrative flow and concise articulation of assumptions.',
      feedbackPs: 'Add deeper discussion of failover blast radius and zonal routing.',
      overallTakeaway: 'High-quality design and communication with minor depth improvements possible.',
    },
    problemDetails: {
      code: '# LB architecture pseudocode',
    },
  },
  {
    session: {
      id: 'session-06',
      problemName: 'Caching Layer Design',
      createdAt: '2026-02-02T16:22:00.000Z',
      totalTimeMinutes: 20,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(3, 3, 2),
      scoreTechnical: 3,
      scoreComm: 3,
      scorePs: 2,
      pass: true,
      feedbackOverall: 'Correctly covered cache-aside and invalidation basics.',
      feedbackComm: 'Communication was mostly clear; transitions could be crisper.',
      feedbackPs: 'Discuss stale reads and stampede mitigation in more detail.',
      overallTakeaway: 'Competent solution with clear next steps for deeper robustness analysis.',
    },
    problemDetails: {
      code: '# Caching strategy notes',
    },
  },
  {
    session: {
      id: 'session-07',
      problemName: 'API Gateway Patterns',
      createdAt: '2026-01-31T17:30:00.000Z',
      totalTimeMinutes: 28,
      problemUrl: null,
    },
    score: {
      scoreOverall: toOverallScore(3, 3, 3),
      scoreTechnical: 3,
      scoreComm: 3,
      scorePs: 3,
      pass: true,
      feedbackOverall: 'Solid understanding of auth, routing, and rate limiting responsibilities.',
      feedbackComm: 'Explanations were clear and appropriately scoped.',
      feedbackPs: 'Could add more detail on observability and policy rollout controls.',
      overallTakeaway: 'Strong baseline architecture discussion with a few advanced topics to sharpen.',
    },
    problemDetails: {
      code: '# Gateway design outline',
    },
  },
]

export const sessionDetailsById: Record<string, SessionDetailData> = Object.fromEntries(
  sessionDetails.map((detail) => [detail.session.id, detail])
)

export const sessionListItems: SessionListItem[] = sessionDetails.map((detail) => ({
  id: detail.session.id,
  problemName: detail.session.problemName,
  createdAt: detail.session.createdAt,
  totalTimeMinutes: detail.session.totalTimeMinutes,
  scoreOverall: detail.score.scoreOverall,
  problemUrl: detail.session.problemUrl,
}))
