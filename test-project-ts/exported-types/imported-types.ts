import { A_Used, B_Used, C_Used } from "./used_exported_types";

const props: A_Used = {
  props: {},
};

const intf: B_Used = {
  txt: "used",
};

const fn: typeof C_Used = () => {
  return true;
};
fn();
