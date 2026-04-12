import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Plus, Trash2, ArrowLeft, RefreshCw, X, Play } from 'lucide-react';

export default function FlashcardsPage() {
  const { user } = useAuth();
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // View states: 'list' | 'practice'
  const [view, setView] = useState('list');
  
  // Practice states
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Create Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newFront, setNewFront] = useState('');
  const [newBack, setNewBack] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Flashcards - Square Away';
    if (user) {
      fetchFlashcards();
    }
  }, [user]);

  const fetchFlashcards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFlashcards(data || []);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async (e) => {
    e.preventDefault();
    if (!newFront.trim() || !newBack.trim()) return;

    setSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{
          user_id: user.id,
          front: newFront.trim(),
          back: newBack.trim(),
          topic: newTopic.trim() || 'General'
        }])
        .select();

      if (error) throw error;
      
      setFlashcards([data[0], ...flashcards]);
      setShowCreateModal(false);
      setNewFront('');
      setNewBack('');
      setNewTopic('');
    } catch (err) {
      console.error("Error creating flashcard:", err);
      alert("Failed to create flashcard. Did you run the SQL script?");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCard = async (id) => {
    // Optimistic UI update
    const prevCards = [...flashcards];
    setFlashcards(flashcards.filter(c => c.id !== id));

    try {
      const { error } = await supabase
        .from('flashcards')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Error deleting flashcard", err);
      setFlashcards(prevCards); // Revert
      alert("Failed to delete.");
    }
  };

  const startPractice = () => {
    if (flashcards.length === 0) return;
    setPracticeIndex(0);
    setIsFlipped(false);
    setView('practice');
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setPracticeIndex((prev) => (prev + 1) % flashcards.length);
    }, 150); // small delay to hide flip
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setPracticeIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length);
    }, 150);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 flex flex-col justify-center items-center pt-20">
        <RefreshCw className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <p className="text-slate-500">Loading flashcards...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 pt-28 pb-12 px-6 relative">
      <div className="max-w-6xl mx-auto z-10 relative">
        
        {/* HEADER */}
        {view === 'list' && (
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-800 tracking-tight">Your Flashcards</h1>
              <p className="text-slate-600 mt-2">Master concepts organically through spaced repetition.</p>
            </div>
            <div className="flex gap-3">
              {flashcards.length > 0 && (
                <button 
                  onClick={startPractice}
                  className="px-6 py-2.5 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-full font-medium transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Practice
                </button>
              )}
              <button 
                onClick={() => setShowCreateModal(true)}
                className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-medium shadow-md shadow-blue-500/20 hover:scale-105 transition-all flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Card
              </button>
            </div>
          </div>
        )}

        {view === 'practice' && (
          <div className="mb-8">
            <button
              onClick={() => setView('list')}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Deck</span>
            </button>
            
            <div className="flex justify-between items-center px-4 mb-2">
               <h2 className="text-xl font-semibold text-slate-700">Practice Mode</h2>
               <span className="text-slate-500 font-medium">{practiceIndex + 1} / {flashcards.length}</span>
            </div>
            
            {/* PROGRESS BAR */}
             <div className="w-full bg-blue-100 rounded-full h-1.5 mb-10">
                <div 
                  className="bg-blue-500 h-1.5 rounded-full transition-all duration-300" 
                  style={{ width: `${((practiceIndex + 1) / flashcards.length) * 100}%` }}
                ></div>
             </div>
          </div>
        )}

        {/* LIST VIEW */}
        {view === 'list' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.length === 0 ? (
              <div className="col-span-full py-20 text-center bg-white/60 backdrop-blur-sm rounded-3xl border border-white/40 shadow-sm">
                <h3 className="text-2xl font-medium text-slate-700 mb-2">It's a little quiet here.</h3>
                <p className="text-slate-500 mb-6">Create your first flashcard to begin studying.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="px-8 py-3 bg-white border border-slate-200 text-slate-700 rounded-full font-medium shadow-sm hover:bg-slate-50 transition-all"
                >
                  Create Card
                </button>
              </div>
            ) : (
              flashcards.map((card) => (
                <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col group relative hover:shadow-md transition-shadow">
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => handleDeleteCard(card.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider rounded-full mb-3">
                      {card.topic}
                    </span>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Front</h4>
                    <p className="text-slate-800 text-lg leading-relaxed">{card.front}</p>
                  </div>
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Back</h4>
                    <p className="text-slate-600 truncate">{card.back}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* PRACTICE VIEW */}
        {view === 'practice' && flashcards.length > 0 && (
          <div className="flex flex-col items-center flex-1">
            
            {/* SCENE FOR 3D CSS */}
            <div 
              className="relative w-full max-w-2xl aspect-[3/2] cursor-pointer group perspective-1000 mb-10"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <div className={`w-full h-full relative preserve-3d transition-transform duration-700 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] ${isFlipped ? 'rotate-y-180' : ''}`}>
                
                {/* FRONT FACE */}
                <div className="absolute inset-0 backface-hidden bg-white rounded-3xl shadow-xl border border-slate-100 p-10 md:p-16 flex flex-col items-center justify-center text-center">
                  <span className="absolute top-6 left-6 inline-block px-3 py-1 bg-blue-50 text-blue-600 text-xs font-semibold uppercase tracking-wider rounded-full">
                      {flashcards[practiceIndex].topic}
                  </span>
                  <p className="text-3xl md:text-5xl font-light text-slate-800 leading-tight">
                    {flashcards[practiceIndex].front}
                  </p>
                  <p className="absolute bottom-6 text-sm font-medium text-slate-400 uppercase tracking-widest animate-pulse">
                    Tap to flip
                  </p>
                </div>

                {/* BACK FACE */}
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-xl p-10 md:p-16 flex flex-col items-center justify-center text-center rotate-y-180">
                  <p className="text-2xl md:text-4xl font-medium text-white leading-relaxed">
                    {flashcards[practiceIndex].back}
                  </p>
                  <p className="absolute bottom-6 text-sm font-medium text-indigo-200 uppercase tracking-widest">
                    Tap to flip back
                  </p>
                </div>
                
              </div>
            </div>

            {/* CONTROLS */}
            <div className="flex gap-4 w-full max-w-2xl justify-between">
              <button 
                onClick={prevCard}
                className="px-6 py-3 bg-white text-slate-700 hover:bg-slate-50 border border-slate-200 rounded-full font-medium transition-colors shadow-sm"
              >
                Previous
              </button>
              <button 
                onClick={nextCard}
                className="px-8 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
              >
                Got It, Next
              </button>
            </div>

          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full transform transition-all border border-slate-100 relative">
            <button 
              onClick={() => setShowCreateModal(false)}
              className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-2xl font-bold text-slate-800 mb-1">New Flashcard</h3>
            <p className="text-slate-500 mb-6">Create a card to add to your study deck.</p>

            <form onSubmit={handleCreateCard}>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Topic (Optional)</label>
                <input 
                  type="text"
                  value={newTopic}
                  onChange={e => setNewTopic(e.target.value)}
                  placeholder="e.g. Physics, History"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  maxLength={50}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Front Side</label>
                <textarea 
                  value={newFront}
                  onChange={e => setNewFront(e.target.value)}
                  placeholder="Term or Question"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 min-h-[100px] resize-y"
                  required
                />
              </div>
              <div className="mb-8">
                <label className="block text-sm font-semibold text-slate-700 mb-2">Back Side</label>
                <textarea 
                  value={newBack}
                  onChange={e => setNewBack(e.target.value)}
                  placeholder="Definition or Answer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 min-h-[100px] resize-y"
                  required
                />
              </div>
              
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-3 text-slate-600 font-medium hover:bg-slate-100 rounded-full transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full hover:shadow-lg transition-all disabled:opacity-50"
                >
                  {submitting ? 'Creating...' : 'Create Card'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tailwind CSS Additions for 3D Cards */}
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

    </div>
  );
}
