import ConfettiExplosion from 'react-confetti-explosion'

export default function CompletionConfetti({ onComplete }) {
  return (
    <div className="confetti-anchor">
      <ConfettiExplosion
        particleCount={90}
        duration={2200}
        force={0.55}
        width={760}
        colors={['#FF7A1A', '#FFB45C', '#2DD4BF', '#E8EDF5']}
        onComplete={onComplete}
      />
    </div>
  )
}
