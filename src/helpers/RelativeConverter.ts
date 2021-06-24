export class RelativeConverter {
  convert(input: number[]): number[] {
    const copy: number[] = input.slice(0);

    let previousValue = copy.shift();

    return copy.map(function (value) {
      let result;

      if (previousValue != null && value != null) {
        result = value - previousValue;
      } else {
        result = 0;
      }

      previousValue = value;

      return result;
    });
  }
}
