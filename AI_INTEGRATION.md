# AI Integration Guide for LocalHelp

This document outlines the AI/ML services currently implemented as mock services and how to replace them with real AI models for production.

## Current Mock AI Services

All mock AI services are located in `lib/mock-ai/` and use rule-based logic. They are clearly marked with `// TODO: Replace with real ML model` comments.

### 1. Urgency Detection (`urgency-detector.ts`)

**Purpose:** Automatically classify request urgency based on description and context.

**Current Implementation:**
- Keyword matching for emergency/priority terms
- Time-of-day consideration
- Returns: "normal" | "priority" | "emergency"

**Production Replacement Options:**
- Text classification model (BERT, RoBERTa)
- GPT-4 with prompt engineering
- Custom NLP model trained on historical urgency data

**API Interface:**
```typescript
detectUrgency(
  description: string,
  factors?: { keywords: string[], timeOfDay: number }
): UrgencyLevel
```

### 2. Trust Score Engine (`trust-score.ts`)

**Purpose:** Calculate user trustworthiness score based on multiple factors.

**Current Implementation:**
- Weighted scoring system:
  - Average ratings (0-30 points)
  - Completed transactions (0-20 points)
  - Account age (0-15 points)
  - Verification status (10 points)
  - Report penalties (-5 per report)

**Production Replacement Options:**
- Gradient boosting model (XGBoost, LightGBM)
- Neural network with feature engineering
- Ensemble of multiple trust signals

**API Interface:**
```typescript
calculateTrustScore(factors: {
  ratings: number[]
  completedTransactions: number
  accountAge: number
  verificationStatus: boolean
  reports: number
}): number // 0-100
```

### 3. Fair Pricing Engine (`pricing-engine.ts`)

**Purpose:** Suggest fair pricing for services based on multiple factors.

**Current Implementation:**
- Base rates by service type
- Distance multiplier
- Urgency multiplier (1.5x-2x)
- Time-of-day adjustment
- Rounds to nearest $5

**Production Replacement Options:**
- Regression model trained on historical pricing
- Reinforcement learning for dynamic pricing
- Market-aware pricing with competitor data

**API Interface:**
```typescript
calculateFairPrice(factors: {
  serviceType: string
  urgency: UrgencyLevel
  distance: number
  timeOfDay: number
}): number
```

### 4. Smart Matching Engine (`smart-matching.ts`)

**Purpose:** Match users with the best available items/technicians based on multiple criteria.

**Current Implementation:**
- Scoring algorithm considering:
  - Distance (penalty)
  - Trust score (bonus)
  - Availability (bonus)
  - Rating (bonus)
  - Urgency multiplier
- Simple sorting by score

**Production Replacement Options:**
- Learning-to-rank model
- Collaborative filtering
- Graph neural network for relationship modeling
- Multi-armed bandit for exploration/exploitation

**API Interface:**
```typescript
matchItems(
  userLocation: { lat: number, lng: number },
  items: Item[],
  urgency: string
): Item[]

matchTechnicians(
  userLocation: { lat: number, lng: number },
  technicians: Technician[],
  urgency: string
): Technician[]
```

## Integration Steps for Production

### Step 1: Choose Your AI/ML Stack

**Option A: Cloud AI Services**
- Google Cloud AI Platform
- AWS SageMaker
- Azure Machine Learning
- Vercel AI (for quick LLM integration)

**Option B: Self-Hosted Models**
- TensorFlow/PyTorch models
- ONNX runtime for inference
- Custom API endpoints

### Step 2: Replace Mock Services

For each service:

1. **Keep the Interface:** Don't change function signatures
2. **Add API Calls:** Replace rule-based logic with model inference
3. **Handle Errors:** Implement fallback to rule-based logic
4. **Cache Results:** Add Redis/memory caching for performance

Example:

```typescript
// Before (Mock)
export function detectUrgency(description: string): UrgencyLevel {
  if (description.includes("emergency")) return "emergency"
  return "normal"
}

// After (Production with Vercel AI)
import { generateText } from "ai"

export async function detectUrgency(description: string): Promise<UrgencyLevel> {
  try {
    const { text } = await generateText({
      model: "openai/gpt-4-mini",
      prompt: `Classify this request urgency: "${description}"\nRespond with only: normal, priority, or emergency`,
    })
    return text.trim().toLowerCase() as UrgencyLevel
  } catch (error) {
    // Fallback to rule-based
    if (description.includes("emergency")) return "emergency"
    return "normal"
  }
}
```

### Step 3: Add Environment Variables

```bash
# .env.local
OPENAI_API_KEY=your_key_here
# or
GOOGLE_AI_API_KEY=your_key_here
# or custom ML endpoint
ML_API_ENDPOINT=https://your-ml-api.com
```

### Step 4: Testing & Monitoring

- A/B test new AI vs mock logic
- Monitor latency and accuracy
- Set up alerts for model failures
- Track prediction confidence scores

## Google Maps Integration

The app includes placeholders for Google Maps. To integrate:

1. Get API key from Google Cloud Console
2. Enable Maps JavaScript API and Geocoding API
3. Add to environment:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key
```

4. Replace map placeholders in:
   - `/emergency/status/page.tsx`
   - Map components for distance calculations

## Google Charts Integration

For admin analytics, integrate Google Charts:

```typescript
import { Chart } from "react-google-charts"

<Chart
  chartType="LineChart"
  data={[
    ["Time", "Requests"],
    ["Mon", 12],
    ["Tue", 18],
    ...
  ]}
  options={{ title: "Request Trends" }}
/>
```

## Data Collection for Model Training

To build production models, collect:

1. **Urgency Detection:**
   - User-labeled urgency levels
   - Response times
   - Actual outcomes

2. **Trust Scores:**
   - Transaction completions
   - User ratings
   - Report history
   - Time-based behavior patterns

3. **Pricing:**
   - Accepted vs rejected prices
   - Service completion rates
   - User satisfaction scores

4. **Matching:**
   - User selections
   - Service completion success
   - User ratings post-service

Store this data in Firebase Firestore with proper privacy controls and use it to periodically retrain models.

## Security Considerations

- Never expose model endpoints publicly
- Implement rate limiting on AI calls
- Validate all inputs before sending to AI
- Don't send PII to third-party AI services
- Use server-side API calls, not client-side

## Cost Optimization

- Cache frequent predictions
- Use smaller models for simpler tasks
- Batch predictions when possible
- Monitor token usage for LLM calls
- Consider edge deployment for low-latency needs
