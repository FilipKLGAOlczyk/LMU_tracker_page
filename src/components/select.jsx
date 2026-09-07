const Select =({ id, name, label, options, value, onChange }) => {
    return (
        <div>
            <label htmlFor={id}>{label}</label>
            <select id={id} name={name} value={value} onChange={onChange}>
                <option value="">All {label}s</option>
                {options.map(option => (
                    <option key={option} value={option}>{option}</option>
                ))}
            </select>
        </div>
    );
}
export default Select;