import { useState } from 'react';
import { Languages, Sparkles, MessageCircle } from 'lucide-react';
import { MedicalNote } from './UI';

export default function Explanation({ analysis }) {
  const [language, setLanguage] = useState('english');
  return (
    <>
      <section className="analysis-section summary">
        <h3>
          <Sparkles size={17} />A simpler summary
        </h3>
        <p>{analysis.summary}</p>
      </section>
      <div className="tabs" role="group" aria-label="Explanation language">
        <button
          type="button"
          aria-pressed={language === 'english'}
          onClick={() => setLanguage('english')}
        >
          English
        </button>
        <button
          type="button"
          aria-pressed={language === 'romanUrdu'}
          onClick={() => setLanguage('romanUrdu')}
        >
          Roman Urdu
        </button>
      </div>
      <section className="analysis-section">
        <h3>
          <Languages size={17} />
          {language === 'english' ? 'In plain English' : 'Aasaan Roman Urdu mein'}
        </h3>
        <p lang={language === 'english' ? 'en' : 'ur-Latn'}>{analysis[language]}</p>
      </section>
      {analysis.questions?.length > 0 && (
        <section className="analysis-section">
          <h3>
            <MessageCircle size={17} />
            Questions for your clinician
          </h3>
          <ul>
            {analysis.questions.map((question, index) => (
              <li key={index}>{question}</li>
            ))}
          </ul>
        </section>
      )}
      <MedicalNote />
    </>
  );
}
