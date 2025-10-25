import React, { useState } from 'react';
import { RefreshCw, HelpCircle, CheckCircle2, XCircle } from 'lucide-react';

const topics = ['Algebra', 'Trigonometry', 'Geometry', 'Functions', 'Probability'];

const generateQuestion = (level, topic) => {
  const base = level === 'junior' ? 'JC' : 'LC';
  return `${base} ${topic} Question #${Math.floor(Math.random() * 1000)}`;
};

export default function App() {
  const [level, setLevel] = useState('junior');
  const [topic, setTopic] = useState('Algebra');
  const [question, setQuestion] = useState(generateQuestion(level, topic));
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [explanation, setExplanation] = useState('');

  const handleSubmit = () => {
    setSubmitted(true);
    const isCorrect = answer.trim() === '42'; // Placeholder logic
    setCorrect(isCorrect);
    setExplanation(
      isCorrect
        ? 'Correct! This matches the expected value for this type of question.'
        : 'Incorrect. Remember to isolate the variable and apply inverse operations.'
    );
  };

  const handleRefresh = () => {
    setQuestion(generateQuestion(level, topic));
    setAnswer('');
    setSubmitted(false);
    setCorrect(null);
    setExplanation('');
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem', maxWidth: '600px', margin: 'auto' }}>
      <h1 style={{ textAlign: 'center' }}>📘 Interactive Math Coach</h1>

      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <select value={level} onChange={e => setLevel(e.target.value)}>
          <option value="junior">Junior Cycle</option>
          <option value="leaving">Leaving Cert</option>
        </select>

        <select value={topic} onChange={e => setTopic(e.target.value)}>
          {topics.map(t => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ background: '#f0f0f0', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <strong>Question:</strong>
        <p>{question}</p>
      </div>

      <input
        type="text"
        placeholder="Your answer"
        value={answer}
        onChange={e => setAnswer(e.target.value)}
        style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
      />

      <button onClick={handleSubmit} style={{ marginRight: '1rem' }}>
        Submit Answer
      </button>
      <button onClick={handleRefresh}>
        <RefreshCw size={16} style={{ verticalAlign: 'middle' }} /> Try Another
      </button>

      {submitted && (
        <div style={{ marginTop: '1rem' }}>
          {correct ? (
            <p style={{ color: 'green' }}>
              <CheckCircle2 size={16} /> {explanation}
            </p>
          ) : (
            <p style={{ color: 'red' }}>
              <XCircle size={16} /> {explanation}
            </p>
          )}
        </div>
      )}

      <button style={{ marginTop: '1rem', background: '#eee', padding: '0.5rem' }}>
        <HelpCircle size={16} style={{ verticalAlign: 'middle' }} /> Explain This
      </button>
    </div>
  );
}
