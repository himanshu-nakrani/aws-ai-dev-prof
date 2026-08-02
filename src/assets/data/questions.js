/* ==========================================================================
   questions.js — question bank root.

   IMPORTANT, AND NOT BOILERPLATE:
   Every question in this bank is ORIGINAL. Nothing here is recalled,
   scraped, leaked or reproduced from a real AWS exam. The questions are
   written against the published AIP-C01 exam guide — its five domains, their
   task statements and their weightings — in the same scenario-driven style
   the professional-tier exams use.

   Using so-called "braindumps" of real exam items breaks the AWS
   Certification Agreement. AWS does detect it, and the penalty is
   revocation of every certification you hold plus a ban. It is also
   ineffective: item pools rotate, and memorising 60 recalled stems teaches
   you none of the reasoning the scenarios actually test.

   Schema:
     id   unique string, "<domain>-<n>"
     d    'd0'..'d5'  (d0 = foundations, not an exam domain)
     hard optional bool — included in the "hardest 25" drill
     q    stem (HTML allowed)
     o    array of option strings (HTML allowed)
     a    array of correct option indexes (length > 1 => multi-select)
     e    headline explanation
     oe   optional per-option explanations, same length as o
     ref  optional pointer back into the guide
   ========================================================================== */

window.AIP_QUESTIONS = [];

window.AIP_ADDQ = function (arr) {
  Array.prototype.push.apply(window.AIP_QUESTIONS, arr);
};
