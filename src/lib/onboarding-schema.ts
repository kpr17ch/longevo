export type GoalOption =
  | "more-energy"
  | "longevity"
  | "better-sleep"
  | "less-stress"
  | "weight-metabolic";

export type AgeRange = "18-25" | "26-35" | "36-45" | "46-55" | "56-65" | "65+";

export type Sex = "male" | "female" | "other" | "prefer-not-to-say";

export type MedicalCondition =
  | "diabetes"
  | "heart-disease"
  | "hypertension"
  | "none";

export type WorkActivityLevel = "sedentary" | "light" | "moderate" | "active";

export type SportType =
  | "running"
  | "cycling"
  | "swimming"
  | "strength-training"
  | "yoga"
  | "team-sports"
  | "walking"
  | "other"
  | "none";

export type TimeInvestment = "5" | "10" | "15" | "20+";

export interface OnboardingData {
  age: number | null;
  ageRange: AgeRange | null;
  sex: Sex | null;
  goals: GoalOption[];
  medicalConditions: MedicalCondition[];
  height: number | null;
  weight: number | null;
  sleepHours: number | null;
  sleepQuality: number | null;
  movementDays: number | null;
  energyLevel: number | null;
  workActivityLevel: WorkActivityLevel | null;
  workFromHome: number | null;
  labPdfFile: File | null;
  manualEntry: boolean;
  sportTypes: SportType[];
  sportFrequency: number | null;
  sportIntensity: number | null;
  stressLevel: number | null;
  timeInvestment: TimeInvestment | null;
  constraints: {
    noGym: boolean;
    noDietChange: boolean;
    noEarlyBedtime: boolean;
    noMeditation: boolean;
  };
  hba1c: number | null;
  ldl: number | null;
  hdl: number | null;
  triglycerides: number | null;
  crp: number | null;
  restingHeartRate: number | null;
}

export interface StepConfig {
  id: string;
  title: string;
  description: string;
  fields: string[];
}

export const ONBOARDING_STEPS: StepConfig[] = [
  {
    id: "age",
    title: "How old are you?",
    description: "",
    fields: ["age"],
  },
  {
    id: "sex",
    title: "What's your sex?",
    description: "This helps us personalize recommendations",
    fields: ["sex"],
  },
  {
    id: "height",
    title: "What's your height?",
    description: "",
    fields: ["height"],
  },
  {
    id: "weight",
    title: "What's your weight?",
    description: "",
    fields: ["weight"],
  },
  {
    id: "sleep-hours",
    title: "How many hours do you sleep?",
    description: "On average per night",
    fields: ["sleepHours"],
  },
  {
    id: "movement-days",
    title: "How many days do you move?",
    description: "At least 20-30 minutes per week",
    fields: ["movementDays"],
  },
  {
    id: "work-activity",
    title: "What's your work activity level?",
    description: "Tell us about your daily work",
    fields: ["workActivityLevel"],
  },
  {
    id: "lab-upload",
    title: "Upload your lab report",
    description: "Optional - helps us give better recommendations",
    fields: ["labPdfFile"],
  },
  {
    id: "stress",
    title: "How stressed do you feel?",
    description: "On a scale from 1 to 10",
    fields: ["stressLevel"],
  },
];

export const INITIAL_ONBOARDING_DATA: OnboardingData = {
  age: null,
  ageRange: null,
  sex: null,
  goals: [],
  medicalConditions: [],
  height: null,
  weight: null,
  sleepHours: null,
  sleepQuality: null,
  movementDays: null,
  energyLevel: null,
  workActivityLevel: null,
  workFromHome: null,
  labPdfFile: null,
  manualEntry: false,
  sportTypes: [],
  sportFrequency: null,
  sportIntensity: null,
  stressLevel: null,
  timeInvestment: null,
  constraints: {
    noGym: false,
    noDietChange: false,
    noEarlyBedtime: false,
    noMeditation: false,
  },
  hba1c: null,
  ldl: null,
  hdl: null,
  triglycerides: null,
  crp: null,
  restingHeartRate: null,
};

