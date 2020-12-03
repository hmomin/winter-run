import Individual from "./Individual";

export function randomGaussianMutation(
    individual: Individual,
    probabilityOfMutation: number,
    mu: Array<number> = [0],
    sigma: Array<number> = [1]
): void {
    for (let i = 0; i < individual.chromosome.length; i++) {
        for (let j = 0; j < individual.chromosome[i].length; j++) {
            if (Math.random() < probabilityOfMutation) {
                // mutate the chromosome
                const muVal = mu.length === 1 ? mu[0] : mu[i];
                const sigmaVal = sigma.length === 1 ? sigma[0] : sigma[i];
                individual.chromosome[i][j] += randn(muVal, sigmaVal);
            }
        }
    }
}

// mapping uniform random distribution to uniform normal distribution using
// Box-Muller transform
function randn(mu: number = 0, sigma: number = 1) {
    // find a number on N(0, 1)
    const num =
        Math.sqrt(-2.0 * Math.log(Math.random())) *
        Math.cos(2.0 * Math.PI * Math.random());
    // transform it to N(mu, sigma)
    return mu + num * Math.sqrt(sigma);
}
