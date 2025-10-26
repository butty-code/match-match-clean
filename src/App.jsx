import './App.css';
import { useState } from 'react';
import { BookOpenCheck, RefreshCcw, Lightbulb, HelpCircle, X } from 'lucide-react';

export default function App() {
  const [cycle, setCycle] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [smartMode, setSmartMode] = useState(false);
  const [adaptiveMode, setAdaptiveMode] = useState(true);
  const [question, setQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [feedback, setFeedback] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('aiKey') || '');
  const [showHint, setShowHint] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const saveKey = () => {
    localStorage.setItem('aiKey', apiKey);
    setFeedback('✅ API key saved.');
  };

  const fetchQuestion = async () => {
    if (!apiKey) return setFeedback('❌ Please enter your API key.');
    if (!cycle) return setFeedback('❌ Please select a cycle.');
    if (!topic) return setFeedback('❌ Please select a topic.');
    if (smartMode && !difficulty) return setFeedback('❌ Please select a difficulty.');

    const prompt = `
Generate a ${smartMode ? difficulty : 'medium'} math question for Irish students in the ${cycle} cycle.
Topic: ${topic}
Return JSON with:
{
  "q": "question text",
  "correct": "correct answer",
  "explain": "step-by-step explanation"
}
`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const content = JSON.parse(data.choices[0].message.content);
      setQuestion(content);
      setStudentAnswer('');
      setFeedback('');
      setShowHint(false);
    } catch (err) {
      console.error('Fetch error:', err);
      setFeedback('❌ Error fetching question. Check your API key or quota.');
    }
  };

  const fetchFollowUp = async (level) => {
    const prompt = `
Generate a ${level} follow-up math question for Irish students in the ${cycle} cycle.
Topic: ${topic}
Return JSON with:
{
  "q": "question text",
  "correct": "correct answer",
  "explain": "step-by-step explanation"
}
`;

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: prompt }],
        }),
      });

      const data = await res.json();
      const content = JSON.parse(data.choices[0].message.content);
      setQuestion(content);
      setStudentAnswer('');
      setShowHint(false);
    } catch (err) {
      console.error('Follow-up error:', err);
      setFeedback('❌ Error fetching follow-up question.');
    }
  };

  const normalize = (str) => str.trim().replace(/^x\s*=\s*/, '');

  return (
    <div className="app-container">
      <div className="card">
        <header className="header">
          <h1>📘 Interactive Math Coach</h1>
          <p>Built in Kilkenny • Designed for Irish students</p>
        </header>

        <div className="form-group">
          <label>Enter your AI API key</label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Paste your OpenAI key"
          />
          <div className="button-row">
            <button className="btn blue" onClick={saveKey}>Save Key</button>
            <button className="btn purple" onClick={() => setShowHelp(true)}>
              <HelpCircle size={18} /> Help
            </button>
          </div>
        </div>

        <div className="form-group">
          <div className="button-row">
            <button className={`btn ${smartMode ? 'green' : 'gray'}`} onClick={() => setSmartMode(!smartMode)}>
              {smartMode ? '🧠 Smart Mode ON' : 'Smart Mode OFF'}
            </button>
            <button className={`btn ${adaptiveMode ? 'green' : 'gray'}`} onClick={() => setAdaptiveMode(!adaptiveMode)}>
              {adaptiveMode ? '🧠 Adaptive ON' : 'Adaptive OFF'}
            </button>
          </div>
        </div>

        <div className="selectors">
          <div className="form-group">
            <select value={cycle} onChange={(e) => setCycle(e.target.value)}>
              <option value="">Select Cycle</option>
              <option value="junior">Junior Cycle</option>
              <option value="senior">Leaving Cert</option>
            </select>
          </div>

          <div className="form-group">
            <select value={topic} onChange={(e) => setTopic(e.target.value)} disabled={!cycle}>
              <option value="">Select Topic</option>
              <option value="algebra">Algebra</option>
              <option value="geometry">Geometry</option>
              <option value="trigonometry">Trigonometry</option>
              <option value="functions">Functions</option>
              <option value="probability">Probability</option>
            </select>
          </div>

          {smartMode && (
            <div className="form-group">
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} disabled={!topic}>
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="exam">Exam-style</option>
              </select>
            </div>
          )}
        </div>

        {question && (
          <div className="question-block">
            <p><strong>Question:</strong> {question.q}</p>
          </div>
        )}

        <div className="form-group">
          <input
            type="text"
            value={studentAnswer}
            onChange={(e) => setStudentAnswer(e.target.value)}
            placeholder="Type your answer here..."
          />
        </div>

        <div className="button-row">
          <button className="btn green" onClick={() => {
            if (!question) return;
            if (normalize(studentAnswer) === normalize(question.correct)) {
              setFeedback("✅ Correct! Well done.");
              if (adaptiveMode) fetchFollowUp('harder');
            } else {
              setFeedback(`❌ Not quite. Correct answer: ${question.correct}`);
              if (adaptiveMode) fetchFollowUp('easier');
            }
          }}>
            <BookOpenCheck size={18} /> Submit
          </button>

          <button className="btn blue" onClick={fetchQuestion}>
            <RefreshCcw size={18} /> Next Question
          </button>

          <button className="btn yellow" onClick={() => {
            if (!question) return;
            setShowHint(!showHint);
          }}>
            <Lightbulb size={18} /> Explain
          </button>
        </div>

        {showHint && question?.explain && (
          <div className="hint-box">
            <strong>Hint:</strong>
            <p>{question.explain}</p>
          </div>
        )}

        {feedback && (
          <div className="feedback-block">
            <pre>{feedback}</pre>
          </div>
        )}

        <footer className="footer">
          Free for students, teachers, and schools • Powered by AI • Built in Kilkenny
        </footer>
      </div>

      {showHelp && (
        <div className="help-modal">
          <div className="help-content">
            <div className="help-header">
              <h3>🆘 How to Use This App</h3>
              <button className="close-btn" onClick={() => setShowHelp(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="help-body">
              <p><strong>1.</strong> Paste your API key and click <strong>Save Key</strong></p>
              <p><strong>2.</strong> Choose your cycle and topic</p>
              <p><strong>3.</strong> Toggle <strong>Smart Mode</strong> to enable difficulty control</p>
              <p><strong>4.</strong> Toggle <strong>Adaptive Mode</strong> to enable follow-up questions</p>
              <p><strong>5.</strong> Click <strong>Next Question</strong> to begin</p>
              <p><strong>6.</strong> Type your answer and click <strong>Submit</strong></p>
              <p><strong>7.</strong> Click <strong>Explain</strong> for a step-by-step hint</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}