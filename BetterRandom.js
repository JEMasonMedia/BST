function randomNumberInRange(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export default function BetterRandom(min, max, depth = 1000) {
  let accumulator = []

  for (let i = 0; i < depth; i++) {
    accumulator.push(randomNumberInRange(min, max))
  }

  return accumulator[randomNumberInRange(0, accumulator.length)]
}
