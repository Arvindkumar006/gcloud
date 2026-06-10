// Hackathon configuration for deterministic presentation mode
export const DEMO_CONFIG = {
  DEMO_MODE: process.env.NEXT_PUBLIC_DEMO_MODE === "true" || false,
  TRIGGER_DISCOVERY_FAILURE: process.env.NEXT_PUBLIC_DEMO_FAIL_DISCOVERY === "true" || false,
  TRIGGER_RESEARCH_FAILURE: process.env.NEXT_PUBLIC_DEMO_FAIL_RESEARCH === "true" || false,
};
