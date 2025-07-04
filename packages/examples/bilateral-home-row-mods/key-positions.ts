// Glove80 key positions

export const leftFingerPositions = [
  0, 1, 2, 3, 4,           // Row 0
  5, 6, 7, 8, 9, 10,       // Row 1
  11, 12, 13, 14, 15, 16,  // Row 2
  17, 18, 19, 20, 21, 22,  // Row 3 (home row)
  23, 24, 25, 26, 27, 28,  // Row 4
  29, 30, 31, 32, 33       // Row 5
];

export const rightFingerPositions = [
  40, 41, 42, 43, 44,      // Row 0
  45, 46, 47, 48, 49, 50,  // Row 1
  51, 52, 53, 54, 55, 56,  // Row 2
  57, 58, 59, 60, 61, 62,  // Row 3 (home row)
  63, 64, 65, 66, 67, 68,  // Row 4
  69, 70, 71, 72, 73       // Row 5
];

export const leftThumbPositions = [
  34, 35, 36,  // Upper thumb
  37, 38, 39   // Lower thumb
];

export const rightThumbPositions = [
  74, 75, 76,  // Upper thumb
  77, 78, 79   // Lower thumb
];

export const notRightFingerPositions = [...leftFingerPositions, ...leftThumbPositions, ...rightThumbPositions];
export const notLeftFingerPositions = [...rightFingerPositions, ...leftThumbPositions, ...rightThumbPositions];

export const allRightHandPositions = [...rightFingerPositions, ...rightThumbPositions];

export const allLeftHandPositions = [...leftFingerPositions, ...leftThumbPositions];

export const comboSupportPositions = [9, 21, 33, 45, 63, 79, 52, 53, 54, 70, 71, 69];
