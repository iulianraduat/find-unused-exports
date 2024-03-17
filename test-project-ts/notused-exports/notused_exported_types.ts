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

export type {
  X_NotUsed as A_NotUsed2,
  Y_NotUsed as B_NotUsed2,
  Z_NotUsed as C_NotUsed2,
};
