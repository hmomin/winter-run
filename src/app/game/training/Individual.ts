// individual holds a chromosome, which is just the entire set of weights associated
// with its corresponding neural network
export default class Individual {
    fitness: number;
    chromosome: Array<Array<number>>;
    weights: Array<number>;

    constructor(
        chromosome: Array<Array<number>> = null,
        fitness: number = null
    ) {
        if (chromosome !== null && fitness !== null) {
            this.chromosome = chromosome;
            this.fitness = fitness;
            this.decodeChromosome();
        } else {
            // is there some way to get randomized weights from the neural
            // network if necessary?
            this.fitness = -Infinity;
            this.encodeChromosome();
        }
    }

    encodeChromosome() {
        this.chromosome = [this.weights];
    }

    decodeChromosome() {
        this.weights = this.chromosome[0];
    }

    getChromosome() {
        return this.chromosome;
    }

    getFitness() {
        return this.fitness;
    }
}
