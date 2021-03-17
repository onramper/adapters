export default function (v: number, n: number) {
    return Math.ceil(v * Math.pow(10, n)) / Math.pow(10, n);
}