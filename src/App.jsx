import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient.js';

import Leaderboard from './components/leaderboard.jsx';
import Filter from './components/filter.jsx';

const App =() => {
const [filter,setFilter] = useState({track: '', class: '', car: ''});
const [players, setPlayers] = useState([]);

useEffect(() => {
  // 1. Fetch the initial data
  const fetchPlayers = async () => {
    console.log("Łączę się z bazą...");
    const { data, error } = await supabase
      .from('leaderboard')
      .select('*');
      
    if (!error && data) {
      console.log('Fetched players:', data);
      setPlayers(data);
    } else {
      console.error('Error fetching players:', error);
    }
  };

  fetchPlayers();

  // 2. Set up the Realtime subscription
  const subscription = supabase
    .channel('leaderboard_changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listens to INSERT, UPDATE, and DELETE
        schema: 'public',
        table: 'leaderboard'
      },
      (payload) => {
        console.log('Realtime change received!', payload);

        setPlayers((prevPlayers) => {
          // Handle new lap time records
          if (payload.eventType === 'INSERT') {
            return [...prevPlayers, payload.new];
          } 
          
          // Handle improved lap times (upserts trigger UPDATE events)
          if (payload.eventType === 'UPDATE') {
            return prevPlayers.map((player) => {
              // Jeśli używasz kolumny ID (najbezpieczniej):
              if (player.id && payload.new.id) {
                return player.id === payload.new.id ? payload.new : player;
              }
              
              // Jeśli nie masz ID, sprawdzamy trójkę: Kierowca + Tor + Auto
              const isExactSameSession = 
                player.name === payload.new.name && 
                player.track === payload.new.track && 
                player.car === payload.new.car;

              return isExactSameSession ? payload.new : player;
            });
          }
          if (payload.eventType === 'DELETE') {
              return prevPlayers.filter((player) => {
                // Przy usuwaniu używamy payload.old i odrzucamy z tablicy ten konkretny wpis
                const isExactSameRecord = 
                  player.name === payload.old.name && 
                  player.track === payload.old.track && 
                  player.car === payload.old.car;
                  
                return !isExactSameRecord;
              });
            }

            return prevPlayers;
        });
      }
    )
    .subscribe();

  // 3. Cleanup the subscription when the component unmounts
  return () => {
    supabase.removeChannel(subscription);
  };
}, []);

  const handleFilterChange = (newFilter) => {
    console.log('Filter changed:', newFilter);

    setFilter(prevFilter => ({
      ...prevFilter,
      ...newFilter
    }));
  }


 const filteredPlayers = players.filter(player => {
    console.log('Filtering player:', player, 'with filter:', filter);

    return (
      (filter.track ? player.track === filter.track : true) &&
      (filter.car ? player.car === filter.car : true) &&
      (filter.class ? player.class === filter.class : true)
        );
    });
  const sortedPlayers = [...filteredPlayers].sort((a, b) => {

    const timeToMs = (time) => {
      const [minutes, seconds, miliseconds] = time.split(':').map(Number);
      return (minutes * 60 + seconds) * 1000 + miliseconds;
    }
    return timeToMs(a.avg_five) - timeToMs(b.avg_five);
  });


  return (
    <div className="App">
      <div>
        <h1>LMU Leaderboard</h1>
        <p>This was made for Yoji CREW!</p>
      </div>
      <Filter filter={filter} onFilterChange={handleFilterChange} players={players} />
      <Leaderboard filteredPlayers={sortedPlayers} />
    </div>

  );
}

export default App;