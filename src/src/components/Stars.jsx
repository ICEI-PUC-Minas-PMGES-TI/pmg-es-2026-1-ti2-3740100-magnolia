export default function Stars({ n = 5, size = 14 }) {
  return (
    <span style={{ fontSize: size, lineHeight: 1, letterSpacing: 1 }}>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < n ? '#f5a623' : '#ddd' }}>★</span>
      ))}
    </span>
  );
}