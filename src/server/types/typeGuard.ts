// typeGuards.ts

import { BLOOD_TYPES, JOB_TYPES } from './constants';
import type { BloodType } from './constants';

export const isBloodType = (value: string): value is BloodType => {
  return BLOOD_TYPES.includes(value as BloodType);
};

export const isJobType = (value: string): boolean => {
  return JOB_TYPES.includes(value);
};
