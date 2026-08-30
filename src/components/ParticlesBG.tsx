import {useEffect, useState} from 'react';
import Particles, {initParticlesEngine} from '@tsparticles/react';
import {loadSlim} from '@tsparticles/slim';
import {useReducedMotion} from 'motion/react';

export function ParticlesBG() {
  const [ready, setReady] = useState(false);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (reduceMotion) return;
    let active = true;
    void initParticlesEngine(loadSlim).then(() => {
      if (active) setReady(true);
    });
    return () => {
      active = false;
    };
  }, [reduceMotion]);

  if (!ready || reduceMotion) return null;

  const isConstrained = navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4;

  return (
    <Particles
      id="ambient-particles"
      className="pointer-events-none fixed inset-0"
      options={{
        fullScreen: {enable: false},
        background: {color: {value: 'transparent'}},
        fpsLimit: isConstrained ? 24 : 45,
        interactivity: {events: {resize: {enable: true}}},
        particles: {
          color: {value: '#ffffff'},
          links: {color: '#ffffff', distance: 140, enable: true, opacity: 0.08, width: 1},
          move: {enable: true, speed: 0.35, direction: 'none', outModes: {default: 'out'}},
          number: {density: {enable: true}, value: isConstrained ? 18 : 36},
          opacity: {value: 0.22},
          shape: {type: 'circle'},
          size: {value: {min: 1, max: 2}},
        },
        detectRetina: !isConstrained,
      }}
    />
  );
}
