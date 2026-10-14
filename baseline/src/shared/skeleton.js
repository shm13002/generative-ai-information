// Picks an instant skeleton from the utterance before data arrives. Original rule set (first match wins).
export const RULES = [
  ['todo', /\b(needs? me|waiting on|to-?do|inbox|follow.?up|owe)\b/i],
  ['email', /\b(draft|write|reply|email|message|send)\b/i],
  ['person', /\b(who is|who's|whos|tell me about)\b/i],
  ['number', /\b(how (much|many)|mrr|arr|revenue|churn|growth|conversion|total)\b/i],
  ['list', /\b(list|which|overdue|invoices|deals|tickets|issues|compare)\b/i],
  ['agenda', /\b(today|my day|schedule|calendar|agenda|meeting|week|tomorrow|book|move|(mon|tues|wednes|thurs|fri)day)\b/i],
  ['brief', /\b(prep|brief|summari[sz]e|catch me up)\b/i],
];
export function guessSkeleton(utterance = '') { for (const [k, re] of RULES) if (re.test(utterance)) return k; return 'answer'; }
