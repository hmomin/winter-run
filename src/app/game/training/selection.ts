import Population from "./Population";

export function elitismSelection(
    population: Population,
    numIndividuals: number
) {
    const sortedIndividuals = population.individuals.sort((a, b) => {
        return b.fitness > a.fitness ? 1 : b.fitness < a.fitness ? -1 : 0;
    });
    return sortedIndividuals.slice(0, numIndividuals);
}

export function rouletteWheelSelection(
    population: Population,
    numIndividuals: number
) {
    const selection = [];
    let sum = 0;
    for (const ind of population.individuals) {
        sum += ind.fitness;
    }
    for (let i = 0; i < numIndividuals; i++) {
        const pick = Math.random() * sum;
        let current = 0;
        for (const ind of population.individuals) {
            current += ind.fitness;
            if (current > pick) {
                selection.push(ind);
                break;
            }
        }
    }
    return selection;
}
