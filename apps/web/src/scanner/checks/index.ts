import type { Check } from '@repo/shared/types';
import { dependenciesCheck } from './dependencies';
import { secretsCheck } from './secrets';
import { securityCheck } from './security';

export const allChecks: Check[] = [secretsCheck, securityCheck, dependenciesCheck];
