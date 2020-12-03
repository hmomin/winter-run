export default function gamma(r: number, eta: number): number {
    return r <= 0.5
        ? (2 * r) ** (1 / (eta + 1))
        : (1 / (2 * (1 - r))) ** (1 / (eta + 1));
}
