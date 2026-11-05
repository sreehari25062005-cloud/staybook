export function Stars({ value = 0, count }) {
  const full = Math.round(value);
  return (
    <span className="stars" title={`${value} / 5`}>
      {'★'.repeat(full)}<span className="off">{'★'.repeat(5 - full)}</span>
      {count !== undefined && <span className="muted"> {value ? value : 'New'} ({count})</span>}
    </span>
  );
}

export function StarPicker({ value, onChange }) {
  return (
    <span className="stars picker">
      {[1, 2, 3, 4, 5].map((n) => (
        <button type="button" key={n} className={n <= value ? '' : 'off'} onClick={() => onChange(n)}>★</button>
      ))}
    </span>
  );
}
