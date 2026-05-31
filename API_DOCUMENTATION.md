# 📡 API Documentation

## JSON Server (Mock Backend)
**Base URL:** `http://localhost:3000`

---

### Users

#### Register User
- **Method:** POST
- **URL:** `/users`
- **Body:**
```json
{
  "name": "Ayush",
  "email": "ayush@example.com",
  "password": "123456"
}
```
- **Response:**
```json
{
  "id": 1,
  "name": "Ayush",
  "email": "ayush@example.com",
  "password": "123456"
}
```

#### Login User
- **Method:** GET
- **URL:** `/users?email=ayush@example.com&password=123456`
- **Response:** Array of matching users

---

### Quizzes

#### Get All Quizzes
- **Method:** GET
- **URL:** `/quizzes`
- **Response:**
```json
[
  { "id": 1, "title": "JavaScript Basics", "questions": 10, "time": 10 },
  { "id": 2, "title": "React Fundamentals", "questions": 10, "time": 10 }
]
```

---

### Results

#### Save Result
- **Method:** POST
- **URL:** `/results`
- **Body:**
```json
{
  "userId": "1",
  "quizId": 1,
  "quizTitle": "JavaScript Basics",
  "score": 8,
  "total": 10,
  "percentage": 80,
  "correctAnswers": 8,
  "wrongAnswers": 2,
  "passed": true,
  "timeTaken": 320,
  "date": "2026-05-31T10:00:00.000Z"
}
```

#### Get User Results
- **Method:** GET
- **URL:** `/results?userId=1`
- **Response:** Array of results for that user

---

## Gemini AI API
**Base URL:** `https://generativelanguage.googleapis.com/v1beta`

#### Generate AI Report
- **Method:** POST
- **URL:** `/models/gemini-2.0-flash:generateContent?key=API_KEY`
- **Body:**
```json
{
  "contents": [{ "parts": [{ "text": "your prompt here" }] }],
  "generationConfig": { "temperature": 0.7, "maxOutputTokens": 1200 }
}
```
- **Response:** AI-generated JSON with strengths, weaknesses, roadmap, skill level
- **Free Tier Limit:** 15 requests/minute
- **Get API Key:** https://aistudio.google.com/app/apikey