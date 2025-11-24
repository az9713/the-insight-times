import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Loading from './components/Loading';
import ArticleView from './components/ArticleView';
import { generateNewsArticle, generateNewsImage, checkApiKey, openApiKeySelection } from './services/geminiService';
import { ArticleData, AppState } from './types';

const App: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState<boolean>(false);

  const verifyKey = useCallback(async () => {
    const has = await checkApiKey();
    setHasKey(has);
    if (!has) {
      setAppState(AppState.API_KEY_SELECT);
    } else {
      if (appState === AppState.API_KEY_SELECT) {
        setAppState(AppState.IDLE);
      }
    }
  }, [appState]);

  useEffect(() => {
    verifyKey();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleConnect = async () => {
    try {
      await openApiKeySelection();
      // Assume success per guidelines and verify immediately
      await verifyKey();
    } catch (e) {
      console.error("Failed to select key", e);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    if (!hasKey) {
      setAppState(AppState.API_KEY_SELECT);
      return;
    }

    setAppState(AppState.SEARCHING);
    setError(null);

    try {
      // 1. Generate Text
      const articleData = await generateNewsArticle(topic);
      setArticle(articleData);

      // 2. Generate Image
      setAppState(AppState.GENERATING_IMAGE);
      const img = await generateNewsImage(articleData.imagePrompt);
      setImageUrl(img);

      setAppState(AppState.DISPLAY);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected error occurred while gathering the news.");
      setAppState(AppState.ERROR);
    }
  };

  const reset = () => {
    setTopic('');
    setArticle(null);
    setImageUrl(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#fdfdfd] border-t-4 border-black">
      <div className="container mx-auto px-4 py-6">
        <Header />

        {/* Main Content Area */}
        <main className="min-h-[60vh] flex flex-col">
          
          {/* API Key Selection Screen */}
          {appState === AppState.API_KEY_SELECT && (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 max-w-2xl mx-auto">
              <h2 className="font-headline text-3xl mb-4">Access Required</h2>
              <p className="font-body text-gray-600 mb-8">
                To access the archive and generate high-quality imagery with Nano Banana Pro, verified press credentials (API Key) are required.
              </p>
              <button
                onClick={handleConnect}
                className="bg-black text-white font-sans-ui uppercase tracking-widest px-8 py-3 text-sm font-bold hover:bg-gray-800 transition-all border border-black"
              >
                Verify Credentials
              </button>
              <a 
                href="https://ai.google.dev/gemini-api/docs/billing" 
                target="_blank" 
                rel="noreferrer"
                className="mt-4 text-xs text-gray-400 hover:underline font-sans-ui"
              >
                Subscription information
              </a>
            </div>
          )}

          {/* Landing / Search */}
          {(appState === AppState.IDLE || appState === AppState.ERROR) && hasKey && (
            <div className="flex-1 flex flex-col items-center pt-10">
              <div className="w-full max-w-3xl text-center mb-12">
                <h2 className="font-headline text-3xl md:text-5xl mb-6 font-bold text-gray-900">
                  What is the world talking about today?
                </h2>
                <p className="font-body text-lg text-gray-600 mb-8">
                  Enter a topic below to dispatch our AI journalists. We investigate the last 12 months of data to bring you the truth.
                </p>
                
                <form onSubmit={handleSearch} className="relative w-full">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="Enter a topic (e.g., 'SpaceX Starship', 'Artificial Intelligence Policy')..."
                    className="w-full p-6 text-xl md:text-2xl font-serif border-2 border-gray-300 focus:border-black outline-none transition-colors placeholder:text-gray-300 text-center bg-transparent"
                  />
                  <button
                    type="submit"
                    disabled={!topic.trim()}
                    className="mt-8 bg-black text-white font-sans-ui font-bold uppercase tracking-[0.2em] py-4 px-10 text-sm hover:bg-gray-800 disabled:opacity-50 transition-all"
                  >
                    Investigate
                  </button>
                </form>

                {error && (
                  <div className="mt-8 p-4 border border-red-200 bg-red-50 text-red-800 font-sans-ui text-sm">
                    <span className="font-bold">ERR:</span> {error}
                  </div>
                )}
              </div>
              
              {/* Faux Front Page Content to make it look populated */}
              <div className="w-full border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-8 opacity-30 pointer-events-none select-none">
                <div className="space-y-2">
                   <div className="h-4 bg-gray-200 w-3/4"></div>
                   <div className="h-32 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-5/6"></div>
                </div>
                <div className="space-y-2 border-x border-gray-200 px-4">
                   <div className="h-6 bg-gray-200 w-full mb-4"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-4/5"></div>
                </div>
                <div className="space-y-2">
                   <div className="h-4 bg-gray-200 w-1/2"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                   <div className="h-3 bg-gray-200 w-full"></div>
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {(appState === AppState.SEARCHING || appState === AppState.GENERATING_IMAGE) && (
            <Loading status={appState === AppState.SEARCHING ? "Conducting Research & Analysis..." : "Developing Photography..."} />
          )}

          {/* Display Article */}
          {appState === AppState.DISPLAY && article && (
            <ArticleView 
              article={article} 
              imageUrl={imageUrl} 
              onBack={reset} 
            />
          )}

        </main>

        <footer className="border-t border-gray-300 mt-20 py-8 text-center font-sans-ui text-xs text-gray-500 uppercase tracking-wider">
          &copy; {new Date().getFullYear()} The Insight Times. AI-Generated Content. Verify independently.
        </footer>
      </div>
    </div>
  );
};

export default App;