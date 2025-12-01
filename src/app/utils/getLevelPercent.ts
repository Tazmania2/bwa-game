import { getFixedDecimalNumber } from './fixedDecimalValue';

export const getLevelPercent = (
  currentLevelPoints = 0,
  nextLevelPoints = 0
) => {
  const pointsPerLevel = 250;

  if (currentLevelPoints < pointsPerLevel)
    return getFixedDecimalNumber(
      (currentLevelPoints / nextLevelPoints) * 100,
      1
    );

  const levelCount = Math.floor(currentLevelPoints / pointsPerLevel);

  const initialCurrentPointsFormat =
    currentLevelPoints - pointsPerLevel * levelCount;
  const initialNextPointsFormat = nextLevelPoints - pointsPerLevel * levelCount;

  return getFixedDecimalNumber(
    (initialCurrentPointsFormat / initialNextPointsFormat) * 100,
    1
  );
};
