// Load Testing Configuration for 1000 Concurrent Users
// This file contains the configuration for testing QuestAI with 1000 users simultaneously

const loadTestConfig = {
  // Test Parameters
  testName: "QuestAI 1000 User Load Test",
  targetUsers: 1000,
  rampUpTime: 300, // 5 minutes to reach 1000 users
  testDuration: 3600, // 1 hour test duration
  questionCount: 100,
  
  // Firebase Configuration
  firebase: {
    projectId: "locus-8b4e8",
    maxConcurrentConnections: 10000, // Firebase can handle this
    batchSize: 500, // Firestore batch operations
    timeout: 30000 // 30 seconds timeout
  },
  
  // Performance Targets
  targets: {
    responseTime: {
      p50: 200, // 50% of requests under 200ms
      p95: 500, // 95% of requests under 500ms
      p99: 1000 // 99% of requests under 1s
    },
    throughput: {
      requestsPerSecond: 500, // Target RPS
      concurrentUsers: 1000
    },
    errorRate: {
      max: 0.01 // Less than 1% error rate
    }
  },
  
  // Test Scenarios
  scenarios: [
    {
      name: "User Registration",
      weight: 10, // 10% of traffic
      steps: [
        "Navigate to login page",
        "Authenticate with Google",
        "Complete user profile"
      ]
    },
    {
      name: "Quiz Taking",
      weight: 70, // 70% of traffic - main scenario
      steps: [
        "Join live quiz",
        "Answer 100 questions",
        "Submit results"
      ]
    },
    {
      name: "Dashboard Access",
      weight: 15, // 15% of traffic
      steps: [
        "Access dashboard",
        "View quiz history",
        "Check results"
      ]
    },
    {
      name: "File Upload",
      weight: 5, // 5% of traffic
      steps: [
        "Upload quiz files",
        "Process PDF/JSON",
        "Create quiz"
      ]
    }
  ],
  
  // Monitoring Points
  monitoring: {
    clientSide: [
      "Page load times",
      "Question rendering time",
      "Answer submission time",
      "Real-time updates latency"
    ],
    serverSide: [
      "Firebase read/write operations",
      "Database connection pool",
      "Memory usage",
      "CPU utilization"
    ],
    infrastructure: [
      "Firebase quotas",
      "Network bandwidth",
      "CDN performance",
      "Error rates"
    ]
  }
};

module.exports = loadTestConfig;
