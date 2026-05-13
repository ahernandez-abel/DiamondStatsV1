export const calculateAVG = (hits, atBats) => {
  if (!atBats || atBats === 0) {
    return 0;
  }

  return Number((hits / atBats).toFixed(3));
};

export const calculateOBP = (
  hits,
  walks,
  hbp,
  atBats,
  sacFly
) => {

  const total =
    atBats + walks + hbp + sacFly;

  if (!total || total === 0) {
    return 0;
  }

  return Number(
    (
      (hits + walks + hbp) / total
    ).toFixed(3)
  );
};

export const calculateSLG = (
  singles,
  doubles,
  triples,
  hr,
  atBats
) => {

  if (!atBats || atBats === 0) {
    return 0;
  }

  const totalBases =
    singles +
    (doubles * 2) +
    (triples * 3) +
    (hr * 4);

  return Number(
    (totalBases / atBats).toFixed(3)
  );
};

export const calculateOPS = (
  obp,
  slg
) => {

  return Number(
    (obp + slg).toFixed(3)
  );
};

export const calculateERA = (
  earnedRuns,
  innings
) => {

  if (!innings || innings === 0) {
    return 0;
  }

  return Number(
    ((earnedRuns * 7) / innings).toFixed(2)
  );
};

export const calculateWHIP = (
  walks,
  hits,
  innings
) => {

  if (!innings || innings === 0) {
    return 0;
  }

  return Number(
    ((walks + hits) / innings).toFixed(2)
  );
};