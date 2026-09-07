import { useState, useMemo } from 'react';
import Select from './select';
const Filter = ({ filter, onFilterChange, players }) => {

    const [localFilter, setLocalFilter] = useState({ track: '', class: '', car: '' });
    const handleChange = (e) => {
        const { name, value } = e.target;
        setLocalFilter(prev => ({ ...prev, [name]: value }));
    }
    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Filter submitted:', localFilter);
        onFilterChange(localFilter);
    }

   const uniqueTracks = useMemo(() => [...new Set(players.map(p => p.track).filter(Boolean))], [players]);
   const uniqueClasses = useMemo(() => [...new Set(players.map(p => p.class).filter(Boolean))], [players]);
   const uniqueCars = useMemo(() => [...new Set(players.map(p => p.car).filter(Boolean))], [players]);


    return (
        <div className="filter">
            <form onSubmit={handleSubmit}>

                <Select id="track" name="track" label="Track" value={localFilter.track} onChange={handleChange} options={uniqueTracks} />

                <Select id="class" name="class" label="Class" value={localFilter.class} onChange={handleChange} options={uniqueClasses} />

                <Select id="car" name="car" label="Car" value={localFilter.car} onChange={handleChange} options={uniqueCars} />

                <button type="submit">Filter</button>
            </form>
        </div>
    )
}
export default Filter;