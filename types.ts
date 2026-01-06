
export enum WaveType {
  TRANSVERSE = 'transverse',
  LONGITUDINAL = 'longitudinal'
}

export interface SimulationState {
  isPlaying: boolean;
  amplitude: number;
  frequency: number; // Hz
  wavelength: number; // pixels/units
  speed: number; // velocity
  time: number;
}
