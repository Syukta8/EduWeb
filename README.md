# 🎮 Year 6 DLP Science & Math Arcade

An interactive, retro-arcade educational web app designed for Malaysian primary students (**Year 6 Dual Language Programme / DLP**). Practice Science (*Sains*) and Mathematics (*Matematik*) through fun, fast-paced quizzes with sounds, combos, and leaderboards!

🌐 **Live Website**: [https://iwanzatilovejourney.web.app](https://iwanzatilovejourney.web.app)

---

## 🌟 What's Inside?

### 🔬 Sains DLP (13 Full Units — KSSR Semakan)
- **Unit 1**: Scientific Skills
- **Unit 2**: Humans (Reproduction & Nervous System)
- **Unit 3**: Microorganisms
- **Unit 4**: Interaction Among Living Things
- **Unit 5**: Preservation & Conservation
- **Unit 6**: Force & Motion
- **Unit 7**: Speed
- **Unit 8**: Food Preservation Technology
- **Unit 9**: Waste Management
- **Unit 10**: Eclipses (Solar & Lunar)
- **Unit 11**: Galaxy (Milky Way & Space)
- **Unit 12**: Stability & Strength of Structures
- **Unit 13**: Technology & Sustainable Living

### 🧮 Matematik DLP (7 Full Units)
- **Unit 1**: Whole Numbers & Basic Operations
- **Unit 2**: Fractions, Decimals & Percentages
- **Unit 3**: Money & Financial Literacy
- **Unit 4**: Time & World Time Zones
- **Unit 5**: Measurement & Geometry (Area & Volume)
- **Unit 6**: Coordinates, Ratio & Proportion
- **Unit 7**: Data Handling & Probability

---

## 🎯 Cool Features

- **4 Question Formats**:
  1. Multiple Choice (MCQ with randomized choices)
  2. True or False
  3. Numeric keypad / type-in answer
  4. Tap-to-match definitions & terms (works on phones and tablets)
- **Arcade Scoring & Combos**: Earn bonus points for fast answers and correct answer streaks!
- **Sound Effects**: Retro 8-bit arcade sounds for correct answers, mistakes, and combos.
- **Custom Quiz Maker**: Choose your favorite units, select practice or test mode, and pick how many questions to play.
- **Works on Mobile & Desktop**: Designed to fit nicely on smartphones, tablets, laptops, and smart TVs.
- **High Scores & Leaderboard**: Saves your best scores locally on your device.

---

## 🚀 How to Run Locally (On Your Computer)

You do **not** need complex database setup to run this app. Everything runs directly in the web browser!

### Option 1: The Easiest Way (Double-Click)
1. Download or clone this project folder to your computer.
2. Open the `public/` folder.
3. Double-click **`index.html`** to open it in Chrome, Edge, Safari, or Firefox. That's it!

### Option 2: Using a Local Server (Recommended for Testing)
If you have [Node.js](https://nodejs.org) installed on your computer:

```bash
# 1. Open your terminal in this project folder
cd EduWeb

# 2. Run a simple lightweight web server
npx serve public
```

Open the address shown in your terminal (usually `http://localhost:3000`).

---

## ☁️ How to Publish Live to Firebase Hosting

This project is ready to be published for free using **Firebase Hosting**.

### Step 1: Install Firebase CLI & Log In
Open your terminal and log in to your Google/Firebase account:
```bash
npx firebase login
```

### Step 2: Test & Deploy
Deploy the website with one simple command:
```bash
npx firebase deploy --only hosting
```

Once finished, your live website link will be displayed (for example: `https://your-project.web.app`).

---

## 📁 Project Folder Structure

Here is where the important files live:

```text
EduWeb/
├── public/                     # All website files (what users see)
│   ├── index.html              # The main homepage & quiz screen
│   ├── css/
│   │   └── style.css           # Retro arcade visual design & mobile styles
│   ├── js/
│   │   ├── app.js              # Controls page views, modal popups, and buttons
│   │   ├── data_service.js     # Loads questions, shuffles options & balances quiz
│   │   ├── quiz_engine.js      # Handles timer, scoring, keypad & tap matching
│   │   ├── scoring_client.js   # Calculates combo multipliers & badges
│   │   └── audio.js            # 8-bit arcade sound effects generator
│   └── data/
│       ├── sains_questions.json # Science question bank (130 questions)
│       └── math_questions.json  # Math question bank (70 questions)
│
├── firebase.json               # Firebase Hosting configuration
├── .firebaserc                 # Firebase project target configuration
└── README.md                   # This instruction guide
```

---

## 💡 Adding or Editing Questions

Want to add your own questions?
1. Open [`public/data/sains_questions.json`](public/data/sains_questions.json) or [`public/data/math_questions.json`](public/data/math_questions.json) in any text editor (like Notepad or VS Code).
2. Follow the simple format inside to add new questions or edit existing explanations.
3. Save the file and re-deploy using `npx firebase deploy --only hosting`!

---

## 📄 License & Credits
Built for Year 6 DLP students, teachers, and parents in Malaysia. Happy learning! 🚀
