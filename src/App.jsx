import './App.css';
import { useState, useEffect } from 'react';
import { supabase } from './services/supabaseClient.js';

import Leaderboard from './components/leaderboard.jsx';
import Filter from './components/filter.jsx';
import Footer from './components/footer.jsx';

const timeToMs = (time) => {
  if (!time) return;
  
  const parts = time.split(':');

  const minutes = Number(parts[0]) || 0;
  const seconds = Number(parts[1]) || 0;
  const miliseconds = Number(parts[2]) || 0;
  
  return (minutes * 60 + seconds) * 1000 + miliseconds;
    }

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
              const isExactSameSession = 
                player.name === payload.new.name && 
                player.track === payload.new.track && 
                player.car === payload.new.car;


              if (isExactSameSession) {
                  const oldTime=  timeToMs(player.avg_five);
                  const newTime= timeToMs(payload.new.avg_five);

                  if (newTime < oldTime) {
                    console.log(`Improved lap time for ${player.name}: ${oldTime}ms -> ${newTime}ms`);
                    return payload.new;
                  } else {
                    console.log(`Lap time for ${player.name} did not improve: ${oldTime}ms -> ${newTime}ms`);
                    return player; // Keep the old record if the new time is not better
                  }
                }
                return player;
            });
          }
          if (payload.eventType === 'DELETE') {
              return prevPlayers.filter((player) => {
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
    return timeToMs(a.avg_five) - timeToMs(b.avg_five);
  });



  return (
    <div className="body">
      <div className="App">
        <div>
          <h1>LMU Leaderboard</h1>
          <p>This was made for Yoji CREW!</p>
        </div>
        <Filter filter={filter} onFilterChange={handleFilterChange} players={players} />
        <Leaderboard filteredPlayers={sortedPlayers} />
      </div>
      <Footer />
    </div>

  );
}

export default App;