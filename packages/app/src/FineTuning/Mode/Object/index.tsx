import { FineTuning } from "~/FineTuning";

import { Prompt } from "./Prompt";

export type Object = "Object";

export function Object() {
  return (
    <FineTuning.Mode
      mode="Object"
      description="Create imagery based on an object, for example a car, furniture, architecture, or spaceship"
      duration={Object.duration()}
      background="#386D8C"
    />
  );
}

export declare namespace Object {
  export { Prompt };
}

export namespace Object {
  Object.Prompt = Prompt;

  export const duration = (): FineTuning.Mode.Duration => ({
    minMilliseconds: 1000 * 60 * 5,
    maxMilliseconds: 1000 * 60 * 10,
  });
}
