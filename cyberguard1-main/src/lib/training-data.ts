export interface Scenario {
  id: string;
  type: 'email' | 'password' | 'social' | 'url' | 'malware';
  title: string;
  description: string;
  points: number;
  sender?: string;
  subject?: string;
  body?: string;
  redFlags?: string[];
  question?: string;
  options?: string[];
  correctAnswer?: number;
}

export const scenarios: Scenario[] = [
  {
    id: "phishing-1", type: "email", title: "Phishing Simulation 1", description: "Identify if this email is a phishing attempt.", points: 50,
    sender: "IT-Support <it-support@company-secure-login.com>", subject: "URGENT: Password Expiry in 24 Hours",
    body: "Dear User, our system detected that your password will expire in 24 hours. To prevent losing access to your account, please click the link below to reset your password immediately. http://company-secure-login.com/reset",
    redFlags: ["Sender domain is fake.", "Creates a false sense of urgency.", "The link does not match the official company URL."]
  },
  {
    id: "url-1", type: "url", title: "Suspicious URL Detection", description: "Identify if this URL is safe or malicious.", points: 30,
    question: "You receive a link: www.paypa1-secure-login.com. What is this?",
    options: ["Safe PayPal login page", "Malicious typosquatting domain", "A government website", "An internal company link"], correctAnswer: 1
  },
  {
    id: "password-1", type: "password", title: "Password Security 1", description: "Choose the strongest password.", points: 40,
    question: "Which of the following passwords is the most secure?",
    options: ["Summer2024", "P@ssw0rd!", "Correct-Horse-Battery-Staple-9", "John12345"], correctAnswer: 2
  },
  {
    id: "malware-1", type: "malware", title: "Malware Awareness", description: "Spot the signs of a ransomware attack.", points: 50,
    question: "You open an email attachment named 'Invoice.exe'. Suddenly, your screen goes black and a message demands Bitcoin to unlock your files. What happened?",
    options: ["Your antivirus is updating", "You are a victim of a ransomware attack", "Your computer is out of battery", "Windows is installing updates"], correctAnswer: 1
  },
  {
    id: "social-1", type: "social", title: "Social Engineering 1", description: "Identify the social engineering tactic.", points: 40,
    question: "You get a call from someone claiming to be from Microsoft, saying your PC has a virus. What is the red flag?",
    options: ["Microsoft calls you proactively for viruses.", "The caller asks for your credit card to 'fix' it.", "The caller knows your first name.", "Both A and B are massive red flags."], correctAnswer: 3
  }
];

export const badges = [
  { id: "first_steps", name: "First Steps", icon: "fa-shoe-prints", requirement: "Complete 1 module" },
  { id: "defender", name: "Defender", icon: "fa-shield-halved", requirement: "Reach Level 2" },
  { id: "secure", name: "Secure", icon: "fa-lock", requirement: "Complete Password Training" }
];

// Gamification Level Mapping
export const getLevelName = (level: number) => {
  if (level <= 1) return "Cyber Beginner";
  if (level === 2) return "Cyber Aware";
  if (level === 3) return "Security Defender";
  if (level === 4) return "Cyber Guardian";
  return "Cyber Expert";
};