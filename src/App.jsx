import React, { useState, useRef, useEffect } from 'react';
import { db, auth } from './firebase-config';
import { collection, addDoc, getDocs, deleteDoc, doc, query, where } from 'firebase/firestore';
import { signInWithEmailAndPassword} from 'firebase/auth';
import CreateCardForm from './CreateCardForm';
import Auth from './components/Auth';
import './styles/card.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [cards, setCards] = useState([]);
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  useEffect(() => {
    auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        setIsAuthenticated(true);
        fetchCards(user.uid);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    });
  }, []);

  const fetchCards = async (userId) => {
    try {
      const q = query(collection(db, 'loveLetters'), where('userId', '==', userId));
      const querySnapshot = await getDocs(q);
      const cardsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCards(cardsData);
    } catch (error) {
      console.error('Error fetching cards:', error);
    }
  };

  const handleLogin = async (credentials) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      setUser(userCredential.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed: ' + error.message);
    }
  };

  const addCard = async (newCard) => {
    try {
      const cardWithUser = {
        ...newCard,
        userId: user.uid,
        createdAt: new Date().toISOString()
      };
      const docRef = await addDoc(collection(db, 'loveLetters'), cardWithUser);
      const cardWithId = { ...cardWithUser, id: docRef.id };
      setCards(prev => [...prev, cardWithId]);
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error adding card:', error);
      alert('Failed to add card: ' + error.message);
    }
  };

  const tryUnlock = (id, password) => {
    const card = cards.find((c) => c.id === id);
    if (card && password === card.password) {
      setFlippedCards((prev) => ({ ...prev, [id]: true }));
    } else {
      alert('Incorrect password. Try again!');
    }
  };

  const toggleCardFlip = (id) => {
    setFlippedCards((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const renderCards = () => {
    return cards.map((card) => (
      <Card
        key={card.id}
        card={card}
        isFlipped={flippedCards[card.id]}
        onDelete={() => deleteCard(card.id)}
        onUnlock={(password) => tryUnlock(card.id, password)}
        onToggleFlip={() => toggleCardFlip(card.id)}
      />
    ));
  };

  const MainContent = () => (
    <>
      <NavBar
        isMobileMenuOpen={isMobileMenuOpen}
        onToggleMenu={() => setMobileMenuOpen((prev) => !prev)}
        onToggleCreateForm={() => setShowCreateForm((prev) => !prev)}
        showCreateForm={showCreateForm}
      />
      <HeroSection />
      {showCreateForm && (
        <Modal onClose={() => setShowCreateForm(false)}>
          <CreateCardForm onAddCard={addCard} />
        </Modal>
      )}
      <CardGallery>{renderCards()}</CardGallery>
      <ShowMoreButton />
    </>
  );

  return (
    <>
      {!isAuthenticated ? <Auth onLogin={handleLogin} /> : <MainContent />}
    </>
  );
};

const NavBar = ({ isMobileMenuOpen, onToggleMenu, onToggleCreateForm, showCreateForm }) => (
  <nav className="bg-gradient-to-br from-pink-500 to-pink-500">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="flex h-20 items-center justify-between">
        <div className="flex items-center justify-between">
          <a href="/index.html" className="flex items-center mr-4">
            <span className="text-4xl mr-2 animate-pulse-slow">❤️</span>
            <span className="hidden md:block text-white text-2xl font-bold ml-2">CherishedWords</span>
          </a>
        </div>
        <button className="md:hidden text-white" onClick={onToggleMenu}>
          {isMobileMenuOpen ? '✕' : '☰'}
        </button>
        <div className="hidden md:flex space-x-2">
          <NavLink href="/index.html">Home</NavLink>
          <NavLink href="/cards.html">Browse Cards</NavLink>
          <button onClick={onToggleCreateForm} className="text-white rounded-md px-3 py-2">
            {showCreateForm ? 'Hide Form' : 'Create Card'}
          </button>
        </div>
      </div>
    </div>
    {isMobileMenuOpen && (
      <div className="md:hidden bg-pink-500">
        <NavLink href="/index.html" mobile>Home</NavLink>
        <NavLink href="/cards.html" mobile>Browse Cards</NavLink>
        <button onClick={onToggleCreateForm} className="block w-full text-left text-white py-2 px-4">
          {showCreateForm ? 'Hide Form' : 'Create Card'}
        </button>
      </div>
    )}
  </nav>
);

const NavLink = ({ href, mobile, children }) => (
  <a href={href} className={`${mobile ? 'block py-2 px-4' : 'rounded-md px-3 py-2 text-white'} hover:bg-gray-900`}>
    {children}
  </a>
);

const HeroSection = () => (
  <section className="bg-gradient-to-br from-pink-500 to-pink-500 py-20 mb-4">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white">Celebrate Our Love Story</h1>
      <p className="my-4 text-lg sm:text-xl md:text-2xl text-white">Explore and Create Letters Filled with Beautiful Memories</p>
    </div>
  </section>
);

const Card = ({ card, isFlipped, onDelete, onUnlock, onToggleFlip }) => {
  const passwordRef = useRef();

  const handleUnlock = (e) => {
    e.stopPropagation();
    onUnlock(passwordRef.current.value);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete();
  };

  const handleCardClick = (e) => {
    // Only allow flipping back when the card is already unlocked
    if (isFlipped) {
      onToggleFlip();
    }
  };

  return (
    <div className="perspective-1000 h-96">
      <div 
        className={`card-container ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCardClick}
      >
        <div className="card-front rounded-xl p-5 flex flex-col items-center justify-center"
          style={{ backgroundColor: card.creator === 'girlfriend' ? '#ec4899' : '#0ea5e9' }}>
          <div className="text-xl mb-4 text-white">To: {card.recipient}</div>
          <div className="text-4xl mb-5 animate-pulse-slow">❤️</div>
          <input
            ref={passwordRef}
            type="password"
            className="w-4/5 p-3 rounded-lg text-center bg-white/20 placeholder-white text-white"
            placeholder="Enter password"
            onClick={(e) => e.stopPropagation()}
          />
          <button 
            onClick={handleUnlock} 
            className="mt-3 bg-white/20 px-4 py-2 rounded-lg text-white"
          >
            Unlock Love
          </button>
        </div>
        <div className="card-back rounded-xl p-5 bg-white flex flex-col items-center">
          <div className="p-4 text-center max-h-72" style={{ color: card.creator === 'girlfriend' ? '#ec4899' : '#0ea5e9' }}>
            {card.message}
          </div>
          <div className="absolute bottom-3 text-xs opacity-80" style={{ color: card.creator === 'girlfriend' ? '#f472b6' : '#7dd3fc' }}>
            Click to flip back
          </div>
        </div>
      </div>
    </div>
  );
};



const Modal = ({ children, onClose }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50" onClick={onClose}>
    <div className="relative bg-white p-6 rounded-lg max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
      <button className="absolute top-0 right-2 text-gray-500 text-2xl" onClick={onClose}>
        ×
      </button>
      {children}
    </div>
  </div>
);

const CardGallery = ({ children }) => (
  <section className="bg-pink-50 px-4 py-10">
    <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">{children}</div>
  </section>
);

const ShowMoreButton = () => (
  <section className="m-auto max-w-lg my-10 px-6">
    <button className="block w-full bg-pink-500 text-white text-center py-4 px-6 rounded-xl hover:bg-pink-400">
      Show more
    </button>
  </section>
);

export default App;
