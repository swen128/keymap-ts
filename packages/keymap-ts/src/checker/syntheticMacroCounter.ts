const counter = {value: 0};

export const syntheticMacroCounter = {
  next: (): number => {
    return counter.value++;
  },

  reset: (): void => {
    counter.value = 0;
  },
};
