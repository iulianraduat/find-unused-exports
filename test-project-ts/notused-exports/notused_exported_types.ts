type A_NotUsed = {
  //
};

interface B_NotUsed {
  //
}

function C_NotUsed() {
  //
}

export { type A_NotUsed, type B_NotUsed, type C_NotUsed };

type X_NotUsed = {
  //
};

interface Y_NotUsed {
  //
}

function Z_NotUsed() {
  //
}

export type { X_NotUsed, Y_NotUsed as S_NotUsed, Z_NotUsed as T_NotUsed };
