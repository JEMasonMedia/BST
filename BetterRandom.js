function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function BetterRandom(min, max, depth = 1000) {
  let accumulator = []

  for (let i = 0; i < depth; i++) {
    accumulator.push(randomNumberInRange(min, max))
  }

  return accumulator[randomNumberInRange(0, accumulator.length - 1)]
}


/*
function cryptoRandomNumberInRange(min, max) {
  const range = max - min + 1;
  const randomBytes = new Uint32Array(1);
  crypto.getRandomValues(randomBytes);
  const randomNumber = randomBytes[0] / (0xFFFFFFFF + 1);
  return Math.floor(randomNumber * range) + min;
}

export default function BetterRandom(min, max, depth = 1000) {
  let accumulator = [];

  for (let i = 0; i < depth; i++) {
    accumulator.push(cryptoRandomNumberInRange(min, max));
  }

  const randomIndex = cryptoRandomNumberInRange(0, accumulator.length - 1);
  return accumulator[randomIndex];
}
*/
