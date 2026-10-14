import type { Observation, Playbook, PlaybookAction } from '../types';

export function generatePlaybookForObservation(obs: Observation): Playbook {
  const category = obs.category;
  let patternName = 'Standard Facility Review';
  let suggestedRationale = 'Initial observation assessment and verification playbook.';
  let actions: PlaybookAction[] = [];

  switch (category) {
    case 'plumbing':
      patternName = 'Moisture & Hydro-Leak Recurrence Prevention';
      suggestedRationale = 
        'Water leaks frequently produce secondary slip hazards, structural drywall degradation, or hidden mold buildup if only surface puddles are mopped.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Immediate Hazard Containment',
          description: 'Deploy non-slip signage, place absorbent water socks around perimeter, and dry-vac standing liquid.',
          phase: 'immediate_safety',
          recommendedRole: 'Custodial & Facility Safety Team',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Overhead & Riser Borescope Inspection',
          description: 'Inspect ceiling cavity above the affected zone using a flashlight/borescope to isolate upstream pipe coupling, valve seal, or condensate line.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Licensed Plumber / Campus Mechanic',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'Subfloor Moisture Assessment',
          description: 'Use a pinless moisture meter to check if moisture seeped beneath linoleum/tiles to prevent long-term adhesive delamination.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Facility Maintenance Specialist',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-4`,
          title: 'Permanent Seal & IoT Moisture Sensor Installation',
          description: 'Replace worn pipe fittings or seal collar, and mount a battery-powered LoRaWAN moisture puck with automated alert threshold.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Operations & Maintenance Supervisor',
          isCompleted: false
        }
      ];
      break;

    case 'safety':
    case 'structural':
      patternName = 'Slip/Trip Hazard & Floor Integrity Control';
      suggestedRationale = 
        'Floor surface hazards recurring in corridor intersections indicate either recurring fluid deposition, uneven transitions, or worn non-slip coating.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Zone Cordon & Warning Cones',
          description: 'Establish clear pedestrian detour and post bilingual cautionary signage.',
          phase: 'immediate_safety',
          recommendedRole: 'Campus Safety Monitor',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Cross-Disciplinary Root-Cause Trace',
          description: 'Check adjacent laboratory sinks, water fountains, and HVAC ceiling diffusers for sporadic overflow or condensation dripping.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Facility Inspector & Lab Manager',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'High-Traction Grip Treatment Application',
          description: 'Apply abrasive anti-slip floor treatment or install heavy-duty walk-off drainage matting.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Custodial Engineering Team',
          isCompleted: false
        }
      ];
      break;

    case 'electrical':
      patternName = 'Electrical Circuit & Fixture Stabilizer';
      suggestedRationale = 
        'Intermittent flickering, tripping breakers, or sparking indicate overloaded sub-panels or deteriorating insulation requiring immediate isolation.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Circuit Isolation & Lockout/Tagout',
          description: 'Inspect subpanel, tag the circuit breaker if arcing or burning odor is present, and block student access.',
          phase: 'immediate_safety',
          recommendedRole: 'Campus Electrician',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Thermal Camera Load Audit',
          description: 'Scan the breaker panel and junction boxes with a FLIR thermal camera to detect hot spots and loose wire terminations.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Senior Electrical Engineer',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'Load Balancing & Surge Protection Upgrade',
          description: 'Rebalance circuit phases and install transient voltage surge suppressor on the distribution board.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Facility Electrical Supervisor',
          isCompleted: false
        }
      ];
      break;

    case 'hvac':
      patternName = 'Climate & Airflow Remediation';
      suggestedRationale = 
        'Air handling complaints often correlate with clogged MERV filters, seized dampers, or condensate pan overflow.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Thermostat & Damper Airflow Check',
          description: 'Read local airflow velocity and thermostat sensor calibration using an anemometer.',
          phase: 'immediate_safety',
          recommendedRole: 'HVAC Technician',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Condensate Drain Line Flush',
          description: 'Inspect rooftop unit / air handler drip pan; flush drain line with pressurized nitrogen to clear algae blockages.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Mechanical Services Team',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'Seasonal Filter Cycle Schedule Adjustment',
          description: 'Shorten filter replacement cycle from 90 days to 45 days during pollen/peak heat seasons.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Campus Sustainability & Maintenance',
          isCompleted: false
        }
      ];
      break;

    case 'access':
      patternName = 'Building Perimeter & Door Latch Integrity';
      suggestedRationale = 
        'Failed door latches or reader faults compromise building security and emergency egress compliance.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Egress Latch & Closer Manual Check',
          description: 'Verify door closes completely without sticking and emergency panic bar releases smoothly.',
          phase: 'immediate_safety',
          recommendedRole: 'Campus Security & Access Control',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Electric Strike & Controller Diagnostics',
          description: 'Test power supply voltage to electric strike and check card reader log for timeout errors.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Access Hardware Technician',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'Heavy-Duty Commercial Closer Replacement',
          description: 'Replace standard hydraulic closer with weather-sealed ADA compliant unit.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Locksmith & Physical Security Specialist',
          isCompleted: false
        }
      ];
      break;

    default:
      patternName = 'General Facility Recurrence Prevention';
      suggestedRationale = 'Standard observational check and maintenance protocol.';
      actions = [
        {
          id: `act-${obs.id}-1`,
          title: 'Initial On-Site Assessment',
          description: 'Inspect reported area within 4 business hours and log photographic evidence.',
          phase: 'immediate_safety',
          recommendedRole: 'Zone Maintenance Lead',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-2`,
          title: 'Preventive Root Cause Verification',
          description: 'Cross-reference facility maintenance logs from previous 6 months for similar occurrences.',
          phase: 'root_cause_diagnosis',
          recommendedRole: 'Operations Analyst',
          isCompleted: false
        },
        {
          id: `act-${obs.id}-3`,
          title: 'Permanent Corrective Action',
          description: 'Complete repair and update scheduled campus inspection routine.',
          phase: 'recurrence_prevention',
          recommendedRole: 'Facility Maintenance Supervisor',
          isCompleted: false
        }
      ];
      break;
  }

  return {
    id: `pb-${obs.id}`,
    observationId: obs.id,
    category,
    patternName,
    suggestedRationale,
    disclaimer: 'AI-Suggested Playbook — Requires Human Review. Action items are generated based on observed symptom patterns and campus safety standards. Maintenance personnel must verify site conditions before execution.',
    actions
  };
}
