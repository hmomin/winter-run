import Individual from "./Individual";

export default class Population {
    individuals: Array<Individual>;

    constructor(individuals: Array<Individual>) {
        this.individuals = individuals;
    }

    getAverageFitness(): number {
        let count = 0;
        let sum = 0;
        for (const ind of this.individuals) {
            sum += ind.fitness;
            count += 1;
        }
        return sum / count;
    }
}
