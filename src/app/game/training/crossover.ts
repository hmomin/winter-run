import Individual from "./Individual";
import gamma from "./gamma";

// perform simulated binary crossover on two parent individuals to yield two
// child chromosomes
export default function simulatedBinaryCrossover(
    parent1: Individual,
    parent2: Individual,
    eta: number
) {
    const firstSize = parent1.chromosome.length;
    const gammaArray = new Array(firstSize);
    const chromosome1 = new Array(firstSize);
    const chromosome2 = new Array(firstSize);
    for (let i = 0; i < firstSize; i++) {
        const secondSize = parent1.chromosome[i].length;
        gammaArray[i] = new Array(secondSize).fill(0);
        chromosome1[i] = new Array(secondSize).fill(0);
        chromosome2[i] = new Array(secondSize).fill(0);
        for (let j = 0; j < secondSize; j++) {
            const g = gamma(Math.random(), eta);
            gammaArray[i][j] = g;
            chromosome1[i][j] =
                0.5 *
                ((1 + g) * parent1.chromosome[i][j] +
                    (1 - g) * parent2.chromosome[i][j]);
            chromosome2[i][j] =
                0.5 *
                ((1 - g) * parent1.chromosome[i][j] +
                    (1 + g) * parent2.chromosome[i][j]);
        }
    }
    return [chromosome1, chromosome2];
}
