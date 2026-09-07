export default function Walker() {
  return (
    <div className="scrolly-walker" data-walker-state="idle" aria-label="行走角色素材占位">
      <span className="walker-head" /><span className="walker-body" />
      <span className="walker-leg walker-leg-left" /><span className="walker-leg walker-leg-right" />
      <small>行走角色</small>
    </div>
  );
}
